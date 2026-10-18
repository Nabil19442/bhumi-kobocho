import re
import os
import io
import shutil
import tempfile
import subprocess
from typing import Dict, Any, Optional, List, Tuple
try:
    from .integrity import calculate_sha256
except ImportError:
    from backend.app.integrity import calculate_sha256

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")
SAMPLES_DIR = os.path.join(DATA_DIR, "samples")

BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯"
WESTERN_DIGITS = "0123456789"
BN_TO_EN_DIGIT_MAP = str.maketrans(BANGLA_DIGITS, WESTERN_DIGITS)

def normalize_digits(text: Optional[str]) -> str:
    if text is None:
        return ""
    return str(text).strip().translate(BN_TO_EN_DIGIT_MAP)

def find_tesseract_binary() -> Optional[str]:
    """Finds tesseract executable on PATH or standard installation directories."""
    which_path = shutil.which("tesseract")
    if which_path and os.path.isfile(which_path):
        return which_path

    # Common Windows installation locations
    candidate_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
        os.path.expandvars(r"%PROGRAMFILES%\Tesseract-OCR\tesseract.exe"),
    ]
    for p in candidate_paths:
        if os.path.isfile(p):
            return p
    return None

def get_tesseract_languages(tesseract_bin: str) -> List[str]:
    """Retrieves installed tesseract languages via --list-langs."""
    try:
        res = subprocess.run([tesseract_bin, "--list-langs"], capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            lines = [line.strip() for line in res.stdout.splitlines() if line.strip() and not line.startswith("List of")]
            return lines
    except Exception:
        pass
    return []

def is_tesseract_available() -> Tuple[bool, Optional[str], List[str]]:
    """
    Returns (is_available, binary_path, installed_languages).
    """
    tess_bin = find_tesseract_binary()
    if not tess_bin:
        return False, None, []
    langs = get_tesseract_languages(tess_bin)
    return True, tess_bin, langs

def run_tesseract_ocr(
    image_bytes: bytes,
    tesseract_bin: str,
    langs: List[str]
) -> Tuple[str, Dict[str, Any]]:
    """
    Executes real Tesseract OCR using Bengali and English language models if installed.
    Extracts text and TSV data to calculate genuine OCR confidence scores.
    """
    # Select available languages
    requested_langs = []
    if "ben" in langs:
        requested_langs.append("ben")
    if "eng" in langs:
        requested_langs.append("eng")
    if not requested_langs:
        requested_langs = ["osd"] if "osd" in langs else (langs[:1] if langs else ["eng"])

    lang_param = "+".join(requested_langs)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_in:
        tmp_in.write(image_bytes)
        tmp_in_path = tmp_in.name

    tmp_out_base = tmp_in_path + "_out"

    try:
        # Run tesseract text output
        cmd_txt = [tesseract_bin, tmp_in_path, tmp_out_base, "-l", lang_param]
        subprocess.run(cmd_txt, capture_output=True, text=True, timeout=15, check=True)

        txt_file = tmp_out_base + ".txt"
        extracted_text = ""
        if os.path.isfile(txt_file):
            with open(txt_file, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()

        # Run tesseract TSV output to obtain genuine confidence scores
        cmd_tsv = [tesseract_bin, tmp_in_path, tmp_out_base, "-l", lang_param, "tsv"]
        subprocess.run(cmd_tsv, capture_output=True, text=True, timeout=15)

        tsv_file = tmp_out_base + ".tsv"
        confidences: List[float] = []
        if os.path.isfile(tsv_file):
            with open(tsv_file, "r", encoding="utf-8", errors="ignore") as f:
                header = f.readline()
                for line in f:
                    parts = line.strip().split("\t")
                    # Column 10 is 'conf'
                    if len(parts) >= 11:
                        try:
                            c = float(parts[10])
                            if c >= 0:  # -1 indicates non-word elements
                                confidences.append(c / 100.0)
                        except ValueError:
                            pass

        overall_conf = round(sum(confidences) / len(confidences), 3) if confidences else 0.0

        return extracted_text, {
            "overall_confidence": overall_conf,
            "word_confidences": confidences,
            "languages_used": lang_param
        }
    finally:
        # Clean up temporary files
        for ext in ["", ".txt", ".tsv"]:
            p = tmp_out_base + ext
            if os.path.isfile(p):
                try:
                    os.remove(p)
                except OSError:
                    pass
        if os.path.isfile(tmp_in_path):
            try:
                os.remove(tmp_in_path)
            except OSError:
                pass

def preprocess_image_for_ocr(image_bytes: bytes) -> bytes:
    """
    Preprocesses uploaded document images with Pillow:
    - Auto-corrects EXIF orientation (handles mobile camera rotation).
    - Converts to Grayscale.
    - Upscales low-resolution scans (if width < 1200, scale with Lanczos filter).
    - Enhances contrast to separate faded Bengali ink from background paper.
    """
    try:
        from PIL import Image, ImageOps, ImageEnhance
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode != "L":
            img = img.convert("L")
        w, h = img.size
        if w < 1200 or h < 1200:
            scale = max(1200.0 / max(w, 1), 1200.0 / max(h, 1))
            if 1.0 < scale <= 3.0:
                new_w = int(w * scale)
                new_h = int(h * scale)
                resample_filter = getattr(Image, "Resampling", Image).LANCZOS
                img = img.resize((new_w, new_h), resample_filter)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.35)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except Exception:
        return image_bytes

def clean_extracted_field(val: Optional[str]) -> Optional[str]:
    """Cleans extracted candidate string by stripping unwanted boundary characters and parentheticals."""
    if not val:
        return None
    cleaned = str(val).strip()
    cleaned = re.sub(r"^[\s:：\-—_,\./]+", "", cleaned)
    cleaned = re.sub(r"[\s:：\-—_,\./]+$", "", cleaned)
    # Strip trailing parenthetical noise e.g. (কাল্পনিক), (সম্পূর্ণ কাল্পনিক), (নমুনা)
    cleaned = re.sub(r"\s*\([^)]*\)", "", cleaned).strip()
    return cleaned if cleaned else None

def extract_fields_from_text(
    text: str,
    ocr_engine: str = "regex_text_parser",
    base_confidence: Optional[float] = None
) -> Dict[str, Any]:
    """
    Extracts candidate fields from document text with deterministic regex rules.
    Does NOT fabricate confidence scores. If base_confidence is provided (from Tesseract TSV),
    it is used; otherwise confidence reflects pattern matching certainty or is marked as uncalculated.
    Normalizes Bengali numerals internally while preserving original text for display.
    """
    # 0. Clean null bytes and normalize Bengali ya variations
    norm_text = text.replace("\x00", "")
    norm_text = norm_text.replace("\u09af\u09bc", "\u09df")  # য + ় -> য়

    fields = {
        "owner_name": None,
        "seller_name": None,
        "buyer_name": None,
        "mouza": None,
        "jl_no": None,
        "khatian_no": None,
        "dag_no": None,
        "area_decimal": None,
        "document_date": None,
        "deed_no": None,
        "raw_text": text
    }

    confidences: Dict[str, Optional[float]] = {}

    # 1. Deed No
    deed_match = re.search(
        r"(?:দলিল\s*(?:নম্বর|নং)|দলিল|Deed\s*(?:No|Number)?)[\s:：\-—]*\n?[\s:：\-—]*([A-Za-z0-9০-৯\-_/]+)",
        norm_text,
        re.IGNORECASE
    )
    if deed_match:
        cand_deed = clean_extracted_field(deed_match.group(1))
        if cand_deed:
            fields["deed_no"] = cand_deed
            if base_confidence is not None:
                confidences["deed_no"] = base_confidence

    if not fields["deed_no"]:
        num_slash_year = re.search(r"\b([\d০-৯]{3,5}/[\d০-৯]{4})\b", norm_text)
        if num_slash_year:
            fields["deed_no"] = num_slash_year.group(1).strip()
            if base_confidence is not None:
                confidences["deed_no"] = base_confidence

    # 2. Date
    bn_months = (
        "জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর|"
        "জানুয়ারি|ফেব্রুয়ারি|বৈশাখ|জ্যৈষ্ঠ|আষাঢ়|আষাঢ়|শ্রাবণ|ভাদ্র|আশ্বিন|কার্তিক|অগ্রহায়ণ|অগ্রহায়ণ|পৌষ|মাঘ|ফাল্গুন|চৈত্র"
    )
    en_months = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec"
    date_pat = (
        rf"[\d০-৯]{{1,4}}[\s\-/]+(?:{bn_months}|{en_months}|[\d০-৯]{{1,2}})[\s\-/]+[\d০-৯]{{2,4}}|"
        r"[\d০-৯]{4}[-/][\d০-৯]{1,2}[-/][\d০-৯]{1,2}|"
        r"[\d০-৯]{1,2}[-/][\d০-৯]{1,2}[-/][\d০-৯]{2,4}"
    )
    date_match = re.search(
        r"(?:তারিখ|Date)[\s:：\-—]*\n?[\s:：\-—]*(" + date_pat + r")",
        norm_text,
        re.IGNORECASE
    )
    if date_match:
        cand_date = clean_extracted_field(date_match.group(1))
        if cand_date:
            fields["document_date"] = cand_date
            if base_confidence is not None:
                confidences["document_date"] = base_confidence

    # 3. Seller Name (বিক্রেতার নাম, বিক্রেতা, হস্তান্তরকারী, দাতা, Seller)
    seller_match = re.search(
        r"(?:বিক্রেতার\s*নাম|বিক্রেতা|হস্তান্তরকারী|দাতার\s*নাম|দাতার|Seller(?:\s*Name)?)[\s:：\-—]*\n?[\s:：\-—]*([^\n\r,(\[]+)",
        norm_text,
        re.IGNORECASE
    )
    if seller_match:
        cand_seller = clean_extracted_field(seller_match.group(1))
        if cand_seller:
            fields["seller_name"] = cand_seller
            if base_confidence is not None:
                confidences["seller_name"] = base_confidence

    # 4. Buyer Name & Owner Name
    # Priority: buyer (ক্রেতা), grantee (গ্রহীতা), owner (মালিক/মালিকের নাম)
    # Note: (?<!বি) ensures 'বিক্রেতা' (seller) is not mistaken for 'ক্রেতা'
    buyer_match = re.search(
        r"(?:ক্রেতার\s*নাম|(?<!বি)ক্রেতা|গ্রহীতার\s*নাম|Buyer(?:\s*Name)?)[\s:：\-—]*\n?[\s:：\-—]*([^\n\r,(\[]+)",
        norm_text,
        re.IGNORECASE
    )
    if buyer_match:
        cand_buyer = clean_extracted_field(buyer_match.group(1))
        if cand_buyer:
            fields["buyer_name"] = cand_buyer
            fields["owner_name"] = cand_buyer
            if base_confidence is not None:
                confidences["buyer_name"] = base_confidence

    name_match = re.search(
        r"(?:গ্রহীতা\s*/\s*মালিকের\s*নাম|মালিকের\s*নাম|জমির\s*মালিক|Owner(?:\s*Name)?)[\s:：\-—]*\n?[\s:：\-—]*([^\n\r,(\[]+)",
        norm_text,
        re.IGNORECASE
    )
    if name_match:
        owner_candidate = name_match.group(1).strip()
        owner_candidate = re.sub(r"^(?:গ্রহীতা\s*/\s*মালিকের\s*নাম|মালিকের\s*নাম|মালিক|গ্রহীতা|ক্রেতা|Owner(?:\s*Name)?)\s*[:：\-—]\s*", "", owner_candidate).strip()
        cleaned_owner = clean_extracted_field(owner_candidate)
        if cleaned_owner:
            fields["owner_name"] = cleaned_owner
            if base_confidence is not None:
                confidences["owner_name"] = base_confidence

    if not fields["owner_name"]:
        for line in norm_text.splitlines():
            clean_line = line.strip()
            if any(p in clean_line for p in ["মোঃ", "মোহাম্মদ", "Md.", "Mohammad", "সুলতানা", "Sultana", "আব্দুল", "Abdul"]):
                cand = clean_extracted_field(clean_line)
                if cand:
                    fields["owner_name"] = cand
                    if base_confidence is not None:
                        confidences["owner_name"] = base_confidence
                    break

    # 5. Mouza (মৌজা, মৌজা নং, Mouza)
    mouza_match = re.search(
        r"(?:মৌজার\s*নাম|মৌজা|Mouza)[\s:：\-—]*\n?[\s:：\-—]*([^\n\r,(\[]+)",
        norm_text,
        re.IGNORECASE
    )
    if mouza_match:
        cand_mouza = clean_extracted_field(mouza_match.group(1))
        if cand_mouza:
            fields["mouza"] = cand_mouza
            if base_confidence is not None:
                confidences["mouza"] = base_confidence

    # 6. JL No (জেএল নম্বর, জেএল নং, জে.এল. নং, JL No)
    jl_match = re.search(
        r"(?:জে[\.\s]*এল[\.\s]*(?:নম্বর|নং)?|JL\s*(?:No)?)[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯]+)",
        norm_text,
        re.IGNORECASE
    )
    if jl_match:
        cand_jl = clean_extracted_field(jl_match.group(1))
        if cand_jl:
            fields["jl_no"] = cand_jl
            if base_confidence is not None:
                confidences["jl_no"] = base_confidence

    # 7. Khatian No (prioritize latest operative survey: BS > RS > Mutation over CS/SA)
    bs_rs_match = re.search(
        r"(?:বি[\.\s]*এস[\.\s]*|আর[\.\s]*এস[\.\s]*|নামজারি|খারিজ)\s*খতিয়ান\s*(?:নম্বর|নং)?[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯/]+)",
        norm_text,
        re.IGNORECASE
    )
    if bs_rs_match:
        cand_k = clean_extracted_field(bs_rs_match.group(1))
        if cand_k:
            fields["khatian_no"] = cand_k
            if base_confidence is not None:
                confidences["khatian_no"] = base_confidence

    if not fields["khatian_no"]:
        khatian_match = re.search(
            r"(?:(?:এস[\.\s]*এ[\.\s]*|সি[\.\s]*এস[\.\s]*)?\s*খতিয়ান\s*(?:নম্বর|নং)?|খতিয়ান|Khatian\s*(?:No)?)[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯/]+)",
            norm_text,
            re.IGNORECASE
        )
        if khatian_match:
            cand_k = clean_extracted_field(khatian_match.group(1))
            if cand_k:
                fields["khatian_no"] = cand_k
                if base_confidence is not None:
                    confidences["khatian_no"] = base_confidence

    # 8. Dag No (prioritize operative Hal Dag / Current Plot over Sabek Dag)
    hal_dag_match = re.search(
        r"(?:হাল\s*দাগ\s*(?:নম্বর|নং)?|বর্তমান\s*দাগ)[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯/]+)",
        norm_text,
        re.IGNORECASE
    )
    if hal_dag_match:
        cand_d = clean_extracted_field(hal_dag_match.group(1))
        if cand_d:
            fields["dag_no"] = cand_d
            if base_confidence is not None:
                confidences["dag_no"] = base_confidence

    if not fields["dag_no"]:
        dag_match = re.search(
            r"(?:দাগ\s*(?:নম্বর|নং)|দাগ|Dag\s*(?:No)?)[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯/]+)",
            norm_text,
            re.IGNORECASE
        )
        if dag_match:
            cand_d = clean_extracted_field(dag_match.group(1))
            if cand_d:
                fields["dag_no"] = cand_d
                if base_confidence is not None:
                    confidences["dag_no"] = base_confidence

    # 9. Area (Support comma separators and regional units: শতক, শতাংশ, decimal, একর, কাঠা)
    area_match = re.search(
        r"(?:জমির\s*পরিমাণ|জমির\s*রকমারি|মোট\s*জমি|পরিমাণ|Area)[\s:：\-—]*\n?[\s:：\-—]*([\d০-৯\.,]+\s*(?:শতাংশ|শতক|decimal|একর|shotangsho|কাঠা)?)",
        norm_text,
        re.IGNORECASE
    )
    if area_match:
        cand_a = clean_extracted_field(area_match.group(1))
        if cand_a:
            fields["area_decimal"] = cand_a
            if base_confidence is not None:
                confidences["area_decimal"] = base_confidence

    # Assign field status without fabricating unsupplied confidence numbers
    field_status = {}
    for k in ["owner_name", "seller_name", "buyer_name", "mouza", "jl_no", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]:
        if fields[k] is None:
            field_status[k] = "Not checked"
        elif confidences.get(k) is not None and confidences[k] < 0.75:
            field_status[k] = "Needs review"
        else:
            field_status[k] = "Candidate extracted"

    # Normalize Bengali numerals to English digits internally while preserving original for display
    normalized_fields = {
        "owner_name": fields["owner_name"],
        "seller_name": fields["seller_name"],
        "buyer_name": fields["buyer_name"],
        "mouza": fields["mouza"],
        "jl_no": normalize_digits(fields["jl_no"]) if fields["jl_no"] else None,
        "khatian_no": normalize_digits(fields["khatian_no"]) if fields["khatian_no"] else None,
        "dag_no": normalize_digits(fields["dag_no"]) if fields["dag_no"] else None,
        "area_decimal": normalize_digits(fields["area_decimal"]) if fields["area_decimal"] else None,
        "document_date": normalize_digits(fields["document_date"]) if fields["document_date"] else None,
        "deed_no": normalize_digits(fields["deed_no"]) if fields["deed_no"] else None,
    }

    return {
        "extracted_fields": fields,
        "normalized_fields": normalized_fields,
        "confidence_scores": confidences,
        "ocr_field_status": field_status,
        "ocr_engine": ocr_engine,
        "status": "success",
        "disclaimer": "DEMO DATA — not a legal verdict. Extracted OCR candidates must be verified by the user."
    }

def load_known_demo_specimen(sample_id: str) -> Dict[str, Any]:
    """
    Explicitly loads a known synthetic demo specimen from backend/data/records.json
    and reads its sample file from backend/data/samples/.
    Engine is strictly reported as 'known_demo_specimen'.
    """
    if not sample_id or not isinstance(sample_id, str):
        raise ValueError("Invalid sample_id.")

    clean_id = sample_id.strip()
    if "/" in clean_id or "\\" in clean_id or ".." in clean_id:
        raise ValueError("Invalid sample_id: Path traversal characters are not permitted.")

    if not os.path.exists(RECORDS_FILE):
        raise FileNotFoundError("Records dataset records.json not found.")

    import json
    with open(RECORDS_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    # Resolve sample_id e.g. "001", "002", "rec-demo-001"
    target_record = None
    for r in records:
        if r.get("id") == sample_id:
            target_record = r
            break
        if sample_id in r.get("id", "") or sample_id in r.get("sample_file", ""):
            target_record = r
            break

    # If not found in records.json, check development seed dataset (dev_seed_deeds.json)
    if not target_record:
        try:
            from .dev_dataset import get_dev_seed_by_id
        except ImportError:
            from backend.app.dev_dataset import get_dev_seed_by_id

        dev_seed = get_dev_seed_by_id(sample_id)
        if dev_seed:
            return {
                "extracted_fields": {
                    "owner_name": dev_seed.get("buyer_name_bn") or dev_seed.get("owner_name_bn"),
                    "seller_name": dev_seed.get("seller_name_bn"),
                    "buyer_name": dev_seed.get("buyer_name_bn"),
                    "mouza": dev_seed.get("mouza"),
                    "jl_no": str(dev_seed.get("jl_no") or ""),
                    "khatian_no": str(dev_seed.get("khatian_no") or ""),
                    "dag_no": str(dev_seed.get("dag_no") or ""),
                    "area_decimal": str(dev_seed.get("area_decimal") or ""),
                    "document_date": dev_seed.get("document_date"),
                    "deed_no": dev_seed.get("deed_no"),
                    "raw_text": f"DEV SEED DEED: {dev_seed.get('id')}\nদলিল নং: {dev_seed.get('deed_no')}\nবিক্রেতা: {dev_seed.get('seller_name_bn')}\nক্রেতা: {dev_seed.get('buyer_name_bn')}\nমৌজা: {dev_seed.get('mouza')}\nদাগ: {dev_seed.get('dag_no')}\nখতিয়ান: {dev_seed.get('khatian_no')}\nজমির পরিমাণ: {dev_seed.get('area_decimal')} শতক\nতারিখ: {dev_seed.get('document_date')}"
                },
                "confidence_scores": {},
                "ocr_field_status": {
                    "owner_name": "Candidate extracted",
                    "seller_name": "Candidate extracted",
                    "buyer_name": "Candidate extracted",
                    "mouza": "Candidate extracted",
                    "jl_no": "Candidate extracted",
                    "khatian_no": "Candidate extracted",
                    "dag_no": "Candidate extracted",
                    "area_decimal": "Candidate extracted",
                    "document_date": "Candidate extracted",
                    "deed_no": "Candidate extracted"
                },
                "ocr_engine": "known_demo_specimen",
                "status": "known_specimen",
                "sample_id": dev_seed.get("id"),
                "uploaded_file_sha256": "dev-seed-specimen",
                "disclaimer": "DEVELOPMENT SEED DATA — strictly fictional record for testing and evaluation.",
                "normalized_fields": {
                    "owner_name": dev_seed.get("buyer_name_bn") or dev_seed.get("owner_name_bn"),
                    "seller_name": dev_seed.get("seller_name_bn"),
                    "buyer_name": dev_seed.get("buyer_name_bn"),
                    "mouza": dev_seed.get("mouza"),
                    "jl_no": normalize_digits(dev_seed.get("jl_no")),
                    "khatian_no": normalize_digits(dev_seed.get("khatian_no")),
                    "dag_no": normalize_digits(dev_seed.get("dag_no")),
                    "area_decimal": normalize_digits(dev_seed.get("area_decimal")),
                    "document_date": normalize_digits(dev_seed.get("document_date")),
                    "deed_no": normalize_digits(dev_seed.get("deed_no"))
                }
            }

    # If "custom" or noisy specimen requested for low-confidence simulation
    if sample_id == "custom" or not target_record:
        return {
            "extracted_fields": {
                "owner_name": None,
                "khatian_no": None,
                "dag_no": None,
                "area_decimal": None,
                "document_date": None,
                "deed_no": None,
                "raw_text": "[Unprocessed low-quality noisy demo specimen]"
            },
            "confidence_scores": {},
            "ocr_field_status": {
                "owner_name": "Needs review",
                "khatian_no": "Needs review",
                "dag_no": "Needs review",
                "area_decimal": "Needs review",
                "document_date": "Needs review",
                "deed_no": "Needs review"
            },
            "ocr_engine": "known_demo_specimen",
            "status": "low_confidence_specimen",
            "uploaded_file_sha256": "",
            "disclaimer": "DEMO DATA — not a legal verdict. Degraded specimen requires manual entry."
        }

    sample_filename = os.path.basename(target_record.get("sample_file", ""))
    if not sample_filename:
        raise FileNotFoundError(f"Record '{target_record.get('id')}' does not have a sample_file defined.")

    sample_path = os.path.abspath(os.path.join(SAMPLES_DIR, sample_filename))
    samples_dir_abs = os.path.abspath(SAMPLES_DIR)
    if not sample_path.startswith(samples_dir_abs + os.sep) and sample_path != samples_dir_abs:
        raise ValueError("Invalid sample path: potential path traversal detected.")

    if not os.path.isfile(sample_path):
        raise FileNotFoundError(f"Demo specimen file '{sample_filename}' was not found on disk.")

    with open(sample_path, "rb") as sf:
        file_bytes = sf.read()
    actual_sha256 = calculate_sha256(file_bytes)

    return {
        "extracted_fields": {
            "owner_name": target_record.get("owner_name_bn"),
            "khatian_no": str(target_record.get("khatian_no")),
            "dag_no": str(target_record.get("dag_no")),
            "area_decimal": str(target_record.get("area_decimal")),
            "document_date": target_record.get("document_date"),
            "deed_no": target_record.get("deed_no"),
            "raw_text": f"DEMO SPECIMEN: {target_record.get('id')}\nমালিক: {target_record.get('owner_name_bn')}\nখতিয়ান: {target_record.get('khatian_no')}\nদাগ: {target_record.get('dag_no')}\nজমির পরিমাণ: {target_record.get('area_decimal')} শতাংশ"
        },
        "confidence_scores": {},
        "ocr_field_status": {
            "owner_name": "Candidate extracted",
            "khatian_no": "Candidate extracted",
            "dag_no": "Candidate extracted",
            "area_decimal": "Candidate extracted",
            "document_date": "Candidate extracted",
            "deed_no": "Candidate extracted"
        },
        "ocr_engine": "known_demo_specimen",
        "status": "known_specimen",
        "sample_id": target_record.get("id"),
        "uploaded_file_sha256": actual_sha256,
        "disclaimer": "DEMO DATA — not a legal verdict",
        "normalized_fields": {
            "owner_name": target_record.get("owner_name_bn"),
            "khatian_no": normalize_digits(str(target_record.get("khatian_no"))),
            "dag_no": normalize_digits(str(target_record.get("dag_no"))),
            "area_decimal": normalize_digits(str(target_record.get("area_decimal"))),
            "document_date": normalize_digits(str(target_record.get("document_date"))),
            "deed_no": normalize_digits(str(target_record.get("deed_no"))),
        }
    }

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool]:
    """
    Extracts selectable text from PDF bytes using pypdf.
    Returns (extracted_text, is_scanned_or_empty).
    Cleans null characters and normalizes Bengali characters if text exists.
    """
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        full_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t and t.strip():
                # Clean null bytes and normalize ya variations
                clean_t = t.replace("\x00", "").replace("\u09af\u09bc", "\u09df")
                full_text.append(clean_t)
        combined = "\n".join(full_text).strip()
        if not combined:
            return "", True
        return combined, False
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {str(e)}")


def scan_uploaded_document(
    file_bytes: bytes,
    filename: str = ""
) -> Dict[str, Any]:
    """
    Primary processing path for citizen-uploaded documents.
    CRITICAL: Does NOT infer demo specimen results from arbitrary filenames.
    - If .txt: parses plain text with deterministic regex rules.
    - If .pdf: parses text-based PDFs via pypdf. Scanned/image-only PDFs return
      an honest engine_unavailable status without fabricating OCR fields.
    - If image (.png, .jpg, .jpeg): invokes Tesseract OCR if installed and available.
    - If Tesseract is unavailable: reports honestly without fabricating confidence scores,
      leaving candidate fields empty for manual citizen correction.
    """
    fn_lower = filename.lower()
    computed_hash = calculate_sha256(file_bytes)

    # 1. Plain text documents (.txt)
    if fn_lower.endswith(".txt"):
        try:
            text_content = file_bytes.decode("utf-8", errors="replace")
            res = extract_fields_from_text(text_content, ocr_engine="regex_text_parser")
            res["uploaded_file_sha256"] = computed_hash
            return res
        except Exception as e:
            return {
                "extracted_fields": {
                    "owner_name": None, "khatian_no": None, "dag_no": None,
                    "area_decimal": None, "document_date": None, "deed_no": None,
                    "raw_text": ""
                },
                "confidence_scores": {},
                "ocr_field_status": {k: "Needs review" for k in ["owner_name", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]},
                "ocr_engine": "text_decoder_error",
                "status": "error",
                "message": "Failed to decode text file. Please ensure valid UTF-8 encoding.",
                "uploaded_file_sha256": computed_hash,
                "disclaimer": "DEMO DATA — not a legal verdict"
            }

    # 2. PDF documents (.pdf)
    if fn_lower.endswith(".pdf"):
        try:
            pdf_text, is_scanned_or_empty = extract_text_from_pdf(file_bytes)
            if is_scanned_or_empty:
                # If PDF is scanned/image-based, attempt Tesseract OCR if available and page images exist
                is_avail, tess_bin, langs = is_tesseract_available()
                if is_avail and tess_bin:
                    try:
                        import pypdf
                        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                        ocr_texts = []
                        conf_list = []
                        langs_used = "ben+eng"
                        for page in reader.pages:
                            for img in page.images:
                                t, meta = run_tesseract_ocr(img.data, tess_bin, langs)
                                if t.strip():
                                    ocr_texts.append(t.strip())
                                if meta.get("overall_confidence"):
                                    conf_list.append(meta["overall_confidence"])
                                if meta.get("languages_used"):
                                    langs_used = meta["languages_used"]
                        if ocr_texts:
                            combined_ocr = "\n".join(ocr_texts)
                            avg_conf = sum(conf_list) / len(conf_list) if conf_list else None
                            res = extract_fields_from_text(
                                combined_ocr,
                                ocr_engine=f"tesseract_{langs_used}",
                                base_confidence=avg_conf
                            )
                            res["uploaded_file_sha256"] = computed_hash
                            res["status"] = "success"
                            return res
                    except Exception:
                        pass

                return {
                    "extracted_fields": {
                        "owner_name": None, "khatian_no": None, "dag_no": None,
                        "area_decimal": None, "document_date": None, "deed_no": None,
                        "raw_text": ""
                    },
                    "normalized_fields": {
                        "owner_name": None, "khatian_no": None, "dag_no": None,
                        "area_decimal": None, "document_date": None, "deed_no": None,
                    },
                    "confidence_scores": {},
                    "ocr_field_status": {k: "Needs review" for k in ["owner_name", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]},
                    "ocr_engine": "scanned_pdf_unsupported",
                    "status": "engine_unavailable",
                    "message": "The uploaded PDF appears to be a scanned image without embedded text. Direct OCR on scanned PDFs is not supported without rasterization. Please upload a high-resolution PNG/JPEG image or enter details manually.",
                    "uploaded_file_sha256": computed_hash,
                    "disclaimer": "DEMO DATA — not a legal verdict. Optical recognition engine unavailable for scanned PDFs; please enter values manually."
                }
            
            res = extract_fields_from_text(pdf_text, ocr_engine="pdf_text_extractor")
            res["uploaded_file_sha256"] = computed_hash
            res["status"] = "success"
            return res
        except Exception as e:
            return {
                "extracted_fields": {
                    "owner_name": None, "khatian_no": None, "dag_no": None,
                    "area_decimal": None, "document_date": None, "deed_no": None,
                    "raw_text": ""
                },
                "confidence_scores": {},
                "ocr_field_status": {k: "Needs review" for k in ["owner_name", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]},
                "ocr_engine": "pdf_parser_error",
                "status": "error",
                "message": "Failed to parse PDF document. It may be corrupt or encrypted.",
                "uploaded_file_sha256": computed_hash,
                "disclaimer": "DEMO DATA — not a legal verdict"
            }

    # 3. Image files (.png, .jpg, .jpeg)
    is_avail, tess_bin, langs = is_tesseract_available()

    if is_avail and tess_bin:
        try:
            processed_bytes = preprocess_image_for_ocr(file_bytes)
            ocr_text, ocr_meta = run_tesseract_ocr(processed_bytes, tess_bin, langs)
            overall_conf = ocr_meta.get("overall_confidence", 0.0)
            res = extract_fields_from_text(
                ocr_text,
                ocr_engine=f"tesseract_{ocr_meta.get('languages_used', 'ben+eng')}",
                base_confidence=overall_conf if overall_conf > 0 else None
            )
            res["uploaded_file_sha256"] = computed_hash
            res["status"] = "success"
            return res
        except Exception as e:
            return {
                "extracted_fields": {
                    "owner_name": None, "khatian_no": None, "dag_no": None,
                    "area_decimal": None, "document_date": None, "deed_no": None,
                    "raw_text": ""
                },
                "confidence_scores": {},
                "ocr_field_status": {k: "Needs review" for k in ["owner_name", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]},
                "ocr_engine": "tesseract_runtime_error",
                "status": "error",
                "message": "Optical character recognition execution encountered an error. Manual field entry is available.",
                "uploaded_file_sha256": computed_hash,
                "disclaimer": "DEMO DATA — not a legal verdict"
            }

    # 4. Honest fallback when Tesseract binary is not installed
    return {
        "extracted_fields": {
            "owner_name": None,
            "khatian_no": None,
            "dag_no": None,
            "area_decimal": None,
            "document_date": None,
            "deed_no": None,
            "raw_text": ""
        },
        "confidence_scores": {},
        "ocr_field_status": {
            "owner_name": "Needs review",
            "khatian_no": "Needs review",
            "dag_no": "Needs review",
            "area_decimal": "Needs review",
            "document_date": "Needs review",
            "deed_no": "Needs review"
        },
        "ocr_engine": "tesseract_unavailable",
        "status": "engine_unavailable",
        "message": "Tesseract OCR binary is not installed or available on PATH. Manual field entry is available.",
        "uploaded_file_sha256": computed_hash,
        "disclaimer": "DEMO DATA — not a legal verdict. Optical recognition engine unavailable; please enter values manually."
    }

def scan_document_bytes(file_bytes: bytes, filename: str = "") -> Dict[str, Any]:
    """
    Compatibility wrapper around scan_uploaded_document for backward compatibility.
    """
    return scan_uploaded_document(file_bytes, filename=filename)
