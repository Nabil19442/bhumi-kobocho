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
