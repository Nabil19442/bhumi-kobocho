import re
from typing import Dict, Any, List, Optional
from backend.app.names import evaluate_name_status

ALLOWED_STATUSES = {"Matched", "Mismatch", "Needs review", "Not checked"}

BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯"
WESTERN_DIGITS = "0123456789"
BN_TO_EN_DIGIT_MAP = str.maketrans(BANGLA_DIGITS, WESTERN_DIGITS)

def normalize_digits(text: Optional[str]) -> str:
    if text is None:
        return ""
    text_str = str(text).strip()
    return text_str.translate(BN_TO_EN_DIGIT_MAP)

def parse_decimal_value(val: Any) -> Optional[float]:
    if val is None:
        return None
    s = str(val).strip()
    s = normalize_digits(s)
    # Extract any float pattern like 15.5 or 15
    match = re.search(r"[-+]?\d*\.?\d+", s)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None

def normalize_khatian_or_dag(val: Any) -> str:
    if val is None:
        return ""
    s = str(val).strip().lower()
    s = normalize_digits(s)
    # Remove redundant slashes / whitespace
    s = re.sub(r"[\s\-_]+", "", s)
    return s

def compare_records(
    extracted_data: Dict[str, Any],
    reference_data: Dict[str, Any],
    area_tolerance_decimal: float = 0.05
) -> Dict[str, Any]:
    """
    Compares extracted deed/land document fields against reference record.
    Returns per-field results and summary.
    Strictly outputs statuses: Matched | Mismatch | Needs review | Not checked.
    """
    results: List[Dict[str, Any]] = []

    # 1. Owner Name
    ext_name = extracted_data.get("owner_name") or extracted_data.get("owner_name_bn") or extracted_data.get("owner_name_en")
    ref_name = reference_data.get("owner_name_bn") or reference_data.get("owner_name_en") or reference_data.get("owner_name")
    
    # Also check if user supplied english vs bangla specifically
    ref_en = reference_data.get("owner_name_en")
    ref_bn = reference_data.get("owner_name_bn")

    if not ext_name:
        status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        reason = "OWNER_NAME_NOT_PROVIDED"
        sim = 0.0
    else:
        # Evaluate against both and pick the closest
        eval_bn = evaluate_name_status(str(ext_name), str(ref_bn)) if ref_bn else ("Not checked", "NO_REF", 0.0)
        eval_en = evaluate_name_status(str(ext_name), str(ref_en)) if ref_en else ("Not checked", "NO_REF", 0.0)

        # Priority: Matched > Needs review > Mismatch
        if eval_bn[0] == "Matched" or eval_en[0] == "Matched":
            status, reason, sim = "Matched", "NAME_EXACT_MATCH", 1.0
        elif eval_bn[0] == "Needs review":
            status, reason, sim = eval_bn
        elif eval_en[0] == "Needs review":
            status, reason, sim = eval_en
        elif eval_bn[0] == "Mismatch" and (not ref_en or eval_en[0] == "Mismatch"):
            status, reason, sim = eval_bn
        else:
            status, reason, sim = eval_bn if ref_bn else eval_en

    results.append({
        "field": "owner_name",
        "field_label_bn": "মালিকের নাম",
        "field_label_en": "Owner Name",
        "status": status,
        "extracted_value": ext_name,
        "reference_value": ref_bn or ref_en,
        "reason_code": reason,
        "similarity_score": sim,
        "notes": "Spelling variations are flagged as 'Needs review' for safe citizen scrutiny."
    })

    # 2. Khatian Number
    ext_khatian = extracted_data.get("khatian_no")
    ref_khatian = reference_data.get("khatian_no")

    if ext_khatian is None or str(ext_khatian).strip() == "":
        k_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        k_reason = "KHATIAN_NOT_FOUND"
    else:
        norm_ext_k = normalize_khatian_or_dag(ext_khatian)
        norm_ref_k = normalize_khatian_or_dag(ref_khatian)
        if norm_ext_k == norm_ref_k:
            k_status = "Matched"
            k_reason = "KHATIAN_EXACT_MATCH"
        else:
            k_status = "Mismatch"
            k_reason = "KHATIAN_VALUE_MISMATCH"

    results.append({
        "field": "khatian_no",
        "field_label_bn": "খতিয়ান নম্বর",
        "field_label_en": "Khatian No.",
        "status": k_status,
        "extracted_value": ext_khatian,
        "reference_value": ref_khatian,
        "reason_code": k_reason
    })

    # 3. Dag Number
    ext_dag = extracted_data.get("dag_no")
    ref_dag = reference_data.get("dag_no")

    if ext_dag is None or str(ext_dag).strip() == "":
        d_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        d_reason = "DAG_NOT_FOUND"
    else:
        norm_ext_d = normalize_khatian_or_dag(ext_dag)
        norm_ref_d = normalize_khatian_or_dag(ref_dag)
        if norm_ext_d == norm_ref_d:
            d_status = "Matched"
            d_reason = "DAG_EXACT_MATCH"
        else:
            d_status = "Mismatch"
            d_reason = "DAG_VALUE_MISMATCH"

    results.append({
        "field": "dag_no",
        "field_label_bn": "দাগ নম্বর",
        "field_label_en": "Dag No.",
        "status": d_status,
        "extracted_value": ext_dag,
        "reference_value": ref_dag,
        "reason_code": d_reason
    })

    # 4. Land Area (Decimal)
    ext_area_raw = extracted_data.get("area_decimal")
    ref_area_raw = reference_data.get("area_decimal")

    ext_area = parse_decimal_value(ext_area_raw)
    ref_area = parse_decimal_value(ref_area_raw)

    if ext_area is None:
        a_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        a_reason = "AREA_NOT_PARSED"
    elif ref_area is None:
        a_status = "Not checked"
        a_reason = "REFERENCE_AREA_MISSING"
    else:
        diff = abs(ext_area - ref_area)
        if diff <= area_tolerance_decimal:
            a_status = "Matched"
            a_reason = "AREA_MATCH_WITHIN_TOLERANCE"
        else:
            a_status = "Mismatch"
            a_reason = f"AREA_DIFFERENCE_{diff:.2f}_DECIMAL"

    results.append({
        "field": "area_decimal",
        "field_label_bn": "জমির পরিমাণ (শতাংশ)",
        "field_label_en": "Land Area (Decimal)",
        "status": a_status,
        "extracted_value": ext_area_raw,
        "reference_value": ref_area_raw,
        "difference": round(abs(ext_area - ref_area), 3) if (ext_area is not None and ref_area is not None) else None,
        "tolerance": area_tolerance_decimal,
        "reason_code": a_reason
    })

    # 5. Document Date
    ext_date = extracted_data.get("document_date")
    ref_date = reference_data.get("document_date")

    if not ext_date or str(ext_date).strip() == "":
        dt_status = "Not checked"
        dt_reason = "DATE_NOT_EXTRACTED"
    else:
        norm_ext_date = normalize_digits(str(ext_date)).strip()
        norm_ref_date = normalize_digits(str(ref_date)).strip() if ref_date else ""
        if norm_ext_date == norm_ref_date and norm_ref_date != "":
            dt_status = "Matched"
            dt_reason = "DATE_EXACT_MATCH"
        elif not ref_date:
            dt_status = "Not checked"
            dt_reason = "REFERENCE_DATE_EMPTY"
        else:
            dt_status = "Mismatch"
            dt_reason = "DATE_MISMATCH"

    results.append({
        "field": "document_date",
        "field_label_bn": "দলিল/রেকর্ড তারিখ",
        "field_label_en": "Document Date",
        "status": dt_status,
        "extracted_value": ext_date,
        "reference_value": ref_date,
        "reason_code": dt_reason
    })

    # Summary counts
    status_counts = {"Matched": 0, "Mismatch": 0, "Needs review": 0, "Not checked": 0}
    for item in results:
        status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1

    # Calculation of demo record-consistency indicator (explicitly transparent)
    # Total evaluated weight
    total_evaluable = len(results)
    # Full point for Matched, 0.5 for Needs review, 0 for Mismatch
    matched_count = status_counts["Matched"]
    review_count = status_counts["Needs review"]
    consistency_pct = round(((matched_count * 1.0 + review_count * 0.5) / total_evaluable) * 100, 1)

    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
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
