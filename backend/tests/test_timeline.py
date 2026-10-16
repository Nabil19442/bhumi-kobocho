import pytest
from fastapi.testclient import TestClient
from backend.app.main import app, build_synthetic_timeline

client = TestClient(app)

# ==========================================
# PHASE 4 TESTS: SYNTHETIC PLOT PASSPORT TIMELINE
# ==========================================

def test_timeline_values_match_underlying_record():
    """Verify that timeline events are derived directly from synthetic record fields."""
    # Test rec-demo-001
    res1 = client.get("/api/passport/rec-demo-001?lang=bn")
    assert res1.status_code == 200
    p1 = res1.json()
    tl1 = p1["timeline"]
    assert len(tl1) == 3

    # Deed event matches 2021-04-12 and 1482/2021
    deed_ev = next(e for e in tl1 if e["status_code"] == "REGISTERED")
    assert deed_ev["date"] == "2021-04-12"
    assert deed_ev["year"] == "2021"
    assert "1482/2021" in deed_ev["detail_bn"]
    assert "মোঃ রফিকুল ইসলাম" in deed_ev["detail_bn"]

    # Mutation event matches MUT-2022-9014 and year 2022
    mut_ev = next(e for e in tl1 if e["status_code"] == "MUTATED")
    assert mut_ev["year"] == "2022"
    assert "MUT-2022-9014" in mut_ev["detail_bn"]

    # Test rec-demo-002: deed 2019, mutation 2020 (NOT hardcoded 2018/2022!)
    res2 = client.get("/api/passport/rec-demo-002?lang=bn")
    assert res2.status_code == 200
    p2 = res2.json()
    tl2 = p2["timeline"]
    deed_ev2 = next(e for e in tl2 if e["status_code"] == "REGISTERED")
    assert deed_ev2["date"] == "2019-11-20"
    assert deed_ev2["year"] == "2019"
    mut_ev2 = next(e for e in tl2 if e["status_code"] == "MUTATED")
    assert mut_ev2["year"] == "2020"
    assert "MUT-2020-3108" in mut_ev2["detail_bn"]

    # Test rec-demo-003: deed 2018, mutation 2018
    res3 = client.get("/api/passport/rec-demo-003?lang=bn")
    assert res3.status_code == 200
    p3 = res3.json()
    tl3 = p3["timeline"]
    deed_ev3 = next(e for e in tl3 if e["status_code"] == "REGISTERED")
    assert deed_ev3["date"] == "2018-02-15"
    assert deed_ev3["year"] == "2018"
    mut_ev3 = next(e for e in tl3 if e["status_code"] == "MUTATED")
    assert mut_ev3["year"] == "2018"
    assert "MUT-2018-0512" in mut_ev3["detail_bn"]

def test_timeline_all_events_marked_synthetic():
    """Verify that every timeline event has is_synthetic: True and disclaimer."""
    for plot_id in ["rec-demo-001", "rec-demo-002", "rec-demo-003"]:
        res = client.get(f"/api/passport/{plot_id}?lang=bn")
        assert res.status_code == 200
        for ev in res.json()["timeline"]:
            assert ev.get("is_synthetic") is True
            assert "DEMO DATA" in ev.get("disclaimer", "")

def test_timeline_missing_date_does_not_fabricate():
    """Verify that records with missing document_date do not fabricate a date."""
    mock_rec = {
        "id": "rec-test-missing-date",
        "dag_no": "100",
        "khatian_no": "200",
        "deed_no": "999/2023",
        "document_date": None,
        "last_mutation_case": None
    }
    tl = build_synthetic_timeline(mock_rec)
    deed_ev = next(e for e in tl if e["status_code"] == "REGISTERED")
    # Date must not be fabricated
    assert "তারিখ অপ্রাপ্য" in deed_ev["date"]
    assert "2023" in deed_ev["year"]

def test_timeline_missing_mutation_does_not_fabricate_event():
    """Verify that a record with no mutation case produces no mutation event."""
    mock_rec = {
        "id": "rec-test-no-mut",
        "dag_no": "500",
        "khatian_no": "600",
        "document_date": "2020-01-01",
        "deed_no": "123/2020",
        "last_mutation_case": None
    }
    tl = build_synthetic_timeline(mock_rec)
    # Only baseline survey and deed event should exist, NO mutation event
    status_codes = [e["status_code"] for e in tl]
    assert "MUTATED" not in status_codes
    assert len(tl) == 2

def test_passport_unknown_plot_returns_404():
    """Verify that unknown plot ID continues to return HTTP 404."""
    res = client.get("/api/passport/non-existent-plot-888")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()
