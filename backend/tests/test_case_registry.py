"""
Unit tests for Case Registry (backend/app/case_registry.py)
Verifies clean parcel, pending court cases, active mortgages, and unknown parcels.
"""

import pytest
from backend.app.case_registry import get_cases_for_parcel, get_cases_report

def test_clean_parcel_has_no_cases():
    # Shantipur plot 1234 was explicitly designed as clean
    cases = get_cases_for_parcel("PCL-DHK-SHA-012-1234")
    assert isinstance(cases, list)
    assert len(cases) == 0

    report = get_cases_report("PCL-DHK-SHA-012-1234", lang="bn")
    assert report["total_cases"] == 0
    assert "লাইভ দেওয়ানি আদালত" in report["not_checked_note"]
    assert report["disclaimer"] == "DEMO DATA — not a legal verdict. All cases are synthetic."

def test_pending_court_case_parcel():
    # Gulshan Plot 550 has a pending civil title suit
    cases = get_cases_for_parcel("PCL-DHK-GUL-015-0550")
    assert len(cases) >= 1
    court_cases = [c for c in cases if c["type"] == "court_case"]
    assert len(court_cases) >= 1
    assert court_cases[0]["status"] == "pending"
    assert court_cases[0]["is_synthetic"] is True
    assert "CS-" in court_cases[0]["case_id"]

    report = get_cases_report("PCL-DHK-GUL-015-0550", lang="en")
    assert report["has_pending_court"] is True
    assert report["status_label"] == "Priority review"

def test_active_mortgage_parcel():
    # Savar Plot 784 has an active mortgage
    cases = get_cases_for_parcel("PCL-DHK-SAV-045-0784")
    assert len(cases) >= 1
    mortgages = [c for c in cases if c["type"] == "mortgage"]
    assert len(mortgages) >= 1
    assert mortgages[0]["status"] == "active"
    assert mortgages[0]["is_synthetic"] is True

    report = get_cases_report("PCL-DHK-SAV-045-0784")
    assert report["has_active_mortgage"] is True
    assert report["status_label"] == "Priority review"

def test_unknown_parcel_returns_empty_and_not_checked():
    cases = get_cases_for_parcel("PCL-UNKNOWN-PARCEL-9999")
    assert cases == []

    report_bn = get_cases_report("PCL-UNKNOWN-PARCEL-9999", lang="bn")
    assert report_bn["cases"] == []
    assert report_bn["total_cases"] == 0
    assert report_bn["status_label"] == "Not checked"
    assert "লাইভ" in report_bn["not_checked_note"]

    report_en = get_cases_report(None, lang="en")
    assert report_en["cases"] == []
    assert "Live civil court records" in report_en["not_checked_note"]
