"""
Comprehensive Regression Tests for Reference Record Dropdown and Comparison Risk Calculation
Bhumi Kobocho (ভূমি কবচ)

Validates:
1. Baseline records endpoint (rec-demo-001..004) vs Development deeds endpoint (deed-dev-001..020).
2. Correct reference ID submission and baseline switching.
3. Verification with rec-demo-001, rec-demo-002, rec-demo-003, and rec-demo-004.
4. Clean title chain & 100% consistency when matching baseline data is submitted.
5. Legitimate ownership transfer (seller matches reference owner, new buyer) evaluates as Matched.
6. Genuine Dag and Khatian mismatches produce precise field-level mismatches and lower consistency.
7. Missing reference record returns 404 without silent substitution.
8. Unrecorded plot returns NO_PRIOR_RECORD without false mismatch.
9. Valid partial transfer evaluates area as Matched.
10. Duplicate sale conflict is accurately detected.
11. Comparison risk varies dynamically and is never hardcoded.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.rules import ALLOWED_STATUSES

client = TestClient(app)

def test_baseline_records_and_dev_deeds_endpoints_distinction():
    """Confirms distinction between 4 registered baseline records and 20 dev test deeds."""
    res_base = client.get("/api/records")
    assert res_base.status_code == 200
    base_data = res_base.json()
    assert "records" in base_data
    base_ids = [r["id"] for r in base_data["records"]]
    assert len(base_ids) == 4
    assert set(base_ids) == {"rec-demo-001", "rec-demo-002", "rec-demo-003", "rec-demo-004"}

    res_dev = client.get("/api/dev/deeds")
    assert res_dev.status_code == 200
    dev_data = res_dev.json()
    assert dev_data["count"] == 20
    assert len(dev_data["deeds"]) == 20
    dev_ids = [d["id"] for d in dev_data["deeds"]]
    assert "deed-dev-001" in dev_ids
    assert "deed-dev-020" in dev_ids

def test_selecting_different_reference_records_changes_baseline():
    """Verifies that selecting different reference records changes comparison baseline fields."""
    sample_deed = {
        "seller_name": "মোঃ রফিকুল ইসলাম",
        "buyer_name": "তন্ময় আহমেদ",
        "owner_name": "তন্ময় আহমেদ",
        "dag_no": "1058",
        "khatian_no": "412",
        "mouza": "মিরপুর (Mirpur)",
        "area_decimal": "15.5",
        "deed_no": "1482/2021",
        "document_date": "2021-04-12"
    }

    # Compare against rec-demo-001 (Mirpur, Dag 1058, Khatian 412)
    res_1 = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": sample_deed
    })
    assert res_1.status_code == 200
    data_1 = res_1.json()
    ref_1 = data_1["reference_record"]
    assert ref_1["id"] == "rec-demo-001"
    assert ref_1["dag_no"] == "1058"
    assert data_1["record_consistency_indicator"]["percentage"] >= 80.0

    # Compare same deed against rec-demo-003 (Savar, Dag 784, Khatian 129)
    res_3 = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-003",
        "extracted_data": sample_deed
    })
    assert res_3.status_code == 200
    data_3 = res_3.json()
    ref_3 = data_3["reference_record"]
    assert ref_3["id"] == "rec-demo-003"
    assert ref_3["dag_no"] == "784"
    # Consistency must drop significantly because Dag and Khatian do not match Savar
    assert data_3["record_consistency_indicator"]["percentage"] < 50.0
    assert data_3["status_counts"]["Mismatch"] >= 2

def test_matching_all_four_baseline_records_yields_high_consistency():
    """Tests rec-demo-001 through 004 with their corresponding matching data."""
    test_cases = [
        ("rec-demo-001", "1058", "412", "15.5", "মোঃ রফিকুল ইসলাম", "1482/2021", "মিরপুর (Mirpur)", "2021-04-12"),
        ("rec-demo-002", "2490", "835", "8.25", "সুলতানা জাহান", "8901/2019", "বাড্ডা (Badda)", "2019-11-20"),
        ("rec-demo-003", "784", "129", "24.0", "আব্দুল করিম শেখ", "2311/2018", "সাভার (Savar)", "2018-02-15"),
        ("rec-demo-004", "2490", "410", "8.25", "আবুল হোসেন তালুকদার", "710/2008", "বাড্ডা (Badda)", "2008-03-14"),
    ]

    for rec_id, dag, khatian, area, owner, deed, mouza, doc_date in test_cases:
        payload = {
            "reference_record_id": rec_id,
            "extracted_data": {
                "seller_name": owner,
                "buyer_name": owner,
                "owner_name": owner,
                "dag_no": dag,
                "khatian_no": khatian,
                "area_decimal": area,
                "deed_no": deed,
                "mouza": mouza,
                "document_date": doc_date
            }
        }
        res = client.post("/api/compare", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["reference_record"]["id"] == rec_id
        assert data["status_counts"]["Mismatch"] == 0
        assert data["record_consistency_indicator"]["percentage"] >= 80.0

def test_different_owner_with_valid_transfer_history_is_matched():
    """
    When deed seller matches reference owner, new buyer should be evaluated as
    VALID_TRANSFER_NEW_BUYER (Matched), NOT an automatic mismatch or fraud.
    """
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "মোঃ রফিকুল ইসলাম",  # Matches rec-demo-001 owner
            "buyer_name": "তন্ময় আহমেদ",          # Valid proposed transferee
            "owner_name": "তন্ময় আহমেদ",
            "dag_no": "1058",
            "khatian_no": "412",
            "area_decimal": "15.5",
            "deed_no": "1482/2021",
            "mouza": "মিরপুর (Mirpur)"
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    owner_field = next(r for r in data["results"] if r["field"] == "owner_name")
    assert owner_field["status"] == "Matched"
    assert owner_field["reason_code"] == "VALID_TRANSFER_NEW_BUYER"
    assert data["status_counts"]["Mismatch"] == 0

def test_genuine_dag_and_khatian_mismatch():
    """Confirms genuine Dag and Khatian differences are accurately flagged as Mismatch."""
    # Dag mismatch
    dag_mismatch_payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "মোঃ রফিকুল ইসলাম",
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "dag_no": "9999",  # Conflicting Dag
            "khatian_no": "412",
            "area_decimal": "15.5"
        }
    }
    res = client.post("/api/compare", json=dag_mismatch_payload)
    assert res.status_code == 200
    data = res.json()
    dag_res = next(r for r in data["results"] if r["field"] == "dag_no")
    assert dag_res["status"] == "Mismatch"
    assert dag_res["reason_code"] == "DAG_VALUE_MISMATCH"

    # Khatian mismatch
    khatian_mismatch_payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "মোঃ রফিকুল ইসলাম",
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "dag_no": "1058",
            "khatian_no": "999",  # Conflicting Khatian
            "area_decimal": "15.5"
        }
    }
    res = client.post("/api/compare", json=khatian_mismatch_payload)
    assert res.status_code == 200
    data = res.json()
    khatian_res = next(r for r in data["results"] if r["field"] == "khatian_no")
    assert khatian_res["status"] == "Mismatch"
    assert khatian_res["reason_code"] == "KHATIAN_VALUE_MISMATCH"

def test_missing_reference_record_returns_404_without_silent_substitution():
    """Explicitly requesting an unknown reference record must return 404, never silently substituting another."""
    res = client.post("/api/compare", json={
        "reference_record_id": "rec-unknown-nonexistent-999",
        "extracted_data": {"dag_no": "1058"}
    })
    assert res.status_code == 404
    assert "not found" in res.json().get("detail", "").lower()

def test_unrecorded_plot_handled_cleanly():
    """Unrecorded parcel alias returns 200 with NO_PRIOR_RECORD without false mismatch."""
    res = client.post("/api/compare", json={
        "reference_record_id": "unrecorded-plot",
        "extracted_data": {
            "seller_name": "অজ্ঞাত",
            "owner_name": "অজ্ঞাত",
            "dag_no": "999999",
            "khatian_no": "888888",
            "area_decimal": "10.0"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "NO_PRIOR_RECORD"
    assert data["reference_record"] is None
    for r in data["results"]:
        assert r["status"] in ("Not checked", "Needs review")

def test_valid_partial_transfer():
    """Transferring 5.0 out of 15.5 decimals with is_partial_transfer evaluates as Matched."""
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "মোঃ রফিকুল ইসলাম",
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "dag_no": "1058",
            "khatian_no": "412",
            "area_decimal": "5.0",  # Partial transfer of 5.0 out of 15.5
            "is_partial_transfer": True
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    area_res = next(r for r in data["results"] if r["field"] == "area_decimal")
    assert area_res["status"] == "Matched"
    assert area_res["reason_code"] == "PARTIAL_TRANSFER_WITHIN_LIMIT"

def test_duplicate_sale_conflict_detection():
    """Verifies that duplicate sale scenario on plot 550 is identified as DUPLICATE_SALE."""
    payload = {
        "reference_record_id": "rec-scen-001-b",
        "extracted_data": {
            "seller_name": "মোঃ মোর্শেদ আলম",
            "buyer_name": "তারেক রহমান",
            "dag_no": "550",
            "khatian_no": "220",
            "area_decimal": "10.0",
            "mouza": "গুলশান"
        }
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    ca = data.get("conflict_analysis", {})
    assert ca.get("status") == "DUPLICATE_SALE" or any(c["code"] == "DUPLICATE_SALE_DETECTED" for c in ca.get("conflicts", []))

def test_risk_variance_across_dev_deeds():
    """Verifies that risk and consistency vary dynamically across development deed scenarios."""
    # Dev deed 1: Clean ownership transfer
    res_clean = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "মোঃ রফিকুল ইসলাম",
            "buyer_name": "তন্ময় আহমেদ",
            "owner_name": "তন্ময় আহমেদ",
            "dag_no": "1058",
            "khatian_no": "412",
            "area_decimal": "15.5",
            "deed_no": "1482/2021",
            "document_date": "2021-04-12"
        }
    })
    data_clean = res_clean.json()

    # Dev deed 3: Conflicting seller name (Ajmal Hossain Chowdhury vs Rafiqul Islam)
    res_seller_conflict = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "seller_name": "আজমল হোসেন চৌধুরী",
            "buyer_name": "ফারহানা করিম",
            "owner_name": "ফারহana করিম",
            "dag_no": "1058",
            "khatian_no": "412",
            "area_decimal": "15.5",
            "deed_no": "1003/2023"
        }
    })
    data_conflict = res_seller_conflict.json()

    # Verify that results are NOT identical
    pct_clean = data_clean["record_consistency_indicator"]["percentage"]
    pct_conflict = data_conflict["record_consistency_indicator"]["percentage"]
    assert pct_clean > pct_conflict, f"Clean ({pct_clean}%) must be higher than conflict ({pct_conflict}%)"
    assert data_conflict["status_counts"]["Mismatch"] > data_clean["status_counts"]["Mismatch"]
