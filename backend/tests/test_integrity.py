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

    # 2. Test modified
    altered_check = check_file_integrity(modified_data, expected_hash)
    assert altered_check["status"] == "File content changed"
    assert altered_check["is_intact"] is False
    assert altered_check["calculated_sha256"] != expected_hash
    # Check strict disclaimer adherence
    assert "DEMO DATA — not a legal verdict" in altered_check["disclaimer"]

def test_qr_generation():
    dummy_record = {
        "id": "rec-demo-001",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": 15.5,
        "file_hash_sha256": "07913647653f602004c31fa30728000171f061307ac630c319f7d5cb1b928e47"
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
    assert res["uploaded_file_sha256"] == "d1d1d5b15349b6d569bc4fe02c23c4fa97b58725bc2db501f0fff57d2974824b"

    # Also test through /api/scan endpoint
    api_res = api_client.post("/api/scan", data={"sample_id": "003"})
    assert api_res.status_code == 200
    api_data = api_res.json()
    assert api_data["ocr_engine"] == "known_demo_specimen"
    assert api_data["extracted_fields"]["dag_no"] == "784"
    assert api_data["uploaded_file_sha256"] == "d1d1d5b15349b6d569bc4fe02c23c4fa97b58725bc2db501f0fff57d2974824b"

def test_missing_sample_file_produces_clear_error(monkeypatch):
    """Verify that a missing sample file produces a clear error rather than fabricated data."""
    # Temporarily point SAMPLES_DIR to empty dir to simulate missing file
    import backend.app.ocr as ocr_mod
    monkeypatch.setattr(ocr_mod, "SAMPLES_DIR", os.path.join(DATA_DIR, "non_existent_samples_dir"))
    
    with pytest.raises(FileNotFoundError) as exc_info:
        load_known_demo_specimen("001")
    assert "was not found on disk" in str(exc_info.value)
