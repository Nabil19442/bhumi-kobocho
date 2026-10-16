import os
import re
import math
import urllib.parse
import logging
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict

logger = logging.getLogger("bhumi_app.main")

import sys
import types
from pathlib import Path

# Path and module aliasing normalization:
# Allows running both from repo root ('uvicorn backend.app.main:app')
# and from backend directory ('uvicorn app.main:app' as on Render)
_current_dir = Path(__file__).resolve().parent      # .../backend/app
_backend_dir = _current_dir.parent                  # .../backend
_repo_root = _backend_dir.parent                    # .../repo_root

for _p in (str(_backend_dir), str(_repo_root)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _backend_pkg = types.ModuleType("backend")
    _backend_pkg.__path__ = [str(_backend_dir)]
    sys.modules["backend"] = _backend_pkg

# Relative imports for app package modules
from .limiter import limiter
from .rules import compare_records
from .integrity import check_file_integrity, generate_record_qr_base64, calculate_sha256
from .guardian import (
    load_events,
    load_records,
    trigger_simulation_event,
    get_alerts,
    mark_alert_reviewed
)
from .explain import explain_comparison
from .ocr import (
    load_known_demo_specimen,
    scan_uploaded_document,
    scan_document_bytes
)
from .graph import build_relationship_graph

# ML imports via backend.ml to guarantee single shared module instance in sys.modules
try:
    from backend.ml.schemas import (
        LandPricePredictionRequest,
        LandPricePredictionResponse,
        ModelInfoResponse,
        MetadataResponse
    )
    from backend.ml.predict import (
        predict_land_price,
        get_model_info,
        get_metadata,
        ModelNotAvailableError
    )
except ImportError:
    from ml.schemas import (
        LandPricePredictionRequest,
        LandPricePredictionResponse,
        ModelInfoResponse,
        MetadataResponse
    )
    from ml.predict import (
        predict_land_price,
        get_model_info,
        get_metadata,
        ModelNotAvailableError
    )

# Sync sys.modules alias between backend.ml and ml so patches on either apply to both
if "backend.ml" in sys.modules and "ml" not in sys.modules:
    sys.modules["ml"] = sys.modules["backend.ml"]
if "backend.ml.predict" in sys.modules:
    sys.modules["ml.predict"] = sys.modules["backend.ml.predict"]
if "backend.ml.schemas" in sys.modules:
    sys.modules["ml.schemas"] = sys.modules["backend.ml.schemas"]

# Constants for strict API validation
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".txt"}
SHA256_HEX_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")

app = FastAPI(
    title="Bhumi Kobocho (ভূমি কবচ) API",
    description="Citizen-facing Demo: Plot Passport & Land Guardian. DEMO DATA — not a legal verdict.",
    version="1.0.0"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Sanitizes Pydantic validation errors before JSON serialization.
    Replaces raw non-compliant float values (NaN, Infinity, -Infinity) in 'input'
    with string representations so Starlette's JSONResponse does not crash.
    """
    sanitized_errors = []
    for err in exc.errors():
        err_copy = dict(err)
        val = err_copy.get("input")
        if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
            err_copy["input"] = str(val)
        sanitized_errors.append(err_copy)
    return JSONResponse(
        status_code=422,
        content={"detail": sanitized_errors}
    )

# Configurable CORS allowlist (SEC-04: No wildcard origins)
_DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
_ENV_CORS = os.getenv("CORS_ORIGINS", "")
if _ENV_CORS:
    ALLOWED_CORS_ORIGINS = [o.strip() for o in _ENV_CORS.split(",") if o.strip()]
else:
    ALLOWED_CORS_ORIGINS = _DEFAULT_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# SEC-07: Strict typed schema for citizen-uploaded or extracted document fields
class ExtractedDocumentData(BaseModel):
    owner_name: Optional[str] = Field(None, max_length=150)
    khatian_no: Optional[str] = Field(None, max_length=50)
    dag_no: Optional[str] = Field(None, max_length=50)
    area_decimal: Optional[str] = Field(None, max_length=50)
    document_date: Optional[str] = Field(None, max_length=50)
    deed_no: Optional[str] = Field(None, max_length=50)
    raw_text: Optional[str] = Field(None, max_length=30000)

    model_config = ConfigDict(extra="ignore")

class CompareRequest(BaseModel):
    reference_record_id: Optional[str] = Field("rec-demo-001", max_length=100)
    extracted_data: ExtractedDocumentData
    area_tolerance_decimal: Optional[float] = Field(0.05, ge=0.0, le=100.0)
    language: Optional[str] = Field("bn", max_length=10)

    model_config = ConfigDict(extra="ignore", allow_inf_nan=False)

class ExplainRequest(BaseModel):
    comparison_result: Dict[str, Any]
    language: Optional[str] = Field("bn", max_length=10)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Bhumi Kobocho (ভূমি কবচ)",
        "disclaimer": "DEMO DATA — not a legal verdict"
    }

@app.get("/api/records")
def list_records():
    records = load_records()
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "records": records
    }

@app.get("/api/records/graph")
def get_records_graph(record_id: Optional[str] = Query(None)):
    """
    Returns the synthetic land record relationship graph.
    - If record_id is provided, returns the focused graph for that record.
    - If record_id is unknown, returns HTTP 404.
    - If record_id is omitted, returns the complete relationship graph.
    """
    records = load_records()
    if record_id:
        rec_exists = any(r.get("id") == record_id for r in records)
        if not rec_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Record '{record_id}' not found."
            )
    events = load_events()
    return build_relationship_graph(records, events=events, focus_record_id=record_id)

@app.get("/api/records/{record_id}")
def get_record(record_id: str):
    records = load_records()
    rec = next((r for r in records if r.get("id") == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Demo record not found")
    return rec

async def read_upload_file_safely(
    file: UploadFile,
    max_size: int = MAX_UPLOAD_SIZE,
    chunk_size: int = 64 * 1024,
    request: Optional[Request] = None
) -> bytes:
    """
    Reads an uploaded file incrementally in chunks without buffering unbounded
    payloads into memory. Rejects oversized uploads immediately with HTTP 413.
    Safely cleans up underlying files on completion or error.
    """
    # 1. Content-Length header early rejection if declared oversized
    if request:
        req_cl = request.headers.get("content-length")
        if req_cl:
            try:
                cl_int = int(req_cl)
                if cl_int > max_size:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Upload rejected: Content-Length {cl_int} exceeds maximum allowed limit of {max_size // (1024 * 1024)} MB."
                    )
            except ValueError:
                pass

    part_cl = file.headers.get("content-length")
    if part_cl:
        try:
            cl_int = int(part_cl)
            if cl_int > max_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"Upload rejected: Content-Length {cl_int} exceeds maximum allowed limit of {max_size // (1024 * 1024)} MB."
                )
        except ValueError:
            pass

    # 2. Incremental chunked streaming read
    chunks = []
    total_bytes = 0
    try:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds maximum allowed limit of {max_size // (1024 * 1024)} MB."
                )
            chunks.append(chunk)
        return b"".join(chunks)
    finally:
        await file.close()

def validate_file_content(file_bytes: bytes, filename: str) -> None:
    """
    Validates uploaded file size, supported extension, and content signatures (magic bytes).
    Rejects empty files, files > 10MB (HTTP 413), unsupported extensions, and content signature mismatches.
    """
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty (0 bytes)."
        )
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds maximum allowed limit of 10 MB."
        )

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: .png, .jpg, .jpeg, .pdf, .txt."
        )

    # Validate actual file content signatures (do not trust extension alone)
    if ext == ".png":
        if not file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid PNG image signature."
            )
    elif ext in [".jpg", ".jpeg"]:
        if not file_bytes.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid JPEG image signature."
            )
    elif ext == ".pdf":
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid PDF document signature."
            )
    elif ext == ".txt":
        if b"\x00" in file_bytes[:4096]:
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid plain text document."
            )

@app.post("/api/scan")
async def scan_document(
    request: Request,
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    """
    Scans uploaded document or loads demo specimen.
    - Explicitly distinguishes known demo specimens from arbitrary user-uploaded files.
    - Known specimens are loaded from their actual files under backend/data/samples/.
    - Arbitrary uploads are streamed and validated (non-empty, <=10MB, supported format, content signatures).
    - General upload path never relies on filename-based inference.
    - Rate-limited to protect OCR resources.
    """
    limiter.check_rate_limit(request, "scan", max_requests=30, window_seconds=60)

    # 1. Explicitly selected demo specimen
    if sample_id and sample_id.strip():
        try:
            return load_known_demo_specimen(sample_id.strip())
        except (FileNotFoundError, ValueError) as e:
            logger.warning("Demo specimen request failed for sample_id '%s': %s", sample_id, e)
            raise HTTPException(
                status_code=404,
                detail=f"Requested demo specimen is not available."
            )

    # 2. Uploaded user file
    if file is not None:
        filename = file.filename or ""
        file_bytes = await read_upload_file_safely(file, max_size=MAX_UPLOAD_SIZE, request=request)
        validate_file_content(file_bytes, filename)
        return scan_uploaded_document(file_bytes, filename=filename)

    # 3. Neither provided
    raise HTTPException(
        status_code=400,
        detail="Either a document file or a valid demo sample_id must be provided."
    )

@app.post("/api/compare")
def compare_document(req: CompareRequest):
    """
    Compares extracted fields against reference dummy record.
    Returns strictly: Matched / Mismatch / Needs review / Not checked.
    Returns HTTP 404 for unknown reference record IDs.
    """
    records = load_records()
    ref_record = next((r for r in records if r.get("id") == req.reference_record_id), None)
    
    if not ref_record:
        raise HTTPException(
            status_code=404,
            detail=f"Reference record '{req.reference_record_id}' not found."
        )

    result = compare_records(
        extracted_data=req.extracted_data.model_dump(),
        reference_data=ref_record,
        area_tolerance_decimal=req.area_tolerance_decimal or 0.05
    )

    # Attach explanation
    explanation = explain_comparison(result, lang=req.language or "bn")
    result["explanation"] = explanation
    result["reference_record"] = ref_record
    return result

def build_synthetic_timeline(rec: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Derives chronological timeline events strictly from fields present in the synthetic record.
    Never invents dates, historical events, or mutation records.
    Every event is explicitly marked with is_synthetic: True and the demo disclaimer.
    """
    timeline: List[Dict[str, Any]] = []

    # 1. Cadastral Survey / Baseline Record (if khatian_no or dag_no exists)
    dag_no = rec.get("dag_no")
    khatian_no = rec.get("khatian_no")
    mouza = rec.get("mouza")
    if dag_no or khatian_no:
        timeline.append({
            "year": "জরিপ ভিত্তি (Baseline)",
            "date": "নির্দিষ্ট তারিখ অপ্রাপ্য (Date unrecorded)",
            "title_bn": "খতিয়ান ও দাগ রেকর্ড অন্তর্ভুক্তি",
            "title_en": "Cadastral Survey Inscription",
            "detail_bn": f"মৌজা: {mouza or 'অপ্রাপ্য'}, দাগ নং {dag_no or 'অপ্রাপ্য'}, খতিয়ান: {khatian_no or 'অপ্রাপ্য'}",
            "detail_en": f"Mouza: {mouza or 'Unavailable'}, Dag No {dag_no or 'Unavailable'}, Khatian: {khatian_no or 'Unavailable'}",
            "status_code": "RECORDED",
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict"
        })

    # 2. Saf-Kabala Deed Registration (if document_date or deed_no exists)
    doc_date = rec.get("document_date")
    deed_no = rec.get("deed_no")
    if doc_date or deed_no:
        year_val = "তারিখ অপ্রাপ্য (Unavailable)"
        date_val = "তারিখ অপ্রাপ্য (Date Unavailable)"
        if doc_date and len(str(doc_date)) >= 4:
            year_val = str(doc_date)[:4]
            date_val = str(doc_date)
        elif deed_no and "/" in str(deed_no):
            parts = str(deed_no).split("/")
            if len(parts) > 1 and parts[-1].isdigit() and len(parts[-1]) == 4:
                year_val = parts[-1]

        timeline.append({
            "year": year_val,
            "date": date_val,
            "title_bn": "সাব-কবলা দলিল রেজিস্ট্রেশন",
            "title_en": "Saf-Kabala Deed Registration",
            "detail_bn": f"দলিল নং: {deed_no or 'অপ্রাপ্য'}, ক্রেতা: {rec.get('owner_name_bn') or 'অপ্রাপ্য'}",
            "detail_en": f"Deed No: {deed_no or 'Unavailable'}, Purchaser: {rec.get('owner_name_en') or 'Unavailable'}",
            "status_code": "REGISTERED",
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict"
        })

    # 3. Mutation Case Sanction (only if last_mutation_case is present)
    mutation_case = rec.get("last_mutation_case")
    if mutation_case and str(mutation_case).strip():
        # Derive year if encoded in case number (e.g. MUT-2022-9014 -> 2022)
        match = re.search(r"\b(\d{4})\b", str(mutation_case))
        mutation_year = match.group(1) if match else "অপ্রাপ্য (Unavailable)"
        mutation_date = f"কেস রেকর্ড {mutation_year}" if match else "তারিখ অপ্রাপ্য (Date Unavailable)"

        timeline.append({
            "year": mutation_year,
            "date": mutation_date,
            "title_bn": "নামজারি ও জমা-খারিজ মঞ্জুর",
            "title_en": "Mutation & Separation Sanctioned",
            "detail_bn": f"নামজারি কেস: {mutation_case}, খতিয়ান: {khatian_no or 'অপ্রাপ্য'}",
            "detail_en": f"Mutation Case: {mutation_case}, Khatian: {khatian_no or 'Unavailable'}",
            "status_code": "MUTATED",
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict"
        })

    return timeline

@app.get("/api/passport/{plot_id}")
def get_plot_passport(plot_id: str, lang: str = Query("bn")):
    """
    Returns complete Plot Passport package for a plot.
    Returns HTTP 404 for unknown plot IDs.
    """
    records = load_records()
    rec = next((r for r in records if r.get("id") == plot_id), None)
    if not rec:
        raise HTTPException(
            status_code=404,
            detail=f"Plot record '{plot_id}' not found."
        )

    # Generate comparison with self as baseline
    comparison = compare_records(
        extracted_data={
            "owner_name": rec.get("owner_name_bn"),
            "khatian_no": rec.get("khatian_no"),
            "dag_no": rec.get("dag_no"),
            "area_decimal": rec.get("area_decimal"),
            "document_date": rec.get("document_date")
        },
        reference_data=rec
    )

    qr_code_base64 = generate_record_qr_base64(rec)
    explanation = explain_comparison(comparison, lang=lang)
    timeline = build_synthetic_timeline(rec)

    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "plot_id": plot_id,
        "record": rec,
        "qr_code_base64": qr_code_base64,
        "timeline": timeline,
        "comparison_summary": comparison,
        "explanation": explanation,
        "not_checked_items": comparison["not_checked_items"],
        "next_official_steps": comparison["next_official_steps"]
    }

@app.post("/api/integrity/check")
async def check_integrity(
    request: Request,
    file: UploadFile = File(...),
    expected_hash: str = Form(...)
):
    """
    Checks uploaded file byte integrity via SHA-256 against expected hash.
    Status output: 'Unchanged' or 'File content changed'.
    Enforces empty file rejection, 10MB limit (HTTP 413), supported formats, and 64-hex hash validation.
    Rate-limited to protect hashing resources.
    """
    limiter.check_rate_limit(request, "integrity_check", max_requests=30, window_seconds=60)

    # 1. Validate SHA-256 format (exactly 64 hexadecimal characters)
    clean_hash = (expected_hash or "").strip().lower()
    if not SHA256_HEX_REGEX.match(clean_hash):
        raise HTTPException(
            status_code=400,
            detail="Invalid SHA-256 hash format. Expected exactly 64 hexadecimal characters."
        )

    # 2. Stream and validate byte contents and signature
    filename = file.filename or ""
    contents = await read_upload_file_safely(file, max_size=MAX_UPLOAD_SIZE, request=request)
    validate_file_content(contents, filename)

    return check_file_integrity(contents, clean_hash)

def validate_qr_base_url(base_url: Optional[str]) -> str:
    """
    Validates QR base_url against approved frontend origins.
    Rejects unexpected external origins, malformed URLs, credentials, or invalid schemes with HTTP 400.
    Normalizes trailing slashes safely.
    """
    if not base_url or not base_url.strip():
        return os.environ.get("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    
    clean_url = base_url.strip()

    try:
        parsed = urllib.parse.urlparse(clean_url)
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed base_url parameter.")

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid URL scheme '{parsed.scheme}'. Only http and https schemes are permitted."
        )

    if parsed.username or parsed.password:
        raise HTTPException(
            status_code=400,
            detail="URL credentials (userinfo) are not permitted in base_url."
        )

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        raise HTTPException(status_code=400, detail="Missing hostname in base_url.")

    allowed_hosts = {"localhost", "127.0.0.1", "bhumikobocho.bangladesh.gov"}
    frontend_env = os.getenv("FRONTEND_BASE_URL")
    if frontend_env:
        try:
            fh = urllib.parse.urlparse(frontend_env).hostname
            if fh:
                allowed_hosts.add(fh.lower())
        except Exception:
            pass

    for orig in ALLOWED_CORS_ORIGINS:
        try:
            oh = urllib.parse.urlparse(orig).hostname
            if oh:
                allowed_hosts.add(oh.lower())
        except Exception:
            pass

    if hostname not in allowed_hosts and not hostname.endswith(".bangladesh.gov"):
        raise HTTPException(
            status_code=400,
            detail=f"Origin host '{hostname}' is not in the approved frontend allowlist."
        )

    port_part = f":{parsed.port}" if parsed.port and (
        (parsed.scheme == "http" and parsed.port != 80) or
        (parsed.scheme == "https" and parsed.port != 443)
    ) else ""
    path_part = parsed.path.rstrip("/")
    return f"{parsed.scheme}://{hostname}{port_part}{path_part}".rstrip("/")

@app.get("/api/integrity/qr/{record_id}")
def get_integrity_qr(record_id: str, base_url: Optional[str] = Query(None)):
    clean_base_url = validate_qr_base_url(base_url)

    records = load_records()
    rec = next((r for r in records if r.get("id") == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    
    verification_url = f"{clean_base_url}/verify/{record_id}"
    qr_b64 = generate_record_qr_base64(rec, base_url=clean_base_url)
    
    return {
        "record_id": record_id,
        "qr_base64": qr_b64,
        "qr_code_base64": qr_b64,
        "verification_url": verification_url,
        "stored_hash": rec.get("file_hash_sha256"),
        "disclaimer": "DEMO DATA — not a legal verdict"
    }

@app.get("/api/records/verify/{record_id}")
def verify_record_public(record_id: str):
    """
    Narrowly-scoped read-only endpoint for public demo QR verification.
    Returns safe public metadata, reference hash, and deterministic graph findings.
    Excludes private personal identifiers (e.g., dummy_nid_last4).
    Returns HTTP 404 for unknown record IDs.
    """
    records = load_records()
    rec = next((r for r in records if r.get("id") == record_id), None)
    if not rec:
        raise HTTPException(
            status_code=404,
            detail=f"Record '{record_id}' not found."
        )

    # Public metadata omitting dummy_nid_last4
    public_metadata = {
        "id": rec["id"],
        "is_synthetic": True,
        "label": f"দলিল {rec.get('deed_no', 'N/A')} (দাগ {rec.get('dag_no', 'N/A')})",
        "deed_no": rec.get("deed_no"),
        "document_date": rec.get("document_date"),
        "mouza": rec.get("mouza"),
        "district": rec.get("district"),
        "upazila": rec.get("upazila"),
        "dag_no": str(rec.get("dag_no", "")),
        "khatian_no": str(rec.get("khatian_no", "")),
        "area_decimal": rec.get("area_decimal"),
        "land_class": rec.get("land_class"),
        "owner_name_bn": rec.get("owner_name_bn"),
        "owner_name_en": rec.get("owner_name_en"),
        "last_mutation_case": rec.get("last_mutation_case"),
        "prior_deed_no": rec.get("prior_deed_no"),
        "parent_khatian_no": rec.get("parent_khatian_no")
    }

    # Reference SHA-256 hash
    reference_hash = rec.get("file_hash_sha256")

    # Load relevant deterministic graph findings for this record
    events = load_events()
    graph = build_relationship_graph(records, events=events, focus_record_id=record_id)
    relevant_findings = graph.get("findings", [])

    from datetime import datetime, timezone
    current_time_iso = datetime.now(timezone.utc).isoformat()

    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "disclaimer_bn": "ডেমো ডেটা — এটি আইনি সিদ্ধান্ত নয়। কিউআর কোড বা হ্যাশ ম্যাচ জমির মালিকানা বা দলিলের আইনগত সত্যতা প্রমাণ করে না।",
        "record_id": record_id,
        "is_synthetic": True,
        "public_metadata": public_metadata,
        "reference_sha256": reference_hash,
        "file_hash_status": "Not checked",
        "file_hash_notice": "ফাইল আপলোড করে বাইট স্তরে হ্যাশ মেলানো না হলে হ্যাশ স্ট্যাটাস 'Not checked' থাকবে।",
        "graph_findings": relevant_findings,
        "verification_timestamp": current_time_iso,
        "allowed_statuses": ["Matched", "Mismatch", "Needs review", "Not checked"]
    }

@app.get("/api/guardian/events")
def list_simulation_events():
    events = load_events()
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "events": events
    }

def verify_guardian_key(x_guardian_key: Optional[str] = Header(None)) -> str:
    """
    SEC-06: Validates demo admin key for mutating in-memory simulation demo state.
    Configurable via GUARDIAN_API_KEY environment variable.
    """
    expected_key = os.getenv("GUARDIAN_API_KEY", "demo-zenox-2026")
    if not x_guardian_key or x_guardian_key.strip() != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Missing or invalid X-Guardian-Key header for simulation state mutation."
        )
    return x_guardian_key

@app.post("/api/guardian/simulate/{event_id}")
def simulate_guardian_event(
    event_id: str,
    request: Request,
    _auth: str = Depends(verify_guardian_key)
):
    """
    Simulates an event on demo data and emits a SIMULATED alert.
    Requires X-Guardian-Key header authentication and is rate limited.
    """
    limiter.check_rate_limit(request, "guardian_simulate", max_requests=20, window_seconds=60)
    try:
        alert = trigger_simulation_event(event_id)
        return alert
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/guardian/alerts")
def get_guardian_alerts():
    alerts = get_alerts()
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "alerts": alerts
    }

@app.post("/api/guardian/alerts/{alert_id}/review")
def review_guardian_alert(
    alert_id: str,
    request: Request,
    _auth: str = Depends(verify_guardian_key)
):
    """
    Marks simulated demo alert as reviewed.
    Requires X-Guardian-Key header authentication and is rate limited.
    """
    limiter.check_rate_limit(request, "guardian_review", max_requests=30, window_seconds=60)
    reviewed = mark_alert_reviewed(alert_id)
    if not reviewed:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "alert": reviewed
    }


# ============================================================================
# RURAL LAND PRICE INTELLIGENCE (SYNTHETIC ML MODULE)
# ============================================================================

@app.get("/api/land-price/health")
def land_price_health():
    """
    Health check for the Land Price Intelligence module.
    Returns status of the model artifact without running blocking inference.
    """
    try:
        info = get_model_info()
        return {
            "status": "healthy",
            "model_status": "loaded",
            "model_name": info.algorithm,
            "dataset_version": info.dataset_version,
            "disclaimer": "SYNTHETIC DATA — not a real market valuation"
        }
    except ModelNotAvailableError as e:
        logger.warning("Land price model not available in health check: %s", e)
        return {
            "status": "degraded",
            "model_status": "unavailable",
            "message": "Land price model artifact is currently unavailable or integrity check failed.",
            "disclaimer": "SYNTHETIC DATA — not a real market valuation"
        }


@app.get("/api/land-price/metadata", response_model=MetadataResponse)
def land_price_metadata():
    """
    Returns allowable categories, valid numeric ranges, synthetic location hierarchies,
    and synthetic provenance statements for UI form binding and API discovery.
    """
    return get_metadata()


@app.get("/api/land-price/model-info", response_model=ModelInfoResponse)
def land_price_model_info():
    """
    Returns full evaluation metrics, candidate benchmark comparisons, baseline performance,
    feature schemas, and explicit limitations from the trained ML pipeline artifact.
    """
    try:
        return get_model_info()
    except ModelNotAvailableError as e:
        logger.warning("Land price model unavailable: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Land price model is unavailable: artifact missing or integrity check failed."
        )


@app.post("/api/land-price/predict", response_model=LandPricePredictionResponse)
def land_price_predict(prediction_req: LandPricePredictionRequest, request: Request):
    """
    Generates an ML-driven synthetic land price prediction based on rural parcel features.
    Strictly verifies unit consistency: total_price = price_per_decimal * land_area.
    Returns empirical validation uncertainty intervals and bilingual disclaimers.
    Rate limited to prevent CPU resource exhaustion.
    """
    limiter.check_rate_limit(request, "land_price_predict", max_requests=60, window_seconds=60)
    try:
        return predict_land_price(prediction_req)
    except ModelNotAvailableError as e:
        logger.warning("Land price model unavailable for prediction: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Land price model is unavailable. No fabricated estimate will be provided."
        )
    except Exception as e:
        logger.error("Unexpected error during land price prediction: %s", e, exc_info=True)
        raise HTTPException(
            status_code=400,
            detail="Land price prediction failed due to an inference error."
        )

