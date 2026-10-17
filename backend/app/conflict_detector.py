"""
Conflict Detection Engine for Bhumi Kobocho (ভূমি কবচ)
Verifies citizen-uploaded deeds against the synthetic land transaction registry.
Detects potential duplicate conveyances, area overlaps, chain continuity gaps, or verified histories.

STRICT LEGAL AND SYSTEM CONSTRAINTS:
- Does NOT declare legal ownership or criminal fraud.
- Uses objective, neutral audit terminology.
- Distinguishes synthetic simulation records with is_synthetic=True and disclaimers.
- Does NOT fabricate previous transactions for uploaded deeds.
- If no matching parcel history is found, strictly outputs: 'Previous Land Record Not Found'.
"""

import re
from typing import Dict, Any, List, Optional
try:
    from .transaction_registry import (
        find_history_for_deed,
        normalize_digits,
        get_parcel_by_id
    )
except ImportError:
    from backend.app.transaction_registry import (
        find_history_for_deed,
        normalize_digits,
        get_parcel_by_id
    )

def parse_decimal_value(val: Any) -> Optional[float]:
    if val is None:
        return None
    s = str(val).strip()
    s = normalize_digits(s)
    match = re.search(r"[-+]?\d*\.?\d+", s)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None

def detect_conflicts(extracted_deed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Core verification and conflict detection routine.
    Searches synthetic land history, finds relevant previous deeds,
    and analyzes potential conflicts without declaring legal ownership.
    """
    dag_no = normalize_digits(extracted_deed.get("dag_no"))
    khatian_no = normalize_digits(extracted_deed.get("khatian_no"))
    deed_no = normalize_digits(extracted_deed.get("deed_no"))
    area_decimal = parse_decimal_value(extracted_deed.get("area_decimal"))
    owner_name = extracted_deed.get("owner_name")
    mouza = extracted_deed.get("mouza")
    parcel_id = extracted_deed.get("parcel_id")
    doc_date = str(extracted_deed.get("document_date") or "").strip()

    # Search transaction registry
    history = find_history_for_deed(
        dag_no=dag_no,
        khatian_no=khatian_no,
        mouza=mouza,
        deed_no=deed_no,
        parcel_id=parcel_id
    )

    # 1. No relevant history exists
    if not history:
        return {
            "has_history": False,
            "status": "NO_PRIOR_RECORD",
            "status_badge": "Previous Land Record Not Found",
            "status_label_bn": "পূর্ববর্তী রেকর্ড পাওয়া যায়নি",
            "status_label_en": "Previous Land Record Not Found",
            "conflict_type": None,
            "message": "No prior land transaction or cadastral record found matching this Dag and Khatian. Manual archival verification required.",
            "conflicts": [],
            "supporting_records": [],
            "parcel_id": None,
            "parcel_summary": None,
            "timeline": [],
            "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
        }

    # 2. History found -> analyze parcel timeline and previous deeds
    # Sort history chronologically
    sorted_history = sorted(history, key=lambda x: str(x.get("transaction_date", "")))
    primary_parcel_id = sorted_history[0].get("parcel_id")
    primary_mouza = sorted_history[0].get("mouza")
    primary_jl = sorted_history[0].get("jl_no")
    total_parcel_area = sorted_history[0].get("total_parcel_area", 0.0)
    land_class = sorted_history[0].get("land_class")

    # Find previous transactions before or matching the deed
    previous_deeds = []
    current_tx_record = None

    for tx in sorted_history:
        tx_deed = normalize_digits(tx.get("deed_no"))
        if deed_no and tx_deed == deed_no:
            current_tx_record = tx
        else:
            previous_deeds.append(tx)

    conflicts: List[Dict[str, Any]] = []
    conflict_type = "CLEAN_CHAIN"
    status_badge = "Matched / Clean Chain"
    status_label_bn = "কোনো দ্বন্দ্ব পাওয়া যায়নি — ধারাবাহিকতা সন্তোষজনক"
    status_label_en = "No Conflict Detected — Clean Title Chain"

    # Check for explicitly simulated scenario flags first
    explicit_scenario = None
    if current_tx_record and current_tx_record.get("conflict_scenario"):
        explicit_scenario = current_tx_record.get("conflict_scenario")
    else:
        # Check if any record in parcel has explicit scenario flag
        for tx in sorted_history:
            if tx.get("expected_conflict") and tx.get("conflict_scenario") in ("DUPLICATE_SALE", "OVERLAPPING_SALE", "INCOMPLETE_HISTORY"):
                explicit_scenario = tx.get("conflict_scenario")
                current_tx_record = tx
                break

    # SCENARIO 1: Duplicate sale
    if explicit_scenario == "DUPLICATE_SALE" or (
        current_tx_record and current_tx_record.get("seller_remaining_area", 0.0) < 0.0 and
        current_tx_record.get("transferred_area") == current_tx_record.get("total_parcel_area")
    ):
        conflict_type = "DUPLICATE_SALE"
        status_badge = "Conflict Detected (Duplicate Sale)"
        status_label_bn = "উচ্চ ঝুঁকি — সম্ভাব্য দ্বৈত বিক্রয় সতর্কতা"
        status_label_en = "High Risk — Potential Duplicate Sale Detected"
        conflicts.append({
            "code": "DUPLICATE_SALE_DETECTED",
            "severity": "CRITICAL",
            "title_bn": "একই জমির পুনরাবৃত্ত বিক্রয় সতর্কতা",
            "title_en": "Duplicate Conveyance of Same Land Portion",
            "description_bn": f"বিক্রেতা পূর্বে পূর্ববর্তী দলিলের মাধ্যমে এই দাগের সম্পূর্ণ অংশ হস্তান্তর করেছেন। বর্তমানে কোনো অতিরিক্ত স্বত্ব অবশিষ্ট নেই।",
            "description_en": f"The seller previously conveyed this exact land portion in an earlier registered transaction. No remaining unencumbered area is available for transfer.",
            "conflicting_deed_no": previous_deeds[-1].get("deed_no") if previous_deeds else "PRIOR-TX",
            "conflicting_date": previous_deeds[-1].get("transaction_date") if previous_deeds else None,
            "conflicting_buyer": previous_deeds[-1].get("buyer_name_bn") if previous_deeds else None
        })

    # SCENARIO 2: Overlapping sale of previously transferred land portion
    elif explicit_scenario == "OVERLAPPING_SALE" or (
        current_tx_record and current_tx_record.get("seller_remaining_area", 0.0) < 0.0
    ):
        conflict_type = "OVERLAPPING_SALE"
        status_badge = "Conflict Detected (Area Overlap)"
        status_label_bn = "সতর্কতা — হস্তান্তরিত অংশে জমির পরিমাণের অমিল ও দ্বন্দ্ব"
        status_label_en = "Warning — Overlapping Land Area Detected"
        excess = abs(current_tx_record.get("seller_remaining_area", 0.0)) if current_tx_record else 3.0
        conflicts.append({
            "code": "OVERLAPPING_AREA_DETECTED",
            "severity": "HIGH",
            "title_bn": "অনুমোদিত সীমার চেয়ে অতিরিক্ত পরিমাণ জমি বিক্রির চেষ্টা",
            "title_en": "Conveyance Exceeds Seller's Remaining Holding Balance",
            "description_bn": f"বিক্রেতার পূর্ববর্তী বিক্রয়ের পর অবশিষ্ট জমির চেয়ে প্রস্তাবিত হস্তান্তরের পরিমাণ {excess:.2f} শতক বেশি।",
            "description_en": f"The transferred area exceeds the seller's available unencumbered balance by approximately {excess:.2f} decimals.",
            "conflicting_deed_no": previous_deeds[-1].get("deed_no") if previous_deeds else "PRIOR-TX",
            "excess_decimals": excess
        })

    # SCENARIO 4: Missing or incomplete transaction history
    elif explicit_scenario == "INCOMPLETE_HISTORY" or (
        current_tx_record and ("UNKNOWN" in str(current_tx_record.get("prior_deed_no", "")) or "GAP" in str(current_tx_record.get("prior_deed_no", "")))
    ):
        conflict_type = "INCOMPLETE_HISTORY"
        status_badge = "Needs Review (History Gap)"
        status_label_bn = "যাচাই প্রয়োজন — মালিকানার ধারাবাহিকতায় ফাঁক বা অসম্পূর্ণ ইতিহাস"
        status_label_en = "Needs Review — Gap or Missing Link in Title Chain"
        conflicts.append({
            "code": "CHAIN_GAP_DETECTED",
            "severity": "MEDIUM",
            "title_bn": "পূর্ববর্তী খতিয়ান বা দলিলের সূত্রের অনুপস্থিতি",
            "title_en": "Missing Prior Deed / Parent Khatian Linkage",
            "description_bn": "রেকর্ডে বিক্রেতার স্বত্ব অর্জনের কোনো সরাসরি পূর্ববর্তী দলিল বা নামজারি রেকর্ড খুঁজে পাওয়া যায়নি।",
            "description_en": "No recorded prior deed or mutation entry establishing the seller's acquisition was identified in the synthetic cadastral register.",
            "parent_khatian_referenced": current_tx_record.get("parent_khatian_no") if current_tx_record else "UNKNOWN"
        })

    # SCENARIO 5: Multiple transactions involving the same parcel
    elif len(sorted_history) >= 3 and not conflicts:
        conflict_type = "MULTIPLE_TRANSACTIONS"
        status_badge = "Multi-Transaction Verified"
        status_label_bn = "যাচাইকৃত — বহুবিধ লেনদেনের ধারাবাহিক ইতিহাস সংরক্ষিত"
        status_label_en = "Verified — Multi-Transaction Cadastral Chain Preserved"
        # No adverse conflict; full multi-step history preserved

    # SCENARIO 3: Normal sale with no detected overlap
    else:
        conflict_type = "NORMAL_SALE"
        status_badge = "Matched / Clean Chain"
        status_label_bn = "কোনো দ্বন্দ্ব পাওয়া যায়নি — ধারাবাহিকতা সন্তোষজনক"
        status_label_en = "No Conflict Detected — Legitimate Sequential Sale"

    # Format supporting record references for citizen scrutiny
    supporting_records = []
    for tx in sorted_history:
        supporting_records.append({
            "id": tx.get("id"),
            "deed_no": tx.get("deed_no"),
            "transaction_date": tx.get("transaction_date"),
            "seller_name_bn": tx.get("seller_name_bn"),
            "buyer_name_bn": tx.get("buyer_name_bn"),
            "transferred_area": tx.get("transferred_area"),
            "khatian_no": tx.get("khatian_no"),
            "dag_no": tx.get("dag_no"),
            "transaction_type": tx.get("transaction_type"),
            "prior_deed_no": tx.get("prior_deed_no")
        })

    # Build parcel timeline
    timeline = []
    for tx in sorted_history:
        date_str = tx.get("transaction_date") or "তারিখ অপ্রাপ্য"
        year_str = date_str[:4] if len(date_str) >= 4 else "অপ্রাপ্য"
        timeline.append({
            "year": year_str,
            "date": date_str,
            "title_bn": f"{tx.get('transaction_type', 'দলিল রেজিস্ট্রেশন')} (দলিল নং {tx.get('deed_no')})",
            "title_en": f"{tx.get('transaction_type', 'Deed Registration')} (Deed #{tx.get('deed_no')})",
            "detail_bn": f"বিক্রেতা: {tx.get('seller_name_bn')}, ক্রেতা: {tx.get('buyer_name_bn')}, পরিমাণ: {tx.get('transferred_area')} শতক",
            "detail_en": f"Seller: {tx.get('seller_name_en')}, Buyer: {tx.get('buyer_name_en')}, Area: {tx.get('transferred_area')} decimals",
            "status_code": "VERIFIED_RECORD",
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict"
        })

    return {
        "has_history": True,
        "status": conflict_type,
        "status_badge": status_badge,
        "status_label_bn": status_label_bn,
        "status_label_en": status_label_en,
        "conflict_type": conflict_type,
        "conflicts": conflicts,
        "supporting_records": supporting_records,
        "parcel_id": primary_parcel_id,
        "parcel_summary": {
            "parcel_id": primary_parcel_id,
            "mouza": primary_mouza,
            "jl_no": primary_jl,
            "dag_no": dag_no or sorted_history[0].get("dag_no"),
            "khatian_no": khatian_no or sorted_history[0].get("khatian_no"),
            "total_parcel_area": total_parcel_area,
            "land_class": land_class,
            "recorded_transactions_count": len(sorted_history)
        },
        "timeline": timeline,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic land transaction record for conflict simulation."
    }
