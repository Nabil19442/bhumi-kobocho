# Bhumi Kobocho (ভূমি কবচ) — Final Hackathon Phase Implementation Report

**Project**: Bhumi Kobocho (ভূমি কবচ) — Citizen Land Record Intelligence & Cadastral Verification  
**Evaluation Phase**: Final Phase, LandTech Innovation Hackathon 2026  
**Engineering Team**: ZENOX  
**Date**: November 2026  
**Repository Branch**: `main`  

---

## 1. Executive Summary

During the final phase of the LandTech Innovation Hackathon, the Bhumi Kobocho engineering team executed a comprehensive overhaul spanning four structured phases:
1. **Phase 1: Bug Fixes & Reliability** — Fixed critical import errors, hardened rate limiting against proxy header spoofing, scoped Guardian alerts per client session, pinned dependencies for reproducible ML inference, and migrated 20,000 synthetic transactions from an in-memory 25 MB JSON file to an indexed SQLite database.
2. **Phase 2: Credibility for Judges** — Replaced circular OCR testing with an empirical 9-filter degradation benchmark, demoted experimental hedonic land-price ML to "More / Experimental" with explicit synthetic-fit disclosures ($R^2 \approx 0.97$), and introduced an abstract `LandRecordSource` data-adapter layer paired with a lawful government integration roadmap.
3. **Phase 3: Product Polish for the Demo** — Implemented client-side routing via `react-router-dom` with deep-linking (`/check`, `/passport/:id`, `/guardian`, `/verify/:id`), added an interactive 3-step evaluator Demo Walkthrough, added offline PWA caching with persistent offline disclaimers, simulated SMS/Push notification previews with polling and `prefers-reduced-motion` animations, and slashed the `IntegrityPage` JavaScript bundle by 95% (from 400 kB to 21 kB).
4. **Phase 4: Quality Gates** — Eliminated oxlint warnings, built a Vitest unit test suite (14 passing tests), authored Playwright end-to-end smoke tests for Desktop and 360px Mobile viewports (4 passing tests), added automated forbidden claim scanning, and established continuous integration via `.github/workflows/ci.yml`.

All implementations strictly abide by the project's **HARD RULES**:
- **DEMO ONLY**: Synthetic data only; zero live government calls or web scraping.
- **MANDATORY BANNER**: The warning banner *"DEMO DATA — not a legal verdict"* is persistently visible on every screen, export, route, and offline mode.
- **RESTRICTED STATUS LABELS**: Every field comparison adheres exclusively to `Matched`, `Mismatch`, `Needs review`, and `Not checked`. No single "trust score" or fraudulent legal verdicts are produced.
- **RULES DECIDE; AI EXPLAINS**: All verifications are executed via deterministic rule engines.

---

## 2. Before vs. After Quantitative Metrics

| Metric | Before Final Phase | After Final Phase | Improvement / Impact |
| :--- | :--- | :--- | :--- |
| **Backend Startup (Cold Start)** | 0.7772 s | **0.0717 s** | **11x faster** startup |
| **Data Memory Footprint (Peak)** | 108.75 MB | **2.07 MB** | **98% RAM reduction** via indexed SQLite |
| **Process Resident Set Size (RSS)** | 77.19 MB | **21.53 MB** | **72% process footprint reduction** |
| **Backend Test Suite (Pytest)** | 191 tests | **209 tests** | **+18 automated tests** passing in ~9.0s |
| **Frontend Unit Tests (Vitest)** | 0 tests | **14 tests** | 100% key parity, route banners & status gates |
| **E2E Smoke Tests (Playwright)** | 0 tests | **4 tests** | Desktop & Mobile (360px) primary flow verified |
| **IntegrityPage Chunk Size** | 399.86 kB (116 kB gzip) | **21.03 kB (6.0 kB gzip)** | **95% bundle size reduction** |
| **VerificationPage Chunk Size** | 49.59 kB (15.2 kB gzip) | **26.46 kB (6.6 kB gzip)** | **47% bundle size reduction** |
| **Total Production JS (Uncompressed)**| ~1.15 MB | **864 kB** | Modularized lazy loading across all tabs |
| **Routing Architecture** | Manual tab state | **React Router SPA** | Back/Forward history, deep links, SPA fallback |
| **oxlint Warnings on Target Files** | 9 warnings | **0 warnings** | Clean lint quality gate |

---

## 3. Phase-by-Phase Technical Details

### Phase 1: Bug Fixes & Reliability
1. **Import Error Resolution (`backend/app/check_land.py`)**: Added missing `Tuple` to `from typing import ...` import. Resolved `NameError` on backend startup.
2. **Reverse Proxy-Aware Rate Limiter (`backend/app/limiter.py`)**:
   - Configured Uvicorn to run with `--proxy-headers` and configurable `FORWARDED_ALLOW_IPS`.
   - Implemented CIDR and IP-matching proxy verification. Requests from untrusted peers ignore spoofed `X-Forwarded-For` headers and use `client.host`.
   - Verified with unit tests (`backend/tests/test_limiter_proxy.py`) proving bucket isolation across legitimate forwarded IPs and rejection of spoofed headers.
3. **Session-Scoped Guardian Alerts (`backend/app/guardian.py`)**:
   - Replaced global `_ACTIVE_ALERTS` with an in-memory LRU session store (`X-Session-ID` header validated against `^[a-zA-Z0-9_\-]{8,64}$`).
   - Enforced hard limits: maximum 500 active sessions and 50 alerts per session with TTL eviction.
   - Added unit tests (`backend/tests/test_guardian_session.py`) verifying cross-session data isolation.
4. **Hardened Dependency Management & Non-Root Docker**:
   - Pinned exact versions in `backend/requirements.txt` (`scikit-learn==1.9.1`, `numpy==2.4.4`, `pandas==3.0.1`, `joblib==1.5.3`).
   - Separated development dependencies into `backend/requirements-dev.txt`.
   - Configured Dockerfile to run as unprivileged `appuser:appgroup` (UID/GID 1001).
   - Added `check_sklearn_version_alignment()` during FastAPI lifespan startup to log warnings on serialized model version mismatch.
5. **High-Performance SQLite Migration (`backend/app/transaction_registry.py`)**:
   - Migrated 20,000 synthetic transaction records from `land_transactions.json` into `land_transactions.db`.
   - Created B-tree indexes on `parcel_id`, `norm_dag_no`, `norm_deed_no`, `norm_khatian_no`, `mouza`, and `conflict_scenario`.
   - Retained public function interfaces (`find_history_for_deed`, `find_history_for_parcel`, `search_transactions_registry`), keeping API responses identical.

---

### Phase 2: Credibility for Judges
1. **Empirical OCR Degradation Benchmark (`docs/ocr_benchmark.md`)**:
   - Extended `backend/data/generate_samples.py` with 9 realistic physical degradation filters:
     1. Baseline Clean Specimen (0% degradation)
     2. Gaussian Noise ($\sigma = 18$)
     3. Rotation (+3° clockwise)
     4. Rotation (-3° counter-clockwise)
     5. Perspective Skew (1.5° trapezoidal tilt)
     6. Gaussian Blur (radius = 1.1)
     7. Low Contrast & Faded Ink (contrast factor = 0.55)
     8. JPEG Artifacts (quality = 28)
     9. Phone Body Shadow (non-uniform gradient across bottom-right)
     10. Composite Real-World Degradation (noise + shadow + rotation)
   - Created `backend/ocr_benchmark.py` and generated complete per-field accuracy analysis:
     - Baseline Clean: **100% extraction accuracy** across all 8 fields.
     - Gaussian Noise / JPEG Artifacts: **100% accuracy** (Tesseract thresholding recovers high-contrast Bengali text).
     - Slight Rotation (±3°): **87.5% - 100% accuracy** (minor degradation in Bangla date formatting).
     - Phone Shadow: **87.5% accuracy** (lower dag numbers shaded in gradient require manual review).
     - Perspective Skew & Low Contrast: **50.0% - 62.5% accuracy** (correctly flags low-confidence fields as `"Needs review"` rather than fabricating values).
2. **Land Price ML Demotion & Academic Disclosures**:
   - Demoted the ML valuation feature from the primary navigation and landing hero to the "More / Experimental" menu with an explicit `Synthetic • Experimental` badge.
   - Updated the model card and documentation to state clearly that $R^2 \approx 0.97$ measures fit to our own synthetic generator formula, **not real-market prediction ability**.
   - Fixed README documentation to correctly cite `HistGradientBoostingRegressor` (wrapped in `TransformedTargetRegressor` with `np.log1p`).
3. **Decoupled Data-Adapter Layer & Production Roadmap (`backend/app/adapters/`)**:
   - Created abstract interface `LandRecordSource` defining `get_parcel()`, `search()`, `get_history()`, and `get_cases()`.
   - Created `SyntheticSource` wrapping existing demo datasets and routed `/api/check-land` and `/api/records` through it.
   - Authored [`docs/production_roadmap.md`](docs/production_roadmap.md) outlining how a lawful integration with official systems (e-Khatian, e-Mutation, Land Tax Management System) would plug in with citizen OTP consent, mTLS, and immutable audit logging.
4. **README Factual Corrections**:
   - Corrected QR code license from "BSD-6-Clause" to standard "BSD".
   - Updated test counts to reflect the full passing suite.
   - Added comprehensive "Changes After Preliminary Round" section.

---

### Phase 3: Product Polish for the Demo
1. **React Router SPA Architecture**:
   - Replaced state-based tab switching with `react-router-dom` in `frontend/src/App.jsx`.
   - Enabled real deep links: `/check`, `/passport/:id`, `/guardian`, `/verify/:id`, `/compare`, `/history`, `/integrity`, `/landprice`, `/graph`, `/overview`, `/reports`.
   - Browser Back and Forward buttons navigate seamlessly through session history.
   - Configured Render / Netlify SPA fallback via `frontend/public/_redirects` (`/* /index.html 200`).
2. **Tightened Core Citizen Story & Guided Demo Walkthrough**:
   - Focused top navigation and landing page CTAs on the 3 primary pillars:
     1. **Check Before You Buy (দলিল ও জমি যাচাই)** → `/check`
     2. **Plot Passport (প্লট পাসপোর্ট)** → `/passport/:id`
     3. **Land Guardian (ল্যান্ড গার্ডিয়ান)** → `/guardian`
   - Secondary tools (Compare, History, QR & Hash, Deed Scanner, Reports, Graph, Overview, Land Price) are consolidated under the "More / আরও" accessible dropdown.
   - Added an interactive **Guided Demo Walkthrough** button (`#demo-walkthrough-btn`) that launches a top floating stepper with 1-click step-by-step navigation across the 3 primary flow pages.
3. **PWA Offline Support**:
   - Added `frontend/public/manifest.webmanifest` and linked `/favicon.svg`.
   - Registered custom service worker `frontend/public/sw.js` for caching the app shell and passport API responses.
   - Implemented `localStorage` fallback in `PassportPage.jsx` ensuring that the last-viewed passport can be read offline without an active network.
   - Added a visible top offline indicator (`isOffline` state) warning the user that cached data is shown while strictly preserving the mandatory banner: *"DEMO DATA — not a legal verdict"*.
4. **Simulated Notification Preview in Land Guardian**:
   - Added a mobile SMS/Push notification simulation preview card in `GuardianPage.jsx` showing the exact bilingual alert message a citizen would receive upon unauthorized mutation or conveyance.
   - Added 10-second polling for active alerts with a pulsing `SIMULATED` badge.
   - Integrated `prefers-reduced-motion: reduce` in CSS to disable pulse animations for users sensitive to motion.
   - Added `aria-live="polite"` on alerts to announce changes to assistive screen readers.
5. **Frontend Bundle Chunk Optimization**:
   - Lazy-loaded `html5-qrcode` inside `QrScannerModal.jsx` and `qrcode` inside `VerificationPage.jsx`.
   - Lazy-loaded `QrScannerModal` inside `IntegrityPage.jsx` with `<Suspense fallback={null}>`.
   - **Result**: `IntegrityPage` chunk dropped from **399.86 kB down to 21.03 kB (95% reduction)**, far below the required 150 kB threshold.
6. **Accessibility Hardening**:
   - Audited color contrast ($\ge 4.5:1$) across all status pills and buttons.
   - Ensured all touch targets are $\ge 44 \times 44\text{ px}$.
   - Added small-screen responsive rules optimized for 360px viewport width.

---

### Phase 4: Quality Gates
1. **oxlint Cleanup**:
   - Removed unused lucide icon imports in `PassportPreviewSection.jsx` (`MapPin`, `User`, `Layers`, `HelpCircle`, `ArrowRight`, `ExternalLink`, `ShieldCheck`, `Hash`).
   - Cleaned unused props in `LandingPage.jsx`.
   - Eliminated `set-state-in-effect` warning in `App.jsx` by delegating URL state to React Router.
   - Verified with `npx oxlint` reporting **0 warnings and 0 errors** on target files.
2. **Frontend Vitest Unit Tests (`npm test`)**:
   - `src/test/i18n.test.js`: Verified exact 100% key parity between `bn.json` and `en.json` (197 keys), non-empty values, and zero forbidden claims.
   - `src/test/routes_banner.test.jsx`: Verified that every single application route (`/`, `/check`, `/passport/:id`, `/guardian`, `/compare`, `/history`, `/integrity`, `/landprice`, `/overview`) renders the visible demo disclaimer.
   - `src/test/status_restrictions.test.jsx`: Verified status labels conform strictly to the 4 permitted values (`Matched`, `Mismatch`, `Needs review`, `Not checked`) and no forbidden terms ("trust score", "fraud verdict", "authentic title") appear.
   - **Result: 14 passing tests**.
3. **Playwright E2E Smoke Tests (`npm run test:e2e`)**:
   - `frontend/e2e/smoke.spec.js`: Automated full end-to-end traversal of the primary flow (Landing → Check Land → Plot Passport → Land Guardian) and Demo Walkthrough.
   - Tested across two viewport configurations:
     - **Desktop Chrome** ($1280 \times 800$)
     - **Mobile Viewport** ($360 \times 740$, testing 360px accessibility)
   - **Result: 4 passing tests**.
4. **Automated Forbidden Claims Scanner (`backend/tests/test_forbidden_claims.py`)**:
   - Automated pytest scanning all i18n dictionaries and backend rule/check-land API response models to reject illegal claims ("trust score", "fraud verdict", "court title").
5. **Continuous Integration Workflow (`.github/workflows/ci.yml`)**:
   - Created GitHub Actions pipeline running Python 3.12 backend pytest suite, Node.js 20 frontend linting, Vitest unit tests, Vite asset build, and Playwright Chromium smoke tests on push/PR.

---

## 4. Known Remaining Limitations (Stated Honestly)

In compliance with our commitment to transparency and truth in engineering:
1. **Synthetic Data Boundary**: All land transactions, deeds, khatians, and guardian alerts operate exclusively on synthetic datasets generated for demo purposes. No live connection to Bangladesh government servers (e.g. `land.gov.bd`, `minland.gov.bd`) is established or simulated in real time.
2. **Optical Character Recognition Bounds**: In degraded physical deed conditions with heavy perspective tilt ($> 3^\circ$) or deep corner shadows, Tesseract OCR character accuracy drops to 50–62%. The system does not guess missing data, correctly designating degraded fields as `"Needs review"`.
3. **Hedonic Valuation Model**: The land price prediction regression model ($R^2 \approx 0.97$) captures relationships embedded in the synthetic data generator. It serves as an academic algorithmic demonstration and cannot be used for commercial land appraisal or tax assessments.
4. **Mobile Browser Camera Permissions**: Live camera QR scanning requires browser HTTPS/localhost permissions. When camera access is withheld, the user is provided with a direct file upload alternative.
