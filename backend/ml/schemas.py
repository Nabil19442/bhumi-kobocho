from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


class LandPricePredictionRequest(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False, extra="forbid")

    land_area_decimal: float = Field(
        ...,
        gt=0.0,
        le=500.0,
        description="Land area in Bangladeshi decimals (shotok/shothok). Must be greater than 0.",
        examples=[10.5]
    )
    district_id: str = Field(
        ...,
        description="Synthetic District ID (e.g., dist-demo-01). Must not be represented as an actual administrative boundary.",
        examples=["dist-demo-01"]
    )
    upazila_id: str = Field(
        ...,
        description="Synthetic Upazila ID (e.g., upz-demo-01).",
        examples=["upz-demo-01"]
    )
    mouza_id: str = Field(
        ...,
        description="Synthetic Mouza ID (e.g., mouza-demo-001).",
        examples=["mouza-demo-001"]
    )
    land_type: str = Field(
        ...,
        description="Land classification: agricultural, homestead, roadside_commercial, low_lying, pond_waterbody.",
        examples=["homestead"]
    )
    road_access_type: str = Field(
        ...,
        description="Access surface: paved_pucca, semi_paved_hbb, earthen_kacha, foot_trail, none.",
        examples=["semi_paved_hbb"]
    )
    road_width_ft: float = Field(
        default=8.0,
        ge=0.0,
        le=120.0,
        description="Width of the access road in feet. Must be non-negative.",
        examples=[10.0]
    )
    distance_to_paved_road_m: float = Field(
        default=200.0,
        ge=0.0,
        le=50000.0,
        description="Distance to nearest paved/pucca road in meters. Must be non-negative.",
        examples=[150.0]
    )
    distance_to_local_market_km: float = Field(
        default=1.5,
        ge=0.0,
        le=100.0,
        description="Distance to closest village growth center / bazaar in kilometers. Must be non-negative.",
        examples=[1.2]
    )
    distance_to_upazila_center_km: float = Field(
        default=6.0,
        ge=0.0,
        le=150.0,
        description="Distance to Upazila administrative sadar in kilometers. Must be non-negative.",
        examples=[5.5]
    )
    distance_to_school_km: Optional[float] = Field(
        default=1.0,
        ge=0.0,
        le=50.0,
        description="Distance to primary/high school in kilometers."
    )
    distance_to_healthcare_km: Optional[float] = Field(
        default=2.5,
        ge=0.0,
        le=50.0,
        description="Distance to union health clinic or hospital in kilometers."
    )
    flood_risk_level: str = Field(
        default="low",
        description="Flood risk level: none, low, medium, high.",
        examples=["low"]
    )
    drainage_quality: str = Field(
        default="moderate",
        description="Drainage performance: good, moderate, poor, waterlogged.",
        examples=["moderate"]
    )
    plot_shape_category: Optional[str] = Field(
        default="regular",
        description="Shape category: regular, rectangular, irregular, narrow_strip."
    )
    access_road_available: Optional[bool] = Field(
        default=True,
        description="Whether parcel touches a public or private road."
    )
    electricity_available: Optional[bool] = Field(
        default=True,
        description="Rural electrification grid connectivity."
    )
    water_access_available: Optional[bool] = Field(
        default=True,
        description="Piped or deep tube-well water access."
    )
    land_use_category: Optional[str] = Field(
        default="crop_farming",
        description="Current land use: crop_farming, residential, mixed_use, commercial, aquaculture, fallow."
    )
    transaction_period: Optional[str] = Field(
        default=None,
        description="Optional transaction period identifier (e.g. 2026-Q1)."
    )


class PriceInterval(BaseModel):
    lower: float = Field(..., description="Lower bound of 80% empirical validation residual interval (BDT)")
    upper: float = Field(..., description="Upper bound of 80% empirical validation residual interval (BDT)")
    confidence_level_pct: int = Field(80, description="Nominal empirical coverage percentage on validation set")
    method: str = Field(
        "empirical_validation_residuals",
        description="Interval estimation method: 10th to 90th percentile of validation absolute residual ratio"
    )


class LandPricePredictionResponse(BaseModel):
    status: str = "success"
    land_area_decimal: float
    predicted_price_per_decimal_bdt: float
    predicted_total_price_bdt: float
    unit_consistency_verified: bool
    price_per_decimal_interval: Optional[PriceInterval] = None
    total_price_interval: Optional[PriceInterval] = None
    model_identifier: str
    dataset_version: str
    data_provenance: str
    warnings: List[str] = []
    disclaimer_bn: str
    disclaimer_en: str


class ModelMetrics(BaseModel):
    mae_bdt: float
    rmse_bdt: float
    r2_score: float
    median_absolute_error_bdt: float
    mape_percent: float
    sample_count: Optional[int] = None


class ModelInfoResponse(BaseModel):
    status: str = "available"
    model_id: str
    algorithm: str
    selected_at_utc: str
    dataset_version: str
    dataset_samples: int
    split_counts: Dict[str, int]
    target_column: str
    unit: str
    features: List[str]
    validation_metrics: ModelMetrics
    test_metrics: ModelMetrics
    baseline_test_metrics: Optional[ModelMetrics] = None
    spatial_group_holdout_metrics: Optional[ModelMetrics] = None
    calibrated_residual_ratio_80pct: Optional[float] = None
    candidate_comparisons: Optional[Dict[str, Any]] = None
    subgroup_analysis: Optional[Dict[str, Any]] = None
    disclaimer_bn: str
    disclaimer_en: str
    is_synthetic: bool = True


class MetadataResponse(BaseModel):
    status: str = "ok"
    synthetic_locations: Dict[str, Any]
    allowed_categories: Dict[str, List[str]]
    feature_ranges: Dict[str, Dict[str, float]]
    provenance_statement: str
    disclaimer_bn: str
    disclaimer_en: str
