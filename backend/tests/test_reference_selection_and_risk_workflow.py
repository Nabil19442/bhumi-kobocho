import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.rules import compare_records, evaluate_comparison_risk, normalize_digits, normalize_khatian_or_dag

client = TestClient(app)

def test_two_different_reference_records_produce_distinct_comparisons():
    """
    Requirement 5 & 1: Selecting two different reference records produces
    comparisons against their respective distinct data.
    """
    deed_data = {
        "seller_name": "মোঃ রফিকুল ইসলাম",
        "buyer_name": "তন্ময় আহমেদ",
        "owner_name": "তন্ময় আহমেদ",
        "mouza": "মিরপুর (Mirpur)",
        "jl_no": "28",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": "15.5",
        "deed_no": "1482/2021",
        "document_date": "2021-04-12"
    }

    # Comparison 1: against matching baseline record rec-demo-001
    res1 = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": deed_data,
        "language": "bn"
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["reference_record"]["id"] == "rec-demo-001"
    assert str(data1["reference_record"]["dag_no"]) == "1058"
    assert data1["risk_assessment"]["is_unrelated_record"] is False
    assert data1["risk_assessment"]["risk_level"] == "CLEAN"

    # Comparison 2: against different baseline record rec-demo-002
    res2 = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-002",
        "extracted_data": deed_data,
        "language": "bn"
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["reference_record"]["id"] == "rec-demo-002"
    assert str(data2["reference_record"]["dag_no"]) == "2490"
    # Unrelated parcel identified accurately without inventing a fraud alert
    assert data2["risk_assessment"]["is_unrelated_record"] is True
    assert data2["risk_assessment"]["risk_level"] == "NEEDS_REVIEW"
    assert data2["risk_assessment"]["status_key"] == "NEEDS_REVIEW_UNRELATED"

def test_unrelated_reference_record_does_not_produce_fraud_alert():
    """
    Requirement 3 & 5: Selecting an unrelated reference record does NOT
    produce a fraud or high-risk alert. It shows 'Needs Review (Unrelated Record)'
    with neutral informative guidance.
    """
    # Deed for Plot 1234 in Shantipur
    deed_data = {
        "seller_name": "আব্দুল করিম",
        "buyer_name": "মোঃ সাকিব হাসান",
        "owner_name": "মোঃ সাকিব হাসান",
        "mouza": "শান্তিপুর",
        "jl_no": "12",
        "khatian_no": "৪৫৬",
        "dag_no": "১২৩৪",
        "area_decimal": "১০.০০",
        "deed_no": "2026-0017",
        "document_date": "2026-10-15"
    }

    # Selecting rec-demo-002 which is Plot 2490 in Badda
    res = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-002",
        "extracted_data": deed_data,
        "language": "en"
    })
    assert res.status_code == 200
    data = res.json()

    ra = data["risk_assessment"]
    assert ra["is_unrelated_record"] is True
    assert ra["risk_level"] == "NEEDS_REVIEW"
    assert ra["status_key"] == "NEEDS_REVIEW_UNRELATED"
    assert "Unrelated Parcel" in ra["title_en"]
    assert "Discrepancies against an unrelated baseline do not indicate fraud" in ra["description_en"]
    # Flagged fields should be empty - not falsely blaming deed fields for fraud
    assert ra["flagged_fields"] == []

def test_genuine_conflicting_ownership_or_duplicate_sale_produces_warning():
    """
    Requirement 3 & 5: Genuine conflicting ownership or duplicate-sale records
    produce an explainable high-risk warning.
    """
    # Gulshan Plot 550 where seller Morshed Alam previously sold the plot
    duplicate_sale_deed = {
        "seller_name": "মোঃ মোর্শেদ আলম",
        "buyer_name": "তারেক রহমান",
        "owner_name": "তারেক রহমান",
        "mouza": "গুলশান",
        "jl_no": "15",
        "khatian_no": "220",
        "dag_no": "550",
        "area_decimal": "10.0",
        "deed_no": "4520/2023",
        "document_date": "2023-08-15"
    }

    res = client.post("/api/compare", json={
        "reference_record_id": "",
        "extracted_data": duplicate_sale_deed,
        "language": "bn"
    })
    assert res.status_code == 200
    data = res.json()

    ra = data["risk_assessment"]
    assert ra["risk_level"] == "HIGH_RISK"
    assert ra["severity"] == "CRITICAL"
    assert ra["status_key"] == "DUPLICATE_SALE"
    assert "দ্বৈত বিক্রয়" in ra["title_bn"]
    assert "seller_name" in ra["flagged_fields"]

def test_missing_fields_produce_needs_review_not_automatic_mismatch():
    """
    Requirement 2 & 5: Missing or unextracted fields produce 'Needs review' or
    'Not checked', never an automatic mismatch or false fraud claim.
    """
    deed_with_missing_fields = {
        "seller_name": "মোঃ রফিকুল ইসলাম",
        "buyer_name": "তন্ময় আহমেদ",
        "owner_name": None,  # Missing owner name
        "mouza": "মিরপুর (Mirpur)",
        "jl_no": None,       # Missing JL number
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": None, # Missing area decimal
        "deed_no": None,      # Missing deed no
        "document_date": None # Missing date
    }

    res = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": deed_with_missing_fields,
        "language": "en"
    })
    assert res.status_code == 200
    data = res.json()

    results_by_field = {r["field"]: r for r in data["results"]}

    # Area is None -> Not checked or Needs review, NOT Mismatch
    assert results_by_field["area_decimal"]["status"] in ("Not checked", "Needs review")
    assert results_by_field["area_decimal"]["status"] != "Mismatch"

    # Document date is None -> Not checked, NOT Mismatch
    assert results_by_field["document_date"]["status"] in ("Not checked", "Needs review")
    assert results_by_field["document_date"]["status"] != "Mismatch"

    # Dag and Khatian were provided and match
    assert results_by_field["dag_no"]["status"] == "Matched"
    assert results_by_field["khatian_no"]["status"] == "Matched"

def test_changing_selected_reference_record_updates_comparison():
    """
    Requirement 1 & 5: Changing the selected reference record updates the comparison
    dynamically without stale state.
    """
    deed_data = {
        "seller_name": "মোঃ রফিকুল ইসলাম",
        "buyer_name": "তন্ময় আহমেদ",
        "owner_name": "তন্ময় আহমেদ",
        "mouza": "মিরপুর (Mirpur)",
        "jl_no": "28",
        "khatian_no": "412",
        "dag_no": "1058",
        "area_decimal": "15.5",
        "deed_no": "1482/2021",
        "document_date": "2021-04-12"
    }

    # Step A: Compare against rec-demo-004 (Badda Dag 2490 - unrelated parcel)
    res_a = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-004",
        "extracted_data": deed_data,
        "language": "en"
    })
    assert res_a.status_code == 200
    data_a = res_a.json()
    assert data_a["reference_record"]["id"] == "rec-demo-004"
    assert data_a["risk_assessment"]["is_unrelated_record"] is True
    assert data_a["risk_assessment"]["risk_level"] == "NEEDS_REVIEW"

    # Step B: User switches dropdown to rec-demo-001 (Mirpur Dag 1058 - matching baseline)
    res_b = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": deed_data,
        "language": "en"
    })
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert data_b["reference_record"]["id"] == "rec-demo-001"
    assert str(data_b["reference_record"]["dag_no"]) == "1058"
    assert data_b["risk_assessment"]["is_unrelated_record"] is False
    assert data_b["risk_assessment"]["risk_level"] == "CLEAN"
    assert data_b["risk_assessment"]["status_key"] == "CLEAN_CHAIN"

def test_bengali_english_numeral_and_name_normalization():
    """
    Requirement 2: Normalizes Bengali and English numerals, whitespace, and name formats.
    """
    # Deed with Bengali digits and whitespace variants
    deed_data = {
        "seller_name": "মোঃ রফিকুল ইসলাম ",
        "buyer_name": " তন্ময় আহমেদ",
        "owner_name": "তন্ময় আহমেদ",
        "mouza": "মিরপুর",
        "jl_no": "২৮",
        "khatian_no": "৪১২",
        "dag_no": "১০৫৮",
        "area_decimal": "১৫.৫",
        "deed_no": "১৪৮২/২০২১",
        "document_date": "২০২১-০৪-১২"
    }

    res = client.post("/api/compare", json={
        "reference_record_id": "rec-demo-001",
        "extracted_data": deed_data,
        "language": "bn"
    })
    assert res.status_code == 200
    data = res.json()

    results_by_field = {r["field"]: r for r in data["results"]}
    assert results_by_field["dag_no"]["status"] == "Matched"
    assert results_by_field["khatian_no"]["status"] == "Matched"
    assert results_by_field["area_decimal"]["status"] == "Matched"
    assert results_by_field["deed_no"]["status"] == "Matched"
    assert results_by_field["seller_name"]["status"] == "Matched"
    assert results_by_field["owner_name"]["status"] == "Matched"
    assert data["risk_assessment"]["risk_level"] == "CLEAN"
