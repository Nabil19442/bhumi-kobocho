import os
import argparse
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

try:
    from .config import (
        SYNTHETIC_REGIONS,
        LAND_TYPES,
        ROAD_ACCESS_TYPES,
        FLOOD_RISK_LEVELS,
        DRAINAGE_QUALITIES,
        PLOT_SHAPE_CATEGORIES,
        LAND_USE_CATEGORIES,
        TRANSACTION_PERIODS,
        DEFAULT_RANDOM_SEED,
        DEFAULT_SAMPLE_COUNT,
        DATASET_CSV_PATH,
        DATA_DIR,
    )
except ImportError:
    from backend.ml.config import (
        SYNTHETIC_REGIONS,
        LAND_TYPES,
        ROAD_ACCESS_TYPES,
        FLOOD_RISK_LEVELS,
        DRAINAGE_QUALITIES,
        PLOT_SHAPE_CATEGORIES,
        LAND_USE_CATEGORIES,
        TRANSACTION_PERIODS,
        DEFAULT_RANDOM_SEED,
        DEFAULT_SAMPLE_COUNT,
        DATASET_CSV_PATH,
        DATA_DIR,
    )

def generate_synthetic_land_dataset(
    n_samples: int = DEFAULT_SAMPLE_COUNT,
    random_seed: int = DEFAULT_RANDOM_SEED,
    sample_count: Optional[int] = None
) -> pd.DataFrame:
    """
    Generates a reproducible, domain-faithful synthetic dataset of rural Bangladesh land parcels.
    Uses a non-linear multi-factor valuation mechanism with spatial variation, feature interactions,
    controlled noise, and deliberate edge cases.
    """
    if sample_count is not None:
        n_samples = sample_count
    rng = np.random.RandomState(random_seed)

    # 1. Sample geographic hierarchy (District -> Upazila -> Mouza)
    district_keys = list(SYNTHETIC_REGIONS.keys())
    districts = rng.choice(district_keys, size=n_samples)

    upazilas = []
    mouzas = []
    base_location_prices = []

    for dist in districts:
        reg_info = SYNTHETIC_REGIONS[dist]
        upz_keys = list(reg_info["upazilas"].keys())
        chosen_upz = rng.choice(upz_keys)
        chosen_mouza = rng.choice(reg_info["upazilas"][chosen_upz]["mouzas"])
        
        upazilas.append(chosen_upz)
        mouzas.append(chosen_mouza)
        
        # Add slight intra-mouza spatial micro-variation (+/- 8%)
        mouza_hash = hash(chosen_mouza) % 1000 / 1000.0
        mouza_modifier = 0.92 + 0.16 * mouza_hash
        base_location_prices.append(reg_info["base_price_bdt"] * mouza_modifier)

    base_location_prices = np.array(base_location_prices)

    # 2. Sample Parcel Characteristics
    # Land area in decimal (shotok): log-normal distribution centered around 15 decimal
    # with min of 1.5 and realistic upper tail up to 150 decimal
    land_area_decimal = np.clip(
        rng.lognormal(mean=2.6, sigma=0.65, size=n_samples),
        a_min=1.5,
        a_max=150.0
    ).round(2)

    # Land types with realistic Bangladesh rural probabilities
    land_type_probs = [0.46, 0.22, 0.08, 0.09, 0.10, 0.05]
    land_type = rng.choice(LAND_TYPES, size=n_samples, p=land_type_probs)

    # Road access types
    road_access_probs = [0.06, 0.30, 0.22, 0.26, 0.11, 0.05]
    road_access_type = rng.choice(ROAD_ACCESS_TYPES, size=n_samples, p=road_access_probs)

    # Road width: depends on access type
    road_width_ft = np.zeros(n_samples)
    for i in range(n_samples):
        rat = road_access_type[i]
        if rat == "national_highway_frontage":
            road_width_ft[i] = rng.uniform(24.0, 48.0)
        elif rat == "paved_pucca_road":
            road_width_ft[i] = rng.uniform(12.0, 24.0)
        elif rat == "herringbone_brick_road":
            road_width_ft[i] = rng.uniform(8.0, 14.0)
        elif rat == "unpaved_katcha_road":
            road_width_ft[i] = rng.uniform(6.0, 12.0)
        elif rat == "footpath_trail":
            road_width_ft[i] = rng.uniform(2.5, 5.0)
        else:
            road_width_ft[i] = 0.0
    road_width_ft = road_width_ft.round(1)

    # Distance to paved road (m): 0 for highway and pucca
    distance_to_paved_road_m = np.zeros(n_samples)
    for i in range(n_samples):
        rat = road_access_type[i]
        if rat in ["national_highway_frontage", "paved_pucca_road"]:
            distance_to_paved_road_m[i] = 0.0
        elif rat == "herringbone_brick_road":
            distance_to_paved_road_m[i] = rng.exponential(scale=350.0)
        elif rat == "unpaved_katcha_road":
            distance_to_paved_road_m[i] = rng.exponential(scale=850.0)
        else:
            distance_to_paved_road_m[i] = rng.uniform(500.0, 3500.0)
    distance_to_paved_road_m = np.clip(distance_to_paved_road_m, 0.0, 4000.0).round(1)

    # Distance to local market (km)
    distance_to_local_market_km = np.clip(
        rng.gamma(shape=2.5, scale=1.2, size=n_samples),
        a_min=0.1,
        a_max=12.0
    ).round(2)

    # Distance to upazila center (km)
    distance_to_upazila_center_km = np.clip(
        distance_to_local_market_km + rng.gamma(shape=3.5, scale=2.0, size=n_samples),
        a_min=1.0,
        a_max=28.0
    ).round(2)

    # Distance to school and healthcare (km)
    distance_to_school_km = np.clip(
        rng.exponential(scale=1.4, size=n_samples),
        a_min=0.1,
        a_max=6.0
    ).round(2)

    distance_to_healthcare_km = np.clip(
        rng.exponential(scale=3.0, size=n_samples),
        a_min=0.2,
        a_max=16.0
    ).round(2)

    # Flood risk level & drainage
    flood_risk_probs = [0.28, 0.42, 0.22, 0.08]
    flood_risk_level = rng.choice(FLOOD_RISK_LEVELS, size=n_samples, p=flood_risk_probs)

    drainage_probs = [0.32, 0.48, 0.20]
    drainage_quality = rng.choice(DRAINAGE_QUALITIES, size=n_samples, p=drainage_probs)

    # Plot shape
    shape_probs = [0.62, 0.28, 0.10]
    plot_shape_category = rng.choice(PLOT_SHAPE_CATEGORIES, size=n_samples, p=shape_probs)

    # Land use category
    land_use_probs = [0.30, 0.40, 0.18, 0.07, 0.05]
    land_use_category = rng.choice(LAND_USE_CATEGORIES, size=n_samples, p=land_use_probs)

    # Binary amenities
    access_road_available = (road_access_type != "no_direct_road").astype(int)
    
    # Electricity availability increases closer to market and paved road
    prob_elec = np.clip(0.92 - (distance_to_paved_road_m / 6000.0), 0.35, 0.98)
    electricity_available = (rng.uniform(0, 1, size=n_samples) < prob_elec).astype(int)

    # Water access (irrigation pump / tube well / canal)
    prob_water = np.where(land_type == "agricultural_nal", 0.88, 0.72)
    water_access_available = (rng.uniform(0, 1, size=n_samples) < prob_water).astype(int)

    # Transaction period
    transaction_period = rng.choice(TRANSACTION_PERIODS, size=n_samples)

    # 3. Controlled Latent Valuation Multipliers
    # Land Type Multiplier
    land_type_mult = {
        "commercial_shop": 2.25,
        "homestead_viti": 1.52,
        "orchard_bagan": 1.15,
        "agricultural_nal": 1.00,
        "pond_doba": 0.76,
        "fallow_patit": 0.62,
    }
    lt_factor = np.array([land_type_mult[lt] for lt in land_type])

    # Road Access Multiplier
    road_access_mult = {
        "national_highway_frontage": 1.85,
        "paved_pucca_road": 1.38,
        "herringbone_brick_road": 1.12,
        "unpaved_katcha_road": 0.88,
        "footpath_trail": 0.70,
        "no_direct_road": 0.52,
    }
    ra_factor = np.array([road_access_mult[ra] for ra in road_access_type])

    # Road Width Effect (diminishing return above 20 ft)
    rw_factor = 1.0 + 0.018 * np.clip(road_width_ft, 0.0, 24.0)

    # Distance to paved road decay: exp(-dist / 1200)
    dist_paved_decay = np.exp(-distance_to_paved_road_m / 1200.0)
    dist_paved_factor = 0.65 + 0.35 * dist_paved_decay

    # Distance to market decay: exp(-dist / 6.0)
    dist_market_decay = np.exp(-distance_to_local_market_km / 6.0)
    dist_market_factor = 0.72 + 0.28 * dist_market_decay

    # Distance to upazila center decay: exp(-dist / 18.0)
    dist_upz_decay = np.exp(-distance_to_upazila_center_km / 18.0)
    dist_upz_factor = 0.82 + 0.18 * dist_upz_decay

    # Flood & Drainage penalty
    flood_mult = {
        "none": 1.06,
        "seasonal_shallow": 0.98,
        "moderate_regular": 0.80,
        "high_flash_flood": 0.56,
    }
    flood_factor = np.array([flood_mult[fr] for fr in flood_risk_level])

    drainage_mult = {
        "excellent_highland": 1.05,
        "moderate_sloped": 0.97,
        "poor_waterlogged": 0.74,
    }
    drainage_factor = np.array([drainage_mult[dq] for dq in drainage_quality])

    # Shape factor
    shape_mult = {
        "regular_rectangular": 1.04,
        "irregular_trapezoid": 0.96,
        "fragmented_narrow": 0.82,
    }
    shape_factor = np.array([shape_mult[sc] for sc in plot_shape_category])

    # Infrastructure amenities
    amenity_factor = 1.0 + 0.08 * electricity_available + 0.04 * water_access_available

    # Plot size economies of scale: larger rural parcels trade at slight discount per decimal
    scale_factor = (land_area_decimal / 10.0) ** (-0.075)

    # Time trend (approx 5% annual synthetic appreciation across 2023-2026)
    period_idx = np.array([TRANSACTION_PERIODS.index(p) for p in transaction_period])
    time_factor = 1.0 + (period_idx / len(TRANSACTION_PERIODS)) * 0.16

    # 4. Feature Interactions
    # Synergy 1: Commercial land facing highway or paved road gets extra commercial synergy
    commercial_road_synergy = np.where(
        (land_type == "commercial_shop") & np.isin(road_access_type, ["national_highway_frontage", "paved_pucca_road"]),
        1.25,
        1.0
    )

    # Penalty 2: High flood risk dampens road frontage advantage
    flood_road_dampener = np.where(
        (flood_risk_level == "high_flash_flood") & np.isin(road_access_type, ["national_highway_frontage", "paved_pucca_road"]),
        0.85,
        1.0
    )

    # 5. Composite Base Price Calculation
    latent_price_per_decimal = (
        base_location_prices *
        lt_factor *
        ra_factor *
        rw_factor *
        dist_paved_factor *
        dist_market_factor *
        dist_upz_factor *
        flood_factor *
        drainage_factor *
        shape_factor *
        amenity_factor *
        scale_factor *
        time_factor *
        commercial_road_synergy *
        flood_road_dampener
    )

    # 6. Controlled log-normal noise to simulate unobserved seller urgency, soil nuance, and negotiation
    noise = rng.normal(loc=0.0, scale=0.09, size=n_samples)
    final_price_per_decimal = latent_price_per_decimal * np.exp(noise)

    # Enforce realistic bounds & precision
    final_price_per_decimal = np.clip(final_price_per_decimal, 12000.0, 480000.0).round(2)

    # Unit consistency: Total price = price_per_decimal * area
    total_price_bdt = (final_price_per_decimal * land_area_decimal).round(2)

    # Assemble into DataFrame
    df = pd.DataFrame({
        "parcel_id": [f"syn_pcl_{i+1:06d}" for i in range(n_samples)],
        "district_id": districts,
        "upazila_id": upazilas,
        "mouza_id": mouzas,
        "land_area_decimal": land_area_decimal,
        "land_type": land_type,
        "road_access_type": road_access_type,
        "road_width_ft": road_width_ft,
        "distance_to_paved_road_m": distance_to_paved_road_m,
        "distance_to_local_market_km": distance_to_local_market_km,
        "distance_to_upazila_center_km": distance_to_upazila_center_km,
        "distance_to_school_km": distance_to_school_km,
        "distance_to_healthcare_km": distance_to_healthcare_km,
        "flood_risk_level": flood_risk_level,
        "drainage_quality": drainage_quality,
        "plot_shape_category": plot_shape_category,
        "land_use_category": land_use_category,
        "access_road_available": access_road_available,
        "electricity_available": electricity_available,
        "water_access_available": water_access_available,
        "transaction_period": transaction_period,
        "price_per_decimal_bdt": final_price_per_decimal,
        "total_price_bdt": total_price_bdt,
        "is_synthetic": True,
    })

    # Introduce realistic missing values on optional features (approx 2-3% missing)
    mask_healthcare = rng.uniform(0, 1, size=n_samples) < 0.025
    df.loc[mask_healthcare, "distance_to_healthcare_km"] = np.nan

    mask_school = rng.uniform(0, 1, size=n_samples) < 0.02
    df.loc[mask_school, "distance_to_school_km"] = np.nan

    return df

def save_synthetic_dataset(
    output_path: Optional[str] = None,
    n_samples: int = DEFAULT_SAMPLE_COUNT,
    random_seed: int = DEFAULT_RANDOM_SEED
) -> str:
    """Generates and saves the synthetic rural land dataset to disk."""
    if output_path is None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        target_path = DATASET_CSV_PATH
    else:
        target_path = output_path

    df = generate_synthetic_land_dataset(n_samples=n_samples, random_seed=random_seed)
    df.to_csv(target_path, index=False, encoding="utf-8")
    print(f"[OK] Generated {len(df)} synthetic records saved to: {target_path}")
    return str(target_path)

# Alias for external scripts & tests
generate_synthetic_dataset = generate_synthetic_land_dataset

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthetic Rural Land Price Dataset Generator")
    parser.add_argument("--samples", type=int, default=DEFAULT_SAMPLE_COUNT, help="Number of records to generate")
    parser.add_argument("--seed", type=int, default=DEFAULT_RANDOM_SEED, help="Random seed for reproducibility")
    parser.add_argument("--out", type=str, default=None, help="Output CSV path")
    args = parser.parse_args()

    save_synthetic_dataset(output_path=args.out, n_samples=args.samples, random_seed=args.seed)
