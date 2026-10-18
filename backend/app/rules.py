import re
from typing import Dict, Any, List, Optional, Tuple
try:
    from .names import evaluate_name_status, is_bangla_text, normalize_name, compute_name_similarity
except ImportError:
    from backend.app.names import evaluate_name_status, is_bangla_text, normalize_name, compute_name_similarity

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

def normalize_mouza(val: Any) -> str:
    """Normalizes Mouza name, removing parenthetical English, JL suffixes, and extra spaces."""
    if val is None:
        return ""
    s = str(val).strip().lower()
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r",?\s*(?:jl|জেএল)[\s\-_:]*(?:no|নং)?[\s\-_:]*[\d০-৯]+", "", s, flags=re.IGNORECASE)
    s = re.sub(r"[\s\-_,.:;]+", "", s)
    return s

def extract_jl_number(jl_val: Any, mouza_val: Any = None) -> str:
    """Extracts JL number from explicit JL field or embedded Mouza text."""
    if jl_val is not None and str(jl_val).strip() != "":
        clean = normalize_digits(str(jl_val))
        match = re.search(r"\d+", clean)
        if match:
            return match.group(0)
    if mouza_val:
        m_str = normalize_digits(str(mouza_val))
        m_match = re.search(r"(?:jl|জেএল)[\s\-_:]*(?:no|নং)?[\s\-_:]*(\d+)", m_str, re.IGNORECASE)
        if m_match:
            return m_match.group(1)
    return ""

def normalize_deed_no(val: Any) -> str:
    """Normalizes deed number by converting numerals and standardizing slashes/hyphens."""
    if val is None:
        return ""
    s = normalize_digits(str(val)).strip().lower()
    s = re.sub(r"[\s\-_]+", "/", s)
    return s

MONTH_NAME_TO_INT: Dict[str, int] = {
    # Bengali Gregorian & Traditional Months
    "জানুয়ারি": 1, "জানুয়ারি": 1, "বৈশাখ": 1,
    "ফেব্রুয়ারি": 2, "ফেব্রুয়ারি": 2, "জ্যৈষ্ঠ": 2,
    "মার্চ": 3, "আষাঢ়": 3, "আষাঢ়": 3,
    "এপ্রিল": 4, "শ্রাবণ": 4,
    "মে": 5, "ভাদ্র": 5,
    "জুন": 6, "আশ্বিন": 6,
    "জুলাই": 7, "কার্তিক": 7,
    "আগস্ট": 8, "আগষ্ট": 8, "অগ্রহায়ণ": 8, "অগ্রহায়ণ": 8,
    "সেপ্টেম্বর": 9, "পৌষ": 9,
    "অক্টোবর": 10, "মাঘ": 10,
    "নভেম্বর": 11, "ফাল্গুন": 11,
    "ডিসেম্বর": 12, "চৈত্র": 12,
    # English Months
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12
}

def parse_and_normalize_date(val: Any) -> Optional[Dict[str, Any]]:
    """
    Parses dates in various formats:
    - ISO: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    - Bangladesh / Commonwealth: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    - Bangla numerals: ১২/০৩/২০১৯, ২০১৯-০৩-১২
    - Bengali & English textual dates: ১৫ অক্টোবর ২০২৬, 15 October 2026, 15-Oct-2026, ২০২৬ সালের ১৫ অক্টোবর
    - Bengali separators: hyphens, slashes, periods, spaces, en-dashes
    
    Returns structured dict with primary normalized date (YYYY-MM-DD),
    alternative interpretation (if ambiguous), and ambiguity flag.
    """
    if val is None:
        return None
    raw_str = str(val).strip()
    s = normalize_digits(raw_str).strip()
    if not s:
        return None

    # Check for Textual Month formats first
    # e.g., "15 অক্টোবর 2026", "15 October 2026", "15th October 2026", "15-Oct-2026"
    textual_pat1 = re.search(r"(\d{1,2})(?:st|nd|rd|th|ই|শে|রা|লা)?[\s\-_/]+([^\d\s\-_/]+)[\s\-_/,]+(\d{2,4})", s, re.IGNORECASE)
    if textual_pat1:
        d_val = int(textual_pat1.group(1))
        m_word = textual_pat1.group(2).lower()
        y_val = int(textual_pat1.group(3))
        if y_val < 100:
            y_val += 2000
        m_val = MONTH_NAME_TO_INT.get(m_word)
        if m_val and 1 <= d_val <= 31:
            primary = f"{y_val:04d}-{m_val:02d}-{d_val:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y_val, "month": m_val, "day": d_val,
                "raw": s
            }

    # e.g., "October 15, 2026" or "অক্টোবর ১৫, ২০২৬"
    textual_pat2 = re.search(r"([^\d\s\-_/]+)[\s\-_/]+(\d{1,2})(?:st|nd|rd|th|ই|শে|রা|লা)?[\s\-_/,]+(\d{2,4})", s, re.IGNORECASE)
    if textual_pat2:
        m_word = textual_pat2.group(1).lower()
        d_val = int(textual_pat2.group(2))
        y_val = int(textual_pat2.group(3))
        if y_val < 100:
            y_val += 2000
        m_val = MONTH_NAME_TO_INT.get(m_word)
        if m_val and 1 <= d_val <= 31:
            primary = f"{y_val:04d}-{m_val:02d}-{d_val:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y_val, "month": m_val, "day": d_val,
                "raw": s
            }

    # e.g., "2026 সালের 15 অক্টোবর"
    textual_pat3 = re.search(r"(\d{4})\s*(?:সালের)?\s*(\d{1,2})(?:st|nd|rd|th|ই|শে|রা|লা)?\s+([^\d\s\-_/]+)", s, re.IGNORECASE)
    if textual_pat3:
        y_val = int(textual_pat3.group(1))
        d_val = int(textual_pat3.group(2))
        m_word = textual_pat3.group(3).lower()
        m_val = MONTH_NAME_TO_INT.get(m_word)
        if m_val and 1 <= d_val <= 31:
            primary = f"{y_val:04d}-{m_val:02d}-{d_val:02d}"
            return {
                "primary": primary,
                "alternative": primary,
                "is_ambiguous": False,
                "year": y_val, "month": m_val, "day": d_val,
                "raw": s
            }

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

def get_recommended_next_step(field: str, status: str, reason_code: str = "") -> Tuple[str, str]:
    """
    Returns explainable next verification steps (step_bn, step_en) for every field evaluation.
    Adheres strictly to neutral civil verification standards.
    """
    if status == "Matched":
        return (
            "সরকারি রেকর্ডের সাথে তথ্য সামঞ্জস্যপূর্ণ; কোনো অতিরিক্ত সংশোধন প্রয়োজন নেই।",
            "Data is consistent with registered records; no corrective action needed."
        )

    if field == "owner_name":
        if status == "Needs review":
            return (
                "নামজারি খতিয়ান, ওয়ারিশান সনদ বা এফিডেভিট দেখে নামের রূপভেদ যাচাই করুন।",
                "Verify mutation khatian, inheritance certificate, or name affidavit for variants."
            )
        if status == "Mismatch":
            return (
                "বিক্রেতার পূর্ববর্তী বায়া দলিল ও উপজেলা ভূমি অফিসের নামজারি খতিয়ান সরাসরি তলব করুন।",
                "Cross-examine chain deeds (Baya dalil) and mutation record at AC Land Office."
            )
        return (
            "মূল দলিল বা পর্চায় মালিকের নাম স্পষ্টভাবে উল্লেখ আছে কিনা নিশ্চিত করুন।",
            "Confirm owner name is clearly legibly noted on the original document."
        )

    if field == "seller_name":
        if status == "Needs review":
            return (
                "বিক্রেতার জাতীয় পরিচয়পত্র ও ওয়ারিশান সনদ পরীক্ষা করে নামের বানান নিশ্চিত করুন।",
                "Review seller's NID card and inheritance credentials to confirm legal identity."
            )
        if status == "Mismatch":
            return (
                "বিক্রেতা অত্র জমির রেকর্ডীয় স্বত্বাধিকারী কিনা সাব-রেজিস্ট্রির বালাম বই থেকে নিরীক্ষা করুন।",
                "Audit Sub-Registry Balam volume to verify seller's registered ownership title."
            )
        return (
            "দলিল থেকে বিক্রেতার নাম ও পিতার নাম লিপিবদ্ধ করুন।",
            "Record seller name and parentage from registered deed."
        )

    if field == "khatian_no":
        if status == "Mismatch":
            return (
                "উপজেলা ভূমি অফিস (এসি ল্যান্ড) থেকে আর.এস./বি.এস. খতিয়ানের মূল ভলিউম তলব করুন।",
                "Request original RS/BS khatian register from Upazila Land Office (AC Land)."
            )
        return (
            "খতিয়ানের ধরণ (সি.এস./এস.এ./আর.এস./বি.এস./নামজারি) নিশ্চিত করে যাচাই করুন।",
            "Confirm specific survey lineage (CS/SA/RS/BS/Mutation) and cross-verify."
        )

    if field == "dag_no":
        if status == "Mismatch":
            return (
                "মৌজা ম্যাপ ও সিট পর্যালোচনা করে দাগের সীমানা ও হিস্যা সরেজমিনে চিহ্নিত করুন।",
                "Audit cadastral Mouza map sheet and demarcate plot boundaries on ground."
            )
        return (
            "হাল দাগ ও সাবেক দাগের মধ্যে সামঞ্জস্য নিশ্চিত করুন।",
            "Ensure consistency between current (Hal) and former (Sabek) plot numbers."
        )

    if field == "mouza":
        if status == "Mismatch":
            return (
                "উপজেলা ভূমি অফিসের মৌজা গেজেট ও সীমানা তালিকা যাচাই করুন।",
                "Verify official mouza gazette and territorial boundaries with Land Office."
            )
        return (
            "মৌজার ইংরেজি ও বাংলা বানানের সঠিক প্রতিবর্ণীকরণ নিশ্চিত করুন।",
            "Confirm correct transliteration of Mouza name in official gazetteer."
        )

    if field == "jl_no":
        if status == "Mismatch":
            return (
                "সংশ্লিষ্ট ইউনিয়নের মৌজা ও জেএল নম্বর তালিকা পুনঃনিরীক্ষা করুন।",
                "Re-check official JL number roster for the respective Union and Mouza."
            )
        return (
            "জেএল নম্বর সরকারি রেকর্ডপত্রের সাথে মিলিয়ে দেখুন।",
            "Verify JL number against official revenue survey records."
        )

    if field == "area_decimal":
        if status == "Needs review":
            return (
                "আংশিক হস্তান্তরের ক্ষেত্রে বিক্রেতার অবশিষ্ট জমা ও খারিজ প্রস্তাব পরীক্ষা করুন।",
                "Check seller's remaining holding balance and mutation partition application."
            )
        if status == "Mismatch":
            return (
                "অতিরিক্ত জমির ক্ষেত্রে বাটোয়ারা দলিল বা এসি ল্যান্ড নামজারি প্রস্তাব পরীক্ষা আবশ্যক।",
                "Examine partition deed or AC Land mutation record for excess area conveyance."
            )
        return (
            "জমির পরিমাণের একক (শতাংশ/কাঠা/একর) রূপান্তর নিশ্চিত করুন।",
            "Verify land area unit conversion (decimals/katha/acre)."
        )

    if field == "deed_no":
        if status == "Needs review":
            return (
                "প্রস্তাবিত নতুন দলিল বা নিবন্ধিত পূর্ববর্তী দলিলের সত্যতা সাব-রেজিস্ট্রিতে যাচাই করুন।",
                "Verify proposed or prior deed in Sub-Registry index."
            )
        return (
            "সাব-রেজিস্ট্রি অফিসের ইনডেক্স ও বালাম বই থেকে দলিলের নির্ভুলতা যাচাই করুন।",
            "Cross-verify deed index and volume registry at the Sub-Registry office."
        )

    if field == "document_date":
        if status == "Needs review":
            return (
                "তারিখের ফরম্যাট (দিন/মাস বনাম মাস/দিন) মূল দলিল দেখে নিশ্চিত করুন।",
                "Inspect physical document stamp date to resolve ambiguous date format."
            )
        if status == "Mismatch":
            return (
                "সাব-রেজিস্ট্রি বালাম বইয়ের সরকারি নিবন্ধন তারিখ ও স্ট্যাম্প তারিখ পরীক্ষা করুন।",
                "Audit official Sub-Registry Balam entry date and revenue stamp date."
            )
        return (
            "দলিল নিবন্ধনের তারিখ মূল কপি দেখে নথিবদ্ধ করুন।",
            "Record document registration date from official stamped copy."
        )

    return (
        "মূল সরকারি নথির সাথে তথ্য মিলিয়ে দেখুন।",
        "Cross-verify information against original archival government records."
    )


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

    if ext_primary == ref_primary:
        return ("Matched", "DATE_CONVENTION_MATCH", "বাংলাদেশ দলিল মানদণ্ড (DD/MM/YYYY) অনুযায়ী তারিখ সামঞ্জস্যপূর্ণ / Equivalent dates matched under Bangladesh convention.")

    if parsed_ext["is_ambiguous"] or parsed_ref["is_ambiguous"]:
        if (ext_alt == ref_primary) or (ext_primary == ref_alt) or (ext_alt == ref_alt):
            return (
                "Needs review",
                "DATE_AMBIGUOUS_FORMAT",
                f"তারিখ বিন্যাস ({parsed_ext['raw']} বনাম {parsed_ref['raw']}) দ্ব্যর্থক (দিন/মাস বনাম মাস/দিন)। যাচাই প্রয়োজন / Date format is ambiguous between DD/MM/YYYY and MM/DD/YYYY; manual review required."
            )

    return ("Mismatch", "DATE_MISMATCH", "দলিল ও সরকারি রেকর্ডের তারিখে অমিল রয়েছে / Date difference detected between extracted deed and reference record.")

def evaluate_mouza_status(ext_mouza: Any, ref_mouza: Any) -> Tuple[str, str, str]:
    """Evaluates Mouza name comparison with cross-script transliteration and punctuation cleaning."""
    if not ext_mouza or str(ext_mouza).strip() == "":
        return ("Not checked", "MOUZA_NOT_EXTRACTED", "দলিল থেকে মৌজার নাম পাওয়া যায়নি / Mouza name not extracted.")
    if not ref_mouza or str(ref_mouza).strip() == "":
        return ("Not checked", "REFERENCE_MOUZA_UNAVAILABLE", "পূর্ববর্তী সরকারি রেকর্ডে মৌজার নাম উল্লেখ নেই / Reference mouza unrecorded.")
    
    clean_ext = normalize_mouza(ext_mouza)
    clean_ref = normalize_mouza(ref_mouza)

    if clean_ext == clean_ref or clean_ext in clean_ref or clean_ref in clean_ext:
        return ("Matched", "MOUZA_EXACT_MATCH", "মৌজার নাম মিলেছে / Mouza name matches reference record.")

    try:
        sim = compute_name_similarity(str(ext_mouza), str(ref_mouza))
        if sim >= 0.70:
            return ("Matched", "MOUZA_TRANSLITERATION_MATCH", f"মৌজার নাম সামঞ্জস্যপূর্ণ (সাদৃশ্য: {sim:.2f}) / Mouza transliteration matches.")
    except Exception:
        pass

    return ("Mismatch", "MOUZA_MISMATCH", f"দলিল ({ext_mouza}) ও সরকারি রেকর্ডের ({ref_mouza}) মৌজায় অমিল / Mouza difference detected.")

def evaluate_jl_status(ext_jl: Any, ref_jl: Any, ext_mouza: Any = None, ref_mouza: Any = None) -> Tuple[str, str, str]:
    """Evaluates JL number matching with support for embedded JL numbers in Mouza string."""
    norm_ext = extract_jl_number(ext_jl, ext_mouza)
    norm_ref = extract_jl_number(ref_jl, ref_mouza)

    if not norm_ext:
        return ("Not checked", "JL_NOT_EXTRACTED", "দলিল থেকে কোনো জেএল নম্বর পাওয়া যায়নি / JL number not extracted.")
    if not norm_ref:
        return ("Not checked", "REFERENCE_JL_UNAVAILABLE", "পূর্ববর্তী সরকারি রেকর্ডে জেএল নম্বর উল্লেখ নেই / Reference JL number unrecorded.")

    if norm_ext == norm_ref:
        return ("Matched", "JL_EXACT_MATCH", f"জেএল নম্বর ({norm_ext}) মিলেছে / JL number matched.")
    return ("Mismatch", "JL_MISMATCH", f"দলিল (জেএল {norm_ext}) ও সরকারি রেকর্ডে (জেএল {norm_ref}) অমিল / JL number mismatch.")

def evaluate_seller_status(ext_seller: Any, ref_data: Dict[str, Any]) -> Tuple[str, str, str]:
    """
    Evaluates seller name against prior registered owner(s) or buyers in the reference baseline record.
    """
    if not ext_seller or str(ext_seller).strip() == "":
        return ("Not checked", "SELLER_NOT_EXTRACTED", "দলিল থেকে কোনো বিক্রেতার নাম পাওয়া যায়নি / Seller name not extracted.")

    ref_candidates = [
        ref_data.get("owner_name_bn"),
        ref_data.get("owner_name_en"),
        ref_data.get("owner_name"),
        ref_data.get("buyer_name_bn"),
        ref_data.get("buyer_name_en")
    ]
    ref_candidates = [str(c).strip() for c in ref_candidates if c and str(c).strip()]
    if not ref_candidates:
        return ("Not checked", "REFERENCE_OWNER_UNAVAILABLE", "পূর্ববর্তী সরকারি রেকর্ডে মালিক বা বিক্রেতার তথ্য অপ্রাপ্য / Reference owner/seller unrecorded.")

    evals = []
    for cand in ref_candidates:
        ev = evaluate_name_status(str(ext_seller), cand)
        evals.append((ev, cand))
        if ev[0] == "Matched":
            return ("Matched", "SELLER_MATCHES_REGISTERED_OWNER", f"বিক্রেতার নাম পূর্ববর্তী নিবন্ধিত মালিকের সাথে মিলেছে ({cand}) / Seller matches registered owner.")

    review_ev = next((pair for pair in evals if pair[0][0] == "Needs review"), None)
    if review_ev:
        return ("Needs review", "SELLER_NAME_VARIANT", f"বিক্রেতার নামে বানান বা পদবির রূপভেদ রয়েছে ({review_ev[1]}); ম্যানুয়াল যাচাই প্রয়োজন / Seller name variant requires review.")

    return ("Mismatch", "SELLER_NOT_REGISTERED_OWNER", f"দলিলের বিক্রেতার সাথে পূর্ববর্তী নিবন্ধিত মালিকের নামে অমিল / Seller does not match registered owner of reference record.")

def evaluate_deed_no_status(ext_deed: Any, ref_deed: Any) -> Tuple[str, str, str]:
    """Evaluates deed number matching with Bengali/English slash normalization."""
    if not ext_deed or str(ext_deed).strip() == "":
        return ("Not checked", "DEED_NO_NOT_EXTRACTED", "দলিল থেকে কোনো দলিল নম্বর পাওয়া যায়নি / Deed number not extracted.")
    if not ref_deed or str(ref_deed).strip() == "":
        return ("Not checked", "REFERENCE_DEED_UNAVAILABLE", "পূর্ববর্তী সরকারি রেকর্ডে দলিল নম্বর উল্লেখ নেই / Reference deed number unrecorded.")

    norm_ext = normalize_deed_no(ext_deed)
    norm_ref = normalize_deed_no(ref_deed)

    if norm_ext == norm_ref:
        return ("Matched", "DEED_NO_EXACT_MATCH", f"দলিল নম্বর ({ext_deed}) হুবহু মিলেছে / Deed number matches exactly.")
    return ("Needs review", "DEED_NO_DIFFERENT", f"প্রস্তাবিত নতুন দলিল নম্বর ({ext_deed}) পূর্ববর্তী দলিলের ({ref_deed}) চেয়ে আলাদা / Proposed deed number differs from reference prior deed.")

def compare_records(
    extracted_data: Dict[str, Any],
    reference_data: Optional[Dict[str, Any]] = None,
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
    if reference_data is None:
        reference_data = {}

    results: List[Dict[str, Any]] = []

    # 1. Owner / Buyer Name
    ext_name = (
        extracted_data.get("owner_name") or 
        extracted_data.get("owner_name_bn") or 
        extracted_data.get("owner_name_en") or 
        extracted_data.get("buyer_name") or 
        extracted_data.get("buyer_name_bn")
    )
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
        eval_bn = evaluate_name_status(str(ext_name), str(ref_bn)) if ref_bn else None
        eval_en = evaluate_name_status(str(ext_name), str(ref_en)) if ref_en else None
        eval_gen = evaluate_name_status(str(ext_name), str(ref_general)) if (ref_general and not ref_bn and not ref_en) else None

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
                # If owner/buyer name differs from reference owner, check whether this is a legitimate transfer
                # where the deed seller matches the registered owner of the reference record
                ext_seller = extracted_data.get("seller_name") or extracted_data.get("seller_name_bn")
                seller_eval = evaluate_seller_status(ext_seller, reference_data) if ext_seller else ("Not checked", "", "")
                if seller_eval[0] == "Matched":
                    status = "Matched"
                    reason = "VALID_TRANSFER_NEW_BUYER"
                    sim = 1.0
                    notes = f"দলিলের বিক্রেতা সরকারি রেকর্ডের নিবন্ধিত মালিকের সাথে মিলেছে; ক্রেতা ({ext_name}) বৈধভাবে স্বত্ব গ্রহীতা হিসেবে প্রস্তাবিত / Seller matches registered owner; buyer is valid proposed transferee."
                elif seller_eval[0] == "Needs review":
                    status = "Needs review"
                    reason = "SELLER_NAME_VARIANT_BUYER_REVIEW"
                    sim = 0.8
                    notes = f"বিক্রেতার নামে রূপভেদ রয়েছে; ক্রেতার ({ext_name}) নাম সতর্ক পর্যালোচনার জন্য চিহ্নিত / Seller has name variant; buyer flagged for review."
                else:
                    status, reason, sim = candidates[0] if candidates else ("Mismatch", "NAME_MISMATCH", 0.0)
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

    # 2. Seller Name (When provided in either extracted or reference)
    has_seller_data = bool(extracted_data.get("seller_name") or reference_data.get("seller_name_bn") or reference_data.get("seller_name"))
    if has_seller_data:
        ext_seller = extracted_data.get("seller_name")
        s_status, s_reason, s_notes = evaluate_seller_status(ext_seller, reference_data)
        results.append({
            "field": "seller_name",
            "field_label_bn": "বিক্রেতার নাম",
            "field_label_en": "Seller Name",
            "status": s_status,
            "extracted_value": ext_seller,
            "reference_value": reference_data.get("owner_name_bn") or reference_data.get("seller_name_bn") or reference_data.get("owner_name"),
            "reason_code": s_reason,
            "notes": s_notes
        })

    # 3. Khatian Number
    ext_khatian = extracted_data.get("khatian_no")
    ref_khatian = reference_data.get("khatian_no")

    if ext_khatian is None or str(ext_khatian).strip() == "":
        k_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        k_reason = "KHATIAN_NOT_FOUND"
        k_notes = "দলিল থেকে খতিয়ান নম্বর পাওয়া যায়নি / Khatian number was not extracted from deed."
    elif ref_khatian is None or str(ref_khatian).strip() == "":
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

    # 4. Dag Number
    ext_dag = extracted_data.get("dag_no")
    ref_dag = reference_data.get("dag_no")

    if ext_dag is None or str(ext_dag).strip() == "":
        d_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        d_reason = "DAG_NOT_FOUND"
        d_notes = "দলিল থেকে দাগ নম্বর পাওয়া যায়নি / Dag number was not extracted from deed."
    elif ref_dag is None or str(ref_dag).strip() == "":
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

    # 5. Mouza (When present in either extracted or reference)
    has_mouza_data = bool(extracted_data.get("mouza") or reference_data.get("mouza"))
    if has_mouza_data:
        ext_mouza = extracted_data.get("mouza")
        ref_mouza = reference_data.get("mouza")
        m_status, m_reason, m_notes = evaluate_mouza_status(ext_mouza, ref_mouza)
        results.append({
            "field": "mouza",
            "field_label_bn": "মৌজা",
            "field_label_en": "Mouza",
            "status": m_status,
            "extracted_value": ext_mouza,
            "reference_value": ref_mouza,
            "reason_code": m_reason,
            "notes": m_notes
        })

    # 6. JL Number (When present in either extracted or reference)
    has_jl_data = bool(extracted_data.get("jl_no") or reference_data.get("jl_no") or 
                       (reference_data.get("mouza") and "jl" in str(reference_data.get("mouza")).lower()))
    if has_jl_data:
        ext_jl = extracted_data.get("jl_no")
        ref_jl = reference_data.get("jl_no")
        jl_status, jl_reason, jl_notes = evaluate_jl_status(
            ext_jl, ref_jl,
            ext_mouza=extracted_data.get("mouza"),
            ref_mouza=reference_data.get("mouza")
        )
        results.append({
            "field": "jl_no",
            "field_label_bn": "জেএল নম্বর",
            "field_label_en": "JL Number",
            "status": jl_status,
            "extracted_value": ext_jl,
            "reference_value": ref_jl or extract_jl_number(None, reference_data.get("mouza")),
            "reason_code": jl_reason,
            "notes": jl_notes
        })

    # 7. Land Area (Decimal) with Partial Transfer & Excess Area Overlap Detection
    ext_area_raw = extracted_data.get("area_decimal")
    ref_area_raw = reference_data.get("area_decimal")

    ext_area = parse_decimal_value(ext_area_raw)
    ref_area = parse_decimal_value(ref_area_raw)

    if ext_area is None:
        a_status = "Needs review" if extracted_data.get("ocr_low_confidence") else "Not checked"
        a_reason = "AREA_NOT_PARSED"
        a_notes = "দলিল থেকে জমির পরিমাণ পড়া যায়নি / Land area not parsed from document."
    elif ref_area is None:
        a_status = "Not checked"
        a_reason = "REFERENCE_AREA_UNAVAILABLE"
        a_notes = "পূর্ববর্তী সরকারি রেকর্ডে জমির পরিমাণ উল্লেখ নেই / Reference land area is unrecorded or unavailable."
    else:
        diff = abs(ext_area - ref_area)
        is_partial = (
            extracted_data.get("is_partial_transfer") or 
            extracted_data.get("is_partial_purchase") or 
            reference_data.get("is_partial_purchase") or
            reference_data.get("is_partial_transfer")
        )

        if diff <= area_tolerance_decimal:
            a_status = "Matched"
            a_reason = "AREA_MATCH_WITHIN_TOLERANCE"
            a_notes = f"জমির পরিমাণ গ্রহণযোগ্য সীমার মধ্যে মিলেছে (পার্থক্য: {diff:.3f} শতক) / Area matches within tolerance."
        elif ext_area < ref_area:
            if is_partial:
                a_status = "Matched"
                a_reason = "PARTIAL_TRANSFER_WITHIN_LIMIT"
                a_notes = f"আংশিক জমি হস্তান্তর: বিক্রেতার {ref_area:.2f} শতকের মধ্যে {ext_area:.2f} শতক হস্তান্তর প্রস্তাবিত / Partial land transfer within holding balance."
            else:
                a_status = "Needs review"
                a_reason = "PARTIAL_TRANSFER_REQUIRES_PARTITION_REVIEW"
                a_notes = f"আংশিক জমি হস্তান্তর ({ext_area:.2f} শতক বনাম রেকর্ডের {ref_area:.2f} শতক)। বিক্রেতার জমার অন্তর্ভুক্ত, তবে খারিজ/বাটোয়ারা খতিয়ান যাচাই আবশ্যক / Partial area transfer; requires mutation/partition review."
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

    # 8. Deed Number (When present in either extracted or reference)
    has_deed_data = bool(extracted_data.get("deed_no") or reference_data.get("deed_no"))
    if has_deed_data:
        ext_deed = extracted_data.get("deed_no")
        ref_deed = reference_data.get("deed_no")
        deed_status, deed_reason, deed_notes = evaluate_deed_no_status(ext_deed, ref_deed)
        results.append({
            "field": "deed_no",
            "field_label_bn": "দলিল নম্বর",
            "field_label_en": "Deed No.",
            "status": deed_status,
            "extracted_value": ext_deed,
            "reference_value": ref_deed,
            "reason_code": deed_reason,
            "notes": deed_notes
        })

    # 9. Document Date
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

    # Summary counts & explainable next verification steps
    status_counts = {"Matched": 0, "Mismatch": 0, "Needs review": 0, "Not checked": 0}
    for item in results:
        step_bn, step_en = get_recommended_next_step(
            item.get("field", ""),
            item.get("status", ""),
            item.get("reason_code", "")
        )
        item["recommended_next_step"] = step_en
        item["recommended_next_step_bn"] = step_bn
        status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1

    total_evaluable = len(results)
    matched_count = status_counts["Matched"]
    review_count = status_counts["Needs review"]
    consistency_pct = round(((matched_count * 1.0 + review_count * 0.5) / total_evaluable) * 100, 1) if total_evaluable > 0 else 0.0

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
