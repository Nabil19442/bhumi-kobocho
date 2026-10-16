# Model Card: Bhumi Kobocho Rural Land Price Intelligence (Synthetic Benchmark Regressor)

## 1. Model Details
- **Developer**: Team ZENOX (Bhumi Kobocho Project)
- **Model Name**: `rural-land-price-histgradientboostingregressor-v1`
- **Model Architecture**: TransformedTargetRegressor (`np.log1p` / `np.expm1`) wrapping scikit-learn `HistGradientBoostingRegressor`
- **Feature Pipeline**: Scikit-Learn `ColumnTransformer` with `SimpleImputer(strategy='median')`, `StandardScaler`, and `OneHotEncoder(handle_unknown='ignore')`
- **Artifact Serializer**: `joblib`
- **Dataset Version**: `v1.0.0-synthetic-20k`
- **Training Timestamp**: October 2026

---

## 2. Intended Use
- **Primary Use**: Academic, demonstration, and hackathon algorithmic prototype testing for rural Bangladesh parcel pricing intelligence.
- **Goal**: Illustrate how multi-factor geospatial characteristics (road access, road width, distance to highway, distance to bazaar, flood vulnerability, drainage, electricity, and parcel size) non-linearly correlate with per-decimal valuation in rural contexts.
- **Target Audience**: Hackathon evaluators, land administration researchers, and system designers investigating automated valuation models (AVMs).

---

## 3. Out-of-Scope & Misuse
> [!CAUTION]
> **STRICT BAN ON FINANCIAL OR LEGAL RELIANCE**
> - **NOT A REAL MARKET APPRAISAL**: This model is trained 100% on synthetic data generated via parametric simulation. It **MUST NEVER** be used to appraise real land, approve mortgage loans, calculate government stamp duty or capital gains tax, settle inheritance disputes, or make land purchasing offers in Bangladesh.
> - **NO REAL-WORLD REGULATORY APPROVAL**: The model is not certified by the Directorate General of Land Records and Surveys (DGLRS) or the Bangladesh Ministry of Land.

---

## 4. Synthetic Data Provenance & Limitations
- **Simulation Mechanics**: 20,000 synthetic records were generated using a non-linear latent pricing model featuring geographic baseline tiers, exponential road-distance decays, road-width power curves, commercial-road interaction terms, flood risk penalties, and heteroskedastic log-normal noise.
- **Geographic Identifiers**: Synthetic district, upazila, and mouza identifiers (e.g., `dist-demo-01`, `upz-demo-01`, `mouza-demo-001`) are purely simulated test artifacts and do not correspond to any actual real estate transactions.
- **Limitations**:
  - The model does not observe political boundary changes, local dispute litigations, riverbank erosion dynamics, or informal local bargaining habits.
  - High model $R^2$ ($> 0.96$) on synthetic validation data measures convergence to the synthetic simulation generator, **NOT real-market prediction ability**.

---

## 5. Input Features & Preprocessing
The model takes 19 features:
- **Numerical Features (7)**: `land_area_decimal`, `road_width_ft`, `distance_to_paved_road_m`, `distance_to_local_market_km`, `distance_to_upazila_center_km`, `distance_to_school_km`, `distance_to_healthcare_km`.
- **Categorical Features (8)**: `district_id`, `upazila_id`, `mouza_id`, `land_type`, `road_access_type`, `flood_risk_level`, `drainage_quality`, `plot_shape_category`.
- **Binary Indicator Features (4)**: `access_road_available`, `electricity_available`, `water_access_available`, `land_use_category`.

Target: `price_per_decimal_bdt`. Total parcel price is deterministically computed via:
$$\text{predicted\_total\_price\_bdt} = \text{predicted\_price\_per\_decimal\_bdt} \times \text{land\_area\_decimal}$$

---

## 6. Training & Evaluation Methodology
- **Split Protocol**: 70% Training (14,000 samples), 15% Validation (3,000 samples), 15% Final Test (3,000 samples). Fixed random seed = `42`.
- **Model Selection**: Selected among four candidate models (`DummyRegressor`, `HistGradientBoostingRegressor`, `RandomForestRegressor`, `ExtraTreesRegressor`) using validation set MAE.
- **Spatial Evaluation**: Evaluated out-of-mouza generalization on 5 entirely held-out mouza clusters.
- **Calibration**: Empirical 80% error bounds are computed from validation set residual ratios ($10\text{th}$ to $90\text{th}$ percentile) rather than arbitrary $\pm \%$ assumptions.

---

## 7. Retraining Instructions
To deterministically regenerate data and retrain:
```bash
# 1. Regenerate synthetic dataset
.\backend\venv\Scripts\python -m backend.ml.data_generator

# 2. Train candidate models, evaluate, and save artifacts
.\backend\venv\Scripts\python -m backend.ml.train
```

---

## 8. Deployment & Safety Considerations
- Model weights (`best_land_price_model.joblib`) are local-only assets loaded into FastAPI memory.
- If artifacts are missing, endpoints return `503 Service Unavailable` with explanatory error messages; no hardcoded prices or random guesses are fabricated.
- All API and UI responses include explicit bilingual disclaimers in Bengali and English.
