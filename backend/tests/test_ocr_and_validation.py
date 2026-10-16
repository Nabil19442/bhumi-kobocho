import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ocr import (
    normalize_digits,
    extract_fields_from_text,
    scan_uploaded_document,
    load_known_demo_specimen,
    is_tesseract_available
)

client = TestClient(app)

# ==========================================
# PHASE 1 TESTS: OCR CORRECTNESS
# ==========================================

def test_digit_normalization():
    """Validates Bengali (০-৯) to Western (0-9) digit normalization."""
    assert normalize_digits("১০৫৮") == "1058"
    assert normalize_digits("৪১২") == "412"
    assert normalize_digits("১৫.৫") == "15.5"
    assert normalize_digits("0123456789") == "0123456789"
    assert normalize_digits(None) == ""
    assert normalize_digits("দাগ নং ১০৫৮/ক") == "দাগ নং 1058/ক"

def test_known_demo_specimen_loading():
    """Validates that known specimens return engine 'known_demo_specimen' and genuine data."""
    res = load_known_demo_specimen("001")
    assert res["ocr_engine"] == "known_demo_specimen"
    assert res["status"] == "known_specimen"
    assert res["extracted_fields"]["khatian_no"] == "412"
    assert res["extracted_fields"]["dag_no"] == "1058"
    assert res["extracted_fields"]["owner_name"] == "মোঃ রফিকুল ইসলাম"
    assert len(res["uploaded_file_sha256"]) == 64

def test_arbitrary_upload_no_filename_inference():
    """
    Validates that general upload path NEVER infers demo record based on filename.
    Even if named 'deed_sample_001.png', if Tesseract is unavailable, it reports engine_unavailable.
    """
    dummy_png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    res = scan_uploaded_document(dummy_png_bytes, filename="deed_sample_001.png")
    
    is_avail, _, _ = is_tesseract_available()
    if not is_avail:
        # Must honestly report engine_unavailable without fabricating 001 data!
        assert res["ocr_engine"] == "tesseract_unavailable"
        assert res["status"] == "engine_unavailable"
        assert res["extracted_fields"]["owner_name"] is None
        assert res["extracted_fields"]["dag_no"] is None
        assert res["confidence_scores"] == {}
        assert "Manual field entry is available" in res["message"]

def test_txt_extraction_deterministic():
    """Validates deterministic regex extraction from .txt documents."""
    text_sample = (
        "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\n"
        "দলিল নম্বর: ১৪৮২/২০২১\n"
        "তারিখ: 12-04-2021\n"
        "গ্রহীতা / মালিকের নাম: মোঃ রফিকুল ইসলাম\n"
        "খতিয়ান নম্বর: ৪১২\n"
        "দাগ নম্বর: ১০৫৮\n"
        "জমির পরিমাণ: ১৫.৫ শতাংশ\n"
    )
    res = scan_uploaded_document(text_sample.encode("utf-8"), filename="test_deed.txt")
    assert res["ocr_engine"] == "regex_text_parser"
    assert res["status"] == "success"
    fields = res["extracted_fields"]
    assert fields["deed_no"] == "১৪৮২/২০২১"
    assert fields["owner_name"] == "মোঃ রফিকুল ইসলাম"
    assert fields["khatian_no"] == "৪১২"
    assert fields["dag_no"] == "১০৫৮"
    assert "১৫.৫" in fields["area_decimal"]

def test_no_fabricated_ocr_confidence():
    """Ensures confidence scores are never fabricated when engine is unavailable."""
    is_avail, _, _ = is_tesseract_available()
    if not is_avail:
        res = scan_uploaded_document(b"fake-image-bytes", filename="arbitrary_deed.png")
        assert res["ocr_engine"] == "tesseract_unavailable"
        assert res["confidence_scores"] == {}
        for k, v in res["extracted_fields"].items():
            if k != "raw_text":
                assert v is None


# ==========================================
# PHASE 2 TESTS: API VALIDATION
# ==========================================

def test_api_scan_sample_specimen():
    """Validates /api/scan with sample_id loads demo specimen."""
    res = client.post("/api/scan", data={"sample_id": "001"})
    assert res.status_code == 200
    data = res.json()
    assert data["ocr_engine"] == "known_demo_specimen"
    assert data["extracted_fields"]["dag_no"] == "1058"

def test_api_scan_empty_upload():
    """Validates that empty file uploads return HTTP 400."""
    res = client.post(
        "/api/scan",
        files={"file": ("empty.png", b"", "image/png")}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

def test_api_scan_oversized_upload():
    """Validates that uploads exceeding 10 MB return HTTP 400."""
    oversized_bytes = b"x" * (10 * 1024 * 1024 + 10)
    res = client.post(
        "/api/scan",
        files={"file": ("large.png", oversized_bytes, "image/png")}
    )
    assert res.status_code == 400
    assert "exceeds" in res.json()["detail"].lower()

def test_api_scan_unsupported_file_type():
    """Validates that unsupported file extensions return HTTP 400."""
    res = client.post(
        "/api/scan",
        files={"file": ("malicious.exe", b"MZ\x90\x00", "application/x-msdownload")}
    )
    assert res.status_code == 400
    assert "unsupported" in res.json()["detail"].lower()

def test_api_scan_neither_file_nor_sample():
    """Validates that missing both file and sample_id returns HTTP 400."""
    res = client.post("/api/scan", data={})
    assert res.status_code == 400

def test_api_compare_unknown_reference_id():
    """Validates that unknown reference record ID returns HTTP 404."""
    payload = {
        "reference_record_id": "non-existent-rec-999",
        "extracted_data": {"owner_name": "Test Owner"}
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_api_passport_unknown_plot_id():
    """Validates that unknown plot ID returns HTTP 404."""
    res = client.get("/api/passport/unknown-plot-999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_api_integrity_invalid_sha256():
    """Validates that non-64 hex SHA-256 inputs return HTTP 400."""
    # Invalid length
    res1 = client.post(
        "/api/integrity/check",
        data={"expected_hash": "abc123"},
        files={"file": ("test.png", b"test", "image/png")}
    )
    assert res1.status_code == 400
    assert "sha-256" in res1.json()["detail"].lower()

    # Invalid non-hex characters
    res2 = client.post(
        "/api/integrity/check",
        data={"expected_hash": "g" * 64},
        files={"file": ("test.png", b"test", "image/png")}
    )
    assert res2.status_code == 400

def test_api_integrity_empty_upload():
    """Validates that empty upload to integrity check returns HTTP 400."""
    res = client.post(
        "/api/integrity/check",
        data={"expected_hash": "a" * 64},
        files={"file": ("test.png", b"", "image/png")}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()
