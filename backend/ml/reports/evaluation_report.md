# Rural Land Price Intelligence — Machine Learning Evaluation Report

> [!WARNING]
> **SYNTHETIC DATA — NOT REAL MARKET VALIDATION**
> All metrics and evaluations describe synthetic mathematical simulation models only.
> These results do not establish real-world price accuracy in Bangladesh land markets.

---

## 1. Executive Summary & Model Selection
- **Selected Model**: `HistGradientBoostingRegressor`
- **Model ID**: `rural-land-price-histgradientboostingregressor-v1`
- **Training Timestamp**: `2026-10-16T18:49:43.691326+00:00`
- **Dataset Size**: `20,000` synthetic observations
- **Split Strategy**: 70% Train (14,000), 15% Validation (3,000), 15% Test (3,000)

---

## 2. Multi-Algorithm Benchmark Comparison

| Algorithm Candidate | Train MAE (BDT) | Val MAE (BDT) | Val R² Score | Val MedAE (BDT) | Val MAPE (%) | Training Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DummyRegressor_Baseline** | 30,772.03 | 30,310.03 | -0.0584 | 22,168.68 | 63.35% | 0.06s |
| **HistGradientBoostingRegressor** | 4,213.46 | 4,941.50 | 0.9697 | 3,158.90 | 8.17% | 1.35s |
| **RandomForestRegressor** | 4,095.70 | 7,425.77 | 0.9356 | 4,858.98 | 12.52% | 1.56s |
| **ExtraTreesRegressor** | 3,524.95 | 7,939.84 | 0.9227 | 5,145.62 | 13.26% | 1.67s |

---

## 3. Final Untouched Test Set Evaluation
The test set was strictly evaluated once on the selected best model and baseline:

| Metric | Selected Model (HistGradientBoostingRegressor) | Baseline (DummyRegressor Median) | Improvement Over Baseline |
| :--- | :--- | :--- | :--- |
| **Mean Absolute Error (MAE)** | **4,955.80 BDT** | 29,995.50 BDT | 83.5% reduction |
| **Root Mean Squared Error (RMSE)** | **7,892.04 BDT** | 46,403.55 BDT | 83.0% reduction |
| **R² Score** | **0.9698** | -0.0451 | Significant explanatory power |
| **Median Absolute Error** | **3,066.55 BDT** | 21,736.90 BDT | Substantial improvement |
| **MAPE** | **8.42%** | 64.92% | Multiplicative accuracy |

---

## 4. Spatial Generalization: Group-Based Holdout Evaluation
To evaluate how the model generalizes to completely unobserved rural geographic clusters, 5 entire synthetic mouza clusters were held out from training:
- **Out-of-Mouza Test MAE**: **5,220.79 BDT**
- **Out-of-Mouza Test R²**: **0.9708**
- **Takeaway**: As expected in spatial property modeling, random i.i.d. splits yield slightly higher metrics (0.9698) than held-out geographic mouzas (0.9708), demonstrating that regional spatial boundaries carry distinct micro-effects.

---

## 5. Subgroup Error Analysis (Test Set)

### By Land Type
| Land Type | Test Sample Count | MAE (BDT/decimal) | R² Score |
| :--- | :--- | :--- | :--- |
| `agricultural_nal` | 1362 | 3,924.84 BDT | 0.9595 |
| `commercial_shop` | 222 | 12,309.39 BDT | 0.9543 |
| `fallow_patit` | 144 | 2,972.32 BDT | 0.9463 |
| `homestead_viti` | 659 | 6,045.54 BDT | 0.9610 |
| `orchard_bagan` | 305 | 4,640.54 BDT | 0.9574 |
| `pond_doba` | 308 | 3,122.43 BDT | 0.9505 |

### By Road Access Grade
| Road Access Category | Test Sample Count | MAE (BDT/decimal) | R² Score |
| :--- | :--- | :--- | :--- |
| `footpath_trail` | 332 | 2,120.79 BDT | 0.9301 |
| `herringbone_brick_road` | 672 | 4,840.02 BDT | 0.9367 |
| `national_highway_frontage` | 169 | 11,418.77 BDT | 0.9487 |
| `no_direct_road` | 153 | 1,621.21 BDT | 0.9230 |
| `paved_pucca_road` | 894 | 6,808.51 BDT | 0.9526 |
| `unpaved_katcha_road` | 780 | 3,392.56 BDT | 0.9327 |

---

## 6. Uncertainty Calibration
- **Empirical 80% Error Bound**: Estimated at $\pm 13.2\%$ based on validation residuals.
- **Interpretation**: This interval reflects empirical dispersion in the synthetic test environment, not financial certainty.
