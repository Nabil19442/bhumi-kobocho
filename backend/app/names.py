import re
from difflib import SequenceMatcher
from typing import Dict, Set, Tuple, List, Optional

# Word-boundary-aware prefixes
# Must require trailing whitespace or dot so names like 'মোহাম্মদপুর' or 'Mrinal Das' are not corrupted
BANGLA_PREFIX_PATTERNS = [
    r"^(?:মোঃ|মো\.|মোছাঃ|মোছা\.|মোসাঃ|মোছাম্মৎ)(?:\s+|$)",
    r"^(?:মুহাম্মদ|মোহাম্মদ|শেখ|সৈয়দ|বেগম|শ্রী|শ্রীমতি|ডা\.|ডাক্তার)(?:\s+|$)",
]

ENGLISH_PREFIX_PATTERNS = [
    r"^(?:md|mohd|mst|mr|mrs|ms|dr|prof|adv)\b\s*[\.]?\s+",
    r"^(?:mohammad|mohammed|mosammat|sheikh|syed)\b\s+",
]

# Comprehensive Bangladeshi name token transliteration dictionary
BN_TO_EN_TOKENS: Dict[str, Set[str]] = {
    "আব্দুল": {"abdul", "abdur"},
    "করিম": {"karim"},
    "রফিকুল": {"rafiqul", "rofiqul", "rafikul"},
    "ইসলাম": {"islam"},
    "রহমান": {"rahman", "rohman"},
    "আলী": {"ali"},
    "আলি": {"ali"},
    "হোসেন": {"hossain", "hussain", "hosen"},
    "হুসেন": {"hossain", "hussain"},
    "চৌধুরী": {"chowdhury", "choudhury"},
    "খান": {"khan"},
    "আহমেদ": {"ahmed", "ahmad"},
    "আহম্মেদ": {"ahmed", "ahmad"},
    "হাসান": {"hasan", "hassan"},
    "হাছান": {"hasan", "hassan"},
    "মিয়া": {"mia", "miah"},
    "মিঞা": {"mia", "miah"},
    "বেগম": {"begum"},
    "খাতুন": {"khatun"},
    "আক্তার": {"akter", "akhtar"},
    "আখতার": {"akter", "akhtar"},
    "সুলতানা": {"sultana"},
    "জাহান": {"jahan"},
    "কাজী": {"kazi", "qazi"},
    "মোল্লা": {"molla", "mollah"},
    "সরকার": {"sarker", "sarkar"},
    "হক": {"haque", "hoque", "haq"},
    "শিকদার": {"sikder", "shikdar"},
    "তালুকদার": {"talukder", "talukdar"},
    "মণ্ডল": {"mondal", "mandal"},
    "মন্ডল": {"mondal", "mandal"},
    "ঘোষ": {"ghosh"},
    "দাস": {"das"},
    "রায়": {"roy", "ray"},
    "সাহা": {"saha"},
    "পাল": {"paul", "pal"},
    "বিশ্বাস": {"biswas"},
    "মজুমদার": {"mazumder", "majumder"},
    "মাহমুদ": {"mahmud", "mahmood"},
    "নাসির": {"nasir", "naser"},
    "ফারুক": {"faruk", "farooq"},
    "তারিক": {"tariq", "tarik"},
    "শামীম": {"shamim"},
    "কামাল": {"kamal"},
    "জামাল": {"jamal"},
    "সাকিব": {"sakib", "shakib"},
    "আলম": {"alam"},
    "মীর": {"mir"},
    "বাবুল": {"babul"},
    "মুরাদ": {"murad"},
    "সুমন": {"sumon"},
    "আরিফ": {"arif"},
    "আমির": {"amir"},
    "শরিফ": {"sharif", "shorif"},
    "সোহেল": {"sohel"},
    "সৈকত": {"saikat", "soikat"},
    "তন্ময়": {"tanmoy"},
    "মৃণাল": {"mrinal"},
    "অসীম": {"asim", "asheem"},
    "সুভাষ": {"subhash", "subash"},
    "অমিত": {"amit"},
    "অনিল": {"anil"},
    "রমেশ": {"ramesh"},
    "বিপ্লব": {"biplob", "biplab"},
    "তপন": {"tapan"},
    "প্রদীপ": {"pradip", "prodeep"},
    "সুকুমার": {"sukumar"},
    "বিমল": {"bimal"},
    "নির্মল": {"nirmal"},
    "উত্তম": {"uttam"},
    "স্বপন": {"swapan"},
    "সাধন": {"sadhan"},
    "রতন": {"ratan"},
    "মন্টু": {"montu"},
    "শংকর": {"shankar"},
    "গোবিন্দ": {"gobinda"},
    "জসীম": {"jasim", "jashim"},
    "জসিম": {"jasim", "jashim"},
    "উদ্দিন": {"uddin"},
    "উদ্দীণ": {"uddin"},
    "আজাদ": {"azad"},
    "জালাল": {"jalal"},
    "শাহজাহান": {"shahjahan"},
    "জাহাঙ্গীর": {"jahangir"},
    "শাহেদ": {"shahed"},
    "নূর": {"nur", "noor"},
    "নুর": {"nur", "noor"},
    "নবী": {"nabi"},
    "ইউনুস": {"yunus"},
    "ইউনুছ": {"yunus"},
    "ইউসুফ": {"yusuf", "yousuf"},
    "ইব্রাহিম": {"ibrahim"},
    "ইসমাইল": {"ismail"},
    "ইসহাক": {"ishaque", "ishak"},
    "মোস্তফা": {"mostafa", "mustafa"},
    "মোর্তজা": {"mortaza", "mortoza"},
    "মুন্সী": {"munshi"},
    "মুন্সি": {"munshi"},
    "লস্কর": {"laskar"},
    "হাজী": {"haji", "hazi"},
    "আনোয়ার": {"anwar", "anowar"},
    "হাবিব": {"habib"},
    "হানিফ": {"hanif"},
    "হারুন": {"harun"},
    "রশীদ": {"rashid"},
    "রশিদ": {"rashid"},
    "সাইফুল": {"saiful"},
    "শহীদুল": {"shahidul"},
    "শহিদুল": {"shahidul"},
    "ফজলুল": {"fazlul"},
    "বশির": {"bashir"},
    "মনির": {"monir"},
    "খন্দকার": {"khondakar", "khandaker", "khondker"},
    "খোন্দকার": {"khondakar", "khandaker", "khondker"},
    "লতিফ": {"latif"},
    "শফিক": {"shafiq"},
    "আশরাফ": {"ashraf"},
    "শাহীন": {"shahin"},
    "শাহিন": {"shahin"},
    "রুহুল": {"ruhul"},
    "আমিন": {"amin"},
    "আফসার": {"afsar"},
    "আকবর": {"akbar"},
    "এনামুল": {"enamul"},
    "তোফাজ্জল": {"tofazzal"},
    "মোবারক": {"mobarak"},
    "সিরাজ": {"siraj"},
    "মশিউর": {"moshiur"},
    "মাহবুব": {"mahbub"},
    "মুস্তাফিজুর": {"mustafizur"},
    "মিজানুর": {"mizanur"},
    "আজিজ": {"aziz"},
    "শওকত": {"shawkat"},
    "মতিউর": {"matiur", "motiur"},
    "নজরুল": {"nazrul"},
    "লুৎফর": {"lutfor", "lutfur"},
    "কামরুজ্জামান": {"kamruzzaman"},
    "আসাদুজ্জামান": {"asaduzzaman"},
    "নুরুজ্জামান": {"nuruzzaman"},
    "আনিসুর": {"anisur"},
    "ওমর": {"omar"},
    "সবুজ": {"sobuj"},
    "সুজন": {"sujon"},
    "সুফিয়া": {"sufia"},
    "রাহেলা": {"rahela"},
    "রোকেয়া": {"rokeya"},
    "ফাতেমা": {"fatema"},
    "জরিনা": {"jorina"},
    "আমেনা": {"amena"},
    "মরিয়ম": {"moriom", "maryam"},
    "হাসিনা": {"hasina"},
    "খালেদা": {"khaleda"},
    "শিরিন": {"shirin"},
    "নাসরিন": {"nasrin"},
    "পারভীন": {"parvin", "parveen"},
    "পারভিন": {"parvin", "parveen"},
    "নাজমা": {"najma", "nazma"},
    "সালমা": {"salma"},
    "লায়লা": {"laila"},
    "তাহমিনা": {"tahmina"},
    "শাহানা": {"shahana"},
    "রেহানা": {"rehana"},
    "শাবানা": {"shabana"},
    "মনিরা": {"monira"},
    "মমতা": {"momota", "mamata"},
    "গীতারাণী": {"gitarani"},
    "গীতা": {"gita"},
    "লিপি": {"lipi"},
    "রিনা": {"rina"},
    "মিনা": {"mina"},
    "স্বপ্না": {"swapna"},
    "বন্যা": {"bonna"},
    "পূজা": {"puja"},
    "অঞ্জলি": {"anjali"},
    "শিল্পী": {"shilpi"},
    "রুমা": {"ruma"},
    "সীমা": {"sima", "seema"},
    "সিমা": {"sima", "seema"},
}

# Reverse mapping for English to Bengali tokens
EN_TO_BN_TOKENS: Dict[str, Set[str]] = {}
for _bn, _en_set in BN_TO_EN_TOKENS.items():
    for _en in _en_set:
        EN_TO_BN_TOKENS.setdefault(_en, set()).add(_bn)

# Bengali phonetic character map for fallback transliteration
_BN_CHAR_MAP = {
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
    'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': '', 'ঁ': '',
    'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou'
}

def transliterate_bn_to_en(bn_text: str) -> str:
    """Fallback phonetic transliterator for Bengali graphemes to Latin script."""
    out: List[str] = []
    for c in bn_text:
        out.append(_BN_CHAR_MAP.get(c, c))
    return "".join(out).lower()

def is_bangla_text(text: str) -> bool:
    """Returns True if the text contains any Bengali unicode characters (0x0980 - 0x09FF)."""
    if not text:
        return False
    return any(0x0980 <= ord(c) <= 0x09FF for c in text)

def is_cross_script(text1: str, text2: str) -> bool:
    """Returns True if one text is in Bengali script and the other is in Latin/English script."""
    b1 = is_bangla_text(text1)
    b2 = is_bangla_text(text2)
    return b1 != b2

def normalize_name(name: str, is_bangla: bool = False) -> str:
    """
    Normalizes person names with word-boundary awareness.
    Preserves valid name portions:
    - 'Mrinal Das' remains 'mrinal das' (does not strip 'mr')
    - 'মোহাম্মদপুর' remains 'মোহাম্মদপুর' (does not strip 'মোহাম্মদ' without space)
    """
    if not name:
        return ""
    cleaned = name.strip()
    cleaned = re.sub(r"\s+", " ", cleaned)

    if is_bangla:
        # Standardize Bangla Hasanta / ZWNJ / ZWJ
        cleaned = cleaned.replace("\u200c", "").replace("\u200d", "")
        # Standardize Dari / Punctuation
        cleaned = re.sub(r"[\.,;:!\?'\"\(\)\[\]]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        # Word-boundary-aware prefix removal for Bengali:
        # MUST have trailing whitespace so valid parts of compound words like 'মোহাম্মদপুর' are preserved
        for p in BANGLA_PREFIX_PATTERNS:
            cleaned = re.sub(p, "", cleaned, flags=re.UNICODE).strip()
    else:
        cleaned = cleaned.lower()
        cleaned = re.sub(r"[\.,;:!\?'\"\(\)\[\]]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        # Word-boundary-aware prefix removal for English:
        # Uses word boundary \b and requires whitespace/dot so that 'Mrinal Das' is never corrupted
        for p in ENGLISH_PREFIX_PATTERNS:
            cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE).strip()

    return cleaned

def evaluate_cross_script_tokens(bn_name: str, en_name: str) -> Tuple[float, bool]:
    """
    Compares Bengali and English names using dictionary and phonetic evidence.
    Returns (similarity_score, is_reliable_match).
    """
    norm_bn = normalize_name(bn_name, is_bangla=True)
    norm_en = normalize_name(en_name, is_bangla=False)

    bn_tokens = norm_bn.split()
    en_tokens = norm_en.split()

    if not bn_tokens or not en_tokens:
        return (0.0, False)

    matched_tokens = 0
    total_tokens = max(len(bn_tokens), len(en_tokens))

    for bn_t in bn_tokens:
        expected_en = BN_TO_EN_TOKENS.get(bn_t, set())
        # Check direct dictionary mapping
        if any(en_t in expected_en for en_t in en_tokens):
            matched_tokens += 1
            continue
        # Fallback transliteration match
        trans = transliterate_bn_to_en(bn_t)
        if any(SequenceMatcher(None, trans, en_t).ratio() >= 0.85 for en_t in en_tokens):
            matched_tokens += 1

    ratio = matched_tokens / total_tokens

    has_bn_abbr = bool(re.search(r"^(?:মোঃ|মো\.|মোছাঃ|মোছা\.|মোসাঃ)\s+", bn_name.strip()))
    has_bn_full = bool(re.search(r"^(?:মুহাম্মদ|মোহাম্মদ|শেখ|সৈয়দ)\s+", bn_name.strip()))
    has_en_abbr = bool(re.search(r"^(?:md|mohd|mst)\b\s*[\.]?\s+", en_name.strip().lower()))
    has_en_full = bool(re.search(r"^(?:mohammad|mohammed)\b\s+", en_name.strip().lower()))

    # If one script has abbreviated prefix and the other has full prefix, treat as honorific variant
    has_prefix_variant = (has_bn_abbr and has_en_full) or (has_bn_full and has_en_abbr)

    # All tokens match with 100% reliable dictionary or high transliteration evidence
    if matched_tokens == len(bn_tokens) and len(bn_tokens) == len(en_tokens):
        if has_prefix_variant:
            return (0.95, False)
        return (0.98, True)
    
    # Partial token match (some matched, some missing or uncertain)
    if matched_tokens > 0:
        return (round(0.60 + (ratio * 0.25), 3), False)

    # Phonetic sequence comparison
    full_trans = transliterate_bn_to_en(norm_bn)
    seq_ratio = SequenceMatcher(None, full_trans, norm_en).ratio()
    return (round(seq_ratio, 3), False)

def compute_name_similarity(extracted_name: str, reference_name: str) -> float:
    """Computes similarity score between two names (0.0 to 1.0)."""
    if not extracted_name or not reference_name:
        return 0.0

    ext = extracted_name.strip()
    ref = reference_name.strip()

    if ext == ref:
        return 1.0

    # Cross-script comparison (Bengali <-> English)
    if is_cross_script(ext, ref):
        bn = ext if is_bangla_text(ext) else ref
        en = ref if is_bangla_text(ext) else ext
        sim, _ = evaluate_cross_script_tokens(bn, en)
        return sim

    # Same-script comparison
    bn_mode = is_bangla_text(ext)
    norm_ext = normalize_name(ext, is_bangla=bn_mode)
    norm_ref = normalize_name(ref, is_bangla=bn_mode)

    if norm_ext == norm_ref and len(norm_ext) > 0:
        return 0.95

    ext_tokens = set(norm_ext.split())
    ref_tokens = set(norm_ref.split())

    if ext_tokens and ref_tokens:
        token_overlap = len(ext_tokens & ref_tokens) / max(len(ext_tokens), len(ref_tokens))
    else:
        token_overlap = 0.0

    seq_ratio = SequenceMatcher(None, norm_ext, norm_ref).ratio()
    score = max(seq_ratio, (seq_ratio * 0.5 + token_overlap * 0.5))
    return round(score, 3)

def evaluate_name_status(extracted_name: str, reference_name: str) -> Tuple[str, str, float]:
    """
    Returns (status, reason_code, similarity_score).
    Status is strictly one of: 'Matched', 'Mismatch', 'Needs review', 'Not checked'.
    
    CRITICAL POLICY:
    - Never claim different scripts represent the same person without reliable evidence.
    - If uncertain -> 'Needs review'.
    - If significant difference -> 'Mismatch'.
    """
    if not extracted_name or not extracted_name.strip():
        return ("Not checked", "EXTRACTED_NAME_EMPTY", 0.0)

    if not reference_name or not reference_name.strip():
        return ("Not checked", "REFERENCE_NAME_EMPTY", 0.0)

    # Exact string match
    if extracted_name.strip().lower() == reference_name.strip().lower():
        return ("Matched", "NAME_EXACT_MATCH", 1.0)

    # Cross-script check (Bengali vs English)
    if is_cross_script(extracted_name, reference_name):
        bn = extracted_name if is_bangla_text(extracted_name) else reference_name
        en = reference_name if is_bangla_text(extracted_name) else extracted_name
        sim, is_reliable = evaluate_cross_script_tokens(bn, en)

        if is_reliable and sim >= 0.95:
            # High-confidence dictionary-verified cross-script match (e.g. আব্দুল করিম <-> Abdul Karim)
            return ("Matched", "CROSS_SCRIPT_NAME_MATCH", sim)
        elif sim >= 0.55:
            # Uncertain or partial transliteration match -> Needs review
            return ("Needs review", "CROSS_SCRIPT_UNCERTAIN_MATCH", sim)
        else:
            # Significant difference across scripts (e.g. আব্দুল করিম <-> Sultana Jahan)
            return ("Mismatch", "NAME_SIGNIFICANT_DIFFERENCE", sim)

    # Same script comparison
    sim = compute_name_similarity(extracted_name, reference_name)

    # Normalized exact match (e.g. prefix variation like Md. vs Mohammad)
    if sim >= 0.95:
        return ("Needs review", "NAME_SPELLING_OR_HONORIFIC_VARIANT", sim)

    if sim >= 0.65:
        return ("Needs review", "NAME_PARTIAL_OR_FUZZY_SIMILARITY", sim)

    return ("Mismatch", "NAME_SIGNIFICANT_DIFFERENCE", sim)
