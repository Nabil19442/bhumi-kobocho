"""
Tests for Data Adapter Layer (LandRecordSource, SyntheticSource).
"""

import pytest
from backend.app.adapters import get_record_source, set_record_source, LandRecordSource, SyntheticSource


def test_synthetic_adapter_get_parcel():
    source = get_record_source()
    parcel = source.get_parcel("PCL-DHK-SAV-045-0558")
    assert parcel is not None
    assert parcel["parcel_id"] == "PCL-DHK-SAV-045-0558"
    assert parcel["dag_no"] == "558"
    assert parcel["is_synthetic"] is True


def test_synthetic_adapter_search():
    source = get_record_source()
    results = source.search(dag_no="558")
    assert len(results) >= 1
    assert any(r.get("dag_no") == "558" for r in results)


def test_synthetic_adapter_get_history():
    source = get_record_source()
    history = source.get_history("PCL-DHK-SAV-045-0558")
    assert isinstance(history, list)
    assert len(history) >= 1


def test_synthetic_adapter_get_cases():
    source = get_record_source()
    # Clean plot 558 has no cases
    cases = source.get_cases("PCL-DHK-SAV-045-0558")
    assert isinstance(cases, list)

    # Gulshan Plot 550 has court case
    cases_550 = source.get_cases("PCL-DHK-GUL-015-0550")
    assert len(cases_550) >= 1
    assert cases_550[0]["type"] == "court_case"


def test_custom_mock_adapter_injection():
    class MockSource(LandRecordSource):
        def get_parcel(self, parcel_id: str):
            return {"parcel_id": parcel_id, "mocked": True}
        def search(self, **kwargs):
            return [{"mocked": True}]
        def get_history(self, parcel_id: str):
            return [{"mocked": True}]
        def get_cases(self, parcel_id: str):
            return [{"mocked_case": True}]

    mock_inst = MockSource()
    set_record_source(mock_inst)
    assert get_record_source().get_parcel("test-123") == {"parcel_id": "test-123", "mocked": True}

    # Reset back to SyntheticSource
    set_record_source(SyntheticSource())
    assert get_record_source().get_parcel("test-123") is None
