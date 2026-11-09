import json
import os
import re
import time
import uuid
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")

# Session limits and validation
SESSION_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{8,64}$")
MAX_SESSIONS = 500
MAX_ALERTS_PER_SESSION = 50
SESSION_TTL_SECONDS = 86400  # 24 hours


def validate_session_id(session_id: Optional[str]) -> str:
    """
    Validates a client-provided session ID header.
    Defaults to 'default' if None or blank.
    Raises ValueError if formatted improperly.
    """
    if not session_id or not str(session_id).strip():
        return "default"
    clean_sid = str(session_id).strip()
    if clean_sid == "default":
        return "default"
    if not SESSION_ID_REGEX.match(clean_sid):
        raise ValueError(
            "Invalid session ID format. Must be 8-64 alphanumeric characters, dashes, or underscores."
        )
    return clean_sid


class SessionAlertStore:
    def __init__(self):
        self._lock = threading.Lock()
        # session_id -> {"last_active": float, "alerts": List[Dict[str, Any]]}
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def _cleanup_unlocked(self, now: float) -> None:
        # 1. Expire stale sessions older than TTL
        expired = [
            sid
            for sid, data in self._sessions.items()
            if (now - data["last_active"]) > SESSION_TTL_SECONDS
        ]
        for sid in expired:
            del self._sessions[sid]

        # 2. If still exceeding MAX_SESSIONS, evict least recently active sessions (LRU)
        if len(self._sessions) > MAX_SESSIONS:
            sorted_sids = sorted(
                self._sessions.keys(), key=lambda k: self._sessions[k]["last_active"]
            )
            excess = len(self._sessions) - MAX_SESSIONS
            for sid in sorted_sids[:excess]:
                del self._sessions[sid]

    def add_alert(self, session_id: str, alert: Dict[str, Any]) -> None:
        now = time.time()
        with self._lock:
            data = self._sessions.setdefault(
                session_id, {"last_active": now, "alerts": []}
            )
            data["last_active"] = now
            data["alerts"].insert(0, alert)
            if len(data["alerts"]) > MAX_ALERTS_PER_SESSION:
                data["alerts"] = data["alerts"][:MAX_ALERTS_PER_SESSION]
            self._cleanup_unlocked(now)

    def get_alerts(self, session_id: str) -> List[Dict[str, Any]]:
        now = time.time()
        with self._lock:
            self._cleanup_unlocked(now)
            if session_id not in self._sessions:
                return []
            self._sessions[session_id]["last_active"] = now
            return [dict(a) for a in self._sessions[session_id]["alerts"]]

    def mark_reviewed(
        self, alert_id: str, session_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        now = time.time()
        with self._lock:
            self._cleanup_unlocked(now)
            target_sessions = (
                [session_id]
                if (session_id and session_id in self._sessions)
                else list(self._sessions.keys())
            )
            for sid in target_sessions:
                for a in self._sessions[sid]["alerts"]:
                    if a["alert_id"] == alert_id:
                        a["is_reviewed"] = True
                        self._sessions[sid]["last_active"] = now
                        return dict(a)
            return None

    def clear(self, session_id: Optional[str] = None) -> None:
        with self._lock:
            if session_id:
                self._sessions.pop(session_id, None)
            else:
                self._sessions.clear()

    @property
    def session_count(self) -> int:
        with self._lock:
            return len(self._sessions)


_SESSION_STORE = SessionAlertStore()


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


def trigger_simulation_event(
    event_id: str, session_id: str = "default"
) -> Dict[str, Any]:
    """
    Triggers a simulated event, computes diff between old record and changes,
    attaches Evidence & Risk Report, and scopes the SIMULATED alert to the session.
    """
    clean_sid = validate_session_id(session_id)
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

    microsecond_ts = int(datetime.now(timezone.utc).timestamp() * 1_000_000)
    short_hex = uuid.uuid4().hex[:8]
    alert = {
        "alert_id": f"alert-{event_id}-{microsecond_ts}-{short_hex}",
        "session_id": clean_sid,
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

    _SESSION_STORE.add_alert(clean_sid, alert)
    return alert


def get_alerts(session_id: str = "default") -> List[Dict[str, Any]]:
    clean_sid = validate_session_id(session_id)
    alerts = _SESSION_STORE.get_alerts(clean_sid)
    if not alerts:
        events = load_events()
        if events:
            trigger_simulation_event(events[0]["event_id"], session_id=clean_sid)
            alerts = _SESSION_STORE.get_alerts(clean_sid)
    return alerts


def mark_alert_reviewed(
    alert_id: str, session_id: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    clean_sid = validate_session_id(session_id) if session_id else None
    return _SESSION_STORE.mark_reviewed(alert_id, session_id=clean_sid)


def reset_alerts(session_id: Optional[str] = None) -> None:
    """Reset active alerts for test isolation."""
    clean_sid = validate_session_id(session_id) if session_id else None
    _SESSION_STORE.clear(session_id=clean_sid)
