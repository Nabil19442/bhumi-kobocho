import pytest
from backend.app.rules import compare_records, evaluate_name_status

def test_case_1_fully_matching_record():
    """Test Case 1: Fully matching record -> all Matched."""
    reference = {
        "owner_name_bn": "মোঃ রফিকুল ইসলাম",
        "owner_name_en": "Md. Rafiqul Islam",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": 15.5,
        "document_date": "2021-04-12"
    }

    extracted = {
        "owner_name": "মোঃ রফিকুল ইসলাম",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": "15.5",
        "document_date": "2021-04-12"
    }

    result = compare_records(extracted, reference)
    statuses = {item["field"]: item["status"] for item in result["results"]}

    assert statuses["owner_name"] == "Matched"
    assert statuses["khatian_no"] == "Matched"
    assert statuses["dag_no"] == "Matched"
    assert statuses["area_decimal"] == "Matched"
    assert statuses["document_date"] == "Matched"
    assert result["status_counts"]["Mismatch"] == 0
    assert result["status_counts"]["Needs review"] == 0

def test_case_2_different_land_area():
    """Test Case 2: Different land area -> area Mismatch."""
    reference = {
        "owner_name_bn": "সুলতানা জাহান",
        "khatian_no": "835",
        "dag_no": "2490",
        "area_decimal": 8.25,
        "document_date": "2019-11-20"
    }

    extracted = {
        "owner_name": "সুলতানা জাহান",
        "khatian_no": "835",
        "dag_no": "2490",
        "area_decimal": "12.50",  # Different from 8.25
        "document_date": "2019-11-20"
    }

    result = compare_records(extracted, reference, area_tolerance_decimal=0.05)
    area_item = next(item for item in result["results"] if item["field"] == "area_decimal")

    assert area_item["status"] == "Mismatch"
    assert "AREA_DIFFERENCE" in area_item["reason_code"]
    assert area_item["difference"] == 4.25

def test_case_3_name_spelling_variant():
    """Test Case 3: Name spelling variant -> Needs review (not Mismatch, not Matched)."""
    reference = {
        "owner_name_bn": "মোঃ রফিকুল ইসলাম",
        "owner_name_en": "Md. Rafiqul Islam",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": 15.5,
        "document_date": "2021-04-12"
    }

    # Spelling variant: "Mohammad Rafiqul Islam" vs "Md. Rafiqul Islam"
    extracted_en_variant = {
        "owner_name": "Mohammad Rafiqul Islam",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": "15.5",
        "document_date": "2021-04-12"
    }

    res_en = compare_records(extracted_en_variant, reference)
    name_item = next(item for item in res_en["results"] if item["field"] == "owner_name")
    assert name_item["status"] == "Needs review"
    assert name_item["status"] not in ["Matched", "Mismatch"]

    # Bangla slight variant: "মোহাম্মদ রফিকুল ইসলাম" vs "মোঃ রফিকুল ইসলাম"
    status, reason, score = evaluate_name_status("মোহাম্মদ রফিকুল ইসলাম", "মোঃ রফিকুল ইসলাম")
    assert status == "Needs review"

def test_case_4_missing_or_unreadable_field():
    """Test Case 4: Missing/unreadable OCR field -> Needs review / Not checked."""
    reference = {
        "owner_name_bn": "আব্দুল করিম শেখ",
        "khatian_no": "129",
        "dag_no": "784",
        "area_decimal": 24.0,
        "document_date": "2018-02-15"
    }

    # Low-confidence / unreadable field simulated
    extracted = {
        "owner_name": None,
        "khatian_no": "",
        "dag_no": "784",
        "area_decimal": None,
        "document_date": "",
        "ocr_low_confidence": True
    }

    result = compare_records(extracted, reference)
    statuses = {item["field"]: item["status"] for item in result["results"]}

    assert statuses["owner_name"] in ["Needs review", "Not checked"]
    assert statuses["khatian_no"] in ["Needs review", "Not checked"]
    assert statuses["area_decimal"] in ["Needs review", "Not checked"]
    assert statuses["dag_no"] == "Matched"
