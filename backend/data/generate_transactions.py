"""
Synthetic Land Transaction History Generator for Bhumi Kobocho (ভূমি কবচ)
Generates ~20,000 synthetic land transaction records with connected parcel histories,
realistic Bengali/English fictional names, cadastral data, and explicit conflict test scenarios.

CRITICAL: Does NOT touch the 20,000 ML land price intelligence dataset.
All records are marked with is_synthetic=True and strict demo disclaimers.
"""

import os
import json
import random
from datetime import datetime, timedelta

RANDOM_SEED = 42
TOTAL_RECORDS = 20000

MOUZAS = [
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "মিরপুর (Mirpur)", "mouza": "মিরপুর (Mirpur)", "jl_no": "28", "code": "DHK-MIR-028"},
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "গুলশান (Gulshan)", "mouza": "বাড্ডা (Badda)", "jl_no": "12", "code": "DHK-GUL-012"},
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "গুলশান (Gulshan)", "mouza": "গুলশান (Gulshan)", "jl_no": "15", "code": "DHK-GUL-015"},
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "সাভার (Savar)", "mouza": "সাভার (Savar)", "jl_no": "45", "code": "DHK-SAV-045"},
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "কেরানীগঞ্জ (Keraniganj)", "mouza": "জিনজিরা (Jinjira)", "jl_no": "09", "code": "DHK-KER-009"},
    {"division": "ঢাকা (Dhaka)", "district": "ঢাকা (Dhaka)", "upazila": "উদাহরণপুর (Udaharanpur)", "mouza": "শান্তিপুর (কাল্পনিক)", "jl_no": "12", "code": "DHK-SHA-012"},
    {"division": "ঢাকা (Dhaka)", "district": "গাজীপুর (Gazipur)", "upazila": "জয়দেবপুর (Joydebpur)", "mouza": "চৌরাস্তা (Chowrasta)", "jl_no": "34", "code": "GAZ-JOY-034"},
    {"division": "ঢাকা (Dhaka)", "district": "নারায়ণগঞ্জ (Narayanganj)", "upazila": "সিদ্ধিরগঞ্জ (Siddhirganj)", "mouza": "কাঁচপুর (Kanchpur)", "jl_no": "18", "code": "NAR-SID-018"},
    {"division": "চট্টগ্রাম (Chittagong)", "district": "চট্টগ্রাম (Chittagong)", "upazila": "কোতোয়ালী (Kotwali)", "mouza": "আন্দরকিল্লা (Anderkilla)", "jl_no": "88", "code": "CTG-KOT-088"},
    {"division": "চট্টগ্রাম (Chittagong)", "district": "চট্টগ্রাম (Chittagong)", "upazila": "পাহাড়তলী (Pahartali)", "mouza": "খুলশী (Khulshi)", "jl_no": "22", "code": "CTG-PAH-022"},
    {"division": "চট্টগ্রাম (Chittagong)", "district": "কুমিল্লা (Comilla)", "upazila": "আদর্শ সদর (Adarsha Sadar)", "mouza": "শাসনগাছা (Shasongacha)", "jl_no": "51", "code": "COM-SAD-051"},
    {"division": "রাজশাহী (Rajshahi)", "district": "রাজশাহী (Rajshahi)", "upazila": "বোয়ালিয়া (Boalia)", "mouza": "মতিহার (Motihar)", "jl_no": "14", "code": "RAJ-BOA-014"},
    {"division": "রাজশাহী (Rajshahi)", "district": "বগুড়া (Bogra)", "upazila": "বগুড়া সদর (Bogra Sadar)", "mouza": "বনানী (Banani)", "jl_no": "29", "code": "BOG-SAD-029"},
    {"division": "সিলেট (Sylhet)", "district": "সিলেট (Sylhet)", "upazila": "সিলেট সদর (Sylhet Sadar)", "mouza": "আম্বরখানা (Amberkhana)", "jl_no": "32", "code": "SYL-SAD-032"},
    {"division": "খুলনা (Khulna)", "district": "খুলনা (Khulna)", "upazila": "খালিশপুর (Khalishpur)", "mouza": "দৌলতপুর (Daulatpur)", "jl_no": "41", "code": "KHU-KHA-041"},
    {"division": "বরিশাল (Barisal)", "district": "বরিশাল (Barisal)", "upazila": "বরিশাল সদর (Barisal Sadar)", "mouza": "রূপাতলী (Rupatali)", "jl_no": "26", "code": "BAR-SAD-026"},
    {"division": "ময়মনসিংহ (Mymensingh)", "district": "ময়মনসিংহ (Mymensingh)", "upazila": "ময়মনসিংহ সদর (Mymensingh Sadar)", "mouza": "গাঙ্গিনারপাড় (Ganginarpar)", "jl_no": "19", "code": "MYM-SAD-019"},
    {"division": "রংপুর (Rangpur)", "district": "রংপুর (Rangpur)", "upazila": "রংপুর সদর (Rangpur Sadar)", "mouza": "মডার্ন (Modern)", "jl_no": "37", "code": "RAN-SAD-037"},
]

LAND_CLASSES = [
    "নাল (Nal / Agricultural)",
    "ভিটি (Viti / Homestead)",
    "বাগান (Orchard)",
    "ধানী (Paddy)",
    "পুকুর (Pond)",
    "বাড়ি (Residential)",
    "পতিত (Fallow)"
]

NAME_PREFIXES = ["মোঃ", "মোহাম্মদ", "আব্দুল", "আব্দুর", "মোসাঃ", "বেগম", "সৈয়দ", "কাজী", "শেখ", "খন্দকার"]
NAME_CORES = [
    ("রফিকুল ইসলাম", "Rafiqul Islam"),
    ("শফিকুল আলম", "Shafiqul Alam"),
    ("আমিনুল হক", "Aminul Haque"),
    ("তরিকুল হাসান", "Tariqul Hasan"),
    ("কামাল হোসেন", "Kamal Hossain"),
    ("জামাল উদ্দিন", "Jamal Uddin"),
    ("নাসির আহমেদ", "Nasir Ahmed"),
    ("আলমগীর কবির", "Alamgir Kabir"),
    ("আনোয়ার হোসেন", "Anwar Hossain"),
    ("ফয়সাল মাহমুদ", "Faisal Mahmud"),
    ("সাকিব হাসান", "Sakib Hasan"),
    ("রহিম উদ্দিন", "Rahim Uddin"),
    ("করিম শেখ", "Karim Sheikh"),
    ("সেলিম রেজা", "Selim Reza"),
    ("জাহিদ হাসান", "Zahid Hasan"),
    ("নাজমুল হুদা", "Nazmul Huda"),
    ("সুলতানা জাহান", "Sultana Jahan"),
    ("নাসরিন আক্তার", "Nasreen Akter"),
    ("পারভীন সুলতানা", "Parveen Sultana"),
    ("ফাতেমা খাতুন", "Fatema Khatun"),
    ("মাকসুদা বেগম", "Maksuda Begum"),
    ("আবুল কাশেম", "Abul Kashem"),
    ("মোর্শেদ আলম", "Morshed Alam"),
    ("তারেক রহমান", "Tarek Rahman"),
    ("মাহমুদ হাসান", "Mahmud Hasan"),
    ("শাহীন আলম", "Shahin Alam"),
    ("জিয়াউর রহমান", "Ziaur Rahman"),
]

def make_name():
    prefix = random.choice(NAME_PREFIXES)
    core_bn, core_en = random.choice(NAME_CORES)
    # Match english prefix
    en_pref_map = {
        "মোঃ": "Md.", "মোহাম্মদ": "Mohammad", "আব্দুল": "Abdul", "আব্দুর": "Abdur",
        "মোসাঃ": "Mst.", "বেগম": "Begum", "সৈয়দ": "Syed", "কাজী": "Kazi",
        "শেখ": "Sheikh", "খন্দকার": "Khandaker"
    }
    en_pref = en_pref_map.get(prefix, "Md.")
    return f"{prefix} {core_bn}", f"{en_pref} {core_en}"

def generate_dataset():
    random.seed(RANDOM_SEED)
    records = []

    # ========================================================
    # 1. EXPLICIT CONFLICT SCENARIO SPECIMENS
    # ========================================================

    # SCENARIO 1: Duplicate sale of the same land portion
    # Seller sells 10.0 dec to Buyer A in 2020. Then sells the SAME 10.0 dec to Buyer B in 2023.
    p1 = "PCL-DHK-GUL-015-0550"
    records.append({
        "id": "rec-scen-001-a",
        "parcel_id": p1,
        "deed_no": "1102/2020",
        "transaction_date": "2020-03-10",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "গুলশান (Gulshan)",
        "mouza": "গুলশান (Gulshan)",
        "jl_no": "15",
        "khatian_no": "220",
        "dag_no": "550",
        "land_class": "ভিটি (Viti / Homestead)",
        "total_parcel_area": 10.0,
        "transferred_area": 10.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "মোঃ মোর্শেদ আলম",
        "seller_name_en": "Md. Morshed Alam",
        "seller_nid_last4": "5512",
        "buyer_name_bn": "আবুল কাশেম",
        "buyer_name_en": "Abul Kashem",
        "buyer_nid_last4": "8810",
        "prior_deed_no": "CS-1992-04",
        "parent_khatian_no": "SA-88",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "DUPLICATE_SALE_BASELINE",
        "scenario_role": "legitimate_prior_conveyance",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-001-b",
        "parcel_id": p1,
        "deed_no": "4520/2023",
        "transaction_date": "2023-08-15",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "গুলশান (Gulshan)",
        "mouza": "গুলশান (Gulshan)",
        "jl_no": "15",
        "khatian_no": "220",
        "dag_no": "550",
        "land_class": "ভিটি (Viti / Homestead)",
        "total_parcel_area": 10.0,
        "transferred_area": 10.0,
        "seller_remaining_area": -10.0,
        "seller_name_bn": "মোঃ মোর্শেদ আলম",
        "seller_name_en": "Md. Morshed Alam",
        "seller_nid_last4": "5512",
        "buyer_name_bn": "তারেক রহমান",
        "buyer_name_en": "Tarek Rahman",
        "buyer_nid_last4": "9931",
        "prior_deed_no": "1102/2020",
        "parent_khatian_no": "220",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "DUPLICATE_SALE",
        "scenario_role": "duplicate_conflicting_deed",
        "expected_conflict": "DUPLICATE_SALE_DETECTED",
        "conflict_details": "Seller মোঃ মোর্শেদ আলম previously sold all 10.0 decimals to আবুল কাশেম on 2020-03-10 (Deed 1102/2020). Zero remaining unencumbered area.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO 2: Overlapping sale of a previously transferred land portion
    # Baseline 12.0 dec. Sold 8.0 dec to Buyer A (leaves 4.0). Then attempts to sell 7.0 dec to Buyer B (3.0 dec overlap).
    p2 = "PCL-DHK-SAV-045-0784"
    records.append({
        "id": "rec-scen-002-a",
        "parcel_id": p2,
        "deed_no": "2110/2019",
        "transaction_date": "2019-05-12",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "সাভার (Savar)",
        "mouza": "সাভার (Savar)",
        "jl_no": "45",
        "khatian_no": "129",
        "dag_no": "784",
        "land_class": "বাগান (Orchard)",
        "total_parcel_area": 12.0,
        "transferred_area": 8.0,
        "seller_remaining_area": 4.0,
        "seller_name_bn": "আব্দুল করিম শেখ",
        "seller_name_en": "Abdul Karim Sheikh",
        "seller_nid_last4": "6023",
        "buyer_name_bn": "সুলতana জাহান",
        "buyer_name_en": "Sultana Jahan",
        "buyer_nid_last4": "4431",
        "prior_deed_no": "CS-1988-19",
        "parent_khatian_no": "SA-90",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "OVERLAPPING_SALE_BASELINE",
        "scenario_role": "partial_prior_conveyance",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-002-b",
        "parcel_id": p2,
        "deed_no": "5812/2022",
        "transaction_date": "2022-11-20",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "সাভার (Savar)",
        "mouza": "সাভার (Savar)",
        "jl_no": "45",
        "khatian_no": "129",
        "dag_no": "784",
        "land_class": "বাগান (Orchard)",
        "total_parcel_area": 12.0,
        "transferred_area": 7.0,
        "seller_remaining_area": -3.0,
        "seller_name_bn": "আব্দুল করিম শেখ",
        "seller_name_en": "Abdul Karim Sheikh",
        "seller_nid_last4": "6023",
        "buyer_name_bn": "মাহমুদ হাসান",
        "buyer_name_en": "Mahmud Hasan",
        "buyer_nid_last4": "7109",
        "prior_deed_no": "2110/2019",
        "parent_khatian_no": "129",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "OVERLAPPING_SALE",
        "scenario_role": "overlapping_conflicting_deed",
        "expected_conflict": "OVERLAPPING_AREA_DETECTED",
        "conflict_details": "Seller retained only 4.0 decimals after Deed 2110/2019. Proposed 7.0 decimals transfer exceeds available balance by 3.0 decimals.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO 3: Normal sale with no detected overlap
    p3 = "PCL-DHK-MIR-028-1058"
    records.append({
        "id": "rec-scen-003-a",
        "parcel_id": p3,
        "deed_no": "920/2005",
        "transaction_date": "2005-08-14",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "মিরপুর (Mirpur)",
        "mouza": "মিরপুর (Mirpur)",
        "jl_no": "28",
        "khatian_no": "412",
        "dag_no": "1058",
        "land_class": "নাল (Nal / Agricultural)",
        "total_parcel_area": 15.5,
        "transferred_area": 15.5,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "মোঃ আব্দুল লতিফ",
        "seller_name_en": "Md. Abdul Latif",
        "seller_nid_last4": "1104",
        "buyer_name_bn": "মোঃ রফিকুল ইসলাম",
        "buyer_name_en": "Md. Rafiqul Islam",
        "buyer_nid_last4": "8912",
        "prior_deed_no": "RS-1990",
        "parent_khatian_no": "RS-190",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "NORMAL_SALE_BASELINE",
        "scenario_role": "clean_prior_acquisition",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-003-b",
        "parcel_id": p3,
        "deed_no": "1482/2021",
        "transaction_date": "2021-04-12",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "মিরপুর (Mirpur)",
        "mouza": "মিরপুর (Mirpur)",
        "jl_no": "28",
        "khatian_no": "412",
        "dag_no": "1058",
        "land_class": "নাল (Nal / Agricultural)",
        "total_parcel_area": 15.5,
        "transferred_area": 5.0,
        "seller_remaining_area": 10.5,
        "seller_name_bn": "মোঃ রফিকুল ইসলাম",
        "seller_name_en": "Md. Rafiqul Islam",
        "seller_nid_last4": "8912",
        "buyer_name_bn": "আমিনুল হক",
        "buyer_name_en": "Aminul Haque",
        "buyer_nid_last4": "3321",
        "prior_deed_no": "920/2005",
        "parent_khatian_no": "412",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "NORMAL_SALE",
        "scenario_role": "clean_partial_sale",
        "expected_conflict": "CLEAN_CHAIN_NO_CONFLICT",
        "conflict_details": "Lawful transfer within seller's 15.5 decimal entitlement. 10.5 decimals unencumbered balance remaining.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO 4: Missing or incomplete transaction history
    p4 = "PCL-CTG-KOT-088-3310"
    records.append({
        "id": "rec-scen-004-a",
        "parcel_id": p4,
        "deed_no": "1099/2024",
        "transaction_date": "2024-01-10",
        "division": "চট্টগ্রাম (Chittagong)",
        "district": "চট্টগ্রাম (Chittagong)",
        "upazila": "কোতোয়ালী (Kotwali)",
        "mouza": "আন্দরকিল্লা (Anderkilla)",
        "jl_no": "88",
        "khatian_no": "991",
        "dag_no": "3310",
        "land_class": "বাড়ি (Residential)",
        "total_parcel_area": 8.0,
        "transferred_area": 8.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "ফারুক আহমেদ",
        "seller_name_en": "Faruk Ahmed",
        "seller_nid_last4": "1940",
        "buyer_name_bn": "নাসির উদ্দিন",
        "buyer_name_en": "Nasir Uddin",
        "buyer_nid_last4": "5501",
        "prior_deed_no": "UNKNOWN-GAP",
        "parent_khatian_no": "UNKNOWN-99",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "INCOMPLETE_HISTORY",
        "scenario_role": "unanchored_transfer",
        "expected_conflict": "CHAIN_GAP_DETECTED",
        "conflict_details": "No prior registered transaction or mutation found connecting seller ফারুক আহমেদ to this parcel.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO 5: Multiple transactions involving the same parcel (chronological chain)
    p5 = "PCL-SYL-SAD-032-1540"
    records.append({
        "id": "rec-scen-005-a",
        "parcel_id": p5,
        "deed_no": "CS-1985-01",
        "transaction_date": "1985-02-10",
        "division": "সিলেট (Sylhet)",
        "district": "সিলেট (Sylhet)",
        "upazila": "সিলেট সদর (Sylhet Sadar)",
        "mouza": "আম্বরখানা (Amberkhana)",
        "jl_no": "32",
        "khatian_no": "605",
        "dag_no": "1540",
        "land_class": "ধানী (Paddy)",
        "total_parcel_area": 30.0,
        "transferred_area": 30.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "সরকার (CS Record)",
        "seller_name_en": "Government (CS Record)",
        "seller_nid_last4": "0000",
        "buyer_name_bn": "হাজী আব্দুল বারী",
        "buyer_name_en": "Haji Abdul Bari",
        "buyer_nid_last4": "7711",
        "prior_deed_no": None,
        "parent_khatian_no": "CS-01",
        "transaction_type": "সিএস রেকর্ড (Cadastral Baseline)",
        "conflict_scenario": "MULTIPLE_TRANSACTIONS",
        "scenario_role": "chain_step_1",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-005-b",
        "parcel_id": p5,
        "deed_no": "1205/2001",
        "transaction_date": "2001-06-15",
        "division": "সিলেট (Sylhet)",
        "district": "সিলেট (Sylhet)",
        "upazila": "সিলেট সদর (Sylhet Sadar)",
        "mouza": "আম্বরখানা (Amberkhana)",
        "jl_no": "32",
        "khatian_no": "605",
        "dag_no": "1540",
        "land_class": "ধানী (Paddy)",
        "total_parcel_area": 30.0,
        "transferred_area": 12.0,
        "seller_remaining_area": 18.0,
        "seller_name_bn": "হাজী আব্দুল বারী",
        "seller_name_en": "Haji Abdul Bari",
        "seller_nid_last4": "7711",
        "buyer_name_bn": "জিয়াউর রহমান",
        "buyer_name_en": "Ziaur Rahman",
        "buyer_nid_last4": "3019",
        "prior_deed_no": "CS-1985-01",
        "parent_khatian_no": "605",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "MULTIPLE_TRANSACTIONS",
        "scenario_role": "chain_step_2",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-005-c",
        "parcel_id": p5,
        "deed_no": "3409/2011",
        "transaction_date": "2011-09-22",
        "division": "সিলেট (Sylhet)",
        "district": "সিলেট (Sylhet)",
        "upazila": "সিলেট সদর (Sylhet Sadar)",
        "mouza": "আম্বরখানা (Amberkhana)",
        "jl_no": "32",
        "khatian_no": "605",
        "dag_no": "1540",
        "land_class": "ধানী (Paddy)",
        "total_parcel_area": 12.0,
        "transferred_area": 12.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "জিয়াউর রহমান",
        "seller_name_en": "Ziaur Rahman",
        "seller_nid_last4": "3019",
        "buyer_name_bn": "শাহীন আলম",
        "buyer_name_en": "Shahin Alam",
        "buyer_nid_last4": "9812",
        "prior_deed_no": "1205/2001",
        "parent_khatian_no": "605",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "MULTIPLE_TRANSACTIONS",
        "scenario_role": "chain_step_3",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-005-d",
        "parcel_id": p5,
        "deed_no": "8112/2018",
        "transaction_date": "2018-12-05",
        "division": "সিলেট (Sylhet)",
        "district": "সিলেট (Sylhet)",
        "upazila": "সিলেট সদর (Sylhet Sadar)",
        "mouza": "আম্বরখানা (Amberkhana)",
        "jl_no": "32",
        "khatian_no": "605",
        "dag_no": "1540",
        "land_class": "ধানী (Paddy)",
        "total_parcel_area": 12.0,
        "transferred_area": 6.0,
        "seller_remaining_area": 6.0,
        "seller_name_bn": "শাহীন আলম",
        "seller_name_en": "Shahin Alam",
        "seller_nid_last4": "9812",
        "buyer_name_bn": "মাকসুদা বেগম",
        "buyer_name_en": "Maksuda Begum",
        "buyer_nid_last4": "4210",
        "prior_deed_no": "3409/2011",
        "parent_khatian_no": "605",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "MULTIPLE_TRANSACTIONS",
        "scenario_role": "chain_step_4",
        "expected_conflict": "MULTIPLE_TRANSACTIONS_VERIFIED",
        "conflict_details": "4-step unbroken title chain from 1985 CS baseline through 2001, 2011, and 2018 transactions.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO SPECIMEN FOR SAMPLE UPLOADED DEED (sample_land_deed_demo.pdf)
    # Dag 1234, Khatian 456, Mouza Shantipur JL-12, Deed 2026-0017
    # Baseline acquisition in 2015: মোঃ রহিম উদ্দিন acquired 10.0 dec from মোঃ করিম উদ্দিন
    p_demo = "PCL-DHK-SHA-012-1234"
    records.append({
        "id": "rec-demo-deed-prior",
        "parcel_id": p_demo,
        "deed_no": "2015-0841",
        "transaction_date": "2015-06-10",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "উদাহরণপুর (Udaharanpur)",
        "mouza": "শান্তিপুর (কাল্পনিক)",
        "jl_no": "12",
        "khatian_no": "456",
        "dag_no": "1234",
        "land_class": "নাল (Nal / Agricultural)",
        "total_parcel_area": 10.0,
        "transferred_area": 10.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "মোঃ করিম উদ্দিন",
        "seller_name_en": "Md. Karim Uddin",
        "seller_nid_last4": "4101",
        "buyer_name_bn": "মোঃ রহিম উদ্দিন",
        "buyer_name_en": "Md. Rahim Uddin",
        "buyer_nid_last4": "7820",
        "prior_deed_no": "RS-2001-99",
        "parent_khatian_no": "RS-220",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "SAMPLE_DEED_PRIOR_RECORD",
        "scenario_role": "prior_acquisition_for_sample_pdf",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic baseline for sample_land_deed_demo.pdf"
    })
    records.append({
        "id": "rec-demo-deed-active",
        "parcel_id": p_demo,
        "deed_no": "2026-0017",
        "transaction_date": "2026-10-15",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "উদাহরণপুর (Udaharanpur)",
        "mouza": "শান্তিপুর (কাল্পনিক)",
        "jl_no": "12",
        "khatian_no": "456",
        "dag_no": "1234",
        "land_class": "নাল (Nal / Agricultural)",
        "total_parcel_area": 10.0,
        "transferred_area": 10.0,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "মোঃ রহিম উদ্দিন",
        "seller_name_en": "Md. Rahim Uddin",
        "seller_nid_last4": "7820",
        "buyer_name_bn": "মোঃ সাকিব হাসান",
        "buyer_name_en": "Md. Sakib Hasan",
        "buyer_nid_last4": "9942",
        "prior_deed_no": "2015-0841",
        "parent_khatian_no": "456",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "NORMAL_SALE",
        "scenario_role": "sample_deed_uploaded_match",
        "expected_conflict": "CLEAN_CHAIN_NO_CONFLICT",
        "conflict_details": "Matches sample_land_deed_demo.pdf. Consistent prior deed 2015-0841 establishing title.",
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic baseline for sample_land_deed_demo.pdf"
    })

    # SCENARIO 6: Baseline ownership for Dag 558 (Abdul Karim 10.0 dec)
    p_dag558 = "PCL-DHK-SAV-045-0558"
    records.append({
        "id": "rec-demo-dag-558-baseline",
        "parcel_id": p_dag558,
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
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # SCENARIO 7: Badda Plot 2490 (Samples 2 & 4)
    # rec-demo-004 in 2008, followed by rec-demo-002 in 2019
    p_badda = "PCL-DHK-GUL-012-2490"
    records.append({
        "id": "rec-scen-badda-004",
        "parcel_id": p_badda,
        "deed_no": "710/2008",
        "transaction_date": "2008-03-14",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "গুলশান (Gulshan)",
        "mouza": "বাড্ডা (Badda)",
        "jl_no": "12",
        "khatian_no": "410",
        "dag_no": "2490",
        "land_class": "ভিটি (Viti / Homestead)",
        "total_parcel_area": 8.25,
        "transferred_area": 8.25,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "মোজাম্মেল হোসেন",
        "seller_name_en": "Mozammel Hossain",
        "seller_nid_last4": "3391",
        "buyer_name_bn": "আবুল হোসেন তালুকদার",
        "buyer_name_en": "Abul Hossain Talukdar",
        "buyer_nid_last4": "1209",
        "prior_deed_no": "CS-1992-05",
        "parent_khatian_no": "SA-410",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "NORMAL_SALE_BASELINE",
        "scenario_role": "prior_acquisition_badda",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })
    records.append({
        "id": "rec-scen-badda-002",
        "parcel_id": p_badda,
        "deed_no": "8901/2019",
        "transaction_date": "2019-11-20",
        "division": "ঢাকা (Dhaka)",
        "district": "ঢাকা (Dhaka)",
        "upazila": "গুলশান (Gulshan)",
        "mouza": "বাড্ডা (Badda)",
        "jl_no": "12",
        "khatian_no": "835",
        "dag_no": "2490",
        "land_class": "ভিটি (Viti / Homestead)",
        "total_parcel_area": 8.25,
        "transferred_area": 8.25,
        "seller_remaining_area": 0.0,
        "seller_name_bn": "আবুল হোসেন তালুকদার",
        "seller_name_en": "Abul Hossain Talukdar",
        "seller_nid_last4": "1209",
        "buyer_name_bn": "সুলতানা জাহান",
        "buyer_name_en": "Sultana Jahan",
        "buyer_nid_last4": "4431",
        "prior_deed_no": "710/2008",
        "parent_khatian_no": "410",
        "transaction_type": "সাব-কবলা (Sale Deed)",
        "conflict_scenario": "NORMAL_SALE",
        "scenario_role": "badda_conveyance",
        "expected_conflict": None,
        "is_synthetic": True,
        "disclaimer": "DEMO DATA — not a legal verdict. Synthetic record for conflict simulation."
    })

    # ========================================================
    # 2. GENERATE MASS CADASTRAL PARCELS & HISTORIES (~20,000)
    # ========================================================
    current_count = len(records)
    target_count = TOTAL_RECORDS
    remaining_to_generate = target_count - current_count

    # We will generate ~5,500 distinct parcels with 2 to 5 sequential transactions each
    parcel_idx = 100
    while len(records) < target_count:
        mouza_info = random.choice(MOUZAS)
        dag_num = random.randint(100, 9999)
        khatian_num = random.randint(50, 4500)
        parcel_id = f"PCL-{mouza_info['code']}-{dag_num:04d}"
        land_cls = random.choice(LAND_CLASSES)

        # Baseline parcel size: 5.0 to 100.0 decimals
        initial_area = round(random.uniform(5.0, 80.0), 2)
        current_owner_bn, current_owner_en = make_name()
        current_owner_nid = f"{random.randint(1000, 9999)}"

        # 2 to 5 transactions in history
        chain_len = random.randint(2, 5)
        # Choose baseline start year between 1985 and 2005
        year = random.randint(1985, 2005)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        current_date = datetime(year, month, day)

        last_deed_no = f"CS-{year}-{random.randint(10, 99)}"
        last_khatian = f"{khatian_num}"

        # Baseline record (CS / SA cadastral baseline)
        rec_id = f"rec-txn-{len(records) + 1:05d}"
        records.append({
            "id": rec_id,
            "parcel_id": parcel_id,
            "deed_no": last_deed_no,
            "transaction_date": current_date.strftime("%Y-%m-%d"),
            "division": mouza_info["division"],
            "district": mouza_info["district"],
            "upazila": mouza_info["upazila"],
            "mouza": mouza_info["mouza"],
            "jl_no": mouza_info["jl_no"],
            "khatian_no": last_khatian,
            "dag_no": str(dag_num),
            "land_class": land_cls,
            "total_parcel_area": initial_area,
            "transferred_area": initial_area,
            "seller_remaining_area": 0.0,
            "seller_name_bn": "রেকর্ডীয় স্বত্বাধিকারী",
            "seller_name_en": "Original Record Holder",
            "seller_nid_last4": "0000",
            "buyer_name_bn": current_owner_bn,
            "buyer_name_en": current_owner_en,
            "buyer_nid_last4": current_owner_nid,
            "prior_deed_no": None,
            "parent_khatian_no": f"RS-{random.randint(10, 300)}",
            "transaction_type": "সিএস/এসএ খতিয়ান স্বত্ব",
            "conflict_scenario": None,
            "scenario_role": "cadastral_baseline",
            "expected_conflict": None,
            "is_synthetic": True,
            "disclaimer": "DEMO DATA — not a legal verdict. Synthetic transaction history."
        })

        if len(records) >= target_count:
            break

        remaining_area = initial_area

        # Add subsequent sequential or split transactions
        for step in range(1, chain_len):
            if len(records) >= target_count:
                break

            # Date step: 2 to 7 years later
            days_forward = random.randint(700, 2500)
            current_date += timedelta(days=days_forward)
            if current_date > datetime(2026, 10, 1):
                current_date = datetime(2026, random.randint(1, 9), random.randint(1, 28))

            next_buyer_bn, next_buyer_en = make_name()
            next_buyer_nid = f"{random.randint(1000, 9999)}"

            # Transfer portion or full
            if remaining_area <= 2.0 or random.random() < 0.4:
                # full remaining transfer
                transfer_amount = remaining_area
                rem_after = 0.0
            else:
                transfer_amount = round(random.uniform(1.0, max(1.5, remaining_area * 0.7)), 2)
                rem_after = round(remaining_area - transfer_amount, 2)

            deed_serial = random.randint(100, 9999)
            new_deed_no = f"{deed_serial}/{current_date.year}"
            new_khatian = f"{random.randint(50, 4500)}"

            rec_id = f"rec-txn-{len(records) + 1:05d}"
            records.append({
                "id": rec_id,
                "parcel_id": parcel_id,
                "deed_no": new_deed_no,
                "transaction_date": current_date.strftime("%Y-%m-%d"),
                "division": mouza_info["division"],
                "district": mouza_info["district"],
                "upazila": mouza_info["upazila"],
                "mouza": mouza_info["mouza"],
                "jl_no": mouza_info["jl_no"],
                "khatian_no": new_khatian,
                "dag_no": str(dag_num),
                "land_class": land_cls,
                "total_parcel_area": initial_area,
                "transferred_area": transfer_amount,
                "seller_remaining_area": rem_after,
                "seller_name_bn": current_owner_bn,
                "seller_name_en": current_owner_en,
                "seller_nid_last4": current_owner_nid,
                "buyer_name_bn": next_buyer_bn,
                "buyer_name_en": next_buyer_en,
                "buyer_nid_last4": next_buyer_nid,
                "prior_deed_no": last_deed_no,
                "parent_khatian_no": last_khatian,
                "transaction_type": "সাব-কবলা (Sale Deed)",
                "conflict_scenario": None,
                "scenario_role": "sequential_chain_transfer",
                "expected_conflict": None,
                "is_synthetic": True,
                "disclaimer": "DEMO DATA — not a legal verdict. Synthetic transaction history."
            })

            last_deed_no = new_deed_no
            last_khatian = new_khatian
            current_owner_bn, current_owner_en = next_buyer_bn, next_buyer_en
            current_owner_nid = next_buyer_nid
            remaining_area = transfer_amount

        parcel_idx += 1

    return records

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)))
    out_file = os.path.join(out_dir, "land_transactions.json")
    print("Generating synthetic land transactions dataset...")
    data = generate_dataset()
    print(f"Total records generated: {len(data)}")

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    file_size_mb = os.path.getsize(out_file) / (1024 * 1024)
    print(f"Saved dataset to {out_file} ({file_size_mb:.2f} MB)")
