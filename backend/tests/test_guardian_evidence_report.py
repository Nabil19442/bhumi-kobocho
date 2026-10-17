import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.transaction_registry import (
    reset_user_transactions,
    record_proposed_purchase
)
from backend.app.guardian import (
    check_deed_with_guardian,
    generate_guardian_risk_report,
    trigger_simulation_event,
    reset_alerts
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_state():
    reset_user_transactions()
    reset_alerts()
    yield
    reset_user_transactions()
    reset_alerts()

def test_evidence_collection_for_duplicate_sale_scenario():
    """
    TEST SCENARIO from user prompt:
    Initial demo owner: Abdul Karim
    Previous transaction: Abdul Karim -> Sultana Jahan (Dag 558, Area 10 decimals)
    New attempted transaction: Abdul Karim -> Another Buyer (Dag 558, Area 10 decimals)
    
    EXPECTED:
    Land Guardian shows a potential duplicate sale warning
    and displays both transaction records as evidence.
    """
    # Step 1: Initial state & previous confirmed transaction
    prev_tx = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "buyer_name_bn": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-9001",
        "transaction_date": "2026-10-17"
    }
    purchase_res = client.post("/api/history/record-purchase", json=prev_tx)
    assert purchase_res.status_code == 200

    # Step 2: New attempted transaction (Abdul Karim sells same 10 decimals to Another Buyer)
    attempted_tx = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "অন্য ক্রেতা (Another Buyer)",
        "area_decimal": 10.0,
        "deed_no": "PROP-2026-9999",
        "document_date": "2026-10-18"
    }

    # Query Land Guardian Evidence & Risk Report via API endpoint
    report_res = client.post("/api/guardian/risk-report", json=attempted_tx)
    assert report_res.status_code == 200
    report = report_res.json()

    # 1. RISK STATUS: Must strictly be 'Potential Duplicate Sale'
    assert report["risk_status"] == "Potential Duplicate Sale"
    assert "সম্ভাব্য দ্বৈত বিক্রয়" in report["risk_status_bn"]
    assert report["severity"] == "CRITICAL"

    # 2. EVIDENCE COLLECTION: Must collect all required fields
    evidence = report["evidence"]
    assert evidence["current_demo_owner"] == "সুলতানা জাহান"
    assert evidence["previous_owner"] == "আব্দুল করিম"
    assert evidence["dag_no"] == "558"
    assert evidence["khatian_no"] == "128"
    assert float(evidence["land_area"]) == 10.0
    assert evidence["previous_transaction_id"] == "PROP-2026-9001"
    assert evidence["current_transaction_id"] == "PROP-2026-9999"
    assert evidence["previous_transaction_date"] == "2026-10-17"
    assert evidence["current_transaction_date"] == "2026-10-18"
    assert "Demo Database" in evidence["record_sources"]["previous_record"]
    assert "Citizen Deed Upload" in evidence["record_sources"]["current_record"]

    # Both transaction records must be displayed in evidence details
    details = report["evidence_details"]
    assert len(details) == 2
    prev_rec = next(r for r in details if r["record_role"] == "PREVIOUS_REGISTERED_TRANSFER")
    curr_rec = next(r for r in details if r["record_role"] == "CURRENT_ATTEMPTED_TRANSFER")
    assert prev_rec["seller_name"] == "আব্দুল করিম"
    assert prev_rec["buyer_name"] == "সুলতানা জাহান"
    assert curr_rec["seller_name"] == "আব্দুল করিম"
    assert "অন্য ক্রেতা" in curr_rec["buyer_name"]

    # 3. CONFLICT EXPLANATION: Detailed and evidence-backed
    explanation = report["conflict_explanation"]
    assert explanation["previous_transaction_id"] == "PROP-2026-9001"
    assert explanation["previous_buyer"] == "সুলতানা জাহান"
    assert float(explanation["previous_transferred_area"]) == 10.0
    assert "আব্দুল করিম" in explanation["reason_bn"]
    assert "সুলতানা জাহান" in explanation["reason_bn"]
    assert "PROP-2026-9001" in explanation["reason_bn"]
    assert "দ্বৈত বিক্রয়" in explanation["reason_bn"]

    # 4. EVIDENCE TIMELINE: Chronological
    timeline = report["evidence_timeline"]
    assert len(timeline) >= 2
    assert any("মৌল জরিপ" in t["title_bn"] or "Baseline" in t["title_en"] for t in timeline)
    assert any("PROP-2026-9001" in t["title_bn"] for t in timeline)
    assert any(t.get("is_conflict") is True for t in timeline)

def test_four_canonical_risk_statuses():
    """
    Verifies that Land Guardian cleanly produces each of the 4 required risk statuses:
    1. Potential Duplicate Sale
    2. Potential Ownership Conflict
    3. Needs Manual Review
    4. No Conflict Found in Available Records
    """
    # 1. Potential Duplicate Sale
    # Baseline: Karim has 10 decimals. Sells 10 decimals to Sultana.
    client.post("/api/history/record-purchase", json={
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-DUP-1",
        "transaction_date": "2026-10-17"
    })
    dup_report = generate_guardian_risk_report({
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "Buyer 2",
        "area_decimal": 10.0
    })
    assert dup_report["risk_status"] == "Potential Duplicate Sale"

    # 2. Potential Ownership Conflict (Area Overlap)
    # Baseline: An owner has 10 decimals, sells 4 to Sultana. Karim has 6 remaining.
    # Attempting to sell 8 decimals exceeds available 6 decimals by 2 decimals.
    client.post("/api/history/record-purchase", json={
        "parcel_id": "PCL-TEST-OVERLAP-01",
        "dag_no": "777",
        "khatian_no": "333",
        "seller_name": "আকমল হোসেন",
        "buyer_name": "ফারহানা আক্তার",
        "area_decimal": 4.0,
        "proposed_deed_no": "PROP-PART-1"
    })
    overlap_report = generate_guardian_risk_report({
        "parcel_id": "PCL-TEST-OVERLAP-01",
        "dag_no": "777",
        "khatian_no": "333",
        "seller_name": "ফারহানা আক্তার", # Farhana only has 4.0 decimals
        "buyer_name": "নতুন ক্রেতা",
        "area_decimal": 6.0 # Attempts to sell 6.0 -> 2.0 excess
    })
    assert overlap_report["risk_status"] == "Potential Ownership Conflict"

    # 3. Needs Manual Review (Incomplete Evidence / Unrecorded Dag)
    incomplete_report = generate_guardian_risk_report({
        "dag_no": "UNKNOWN-99999",
        "seller_name": "অজ্ঞাত ব্যক্তি",
        "buyer_name": "ক্রেতা"
    })
    assert incomplete_report["risk_status"] == "Needs Manual Review"
    assert "DEMO DATABASE EVIDENCE" in incomplete_report["disclaimer"]

    # 4. No Conflict Found in Available Records (Clean Sequential Sale)
    # Owner sells within available balance
    clean_report = generate_guardian_risk_report({
        "parcel_id": "PCL-TEST-OVERLAP-01",
        "dag_no": "777",
        "seller_name": "ফারহানা আক্তার",
        "buyer_name": "স্বচ্ছ ক্রেতা",
        "area_decimal": 2.0 # Has 4, sells 2 -> Clean!
    })
    assert clean_report["risk_status"] == "No Conflict Found in Available Records"

def test_guardian_simulation_event_evt_558():
    """
    Test triggering the Dag 558 duplicate sale simulation event in Land Guardian.
    """
    # Record previous transfer to Sultana Jahan
    client.post("/api/history/record-purchase", json={
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-9001",
        "transaction_date": "2026-10-17"
    })
    alert = trigger_simulation_event("evt-558")
    assert alert["event_id"] == "evt-558"
    assert alert["status_label"] == "SIMULATED"
    assert "দাগ ৫৫৮" in alert["title_bn"]
    assert "risk_report" in alert
    assert alert["risk_report"]["risk_status"] == "Potential Duplicate Sale"
    assert "diff_report" in alert
    assert len(alert["diff_report"]) > 0
