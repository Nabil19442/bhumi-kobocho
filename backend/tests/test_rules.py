import pytest
from backend.app.rules import (
    compare_records,
    evaluate_name_status,
    evaluate_date_status,
    is_date_ambiguous,
    normalize_digits
)
from backend.app.names import normalize_name, compute_name_similarity
from backend.app.conflict_detector import detect_conflicts

# =====================================================================
# EXISTING TESTS (Preserved 100%)
# =====================================================================

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


# =====================================================================
# PHASE 2: NEW REGRESSION TESTS
# =====================================================================

def test_date_normalization_equivalent_formats():
    """Tests equivalent dates in different formats: 12/03/2019, 2019-03-12, hyphens, dots."""
    # 1. 12/03/2019 vs 2019-03-12
    st, reason, notes = evaluate_date_status("12/03/2019", "2019-03-12")
    assert st == "Matched"

    # 2. 12-03-2019 vs 2019-03-12
    st, reason, notes = evaluate_date_status("12-03-2019", "2019-03-12")
    assert st == "Matched"

    # 3. 12.03.2019 vs 2019-03-12
    st, reason, notes = evaluate_date_status("12.03.2019", "2019-03-12")
    assert st == "Matched"

    # 4. Compare records with equivalent dates
    res = compare_records(
        {"document_date": "12/03/2019", "khatian_no": "100", "dag_no": "200"},
        {"document_date": "2019-03-12", "khatian_no": "100", "dag_no": "200"}
    )
    dt_item = next(i for i in res["results"] if i["field"] == "document_date")
    assert dt_item["status"] == "Matched"

def test_date_normalization_bangla_digits():
    """Tests date normalization with Bengali numerals and Bengali date separators."""
    # ১২/০৩/২০১৯ vs 2019-03-12
    st, reason, notes = evaluate_date_status("১২/০৩/২০১৯", "2019-03-12")
    assert st == "Matched"

    # ২০১৯-০৩-১২ vs 2019-03-12
    st, reason, notes = evaluate_date_status("২০১৯-০৩-১২", "2019-03-12")
    assert st == "Matched"

    # ১২-০৩-২০১৯ vs ১২/০৩/২০১৯
    st, reason, notes = evaluate_date_status("১২-০৩-২০১৯", "১২/০৩/২০১৯")
    assert st == "Matched"

def test_date_ambiguity_returns_needs_review():
    """
    Tests that ambiguous dates such as 03/04/2019 return Needs review
    when compared against dates that match under alternative MM/DD conventions.
    """
    assert is_date_ambiguous("03/04/2019") is True
    assert is_date_ambiguous("2019-03-12") is False
    assert is_date_ambiguous("25/03/2019") is False  # 25 > 12 -> unambiguously Day

    # 03/04/2019 vs 2019-03-04 (matches under MM/DD/YYYY, differs under DD/MM/YYYY)
    st, reason, notes = evaluate_date_status("03/04/2019", "2019-03-04")
    assert st == "Needs review"
    assert reason == "DATE_AMBIGUOUS_FORMAT"

    # 03/04/2019 vs 04/03/2019 (inverted day/month pattern)
    st, reason, notes = evaluate_date_status("03/04/2019", "04/03/2019")
    assert st == "Needs review"
    assert reason == "DATE_AMBIGUOUS_FORMAT"

def test_name_cross_script_bengali_english():
    """
    Tests reliable matching between Bengali and English names:
    - 'আব্দুল করিম' <-> 'Abdul Karim' -> Matched
    - 'আব্দুল করিম' <-> 'Sultana Jahan' -> Mismatch
    """
    st, reason, score = evaluate_name_status("আব্দুল করিম", "Abdul Karim")
    assert st == "Matched"
    assert reason == "CROSS_SCRIPT_NAME_MATCH"

    st, reason, score = evaluate_name_status("আব্দুল করিম", "Sultana Jahan")
    assert st == "Mismatch"
    assert reason == "NAME_SIGNIFICANT_DIFFERENCE"

    # Test through compare_records
    res = compare_records(
        {"owner_name": "আব্দুল করিম"},
        {"owner_name_en": "Abdul Karim"}
    )
    name_item = next(i for i in res["results"] if i["field"] == "owner_name")
    assert name_item["status"] == "Matched"

def test_prefix_normalization_edge_cases():
    """
    Verifies that word-boundary-aware prefix removal preserves valid name portions:
    - 'Mrinal Das' remains 'Mrinal Das' (does NOT lose 'Mr')
    - 'মোহাম্মদপুর' remains 'মোহাম্মদপুর' (does NOT lose 'মোহাম্মদ')
    """
    assert normalize_name("Mrinal Das") == "mrinal das"
    assert normalize_name("Mr. Mrinal Das") == "mrinal das"
    assert normalize_name("মোহাম্মদপুর", is_bangla=True) == "মোহাম্মদপুর"
    assert normalize_name("মোহাম্মদ রফিকুল ইসলাম", is_bangla=True) == "রফিকুল ইসলাম"
    assert normalize_name("মোঃ রফিকুল ইসলাম", is_bangla=True) == "রফিকুল ইসলাম"

def test_missing_reference_fields_returns_not_checked():
    """
    If reference fields are missing, the system must NOT automatically return Mismatch.
    It must return 'Not checked' and explain that the reference value was unavailable.
    """
    extracted = {
        "owner_name": "আমিনুল ইসলাম",
        "khatian_no": "501",
        "dag_no": "1024",
        "area_decimal": 12.0,
        "document_date": "2020-05-10"
    }

    # Reference has missing khatian, missing dag, missing area, missing date, missing name
    reference_empty = {}

    res = compare_records(extracted, reference_empty)
    statuses = {item["field"]: item["status"] for item in res["results"]}
    reasons = {item["field"]: item["reason_code"] for item in res["results"]}

    # All fields where reference was missing should be Not checked, NOT Mismatch!
    assert statuses["owner_name"] == "Not checked"
    assert "UNAVAILABLE" in reasons["owner_name"]

    assert statuses["khatian_no"] == "Not checked"
    assert "UNAVAILABLE" in reasons["khatian_no"]

    assert statuses["dag_no"] == "Not checked"
    assert "UNAVAILABLE" in reasons["dag_no"]

    assert statuses["area_decimal"] == "Not checked"
    assert "UNAVAILABLE" in reasons["area_decimal"]

    assert statuses["document_date"] == "Not checked"
    assert "UNAVAILABLE" in reasons["document_date"]

    assert res["status_counts"]["Mismatch"] == 0

def test_partial_name_matching_cross_script_uncertainty():
    """
    Cross-script comparisons without complete, reliable token evidence
    must return 'Needs review' rather than jumping to a definitive match.
    """
    # 2 tokens vs 3 tokens cross-script
    st, reason, score = evaluate_name_status("আব্দুল করিম", "Abdul Karim Chowdhury")
    assert st == "Needs review"
    assert "UNCERTAIN" in reason or "PARTIAL" in reason

def test_duplicate_sale_scenario_in_rules():
    """Ensures existing duplicate-sale scenario produces correct audit status."""
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
    conflict_res = detect_conflicts(candidate_deed)
    assert conflict_res["status"] == "DUPLICATE_SALE"
    assert conflict_res["conflicts"][0]["code"] == "DUPLICATE_SALE_DETECTED"

def test_area_overlap_scenario_in_rules():
    """Ensures existing area-overlap scenario produces correct audit status."""
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
    conflict_res = detect_conflicts(candidate_deed)
    assert conflict_res["status"] == "OVERLAPPING_SALE"
    assert conflict_res["conflicts"][0]["code"] == "OVERLAPPING_AREA_DETECTED"
    assert conflict_res["conflicts"][0]["excess_decimals"] == 3.0
