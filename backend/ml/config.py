import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "ml"
ARTIFACTS_DIR = ML_DIR / "artifacts"
REPORTS_DIR = ML_DIR / "reports"
DATA_DIR = BASE_DIR / "data" / "synthetic_land_prices"

DATASET_CSV_PATH = DATA_DIR / "synthetic_rural_land_prices_20k.csv"
MODEL_PIPELINE_PATH = ARTIFACTS_DIR / "best_land_price_model.joblib"
MODEL_METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"
EVALUATION_REPORT_JSON_PATH = REPORTS_DIR / "evaluation_report.json"
EVALUATION_REPORT_MD_PATH = REPORTS_DIR / "evaluation_report.md"
DATA_DICTIONARY_MD_PATH = REPORTS_DIR / "data_dictionary.md"
PROVENANCE_MD_PATH = REPORTS_DIR / "provenance.md"
MODEL_CARD_MD_PATH = REPORTS_DIR / "model_card.md"

# Dataset Generation Config
DEFAULT_RANDOM_SEED = 42
DEFAULT_SAMPLE_COUNT = 20000

TRAIN_SPLIT_RATIO = 0.70
VAL_SPLIT_RATIO = 0.15
TEST_SPLIT_RATIO = 0.15

# Geographic Synthetic Hierarchy (Explicitly Synthetic / Fictional Demo Regions)
SYNTHETIC_REGIONS = {
    "dist_north_rangpur": {
        "name_bn": "রংপুর পল্লী অঞ্চল (ডেমো জেলা ০১)",
        "name_en": "Rangpur Rural Belt (Demo District 01)",
        "base_price_bdt": 38000.0,
        "upazilas": {
            "upz_pirgacha": {
                "name_bn": "পীরগাছা ডেমো উপজেলা",
                "name_en": "Pirgacha Demo Upazila",
                "mouzas": [
                    "mouza_chhatra_01",
                    "mouza_kalyani_02",
                    "mouza_tambulpur_03",
                    "mouza_parul_04",
                ],
            },
            "upz_mithapukur": {
                "name_bn": "মিঠাপুকুর ডেমো উপজেলা",
                "name_en": "Mithapukur Demo Upazila",
                "mouzas": [
                    "mouza_shukurerhat_05",
                    "mouza_ranipukur_06",
                    "mouza_payraband_07",
                ],
            },
        },
    },
    "dist_west_rajshahi": {
        "name_bn": "রাজশাহী বরেন্দ্র অঞ্চল (ডেমো জেলা ০২)",
        "name_en": "Rajshahi Barind Zone (Demo District 02)",
        "base_price_bdt": 48000.0,
        "upazilas": {
            "upz_godagari": {
                "name_bn": "গোদাগাড়ী ডেমো উপজেলা",
                "name_en": "Godagari Demo Upazila",
                "mouzas": [
                    "mouza_matshob_08",
                    "mouza_gogram_09",
                    "mouza_rishikul_10",
                    "mouza_deopara_11",
                ],
            },
            "upz_tanore": {
                "name_bn": "তানোর ডেমো উপজেলা",
                "name_en": "Tanore Demo Upazila",
                "mouzas": [
                    "mouza_kalma_12",
                    "mouza_badhair_13",
                    "mouza_saranjai_14",
                ],
            },
        },
    },
    "dist_northeast_sylhet": {
        "name_bn": "সিলেট হাওর-টিলা অঞ্চল (ডেমো জেলা ০৩)",
        "name_en": "Sylhet Haor-Tila Belt (Demo District 03)",
        "base_price_bdt": 55000.0,
        "upazilas": {
            "upz_golapganj": {
                "name_bn": "গোলাপগঞ্জ ডেমো উপজেলা",
                "name_en": "Golapganj Demo Upazila",
                "mouzas": [
                    "mouza_dhakadakshin_15",
                    "mouza_lakshanaband_16",
                    "mouza_bhadeshwar_17",
                ],
            },
            "upz_beanibazar": {
                "name_bn": "বিয়ানীবাজার ডেমো উপজেলা",
                "name_en": "Beanibazar Demo Upazila",
                "mouzas": [
                    "mouza_kurarbazar_18",
                    "mouza_sheola_19",
                    "mouza_tilpara_20",
                ],
            },
        },
    },
    "dist_south_khulna": {
        "name_bn": "খুলনা উপকূলীয় অঞ্চল (ডেমো জেলা ০৪)",
        "name_en": "Khulna Coastal Plains (Demo District 04)",
        "base_price_bdt": 42000.0,
        "upazilas": {
            "upz_dumuria": {
                "name_bn": "ডুমুরিয়া ডেমো উপজেলা",
                "name_en": "Dumuria Demo Upazila",
                "mouzas": [
                    "mouza_shovna_21",
                    "mouza_gutudia_22",
                    "mouza_rudaghara_23",
                    "mouza_kharnia_24",
                ],
            },
            "upz_paikgachha": {
                "name_bn": "পাইকগাছা ডেমো উপজেলা",
                "name_en": "Paikgachha Demo Upazila",
                "mouzas": [
                    "mouza_haridhali_25",
                    "mouza_kopilmuni_26",
                    "mouza_lata_27",
                ],
            },
        },
    },
    "dist_central_mymensingh": {
        "name_bn": "ময়মনসিংহ নদী-অববাহিকা (ডেমো জেলা ০৫)",
        "name_en": "Mymensingh Basin Belt (Demo District 05)",
        "base_price_bdt": 46000.0,
        "upazilas": {
            "upz_fulbaria": {
                "name_bn": "ফুলবাড়িয়া ডেমো উপজেলা",
                "name_en": "Fulbaria Demo Upazila",
                "mouzas": [
                    "mouza_radhakanai_28",
                    "mouza_enayetpur_29",
                    "mouza_bhabanipur_30",
                ],
            },
            "upz_trishal": {
                "name_bn": "ত্রিশাল ডেমো উপজেলা",
                "name_en": "Trishal Demo Upazila",
                "mouzas": [
                    "mouza_dhaniakhola_31",
                    "mouza_kanthal_32",
                    "mouza_mokshapur_33",
                ],
            },
        },
    },
}

# Categorical Value Sets
LAND_TYPES = [
    "agricultural_nal",     # Lowland crop field / নাল জমি
    "homestead_viti",       # Raised homestead ground / ভিটি / বাড়ি
    "commercial_shop",      # Roadside shop or hat-bazar periphery / বাণিজ্যিক
    "pond_doba",            # Waterbody or aquaculture ditch / পুকুর-ডোবা
    "orchard_bagan",        # Timber or fruit orchard / বাগান
    "fallow_patit",         # Uncultivated or unutilized / পতিত জমি
]

ROAD_ACCESS_TYPES = [
    "national_highway_frontage",  # Directly facing regional/national highway
    "paved_pucca_road",           # Paved bitumen rural road (LGED)
    "herringbone_brick_road",     # Brick herringbone bond (HBB)
    "unpaved_katcha_road",        # Mud / unpaved cart road
    "footpath_trail",             # Footpath / aisle walk only
    "no_direct_road",             # Landlocked or water access only
]

FLOOD_RISK_LEVELS = [
    "none",                   # High land, never submerged
    "seasonal_shallow",       # Normal monsoon submergence (< 1 ft for short period)
    "moderate_regular",       # Yearly inundation (1-3 ft)
    "high_flash_flood",       # Severe flash-flood or severe waterlogging zone
]

DRAINAGE_QUALITIES = [
    "excellent_highland",     # Immediate natural runoff
    "moderate_sloped",        # Fair drainage within reasonable hours
    "poor_waterlogged",       # Slow recession, prone to waterlogging
]

PLOT_SHAPE_CATEGORIES = [
    "regular_rectangular",    # Standard rectangular or square geometry
    "irregular_trapezoid",    # Non-orthogonal but usable geometry
    "fragmented_narrow",      # Narrow ribbon strip or heavily fragmented
]

LAND_USE_CATEGORIES = [
    "single_crop",            # Aman or Boro only
    "multi_crop",             # 2-3 crop cycles per year
    "residential_settlement", # Rural homestead residence
    "agro_fisheries",         # Fish farming or integrated agro
    "rural_enterprise",       # Poultry, dairy, cold storage, small workshop
]

TRANSACTION_PERIODS = [
    "2023-Q1", "2023-Q2", "2023-Q3", "2023-Q4",
    "2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4",
    "2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4",
    "2026-Q1"
]

# Feature lists
NUMERICAL_FEATURES = [
    "land_area_decimal",
    "road_width_ft",
    "distance_to_paved_road_m",
    "distance_to_local_market_km",
    "distance_to_upazila_center_km",
    "distance_to_school_km",
    "distance_to_healthcare_km",
]

CATEGORICAL_FEATURES = [
    "district_id",
    "upazila_id",
    "mouza_id",
    "land_type",
    "road_access_type",
    "flood_risk_level",
    "drainage_quality",
    "plot_shape_category",
    "land_use_category",
    "transaction_period",
]

BINARY_FEATURES = [
    "access_road_available",
    "electricity_available",
    "water_access_available",
]

ALL_FEATURE_COLUMNS = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES
ALL_FEATURES = ALL_FEATURE_COLUMNS
BEST_MODEL_PATH = MODEL_PIPELINE_PATH
TARGET_COLUMN = "price_per_decimal_bdt"
SECONDARY_TARGET_COLUMN = "total_price_bdt"

# Provenance Statement
PROVENANCE_STATEMENT = (
    "100% synthetically generated rural land dataset simulating non-linear geospatial valuation factors "
    "in Bangladesh (Team ZENOX - Bhumi Kobocho). Strictly for algorithmic research; NOT real market data."
)

# Geographic helper lists
SYNTHETIC_DISTRICTS = [
    {"id": k, "name_bn": v["name_bn"], "name_en": v["name_en"]}
    for k, v in SYNTHETIC_REGIONS.items()
]

SYNTHETIC_UPAZILAS = {
    upz_id: {
        "district_id": d_id,
        "name_bn": upz_data["name_bn"],
        "name_en": upz_data["name_en"]
    }
    for d_id, d_data in SYNTHETIC_REGIONS.items()
    for upz_id, upz_data in d_data["upazilas"].items()
}

SYNTHETIC_MOUZAS = [
    mouza
    for d_data in SYNTHETIC_REGIONS.values()
    for upz_data in d_data["upazilas"].values()
    for mouza in upz_data["mouzas"]
]

# Mandatory Disclaimers
DISCLAIMER_EN = (
    "SYNTHETIC DATA & EXPERIMENTAL ML MODEL — NOT A REAL MARKET VALUATION. "
    "All records, locations, and prices are synthetically generated for demonstration. "
    "This output must not be used for actual financial transactions, legal appraisal, or court evidence."
)

DISCLAIMER_BN = (
    "এই মূল্যায়ন সম্পূর্ণ synthetic data দিয়ে তৈরি পরীক্ষামূলক ML model-এর output। "
    "এটি বাংলাদেশের প্রকৃত বাজারদর নয়, জমির valuation নয় এবং জমি কেনাবেচার আর্থিক সিদ্ধান্তের জন্য ব্যবহারযোগ্য নয়।"
)

