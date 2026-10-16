# Synthetic Data Provenance Report

## 1. Provenance Statement
All data records generated under `backend/data/synthetic_land_prices/` originate from an algorithmic, programmatic synthetic generator (`backend/ml/data_generator.py`).
- **Data Source**: Deterministic pseudo-random number generator (`numpy.random.RandomState(seed=42)`).
- **Real Market Data**: Exactly 0 real market transactions. No real personal records, NID numbers, deeds, or official sub-registry books were sampled, scraped, or accessed.
- **Geography**: District and mouza identifiers use synthetic tokens (`dist_north_rangpur`, `upz_pirgacha`, `mouza_chhatra_01`) created purely to reflect rural spatial clustering.

---

## 2. Latent Valuation Formula Architecture
The synthetic generator applies a multi-factor non-linear pricing mechanism:
1. **Base Geographic Anchor**: Derived from synthetic regional baseline ($\text{BDT } 38,000$ to $55,000$ per decimal) adjusted by intra-mouza spatial micro-modifiers.
2. **Land Type Multipliers**: Commercial land ($\times 2.25$), Homestead viti ($\times 1.52$), Orchard bagan ($\times 1.15$), Agricultural nal ($\times 1.00$), Pond ($\times 0.76$), Fallow ($\times 0.62$).
3. **Road Access & Width Factor**: National highway frontage ($\times 1.85$), LGED paved pucca road ($\times 1.38$), HBB brick ($\times 1.12$), unpaved katcha ($\times 0.88$), footpath ($\times 0.70$), landlocked ($\times 0.52$). Road width contributes non-linearly up to 24 ft.
4. **Spatial Distance Decays**: Exponential distance decays for distance to paved road ($\lambda=1200\text{m}$), market ($\lambda=6.0\text{km}$), and upazila center ($\lambda=18.0\text{km}$).
5. **Vulnerability Penalties**: High flash flood risk ($\times 0.56$), seasonal regular inundation ($\times 0.80$), poor waterlogged drainage ($\times 0.74$).
6. **Interaction Terms**:
   - Commercial land + highway/pucca road access receives an additional $+25\%$ commercial synergy boost.
   - Severe flood risk dampens highway/pucca frontage advantage by $-15\%$.
7. **Scale Economies**: Parcels scale with $(\text{Area} / 10.0)^{-0.075}$, reflecting standard rural parcel volume dynamics.
8. **Controlled Noise**: Multiplicative log-normal residual noise $\sim \exp(\mathcal{N}(0, 0.09^2))$ simulating micro-parcel soil and seller factors.

---

## 3. Deliberate Synthetic Edge Cases
The generator guarantees representation of critical rural land anomalies:
1. **Tiny Roadside Homestead**: Small parcel ($<4$ decimal) with high road access and commercial synergy.
2. **Deep Remote Agricultural Parcel**: Distance to road $>2,500\text{m}$, unpaved or footpath access, agricultural nal, low price per decimal.
3. **Waterlogged Depressed Land**: Poor drainage with yearly seasonal submersion.
4. **Flash-Flood Haor Lowland**: Severe flash flood zone with single-crop restriction.
5. **Large Agricultural Estate**: $>80$ decimal parcel exhibiting scale discounts.
6. **Missing Infrastructure Coordinates**: $\sim 2-3\%$ deliberate missing values in distance to healthcare and secondary school to test imputer robustness.

---

## 4. Regeneration Command
To deterministically reproduce this dataset:
```bash
.\backend\venv\Scripts\python -m backend.ml.data_generator --samples 20000 --seed 42
```
