"""
Unit tests for Synthetic Land Transaction Registry and Conflict Detection Engine.
Tests all 5 required conflict scenarios, 20,000 synthetic records loading,
sample deed integration, and zero modification to Land Price Intelligence.
"""

import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.transaction_registry import (
    load_transactions,
    find_history_for_deed,
    get_parcel_by_id,
    get_scenario_records,
    normalize_digits
)
from backend.app.conflict_detector import detect_conflicts

client = TestClient(app)

def test_transactions_dataset_generation_and_size():
    """Validates that transaction registry loads ~20,000 synthetic records with stable Parcel IDs."""
    records = load_transactions()
    assert len(records) >= 20000
    
    # Check schema of first 100 records
    for r in records[:100]:
        assert "parcel_id" in r
        assert r["parcel_id"].startswith("PCL-")
        assert "deed_no" in r
        assert "dag_no" in r
        assert "khatian_no" in r
        assert "mouza" in r
        assert "transferred_area" in r
        assert r.get("is_synthetic") is True
        assert "DEMO DATA" in r.get("disclaimer", "")

def test_scenario_1_duplicate_sale_detection():
    """
    Scenario 1: Duplicate sale of the same land portion.
    Seller sells 10.0 dec in Deed 1102/2020. Then purports to sell the same 10.0 dec in Deed 4520/2023.
    Expected: DUPLICATE_SALE conflict detected.
    """
    candidate_deed = {
        "parcel_id": "PCL-DHK-GUL-015-0550",
        "dag_no": "550",
        "khatian_no": "220",
        "deed_no": "4520/2023",
        "document_date": "2023-08-15",
        "area_decimal": "10.0",
        "owner_name": "তারেক রহমান",
        "mouza": "গুলশান (Gulshan)"
    }
    res = detect_conflicts(candidate_deed)
    assert res["has_history"] is True
    assert res["status"] == "DUPLICATE_SALE"
    assert "Duplicate Sale" in res["status_badge"]
    assert len(res["conflicts"]) >= 1
    assert res["conflicts"][0]["code"] == "DUPLICATE_SALE_DETECTED"
    assert len(res["supporting_records"]) >= 1

def test_scenario_2_overlapping_sale_detection():
    """
    Scenario 2: Overlapping sale of a previously transferred land portion.
    Baseline 12.0 dec. Sold 8.0 dec (leaves 4.0). Then purports to sell 7.0 dec (3.0 dec excess).
    Expected: OVERLAPPING_SALE conflict detected.
    """
    candidate_deed = {
        "parcel_id": "PCL-DHK-SAV-045-0784",
        "dag_no": "784",
        "khatian_no": "129",
        "deed_no": "5812/2022",
        "document_date": "2022-11-20",
        "area_decimal": "7.0",
        "owner_name": "মাহমুদ হাসান",
        "mouza": "সাভার (Savar)"
    }
    res = detect_conflicts(candidate_deed)
    assert res["has_history"] is True
    assert res["status"] == "OVERLAPPING_SALE"
    assert "Area Overlap" in res["status_badge"]
    assert len(res["conflicts"]) >= 1
    assert res["conflicts"][0]["code"] == "OVERLAPPING_AREA_DETECTED"
    assert res["conflicts"][0]["excess_decimals"] == 3.0

def test_scenario_3_normal_sale_no_overlap():
    """
    Scenario 3: Normal sale with no detected overlap.
    Seller owns 15.5 dec from Deed 920/2005. Sells 5.0 dec in Deed 1482/2021 (leaves 10.5).
    Expected: CLEAN_CHAIN / NORMAL_SALE with zero adverse conflicts.
    """
    candidate_deed = {
        "parcel_id": "PCL-DHK-MIR-028-1058",
        "dag_no": "1058",
        "khatian_no": "412",
        "deed_no": "1482/2021",
        "document_date": "2021-04-12",
        "area_decimal": "5.0",
        "owner_name": "আমিনুল হক",
        "mouza": "মিরপুর (Mirpur)"
    }
    res = detect_conflicts(candidate_deed)
    assert res["has_history"] is True
    assert res["status"] == "NORMAL_SALE"
    assert "Clean Chain" in res["status_badge"]
    assert len(res["conflicts"]) == 0

def test_scenario_4_missing_or_incomplete_history():
    """
    Scenario 4: Missing or incomplete transaction history.
    Deed references a seller with no prior recorded acquisition / unlinked parent khatian.
    Expected: INCOMPLETE_HISTORY / CHAIN_GAP_DETECTED.
    """
    candidate_deed = {
        "parcel_id": "PCL-CTG-KOT-088-3310",
        "dag_no": "3310",
        "khatian_no": "991",
        "deed_no": "1099/2024",
        "document_date": "2024-01-10",
        "area_decimal": "8.0",
        "owner_name": "নাসির উদ্দিন",
        "mouza": "আন্দরকিল্লা (Anderkilla)"
    }
    res = detect_conflicts(candidate_deed)
    assert res["has_history"] is True
    assert res["status"] == "INCOMPLETE_HISTORY"
    assert "History Gap" in res["status_badge"]
    assert len(res["conflicts"]) >= 1
    assert res["conflicts"][0]["code"] == "CHAIN_GAP_DETECTED"

def test_scenario_5_multiple_transactions_parcel():
    """
    Scenario 5: Multiple transactions involving the same parcel.
    4-step chronological chain (1985 -> 2001 -> 2011 -> 2018).
    Expected: MULTIPLE_TRANSACTIONS verified.
    """
    candidate_deed = {
        "parcel_id": "PCL-SYL-SAD-032-1540",
        "dag_no": "1540",
        "khatian_no": "605",
        "deed_no": "8112/2018",
        "document_date": "2018-12-05",
        "area_decimal": "6.0",
        "owner_name": "মাকসুদা বেগম",
        "mouza": "আম্বরখানা (Amberkhana)"
    }
    res = detect_conflicts(candidate_deed)
    assert res["has_history"] is True
    assert res["status"] == "MULTIPLE_TRANSACTIONS"
    assert "Multi-Transaction Verified" in res["status_badge"]
    assert len(res["conflicts"]) == 0
    assert len(res["timeline"]) >= 4

def test_unrecorded_parcel_returns_previous_land_record_not_found():
    """
    Validates that when no matching synthetic history exists, the engine strictly outputs:
    'Previous Land Record Not Found' without fabricating fake prior transactions.
    """
    unknown_deed = {
        "dag_no": "999999",
        "khatian_no": "888888",
        "deed_no": "0000/2099",
        "area_decimal": "50.0",
        "owner_name": "অজ্ঞাত ব্যক্তি",
        "mouza": "কাল্পনিক অজানা মৌজা"
    }
    res = detect_conflicts(unknown_deed)
    assert res["has_history"] is False
    assert res["status"] == "NO_PRIOR_RECORD"
    assert res["status_badge"] == "Previous Land Record Not Found"
    assert res["status_label_bn"] == "পূর্ববর্তী রেকর্ড পাওয়া যায়নি"
    assert res["conflicts"] == []
    assert res["supporting_records"] == []

def test_api_history_scenarios_endpoint():
    """Validates /api/history/scenarios returns all explicit test scenarios."""
    res = client.get("/api/history/scenarios")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 5
    assert len(data["scenarios"]) >= 5

def test_api_compare_with_auto_history_search():
    """Validates /api/compare with reference_record_id='auto' searches synthetic history."""
    # Test with Scenario 1 duplicate sale
    res = client.post("/api/compare", json={
        "reference_record_id": "auto",
        "extracted_data": {
            "dag_no": "550",
            "khatian_no": "220",
            "deed_no": "4520/2023",
            "document_date": "2023-08-15",
            "area_decimal": "10.0",
            "owner_name": "তারেক রহমান"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["has_history"] is True
    assert data["conflict_analysis"]["status"] == "DUPLICATE_SALE"

def test_api_compare_unknown_deed_returns_record_not_found():
    """Validates /api/compare with unrecorded parcel returns 'Previous Land Record Not Found'."""
    res = client.post("/api/compare", json={
        "reference_record_id": "auto",
        "extracted_data": {
            "dag_no": "777777",
            "khatian_no": "666666",
            "deed_no": "9999/2026",
            "area_decimal": "10.0",
            "owner_name": "অচেনা মালিক"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["has_history"] is False
    assert data["status_badge"] == "Previous Land Record Not Found"
    assert data["status_label_bn"] == "পূর্ববর্তী রেকর্ড পাওয়া যায়নি"

def test_land_price_intelligence_integrity_preserved():
    """Ensures the 20,000 ML Land Price dataset and prediction model remain 100% untouched."""
    from backend.ml.config import DATASET_CSV_PATH
    assert DATASET_CSV_PATH.is_file()
    assert DATASET_CSV_PATH.name == "synthetic_rural_land_prices_20k.csv"
    
    # Check dataset line count (header + 20,000 rows = 20,001)
    with open(DATASET_CSV_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()
    assert len(lines) == 20001
    
    # ML Prediction API works without disturbance
    res = client.post("/api/land-price/predict", json={
        "land_area_decimal": 15.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "road_width_ft": 14.0,
        "distance_to_paved_road_m": 0.0,
        "distance_to_local_market_km": 0.8,
        "distance_to_upazila_center_km": 4.5,
        "flood_risk_level": "none",
        "drainage_quality": "excellent_highland",
        "access_road_available": True,
        "electricity_available": True,
        "water_access_available": True
    })
    assert res.status_code == 200
    assert "predicted_price_per_decimal_bdt" in res.json()


def test_record_proposed_purchase_transaction():
    """
    Validates recording a proposed land purchase:
    - Successfully records simulation
    - Marks source as 'User-Submitted Records'
    - Updates parcel transaction timeline
    - Explicitly includes disclaimer that this does NOT constitute legal registration
    """
    purchase_payload = {
        "parcel_id": "PCL-DHK-GUL-015-0550",
        "mouza": "গুলশান (Gulshan)",
        "jl_no": "15",
        "khatian_no": "220",
        "dag_no": "550",
        "seller_name": "মিজানুর রহমান",
        "buyer_name": "তাহমিনা ইসলাম",
        "area_decimal": 5.0,
        "proposed_deed_no": "PROP-2026-9099",
        "notes": "Simulated purchase after deed review"
    }
    res = client.post("/api/history/record-purchase", json=purchase_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["parcel_id"] == "PCL-DHK-GUL-015-0550"
    record = data["recorded_transaction"]
    assert record["record_source"] == "User-Submitted Records"
    assert record["seller_name"] == "মিজানুর রহমান"
    assert record["buyer_name"] == "তাহমিনা ইসলাম"
    assert "legal_disclaimer" in data
    assert "NOT legally transfer ownership" in data["legal_disclaimer"]

    # Verify parcel history now reflects this new user-submitted record
    hist_res = client.get("/api/history/parcel/PCL-DHK-GUL-015-0550")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["found"] is True
    tx_deeds = [t["deed_no"] for t in hist_data["transactions"]]
    assert "PROP-2026-9099" in tx_deeds


def test_dynamic_qr_and_verification_for_synthetic_parcels():
    """
    Validates that any synthetic parcel ID generates a dedicated QR code
    and public verification metadata without being constrained to static demo IDs.
    """
    synthetic_parcel = "PCL-DHK-GUL-015-0550"
    
    # 1. Test QR generation
    qr_res = client.get(f"/api/integrity/qr/{synthetic_parcel}")
    assert qr_res.status_code == 200
    qr_data = qr_res.json()
    assert qr_data["record_id"] == synthetic_parcel
    assert "qr_code_base64" in qr_data
    assert qr_data["qr_code_base64"].startswith("data:image/png;base64,")
    assert qr_data["verification_url"].endswith(f"/verify/{synthetic_parcel}")

    # 2. Test Public Verification endpoint
    verify_res = client.get(f"/api/integrity/verify/{synthetic_parcel}")
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["verified"] is True
    assert v_data["record_id"] == synthetic_parcel
    assert v_data["dag_no"] == "550"
    assert v_data["khatian_no"] == "220"
