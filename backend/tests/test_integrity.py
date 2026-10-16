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
