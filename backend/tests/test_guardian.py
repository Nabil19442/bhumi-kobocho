import pytest
from backend.app.guardian import trigger_simulation_event, get_alerts, mark_alert_reviewed

def test_case_6_simulated_record_change_event():
    """Test Case 6: Simulated record-change event -> SIMULATED alert with old/new diff."""
    alert = trigger_simulation_event("evt-001")

    # Status must be strictly SIMULATED
    assert alert["status_label"] == "SIMULATED"
    assert "SIMULATED" in alert["badge"]
    assert alert["event_id"] == "evt-001"
    assert alert["record_id"] == "rec-demo-001"

    # Must contain old/new diff report
    assert "diff_report" in alert
    assert len(alert["diff_report"]) > 0

    khatian_diff = next((d for d in alert["diff_report"] if d["field"] == "khatian_no"), None)
    assert khatian_diff is not None
    assert khatian_diff["old_value"] == "412"
    assert khatian_diff["new_value"] == "412/1"

    area_diff = next((d for d in alert["diff_report"] if d["field"] == "area_decimal"), None)
    assert area_diff is not None
    assert area_diff["old_value"] == 15.5
    assert area_diff["new_value"] == 10.0

    # Review workflow
    assert alert["is_reviewed"] is False
    reviewed = mark_alert_reviewed(alert["alert_id"])
    assert reviewed is not None
    assert reviewed["is_reviewed"] is True


def test_alert_id_uniqueness_on_rapid_triggers():
    """FIX 2: Triggering the same event twice quickly produces distinct alert IDs and review endpoint still finds them."""
    from fastapi.testclient import TestClient
    from backend.app.main import app

    alert1 = trigger_simulation_event("evt-001")
    alert2 = trigger_simulation_event("evt-001")

    assert alert1["alert_id"] != alert2["alert_id"]
    assert alert1["alert_id"].startswith("alert-evt-001-")
    assert alert2["alert_id"].startswith("alert-evt-001-")

    # Verify review endpoint finds both alerts with their new ID structure
    client = TestClient(app)
    res1 = client.post(
        f"/api/guardian/alerts/{alert1['alert_id']}/review",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    assert res1.status_code == 200
    assert res1.json()["alert"]["alert_id"] == alert1["alert_id"]
    assert res1.json()["alert"]["is_reviewed"] is True

    res2 = client.post(
        f"/api/guardian/alerts/{alert2['alert_id']}/review",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    assert res2.status_code == 200
    assert res2.json()["alert"]["alert_id"] == alert2["alert_id"]
    assert res2.json()["alert"]["is_reviewed"] is True

