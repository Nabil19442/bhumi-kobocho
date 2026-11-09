"""
Transaction Registry for Bhumi Kobocho (ভূমি কবচ)
Loads, indexes, and manages ~20,000 synthetic land transaction records with connected parcel histories.
Uses indexed SQLite backend (land_transactions.db) with automatic build from generate_transactions.py or JSON.

CRITICAL INTEGRITY:
- 100% separate from the 20,000 ML land price intelligence dataset.
- Stable Parcel IDs (PCL-DIST-UPZ-MOUZA-DAG).
- Connected deed chains and chronological land histories.
- All records marked with is_synthetic=True and demo disclaimers.
"""

import os
import re
import json
import sqlite3
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime, date

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "land_transactions.db")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "land_transactions.json")
USER_TRANSACTIONS_FILE = os.path.join(DATA_DIR, "user_transactions.json")

BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯"
WESTERN_DIGITS = "0123456789"
BN_TO_EN_DIGIT_MAP = str.maketrans(BANGLA_DIGITS, WESTERN_DIGITS)


def normalize_digits(text: Optional[Any]) -> str:
    if text is None:
        return ""
    return str(text).strip().translate(BN_TO_EN_DIGIT_MAP)


_REGISTRY_LOCK = threading.Lock()
_TRANSACTIONS_CACHE: Optional[List[Dict[str, Any]]] = None

DAG_558_BASELINE: Dict[str, Any] = {
    "id": "rec-demo-dag-558-baseline",
    "parcel_id": "PCL-DHK-SAV-045-0558",
    "deed_no": "1088/2016",
    "transaction_date": "2016-04-10",
    "division": "ঢাকা (Dhaka)",
    "district": "ঢাকা (Dhaka)",
    "upazila": "সাভার (Savar)",
    "mouza": "সাভার (Savar)",
    "jl_no": "45",
    "khatian_no": "128",
    "dag_no": "558",
    "land_class": "নাল (Nal / Agricultural)",
    "total_parcel_area": 10.0,
    "transferred_area": 10.0,
    "seller_remaining_area": 10.0,
    "seller_name_bn": "বাংলাদেশ সরকার (CS Baseline)",
    "seller_name_en": "Govt of Bangladesh (CS Baseline)",
    "seller_nid_last4": "0000",
    "buyer_name_bn": "আব্দুল করিম",
    "buyer_name_en": "Abdul Karim",
    "buyer_nid_last4": "5580",
    "prior_deed_no": "CS-1990-01",
    "parent_khatian_no": "CS-128",
    "transaction_type": "সিএস রেকর্ড / খতিয়ান স্বীকৃতি",
    "conflict_scenario": "BASELINE_OWNERSHIP",
    "scenario_role": "baseline_acquisition",
    "expected_conflict": None,
    "is_synthetic": True,
    "record_source": "Officially Verified Records",
    "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation.",
}

PARCEL_ID_ALIASES = {
    "PCL-RAJ-PAB-041-1058": "PCL-DHK-MIR-028-1058",
    "PCL-KHL-RPS-018-1540": "PCL-SYL-SAD-032-1540",
    "PCL-DHK-SHT-012-1234": "PCL-DHK-SHA-012-1234",
    "558": "PCL-DHK-SAV-045-0558",
    "DAG-558": "PCL-DHK-SAV-045-0558",
    "DAG-0558": "PCL-DHK-SAV-045-0558",
}


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    return conn


def _generate_synthetic_20k() -> List[Dict[str, Any]]:
    """Deterministic in-memory generator of ~20,000 synthetic land transaction records."""
    from backend.data.generate_transactions import generate_dataset

    return generate_dataset()


def ensure_sqlite_db() -> None:
    """Ensures SQLite database exists with proper tables, indexes, and seed transactions."""
    if os.path.exists(DB_PATH) and os.path.getsize(DB_PATH) > 100000:
        return

    os.makedirs(DATA_DIR, exist_ok=True)
    with _REGISTRY_LOCK:
        if os.path.exists(DB_PATH) and os.path.getsize(DB_PATH) > 100000:
            return

        records: List[Dict[str, Any]] = []
        if os.path.exists(TRANSACTIONS_FILE):
            try:
                with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    records = json.load(f)
            except Exception:
                records = []

        if not records:
            records = _generate_synthetic_20k()
            try:
                with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
                    json.dump(records, f, ensure_ascii=False, indent=2)
            except Exception:
                pass

        # Guarantee baseline record for Dag 558 exists
        has_558 = any(
            r.get("id") == DAG_558_BASELINE["id"]
            or (
                normalize_digits(r.get("dag_no")) == "558"
                and r.get("conflict_scenario") == "BASELINE_OWNERSHIP"
            )
            for r in records
        )
        if not has_558:
            records.append(DAG_558_BASELINE)

        conn = _get_connection()
        cur = conn.cursor()
        cur.execute(
            """
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            parcel_id TEXT,
            deed_no TEXT,
            norm_deed_no TEXT,
            transaction_date TEXT,
            mouza TEXT,
            khatian_no TEXT,
            norm_khatian_no TEXT,
            parent_khatian_no TEXT,
            norm_parent_khatian_no TEXT,
            dag_no TEXT,
            norm_dag_no TEXT,
            conflict_scenario TEXT,
            is_user_submitted INTEGER DEFAULT 0,
            data_json TEXT
        )
        """
        )
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_parcel_id ON transactions (parcel_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_norm_dag ON transactions (norm_dag_no)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_norm_deed ON transactions (norm_deed_no)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_norm_khatian ON transactions (norm_khatian_no)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_mouza ON transactions (mouza)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_tx_scenario ON transactions (conflict_scenario)")

        insert_rows = []
        for r in records:
            if not r.get("record_source"):
                if "CS-" in str(r.get("deed_no", "")):
                    r["record_source"] = "Officially Verified Records"
                else:
                    r["record_source"] = "Synthetic Demo Records"

            insert_rows.append(
                (
                    r.get("id"),
                    r.get("parcel_id"),
                    r.get("deed_no"),
                    normalize_digits(r.get("deed_no")),
                    r.get("transaction_date"),
                    r.get("mouza"),
                    str(r.get("khatian_no", "")),
                    normalize_digits(r.get("khatian_no")),
                    str(r.get("parent_khatian_no", "")),
                    normalize_digits(r.get("parent_khatian_no")),
                    str(r.get("dag_no", "")),
                    normalize_digits(r.get("dag_no")),
                    r.get("conflict_scenario"),
                    0,
                    json.dumps(r, ensure_ascii=False),
                )
            )

        cur.executemany(
            """
        INSERT OR REPLACE INTO transactions (
            id, parcel_id, deed_no, norm_deed_no, transaction_date, mouza,
            khatian_no, norm_khatian_no, parent_khatian_no, norm_parent_khatian_no,
            dag_no, norm_dag_no, conflict_scenario, is_user_submitted, data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            insert_rows,
        )

        # Merge user transactions if present
        if os.path.exists(USER_TRANSACTIONS_FILE):
            try:
                with open(USER_TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    user_txs = json.load(f)
                for utx in user_txs:
                    cur.execute(
                        """
                    INSERT OR REPLACE INTO transactions (
                        id, parcel_id, deed_no, norm_deed_no, transaction_date, mouza,
                        khatian_no, norm_khatian_no, parent_khatian_no, norm_parent_khatian_no,
                        dag_no, norm_dag_no, conflict_scenario, is_user_submitted, data_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                        (
                            utx.get("id"),
                            utx.get("parcel_id"),
                            utx.get("deed_no"),
                            normalize_digits(utx.get("deed_no")),
                            utx.get("transaction_date"),
                            utx.get("mouza"),
                            str(utx.get("khatian_no", "")),
                            normalize_digits(utx.get("khatian_no")),
                            str(utx.get("parent_khatian_no", "")),
                            normalize_digits(utx.get("parent_khatian_no")),
                            str(utx.get("dag_no", "")),
                            normalize_digits(utx.get("dag_no")),
                            utx.get("conflict_scenario"),
                            1,
                            json.dumps(utx, ensure_ascii=False),
                        ),
                    )
            except Exception:
                pass

        conn.commit()
        conn.close()


def load_transactions() -> List[Dict[str, Any]]:
    """Loads all transactions from SQLite, returning list of records."""
    global _TRANSACTIONS_CACHE
    if _TRANSACTIONS_CACHE is not None:
        return _TRANSACTIONS_CACHE

    ensure_sqlite_db()
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT data_json FROM transactions ORDER BY transaction_date ASC")
        rows = cur.fetchall()
        records = [json.loads(r[0]) for r in rows]
        _TRANSACTIONS_CACHE = records
        return records
    finally:
        conn.close()


def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    ensure_sqlite_db()
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT data_json FROM transactions WHERE id = ? LIMIT 1", (tx_id,))
        row = cur.fetchone()
        return json.loads(row[0]) if row else None
    finally:
        conn.close()


def get_parcel_by_id(parcel_id: str) -> List[Dict[str, Any]]:
    ensure_sqlite_db()
    if not parcel_id:
        return []
    clean_id = str(parcel_id).strip()

    conn = _get_connection()
    try:
        cur = conn.cursor()
        # 1. Direct match on parcel_id
        cur.execute(
            "SELECT data_json FROM transactions WHERE parcel_id = ? ORDER BY transaction_date ASC",
            (clean_id,),
        )
        rows = cur.fetchall()
        if rows:
            return [json.loads(r[0]) for r in rows]

        # 2. Known alias match
        canonical = PARCEL_ID_ALIASES.get(clean_id)
        if canonical:
            cur.execute(
                "SELECT data_json FROM transactions WHERE parcel_id = ? ORDER BY transaction_date ASC",
                (canonical,),
            )
            rows = cur.fetchall()
            if rows:
                return [json.loads(r[0]) for r in rows]

        # 3. Dag No or numeric search
        norm_id = normalize_digits(clean_id)
        if norm_id:
            cur.execute(
                "SELECT data_json FROM transactions WHERE norm_dag_no = ? ORDER BY transaction_date ASC",
                (norm_id,),
            )
            rows = cur.fetchall()
            if rows:
                return [json.loads(r[0]) for r in rows]

        return []
    finally:
        conn.close()


def find_history_for_deed(
    dag_no: Optional[str] = None,
    khatian_no: Optional[str] = None,
    mouza: Optional[str] = None,
    deed_no: Optional[str] = None,
    parcel_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Searches synthetic land records for matching parcel transaction history.
    Uses indexed SQLite queries. If no matching parcel exists, returns empty list.
    """
    ensure_sqlite_db()

    # 1. Direct search by Parcel ID
    if parcel_id:
        res = get_parcel_by_id(parcel_id)
        if res:
            return res

    conn = _get_connection()
    try:
        cur = conn.cursor()

        # 2. Search by Deed No
        norm_deed = normalize_digits(deed_no)
        if norm_deed:
            cur.execute(
                "SELECT parcel_id, data_json FROM transactions WHERE norm_deed_no = ? LIMIT 1",
                (norm_deed,),
            )
            row = cur.fetchone()
            if row:
                matched_pid = row[0]
                if matched_pid:
                    return get_parcel_by_id(matched_pid)
                return [json.loads(row[1])]

        # 3. Search by Dag No and Khatian No
        norm_dag = normalize_digits(dag_no)
        norm_khatian = normalize_digits(khatian_no)

        if norm_dag:
            cur.execute(
                "SELECT parcel_id, mouza, norm_khatian_no, norm_parent_khatian_no, data_json "
                "FROM transactions WHERE norm_dag_no = ? ORDER BY transaction_date ASC",
                (norm_dag,),
            )
            candidates = cur.fetchall()
            if not candidates:
                return []

            # If mouza provided, filter by mouza substring
            if mouza:
                clean_mouza = str(mouza).strip().lower()
                mouza_matches = [
                    c
                    for c in candidates
                    if clean_mouza in str(c[1] or "").lower()
                    or str(c[1] or "").lower() in clean_mouza
                ]
                if mouza_matches:
                    candidates = mouza_matches

            # If khatian provided, filter
            if norm_khatian:
                khatian_matches = [
                    c
                    for c in candidates
                    if c[2] == norm_khatian or c[3] == norm_khatian
                ]
                if khatian_matches:
                    matched_pid = khatian_matches[0][0]
                    if matched_pid:
                        return get_parcel_by_id(matched_pid)
                    return [json.loads(k[4]) for k in khatian_matches]

            # Return transactions for the first candidate's parcel
            matched_pid = candidates[0][0]
            if matched_pid:
                return get_parcel_by_id(matched_pid)
            return [json.loads(c[4]) for c in candidates]

        return []
    finally:
        conn.close()


def get_scenario_records() -> List[Dict[str, Any]]:
    """Returns the explicitly created scenario records for testing and demonstration."""
    ensure_sqlite_db()
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT data_json FROM transactions WHERE conflict_scenario IS NOT NULL ORDER BY transaction_date ASC"
        )
        return [json.loads(r[0]) for r in cur.fetchall()]
    finally:
        conn.close()


def get_party_holdings_on_parcel(
    parcel_history: List[Dict[str, Any]], party_name: Optional[str]
) -> Dict[str, Any]:
    """
    Calculates a party's total acquired area, total transferred area, and current remaining balance
    on a specific parcel history using robust Bengali/English name matching.
    """
    if not party_name or not parcel_history:
        return {
            "acquired": 0.0,
            "transferred": 0.0,
            "balance": 0.0,
            "acquisitions": [],
            "transfers": [],
        }

    try:
        from .names import compute_name_similarity
    except ImportError:
        from backend.app.names import compute_name_similarity

    clean_party = str(party_name).strip()
    acquired = 0.0
    transferred = 0.0
    acquisitions: List[Dict[str, Any]] = []
    transfers: List[Dict[str, Any]] = []

    def matches(name_candidate: Any) -> bool:
        if not name_candidate:
            return False
        cand = str(name_candidate).strip()
        if cand == clean_party or clean_party in cand or cand in clean_party:
            return True
        try:
            sim = compute_name_similarity(cand, clean_party)
            return sim >= 0.70
        except Exception:
            return False

    sorted_history = sorted(parcel_history, key=lambda x: str(x.get("transaction_date", "")))

    for tx in sorted_history:
        # Check acquisition (party was buyer)
        b_bn = tx.get("buyer_name_bn") or tx.get("buyer_name")
        b_en = tx.get("buyer_name_en")
        if matches(b_bn) or matches(b_en):
            try:
                area = float(tx.get("transferred_area", 0.0))
            except (ValueError, TypeError):
                area = 0.0
            acquired += area
            acquisitions.append(tx)

        # Check transfer out (party was seller)
        s_bn = tx.get("seller_name_bn") or tx.get("seller_name")
        s_en = tx.get("seller_name_en")
        if matches(s_bn) or matches(s_en):
            try:
                area = float(tx.get("transferred_area", 0.0))
            except (ValueError, TypeError):
                area = 0.0
            transferred += area
            transfers.append(tx)

    # Initial baseline owner who held the parcel before any transfer took place
    if acquired == 0.0 and sorted_history:
        first_tx = sorted_history[0]
        s_bn = first_tx.get("seller_name_bn") or first_tx.get("seller_name")
        s_en = first_tx.get("seller_name_en")
        if matches(s_bn) or matches(s_en):
            try:
                tot = float(
                    first_tx.get("total_parcel_area")
                    or first_tx.get("seller_remaining_area")
                    or 0.0
                )
            except (ValueError, TypeError):
                tot = 10.0
            acquired = tot
            acquisitions.append(first_tx)

    balance = max(0.0, round(acquired - transferred, 2))
    return {
        "acquired": acquired,
        "transferred": transferred,
        "balance": balance,
        "acquisitions": acquisitions,
        "transfers": transfers,
    }


def _save_user_transaction(new_record: Dict[str, Any]) -> None:
    """Persists user confirmed transfer both to SQLite DB and USER_TRANSACTIONS_FILE on disk."""
    ensure_sqlite_db()
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
        INSERT OR REPLACE INTO transactions (
            id, parcel_id, deed_no, norm_deed_no, transaction_date, mouza,
            khatian_no, norm_khatian_no, parent_khatian_no, norm_parent_khatian_no,
            dag_no, norm_dag_no, conflict_scenario, is_user_submitted, data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                new_record.get("id"),
                new_record.get("parcel_id"),
                new_record.get("deed_no"),
                normalize_digits(new_record.get("deed_no")),
                new_record.get("transaction_date"),
                new_record.get("mouza"),
                str(new_record.get("khatian_no", "")),
                normalize_digits(new_record.get("khatian_no")),
                str(new_record.get("parent_khatian_no", "")),
                normalize_digits(new_record.get("parent_khatian_no")),
                str(new_record.get("dag_no", "")),
                normalize_digits(new_record.get("dag_no")),
                new_record.get("conflict_scenario"),
                1,
                json.dumps(new_record, ensure_ascii=False),
            ),
        )
        conn.commit()
    finally:
        conn.close()

    # Also update disk file for persistence backup
    with _REGISTRY_LOCK:
        user_records: List[Dict[str, Any]] = []
        if os.path.exists(USER_TRANSACTIONS_FILE):
            try:
                with open(USER_TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    user_records = json.load(f)
            except Exception:
                user_records = []

        user_records = [r for r in user_records if r.get("id") != new_record["id"]]
        user_records.append(new_record)

        os.makedirs(DATA_DIR, exist_ok=True)
        temp_file = f"{USER_TRANSACTIONS_FILE}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(user_records, f, ensure_ascii=False, indent=2)
        os.replace(temp_file, USER_TRANSACTIONS_FILE)


def reset_user_transactions() -> None:
    """Clears persisted user transactions and resets cache for test isolation."""
    global _TRANSACTIONS_CACHE
    ensure_sqlite_db()
    conn = _get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM transactions WHERE is_user_submitted = 1 OR id LIKE 'rec-prop-%'"
        )
        conn.commit()
    finally:
        conn.close()

    with _REGISTRY_LOCK:
        if os.path.exists(USER_TRANSACTIONS_FILE):
            try:
                os.remove(USER_TRANSACTIONS_FILE)
            except Exception:
                pass
        _TRANSACTIONS_CACHE = None


def record_proposed_purchase(purchase_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Records a user-proposed land purchase in the synthetic registry for hackathon demo.
    Updates the parcel's transaction history and Plot Passport.
    Persists confirmed demo transfer to SQLite DB and disk.
    """
    import uuid

    parcel_id = purchase_data.get("parcel_id")
    dag_no = normalize_digits(purchase_data.get("dag_no"))
    khatian_no = normalize_digits(purchase_data.get("khatian_no"))

    if not parcel_id:
        if dag_no == "558":
            parcel_id = "PCL-DHK-SAV-045-0558"
        elif dag_no:
            dag_matches = get_parcel_by_id(dag_no)
            if dag_matches:
                parcel_id = dag_matches[0].get("parcel_id")
            else:
                mouza_clean = (purchase_data.get("mouza") or "DEMO").replace(" ", "")
                parcel_id = f"PCL-PROP-{mouza_clean[:4].upper()}-{dag_no or '000'}"
        else:
            mouza_clean = (purchase_data.get("mouza") or "DEMO").replace(" ", "")
            parcel_id = f"PCL-PROP-{mouza_clean[:4].upper()}-{dag_no or '000'}"

    if parcel_id in PARCEL_ID_ALIASES:
        parcel_id = PARCEL_ID_ALIASES[parcel_id]

    parcel_history = get_parcel_by_id(parcel_id)
    if not parcel_history and dag_no:
        parcel_history = get_parcel_by_id(dag_no)

    seller_name = purchase_data.get("seller_name")
    if not seller_name:
        if parcel_history:
            seller_name = parcel_history[-1].get("buyer_name_bn")
        else:
            seller_name = "আব্দুল করিম" if dag_no == "558" else "অনুলিখিত বিক্রেতা"

    buyer_name = purchase_data.get("buyer_name") or "সুলতানা জাহান"

    try:
        transferred_area = float(purchase_data.get("area_decimal") or 0.0)
    except (ValueError, TypeError):
        transferred_area = 0.0

    try:
        total_area = float(
            parcel_history[0].get("total_parcel_area", 10.0) if parcel_history else 10.0
        )
    except (ValueError, TypeError):
        total_area = 10.0

    holdings = get_party_holdings_on_parcel(parcel_history, seller_name)
    if holdings["acquired"] > 0:
        available_seller_balance = holdings["balance"]
    else:
        try:
            available_seller_balance = (
                float(parcel_history[-1].get("seller_remaining_area", total_area))
                if parcel_history
                else total_area
            )
        except (ValueError, TypeError):
            available_seller_balance = total_area

    new_remaining = max(0.0, round(available_seller_balance - transferred_area, 2))

    new_record = {
        "id": f"rec-prop-{uuid.uuid4().hex[:8]}",
        "parcel_id": parcel_id,
        "deed_no": purchase_data.get("proposed_deed_no")
        or purchase_data.get("deed_no")
        or f"PROP-{date.today().year}-{uuid.uuid4().hex[:4].upper()}",
        "transaction_date": purchase_data.get("transaction_date") or date.today().isoformat(),
        "division": purchase_data.get("division")
        or (parcel_history[0].get("division") if parcel_history else "ঢাকা (Dhaka)"),
        "district": purchase_data.get("district")
        or (parcel_history[0].get("district") if parcel_history else "ঢাকা (Dhaka)"),
        "upazila": purchase_data.get("upazila")
        or (parcel_history[0].get("upazila") if parcel_history else "সাভার (Savar)"),
        "mouza": purchase_data.get("mouza")
        or (parcel_history[0].get("mouza") if parcel_history else "সাভার (Savar)"),
        "jl_no": purchase_data.get("jl_no")
        or (parcel_history[0].get("jl_no") if parcel_history else "45"),
        "khatian_no": str(
            purchase_data.get("khatian_no")
            or (parcel_history[-1].get("khatian_no") if parcel_history else "128")
        ),
        "dag_no": str(
            purchase_data.get("dag_no")
            or (parcel_history[-1].get("dag_no") if parcel_history else "558")
        ),
        "land_class": purchase_data.get("land_class")
        or (
            parcel_history[0].get("land_class")
            if parcel_history
            else "নাল (Nal / Agricultural)"
        ),
        "total_parcel_area": total_area,
        "transferred_area": transferred_area,
        "seller_remaining_area": new_remaining,
        "seller_name": seller_name,
        "seller_name_bn": seller_name,
        "seller_name_en": purchase_data.get("seller_name_en", "Prior Owner"),
        "buyer_name": buyer_name,
        "buyer_name_bn": buyer_name,
        "buyer_name_en": purchase_data.get("buyer_name_en", "Current Owner"),
        "prior_deed_no": parcel_history[-1].get("deed_no") if parcel_history else "NONE",
        "parent_khatian_no": parcel_history[-1].get("khatian_no")
        if parcel_history
        else "NONE",
        "transaction_type": "Proposed Land Purchase (প্রস্তাবিত জমি ক্রয়)",
        "record_source": "User-Submitted Records",
        "verification_status": "Proposed / Pending Official Registration",
        "is_synthetic": True,
        "is_partial_purchase": transferred_area < total_area,
        "disclaimer": "DEMO DATA — not a legal verdict. This proposed purchase does NOT legally transfer ownership or complete government registration.",
    }

    _save_user_transaction(new_record)
    global _TRANSACTIONS_CACHE
    _TRANSACTIONS_CACHE = None

    updated_history = get_parcel_by_id(parcel_id)
    return {
        "success": True,
        "record": new_record,
        "recorded_transaction": new_record,
        "parcel_id": parcel_id,
        "history_count": len(updated_history),
        "transferred_area": transferred_area,
        "seller_remaining_area": new_remaining,
        "current_owner_bn": buyer_name,
        "previous_owner_bn": seller_name,
        "disclaimer": new_record["disclaimer"],
        "legal_disclaimer": new_record["disclaimer"],
    }
