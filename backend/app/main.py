import os
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
from backend.app.ocr import scan_document_bytes

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

@app.post("/api/scan")
async def scan_document(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    """
    Scans uploaded document or demo sample and returns candidate fields with confidence.
    """
    filename = ""
    file_bytes = b""

    if file:
        filename = file.filename or ""
        file_bytes = await file.read()
    elif sample_id:
        filename = f"deed_{sample_id}.png"
        file_bytes = b"mock-sample-bytes"
    else:
        filename = "deed_sample_001.png"
        file_bytes = b"default-specimen"

    scan_result = scan_document_bytes(file_bytes, filename=filename)
    computed_hash = calculate_sha256(file_bytes) if file_bytes else ""
    scan_result["uploaded_file_sha256"] = computed_hash
    return scan_result

@app.post("/api/compare")
def compare_document(req: CompareRequest):
    """
    Compares extracted fields against reference dummy record.
    Returns strictly: Matched / Mismatch / Needs review / Not checked.
    """
    records = load_records()
    ref_record = next((r for r in records if r.get("id") == req.reference_record_id), None)
    
    if not ref_record:
        # Fallback to first demo record
        ref_record = records[0] if records else {}

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

@app.get("/api/passport/{plot_id}")
def get_plot_passport(plot_id: str, lang: str = Query("bn")):
    """
    Returns complete Plot Passport package for a plot.
    """
    records = load_records()
    rec = next((r for r in records if r.get("id") == plot_id), None)
    if not rec:
        rec = records[0]

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

    timeline = [
        {
            "year": "2018",
            "date": "2018-04-10",
            "title_bn": "আরএস/বিএস রেকর্ড অন্তর্ভুক্তি",
            "title_en": "RS/BS Record Inscription",
            "detail_bn": f"মৌজা: {rec.get('mouza')}, দাগ নং {rec.get('dag_no')}",
            "detail_en": f"Mouza: {rec.get('mouza')}, Dag No {rec.get('dag_no')}",
            "status_code": "RECORDED"
        },
        {
            "year": rec.get("document_date", "2021")[:4],
            "date": rec.get("document_date", "2021-04-12"),
            "title_bn": "সাব-কবলা দলিল রেজিস্ট্রেশন",
            "title_en": "Saf-Kabala Deed Registration",
            "detail_bn": f"দলিল নং: {rec.get('deed_no')}, ক্রেতা: {rec.get('owner_name_bn')}",
            "detail_en": f"Deed No: {rec.get('deed_no')}, Purchaser: {rec.get('owner_name_en')}",
            "status_code": "REGISTERED"
        },
        {
            "year": "2022",
            "date": "2022-08-18",
            "title_bn": "নামজারি ও জমা-খারিজ মঞ্জুর",
            "title_en": "Mutation & Separation Sanctioned",
            "detail_bn": f"নামজারি কেস: {rec.get('last_mutation_case')}, খতিয়ান: {rec.get('khatian_no')}",
            "detail_en": f"Mutation Case: {rec.get('last_mutation_case')}, Khatian: {rec.get('khatian_no')}",
            "status_code": "MUTATED"
        }
    ]

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
    """
    contents = await file.read()
    return check_file_integrity(contents, expected_hash)

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
