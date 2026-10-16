import re
import os
import shutil
import tempfile
import subprocess
from typing import Dict, Any, Optional, List, Tuple
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

def extract_fields_from_text(
    text: str,
    ocr_engine: str = "regex_text_parser",
    base_confidence: Optional[float] = None
) -> Dict[str, Any]:
    """
    Extracts candidate fields from document text with deterministic regex rules.
    Does NOT fabricate confidence scores. If base_confidence is provided (from Tesseract TSV),
    it is used; otherwise confidence reflects pattern matching certainty or is marked as uncalculated.
    """
    fields = {
        "owner_name": None,
        "khatian_no": None,
        "dag_no": None,
        "area_decimal": None,
        "document_date": None,
        "deed_no": None,
        "raw_text": text
    }

    confidences: Dict[str, float] = {}

    # 1. Deed No
    deed_match = re.search(r"(?:দলিল\s*নম্বর|দলিল\s*নং|Deed\s*No)[^\d০-৯:]*[:\s]+([\d০-৯\w/]+)", text, re.IGNORECASE)
    if deed_match:
        fields["deed_no"] = deed_match.group(1).strip()
        confidences["deed_no"] = base_confidence if base_confidence is not None else 0.90
    else:
        num_slash_year = re.search(r"\b(\d{3,5}/\d{4})\b", text)
        if num_slash_year:
            fields["deed_no"] = num_slash_year.group(1)
            confidences["deed_no"] = base_confidence if base_confidence is not None else 0.70

    # 2. Date
    date_match = re.search(r"(?:তারিখ|Date)[^\d০-৯:]*[:\s]+(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})", text, re.IGNORECASE)
    if date_match:
        fields["document_date"] = date_match.group(1).strip()
        confidences["document_date"] = base_confidence if base_confidence is not None else 0.88

    # 3. Owner Name
    name_match = re.search(r"(?:গ্রহীতা\s*/\s*মালিকের\s*নাম|মালিকের\s*নাম|মালিক|গ্রহীতা|দাতার\s*নাম|Owner\s*Name)\s*[:：\-—]\s*([^\n\r,]+)", text, re.IGNORECASE)
    if name_match:
        owner_candidate = name_match.group(1).strip()
        owner_candidate = re.sub(r"^(?:মালিকের\s*নাম|মালিক|গ্রহীতা)\s*[:：\-—]\s*", "", owner_candidate).strip()
        fields["owner_name"] = owner_candidate
        confidences["owner_name"] = base_confidence if base_confidence is not None else 0.85
    else:
        for line in text.splitlines():
            clean_line = line.strip()
            if any(p in clean_line for p in ["মোঃ", "মোহাম্মদ", "Md.", "Mohammad", "সুলতানা", "Sultana", "আব্দুল", "Abdul"]):
                fields["owner_name"] = clean_line
                confidences["owner_name"] = base_confidence if base_confidence is not None else 0.60
                break

    # 4. Khatian No
    khatian_match = re.search(r"(?:খতিয়ান\s*নম্বর|খতিয়ান\s*নং|খতিয়ান|Khatian\s*No)[^\d০-৯:]*[:\s]*([\d০-৯/]+)", text, re.IGNORECASE)
    if khatian_match:
        fields["khatian_no"] = khatian_match.group(1).strip()
        confidences["khatian_no"] = base_confidence if base_confidence is not None else 0.92

    # 5. Dag No
    dag_match = re.search(r"(?:দাগ\s*নম্বর|দাগ\s*নং|দাগ|Dag\s*No)[^\d০-৯:]*[:\s]*([\d০-৯/]+)", text, re.IGNORECASE)
    if dag_match:
        fields["dag_no"] = dag_match.group(1).strip()
        confidences["dag_no"] = base_confidence if base_confidence is not None else 0.91

    # 6. Area
    area_match = re.search(r"(?:জমির\s*পরিমাণ|জমির\s*রকমারি|পরিমাণ|Area)[^\d০-৯:]*[:\s]*([\d০-৯\.]+\s*(?:শতাংশ|শতক|decimal|একর|shotangsho)?)", text, re.IGNORECASE)
    if area_match:
        fields["area_decimal"] = area_match.group(1).strip()
        confidences["area_decimal"] = base_confidence if base_confidence is not None else 0.86

    # Convert confidences into Needs review flags if < 0.75
    field_status = {}
    for k in ["owner_name", "khatian_no", "dag_no", "area_decimal", "document_date", "deed_no"]:
        if fields[k] is None:
            field_status[k] = "Not checked"
        elif confidences.get(k, 0.0) < 0.75:
            field_status[k] = "Needs review"
        else:
            field_status[k] = "Candidate extracted"

    return {
        "extracted_fields": fields,
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

    sample_filename = target_record.get("sample_file", "")
    sample_path = os.path.join(SAMPLES_DIR, sample_filename)

    file_bytes = b""
    actual_sha256 = target_record.get("file_hash_sha256", "")
    if os.path.isfile(sample_path):
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
        "confidence_scores": {
            "owner_name": 0.95,
            "khatian_no": 0.96,
            "dag_no": 0.95,
            "area_decimal": 0.92,
            "document_date": 0.91,
            "deed_no": 0.97
        },
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
        "disclaimer": "DEMO DATA — not a legal verdict"
    }

def scan_uploaded_document(
    file_bytes: bytes,
    filename: str = ""
) -> Dict[str, Any]:
    """
    Primary processing path for citizen-uploaded documents.
    CRITICAL: Does NOT infer demo specimen results from arbitrary filenames.
    - If .txt: parses plain text with deterministic regex rules.
    - If image: invokes Tesseract OCR if installed and available.
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
                "message": f"Failed to decode text file: {str(e)}",
                "uploaded_file_sha256": computed_hash,
                "disclaimer": "DEMO DATA — not a legal verdict"
            }

    # 2. Image files (.png, .jpg, .jpeg)
    is_avail, tess_bin, langs = is_tesseract_available()

    if is_avail and tess_bin:
        try:
            ocr_text, ocr_meta = run_tesseract_ocr(file_bytes, tess_bin, langs)
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
                "message": f"Tesseract execution error: {str(e)}. Manual field entry is available.",
                "uploaded_file_sha256": computed_hash,
                "disclaimer": "DEMO DATA — not a legal verdict"
            }

    # 3. Honest fallback when Tesseract binary is not installed
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
