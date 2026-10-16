import os
import json
import logging
import hashlib
from typing import Dict, Any, Optional, Tuple, List
import joblib
import pandas as pd

from .config import (
    BEST_MODEL_PATH,
    MODEL_METADATA_PATH,
    ALL_FEATURES,
    DISCLAIMER_BN,
    DISCLAIMER_EN,
    PROVENANCE_STATEMENT,
    SYNTHETIC_DISTRICTS,
    SYNTHETIC_UPAZILAS,
    SYNTHETIC_MOUZAS,
    LAND_TYPES,
    ROAD_ACCESS_TYPES,
    FLOOD_RISK_LEVELS,
    DRAINAGE_QUALITIES,
    PLOT_SHAPE_CATEGORIES,
    LAND_USE_CATEGORIES,
)
from .schemas import (
    LandPricePredictionRequest,
    LandPricePredictionResponse,
    PriceInterval,
    ModelInfoResponse,
    MetadataResponse,
)

logger = logging.getLogger("bhumi_ml.predict")

# Synonyms & alias normalization mappings
LAND_TYPE_SYNONYMS = {
    "agricultural": "agricultural_nal",
    "agricultural_nal": "agricultural_nal",
    "homestead": "homestead_viti",
    "homestead_viti": "homestead_viti",
    "roadside_commercial": "commercial_shop",
    "commercial": "commercial_shop",
    "commercial_shop": "commercial_shop",
    "low_lying": "agricultural_nal",
    "pond": "pond_doba",
    "pond_doba": "pond_doba",
    "pond_waterbody": "pond_doba",
    "orchard": "orchard_bagan",
    "orchard_bagan": "orchard_bagan",
    "fallow": "fallow_patit",
    "fallow_patit": "fallow_patit"
}

ROAD_ACCESS_SYNONYMS = {
    "paved_pucca": "paved_pucca_road",
    "paved_pucca_road": "paved_pucca_road",
    "semi_paved_hbb": "herringbone_brick_road",
    "herringbone_brick_road": "herringbone_brick_road",
    "earthen_kacha": "unpaved_katcha_road",
    "katcha": "unpaved_katcha_road",
    "unpaved_katcha_road": "unpaved_katcha_road",
    "footpath_trail": "footpath_trail",
    "foot_trail": "footpath_trail",
    "none": "no_direct_road",
    "no_direct_road": "no_direct_road",
    "national_highway_frontage": "national_highway_frontage",
    "highway": "national_highway_frontage"
}

FLOOD_SYNONYMS = {
    "none": "none",
    "low": "seasonal_shallow",
    "seasonal_shallow": "seasonal_shallow",
    "medium": "moderate_regular",
    "moderate_regular": "moderate_regular",
    "high": "high_flash_flood",
    "high_flash_flood": "high_flash_flood"
}

DRAINAGE_SYNONYMS = {
    "good": "excellent_highland",
    "excellent_highland": "excellent_highland",
    "moderate": "moderate_sloped",
    "moderate_sloped": "moderate_sloped",
    "poor": "poor_waterlogged",
    "poor_waterlogged": "poor_waterlogged",
    "waterlogged": "poor_waterlogged"
}

PLOT_SHAPE_SYNONYMS = {
    "regular": "regular_rectangular",
    "regular_rectangular": "regular_rectangular",
    "rectangular": "regular_rectangular",
    "irregular": "irregular_trapezoid",
    "irregular_trapezoid": "irregular_trapezoid",
    "narrow_strip": "fragmented_narrow",
    "fragmented_narrow": "fragmented_narrow"
}

# In-memory cache for the loaded pipeline and metadata
_CACHED_PIPELINE = None
_CACHED_METADATA: Optional[Dict[str, Any]] = None
_MODEL_LOAD_ATTEMPTED = False


class ModelNotAvailableError(Exception):
    """Raised when the trained ML model artifact cannot be found or loaded."""
    pass


def reset_model_cache() -> None:
    """Reset cached pipeline and metadata (useful for tests)."""
    global _CACHED_PIPELINE, _CACHED_METADATA, _MODEL_LOAD_ATTEMPTED
    _CACHED_PIPELINE = None
    _CACHED_METADATA = None
    _MODEL_LOAD_ATTEMPTED = False


def compute_file_sha256(filepath: str) -> str:
    """Compute SHA-256 digest of a file in streaming chunks."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def load_model_and_metadata(force_reload: bool = False) -> Tuple[Any, Dict[str, Any]]:
    global _CACHED_PIPELINE, _CACHED_METADATA, _MODEL_LOAD_ATTEMPTED
    
    if _CACHED_PIPELINE is not None and not force_reload:
        return _CACHED_PIPELINE, _CACHED_METADATA

    _MODEL_LOAD_ATTEMPTED = True

    if not os.path.exists(BEST_MODEL_PATH):
        logger.warning("ML model artifact not found at %s", BEST_MODEL_PATH)
        raise ModelNotAvailableError(
            f"The trained ML model artifact is not available. Please run the training pipeline first: "
            f"python -m backend.ml.train"
        )

    if not os.path.exists(MODEL_METADATA_PATH):
        logger.warning("ML metadata artifact not found at %s", MODEL_METADATA_PATH)
        raise ModelNotAvailableError("Model metadata artifact missing.")

    try:
        with open(MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    except Exception as e:
        logger.error("Failed to parse ML metadata JSON: %s", e)
        raise ModelNotAvailableError(f"Malformed model metadata file: {str(e)}")

    expected_sha256 = metadata.get("model_sha256")
    if not expected_sha256 or not isinstance(expected_sha256, str) or len(expected_sha256.strip()) != 64:
        logger.error("Model metadata missing valid 'model_sha256' digest.")
        raise ModelNotAvailableError("Model metadata is missing a valid 64-character SHA-256 digest.")

    expected_sha256 = expected_sha256.strip().lower()

    # Verify SHA-256 BEFORE deserialization
    try:
        actual_sha256 = compute_file_sha256(BEST_MODEL_PATH).lower()
    except Exception as e:
        logger.error("Failed to read model artifact for checksum verification: %s", e)
        raise ModelNotAvailableError(f"Cannot read model artifact: {str(e)}")

    if actual_sha256 != expected_sha256:
        logger.critical(
            "SECURITY ALERT: Model artifact integrity verification failed! "
            "Expected SHA-256: %s, Actual SHA-256: %s. Deserialization aborted.",
            expected_sha256,
            actual_sha256,
        )
        raise ModelNotAvailableError(
            f"Model artifact checksum mismatch: expected {expected_sha256[:12]}..., got {actual_sha256[:12]}..."
        )

    # Safe to deserialize verified artifact
    try:
        pipeline = joblib.load(BEST_MODEL_PATH)
        _CACHED_PIPELINE = pipeline
        _CACHED_METADATA = metadata
        logger.info(
            "Successfully verified (SHA-256: %s...) and loaded ML model '%s' (%s)",
            actual_sha256[:12],
            metadata.get("best_candidate"),
            metadata.get("dataset_version"),
        )
        return _CACHED_PIPELINE, _CACHED_METADATA
    except Exception as e:
        logger.error("Failed to deserialize verified ML artifact: %s", e)
        raise ModelNotAvailableError(f"Error loading ML model artifact: {str(e)}")


def get_model_info() -> ModelInfoResponse:
    _, metadata = load_model_and_metadata()
    data = metadata.copy()
    from .config import EVALUATION_REPORT_JSON_PATH
    if os.path.exists(EVALUATION_REPORT_JSON_PATH):
        try:
            with open(EVALUATION_REPORT_JSON_PATH, "r", encoding="utf-8") as f:
                report = json.load(f)
            data["candidate_comparisons"] = report.get("candidate_comparisons")
            data["subgroup_analysis"] = report.get("subgroup_analysis")
        except Exception as e:
            logger.warning("Could not read evaluation report JSON: %s", e)
    return ModelInfoResponse(**data)


def get_metadata() -> MetadataResponse:
    # Build allowable categories & bounds for UI and API discovery
    allowed_categories = {
        "land_type": LAND_TYPES,
        "road_access_type": ROAD_ACCESS_TYPES,
        "flood_risk_level": FLOOD_RISK_LEVELS,
        "drainage_quality": DRAINAGE_QUALITIES,
        "plot_shape_category": PLOT_SHAPE_CATEGORIES,
        "land_use_category": LAND_USE_CATEGORIES
    }

    feature_ranges = {
        "land_area_decimal": {"min": 0.1, "max": 250.0, "typical_min": 1.0, "typical_max": 50.0},
        "road_width_ft": {"min": 0.0, "max": 100.0, "typical_min": 6.0, "typical_max": 24.0},
        "distance_to_paved_road_m": {"min": 0.0, "max": 10000.0, "typical_min": 0.0, "typical_max": 1500.0},
        "distance_to_local_market_km": {"min": 0.0, "max": 30.0, "typical_min": 0.5, "typical_max": 5.0},
        "distance_to_upazila_center_km": {"min": 0.0, "max": 50.0, "typical_min": 2.0, "typical_max": 15.0},
        "distance_to_school_km": {"min": 0.0, "max": 20.0, "typical_min": 0.3, "typical_max": 3.0},
        "distance_to_healthcare_km": {"min": 0.0, "max": 30.0, "typical_min": 0.5, "typical_max": 8.0},
    }

    synthetic_locations = {
        "districts": SYNTHETIC_DISTRICTS,
        "upazilas": SYNTHETIC_UPAZILAS,
        "mouzas": SYNTHETIC_MOUZAS
    }

    return MetadataResponse(
        status="ok",
        synthetic_locations=synthetic_locations,
        allowed_categories=allowed_categories,
        feature_ranges=feature_ranges,
        provenance_statement=PROVENANCE_STATEMENT,
        disclaimer_bn=DISCLAIMER_BN,
        disclaimer_en=DISCLAIMER_EN
    )


def predict_land_price(request: LandPricePredictionRequest) -> LandPricePredictionResponse:
    pipeline, metadata = load_model_and_metadata()

    warnings: List[str] = []

    # Domain applicability checks
    if request.land_area_decimal > 100.0:
        warnings.append(
            f"Requested land area ({request.land_area_decimal} decimal) is in the upper 2% tail of rural parcels. Marginal pricing may exhibit higher variance."
        )
    if request.road_width_ft > 40.0:
        warnings.append(
            f"Road width ({request.road_width_ft} ft) exceeds typical rural access road dimensions."
        )
    if request.mouza_id not in SYNTHETIC_MOUZAS:
        warnings.append(
            f"Mouza ID '{request.mouza_id}' is outside the standard training mouza catalog. The pipeline will apply general regional encoding."
        )

    # Normalize categorical values with synonym tolerance
    land_type_mapped = LAND_TYPE_SYNONYMS.get(request.land_type, request.land_type)
    road_access_mapped = ROAD_ACCESS_SYNONYMS.get(request.road_access_type, request.road_access_type)
    flood_risk_mapped = FLOOD_SYNONYMS.get(request.flood_risk_level, request.flood_risk_level)
    drainage_mapped = DRAINAGE_SYNONYMS.get(request.drainage_quality, request.drainage_quality)
    shape_mapped = PLOT_SHAPE_SYNONYMS.get(request.plot_shape_category or "regular", request.plot_shape_category or "regular_rectangular")

    # Prepare DataFrame matching ALL_FEATURES order with int dtypes for binary flags
    data_dict = {
        "district_id": [request.district_id],
        "upazila_id": [request.upazila_id],
        "mouza_id": [request.mouza_id],
        "land_area_decimal": [float(request.land_area_decimal)],
        "land_type": [land_type_mapped],
        "road_access_type": [road_access_mapped],
        "road_width_ft": [float(request.road_width_ft)],
        "distance_to_paved_road_m": [float(request.distance_to_paved_road_m)],
        "distance_to_local_market_km": [float(request.distance_to_local_market_km)],
        "distance_to_upazila_center_km": [float(request.distance_to_upazila_center_km)],
        "distance_to_school_km": [float(request.distance_to_school_km) if request.distance_to_school_km is not None else 1.0],
        "distance_to_healthcare_km": [float(request.distance_to_healthcare_km) if request.distance_to_healthcare_km is not None else 2.5],
        "flood_risk_level": [flood_risk_mapped],
        "drainage_quality": [drainage_mapped],
        "plot_shape_category": [shape_mapped],
        "access_road_available": [1 if request.access_road_available else 0],
        "electricity_available": [1 if request.electricity_available else 0],
        "water_access_available": [1 if request.water_access_available else 0],
        "land_use_category": [request.land_use_category or "multi_crop"],
        "transaction_period": ["2026-Q1"]
    }

    df = pd.DataFrame(data_dict, columns=ALL_FEATURES)

    # Generate point prediction (Pipeline predicts price_per_decimal_bdt)
    raw_pred = pipeline.predict(df)
    pred_rate = max(100.0, float(raw_pred[0]))

    # Unit consistency equation:
    # predicted_total_price_bdt = predicted_price_per_decimal_bdt * land_area_decimal
    pred_rate_rounded = round(pred_rate, 2)
    pred_total_rounded = round(pred_rate * float(request.land_area_decimal), 2)

    # Uncertainty interval based on empirical validation residuals
    p80 = float(metadata.get("calibrated_residual_ratio_80pct", 0.1318))
    lower_rate = max(50.0, round(pred_rate * (1.0 - p80), 2))
    upper_rate = max(lower_rate, round(pred_rate * (1.0 + p80), 2))
    lower_total = round(lower_rate * float(request.land_area_decimal), 2)
    upper_total = round(upper_rate * float(request.land_area_decimal), 2)

    rate_interval = PriceInterval(
        lower=lower_rate,
        upper=upper_rate,
        confidence_level_pct=80,
        method="empirical_validation_residuals"
    )
    total_interval = PriceInterval(
        lower=lower_total,
        upper=upper_total,
        confidence_level_pct=80,
        method="empirical_validation_residuals"
    )

    return LandPricePredictionResponse(
        status="success",
        land_area_decimal=float(request.land_area_decimal),
        predicted_price_per_decimal_bdt=pred_rate_rounded,
        predicted_total_price_bdt=pred_total_rounded,
        unit_consistency_verified=True,
        price_per_decimal_interval=rate_interval,
        total_price_interval=total_interval,
        model_identifier=metadata.get("model_id", "rural-land-price-histgradientboostingregressor-v1"),
        dataset_version=metadata.get("dataset_version", "synthetic_rural_land_prices_20k_v1"),
        data_provenance=PROVENANCE_STATEMENT,
        warnings=warnings,
        disclaimer_bn=DISCLAIMER_BN,
        disclaimer_en=DISCLAIMER_EN
    )
