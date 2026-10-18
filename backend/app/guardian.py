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
        records = json.load(f)

    # Check if any record has updated demo ownership in transaction registry
    try:
        try:
            from .transaction_registry import get_parcel_by_id
        except ImportError:
            from backend.app.transaction_registry import get_parcel_by_id

        for r in records:
            p_txs = get_parcel_by_id(r.get("id"))
            if p_txs and any(tx.get("record_source") == "User-Submitted Records" for tx in p_txs):
                latest = p_txs[-1]
                r["owner_name_bn"] = latest.get("buyer_name_bn", r.get("owner_name_bn"))
                r["owner_name_en"] = latest.get("buyer_name_en", r.get("owner_name_en"))
                r["area_decimal"] = latest.get("transferred_area", r.get("area_decimal"))
                r["deed_no"] = latest.get("deed_no", r.get("deed_no"))
                r["document_date"] = latest.get("transaction_date", r.get("document_date"))
                r["current_demo_owner"] = latest.get("buyer_name_bn")
                r["previous_demo_owner"] = latest.get("seller_name_bn")
    except Exception:
        pass

    return records

def check_deed_with_guardian(deed_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Land Guardian audit routine: checks latest ownership records before evaluating a deed for duplicate sale conflicts.
    """
    try:
        from .conflict_detector import detect_conflicts
    except ImportError:
        from backend.app.conflict_detector import detect_conflicts
    return detect_conflicts(deed_dict)

def generate_guardian_risk_report(deed_or_parcel: Any) -> Dict[str, Any]:
    """
    Generates Land Guardian Evidence & Risk Report for a proposed deed or parcel inquiry.
    Identifies risk status:
    - Potential Duplicate Sale
    - Potential Ownership Conflict
    - Needs Manual Review
    - No Conflict Found in Available Records
    Collects full evidence: current demo owner, previous owner, dag, khatian, land area,
    transaction IDs, dates, and record sources.
    """
    if isinstance(deed_or_parcel, str):
        q = str(deed_or_parcel).strip()
        hist = None
        try:
            from .transaction_registry import get_parcel_by_id, find_history_for_deed
            hist = get_parcel_by_id(q) if (q.startswith("PCL-") or q.startswith("rec-")) else find_history_for_deed(dag_no=q)
        except Exception:
            pass

        if hist:
            first_tx = hist[0]
            latest_tx = hist[-1]
            deed_dict = {
                "parcel_id": latest_tx.get("parcel_id", q),
                "dag_no": str(latest_tx.get("dag_no", "558")),
                "khatian_no": str(latest_tx.get("khatian_no", "128")),
                "seller_name": first_tx.get("seller_name_bn") or "আব্দুল করিম",
                "buyer_name": "অন্য ক্রেতা (Another Buyer)",
                "area_decimal": float(latest_tx.get("transferred_area") or 10.0),
                "deed_no": "PROP-2026-9999",
                "document_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
            }
        else:
            deed_dict = {
                "parcel_id": q if q.startswith("PCL-") else ("PCL-DHK-SAV-045-0558" if "558" in q else q),
                "dag_no": "558" if "558" in q else q,
                "seller_name": "আব্দুল করিম",
                "buyer_name": "অন্য ক্রেতা (Another Buyer)",
                "area_decimal": 10.0,
                "deed_no": "PROP-2026-9999",
                "document_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
            }
    elif isinstance(deed_or_parcel, dict):
        deed_dict = deed_or_parcel
    else:
        deed_dict = {}

    analysis = check_deed_with_guardian(deed_dict)
    return analysis.get("risk_report") or analysis

def trigger_simulation_event(event_id: str) -> Dict[str, Any]:
    """
    Triggers a simulated event, computes diff between old record and changes,
    attaches Evidence & Risk Report, and returns a clearly labelled SIMULATED alert.
    """
    events = load_events()
    records = load_records()

    target_event = next((e for e in events if e.get("event_id") == event_id), None)
    if not target_event:
        raise ValueError(f"Event ID '{event_id}' not found in simulation catalog.")

    rec_id = target_event.get("record_id")
    target_record = next((r for r in records if r.get("id") == rec_id), None)
    if not target_record:
        try:
            from .transaction_registry import get_parcel_by_id
        except ImportError:
            from backend.app.transaction_registry import get_parcel_by_id
        p_txs = get_parcel_by_id(rec_id)
        if p_txs:
            target_record = {
                "id": rec_id,
                "owner_name_bn": p_txs[-1].get("buyer_name_bn", "সুলতানা জাহান"),
                "area_decimal": p_txs[-1].get("transferred_area", 10.0),
                "dag_no": p_txs[-1].get("dag_no", "558"),
                "khatian_no": p_txs[-1].get("khatian_no", "128")
            }
        else:
            target_record = {}

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

    # Generate Evidence & Risk Report for this event
    sim_deed = {
        "parcel_id": rec_id,
        "dag_no": target_record.get("dag_no", "558") if target_record else "558",
        "khatian_no": target_record.get("khatian_no", "128") if target_record else "128",
        "seller_name": "আব্দুল করিম",
        "buyer_name": "অন্য ক্রেতা (Another Buyer)",
        "area_decimal": 10.0,
        "deed_no": "PROP-2026-9999",
        "document_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }
    risk_report = generate_guardian_risk_report(sim_deed)

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
        "risk_report": risk_report,
        "evidence": risk_report.get("evidence"),
        "conflict_explanation": risk_report.get("conflict_explanation"),
        "evidence_timeline": risk_report.get("evidence_timeline", []),
        "evidence_details": risk_report.get("evidence_details", []),
        "risk_status": risk_report.get("risk_status", "Potential Duplicate Sale"),
        "risk_status_bn": risk_report.get("risk_status_bn", "সম্ভাব্য দ্বৈত বিক্রয়"),
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

