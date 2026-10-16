import os
import json
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.ml.config import (
    DATASET_CSV_PATH,
    MODEL_PIPELINE_PATH,
    MODEL_METADATA_PATH,
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    SECONDARY_TARGET_COLUMN,
    SYNTHETIC_REGIONS,
    DEFAULT_RANDOM_SEED,
)
from backend.ml.data_generator import generate_synthetic_dataset
from backend.ml.schemas import (
    LandPricePredictionRequest,
    LandPricePredictionResponse,
    ModelInfoResponse,
    MetadataResponse,
)
from backend.ml.predict import (
    predict_land_price,
    get_model_info,
    get_metadata,
    load_model_and_metadata,
    ModelNotAvailableError,
)

client = TestClient(app)


# ============================================================================
# 1. DATASET TESTS
# ============================================================================

def test_dataset_file_exists_and_reproducible():
    assert os.path.exists(DATASET_CSV_PATH), f"Dataset CSV missing at {DATASET_CSV_PATH}"
    df = pd.read_csv(DATASET_CSV_PATH)
    assert len(df) == 20000, f"Expected 20,000 samples, got {len(df)}"
    
    # Check deterministic reproducibility on mini-batch with fixed seed
    df1 = generate_synthetic_dataset(sample_count=50, random_seed=42)
    df2 = generate_synthetic_dataset(sample_count=50, random_seed=42)
    pd.testing.assert_frame_equal(df1, df2)


def test_dataset_feature_validity_and_schema():
    df = pd.read_csv(DATASET_CSV_PATH)
    for col in ALL_FEATURE_COLUMNS:
        assert col in df.columns, f"Required feature '{col}' missing from synthetic dataset"
    assert TARGET_COLUMN in df.columns
    assert SECONDARY_TARGET_COLUMN in df.columns

    # Non-negative numerical constraints
    assert (df["land_area_decimal"] > 0).all(), "Land area must be strictly positive"
    assert (df["road_width_ft"] >= 0).all(), "Road width must be non-negative"
    assert (df["distance_to_paved_road_m"] >= 0).all(), "Distance to paved road must be non-negative"
    assert (df["distance_to_local_market_km"] >= 0).all(), "Distance to market must be non-negative"
    assert (df["distance_to_upazila_center_km"] >= 0).all(), "Distance to upazila must be non-negative"
    assert (df["price_per_decimal_bdt"] > 0).all(), "Price per decimal must be strictly positive"
    assert (df["total_price_bdt"] > 0).all(), "Total price must be strictly positive"


def test_dataset_no_personal_information():
    df = pd.read_csv(DATASET_CSV_PATH)
    # Ensure no PII columns exist
    pii_keywords = ["name", "nid", "phone", "email", "address", "owner", "national_id"]
    for col in df.columns:
        assert col.lower() not in pii_keywords, f"PII keyword found in column name: {col}"
    # Verify synthetic flags
    assert (df["is_synthetic"] == True).all()


# ============================================================================
# 2. MODEL ARTIFACT & METADATA TESTS
# ============================================================================

def test_model_artifact_and_metadata_exist():
    assert os.path.exists(MODEL_PIPELINE_PATH), "Trained model pipeline .joblib file must exist"
    assert os.path.exists(MODEL_METADATA_PATH), "Model metadata .json file must exist"

    with open(MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["algorithm"] == "HistGradientBoostingRegressor"
    assert meta["dataset_samples"] == 20000
    assert "test_metrics" in meta
    assert meta["test_metrics"]["mae_bdt"] > 0
    assert meta["test_metrics"]["r2_score"] > 0.80
    assert "spatial_group_holdout_metrics" in meta
    assert meta["spatial_group_holdout_metrics"]["mae_bdt"] > 0


# ============================================================================
# 3. PREDICTION SERVICE & UNIT CONSISTENCY TESTS
# ============================================================================

def test_predict_valid_request():
    req = LandPricePredictionRequest(
        land_area_decimal=12.5,
        district_id="dist_north_rangpur",
        upazila_id="upz_pirgacha",
        mouza_id="mouza_chhatra_01",
        land_type="agricultural_nal",
        road_access_type="paved_pucca_road",
        road_width_ft=12.0,
        distance_to_paved_road_m=0.0,
        distance_to_local_market_km=1.2,
        distance_to_upazila_center_km=5.0,
        flood_risk_level="none",
        drainage_quality="excellent_highland",
        access_road_available=True,
        electricity_available=True,
        water_access_available=True
    )
    res = predict_land_price(req)
    assert res.status == "success"
    assert res.predicted_price_per_decimal_bdt > 0
    assert res.predicted_total_price_bdt > 0
    
    # Strict unit consistency check:
    # predicted_total_price_bdt = predicted_price_per_decimal_bdt * land_area_decimal
    expected_total = round(res.predicted_price_per_decimal_bdt * req.land_area_decimal, 2)
    assert abs(res.predicted_total_price_bdt - expected_total) <= 0.05
    assert res.unit_consistency_verified is True
    assert "synthetic" in res.disclaimer_bn.lower() or "synthetic" in res.disclaimer_en.lower()


def test_predict_synonym_tolerance_and_unknown_categories():
    # Test short forms and unknown categories
    req = LandPricePredictionRequest(
        land_area_decimal=8.0,
        district_id="dist_north_rangpur",
        upazila_id="upz_pirgacha",
        mouza_id="mouza_unknown_999",  # Unseen mouza
        land_type="homestead",          # Short form
        road_access_type="semi_paved_hbb", # Synonym
        road_width_ft=10.0,
        distance_to_paved_road_m=100.0,
        distance_to_local_market_km=2.0,
        distance_to_upazila_center_km=6.0,
        flood_risk_level="low",
        drainage_quality="moderate",
        access_road_available=True,
        electricity_available=True,
        water_access_available=False
    )
    res = predict_land_price(req)
    assert res.status == "success"
    assert res.predicted_price_per_decimal_bdt > 0
    # Must contain warning for unseen mouza
    assert any("mouza_unknown_999" in w for w in res.warnings)


def test_predict_validation_residual_interval():
    req = LandPricePredictionRequest(
        land_area_decimal=10.0,
        district_id="dist_west_rajshahi",
        upazila_id="upz_paba",
        mouza_id="mouza_damkur_08",
        land_type="agricultural_nal",
        road_access_type="unpaved_katcha_road",
        road_width_ft=8.0,
        distance_to_paved_road_m=400.0,
        distance_to_local_market_km=3.0,
        distance_to_upazila_center_km=8.0,
        flood_risk_level="seasonal_shallow",
        drainage_quality="moderate_sloped"
    )
    res = predict_land_price(req)
    assert res.price_per_decimal_interval is not None
    assert res.total_price_interval is not None
    assert res.price_per_decimal_interval.lower <= res.predicted_price_per_decimal_bdt
    assert res.price_per_decimal_interval.upper >= res.predicted_price_per_decimal_bdt
    assert res.total_price_interval.confidence_level_pct == 80
    assert res.total_price_interval.method == "empirical_validation_residuals"


# ============================================================================
# 4. FASTAPI ENDPOINT TESTS
# ============================================================================

def test_api_land_price_health():
    response = client.get("/api/land-price/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_status"] == "loaded"
    assert "synthetic" in data["disclaimer"].lower()


def test_api_land_price_metadata():
    response = client.get("/api/land-price/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "synthetic_locations" in data
    assert len(data["synthetic_locations"]["districts"]) >= 5
    assert "allowed_categories" in data
    assert "land_type" in data["allowed_categories"]
    assert "feature_ranges" in data


def test_api_land_price_model_info():
    response = client.get("/api/land-price/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "HistGradientBoostingRegressor"
    assert data["test_metrics"]["mae_bdt"] > 0
    assert "spatial_group_holdout_metrics" in data
    assert data["spatial_group_holdout_metrics"]["mae_bdt"] > 0


def test_api_land_price_predict_endpoint_success():
    payload = {
        "land_area_decimal": 15.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "road_width_ft": 14.0,
        "distance_to_paved_road_m": 0.0,
        "distance_to_local_market_km": 0.8,
        "distance_to_upazila_center_km": 4.5,
        "flood_risk_level": "none",
        "drainage_quality": "excellent_highland",
        "access_road_available": True,
        "electricity_available": True,
        "water_access_available": True
    }
    response = client.post("/api/land-price/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["predicted_price_per_decimal_bdt"] > 0
    assert data["predicted_total_price_bdt"] > 0
    assert data["unit_consistency_verified"] is True
    assert data["land_area_decimal"] == 15.0


def test_api_land_price_predict_validation_errors():
    # 1. Negative area (must fail with 422)
    payload_bad_area = {
        "land_area_decimal": -5.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
    }
    res = client.post("/api/land-price/predict", json=payload_bad_area)
    assert res.status_code == 422

    # 2. Zero area (must fail with 422)
    payload_zero_area = payload_bad_area.copy()
    payload_zero_area["land_area_decimal"] = 0.0
    res = client.post("/api/land-price/predict", json=payload_zero_area)
    assert res.status_code == 422

    # 3. Negative distance (must fail with 422)
    payload_neg_dist = {
        "land_area_decimal": 10.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "distance_to_paved_road_m": -50.0
    }
    res = client.post("/api/land-price/predict", json=payload_neg_dist)
    assert res.status_code == 422

    # 4. Negative road width (must fail with 422)
    payload_neg_road = {
        "land_area_decimal": 10.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "road_width_ft": -10.0
    }
    res = client.post("/api/land-price/predict", json=payload_neg_road)
    assert res.status_code == 422


def test_no_arbitrary_public_training_endpoint():
    # Verify that no public arbitrary model training endpoint exists
    res = client.post("/api/land-price/train")
    assert res.status_code in [404, 405]
