# Synthetic Rural Land Price Dataset — Data Dictionary

> [!WARNING]
> **DEMO DATA DISCLAIMER**:
> This dataset is 100% synthetically generated for Bangladesh LandTech research and development.
> No actual personal data, real land registry records, or verified transaction values are included.
> Feature relationships represent synthetic simulation mechanisms and must not be used for real market land pricing.

---

## Dataset Overview
- **File Name**: `synthetic_rural_land_prices_20k.csv`
- **Total Records**: 20,000
- **Random Seed**: 42 (reproducible)
- **Target Variables**:
  - `price_per_decimal_bdt`: Price per decimal (shotok) in Bangladeshi Taka (BDT)
  - `total_price_bdt`: Total parcel price in BDT (`price_per_decimal_bdt * land_area_decimal`)

---

## Feature Definitions

| Field Name | Type | Allowed / Range | Description | Policy on Missing Values |
| :--- | :--- | :--- | :--- | :--- |
| `parcel_id` | String | `syn_pcl_000001` .. | Unique synthetic identifier (excluded from ML features). | Required (No missing) |
| `district_id` | Categorical | 5 synthetic districts | Broad regional agro-ecological zone indicator (e.g. `dist_north_rangpur`). | Imputed as `'missing'` if unseen |
| `upazila_id` | Categorical | 10 synthetic upazilas | Upazila administrative sub-cluster identifier. | Imputed as `'missing'` if unseen |
| `mouza_id` | Categorical | 33 synthetic mouzas | Primary cadastral survey cluster (mouza). | Imputed as `'missing'` if unseen |
| `land_area_decimal` | Numeric | 1.5 – 150.0 decimal | Land parcel size in traditional Bengali decimal (shotok). | Must be positive float |
| `land_type` | Categorical | 6 types | Categorical land class (`agricultural_nal`, `homestead_viti`, `commercial_shop`, `pond_doba`, `orchard_bagan`, `fallow_patit`). | One-hot encoded |
| `road_access_type` | Categorical | 6 types | Physical access grade (`national_highway_frontage`, `paved_pucca_road`, `herringbone_brick_road`, `unpaved_katcha_road`, `footpath_trail`, `no_direct_road`). | One-hot encoded |
| `road_width_ft` | Numeric | 0.0 – 48.0 ft | Right-of-way width of immediate road access in feet. | Imputed with median |
| `distance_to_paved_road_m` | Numeric | 0.0 – 4000.0 m | Distance to nearest paved / bitumen (LGED/RHD) road in meters. | Imputed with median |
| `distance_to_local_market_km`| Numeric | 0.1 – 12.0 km | Distance to nearest rural hat/bazar or growth center. | Imputed with median |
| `distance_to_upazila_center_km`| Numeric | 1.0 – 28.0 km | Distance to upazila administrative headquarters. | Imputed with median |
| `distance_to_school_km` | Numeric | 0.1 – 6.0 km | Distance to nearest primary or secondary school. | ~2% missing; median imputed |
| `distance_to_healthcare_km` | Numeric | 0.2 – 16.0 km | Distance to nearest community clinic or hospital. | ~2.5% missing; median imputed |
| `flood_risk_level` | Categorical | 4 tiers | Seasonal inundation vulnerability (`none`, `seasonal_shallow`, `moderate_regular`, `high_flash_flood`). | One-hot encoded |
| `drainage_quality` | Categorical | 3 tiers | Surface runoff efficiency (`excellent_highland`, `moderate_sloped`, `poor_waterlogged`). | One-hot encoded |
| `plot_shape_category` | Categorical | 3 categories | Geometric layout efficiency (`regular_rectangular`, `irregular_trapezoid`, `fragmented_narrow`). | One-hot encoded |
| `land_use_category` | Categorical | 5 categories | Practical utilization profile (`single_crop`, `multi_crop`, `residential_settlement`, `agro_fisheries`, `rural_enterprise`). | One-hot encoded |
| `access_road_available` | Binary | 0 or 1 | Direct access road presence indicator. | Mode imputed |
| `electricity_available` | Binary | 0 or 1 | Grid electricity connectivity indicator. | Mode imputed |
| `water_access_available` | Binary | 0 or 1 | Irrigation water/tubewell access indicator. | Mode imputed |
| `transaction_period` | Categorical | 2023-Q1 – 2026-Q1 | Synthetic time period of observation. | One-hot encoded |
| `is_synthetic` | Boolean | True | Hardcoded flag asserting demo nature. | Metadata |

---

## Unit Consistency Equation
$$\text{Total Price (BDT)} = \text{Price Per Decimal (BDT)} \times \text{Land Area (Decimal)}$$
All evaluations verify strict equality with rounded tolerance.
