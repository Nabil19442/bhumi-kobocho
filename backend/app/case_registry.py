"""
Case Registry Module for Bhumi Kobocho (ভূমি কবচ)
Loads, caches, and queries synthetic legal and administrative cases connected to land parcels:
- Court cases (civil title suits, partition suits)
- Mutation cases (AC Land e-mutation records)
- Institutional mortgages (bank liens, charge encumbrances)
- Khas land / Acquisition inquiries

CRITICAL INTEGRITY:
- All cases carry is_synthetic=True and explicit demo disclaimers.
- Zero live court, bank, or land ministry scraping.
- Unknown parcels return an empty list.
"""

import os
import json
import threading
from typing import Dict, Any, List, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CASES_FILE = os.path.join(DATA_DIR, "land_cases.json")

_CASES_LOCK = threading.Lock()
_CASES_CACHE: Optional[Dict[str, List[Dict[str, Any]]]] = None

def load_cases() -> Dict[str, List[Dict[str, Any]]]:
    """Loads and caches synthetic cases from land_cases.json."""
    global _CASES_CACHE
    with _CASES_LOCK:
        if _CASES_CACHE is not None:
            return _CASES_CACHE

        cases: Dict[str, List[Dict[str, Any]]] = {}
        if os.path.exists(CASES_FILE):
            try:
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    cases = json.load(f)
            except Exception:
                cases = {}

        if not cases:
            # Auto-generate deterministically if missing
            try:
                from backend.data.generate_cases import generate_cases_dataset
                cases = generate_cases_dataset()
                with open(CASES_FILE, "w", encoding="utf-8") as f:
                    json.dump(cases, f, ensure_ascii=False, indent=2)
            except Exception:
                cases = {}

        _CASES_CACHE = cases
        return _CASES_CACHE

def get_cases_for_parcel(parcel_id: Optional[str]) -> List[Dict[str, Any]]:
    """
    Retrieves synthetic cases recorded against a given parcel_id.
    Returns an empty list if parcel_id is invalid or has no recorded cases.
    """
    if not parcel_id:
        return []
    
    clean_id = str(parcel_id).strip()
    registry = load_cases()
    
    # 1. Direct match
    if clean_id in registry:
        return registry[clean_id]
    
    # 2. Check known aliases (e.g., from transaction_registry PARCEL_ID_ALIASES)
    try:
        from .transaction_registry import PARCEL_ID_ALIASES
        canonical = PARCEL_ID_ALIASES.get(clean_id)
        if canonical and canonical in registry:
            return registry[canonical]
    except Exception:
        pass

    return []

def get_cases_report(parcel_id: Optional[str], lang: str = "bn") -> Dict[str, Any]:
    """
    Produces a structured summary of cases with explicit disclaimer and not-checked note.
    """
    cases = get_cases_for_parcel(parcel_id)
    is_bn = (lang == "bn")

    has_pending_court = any(c.get("type") == "court_case" and c.get("status") == "pending" for c in cases)
    has_active_mortgage = any(c.get("type") == "mortgage" and c.get("status") == "active" for c in cases)
    has_acquisition = any(c.get("type") == "khas_acquisition" and c.get("status") in ["pending", "under_review"] for c in cases)

    if cases:
        if has_pending_court or has_active_mortgage or has_acquisition:
            status_label = "Priority review"
            status_label_bn = "অগ্রাধিকার পর্যালোচনা"
        else:
            status_label = "Info"
            status_label_bn = "তথ্যমূলক"
    else:
        status_label = "Not checked"
        status_label_bn = "যাচাই করা হয়নি"

    not_checked_note = (
        "লাইভ দেওয়ানি আদালত, ব্যাংক সিআইবি ডাটাবেজ কিংবা ভূমি মন্ত্রণালয়ের লাইভ পোর্টাল যাচাই করা হয়নি। "
        "এটি শুধুমাত্র প্রদর্শনী ডেমো রেকর্ডের একটি তালিকা।"
        if is_bn else
        "Live civil court records, bank CIB liens, and official ministry portals were NOT queried. "
        "This is synthetic demonstration data only."
    )

    return {
        "parcel_id": parcel_id,
        "cases": cases,
        "total_cases": len(cases),
        "status_label": status_label,
        "status_label_bn": status_label_bn,
        "has_pending_court": has_pending_court,
        "has_active_mortgage": has_active_mortgage,
        "has_acquisition": has_acquisition,
        "not_checked_note": not_checked_note,
        "disclaimer": "DEMO DATA — not a legal verdict. All cases are synthetic."
    }
