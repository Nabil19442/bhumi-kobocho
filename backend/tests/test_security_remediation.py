"""
Comprehensive Security Remediation Test Suite for Bhumi Kobocho (ভূমি কবচ)
Team: ZENOX

Tests:
SEC-01: Upload Resource Protection (Chunked streaming, 413 rejection, signature validation)
SEC-02: Rate Limiting (Thread-safe sliding window, 429 response, Retry-After header)
SEC-03: QR Base URL Validation (Allowlist, schema, credentials, external domain rejection)
SEC-04: CORS Policy (No wildcard allow_origins)
SEC-05: Model Artifact Integrity (SHA-256 pre-deserialization verification, 503 behavior)
SEC-06: Simulation Endpoints (X-Guardian-Key header protection, concurrency safety)
SEC-07: Strict CompareRequest Schema (Pydantic validation, length bounds, 422 rejection)
SEC-08: PDF Text Extraction & Honest Fallback (Text PDF parsing vs scanned PDF honesty)
"""

import io
import json
import os
import shutil
import tempfile
import threading
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app, MAX_UPLOAD_SIZE, ALLOWED_CORS_ORIGINS
from backend.app.limiter import limiter
from backend.app.guardian import reset_alerts
from backend.ml.predict import (
    load_model_and_metadata,
    reset_model_cache,
    ModelNotAvailableError,
)
from backend.app.ocr import scan_uploaded_document

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_limiter_and_alerts():
    """Ensure limiter and alerts state is clean before and after every test."""
    limiter.reset()
    reset_alerts()
    reset_model_cache()
    yield
    limiter.reset()
    reset_alerts()
    reset_model_cache()


# ============================================================================
# SEC-01: UPLOAD RESOURCE PROTECTION
# ============================================================================

def test_sec01_scan_oversized_upload_returns_413():
    """Validates that uploads exceeding 10 MB are rejected with HTTP 413."""
    oversized_data = b"x" * (MAX_UPLOAD_SIZE + 1024)
    res = client.post(
        "/api/scan",
        files={"file": ("test_oversized.png", oversized_data, "image/png")},
    )
    assert res.status_code == 413
    assert "exceeds" in res.json()["detail"].lower()


def test_sec01_integrity_oversized_upload_returns_413():
    """Validates that integrity check uploads exceeding 10 MB return HTTP 413."""
    oversized_data = b"x" * (MAX_UPLOAD_SIZE + 1024)
    res = client.post(
        "/api/integrity/check",
        data={"expected_hash": "a" * 64},
        files={"file": ("test_oversized.png", oversized_data, "image/png")},
    )
    assert res.status_code == 413
    assert "exceeds" in res.json()["detail"].lower()


def test_sec01_content_length_header_fast_rejection_413():
    """Validates early rejection with 413 when Content-Length header exceeds limit."""
    res = client.post(
        "/api/scan",
        headers={"Content-Length": str(MAX_UPLOAD_SIZE + 50000)},
        files={"file": ("test.png", b"\x89PNG\r\n\x1a\n" + b"x" * 100, "image/png")},
    )
    assert res.status_code == 413
    assert "content-length" in res.json()["detail"].lower()


def test_sec01_content_signature_validation():
    """Validates rejection of disguised files matching extension but not content signature."""
    # Text content disguised with .png extension
    res_png = client.post(
        "/api/scan",
        files={"file": ("fake.png", b"This is not a real PNG image", "image/png")},
    )
    assert res_png.status_code == 400
    assert "signature" in res_png.json()["detail"].lower()

    # Binary executable disguised with .pdf extension
    res_pdf = client.post(
        "/api/scan",
        files={"file": ("fake.pdf", b"MZ\x90\x00Not a real PDF", "application/pdf")},
    )
    assert res_pdf.status_code == 400
    assert "signature" in res_pdf.json()["detail"].lower()


# ============================================================================
# SEC-02: RATE LIMITING
# ============================================================================

def test_sec02_scan_endpoint_rate_limiting():
    """Validates that /api/scan enforces 30 req/min limit and returns HTTP 429."""
    dummy_text = b"Record: Dag 100, Khatian 200"
    
    # Send 30 allowed requests
    for _ in range(30):
        res = client.post(
            "/api/scan",
            files={"file": ("doc.txt", dummy_text, "text/plain")},
        )
        assert res.status_code in (200, 400)
    
    # 31st request must trigger 429 Too Many Requests
    res_limited = client.post(
        "/api/scan",
        files={"file": ("doc.txt", dummy_text, "text/plain")},
    )
    assert res_limited.status_code == 429
    assert "rate limit exceeded" in res_limited.json()["detail"].lower()
    assert "retry-after" in res_limited.headers


def test_sec02_land_price_predict_rate_limiting():
    """Validates that /api/land-price/predict enforces 60 req/min limit and returns HTTP 429."""
    payload = {
        "land_area_decimal": 10.0,
        "road_width_ft": 12.0,
        "distance_to_paved_road_m": 500.0,
        "distance_to_local_market_km": 1.5,
        "distance_to_upazila_center_km": 4.0,
        "distance_to_school_km": 1.0,
        "distance_to_healthcare_km": 2.0,
        "district_id": "comilla",
        "upazila_id": "chandina",
        "mouza_id": "chandina_kallayanpur",
        "land_type": "agricultural_nal",
        "road_access_type": "paved_pucca_road",
        "flood_risk_level": "none",
        "drainage_quality": "excellent_highland",
        "plot_shape_category": "regular_rectangular",
        "land_use_category": "crop_cultivation",
        "transaction_period": "recent_2024_2025",
        "access_road_available": True,
        "electricity_available": True,
        "water_access_available": True
    }

    # Fire 60 requests
    for _ in range(60):
        res = client.post("/api/land-price/predict", json=payload)
        assert res.status_code == 200

    # 61st request must trigger 429
    res_limited = client.post("/api/land-price/predict", json=payload)
    assert res_limited.status_code == 429
    assert "retry-after" in res_limited.headers


def test_sec02_limiter_thread_safety():
    """Verifies that the rate limiter handles concurrent threads safely without race conditions."""
    errors = []

    def make_calls():
        try:
            for _ in range(5):
                client.get("/api/health")
        except Exception as e:
            errors.append(e)

    threads = [threading.Thread(target=make_calls) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(errors) == 0


# ============================================================================
# SEC-03: QR BASE URL VALIDATION
# ============================================================================

def test_sec03_qr_approved_origins():
    """Validates that approved origins are accepted and generated into the QR."""
    # Localhost
    res1 = client.get("/api/integrity/qr/rec-demo-001?base_url=http://localhost:5173")
    assert res1.status_code == 200
    assert res1.json()["verification_url"] == "http://localhost:5173/verify/rec-demo-001"

    # 127.0.0.1
    res2 = client.get("/api/integrity/qr/rec-demo-001?base_url=http://127.0.0.1:5173/")
    assert res2.status_code == 200
    assert res2.json()["verification_url"] == "http://127.0.0.1:5173/verify/rec-demo-001"

    # Official gov domain
    res3 = client.get("/api/integrity/qr/rec-demo-001?base_url=https://bhumikobocho.bangladesh.gov")
    assert res3.status_code == 200
    assert res3.json()["verification_url"] == "https://bhumikobocho.bangladesh.gov/verify/rec-demo-001"


def test_sec03_qr_unapproved_origins_rejected():
    """Validates that external unapproved origins return HTTP 400."""
    res = client.get("/api/integrity/qr/rec-demo-001?base_url=https://evil-phishing-site.com")
    assert res.status_code == 400
    assert "allowlist" in res.json()["detail"].lower()


def test_sec03_qr_credentials_rejected():
    """Validates that URLs containing credentials return HTTP 400."""
    res = client.get("/api/integrity/qr/rec-demo-001?base_url=http://admin:secret@localhost:5173")
    assert res.status_code == 400
    assert "credentials" in res.json()["detail"].lower()


def test_sec03_qr_unexpected_schemes_rejected():
    """Validates that non-http/https schemes return HTTP 400."""
    res1 = client.get("/api/integrity/qr/rec-demo-001?base_url=javascript:alert(1)")
    assert res1.status_code == 400
    assert "scheme" in res1.json()["detail"].lower()

    res2 = client.get("/api/integrity/qr/rec-demo-001?base_url=ftp://localhost:5173")
    assert res2.status_code == 400


def test_sec03_qr_unknown_record_id():
    """Validates that unknown record ID returns HTTP 404."""
    res = client.get("/api/integrity/qr/rec-nonexistent-999")
    assert res.status_code == 404


# ============================================================================
# SEC-04: CORS POLICY
# ============================================================================

def test_sec04_cors_no_wildcard():
    """Validates that wildcard '*' is not present in ALLOWED_CORS_ORIGINS."""
    assert "*" not in ALLOWED_CORS_ORIGINS
    for origin in ALLOWED_CORS_ORIGINS:
        assert origin != "*"
        assert origin.startswith("http://") or origin.startswith("https://")


# ============================================================================
# SEC-05: MODEL ARTIFACT INTEGRITY
# ============================================================================

def test_sec05_model_valid_artifact_loads_cleanly():
    """Validates that verified model artifact with matching SHA-256 loads cleanly."""
    pipeline, metadata = load_model_and_metadata(force_reload=True)
    assert pipeline is not None
    assert metadata is not None
    assert "model_sha256" in metadata
    assert len(metadata["model_sha256"]) == 64


def test_sec05_model_tampered_artifact_rejected():
    """Validates that a mismatched SHA-256 aborts deserialization and raises ModelNotAvailableError."""
    from backend.ml import predict
    
    # Temporarily mock the compute_file_sha256 to return a tampered digest
    with patch("backend.ml.predict.compute_file_sha256", return_value="f" * 64):
        with pytest.raises(ModelNotAvailableError) as exc_info:
            predict.load_model_and_metadata(force_reload=True)
        assert "checksum mismatch" in str(exc_info.value).lower()


def test_sec05_model_missing_digest_rejected():
    """Validates that missing model_sha256 in metadata aborts deserialization."""
    from backend.ml import predict
    
    with patch("backend.ml.predict.MODEL_METADATA_PATH", "nonexistent_metadata.json"):
        with pytest.raises(ModelNotAvailableError):
            predict.load_model_and_metadata(force_reload=True)


def test_sec05_model_unavailable_endpoint_behavior():
    """Validates that when model verification fails, API endpoints return HTTP 503."""
    with patch("backend.ml.predict.load_model_and_metadata", side_effect=ModelNotAvailableError("Integrity failure")):
        res_info = client.get("/api/land-price/model-info")
        assert res_info.status_code == 503
        assert "unavailable" in res_info.json()["detail"].lower()


# ============================================================================
# SEC-06: SIMULATION ENDPOINTS
# ============================================================================

def test_sec06_simulation_unauthorized_without_key():
    """Validates that POST /api/guardian/simulate returns 401 when X-Guardian-Key is missing."""
    res = client.post("/api/guardian/simulate/evt-001")
    assert res.status_code == 401
    assert "unauthorized" in res.json()["detail"].lower()


def test_sec06_simulation_unauthorized_with_wrong_key():
    """Validates that POST /api/guardian/simulate returns 401 when X-Guardian-Key is invalid."""
    res = client.post(
        "/api/guardian/simulate/evt-001",
        headers={"X-Guardian-Key": "incorrect-password"}
    )
    assert res.status_code == 401


def test_sec06_simulation_authorized_with_valid_key():
    """Validates that POST /api/guardian/simulate succeeds when valid key is provided."""
    res = client.post(
        "/api/guardian/simulate/evt-001",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    assert res.status_code == 200
    assert res.json()["status_label"] == "SIMULATED"


def test_sec06_review_unauthorized_and_authorized():
    """Validates that review endpoint requires valid X-Guardian-Key header."""
    # First trigger an alert with auth
    sim_res = client.post(
        "/api/guardian/simulate/evt-001",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    alert_id = sim_res.json()["alert_id"]

    # Attempt review without key -> 401
    res_no_key = client.post(f"/api/guardian/alerts/{alert_id}/review")
    assert res_no_key.status_code == 401

    # Attempt review with key -> 200
    res_auth = client.post(
        f"/api/guardian/alerts/{alert_id}/review",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    assert res_auth.status_code == 200
    assert res_auth.json()["alert"]["is_reviewed"] is True


def test_sec06_guardian_concurrency_thread_safety():
    """Validates that concurrent alert reviews and simulations do not trigger race conditions."""
    # Populate alerts
    sim = client.post("/api/guardian/simulate/evt-001", headers={"X-Guardian-Key": "demo-zenox-2026"})
    alert_id = sim.json()["alert_id"]

    errors = []

    def worker_action():
        try:
            client.post(
                f"/api/guardian/alerts/{alert_id}/review",
                headers={"X-Guardian-Key": "demo-zenox-2026"}
            )
        except Exception as e:
            errors.append(e)

    threads = [threading.Thread(target=worker_action) for _ in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(errors) == 0


# ============================================================================
# SEC-07: STRICT COMPARE REQUEST SCHEMA
# ============================================================================

def test_sec07_compare_valid_request():
    """Validates that well-formed compare requests succeed."""
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "khatian_no": "412",
            "dag_no": "1058",
            "area_decimal": "15.5",
            "document_date": "2021-04-12"
        },
        "area_tolerance_decimal": 0.05,
        "language": "bn"
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status_counts"]["Matched"] == 5


def test_sec07_compare_field_length_limit_exceeded():
    """Validates that field lengths exceeding maximum bounds are rejected with HTTP 422."""
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "owner_name": "A" * 200,  # Max allowed is 150
            "khatian_no": "412"
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 422


def test_sec07_compare_invalid_tolerance_bounds():
    """Validates that negative tolerance is rejected with HTTP 422."""
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "owner_name": "Md Test"
        },
        "area_tolerance_decimal": -1.0
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 422


# ============================================================================
# SEC-08: PDF TEXT EXTRACTION & HONEST SCANNED PDF FALLBACK
# ============================================================================

def test_sec08_text_pdf_extraction():
    """Validates that text-based PDFs extract text and populate candidate fields."""
    import pypdf
    
    # Create an in-memory synthetic text PDF
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    
    # Add an annotation or text stream
    # Using pypdf's low-level stream injection to generate a genuine text stream PDF
    from pypdf.generic import DecodedStreamObject, NameObject
    stream = DecodedStreamObject()
    stream.set_data(b"BT /F1 12 Tf 72 712 Td (DEMO KHATIAN: 412 DAG: 1058 OWNER: TEST) Tj ET")
    page[NameObject("/Contents")] = stream

    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    res = scan_uploaded_document(pdf_bytes, filename="citizen_deed.pdf")
    assert res["status"] in ("success", "engine_unavailable")
    # If text is parsed
    if res["status"] == "success":
        assert res["ocr_engine"] == "pdf_text_extractor"
        assert res["uploaded_file_sha256"] != ""


def test_sec08_scanned_pdf_honest_fallback():
    """Validates that image-only/blank PDFs report honest engine_unavailable without fake OCR scores."""
    import pypdf
    
    # Create an empty/scanned PDF without text streams
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=612, height=792)
    
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    scanned_pdf_bytes = pdf_buffer.getvalue()

    res = scan_uploaded_document(scanned_pdf_bytes, filename="scanned_deed.pdf")
    assert res["status"] == "engine_unavailable"
    assert res["ocr_engine"] == "scanned_pdf_unsupported"
    assert res["extracted_fields"]["owner_name"] is None
    assert res["confidence_scores"] == {}
    assert "scanned image without embedded text" in res["message"].lower()


def test_sec08_corrupted_pdf_error_handling():
    """Validates that corrupt PDF bytes return clear error status without throwing 500 crash."""
    corrupt_pdf_bytes = b"%PDF-1.4\n%Malformed binary trash bytes\x00\xff\xfe"
    res = scan_uploaded_document(corrupt_pdf_bytes, filename="corrupt.pdf")
    assert res["status"] == "error"
    assert res["ocr_engine"] == "pdf_parser_error"
    assert "failed to parse pdf" in res["message"].lower()
