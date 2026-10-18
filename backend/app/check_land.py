"""
Check Before You Buy (জমি যাচাই) Engine for Bhumi Kobocho (ভূমি কবচ)
A purely informative deed-reading and synthetic land-record lookup engine:
1. Reads all fields extracted from the uploaded deed.
2. Performs a direct LOOKUP (mouza + khatian + dag, fallback deed_no) in synthetic records.
3. Shows previous owners (ownership history, newest first).
4. Shows transaction history of this land (date, from, to, deed no, area).
5. Shows synthetic cases and status (court case, mutation case, mortgage, khas/acquisition).
6. Lists what was NOT checked, and next official steps.

HARD RULES:
- NO comparison, NO matching, NO scoring, NO Matched/Mismatch statuses.
- Factual, neutral wording only ("The registry shows...", "No record found in this demo registry").
- Every card shows "DEMO DATA, not a legal verdict".
- All case records carry is_synthetic=True.
"""

from typing import Dict, Any, List, Optional
import re

try:
    from .transaction_registry import (
        find_history_for_deed,
        get_parcel_by_id,
        normalize_digits
    )
    from .conflict_detector import parse_decimal_value
    from .case_registry import get_cases_for_parcel
except ImportError:
    from backend.app.transaction_registry import (
        find_history_for_deed,
        get_parcel_by_id,
        normalize_digits
    )
    from backend.app.conflict_detector import parse_decimal_value
    from backend.app.case_registry import get_cases_for_parcel

NOT_CHECKED_DEFAULT = [
    "লাইভ দেওয়ানি আদালত রেকর্ড ও স্থগিতাদেশ (Live Civil Court Records & Injunctions)",
    "ব্যাংক ঋণ ও দায়বদ্ধতা সিআইবি তথ্য (Live Bank Liens & Institutional Charges)",
    "অর্পিত ও শত্রু/পরিত্যক্ত সম্পত্তি সরকারি তালিকা (Vested & Abandoned Property Registry)",
    "জমির সরেজমিন শারীরিক দখল ও স্বত্বভোগ (Physical On-Ground Possession)",
    "সীমানা পিলার ও ডিজিটাল ক্যাডাস্ট্রাল পরিমাপ (Physical Cadastral Boundary Survey)"
]

NEXT_STEPS_DEFAULT = [
    "উপজেলা সহকারী কমিশনার (ভূমি) কার্যালয় থেকে সর্বশেষ নামজারি ও জমাভাগ খতিয়ান (DCR ও খাজনা দাখিলা) যাচাই করুন।",
    "সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিসের মহাফেজখানা থেকে মূল বালাম বহি ও বায়া দলিলের ধারাবাহিকতা অনুসন্ধান (Searching) করুন।",
    "অন-গ্রাউন্ড সরেজমিন পরিদর্শন করে বর্তমান দখলদার, স্থানীয় প্রতিবেশী এবং সীমানা পিলার নিশ্চিত করুন।",
    "সরকারি স্বার্থ সংশ্লিষ্ট খাস, ওয়াকফ বা কোনো যৌথ ব্যাংকিং দায়বদ্ধতা নেই মর্মে সংশ্লিষ্ট ভূমি অফিস থেকে নিশ্চিত হোন।"
]

ALL_FIELD_DEFINITIONS = [
    ("deed_no", "দলিল নম্বর", "Deed No"),
    ("document_date", "দলিলের তারিখ", "Deed Date"),
    ("transaction_type", "দলিলের ধরন/শ্রেণি", "Deed Type"),
    ("seller_name", "বিক্রেতার নাম", "Seller Name"),
    ("seller_father_name", "বিক্রেতার পিতার নাম", "Seller's Father Name"),
    ("buyer_name", "ক্রেতার নাম", "Buyer Name"),
    ("buyer_father_name", "ক্রেতার পিতার নাম", "Buyer's Father Name"),
    ("mouza", "মৌজা", "Mouza"),
    ("jl_no", "জেএল নম্বর", "JL No"),
    ("khatian_no", "খতিয়ান নম্বর", "Khatian No"),
    ("dag_no", "দাগ নম্বর", "Dag No"),
    ("land_class", "জমির শ্রেণি", "Land Class"),
    ("area_decimal", "জমির পরিমাণ (শতাংশ)", "Area (Decimal)"),
    ("consideration_price", "দলিল পণমূল্য", "Consideration / Value"),
    ("sub_registry_office", "সাব-রেজিস্ট্রি অফিস", "Sub-Registry Office"),
    ("boundaries", "চৌহদ্দি/সীমানা", "Boundaries / Schedule"),
]

def build_deed_info(
    extracted_fields: Dict[str, Any],
    confidence_scores: Dict[str, Optional[float]]
) -> List[Dict[str, Any]]:
    """
    Builds deed_info containing every field read from the deed.
    Includes only fields that are present / non-empty.
    Marks confidence; if < 0.65, flagged as needs_check ("please check").
    """
    fields_list = []
    
    # Also handle owner_name alias for buyer_name if missing
    working_data = dict(extracted_fields)
    if not working_data.get("buyer_name") and working_data.get("owner_name"):
        working_data["buyer_name"] = working_data["owner_name"]

    for key, lbl_bn, lbl_en in ALL_FIELD_DEFINITIONS:
        val = working_data.get(key)
        if val is None:
            continue
        val_str = str(val).strip()
        if not val_str or val_str.lower() in ["null", "none", "n/a"]:
            continue

        conf = confidence_scores.get(key)
        is_low_conf = (conf is not None and conf < 0.65)
        
        fields_list.append({
            "key": key,
            "label_bn": lbl_bn,
            "label_en": lbl_en,
            "value": val_str,
            "confidence": round(conf, 2) if conf is not None else None,
            "needs_check": is_low_conf
        })

    return fields_list

def build_ownership_and_transactions(
    history: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Extracts ownership history (newest first, with is_current flag)
    and transactions table ({date, from_bn, from_en, to_bn, to_en, deed_no, area, type}).
    """
    if not history:
        return [], []

    sorted_txs = sorted(history, key=lambda x: str(x.get("transaction_date", "")))

    transactions = []
    ownership_nodes = []
    order = 1

    for i, tx in enumerate(sorted_txs):
        s_bn = tx.get("seller_name_bn") or tx.get("seller_name") or "পূর্ববর্তী রেকর্ড"
        s_en = tx.get("seller_name_en") or s_bn
        b_bn = tx.get("buyer_name_bn") or tx.get("buyer_name") or "অজ্ঞাত ক্রেতা"
        b_en = tx.get("buyer_name_en") or b_bn
        deed = tx.get("deed_no") or "রেকর্ড অপ্রাপ্য"
        t_date = tx.get("transaction_date") or "অপ্রাপ্য"
        t_type = tx.get("transaction_type") or "সাব-কবলা (Sale Deed)"
        area = tx.get("transferred_area") or tx.get("total_parcel_area") or 0.0

        transactions.append({
            "date": t_date,
            "from_bn": s_bn,
            "from_en": s_en,
            "to_bn": b_bn,
            "to_en": b_en,
            "deed_no": deed,
            "area": area,
            "type": t_type
        })

        is_current = (i == len(sorted_txs) - 1)
        ownership_nodes.append({
            "order": order,
            "owner_name_bn": b_bn,
            "owner_name_en": b_en,
            "acquired_date": t_date,
            "how": t_type,
            "deed_no": deed,
            "area": area,
            "is_current": is_current
        })
        order += 1

    # Newest first
    ownership_history = list(reversed(ownership_nodes))
    transactions_reversed = list(reversed(transactions))

    return ownership_history, transactions_reversed

def check_land(
    extracted_data: Dict[str, Any],
    confidence_scores: Optional[Dict[str, Optional[float]]] = None,
    uploaded_file_sha256: Optional[str] = None
) -> Dict[str, Any]:
    """
    Performs purely informative deed reading and parcel lookup in synthetic registry.
    """
    if confidence_scores is None:
        confidence_scores = {}

    deed_info = build_deed_info(extracted_data, confidence_scores)

    dag_no = normalize_digits(extracted_data.get("dag_no"))
    khatian_no = normalize_digits(extracted_data.get("khatian_no"))
    mouza = extracted_data.get("mouza")
    deed_no = normalize_digits(extracted_data.get("deed_no"))
    parcel_id = extracted_data.get("parcel_id")

    # Locate parcel by mouza + khatian + dag, fallback deed_no
    history = find_history_for_deed(
        dag_no=dag_no,
        khatian_no=khatian_no,
        mouza=mouza,
        deed_no=deed_no,
        parcel_id=parcel_id
    )

    if not history:
        return {
            "status": "not_found",
            "disclaimer": "DEMO DATA, not a legal verdict. All data shown is purely synthetic.",
            "uploaded_file_sha256": uploaded_file_sha256,
            "deed_info": deed_info,
            "parcel": None,
            "ownership_history": [],
            "transactions": [],
            "cases": [],
            "not_checked": NOT_CHECKED_DEFAULT,
            "next_official_steps": NEXT_STEPS_DEFAULT
        }

    # Parcel identified
    first_record = history[0]
    matched_parcel_id = first_record.get("parcel_id")
    complete_history = get_parcel_by_id(matched_parcel_id) or history

    parcel = {
        "parcel_id": matched_parcel_id,
        "mouza": first_record.get("mouza", mouza or "অপ্রাপ্য"),
        "khatian_no": first_record.get("khatian_no", khatian_no or "অপ্রাপ্য"),
        "dag_no": first_record.get("dag_no", dag_no or "অপ্রাপ্য"),
        "land_class": first_record.get("land_class", "নাল (Nal / Agricultural)"),
        "total_area": parse_decimal_value(first_record.get("total_parcel_area")) or 10.0
    }

    ownership_history, transactions = build_ownership_and_transactions(complete_history)
    cases = get_cases_for_parcel(matched_parcel_id)

    return {
        "status": "found",
        "disclaimer": "DEMO DATA, not a legal verdict. All data shown is purely synthetic.",
        "uploaded_file_sha256": uploaded_file_sha256,
        "deed_info": deed_info,
        "parcel": parcel,
        "ownership_history": ownership_history,
        "transactions": transactions,
        "cases": cases,
        "not_checked": NOT_CHECKED_DEFAULT,
        "next_official_steps": NEXT_STEPS_DEFAULT
    }
