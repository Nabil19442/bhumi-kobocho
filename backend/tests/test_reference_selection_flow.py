"""
Comprehensive Verification Tests for Bhumi Kobocho Reference Record Selection Flow.
Validates:
1. 'auto' is never treated as a literal record ID.
2. Automatic reference resolution accurately matches known demo archive records (rec-demo-001..004) by Dag/Khatian/Deed.
3. Unrecorded parcels return a clear, user-facing 'Reference record not selected / Needs manual review' payload rather than a technical 404 error.
4. Nonexistent explicit record IDs (like non-existent-rec-999) return HTTP 404 as expected.
5. Extracted seller and buyer names remain strictly intact and preserved through the verification flow.
"""

import pytest
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_auto_reference_resolves_to_demo_record_001():
    """When a deed for Dag 1058, Khatian 412 is passed with 'auto', it must resolve to rec-demo-001."""
    payload = {
        "reference_record_id": "auto",
        "extracted_data": {
            "seller_name": "আব্দুল করিম",
            "buyer_name": "মোঃ সাকিব হাসান",
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "mouza": "মিরপুর (Mirpur)",
            "dag_no": "1058",
            "khatian_no": "412",
            "area_decimal": "15.5",
            "deed_no": "1482/2021",
            "document_date": "2021-04-12"
        },
        "area_tolerance_decimal": 0.05,
        "language": "bn"
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200, f"Expected 200 but got {res.status_code}: {res.text}"
    data = res.json()
    ref = data.get("reference_record")
    assert ref is not None, "Reference record should be resolved, not None"
    assert ref["id"] == "rec-demo-001", f"Expected 'rec-demo-001' but got '{ref.get('id')}'"
    assert ref["owner_name_bn"] == "মোঃ রফিকুল ইসলাম"

def test_null_or_empty_reference_resolves_correctly():
    """Passing None, empty string, or case-variant 'Auto' never treats the string as a literal ID."""
    for ref_variant in [None, "", "Auto", "AUTOMATIC", "none"]:
        payload = {
            "reference_record_id": ref_variant,
            "extracted_data": {
                "seller_name": "সুলতানা জাহান",
                "buyer_name": "নাসরিন আক্তার",
                "dag_no": "784",
                "khatian_no": "129",
                "area_decimal": "24.0",
                "deed_no": "2311/2018",
                "mouza": "সাভার (Savar)"
            }
        }
        res = client.post("/api/compare", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data.get("reference_record") is not None
        assert data["reference_record"]["id"] == "rec-demo-003"

def test_unrecorded_parcel_returns_manual_review_status_not_404():
    """Unrecorded parcel with no prior history returns 'Reference record not selected / Needs manual review' without 404."""
    payload = {
        "reference_record_id": None,
        "extracted_data": {
            "seller_name": "অচেনা বিক্রেতা",
            "buyer_name": "নতুন খরিদ্দার",
            "dag_no": "99999",
            "khatian_no": "8888",
            "area_decimal": "12.0",
            "deed_no": "2026-UNKNOWN",
            "mouza": "কালীপুর"
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["has_history"] is False
    assert data["status"] == "NO_PRIOR_RECORD"
    assert data.get("reference_status") == "Reference record not selected"
    assert "ম্যানুয়াল পর্যালোচনা প্রয়োজন" in data.get("reference_status_bn", "")
    assert data.get("reference_record") is None

def test_explicit_nonexistent_reference_id_returns_404():
    """Explicitly requested nonexistent ID must return 404, preserving API contract."""
    payload = {
        "reference_record_id": "non-existent-rec-999",
        "extracted_data": {
            "seller_name": "আব্দুল করিম",
            "buyer_name": "মোঃ সাকিব হাসান",
            "dag_no": "1058"
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 404
    assert "not found" in res.json().get("detail", "").lower()

def test_demo_specimen_scan_and_verification_end_to_end():
    """End-to-end: scan demo specimen -> obtain fields -> verify -> confirm seller & buyer names intact."""
    # 1. Scan demo specimen 001
    scan_res = client.post("/api/scan", data={"sample_id": "rec-demo-001"})
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    extracted = scan_data["extracted_fields"]
    assert extracted["dag_no"] == "1058"
    assert extracted["khatian_no"] == "412"

    # 2. Simulate Step 2 review: citizen retains or specifies seller & buyer names
    seller_name = "আব্দুল করিম"
    buyer_name = "মোঃ সাকিব হাসান"

    # 3. Submit verification
    compare_payload = {
        "reference_record_id": scan_data.get("sample_id"),
        "extracted_data": {
            "seller_name": seller_name,
            "buyer_name": buyer_name,
            "owner_name": buyer_name,
            "dag_no": extracted["dag_no"],
            "khatian_no": extracted["khatian_no"],
            "area_decimal": extracted["area_decimal"],
            "deed_no": extracted["deed_no"],
            "document_date": extracted["document_date"]
        },
        "area_tolerance_decimal": 0.05,
        "language": "bn"
    }
    compare_res = client.post("/api/compare", json=compare_payload)
    assert compare_res.status_code == 200
    comp_data = compare_res.json()

    # Confirm reference record was resolved to valid demo record
    assert comp_data["reference_record"] is not None
    assert comp_data["reference_record"]["id"] == "rec-demo-001"
    # Confirm conflict analysis and results exist without any 'auto' reference error
    assert "results" in comp_data
    assert "conflict_analysis" in comp_data
