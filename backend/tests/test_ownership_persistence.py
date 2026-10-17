import os
import json
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.transaction_registry import (
    load_transactions,
    record_proposed_purchase,
    get_parcel_by_id,
    find_history_for_deed,
    get_party_holdings_on_parcel,
    reset_user_transactions,
    USER_TRANSACTIONS_FILE
)
from backend.app.conflict_detector import detect_conflicts
from backend.app.guardian import check_deed_with_guardian

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_transactions_state():
    """Ensure every test runs in a clean state with reset user transactions."""
    reset_user_transactions()
    yield
    reset_user_transactions()

def test_initial_state_abdul_karim_owns_dag_558():
    """
    Scenario Step 1:
    Abdul Karim initially owns 10 decimals of Dag 558 under Khatian 128 (Savar).
    """
    history = find_history_for_deed(dag_no="558")
    assert len(history) >= 1
    
    baseline = history[0]
    assert baseline["dag_no"] == "558"
    assert baseline["khatian_no"] == "128"
    assert baseline["buyer_name_bn"] == "আব্দুল করিম"
    assert float(baseline["transferred_area"]) == 10.0
    assert float(baseline["total_parcel_area"]) == 10.0
    
    # Check party holdings for Abdul Karim
    holdings = get_party_holdings_on_parcel(history, "আব্দুল করিম")
    assert holdings["acquired"] == 10.0
    assert holdings["transferred"] == 0.0
    assert holdings["balance"] == 10.0

def test_sultana_jahan_purchases_and_ownership_persists_across_restart():
    """
    Scenario Steps 2, 3, 4:
    - Sultana Jahan purchases all 10 decimals from Abdul Karim under Dag 558.
    - Confirm the demo ownership transfer via /api/history/record-purchase.
    - Persist the new ownership record in backend database/disk (user_transactions.json).
    - Refresh/reboot (clear in-memory caches, reload).
    - Sultana Jahan must still appear as the current demo owner.
    - History must preserve: Abdul Karim -> Sultana Jahan.
    """
    # 1. Record proposed purchase transfer
    payload = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-9001",
        "transaction_date": "2026-10-17",
        "land_class": "নাল (Nal / Agricultural)"
    }
    res = client.post("/api/history/record-purchase", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["current_owner_bn"] == "সুলতানা জাহান"
    assert data["previous_owner_bn"] == "আব্দুল করিম"
    assert float(data["seller_remaining_area"]) == 0.0
    assert "DEMO DATA" in data["disclaimer"]

    # Verify persistence file exists on backend disk
    assert os.path.exists(USER_TRANSACTIONS_FILE)
    with open(USER_TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
        saved_records = json.load(f)
    assert any(r.get("buyer_name_bn") == "সুলতানা জাহান" and r.get("dag_no") == "558" for r in saved_records)

    # 2. SIMULATE APPLICATION REFRESH / SERVER RESTART
    # Force reload of transactions registry from disk
    reset_in_memory_only = True
    import backend.app.transaction_registry as tr
    tr._TRANSACTIONS_CACHE = None
    reloaded_history = tr.find_history_for_deed(dag_no="558")
    
    # 3. Verify Sultana Jahan remains the current owner after refresh
    assert len(reloaded_history) == 2
    assert reloaded_history[0]["buyer_name_bn"] == "আব্দুল করিম"
    assert reloaded_history[1]["buyer_name_bn"] == "সুলতানা জাহান"
    assert reloaded_history[1]["seller_name_bn"] == "আব্দুল করিম"

    # Current owner is Sultana Jahan
    latest_tx = reloaded_history[-1]
    assert latest_tx["buyer_name_bn"] == "সুলতানা জাহান"

    # 4. Check Plot Passport API reflects Sultana Jahan as current owner
    passport_res = client.get("/api/passport/PCL-DHK-SAV-045-0558?lang=bn")
    assert passport_res.status_code == 200
    passport_data = passport_res.json()
    assert passport_data["record"]["owner_name_bn"] == "সুলতানা জাহান"
    assert passport_data["record"]["previous_demo_owner"] == "আব্দুল করিম"

    # Timeline preserves unbroken chain: Abdul Karim -> Sultana Jahan
    tl = passport_data["timeline"]
    assert len(tl) == 2
    assert "আব্দুল করিম" in tl[0]["detail_bn"]
    assert "সুলতানা জাহান" in tl[1]["detail_bn"]

def test_subsequent_sale_by_abdul_karim_triggers_duplicate_sale_warning():
    """
    Scenario Step 5 & Requirement 6:
    - Abdul Karim initially owns 10 decimals.
    - Sultana Jahan purchases all 10 decimals.
    - A subsequent attempt by Abdul Karim to sell the same 10 decimals
      must trigger a potential duplicate-sale warning (DUPLICATE_SALE_DETECTED).
    """
    # 1. Complete transfer to Sultana Jahan
    purchase_payload = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-9001",
        "transaction_date": "2026-10-17"
    }
    client.post("/api/history/record-purchase", json=purchase_payload)

    # 2. Abdul Karim now attempts to sell the same 10 decimals to a new buyer
    new_deed_to_verify = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "অন্য ক্রেতা",
        "area_decimal": "10.0",
        "deed_no": "PROP-2026-9999",
        "document_date": "2026-10-18"
    }

    # Test via direct conflict detector
    conflict_report = detect_conflicts(new_deed_to_verify)
    assert conflict_report["has_history"] is True
    assert conflict_report["conflict_type"] == "DUPLICATE_SALE"
    assert "Duplicate Sale" in conflict_report["status_badge"]
    assert any(c["code"] == "DUPLICATE_SALE_DETECTED" for c in conflict_report["conflicts"])

    # Test via Land Guardian check
    guardian_check = check_deed_with_guardian(new_deed_to_verify)
    assert guardian_check["conflict_type"] == "DUPLICATE_SALE"
    assert any(c["code"] == "DUPLICATE_SALE_DETECTED" for c in guardian_check["conflicts"])

    # Test via Compare API endpoint
    compare_payload = {
        "reference_record_id": "auto",
        "extracted_data": new_deed_to_verify,
        "language": "bn"
    }
    comp_res = client.post("/api/compare", json=compare_payload)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["conflict_analysis"]["conflict_type"] == "DUPLICATE_SALE"
    assert any(c["code"] == "DUPLICATE_SALE_DETECTED" for c in comp_data["conflict_analysis"]["conflicts"])

def test_partial_ownership_handling():
    """
    Requirement 8:
    Handle partial ownership correctly.
    If someone purchases 4 decimals out of 10 decimals:
    - Update only the purchased portion (4 decimals to buyer).
    - Seller (Abdul Karim) retains 6.0 decimals remaining balance.
    - Subsequent sale of 6.0 decimals by Abdul Karim is CLEAN.
    - Subsequent sale of 7.0 decimals by Abdul Karim triggers OVERLAPPING_AREA_DETECTED.
    """
    # 1. Sultana Jahan purchases only 4.0 decimals of Abdul Karim's 10.0 decimals
    partial_purchase = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 4.0,
        "proposed_deed_no": "PROP-2026-PARTIAL",
        "transaction_date": "2026-10-17"
    }
    res = client.post("/api/history/record-purchase", json=partial_purchase)
    assert res.status_code == 200
    data = res.json()
    # Karim's remaining balance is 6.0 decimals
    assert float(data["seller_remaining_area"]) == 6.0

    history = find_history_for_deed(dag_no="558")
    karim_holdings = get_party_holdings_on_parcel(history, "আব্দুল করিম")
    assert karim_holdings["acquired"] == 10.0
    assert karim_holdings["transferred"] == 4.0
    assert karim_holdings["balance"] == 6.0

    sultana_holdings = get_party_holdings_on_parcel(history, "সুলতানা জাহান")
    assert sultana_holdings["acquired"] == 4.0
    assert sultana_holdings["transferred"] == 0.0
    assert sultana_holdings["balance"] == 4.0

    # 2. Karim attempts to sell his remaining 6.0 decimals -> Clean Sequential Sale
    valid_sale = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "তৃতীয় পক্ষ",
        "area_decimal": "6.0",
        "deed_no": "PROP-2026-VALID-REM",
        "document_date": "2026-10-18"
    }
    valid_report = detect_conflicts(valid_sale)
    assert valid_report["conflict_type"] in ("NORMAL_SALE", "MULTIPLE_TRANSACTIONS")
    assert len(valid_report["conflicts"]) == 0

    # 3. Karim attempts to sell 7.0 decimals (exceeds 6.0 balance by 1.0) -> Overlap Warning
    excess_sale = {
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "তৃতীয় পক্ষ",
        "area_decimal": "7.0",
        "deed_no": "PROP-2026-EXCESS",
        "document_date": "2026-10-18"
    }
    overlap_report = detect_conflicts(excess_sale)
    assert overlap_report["conflict_type"] == "OVERLAPPING_SALE"
    assert any(c["code"] == "OVERLAPPING_AREA_DETECTED" for c in overlap_report["conflicts"])
    assert overlap_report["conflicts"][0]["excess_decimals"] == 1.0

def test_partial_ownership_20_decimals_sells_10_remaining_10():
    """
    Step 4: Partial Ownership Test
    If the current owner has 20 decimals and sells 10 decimals,
    only 10 decimals should be transferred.
    The remaining 10 decimals must stay with the seller.
    """
    # Create a 20 decimal baseline record for a seller
    baseline_deed = {
        "parcel_id": "PCL-TEST-PARTIAL-020",
        "dag_no": "999",
        "khatian_no": "500",
        "mouza": "উত্তরা (Uttara)",
        "seller_name": "জমির মূল মালিক",
        "buyer_name": "মোহাম্মদ রফিক",
        "area_decimal": 20.0,
        "proposed_deed_no": "DEED-2020-020",
        "transaction_date": "2020-01-01"
    }
    client.post("/api/history/record-purchase", json=baseline_deed)

    # Rafiq has 20 decimals. Now Rafiq sells 10 decimals to "আনিসুর রহমান"
    sale_10_decimals = {
        "parcel_id": "PCL-TEST-PARTIAL-020",
        "dag_no": "999",
        "khatian_no": "500",
        "mouza": "উত্তরা (Uttara)",
        "seller_name": "মোহাম্মদ রফিক",
        "buyer_name": "আনিসুর রহমান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-010",
        "transaction_date": "2026-10-17"
    }
    res = client.post("/api/history/record-purchase", json=sale_10_decimals)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert float(data["transferred_area"]) == 10.0
    assert float(data["seller_remaining_area"]) == 10.0

    # Query registry history to verify holdings balance
    history = find_history_for_deed(dag_no="999")
    rafiq_holdings = get_party_holdings_on_parcel(history, "মোহাম্মদ রফিক")
    assert rafiq_holdings["acquired"] == 20.0
    assert rafiq_holdings["transferred"] == 10.0
    assert rafiq_holdings["balance"] == 10.0

    anisur_holdings = get_party_holdings_on_parcel(history, "আনিসুর রহমান")
    assert anisur_holdings["acquired"] == 10.0
    assert anisur_holdings["transferred"] == 0.0
    assert anisur_holdings["balance"] == 10.0

def test_relationship_graph_consistency():
    """
    Requirement 7:
    Ensure Land Record Graph displays consistent ownership data and preserves chain.
    """
    # Record transfer to Sultana Jahan
    client.post("/api/history/record-purchase", json={
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0,
        "proposed_deed_no": "PROP-2026-GRAPH",
        "transaction_date": "2026-10-17"
    })

    # Query graph for Dag 558
    graph_res = client.get("/api/records/graph?record_id=PCL-DHK-SAV-045-0558")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()

    # Nodes must contain both transactions
    nodes = graph_data["nodes"]
    assert len(nodes) >= 2
    karim_node = next((n for n in nodes if n.get("owner_name") == "আব্দুল করিম"), None)
    sultana_node = next((n for n in nodes if n.get("owner_name") == "সুলতানা জাহান"), None)
    assert karim_node is not None
    assert sultana_node is not None

def test_demo_disclaimers_preserved():
    """
    Requirement 9:
    Do not automatically claim legal ownership has changed.
    Strictly distinguish demo simulation from official government mutations.
    """
    res = client.post("/api/history/record-purchase", json={
        "parcel_id": "PCL-DHK-SAV-045-0558",
        "dag_no": "558",
        "khatian_no": "128",
        "mouza": "সাভার (Savar)",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "সুলতানা জাহান",
        "area_decimal": 10.0
    })
    data = res.json()
    assert "DEMO DATA" in data["disclaimer"]
    assert "not a legal verdict" in data["disclaimer"].lower()
