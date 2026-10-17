import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.dev_dataset import load_dev_seed_deeds, get_dev_seed_by_id, get_dev_seed_by_scenario
from backend.app.rules import (
    compare_records,
    normalize_digits,
    normalize_mouza,
    extract_jl_number,
    normalize_deed_no,
    parse_decimal_value,
    ALLOWED_STATUSES
)

client = TestClient(app)

def test_dev_seed_deeds_dataset_count_and_scenarios():
    """Validates that exactly 20 realistic fictional development seed deeds exist with all required fields."""
    deeds = load_dev_seed_deeds()
    assert len(deeds) >= 20, f"Expected at least 20 fictional deed records, found {len(deeds)}"

    required_fields = [
        "id", "scenario_number", "scenario_name", "deed_no", "dag_no", "khatian_no",
        "mouza", "jl_no", "seller_name_bn", "buyer_name_bn", "area_decimal", "document_date"
    ]

    scenario_numbers = set()
    for deed in deeds:
        for f in required_fields:
            assert f in deed, f"Deed {deed.get('id')} missing required field '{f}'"
        assert deed["id"].startswith("deed-dev-")
        scenario_numbers.add(deed["scenario_number"])

    # Ensure all 20 scenarios (1 through 20) are covered
    for i in range(1, 21):
        assert i in scenario_numbers, f"Scenario {i} missing from dev seed dataset"

def test_get_dev_seed_by_id_and_scenario():
    """Validates helper lookups by ID and scenario number."""
    deed_1 = get_dev_seed_by_id("deed-dev-001")
    assert deed_1 is not None
    assert deed_1["scenario_number"] == 1
    assert "Clean ownership transfer" in deed_1["scenario_name"]

    deed_20 = get_dev_seed_by_scenario(20)
    assert deed_20 is not None
    assert deed_20["id"] == "deed-dev-020"

def test_get_dev_deeds_api_endpoint():
    """Validates the GET /api/dev/deeds endpoint."""
    response = client.get("/api/dev/deeds")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 20
    assert len(data["deeds"]) >= 20
    assert "DEVELOPMENT SEED DATA" in data["disclaimer"]

def test_unrecorded_plot_alias_does_not_404_and_returns_full_structure():
    """
    CRITICAL REGRESSION TEST:
    Verifies that 'unrecorded-plot' alias does NOT trigger HTTP 404,
    and returns full field-by-field audit results, status counts, and consistency indicator.
    """
    payload = {
        "reference_record_id": "unrecorded-plot",
        "extracted_data": {
            "owner_name": "আরিফুল ইসলাম",
            "seller_name": "রেজাউল করিম",
            "dag_no": "৯৯৯",
            "khatian_no": "৮৮৮",
            "mouza": "বনানী",
            "jl_no": "১৯",
            "area_decimal": "১০.৫০",
            "document_date": "15/08/2023",
            "deed_no": "১২৩৪/২০২৩"
        }
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "NO_PRIOR_RECORD"
    assert data["reference_record"] is None
    assert data["status_badge"] == "Previous Land Record Not Found"
    assert "results" in data and len(data["results"]) > 0
    assert "status_counts" in data
    assert "record_consistency_indicator" in data
    assert data["record_consistency_indicator"]["percentage"] == 0.0

    # Ensure no field is marked as Mismatch when reference record is absent
    for r in data["results"]:
        assert r["status"] in ("Not checked", "Needs review"), f"Field {r['field']} unexpectedly marked as {r['status']}"
        assert r["status"] in ALLOWED_STATUSES

def test_partial_transfer_within_holding_balance():
    """
    Bangladesh Land Law: A partial transfer within the seller's registered holding
    is legally valid and should NOT be marked as an automatic Mismatch.
    """
    extracted = {
        "owner_name": "তানভীর আহমেদ",
        "seller_name": "মো: আবদুর রহিম",
        "dag_no": "558",
        "khatian_no": "1024",
        "mouza": "Gulshan",
        "area_decimal": "5.50",
        "is_partial_transfer": True
    }
    reference = {
        "owner_name_bn": "মো: আবদুর রহিম",
        "dag_no": "558",
        "khatian_no": "1024",
        "mouza": "Gulshan",
        "area_decimal": "15.50"
    }
    result = compare_records(extracted, reference)
    area_res = next((r for r in result["results"] if r["field"] == "area_decimal"), None)
    assert area_res is not None
    assert area_res["status"] == "Matched"
    assert area_res["reason_code"] == "PARTIAL_TRANSFER_WITHIN_LIMIT"

def test_partial_transfer_exceeding_holding_balance_is_mismatch():
    """Transferring more land than the seller owns is a genuine conflict/mismatch."""
    extracted = {
        "owner_name": "তানভীর আহমেদ",
        "seller_name": "মো: আবদুর রহিম",
        "dag_no": "558",
        "khatian_no": "1024",
        "area_decimal": "25.00"
    }
    reference = {
        "owner_name_bn": "মো: আবদুর রহিম",
        "dag_no": "558",
        "khatian_no": "1024",
        "area_decimal": "15.00"
    }
    result = compare_records(extracted, reference)
    area_res = next((r for r in result["results"] if r["field"] == "area_decimal"), None)
    assert area_res is not None
    assert area_res["status"] == "Mismatch"
    assert "AREA_DIFFERENCE" in area_res["reason_code"]

def test_bengali_and_english_numeral_equivalence():
    """Verifies that Bengali numerals (০১২৩৪৫৬৭৮৯) and English digits (0123456789) evaluate identically."""
    # Dag & Khatian in Bengali vs Reference in English
    ext_bn = {
        "dag_no": "৫৫৮",
        "khatian_no": "১০২৪",
        "jl_no": "২৮",
        "deed_no": "৪৫৬৭/২০২১",
        "area_decimal": "১২.৭৫"
    }
    ref_en = {
        "dag_no": "558",
        "khatian_no": "1024",
        "jl_no": "28",
        "deed_no": "4567/2021",
        "area_decimal": "12.75"
    }
    result = compare_records(ext_bn, ref_en)
    dag_res = next((r for r in result["results"] if r["field"] == "dag_no"), None)
    khatian_res = next((r for r in result["results"] if r["field"] == "khatian_no"), None)
    jl_res = next((r for r in result["results"] if r["field"] == "jl_no"), None)
    deed_res = next((r for r in result["results"] if r["field"] == "deed_no"), None)
    area_res = next((r for r in result["results"] if r["field"] == "area_decimal"), None)

    assert dag_res["status"] == "Matched"
    assert khatian_res["status"] == "Matched"
    assert jl_res["status"] == "Matched"
    assert deed_res["status"] == "Matched"
    assert area_res["status"] == "Matched"

def test_mouza_normalization_and_comparison():
    """Verifies Mouza normalization strips English parentheticals and JL suffixes gracefully."""
    # Test normalization helper directly
    assert normalize_mouza("গুলশান (Gulshan), জেএল-২৮") == "গুলশান"
    assert normalize_mouza("Badda (বাড্ডা), JL No: 15") == "badda"

    # Compare records
    ext = {"mouza": "গুলশান (Gulshan), JL-28"}
    ref = {"mouza": "গুলশান"}
    res = compare_records(ext, ref)
    m_res = next((r for r in res["results"] if r["field"] == "mouza"), None)
    assert m_res is not None
    assert m_res["status"] == "Matched"

def test_seller_evaluation_against_prior_owner():
    """Seller must match reference owner; if completely different, flags Mismatch."""
    ext_match = {"seller_name": "আব্দুল করিম"}
    ref = {"owner_name_bn": "আব্দুল করিম"}
    res_match = compare_records(ext_match, ref)
    s_match = next((r for r in res_match["results"] if r["field"] == "seller_name"), None)
    assert s_match["status"] == "Matched"

    # Variant with honorific returns Needs review per conservative matching rules
    ext_var = {"seller_name": "আব্দুল করিম"}
    ref_var = {"owner_name_bn": "মো: আব্দুল করিম"}
    res_var = compare_records(ext_var, ref_var)
    s_var = next((r for r in res_var["results"] if r["field"] == "seller_name"), None)
    assert s_var["status"] == "Needs review"

    ext_mismatch = {"seller_name": "কামাল উদ্দিন চৌধুরী"}
    res_mismatch = compare_records(ext_mismatch, ref)
    s_mismatch = next((r for r in res_mismatch["results"] if r["field"] == "seller_name"), None)
    assert s_mismatch["status"] == "Mismatch"
    assert s_mismatch["reason_code"] == "SELLER_NOT_REGISTERED_OWNER"

def test_compare_endpoint_with_all_20_dev_seed_deeds():
    """
    Tests all 20 fictional dev seed deeds end-to-end through the /api/compare endpoint.
    Verifies that every scenario returns status 200 with strictly valid statuses.
    """
    seeds = load_dev_seed_deeds()
    assert len(seeds) >= 20

    for seed in seeds:
        payload = {
            "reference_record_id": seed["id"],
            "extracted_data": {
                "owner_name": seed.get("buyer_name_bn"),
                "seller_name": seed.get("seller_name_bn"),
                "buyer_name": seed.get("buyer_name_bn"),
                "mouza": seed.get("mouza"),
                "jl_no": str(seed.get("jl_no")),
                "dag_no": str(seed.get("dag_no")),
                "khatian_no": str(seed.get("khatian_no")),
                "area_decimal": str(seed.get("area_decimal")),
                "document_date": seed.get("document_date"),
                "deed_no": seed.get("deed_no")
            }
        }
        res = client.post("/api/compare", json=payload)
        assert res.status_code == 200, f"Deed {seed['id']} failed: {res.text}"
        data = res.json()
        assert "results" in data
        assert "status_counts" in data
        assert "record_consistency_indicator" in data
        assert "explanation" in data

        for item in data["results"]:
            assert item["status"] in ALLOWED_STATUSES, f"Invalid status {item['status']} in {seed['id']}"
