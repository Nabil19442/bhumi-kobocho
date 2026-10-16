import math
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from backend.app.main import app, CompareRequest
from backend.ml.predict import (
    predict_land_price,
    load_model_and_metadata,
    ModelNotAvailableError,
)
from backend.ml.schemas import LandPricePredictionRequest

client = TestClient(app)

# ============================================================================
# ML PIPELINE EDGE CASES & STRICT VALIDATION
# ============================================================================

def test_ml_prediction_valid_payload():
    """Verify standard valid ML prediction produces compliant response."""
    payload = {
        "land_area_decimal": 12.5,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "road_width_ft": 10.0,
        "distance_to_paved_road_m": 120.0,
        "distance_to_local_market_km": 1.2,
        "distance_to_upazila_center_km": 5.0,
        "flood_risk_level": "low",
        "drainage_quality": "moderate",
        "access_road_available": True,
        "electricity_available": True,
        "water_access_available": True,
    }
    res = client.post("/api/land-price/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["unit_consistency_verified"] is True
    assert data["predicted_price_per_decimal_bdt"] > 0
    assert data["predicted_total_price_bdt"] > 0
    # Unit calculation consistency within rounding precision
    expected_total = data["predicted_price_per_decimal_bdt"] * 12.5
    assert abs(data["predicted_total_price_bdt"] - expected_total) < 0.1
    # Interval bounds check
    assert data["price_per_decimal_interval"]["lower"] <= data["price_per_decimal_interval"]["upper"]
    assert data["total_price_interval"]["lower"] <= data["total_price_interval"]["upper"]


def test_ml_prediction_rejects_nan():
    """Ensure NaN is strictly rejected by Pydantic with 422 Unprocessable Entity."""
    # 1. Pydantic direct schema rejection
    with pytest.raises(ValidationError):
        LandPricePredictionRequest(
            land_area_decimal=float("nan"),
            district_id="dist_north_rangpur",
            upazila_id="upz_pirgacha",
            mouza_id="mouza_chhatra_01",
            land_type="homestead_viti",
            road_access_type="paved_pucca_road",
        )

    # 2. HTTP wire raw payload rejection
    raw_payload = (
        '{"land_area_decimal": NaN, "district_id": "dist_north_rangpur", '
        '"upazila_id": "upz_pirgacha", "mouza_id": "mouza_chhatra_01", '
        '"land_type": "homestead_viti", "road_access_type": "paved_pucca_road"}'
    )
    res = client.post(
        "/api/land-price/predict",
        content=raw_payload,
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 422


def test_ml_prediction_rejects_infinity():
    """Ensure Infinity and -Infinity are strictly rejected with 422."""
    # 1. Pydantic direct schema rejection
    with pytest.raises(ValidationError):
        LandPricePredictionRequest(
            land_area_decimal=float("inf"),
            district_id="dist_north_rangpur",
            upazila_id="upz_pirgacha",
            mouza_id="mouza_chhatra_01",
            land_type="homestead_viti",
            road_access_type="paved_pucca_road",
        )

    # 2. HTTP wire raw payload rejection
    raw_payload_inf = (
        '{"land_area_decimal": Infinity, "district_id": "dist_north_rangpur", '
        '"upazila_id": "upz_pirgacha", "mouza_id": "mouza_chhatra_01", '
        '"land_type": "homestead_viti", "road_access_type": "paved_pucca_road"}'
    )
    res = client.post(
        "/api/land-price/predict",
        content=raw_payload_inf,
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 422


def test_ml_prediction_rejects_extra_fields():
    """Verify that unexpected extra payload fields are rejected with 422 (extra='forbid')."""
    payload = {
        "land_area_decimal": 10.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
        "unrecognized_malicious_key": "inject_payload_value",
    }
    res = client.post("/api/land-price/predict", json=payload)
    assert res.status_code == 422
    assert "extra" in str(res.json()).lower() or "forbidden" in str(res.json()).lower()


def test_ml_prediction_rejects_missing_required_fields():
    """Verify that missing required categorical or identifier fields produce 422."""
    payload_missing_mouza = {
        "land_area_decimal": 10.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        # mouza_id missing
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
    }
    res = client.post("/api/land-price/predict", json=payload_missing_mouza)
    assert res.status_code == 422


def test_ml_prediction_exceeds_max_area():
    """Verify that land_area_decimal exceeding 500.0 is rejected."""
    payload_oversized = {
        "land_area_decimal": 501.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "homestead_viti",
        "road_access_type": "paved_pucca_road",
    }
    res = client.post("/api/land-price/predict", json=payload_oversized)
    assert res.status_code == 422


# ============================================================================
# BACKEND API RELIABILITY & SECURITY
# ============================================================================

def test_compare_endpoint_rejects_nan_tolerance():
    """Verify that /api/compare rejects NaN in area_tolerance_decimal with 422."""
    raw_payload = (
        '{"reference_record_id": "rec-demo-001", "extracted_data": {'
        '"owner_name": "test"}, "area_tolerance_decimal": NaN}'
    )
    res = client.post(
        "/api/compare",
        content=raw_payload,
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 422


def test_scan_path_traversal_attempt_rejected():
    """Verify that path traversal in sample_id is rejected with 404 without leaking server paths."""
    res = client.post("/api/scan", data={"sample_id": "../../etc/passwd"})
    assert res.status_code == 404
    detail = res.json().get("detail", "")
    assert "c:" not in detail.lower()
    assert "windows" not in detail.lower()
    assert "users" not in detail.lower()


def test_graph_endpoint_unknown_record_404():
    """Verify that /api/records/graph with unknown record_id returns 404."""
    res = client.get("/api/records/graph?record_id=rec-unknown-999")
    assert res.status_code == 404
    assert "not found" in res.json().get("detail", "").lower()


def test_malformed_json_returns_422():
    """Verify that malformed JSON request to compare returns 422 rather than 500."""
    res = client.post(
        "/api/compare",
        content="{\"invalid_json: unclosed",
        headers={"Content-Type": "application/json"}
    )
    assert res.status_code == 422


# ============================================================================
# FRONTEND REQUEST SCHEMA COMPATIBILITY
# ============================================================================

def test_frontend_land_price_payload_compatibility():
    """
    Verify that the exact payload structure built by LandPricePage.jsx in the frontend
    is fully compatible with the backend schema and receives a successful 200 response.
    """
    frontend_payload = {
        "land_area_decimal": 10.0,
        "district_id": "dist_north_rangpur",
        "upazila_id": "upz_pirgacha",
        "mouza_id": "mouza_chhatra_01",
        "land_type": "agricultural_nal",
        "road_access_type": "paved_pucca_road",
        "road_width_ft": 12.0,
        "distance_to_paved_road_m": 100.0,
        "distance_to_local_market_km": 1.5,
        "distance_to_upazila_center_km": 6.0,
        "flood_risk_level": "low",
        "drainage_quality": "moderate",
        "access_road_available": True,
        "electricity_available": True,
        "water_access_available": True,
    }
    res = client.post("/api/land-price/predict", json=frontend_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "disclaimer_bn" in data
    assert "disclaimer_en" in data
    assert data["predicted_price_per_decimal_bdt"] > 0
    assert data["predicted_total_price_bdt"] > 0


def test_import_compatibility_both_as_app_and_backend():
    """
    Verify that the FastAPI application can be imported both as 'app.main'
    (as when working directory is backend/ on Render) and 'backend.app.main'
    (as when working directory is the repository root).
    """
    import importlib
    mod_as_backend = importlib.import_module("backend.app.main")
    assert hasattr(mod_as_backend, "app")
    mod_as_app = importlib.import_module("app.main")
    assert hasattr(mod_as_app, "app")
    assert mod_as_app.app is not None

