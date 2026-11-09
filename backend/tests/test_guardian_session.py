"""
Tests for session-scoped Guardian alerts and bounds enforcement.
Verifies:
1. Session A's alerts are not visible to Session B.
2. Max alerts per session limit holds.
3. LRU session eviction and capacity limits hold.
4. Session ID validation (regex enforcement and rejection of invalid headers).
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.guardian import (
    trigger_simulation_event,
    get_alerts,
    reset_alerts,
    validate_session_id,
    MAX_ALERTS_PER_SESSION,
    MAX_SESSIONS,
    _SESSION_STORE,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_guardian_sessions():
    reset_alerts()
    yield
    reset_alerts()


def test_session_isolation_alerts_not_shared():
    session_a = "session-alpha-1234"
    session_b = "session-bravo-5678"

    # Trigger event in Session A
    alert_a = trigger_simulation_event("evt-001", session_id=session_a)
    assert alert_a["session_id"] == session_a

    # Get alerts for Session A via API
    res_a = client.get("/api/guardian/alerts", headers={"X-Session-ID": session_a})
    assert res_a.status_code == 200
    alerts_a = res_a.json()["alerts"]
    assert any(a["alert_id"] == alert_a["alert_id"] for a in alerts_a)

    # Get alerts for Session B via API - should NOT contain Session A's triggered alert
    res_b = client.get("/api/guardian/alerts", headers={"X-Session-ID": session_b})
    assert res_b.status_code == 200
    alerts_b = res_b.json()["alerts"]
    assert not any(a["alert_id"] == alert_a["alert_id"] for a in alerts_b)


def test_session_id_validation_regex():
    # Valid IDs
    assert validate_session_id(None) == "default"
    assert validate_session_id("") == "default"
    assert validate_session_id("valid-session-123") == "valid-session-123"
    assert validate_session_id("user_abc_12345") == "user_abc_12345"

    # Invalid IDs (too short, forbidden chars)
    with pytest.raises(ValueError):
        validate_session_id("short")  # < 8 chars

    with pytest.raises(ValueError):
        validate_session_id("invalid session with spaces")

    with pytest.raises(ValueError):
        validate_session_id("invalid!chars$in*id")

    # API returns 400 on malformed session header
    res = client.get("/api/guardian/alerts", headers={"X-Session-ID": "bad*id"})
    assert res.status_code == 400
    assert "Invalid session ID format" in res.json()["detail"]


def test_max_alerts_per_session_limit():
    session_id = "test-session-limit-999"

    # Trigger more than MAX_ALERTS_PER_SESSION
    for i in range(MAX_ALERTS_PER_SESSION + 10):
        trigger_simulation_event("evt-001", session_id=session_id)

    alerts = get_alerts(session_id=session_id)
    assert len(alerts) <= MAX_ALERTS_PER_SESSION


def test_session_store_capacity_and_eviction():
    # Fill store beyond MAX_SESSIONS
    reset_alerts()
    for i in range(MAX_SESSIONS + 20):
        sid = f"stress-session-{i:05d}"
        _SESSION_STORE.add_alert(sid, {"alert_id": f"a-{i}", "event_id": "evt-001"})

    assert _SESSION_STORE.session_count <= MAX_SESSIONS
