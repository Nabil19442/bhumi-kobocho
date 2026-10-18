import pytest
from backend.app.integrity import check_file_integrity, calculate_sha256, generate_record_qr_base64

def test_case_5_modified_file_hash_check():
    """Test Case 5: Modified file -> hash check reports changed."""
    original_data = b"Original sample deed content for plot #1058"
    modified_data = b"Modified sample deed content for plot #1058 (altered text)"

    expected_hash = calculate_sha256(original_data)

    # 1. Test unmodified
    intact_check = check_file_integrity(original_data, expected_hash)
    assert intact_check["status"] == "Unchanged"
    assert intact_check["is_intact"] is True
    from datetime import datetime
    parsed_dt = datetime.fromisoformat(intact_check["verified_at"])
    assert parsed_dt is not None
    assert parsed_dt.tzinfo is not None

    # 2. Test modified
    altered_check = check_file_integrity(modified_data, expected_hash)
    assert altered_check["status"] == "File content changed"
    assert altered_check["is_intact"] is False
    assert altered_check["calculated_sha256"] != expected_hash
    parsed_altered_dt = datetime.fromisoformat(altered_check["verified_at"])
    assert parsed_altered_dt is not None
    # Check strict disclaimer adherence
    assert "DEMO DATA — not a legal verdict" in altered_check["disclaimer"]

def test_qr_generation():
    dummy_record = {
        "id": "rec-demo-001",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": 15.5,
        "file_hash_sha256": "45e014bec467973a4585fb6078178be5a065652f70b81f17d1cfdf4a4bfda7aa"
    }
    qr_b64 = generate_record_qr_base64(dummy_record)
    assert qr_b64.startswith("data:image/png;base64,")


# ==========================================
# PHASE 3 TESTS: DATASET & HASH VERIFICATION
# ==========================================

import os
import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ocr import load_known_demo_specimen

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")
SAMPLES_DIR = os.path.join(DATA_DIR, "samples")

api_client = TestClient(app)

def test_all_expected_sample_files_exist():
    """Verify that every record in records.json has a physical sample file under backend/data/samples/."""
    assert os.path.isfile(RECORDS_FILE)
    with open(RECORDS_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    assert len(records) >= 3
    for r in records:
        sample_file = r.get("sample_file")
        assert sample_file is not None, f"Record {r.get('id')} is missing sample_file definition"
        sample_path = os.path.join(SAMPLES_DIR, sample_file)
        assert os.path.isfile(sample_path), f"Sample file {sample_file} does not exist at {sample_path}"

def test_all_sample_hashes_match_records():
    """Verify that every physical sample's computed SHA-256 byte hash exactly matches records.json."""
    with open(RECORDS_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    for r in records:
        sample_path = os.path.join(SAMPLES_DIR, r["sample_file"])
        with open(sample_path, "rb") as sf:
            actual_bytes = sf.read()
        calculated_hash = calculate_sha256(actual_bytes)
        expected_hash = r.get("file_hash_sha256")
        assert calculated_hash == expected_hash, (
            f"Hash mismatch for {r['id']} ({r['sample_file']}): "
            f"calculated {calculated_hash} != expected {expected_hash}"
        )

def test_third_demo_specimen_loading_and_api():
    """Verify that the third demo specimen (rec-demo-003) loads through the explicit demo pathway."""
    res = load_known_demo_specimen("003")
    assert res["ocr_engine"] == "known_demo_specimen"
    assert res["status"] == "known_specimen"
    assert res["extracted_fields"]["owner_name"] == "আব্দুল করিম শেখ"
    assert res["extracted_fields"]["khatian_no"] == "129"
    assert res["extracted_fields"]["dag_no"] == "784"
    assert res["extracted_fields"]["area_decimal"] == "24.0"
    assert res["extracted_fields"]["deed_no"] == "2311/2018"
    assert res["uploaded_file_sha256"] == "488ee25bb6189920d80dfd24ee637e4855ce6c07882d3a8c1c81587d27d323e1"

    # Also test through /api/scan endpoint
    api_res = api_client.post("/api/scan", data={"sample_id": "003"})
    assert api_res.status_code == 200
    api_data = api_res.json()
    assert api_data["ocr_engine"] == "known_demo_specimen"
    assert api_data["extracted_fields"]["dag_no"] == "784"
    assert api_data["uploaded_file_sha256"] == "488ee25bb6189920d80dfd24ee637e4855ce6c07882d3a8c1c81587d27d323e1"

def test_missing_sample_file_produces_clear_error(monkeypatch):
    """Verify that a missing sample file produces a clear error rather than fabricated data."""
    # Temporarily point SAMPLES_DIR to empty dir to simulate missing file
    import backend.app.ocr as ocr_mod
    monkeypatch.setattr(ocr_mod, "SAMPLES_DIR", os.path.join(DATA_DIR, "non_existent_samples_dir"))
    
    with pytest.raises(FileNotFoundError) as exc_info:
        load_known_demo_specimen("001")
    assert "was not found on disk" in str(exc_info.value)

# ==========================================
# PHASE 5.2 / QR VERIFICATION ENDPOINT TESTS
# ==========================================

def test_public_verification_endpoint_success():
    """Verify that GET /api/records/verify/{record_id} returns safe public metadata."""
    res = api_client.get("/api/records/verify/rec-demo-001")
    assert res.status_code == 200
    data = res.json()
    assert data["record_id"] == "rec-demo-001"
    assert data["is_synthetic"] is True
    assert "DEMO DATA" in data["disclaimer"]
    assert "ডেমো ডেটা" in data["disclaimer_bn"]
    
    # Check public metadata
    meta = data["public_metadata"]
    assert meta["id"] == "rec-demo-001"
    assert meta["dag_no"] == "1058"
    assert meta["khatian_no"] == "412"
    assert "মিরপুর" in meta["mouza"]
    
    # Bit integrity status must be explicitly 'Not checked'
    assert data["file_hash_status"] == "Not checked"
    assert data["reference_sha256"] == "45e014bec467973a4585fb6078178be5a065652f70b81f17d1cfdf4a4bfda7aa"
    assert "T" in data["verification_timestamp"]

def test_public_verification_no_sensitive_fields_leaked():
    """Verify that private personal identifiers like dummy_nid_last4 are never exposed."""
    res = api_client.get("/api/records/verify/rec-demo-001")
    assert res.status_code == 200
    data = res.json()
    assert "dummy_nid_last4" not in data
    assert "dummy_nid_last4" not in data.get("public_metadata", {})
    assert "nid" not in data.get("public_metadata", {})

def test_public_verification_unknown_record_404():
    """Verify that unknown record ID returns HTTP 404."""
    res = api_client.get("/api/records/verify/non-existent-plot-999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_qr_endpoint_with_custom_base_url():
    """Verify that GET /api/integrity/qr/{record_id} accepts base_url and formats canonical URL."""
    res = api_client.get("/api/integrity/qr/rec-demo-002?base_url=https://bhumikobocho.bangladesh.gov")
    assert res.status_code == 200
    data = res.json()
    assert data["record_id"] == "rec-demo-002"
    assert data["verification_url"] == "https://bhumikobocho.bangladesh.gov/verify/rec-demo-002"
    assert data["qr_code_base64"].startswith("data:image/png;base64,")

def test_qr_endpoint_unknown_record_404():
    """Verify that requesting QR for unknown record returns HTTP 404."""
    res = api_client.get("/api/integrity/qr/non-existent-plot-999")
    assert res.status_code == 404

