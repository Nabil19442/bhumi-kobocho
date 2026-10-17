import re
from typing import Dict, Any, List, Optional, Tuple
try:
    from .names import evaluate_name_status, is_bangla_text, normalize_name
except ImportError:
    from backend.app.names import evaluate_name_status, is_bangla_text, normalize_name

ALLOWED_STATUSES = {"Matched", "Mismatch", "Needs review", "Not checked"}

BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯"
WESTERN_DIGITS = "0123456789"
BN_TO_EN_DIGIT_MAP = str.maketrans(BANGLA_DIGITS, WESTERN_DIGITS)

def normalize_digits(text: Optional[Any]) -> str:
    """Normalizes Bengali numerals to Western ASCII digits."""
    if text is None:
        return ""
    text_str = str(text).strip()
    return text_str.translate(BN_TO_EN_DIGIT_MAP)

def parse_decimal_value(val: Any) -> Optional[float]:
    """Parses a land area decimal number from string, float, or integer."""
    if val is None:
        return None
    s = str(val).strip()
    s = normalize_digits(s)
    match = re.search(r"[-+]?\d*\.?\d+", s)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None

def normalize_khatian_or_dag(val: Any) -> str:
    """Normalizes khatian or dag numbers, converting numerals and removing redundant spaces."""
    if val is None:
        return ""
    s = str(val).strip().lower()
    s = normalize_digits(s)
    s = re.sub(r"[\s\-_]+", "", s)
    return s

def parse_and_normalize_date(val: Any) -> Optional[Dict[str, Any]]:
    """
    Parses dates in various formats:
    - ISO: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    - Bangladesh / Commonwealth: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    - Bangla numerals: ১২/০৩/২০১৯, ২০১৯-০৩-১২
    - Bengali separators: hyphens, slashes, periods, spaces, en-dashes
    
    Returns structured dict with primary normalized date (YYYY-MM-DD),
    alternative interpretation (if ambiguous), and ambiguity flag.
    """
    if val is None:
        return None
    s = normalize_digits(str(val)).strip()
    if not s:
        return None

    # Normalize various date separators (slash, dash, period, en-dash, whitespace)
    cleaned = re.sub(r"[/\.\-–—\s]+", "/", s)

    # 1. ISO format: YYYY/MM/DD or YYYY-MM-DD
    iso_match = re.match(r"^(\d{4})/(\d{1,2})/(\d{1,2})$", cleaned)
    if iso_match:
        y, m, d = int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3))
        if 1 <= m <= 12 and 1 <= d <= 31:
            primary = f"{y:04d}-{m:02d}-{d:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y, "month": m, "day": d,
                "raw": s
            }

    # 2. Formats with Year at the end: P1 / P2 / YYYY
    dmy_match = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{2,4})$", cleaned)
    if dmy_match:
        p1, p2 = int(dmy_match.group(1)), int(dmy_match.group(2))
        y = int(dmy_match.group(3))
        if y < 100:
            y += 2000

        # Case A: p1 > 12 -> Unambiguously Day is p1, Month is p2 (e.g. 25/03/2019)
        if p1 > 12 and 1 <= p2 <= 12 and 1 <= p1 <= 31:
            primary = f"{y:04d}-{p2:02d}-{p1:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y, "month": p2, "day": p1,
                "raw": s
            }

        # Case B: p2 > 12 -> Unambiguously Day is p2, Month is p1 (e.g. 03/25/2019)
        if p2 > 12 and 1 <= p1 <= 12 and 1 <= p2 <= 31:
            primary = f"{y:04d}-{p1:02d}-{p2:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y, "month": p1, "day": p2,
                "raw": s
            }

        # Case C: p1 == p2 -> Day and Month are identical (e.g. 05/05/2019)
        if p1 == p2 and 1 <= p1 <= 12:
            primary = f"{y:04d}-{p1:02d}-{p1:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y, "month": p1, "day": p1,
                "raw": s
            }

        # Case D: Both p1 <= 12 and p2 <= 12 and p1 != p2 (e.g. 03/04/2019 or 12/03/2019)
        # In Bangladesh deed convention, standard order is DD/MM/YYYY.
        # However, if compared with a conflicting date, ambiguity between DD/MM and MM/DD must be flagged.
        if 1 <= p1 <= 12 and 1 <= p2 <= 12:
            primary_bd = f"{y:04d}-{p2:02d}-{p1:02d}"    # DD/MM/YYYY (Day=p1, Month=p2)
            alt_us = f"{y:04d}-{p1:02d}-{p2:02d}"        # MM/DD/YYYY (Month=p1, Day=p2)
            return {
                "primary": primary_bd,
                "alternative": alt_us,
                "is_ambiguous": True,
                "year": y, "month": p2, "day": p1,
                "raw": s
            }

    return None

def is_date_ambiguous(val: Any) -> bool:
    """Returns True if the date has an inherently ambiguous format between DD/MM/YYYY and MM/DD/YYYY."""
    parsed = parse_and_normalize_date(val)
    if not parsed:
        return False
    return parsed.get("is_ambiguous", False)

def evaluate_date_status(extracted_val: Any, reference_val: Any) -> Tuple[str, str, str]:
    """
    Evaluates date matching between extracted deed date and reference land record date.
    Returns (status, reason_code, notes).
    Status is strictly one of: 'Matched', 'Mismatch', 'Needs review', 'Not checked'.
    """
    if extracted_val is None or str(extracted_val).strip() == "":
        return ("Not checked", "DATE_NOT_EXTRACTED", "দলিল থেকে কোনো তারিখ পাওয়া যায়নি / Date not extracted from document.")

    if reference_val is None or str(reference_val).strip() == "":
        return ("Not checked", "REFERENCE_DATE_UNAVAILABLE", "পূর্ববর্তী সরকারি রেকর্ডে দলিলের তারিখ উল্লেখ নেই / Reference document date is unrecorded.")

    norm_ext_raw = normalize_digits(str(extracted_val)).strip()
    norm_ref_raw = normalize_digits(str(reference_val)).strip()

    # Exact string match (e.g. identical strings or normalized Bangla digits)
    if norm_ext_raw == norm_ref_raw and norm_ref_raw != "":
        return ("Matched", "DATE_EXACT_MATCH", "তারিখ হুবহু মিলেছে / Exact date match.")

    parsed_ext = parse_and_normalize_date(extracted_val)
    parsed_ref = parse_and_normalize_date(reference_val)

    if not parsed_ext or not parsed_ref:
        return ("Needs review", "DATE_PARSE_UNRECOGNIZED", "তারিখের বিন্যাস সরাসরি পড়া যায়নি; ম্যানুয়াল যাচাই প্রয়োজন / Date format unrecognized; manual review required.")

    ext_primary = parsed_ext["primary"]
    ref_primary = parsed_ref["primary"]
    ext_alt = parsed_ext["alternative"]
    ref_alt = parsed_ref["alternative"]

    # Match under project's documented convention (Bangladesh: DD/MM/YYYY or ISO YYYY-MM-DD)
    if ext_primary == ref_primary:
        return ("Matched", "DATE_CONVENTION_MATCH", "বাংলাদেশ দলিল মানদণ্ড (DD/MM/YYYY) অনুযায়ী তারিখ সামঞ্জস্যপূর্ণ / Equivalent dates matched under Bangladesh convention.")

    # Check for ambiguous date format (e.g. 03/04/2019 vs 2019-03-04 or 03/04/2019 vs 04/03/2019)
    # If the date matches under the alternative MM/DD/YYYY convention, do NOT declare Mismatch! Return Needs review.
    if parsed_ext["is_ambiguous"] or parsed_ref["is_ambiguous"]:
        if (ext_alt == ref_primary) or (ext_primary == ref_alt) or (ext_alt == ref_alt):
            return (
                "Needs review",
                "DATE_AMBIGUOUS_FORMAT",
                f"তারিখ বিন্যাস ({parsed_ext['raw']} বনাম {parsed_ref['raw']}) দ্ব্যর্থক (দিন/মাস বনাম মাস/দিন)। যাচাই প্রয়োজন / Date format is ambiguous between DD/MM/YYYY and MM/DD/YYYY; manual review required."
            )

    # Completely different dates
    return ("Mismatch", "DATE_MISMATCH", "দলিল ও সরকারি রেকর্ডের তারিখে অমিল রয়েছে / Date difference detected between extracted deed and reference record.")

def compare_records(
    extracted_data: Dict[str, Any],
    reference_data: Dict[str, Any],
    area_tolerance_decimal: float = 0.05
) -> Dict[str, Any]:
    """
    Compares extracted deed/land document fields against reference record.
    Returns per-field results and summary.
    Strictly outputs statuses: Matched | Mismatch | Needs review | Not checked.
    
    CRITICAL ACCURACY RULES:
    - If reference field is missing/empty, do NOT return Mismatch automatically -> use Not checked.
    - Dates are normalized for Bangla digits, equivalent separators, and DD/MM/YYYY conventions.
    - Ambiguous dates return Needs review instead of false mismatch.
    - Names support Bengali <-> English cross-script matching with dictionary evidence.
    - Mismatch indicates an observed variance, NOT a legal verdict or fraud determination.
    """
    results: List[Dict[str, Any]] = []

    # 1. Owner Name
    ext_name = extracted_data.get("owner_name") or extracted_data.get("owner_name_bn") or extracted_data.get("owner_name_en")
    ref_bn = reference_data.get("owner_name_bn")
    ref_en = reference_data.get("owner_name_en")
    ref_general = reference_data.get("owner_name")

    if not ext_name or str(ext_name).strip() == "":
        status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        reason = "OWNER_NAME_NOT_PROVIDED"
        sim = 0.0
        notes = "দলিল থেকে কোনো মালিকের নাম পাওয়া যায়নি / Owner name was not provided."
    elif not ref_bn and not ref_en and not ref_general:
        status = "Not checked"
        reason = "REFERENCE_NAME_UNAVAILABLE"
        sim = 0.0
        notes = "পূর্ববর্তী সরকারি রেকর্ডে মালিকের নাম উল্লেখ নেই / Reference owner name is unrecorded or unavailable."
    else:
        # Evaluate against available references
        eval_bn = evaluate_name_status(str(ext_name), str(ref_bn)) if ref_bn else None
        eval_en = evaluate_name_status(str(ext_name), str(ref_en)) if ref_en else None
        eval_gen = evaluate_name_status(str(ext_name), str(ref_general)) if (ref_general and not ref_bn and not ref_en) else None

        # Check same-script reference first if available
        ext_is_bn = is_bangla_text(str(ext_name))
        same_script_eval = eval_bn if ext_is_bn else eval_en

        if same_script_eval and same_script_eval[0] in ("Matched", "Needs review"):
            status, reason, sim = same_script_eval
            if status == "Matched":
                notes = "মালিকের নাম সরকারি রেকর্ডের সাথে সামঞ্জস্যপূর্ণ / Owner name matched reference record."
            else:
                notes = "বানান বা পদবির ভিন্নতা পরিলক্ষিত হয়েছে; সতর্ক পর্যালোচনার জন্য চিহ্নিত / Name spelling, honorific, or transliteration variant flagged for scrutiny."
        else:
            candidates = [e for e in (eval_bn, eval_en, eval_gen) if e is not None]
            matched_cand = next((c for c in candidates if c[0] == "Matched"), None)
            review_cand = next((c for c in candidates if c[0] == "Needs review"), None)

            if matched_cand:
                status, reason, sim = matched_cand
                notes = "মালিকের নাম সরকারি রেকর্ডের সাথে সামঞ্জস্যপূর্ণ / Owner name matched reference record."
            elif review_cand:
                status, reason, sim = review_cand
                notes = "বানান বা পদবির ভিন্নতা পরিলক্ষিত হয়েছে; সতর্ক পর্যালোচনার জন্য চিহ্নিত / Name spelling, honorific, or transliteration variant flagged for scrutiny."
            else:
                status, reason, sim = candidates[0]
                notes = "দলিল ও সরকারি রেকর্ডের মালিকের নামে অমিল পরিলক্ষিত হয়েছে / Name difference detected between deed and reference record."

    results.append({
        "field": "owner_name",
        "field_label_bn": "মালিকের নাম",
        "field_label_en": "Owner Name",
        "status": status,
        "extracted_value": ext_name,
        "reference_value": ref_bn or ref_en or ref_general,
        "reason_code": reason,
        "similarity_score": sim,
        "notes": notes
    })

    # 2. Khatian Number
    ext_khatian = extracted_data.get("khatian_no")
    ref_khatian = reference_data.get("khatian_no")

    if ext_khatian is None or str(ext_khatian).strip() == "":
        k_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        k_reason = "KHATIAN_NOT_FOUND"
        k_notes = "দলিল থেকে খতিয়ান নম্বর পাওয়া যায়নি / Khatian number was not extracted from deed."
    elif ref_khatian is None or str(ref_khatian).strip() == "":
        # Missing reference field must NOT return Mismatch!
        k_status = "Not checked"
        k_reason = "REFERENCE_KHATIAN_UNAVAILABLE"
        k_notes = "পূর্ববর্তী সরকারি রেকর্ডে খতিয়ান নম্বর উল্লেখ নেই / Reference Khatian number is unrecorded or unavailable."
    else:
        norm_ext_k = normalize_khatian_or_dag(ext_khatian)
        norm_ref_k = normalize_khatian_or_dag(ref_khatian)
        if norm_ext_k == norm_ref_k:
            k_status = "Matched"
            k_reason = "KHATIAN_EXACT_MATCH"
            k_notes = "খতিয়ান নম্বর মিলেছে / Khatian number matched."
        else:
            k_status = "Mismatch"
            k_reason = "KHATIAN_VALUE_MISMATCH"
            k_notes = "দলিল ও সরকারি রেকর্ডের খতিয়ান নম্বরে অমিল / Khatian number difference detected."

    results.append({
        "field": "khatian_no",
        "field_label_bn": "খতিয়ান নম্বর",
        "field_label_en": "Khatian No.",
        "status": k_status,
        "extracted_value": ext_khatian,
        "reference_value": ref_khatian,
        "reason_code": k_reason,
        "notes": k_notes
    })

    # 3. Dag Number
    ext_dag = extracted_data.get("dag_no")
    ref_dag = reference_data.get("dag_no")

    if ext_dag is None or str(ext_dag).strip() == "":
        d_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        d_reason = "DAG_NOT_FOUND"
        d_notes = "দলিল থেকে দাগ নম্বর পাওয়া যায়নি / Dag number was not extracted from deed."
    elif ref_dag is None or str(ref_dag).strip() == "":
        # Missing reference field must NOT return Mismatch!
        d_status = "Not checked"
        d_reason = "REFERENCE_DAG_UNAVAILABLE"
        d_notes = "পূর্ববর্তী সরকারি রেকর্ডে দাগ নম্বর উল্লেখ নেই / Reference Dag number is unrecorded or unavailable."
    else:
        norm_ext_d = normalize_khatian_or_dag(ext_dag)
        norm_ref_d = normalize_khatian_or_dag(ref_dag)
        if norm_ext_d == norm_ref_d:
            d_status = "Matched"
            d_reason = "DAG_EXACT_MATCH"
            d_notes = "দাগ নম্বর মিলেছে / Dag number matched."
        else:
            d_status = "Mismatch"
            d_reason = "DAG_VALUE_MISMATCH"
            d_notes = "দলিল ও সরকারি রেকর্ডের দাগ নম্বরে অমিল / Dag number difference detected."

    results.append({
        "field": "dag_no",
        "field_label_bn": "দাগ নম্বর",
        "field_label_en": "Dag No.",
        "status": d_status,
        "extracted_value": ext_dag,
        "reference_value": ref_dag,
        "reason_code": d_reason,
        "notes": d_notes
    })

    # 4. Land Area (Decimal)
    ext_area_raw = extracted_data.get("area_decimal")
    ref_area_raw = reference_data.get("area_decimal")

    ext_area = parse_decimal_value(ext_area_raw)
    ref_area = parse_decimal_value(ref_area_raw)

    if ext_area is None:
        a_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        a_reason = "AREA_NOT_PARSED"
        a_notes = "দলিল থেকে জমির পরিমাণ পড়া যায়নি / Land area not parsed from document."
    elif ref_area is None:
        # Missing reference field must NOT return Mismatch!
        a_status = "Not checked"
        a_reason = "REFERENCE_AREA_UNAVAILABLE"
        a_notes = "পূর্ববর্তী সরকারি রেকর্ডে জমির পরিমাণ উল্লেখ নেই / Reference land area is unrecorded or unavailable."
    else:
        diff = abs(ext_area - ref_area)
        if diff <= area_tolerance_decimal:
            a_status = "Matched"
            a_reason = "AREA_MATCH_WITHIN_TOLERANCE"
            a_notes = f"জমির পরিমাণ গ্রহণযোগ্য সীমার মধ্যে মিলেছে (পার্থক্য: {diff:.3f} শতক) / Area matches within tolerance."
        else:
            a_status = "Mismatch"
            a_reason = f"AREA_DIFFERENCE_{diff:.2f}_DECIMAL"
            a_notes = f"জমির পরিমাণে {diff:.2f} শতক পার্থক্য পরিলক্ষিত হয়েছে / Area difference of {diff:.2f} decimals detected."

    results.append({
        "field": "area_decimal",
        "field_label_bn": "জমির পরিমাণ (শতাংশ)",
        "field_label_en": "Land Area (Decimal)",
        "status": a_status,
        "extracted_value": ext_area_raw,
        "reference_value": ref_area_raw,
        "difference": round(abs(ext_area - ref_area), 3) if (ext_area is not None and ref_area is not None) else None,
        "tolerance": area_tolerance_decimal,
        "reason_code": a_reason,
        "notes": a_notes
    })

    # 5. Document Date (Enhanced Normalization & Ambiguity Review)
    ext_date = extracted_data.get("document_date")
    ref_date = reference_data.get("document_date")

    dt_status, dt_reason, dt_notes = evaluate_date_status(ext_date, ref_date)

    results.append({
        "field": "document_date",
        "field_label_bn": "দলিল/রেকর্ড তারিখ",
        "field_label_en": "Document Date",
        "status": dt_status,
        "extracted_value": ext_date,
        "reference_value": ref_date,
        "reason_code": dt_reason,
        "notes": dt_notes
    })

    # Summary counts
    status_counts = {"Matched": 0, "Mismatch": 0, "Needs review": 0, "Not checked": 0}
    for item in results:
        status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1

    # Calculation of demo record-consistency indicator (explicitly transparent)
    total_evaluable = len(results)
    matched_count = status_counts["Matched"]
    review_count = status_counts["Needs review"]
    consistency_pct = round(((matched_count * 1.0 + review_count * 0.5) / total_evaluable) * 100, 1)

    return {
        "disclaimer": "DEMO DATA — not a legal verdict. Mismatch indicates an observed data variance, not proof of fraud or invalidity.",
        "results": results,
        "status_counts": status_counts,
        "record_consistency_indicator": {
            "label": "Demo Record-Consistency Indicator",
            "label_bn": "ডেমো রেকর্ড-সামঞ্জস্য সূচক",
            "percentage": consistency_pct,
            "formula": "(Matched * 1.0 + Needs_review * 0.5) / Total_Fields * 100",
            "caution": "This is a statistical consistency flag for demo records, NOT a trust score or proof of legal ownership."
        },
        "not_checked_items": [
            "Court injunctions or pending litigations (আদালতের নিষেধাজ্ঞা বা মামলা)",
            "Vested / Enemy / Abandoned property status (অর্পিত বা পরিত্যক্ত সম্পত্তি তালিকা)",
            "Live mortgage or bank lien encumbrances (ব্যাংক দায় বা বন্ধক)",
            "Physical boundary ground survey (সরেজমিন সীমানা জরিপ)"
        ],
        "next_official_steps": [
            "Verify official RS/BS Porcha at the Upazila Land Office (AC Land)",
            "Obtain fresh Non-Encumbrance Certificate (NEC) from Sub-Registry",
            "Cross-verify Mouza map sheet with physical ground coordinates"
        ]
    }
