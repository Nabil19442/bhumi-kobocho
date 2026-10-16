import os
import re
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.app.rules import compare_records
from backend.app.integrity import check_file_integrity, generate_record_qr_base64, calculate_sha256
from backend.app.guardian import (
    load_events,
    load_records,
    trigger_simulation_event,
    get_alerts,
    mark_alert_reviewed
)
from backend.app.explain import explain_comparison
from backend.app.ocr import (
    load_known_demo_specimen,
    scan_uploaded_document,
    scan_document_bytes
)

# Constants for strict API validation
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".txt"}
SHA256_HEX_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")

app = FastAPI(
    title="Bhumi Kobocho (ভূমি কবচ) API",
    description="Citizen-facing Demo: Plot Passport & Land Guardian. DEMO DATA — not a legal verdict.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    reference_record_id: Optional[str] = "rec-demo-001"
    extracted_data: Dict[str, Any]
    area_tolerance_decimal: Optional[float] = 0.05
    language: Optional[str] = "bn"

class ExplainRequest(BaseModel):
    comparison_result: Dict[str, Any]
    language: Optional[str] = "bn"

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

@app.get("/api/records/{record_id}")
def get_record(record_id: str):
    records = load_records()
    rec = next((r for r in records if r.get("id") == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Demo record not found")
    return rec

def validate_file_content(file_bytes: bytes, filename: str) -> None:
    """
    Validates uploaded file size, supported extension, and content signatures (magic bytes).
    Rejects empty files, files > 10MB, unsupported extensions, and content signature mismatches.
    """
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty (0 bytes)."
        )
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
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
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    """
    Scans uploaded document or loads demo specimen.
    - Explicitly distinguishes known demo specimens from arbitrary user-uploaded files.
    - Known specimens are loaded from their actual files under backend/data/samples/.
    - Arbitrary uploads are validated (non-empty, <=10MB, supported format, content signatures).
    - General upload path never relies on filename-based inference.
    """
    # 1. Explicitly selected demo specimen
    if sample_id and sample_id.strip():
        try:
            return load_known_demo_specimen(sample_id.strip())
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))

    # 2. Uploaded user file
    if file is not None:
        filename = file.filename or ""
        file_bytes = await file.read()
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
        extracted_data=req.extracted_data,
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
    file: UploadFile = File(...),
    expected_hash: str = Form(...)
):
    """
    Checks uploaded file byte integrity via SHA-256 against expected hash.
    Status output: 'Unchanged' or 'File content changed'.
    Enforces empty file rejection, 10MB limit, supported formats, and 64-hex hash validation.
    """
    # 1. Validate SHA-256 format (exactly 64 hexadecimal characters)
    clean_hash = (expected_hash or "").strip().lower()
    if not SHA256_HEX_REGEX.match(clean_hash):
        raise HTTPException(
            status_code=400,
            detail="Invalid SHA-256 hash format. Expected exactly 64 hexadecimal characters."
        )

    # 2. Read and validate byte contents and signature
    filename = file.filename or ""
    contents = await file.read()
    validate_file_content(contents, filename)

    return check_file_integrity(contents, clean_hash)

@app.get("/api/integrity/qr/{record_id}")
def get_integrity_qr(record_id: str):
    records = load_records()
    rec = next((r for r in records if r.get("id") == record_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    qr_b64 = generate_record_qr_base64(rec)
    return {
        "record_id": record_id,
        "qr_base64": qr_b64,
        "stored_hash": rec.get("file_hash_sha256"),
        "disclaimer": "DEMO DATA — not a legal verdict"
    }

@app.get("/api/guardian/events")
def list_simulation_events():
    events = load_events()
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "events": events
    }

@app.post("/api/guardian/simulate/{event_id}")
def simulate_guardian_event(event_id: str):
    """
    Simulates an event on demo data and emits a SIMULATED alert.
    """
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
def review_guardian_alert(alert_id: str):
    reviewed = mark_alert_reviewed(alert_id)
    if not reviewed:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "disclaimer": "DEMO DATA — not a legal verdict",
        "alert": reviewed
    }
