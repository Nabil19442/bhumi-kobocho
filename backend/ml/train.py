import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from datetime import datetime, timezone

from sklearn.base import clone
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import TransformedTargetRegressor
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import (
    RandomForestRegressor,
    HistGradientBoostingRegressor,
    ExtraTreesRegressor,
)
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, median_absolute_error

from backend.ml.config import (
    DATASET_CSV_PATH,
    MODEL_PIPELINE_PATH,
    MODEL_METADATA_PATH,
    EVALUATION_REPORT_JSON_PATH,
    EVALUATION_REPORT_MD_PATH,
    ARTIFACTS_DIR,
    REPORTS_DIR,
    DEFAULT_RANDOM_SEED,
    TRAIN_SPLIT_RATIO,
    VAL_SPLIT_RATIO,
    TEST_SPLIT_RATIO,
    ALL_FEATURE_COLUMNS,
    TARGET_COLUMN,
    DISCLAIMER_EN,
    DISCLAIMER_BN,
)
from backend.ml.feature_engineering import build_feature_preprocessor, get_feature_column_order

def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes comprehensive regression evaluation metrics in BDT."""
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(root_mean_squared_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    med_ae = float(median_absolute_error(y_true, y_pred))
    mean_abs_pct_error = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100.0)

    return {
        "mae_bdt": round(mae, 2),
        "rmse_bdt": round(rmse, 2),
        "r2_score": round(r2, 4),
        "median_absolute_error_bdt": round(med_ae, 2),
        "mape_percent": round(mean_abs_pct_error, 2),
    }

def train_and_evaluate_all_models(
    csv_path: str = str(DATASET_CSV_PATH),
    random_seed: int = DEFAULT_RANDOM_SEED,
) -> Dict[str, Any]:
    """
    Trains multiple regression candidates on synthetic rural land prices,
    evaluates on train, validation, and untouched test splits,
    performs spatial group-based validation, selects best model, and persists artifacts.
    """
    print(f"[INFO] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    X = df[get_feature_column_order()].copy()
    y = df[TARGET_COLUMN].values.copy()

    # 1. Split Strategy: 70% Train, 15% Validation, 15% Test
    val_plus_test_ratio = VAL_SPLIT_RATIO + TEST_SPLIT_RATIO
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=val_plus_test_ratio, random_state=random_seed
    )

    test_relative_ratio = TEST_SPLIT_RATIO / val_plus_test_ratio
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=test_relative_ratio, random_state=random_seed
    )

    print(f"[INFO] Dataset Split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

    # 2. Define Model Candidates
    # Each uses log1p target transformation to enforce positive price guarantees
    preprocessor = build_feature_preprocessor()

    candidates = {
        "DummyRegressor_Baseline": TransformedTargetRegressor(
            regressor=DummyRegressor(strategy="median"),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
        "HistGradientBoostingRegressor": TransformedTargetRegressor(
            regressor=HistGradientBoostingRegressor(
                max_iter=160,
                max_depth=12,
                learning_rate=0.08,
                random_state=random_seed,
            ),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
        "RandomForestRegressor": TransformedTargetRegressor(
            regressor=RandomForestRegressor(
                n_estimators=100,
                max_depth=16,
                min_samples_split=4,
                random_state=random_seed,
                n_jobs=-1,
            ),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
        "ExtraTreesRegressor": TransformedTargetRegressor(
            regressor=ExtraTreesRegressor(
                n_estimators=100,
                max_depth=16,
                min_samples_split=4,
                random_state=random_seed,
                n_jobs=-1,
            ),
            func=np.log1p,
            inverse_func=np.expm1,
        ),
    }

    results = {}
    fitted_pipelines = {}

    for name, reg_model in candidates.items():
        print(f"[TRAINING] Training candidate model: {name} ...")
        t0 = time.time()
        
        # Build end-to-end pipeline with cloned regressor
        pipe = Pipeline([
            ("preprocessor", build_feature_preprocessor()),
            ("model", clone(reg_model)),
        ])

        # Fit strictly on train set
        pipe.fit(X_train, y_train)
        elapsed = time.time() - t0

        # Evaluate on Train and Validation (Test remains untouched for model selection)
        y_train_pred = pipe.predict(X_train)
        y_val_pred = pipe.predict(X_val)

        train_metrics = compute_regression_metrics(y_train, y_train_pred)
        val_metrics = compute_regression_metrics(y_val, y_val_pred)

        results[name] = {
            "training_time_seconds": round(elapsed, 2),
            "train_metrics": train_metrics,
            "validation_metrics": val_metrics,
        }
        fitted_pipelines[name] = pipe
        print(f"   -> Val MAE: {val_metrics['mae_bdt']} BDT | Val R2: {val_metrics['r2_score']} (took {elapsed:.1f}s)")

    # 3. Model Selection based strictly on Validation MAE
    # Filter out baseline, pick best candidate
    ml_candidates = [k for k in candidates.keys() if k != "DummyRegressor_Baseline"]
    best_candidate_name = min(ml_candidates, key=lambda k: results[k]["validation_metrics"]["mae_bdt"])
    best_pipeline = fitted_pipelines[best_candidate_name]

    print(f"\n[SELECTED] Best candidate selected based on Validation MAE: {best_candidate_name}")

    # 4. Final Evaluation on Untouched Test Set (Executed only for selected model and baseline)
    y_test_pred_best = best_pipeline.predict(X_test)
    test_metrics_best = compute_regression_metrics(y_test, y_test_pred_best)

    baseline_pipe = fitted_pipelines["DummyRegressor_Baseline"]
    y_test_pred_base = baseline_pipe.predict(X_test)
    test_metrics_base = compute_regression_metrics(y_test, y_test_pred_base)

    results[best_candidate_name]["test_metrics"] = test_metrics_best
    results["DummyRegressor_Baseline"]["test_metrics"] = test_metrics_base

    # Compute empirical residual intervals on Validation data for calibrated uncertainty estimation
    val_preds_best = best_pipeline.predict(X_val)
    abs_percentage_errors = np.abs(y_val - val_preds_best) / y_val
    p80_error_ratio = float(np.percentile(abs_percentage_errors, 80))

    # 5. Spatial Group-Based Evaluation (Hold-out entire synthetic mouza clusters)
    print("\n[INFO] Running Spatial Group-Based Evaluation (holding out 5 unobserved mouzas)...")
    held_out_mouzas = list(df["mouza_id"].unique())[:5]
    spatial_train_mask = ~df["mouza_id"].isin(held_out_mouzas)
    spatial_test_mask = df["mouza_id"].isin(held_out_mouzas)

    X_sp_train = df.loc[spatial_train_mask, get_feature_column_order()]
    y_sp_train = df.loc[spatial_train_mask, TARGET_COLUMN].values
    X_sp_test = df.loc[spatial_test_mask, get_feature_column_order()]
    y_sp_test = df.loc[spatial_test_mask, TARGET_COLUMN].values

    spatial_pipe = Pipeline([
        ("preprocessor", build_feature_preprocessor()),
        ("model", clone(candidates[best_candidate_name])),
    ])
    spatial_pipe.fit(X_sp_train, y_sp_train)
    y_sp_pred = spatial_pipe.predict(X_sp_test)
    spatial_metrics = compute_regression_metrics(y_sp_test, y_sp_pred)
    print(f"   -> Out-of-Mouza Spatial MAE: {spatial_metrics['mae_bdt']} BDT | R2: {spatial_metrics['r2_score']}")

    # 6. Detailed Subgroup Error Analysis on Test Set
    subgroup_analysis = {}
    test_df = X_test.copy()
    test_df["y_true"] = y_test
    test_df["y_pred"] = y_test_pred_best
    test_df["abs_err"] = np.abs(y_test - y_test_pred_best)

    # By Land Type
    subgroup_analysis["by_land_type"] = (
        test_df.groupby("land_type")
        .apply(lambda g: {
            "count": int(len(g)),
            "mae_bdt": round(float(mean_absolute_error(g["y_true"], g["y_pred"])), 2),
            "r2_score": round(float(r2_score(g["y_true"], g["y_pred"])), 4),
        })
        .to_dict()
    )

    # By Road Access Type
    subgroup_analysis["by_road_access"] = (
        test_df.groupby("road_access_type")
        .apply(lambda g: {
            "count": int(len(g)),
            "mae_bdt": round(float(mean_absolute_error(g["y_true"], g["y_pred"])), 2),
            "r2_score": round(float(r2_score(g["y_true"], g["y_pred"])), 4),
        })
        .to_dict()
    )

    # 7. Persist Artifacts
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Saving selected model pipeline to: {MODEL_PIPELINE_PATH}")
    joblib.dump(best_pipeline, MODEL_PIPELINE_PATH, compress=3)

    # Metadata
    metadata = {
        "model_id": f"rural-land-price-{best_candidate_name.lower()}-v1",
        "algorithm": best_candidate_name,
        "selected_at_utc": datetime.now(timezone.utc).isoformat(),
        "random_seed": random_seed,
        "dataset_version": "synthetic_rural_land_prices_20k_v1",
        "dataset_samples": len(df),
        "split_counts": {
            "train": len(X_train),
            "validation": len(X_val),
            "test": len(X_test),
        },
        "target_column": TARGET_COLUMN,
        "unit": "BDT per decimal (shotok)",
        "features": get_feature_column_order(),
        "validation_metrics": results[best_candidate_name]["validation_metrics"],
        "test_metrics": test_metrics_best,
        "baseline_test_metrics": test_metrics_base,
        "spatial_group_holdout_metrics": spatial_metrics,
        "calibrated_residual_ratio_80pct": round(p80_error_ratio, 4),
        "disclaimer_en": DISCLAIMER_EN,
        "disclaimer_bn": DISCLAIMER_BN,
        "is_synthetic": True,
    }

    with open(MODEL_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    # Save comprehensive evaluation report
    full_report = {
        "metadata": metadata,
        "candidate_comparisons": results,
        "subgroup_analysis": subgroup_analysis,
    }
    with open(EVALUATION_REPORT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2, ensure_ascii=False)

    # Generate Markdown Report
    generate_markdown_report(full_report, EVALUATION_REPORT_MD_PATH)

    print(f"[SUCCESS] Complete training pipeline finished successfully!")
    return full_report

def generate_markdown_report(report_data: Dict[str, Any], output_path: Any):
    """Generates human-readable Markdown evaluation summary."""
    meta = report_data["metadata"]
    candidates = report_data["candidate_comparisons"]
    subgroups = report_data["subgroup_analysis"]

    md = f"""# Rural Land Price Intelligence — Machine Learning Evaluation Report

> [!WARNING]
> **SYNTHETIC DATA — NOT REAL MARKET VALIDATION**
> All metrics and evaluations describe synthetic mathematical simulation models only.
> These results do not establish real-world price accuracy in Bangladesh land markets.

---

## 1. Executive Summary & Model Selection
- **Selected Model**: `{meta['algorithm']}`
- **Model ID**: `{meta['model_id']}`
- **Training Timestamp**: `{meta['selected_at_utc']}`
- **Dataset Size**: `{meta['dataset_samples']:,}` synthetic observations
- **Split Strategy**: 70% Train ({meta['split_counts']['train']:,}), 15% Validation ({meta['split_counts']['validation']:,}), 15% Test ({meta['split_counts']['test']:,})

---

## 2. Multi-Algorithm Benchmark Comparison

| Algorithm Candidate | Train MAE (BDT) | Val MAE (BDT) | Val R² Score | Val MedAE (BDT) | Val MAPE (%) | Training Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for name, data in candidates.items():
        tr = data["train_metrics"]
        val = data["validation_metrics"]
        md += f"| **{name}** | {tr['mae_bdt']:,.2f} | {val['mae_bdt']:,.2f} | {val['r2_score']:.4f} | {val['median_absolute_error_bdt']:,.2f} | {val['mape_percent']:.2f}% | {data['training_time_seconds']}s |\n"

    best_test = meta["test_metrics"]
    base_test = meta["baseline_test_metrics"]
    spatial = meta["spatial_group_holdout_metrics"]

    md += f"""
---

## 3. Final Untouched Test Set Evaluation
The test set was strictly evaluated once on the selected best model and baseline:

| Metric | Selected Model ({meta['algorithm']}) | Baseline (DummyRegressor Median) | Improvement Over Baseline |
| :--- | :--- | :--- | :--- |
| **Mean Absolute Error (MAE)** | **{best_test['mae_bdt']:,.2f} BDT** | {base_test['mae_bdt']:,.2f} BDT | {((base_test['mae_bdt'] - best_test['mae_bdt']) / base_test['mae_bdt'] * 100):.1f}% reduction |
| **Root Mean Squared Error (RMSE)** | **{best_test['rmse_bdt']:,.2f} BDT** | {base_test['rmse_bdt']:,.2f} BDT | {((base_test['rmse_bdt'] - best_test['rmse_bdt']) / base_test['rmse_bdt'] * 100):.1f}% reduction |
| **R² Score** | **{best_test['r2_score']:.4f}** | {base_test['r2_score']:.4f} | Significant explanatory power |
| **Median Absolute Error** | **{best_test['median_absolute_error_bdt']:,.2f} BDT** | {base_test['median_absolute_error_bdt']:,.2f} BDT | Substantial improvement |
| **MAPE** | **{best_test['mape_percent']:.2f}%** | {base_test['mape_percent']:.2f}% | Multiplicative accuracy |

---

## 4. Spatial Generalization: Group-Based Holdout Evaluation
To evaluate how the model generalizes to completely unobserved rural geographic clusters, 5 entire synthetic mouza clusters were held out from training:
- **Out-of-Mouza Test MAE**: **{spatial['mae_bdt']:,.2f} BDT**
- **Out-of-Mouza Test R²**: **{spatial['r2_score']:.4f}**
- **Takeaway**: As expected in spatial property modeling, random i.i.d. splits yield slightly higher metrics ({best_test['r2_score']:.4f}) than held-out geographic mouzas ({spatial['r2_score']:.4f}), demonstrating that regional spatial boundaries carry distinct micro-effects.

---

## 5. Subgroup Error Analysis (Test Set)

### By Land Type
| Land Type | Test Sample Count | MAE (BDT/decimal) | R² Score |
| :--- | :--- | :--- | :--- |
"""
    for lt, m in subgroups["by_land_type"].items():
        md += f"| `{lt}` | {m['count']} | {m['mae_bdt']:,.2f} BDT | {m['r2_score']:.4f} |\n"

    md += """
### By Road Access Grade
| Road Access Category | Test Sample Count | MAE (BDT/decimal) | R² Score |
| :--- | :--- | :--- | :--- |
"""
    for ra, m in subgroups["by_road_access"].items():
        md += f"| `{ra}` | {m['count']} | {m['mae_bdt']:,.2f} BDT | {m['r2_score']:.4f} |\n"

    md += f"""
---

## 6. Uncertainty Calibration
- **Empirical 80% Error Bound**: Estimated at $\\pm {meta['calibrated_residual_ratio_80pct']*100:.1f}\\%$ based on validation residuals.
- **Interpretation**: This interval reflects empirical dispersion in the synthetic test environment, not financial certainty.
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

if __name__ == "__main__":
    train_and_evaluate_all_models()
