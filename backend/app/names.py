import re
from difflib import SequenceMatcher

# Common Bangla and English honorifics / titles
BANGLA_PREFIXES = [
    r"^মোঃ\s*", r"^মো\.\s*", r"^মোহাম্মদ\s*", r"^মোছাম্মৎ\s*", r"^মোসাঃ\s*", r"^মোছাঃ\s*", r"^মোছা\.\s*",
    r"^শ্রী\s*", r"^শ্রীমতি\s*", r"^বেগম\s*", r"^শেখ\s*", r"^সৈয়দ\s*"
]

ENGLISH_PREFIXES = [
    r"^md\.?\s*", r"^mohd\.?\s*", r"^mohammad\s*", r"^mohammed\s*",
    r"^mst\.?\s*", r"^mosammat\s*", r"^mrs\.?\s*", r"^mr\.?\s*", r"^ms\.?\s*",
    r"^sheikh\s*", r"^syed\s*"
]

def normalize_name(name: str, is_bangla: bool = False) -> str:
    if not name:
        return ""
    cleaned = name.strip()
    # Normalize whitespace
    cleaned = re.sub(r"\s+", " ", cleaned)
    
    if is_bangla:
        # Standardize Bangla Hasanta / ZWNJ / ZWJ
        cleaned = cleaned.replace("\u200c", "").replace("\u200d", "")
        # Standardize Dari / Punctuation
        cleaned = re.sub(r"[\.,;:!\?'\"\(\)\[\]]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        # Strip prefixes for core comparison
        for p in BANGLA_PREFIXES:
            cleaned = re.sub(p, "", cleaned, flags=re.UNICODE).strip()
    else:
        cleaned = cleaned.lower()
        cleaned = re.sub(r"[\.,;:!\?'\"\(\)\[\]]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        for p in ENGLISH_PREFIXES:
            cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE).strip()

    return cleaned

def is_bangla_text(text: str) -> bool:
    # Unicode range for Bengali is 0980 - 09FF
    return any(0x0980 <= ord(c) <= 0x09FF for c in text)

def compute_name_similarity(extracted_name: str, reference_name: str) -> float:
    if not extracted_name or not reference_name:
        return 0.0

    ext = extracted_name.strip()
    ref = reference_name.strip()

    if ext == ref:
        return 1.0

    # Determine if predominantly Bengali
    bn_mode = is_bangla_text(ext) or is_bangla_text(ref)

    norm_ext = normalize_name(ext, is_bangla=bn_mode)
    norm_ref = normalize_name(ref, is_bangla=bn_mode)

    if norm_ext == norm_ref and len(norm_ext) > 0:
        return 0.95

    # Token sets
    ext_tokens = set(norm_ext.split())
    ref_tokens = set(norm_ref.split())

    if ext_tokens and ref_tokens:
        token_overlap = len(ext_tokens & ref_tokens) / max(len(ext_tokens), len(ref_tokens))
    else:
        token_overlap = 0.0

    seq_ratio = SequenceMatcher(None, norm_ext, norm_ref).ratio()
    
    # Combined score
    score = max(seq_ratio, (seq_ratio * 0.5 + token_overlap * 0.5))
    return round(score, 3)

def evaluate_name_status(extracted_name: str, reference_name: str) -> tuple[str, str, float]:
    """
    Returns (status, reason_code, similarity_score)
    Status is strictly one of: 'Matched', 'Mismatch', 'Needs review', 'Not checked'
    """
    if not extracted_name or not extracted_name.strip():
        return ("Not checked", "EXTRACTED_NAME_EMPTY", 0.0)

    if not reference_name or not reference_name.strip():
        return ("Not checked", "REFERENCE_NAME_EMPTY", 0.0)

    # Exact string match
    if extracted_name.strip().lower() == reference_name.strip().lower():
        return ("Matched", "NAME_EXACT_MATCH", 1.0)

    sim = compute_name_similarity(extracted_name, reference_name)

    # Normalized exact match (e.g. prefix variation like Md. vs Mohammad)
    if sim >= 0.95:
        # Note: Spec test case 3 states: "Name spelling variant -> Needs review (not Mismatch, not Matched)"
        # So even slight variants trigger Needs review to prevent false auto-acceptance in legal documents!
        return ("Needs review", "NAME_SPELLING_OR_HONORIFIC_VARIANT", sim)

    if sim >= 0.65:
        return ("Needs review", "NAME_PARTIAL_OR_FUZZY_SIMILARITY", sim)

    return ("Mismatch", "NAME_SIGNIFICANT_DIFFERENCE", sim)
