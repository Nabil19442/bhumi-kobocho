import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

import threading

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")

# In-memory store for active alerts in demo session protected by threading.Lock
_LOCK = threading.Lock()
_ACTIVE_ALERTS: List[Dict[str, Any]] = []

def load_events() -> List[Dict[str, Any]]:
    if not os.path.exists(EVENTS_FILE):
        return []
    with open(EVENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_records() -> List[Dict[str, Any]]:
    if not os.path.exists(RECORDS_FILE):
        return []
    with open(RECORDS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def trigger_simulation_event(event_id: str) -> Dict[str, Any]:
    """
    Triggers a simulated event, computes diff between old record and changes,
    and returns a clearly labelled SIMULATED alert.
    """
    events = load_events()
    records = load_records()

    target_event = next((e for e in events if e.get("event_id") == event_id), None)
    if not target_event:
        raise ValueError(f"Event ID '{event_id}' not found in simulation catalog.")

    rec_id = target_event.get("record_id")
    target_record = next((r for r in records if r.get("id") == rec_id), {})

    field_changes = target_event.get("field_changes", {})
    diff_report = []

    for field, change in field_changes.items():
        diff_report.append({
            "field": field,
            "old_value": change.get("old_value", target_record.get(field, "N/A")),
            "new_value": change.get("new_value"),
            "note_bn": change.get("note_bn", ""),
            "note_en": change.get("note_en", ""),
            "change_type": "modified"
        })

    alert = {
        "alert_id": f"alert-{event_id}-{int(datetime.now().timestamp())}",
        "event_id": event_id,
        "record_id": rec_id,
        "status_label": "SIMULATED",
        "badge": "⚠️ SIMULATED DEMO ALERT",
        "badge_bn": "⚠️ সিমুলেটেড ডেমো সতর্কতা",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": target_event.get("event_type"),
        "title_bn": target_event.get("title_bn"),
        "title_en": target_event.get("title_en"),
        "description_bn": target_event.get("description_bn"),
        "description_en": target_event.get("description_en"),
        "action_recommendation_bn": target_event.get("action_recommendation_bn"),
        "action_recommendation_en": target_event.get("action_recommendation_en"),
        "source_system_mock": target_event.get("source_system_mock", "Land Registry Demo Feed"),
        "diff_report": diff_report,
        "is_reviewed": False,
        "disclaimer": "DEMO DATA — not a legal verdict. This alert is a synthetic simulation for demonstration purposes."
    }

    with _LOCK:
        _ACTIVE_ALERTS.insert(0, alert)
    return alert

def get_alerts() -> List[Dict[str, Any]]:
    # If no alerts triggered yet, initialize with the default simulated event
    with _LOCK:
        has_alerts = len(_ACTIVE_ALERTS) > 0
    if not has_alerts:
        events = load_events()
        if events:
            trigger_simulation_event(events[0]["event_id"])
    with _LOCK:
        return [dict(a) for a in _ACTIVE_ALERTS]

def mark_alert_reviewed(alert_id: str) -> Optional[Dict[str, Any]]:
    with _LOCK:
        for a in _ACTIVE_ALERTS:
            if a["alert_id"] == alert_id:
                a["is_reviewed"] = True
                return dict(a)
    return None

def reset_alerts() -> None:
    """Reset active alerts for test isolation."""
    with _LOCK:
        _ACTIVE_ALERTS.clear()

