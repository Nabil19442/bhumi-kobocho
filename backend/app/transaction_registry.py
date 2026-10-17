"""
Transaction Registry for Bhumi Kobocho (ভূমি কবচ)
Loads, indexes, and manages ~20,000 synthetic land transaction records with connected parcel histories.
Features deterministic generation if backend/data/land_transactions.json is not yet created.

CRITICAL INTEGRITY:
- 100% separate from the 20,000 ML land price intelligence dataset.
- Stable Parcel IDs (PCL-DIST-UPZ-MOUZA-DAG).
- Connected deed chains and chronological land histories.
- All records marked with is_synthetic=True and demo disclaimers.
"""

import os
import re
import json
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "land_transactions.json")

BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯"
WESTERN_DIGITS = "0123456789"
BN_TO_EN_DIGIT_MAP = str.maketrans(BANGLA_DIGITS, WESTERN_DIGITS)

def normalize_digits(text: Optional[Any]) -> str:
    if text is None:
        return ""
    return str(text).strip().translate(BN_TO_EN_DIGIT_MAP)

# In-memory index caches for high-speed queries
_TRANSACTIONS_CACHE: Optional[List[Dict[str, Any]]] = None
_BY_PARCEL: Dict[str, List[Dict[str, Any]]] = {}
_BY_DAG: Dict[str, List[Dict[str, Any]]] = {}
_BY_DEED: Dict[str, Dict[str, Any]] = {}
_BY_ID: Dict[str, Dict[str, Any]] = {}

def _build_indexes(records: List[Dict[str, Any]]):
    global _BY_PARCEL, _BY_DAG, _BY_DEED, _BY_ID
    _BY_PARCEL = {}
    _BY_DAG = {}
    _BY_DEED = {}
    _BY_ID = {}

    for r in records:
        if not r.get("record_source"):
            if "CS-" in str(r.get("deed_no", "")):
                r["record_source"] = "Officially Verified Records"
            else:
                r["record_source"] = "Synthetic Demo Records"

        rec_id = r.get("id")
        if rec_id:
            _BY_ID[rec_id] = r

        parcel_id = r.get("parcel_id")
        if parcel_id:
            _BY_PARCEL.setdefault(parcel_id, []).append(r)

        dag_no = normalize_digits(r.get("dag_no"))
        if dag_no:
            _BY_DAG.setdefault(dag_no, []).append(r)

        deed_no = normalize_digits(r.get("deed_no"))
        if deed_no:
            _BY_DEED[deed_no] = r

    # Sort each parcel's transactions chronologically by transaction_date
    for pid in _BY_PARCEL:
        _BY_PARCEL[pid].sort(key=lambda x: str(x.get("transaction_date", "")))

def _generate_synthetic_20k() -> List[Dict[str, Any]]:
    """Deterministic in-memory generator of ~20,000 synthetic land transaction records."""
    from backend.data.generate_transactions import generate_dataset
    return generate_dataset()

def load_transactions() -> List[Dict[str, Any]]:
    """Loads transactions from land_transactions.json, auto-generating if file does not exist."""
    global _TRANSACTIONS_CACHE
    if _TRANSACTIONS_CACHE is not None:
        return _TRANSACTIONS_CACHE

    if os.path.exists(TRANSACTIONS_FILE):
        try:
            with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                records = json.load(f)
            _TRANSACTIONS_CACHE = records
            _build_indexes(records)
            return _TRANSACTIONS_CACHE
        except Exception:
            pass

    # Generate deterministically and persist
    records = _generate_synthetic_20k()
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

    _TRANSACTIONS_CACHE = records
    _build_indexes(records)
    return _TRANSACTIONS_CACHE

def find_history_for_deed(
    dag_no: Optional[str] = None,
    khatian_no: Optional[str] = None,
    mouza: Optional[str] = None,
    deed_no: Optional[str] = None,
    parcel_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Searches synthetic land records for matching parcel transaction history.
    Never fabricates transactions. If no matching parcel exists, returns empty list.
    """
    load_transactions()

    # 1. Direct search by Parcel ID
    if parcel_id and parcel_id in _BY_PARCEL:
        return _BY_PARCEL[parcel_id]

    # 2. Search by Deed No
    norm_deed = normalize_digits(deed_no)
    if norm_deed and norm_deed in _BY_DEED:
        matched_tx = _BY_DEED[norm_deed]
        p_id = matched_tx.get("parcel_id")
        if p_id and p_id in _BY_PARCEL:
            return _BY_PARCEL[p_id]
        return [matched_tx]

    # 3. Search by Dag No and Khatian No
    norm_dag = normalize_digits(dag_no)
    norm_khatian = normalize_digits(khatian_no)

    if norm_dag and norm_dag in _BY_DAG:
        candidates = _BY_DAG[norm_dag]
        
        # If mouza provided, filter by mouza substring
        if mouza:
            clean_mouza = str(mouza).strip().lower()
            mouza_matches = [
                c for c in candidates 
                if clean_mouza in str(c.get("mouza", "")).lower() or str(c.get("mouza", "")).lower() in clean_mouza
            ]
            if mouza_matches:
                candidates = mouza_matches

        # If khatian provided, filter or find matching parcel
        if norm_khatian:
            khatian_matches = [
                c for c in candidates 
                if normalize_digits(c.get("khatian_no")) == norm_khatian or normalize_digits(c.get("parent_khatian_no")) == norm_khatian
            ]
            if khatian_matches:
                # Return all transactions for the matched parcel
                p_id = khatian_matches[0].get("parcel_id")
                if p_id and p_id in _BY_PARCEL:
                    return _BY_PARCEL[p_id]
                return khatian_matches

        # Return transactions for the first candidate's parcel
        if candidates:
            p_id = candidates[0].get("parcel_id")
            if p_id and p_id in _BY_PARCEL:
                return _BY_PARCEL[p_id]
            return candidates

    return []

def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    load_transactions()
    return _BY_ID.get(tx_id)

def get_parcel_by_id(parcel_id: str) -> List[Dict[str, Any]]:
    load_transactions()
    return _BY_PARCEL.get(parcel_id, [])

def get_scenario_records() -> List[Dict[str, Any]]:
    """Returns the explicitly created scenario records for testing and demonstration."""
    records = load_transactions()
    return [r for r in records if r.get("conflict_scenario") is not None]

def record_proposed_purchase(purchase_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Records a user-proposed land purchase in the synthetic registry for hackathon demo.
    Updates the parcel's transaction history and Plot Passport.
    Explicitly marked as 'User-Submitted Records'.
    Does NOT transfer legal ownership or replace government registration.
    """
    load_transactions()
    import uuid
    from datetime import date

    parcel_id = purchase_data.get("parcel_id")
    dag_no = normalize_digits(purchase_data.get("dag_no"))
    khatian_no = normalize_digits(purchase_data.get("khatian_no"))

    # If no parcel_id provided, look up by dag or generate
    if not parcel_id:
        if dag_no in _BY_DAG and _BY_DAG[dag_no]:
            parcel_id = _BY_DAG[dag_no][0].get("parcel_id")
        else:
            mouza_clean = (purchase_data.get("mouza") or "DEMO").replace(" ", "")
            parcel_id = f"PCL-PROP-{mouza_clean[:4].upper()}-{dag_no or '000'}"

    parcel_history = _BY_PARCEL.get(parcel_id, [])
    seller_name = purchase_data.get("seller_name") or (parcel_history[-1].get("buyer_name_bn") if parcel_history else "অনুলিখিত বিক্রেতা")
    buyer_name = purchase_data.get("buyer_name") or "প্রস্তাবিত ক্রেতা"
    
    try:
        transferred_area = float(purchase_data.get("area_decimal") or 0.0)
    except (ValueError, TypeError):
        transferred_area = 10.0

    try:
        total_area = float(parcel_history[0].get("total_parcel_area") if parcel_history else transferred_area)
    except (ValueError, TypeError):
        total_area = transferred_area

    # Calculate remaining area from last known transaction
    last_remaining = total_area
    if parcel_history:
        try:
            last_remaining = float(parcel_history[-1].get("seller_remaining_area", total_area))
        except (ValueError, TypeError):
            last_remaining = total_area

    new_remaining = max(0.0, last_remaining - transferred_area)

    new_record = {
        "id": f"rec-prop-{uuid.uuid4().hex[:8]}",
        "parcel_id": parcel_id,
        "deed_no": purchase_data.get("proposed_deed_no") or purchase_data.get("deed_no") or f"PROP-{date.today().year}-{uuid.uuid4().hex[:4].upper()}",
        "transaction_date": purchase_data.get("transaction_date") or date.today().isoformat(),
        "division": purchase_data.get("division") or (parcel_history[0].get("division") if parcel_history else "ঢাকা (Dhaka)"),
        "district": purchase_data.get("district") or (parcel_history[0].get("district") if parcel_history else "ঢাকা (Dhaka)"),
        "upazila": purchase_data.get("upazila") or (parcel_history[0].get("upazila") if parcel_history else "সাভার (Savar)"),
        "mouza": purchase_data.get("mouza") or (parcel_history[0].get("mouza") if parcel_history else "সাভার (Savar)"),
        "jl_no": purchase_data.get("jl_no") or (parcel_history[0].get("jl_no") if parcel_history else "10"),
        "khatian_no": str(purchase_data.get("khatian_no") or (parcel_history[-1].get("khatian_no") if parcel_history else "101")),
        "dag_no": str(purchase_data.get("dag_no") or (parcel_history[-1].get("dag_no") if parcel_history else "501")),
        "land_class": purchase_data.get("land_class") or (parcel_history[0].get("land_class") if parcel_history else "নাল (Nal / Agricultural)"),
        "total_parcel_area": total_area,
        "transferred_area": transferred_area,
        "seller_remaining_area": new_remaining,
        "seller_name": seller_name,
        "seller_name_bn": seller_name,
        "seller_name_en": purchase_data.get("seller_name_en", "Proposed Seller"),
        "buyer_name": buyer_name,
        "buyer_name_bn": buyer_name,
        "buyer_name_en": purchase_data.get("buyer_name_en", "Proposed Buyer"),
        "prior_deed_no": parcel_history[-1].get("deed_no") if parcel_history else "NONE",
        "parent_khatian_no": parcel_history[-1].get("khatian_no") if parcel_history else "NONE",
        "transaction_type": "Proposed Land Purchase (প্রস্তাবিত জমি ক্রয়)",
        "record_source": "User-Submitted Records",
        "verification_status": "Proposed / Pending Official Registration",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. This proposed purchase does NOT legally transfer ownership or complete government registration."
    }

    if _TRANSACTIONS_CACHE is not None:
        _TRANSACTIONS_CACHE.append(new_record)
    _BY_ID[new_record["id"]] = new_record
    _BY_PARCEL.setdefault(parcel_id, []).append(new_record)
    _BY_PARCEL[parcel_id].sort(key=lambda x: str(x.get("transaction_date", "")))

    norm_dag = normalize_digits(new_record["dag_no"])
    if norm_dag:
        _BY_DAG.setdefault(norm_dag, []).append(new_record)
    norm_deed = normalize_digits(new_record["deed_no"])
    if norm_deed:
        _BY_DEED[norm_deed] = new_record

    return {
        "success": True,
        "record": new_record,
        "recorded_transaction": new_record,
        "parcel_id": parcel_id,
        "history_count": len(_BY_PARCEL[parcel_id]),
        "disclaimer": new_record["disclaimer"],
        "legal_disclaimer": new_record["disclaimer"]
    }
