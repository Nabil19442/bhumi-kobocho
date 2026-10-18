"""
Synthetic Land Cases Generator for Bhumi Kobocho (ভূমি কবচ)
Generates deterministic, seeded case records for parcels:
- Court cases (title disputes, partition suits)
- Mutation cases (e-mutation, record correction)
- Mortgages (bank liens, institutional charges)
- Khas / Acquisition (public road widening, government interest inquiry)

CRITICAL:
- All cases carry is_synthetic=True and explicit demo disclaimers.
- Keyed by parcel_id (matching land_transactions.json).
- Explicitly covers all demo scenario parcels.
- Assigns cases to ~10% of general parcels so most queries return no cases found.
"""

import os
import json
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CASES_FILE = os.path.join(DATA_DIR, "land_cases.json")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "land_transactions.json")

RANDOM_SEED = 42

COURT_AUTHORITIES = [
    "যুগ্ম জেলা জজ ১ম আদালত, ঢাকা (Joint District Judge 1st Court, Dhaka)",
    "সিনিয়র সহকারী জজ আদালত, সাভার (Senior Assistant Judge Court, Savar)",
    "যুগ্ম জেলা জজ ২য় আদালত, চট্টগ্রাম (Joint District Judge 2nd Court, Chittagong)",
    "সহকারী জজ আদালত, সিলেট (Assistant Judge Court, Sylhet)",
    "ল্যান্ড সার্ভে ট্রাইব্যুনাল, ঢাকা (Land Survey Tribunal, Dhaka)",
    "যুগ্ম জেলা জজ আদালত, রাজশাহী (Joint District Judge Court, Rajshahi)",
]

MUTATION_AUTHORITIES = [
    "সহকারী কমিশনার (ভূমি), মিরপুর রাজস্ব সার্কেল (AC Land, Mirpur)",
    "সহকারী কমিশনার (ভূমি), গুলশান রাজস্ব সার্কেল (AC Land, Gulshan)",
    "উপজেলা ভূমি অফিস, সাভার (Upazila Land Office, Savar)",
    "উপজেলা ভূমি অফিস, সিলেট সদর (Upazila Land Office, Sylhet Sadar)",
    "সহকারী কমিশনার (ভূমি), কোতোয়ালী সার্কেল, চট্টগ্রাম (AC Land, Kotwali, Chittagong)",
]

MORTGAGE_AUTHORITIES = [
    "সোনালী ব্যাংক পিএলসি, প্রিন্সিপাল শাখা (Sonali Bank PLC, Principal Branch)",
    "অগ্রণী ব্যাংক পিএলসি, স্থানীয় কার্যালয় (Agrani Bank PLC, Local Office)",
    "পূবালী ব্যাংক পিএলসি, করপোরেট শাখা (Pubali Bank PLC, Corporate Branch)",
    "ইসলামী ব্যাংক বাংলাদেশ পিএলসি, গুলশান শাখা (Islami Bank Bangladesh PLC, Gulshan)",
    "বাংলাদেশ কৃষি ব্যাংক, সাভার শাখা (Bangladesh Krishi Bank, Savar)",
    "ডাচ-বাংলা ব্যাংক পিএলসি, মতিঝিল শাখা (Dutch-Bangla Bank PLC, Motijheel)",
]

KHAS_AUTHORITIES = [
    "জেলা প্রশাসকের কার্যালয়, ভূমি অধিগ্রহণ শাখা, ঢাকা (DC Office, Land Acquisition Branch, Dhaka)",
    "জেলা প্রশাসকের কার্যালয়, চট্টগ্রাম (DC Office, Chittagong)",
    "সড়ক ও জনপথ অধিদপ্তর, ঢাকা জোন (Roads and Highways Department, Dhaka Zone)",
    "রাজউক ভূমি ও সম্পত্তি শাখা (RAJUK Land & Estate Branch)",
    "বাংলাদেশ রেলওয়ে পূর্বাঞ্চল ভূ-সম্পত্তি বিভাগ (Bangladesh Railway East Estate Dept)",
]

def generate_cases_dataset():
    random.seed(RANDOM_SEED)

    # 1. Base Scenario Parcels with rich predetermined cases
    cases_by_parcel = {}

    # Scenario 1: Gulshan Plot 550 (Duplicate Sale) -> Pending Court Case
    p_gulshan = "PCL-DHK-GUL-015-0550"
    cases_by_parcel[p_gulshan] = [
        {
            "case_id": "CS-2023-8812",
            "parcel_id": p_gulshan,
            "type": "court_case",
            "title_bn": "স্বত্ব ঘোষণার দেওয়ানি মোকদ্দমা (Civil Title Suit)",
            "title_en": "Civil Title & Injunction Suit",
            "authority": "যুগ্ম জেলা জজ ১ম আদালত, ঢাকা (Joint District Judge 1st Court, Dhaka)",
            "filed_date": "2023-11-14",
            "status": "pending",
            "summary_bn": "জমির স্বত্ব ও পূর্ববর্তী সাব-কবলা দলিল দাবির বিরোধ নিয়ে দেওয়ানি মামলা বিচারাধীন রয়েছে।",
            "summary_en": "Civil title dispute pending regarding competing ownership claims on the parcel.",
            "is_synthetic": True
        }
    ]

    # Scenario 2: Savar Plot 784 (Area Overlap) -> Active Mortgage + Disposed Mutation
    p_savar = "PCL-DHK-SAV-045-0784"
    cases_by_parcel[p_savar] = [
        {
            "case_id": "MUT-2018-0512",
            "parcel_id": p_savar,
            "type": "mutation_case",
            "title_bn": "নামজারি ও জমাভাগ আবেদন (Mutation & Partition Case)",
            "title_en": "e-Mutation & Subdivision Record",
            "authority": "উপজেলা ভূমি অফিস, সাভার (Upazila Land Office, Savar)",
            "filed_date": "2018-04-10",
            "status": "disposed",
            "summary_bn": "দলিল নং ২৩১১/২০১৮ মূলে নামজারি ও জমাভাগ সম্পন্ন হয়ে খতিয়ান ১২৯ সৃজিত।",
            "summary_en": "Mutation and subdivision approved per Deed 2311/2018; Khatian 129 created.",
            "is_synthetic": True
        },
        {
            "case_id": "MORT-2021-4409",
            "parcel_id": p_savar,
            "type": "mortgage",
            "title_bn": "বন্ধকি দায় ও ঋণ মঞ্জুরি (Bank Mortgage & Lien)",
            "title_en": "Registered Institutional First Charge Mortgage",
            "authority": "সোনালী ব্যাংক পিএলসি, সাভার শাখা (Sonali Bank PLC, Savar Branch)",
            "filed_date": "2021-06-20",
            "status": "active",
            "summary_bn": "উক্ত জমির বিপরীতে আর্থিক দায় ও প্রথম বন্ধক বহাল রয়েছে (সিআইবি চার্জ নিবন্ধিত)।",
            "summary_en": "Registered first charge mortgage and bank credit lien active on this property.",
            "is_synthetic": True
        }
    ]

    # Scenario 3: Badda Plot 2490 (Samples 2 & 4) -> Disposed Mutation + Khas/Acquisition Under Review
    p_badda = "PCL-DHK-GUL-012-2490"
    cases_by_parcel[p_badda] = [
        {
            "case_id": "MUT-2020-3108",
            "parcel_id": p_badda,
            "type": "mutation_case",
            "title_bn": "ই-নামজারি খতিয়ান সৃজন (e-Mutation Record Creation)",
            "title_en": "e-Mutation & Record Creation",
            "authority": "সহকারী কমিশনার (ভূমি), গুলশান রাজস্ব সার্কেল (AC Land, Gulshan)",
            "filed_date": "2020-02-15",
            "status": "disposed",
            "summary_bn": "সাব-কবলা ৮৯০১/২০১৯ মূলে নামজারি অনুমোদিত ও নতুন খতিয়ান ৮৩৫ সৃজিত।",
            "summary_en": "e-Mutation approved for Deed 8901/2019; new Khatian 835 created.",
            "is_synthetic": True
        },
        {
            "case_id": "ACQ-2024-0192",
            "parcel_id": p_badda,
            "type": "khas_acquisition",
            "title_bn": "সরকারি স্বার্থ সংশ্লিষ্ট খাস/অধিগ্রহণ অনুসন্ধান (Public Land Acquisition Verification)",
            "title_en": "Preliminary Land Acquisition Feasibility Inquiry",
            "authority": "জেলা প্রশাসকের কার্যালয়, ভূমি অধিগ্রহণ শাখা, ঢাকা (DC Office, Land Acquisition Branch, Dhaka)",
            "filed_date": "2024-03-02",
            "status": "under_review",
            "summary_bn": "সংলগ্ন নাগরিক অবকাঠামো উন্নয়ন প্রকল্পের জন্য অধিগ্রহণ সম্ভাব্যতা যাচাই প্রক্রিয়াধীন।",
            "summary_en": "Preliminary land acquisition assessment under review for municipal road widening.",
            "is_synthetic": True
        }
    ]

    # Scenario 4: Mirpur Plot 1058 (Sample 1) -> Disposed Mutation
    p_mirpur = "PCL-DHK-MIR-028-1058"
    cases_by_parcel[p_mirpur] = [
        {
            "case_id": "MUT-2022-9014",
            "parcel_id": p_mirpur,
            "type": "mutation_case",
            "title_bn": "নামজারি খতিয়ান সংশোধন (Mutation & Record Correction)",
            "title_en": "Mutation & Record Correction",
            "authority": "সহকারী কমিশনার (ভূমি), মিরপুর রাজস্ব সার্কেল (AC Land, Mirpur)",
            "filed_date": "2022-01-20",
            "status": "disposed",
            "summary_bn": "দলিল ১৪৮২/২০২১ মূলে রেকর্ডীয় মালিকানা হালনাগাদ সম্পন্ন ও খতিয়ান ৪১২ বহাল।",
            "summary_en": "Mutation completed updating recorded ownership under Deed 1482/2021.",
            "is_synthetic": True
        }
    ]

    # Scenario 5: Chittagong Plot 3310 (Chain Gap) -> Pending Court Case
    p_ctg = "PCL-CTG-KOT-088-3310"
    cases_by_parcel[p_ctg] = [
        {
            "case_id": "CS-2024-1105",
            "parcel_id": p_ctg,
            "type": "court_case",
            "title_bn": "উত্তরাধিকার ও বণ্টন মোকদ্দমা (Partition & Succession Suit)",
            "title_en": "Partition & Succession Title Suit",
            "authority": "সিনিয়র সহকারী জজ আদালত, চট্টগ্রাম (Senior Assistant Judge Court, Chittagong)",
            "filed_date": "2024-02-18",
            "status": "pending",
            "summary_bn": "পৈতৃক ভূমির অংশীদারিত্ব নিয়ে স্বত্ব ও বণ্টন মামলা বিচারাধীন।",
            "summary_en": "Partition and succession title suit pending between heirs.",
            "is_synthetic": True
        }
    ]

    # Scenario 6: Shantipur Plot 1234 (Sample PDF Deed) -> CLEAN PARCEL (Explicit empty list)
    p_shantipur = "PCL-DHK-SHA-012-1234"
    cases_by_parcel[p_shantipur] = []

    # Scenario 7: Savar Plot 558 (Baseline) -> CLEAN PARCEL
    p_savar_558 = "PCL-DHK-SAV-045-0558"
    cases_by_parcel[p_savar_558] = []

    # 2. Extract remaining parcels from land_transactions.json
    all_parcels = set()
    if os.path.exists(TRANSACTIONS_FILE):
        try:
            with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                txs = json.load(f)
            for t in txs:
                pid = t.get("parcel_id")
                if pid:
                    all_parcels.add(pid)
        except Exception:
            pass

    sorted_parcels = sorted(list(all_parcels))
    
    # 3. Deterministically assign cases to ~10% of remaining parcels
    case_counter = 1000
    for pid in sorted_parcels:
        if pid in cases_by_parcel:
            continue
        
        # 10% probability
        if random.random() < 0.10:
            c_type = random.choice(["court_case", "mutation_case", "mortgage", "khas_acquisition"])
            case_counter += 1
            year = random.choice([2021, 2022, 2023, 2024, 2025])
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            f_date = f"{year}-{month:02d}-{day:02d}"

            if c_type == "court_case":
                status = random.choice(["pending", "disposed"])
                auth = random.choice(COURT_AUTHORITIES)
                case_id = f"CS-{year}-{case_counter}"
                if status == "pending":
                    t_bn = "স্বত্ব ও সীমানা বিরোধ মামলা (Title & Boundary Dispute)"
                    t_en = "Title & Boundary Dispute Suit"
                    s_bn = "জমির দখল ও সীমানা নির্ধারণ নিয়ে দেওয়ানি মামলা বিচারাধীন রয়েছে।"
                    s_en = "Civil suit pending regarding possession and boundary determination."
                else:
                    t_bn = "নিস্পত্তিকৃত স্বত্ব মামলা (Disposed Title Suit)"
                    t_en = "Disposed Title Suit"
                    s_bn = "স্বত্ব নির্ধারণের দেওয়ানি মোকদ্দমা ডিগ্রিপ্রাপ্ত ও নিস্পত্তি হয়েছে।"
                    s_en = "Civil title dispute was adjudicated and formal decree issued."

            elif c_type == "mutation_case":
                status = random.choice(["pending", "disposed"])
                auth = random.choice(MUTATION_AUTHORITIES)
                case_id = f"MUT-{year}-{case_counter}"
                if status == "pending":
                    t_bn = "নামজারি ও জমাখারিজ প্রক্রিয়াধীন (Mutation Under Process)"
                    t_en = "Mutation Application Under Process"
                    s_bn = "ক্রেতার আবেদনের ভিত্তিতে সহকারী কমিশনার (ভূমি) কার্যালয়ে নামজারি শুনানির জন্য অপেক্ষমাণ।"
                    s_en = "Mutation application submitted by buyer and pending AC Land hearing."
                else:
                    t_bn = "অনুমোদিত নামজারি কেস (Approved Mutation Record)"
                    t_en = "Approved Mutation Case"
                    s_bn = "পূর্ববর্তী হস্তান্তরের প্রেক্ষিতে নামজারি ও রেকর্ড সংশোধন সফলভাবে সম্পন্ন হয়েছে।"
                    s_en = "Mutation and record correction successfully approved per registered deed."

            elif c_type == "mortgage":
                status = random.choice(["active", "released"])
                auth = random.choice(MORTGAGE_AUTHORITIES)
                case_id = f"MORT-{year}-{case_counter}"
                if status == "active":
                    t_bn = "আর্থিক বন্ধক ও দায় বহাল (Active Financial Mortgage)"
                    t_en = "Active Financial Mortgage & Lien"
                    s_bn = "ব্যাংক বা আর্থিক প্রতিষ্ঠানে দায়বদ্ধতার বিপরীতে রেজিস্ট্রি বন্ধক বলবৎ রয়েছে।"
                    s_en = "Registered equitable/legal mortgage is active securing institutional credit."
                else:
                    t_bn = "দায়মুক্তি ও বন্ধক প্রত্যাহার (Mortgage Released / Redemption)"
                    t_en = "Mortgage Released / Deed of Redemption"
                    s_bn = "ঋণ পরিশোধ সাপেক্ষে ব্যাংক কর্তৃক দায়মুক্তি ও না-দাবি সনদ জারি করা হয়েছে।"
                    s_en = "Loan satisfied; formal release deed and no-objection certificate executed."

            else:  # khas_acquisition
                status = random.choice(["under_review", "disposed"])
                auth = random.choice(KHAS_AUTHORITIES)
                case_id = f"ACQ-{year}-{case_counter}"
                if status == "under_review":
                    t_bn = "সরকারি খাস/অধিগ্রহণ অনুসন্ধান (Public Land Interest Inquiry)"
                    t_en = "Public Land Interest / Acquisition Verification"
                    s_bn = "উন্নয়ন পরিকল্পনা বা সরকারি খাস রেকর্ড বিষয়ক যাচাই প্রক্রিয়া চলমান রয়েছে।"
                    s_en = "Inquiry ongoing regarding public development feasibility or khas land status."
                else:
                    t_bn = "অধিগ্রহণ নোটিশ অব্যাহতি (Acquisition Inquiry Closed)"
                    t_en = "Acquisition Inquiry Concluded"
                    s_bn = "যাচাই শেষে সরকারি অধিগ্রহণ প্রক্রিয়া বাতিল/অব্যাহতি প্রদান করা হয়েছে।"
                    s_en = "Feasibility study concluded without land requisition."

            cases_by_parcel[pid] = [
                {
                    "case_id": case_id,
                    "parcel_id": pid,
                    "type": c_type,
                    "title_bn": t_bn,
                    "title_en": t_en,
                    "authority": auth,
                    "filed_date": f_date,
                    "status": status,
                    "summary_bn": s_bn,
                    "summary_en": s_en,
                    "is_synthetic": True
                }
            ]

    return cases_by_parcel

def main():
    dataset = generate_cases_dataset()
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    print(f"Generated {CASES_FILE} with {len(dataset)} parcel case entries.")

if __name__ == "__main__":
    main()
