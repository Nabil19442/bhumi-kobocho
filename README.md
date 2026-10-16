# Bhumi Kobocho (ভূমি কবচ) — Plot Passport & Citizen Land Guardian

> **⚠️ DEMO DATA — not a legal verdict or proof of authentic ownership**  
> **⚠️ ডেমো তথ্য — কোনো আইনি সিদ্ধান্ত বা স্বত্ব প্রমাণ নয়**

---

## 1. Project Overview & One-Line Goal
**Bhumi Kobocho (ভূমি কবচ)** is a citizen-facing demo web application designed to bridge the trust and literacy gap in land records. It organizes citizen-supplied land record data into one readable **Plot Passport**, flags rule-based inconsistencies with strict deterministic logic, explains findings in plain Bangla and English, verifies document bit-level integrity via **SHA-256 and QR codes**, and features a simulated **Land Guardian** feed that triggers real-time in-app alerts when records change.

### Core Principle
**"Rules decide; AI explains."**  
All validation flags, consistency calculations, and discrepancy detection are handled by deterministic Python rule engines. Language models or template explainers only rephrase the factual outputs of the rule engine and never introduce independent legal conclusions.

---

## 2. Hard Constraints & Ethical Safeguards
- **DEMO ONLY**: All names, khatians, dags, deed numbers, and NIDs are synthetic dummy data. No real personal or government data is stored or accessed.
- **Mandatory Visible Banner**: Every screen, report, and export features the sticky notice: `"DEMO DATA — not a legal verdict"`.
- **Allowed Status Labels Only**:
  - `Matched`
  - `Mismatch`
  - `Needs review`
  - `Not checked`
- **Integrity Labels**: SHA-256 checks only report `Unchanged` or `File content changed` (never "ownership proven" or "authentic").
- **Simulated Alerts**: Land Guardian events are explicitly stamped with a pulsing `SIMULATED` badge.
- **No Live Government Scraping**: Does not connect to or test live government portals.

---

## 3. Technology Stack & Open-Source Packages

### Backend (Python FastAPI)
- `fastapi` (v0.143+): High-performance asynchronous API framework
- `uvicorn` (v0.54+): ASGI server implementation
- `pydantic` (v2.14+): Data validation and typing schemas
- `qrcode` & `pillow` (PIL): Digital QR generation and sample specimen rendering
- `pytest` & `httpx`: Automated testing suite for deterministic rule validation

### Frontend (React + Vite)
- `React 19`: UI component architecture
- `Vite`: Ultra-fast frontend build tool
- `lucide-react`: Accessible, screen-reader friendly UI icons
- `Hind Siliguri` & `Inter`: High-legibility Google Fonts for Bangla and English

### AI & Explainer Tools
- **Deterministic Template Explainer (Default / Offline)**: 100% offline, zero-dependency plain-language translator that converts rule flags into natural Bangla and English.
- **Pluggable LLM Interface**: Ready for OpenAI / Gemini API keys via `.env` without violating rule-first constraints.

---

## 4. Repository Structure
```
BhumiKoboch/
├── BUILD_SPEC.md              # Project specifications & milestone constraints
├── .env.example               # Safe environment variable configuration template
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI API endpoints & routes
│   │   ├── ocr.py             # Field extraction & per-field confidence scoring
│   │   ├── rules.py           # Deterministic mismatch rules & consistency indicator
│   │   ├── names.py           # Bangla/English fuzzy name similarity & honorific normalization
│   │   ├── integrity.py       # SHA-256 cryptographic check & QR code generator
│   │   ├── guardian.py        # Simulated event hub, old vs new diff calculation
│   │   └── explain.py         # Deterministic template explainer
│   ├── data/
│   │   ├── records.json       # Synthetic reference land records
│   │   ├── events.json        # Synthetic mutation and survey change events
│   │   ├── samples/           # Generated specimen deed images
│   │   └── generate_samples.py
│   └── tests/
│       ├── test_rules.py      # Test cases 1 to 4
│       ├── test_integrity.py  # Test case 5 (SHA-256 modified vs unchanged)
│       ├── test_guardian.py   # Test case 6 (SIMULATED alert & diff)
│       └── test_api.py        # API endpoint tests
└── frontend/
    ├── src/
    │   ├── components/        # Header, Navigation, Banners
    │   ├── pages/             # Scanner, Compare, Passport, Integrity, Guardian
    │   ├── i18n/              # bn.json (Bangla-first), en.json (English)
    │   ├── api.js             # API client
    │   ├── App.jsx            # State management & routing
    │   └── index.css          # Design system & accessibility tokens
    └── package.json
```

---

## 5. How to Run Locally

### 1. Backend Setup
```bash
# In the project root:
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated test suite (all 11 tests must pass)
python -m pytest -v backend/tests

# Start the FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now live at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory:
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://127.0.0.1:5173/`.

---

## 6. Automated Test Suite (Pytest)
Run:
```bash
backend\venv\Scripts\python -m pytest -v backend/tests
```
### Verified Test Cases:
1. **Case 1: Fully matching record** → All fields evaluated as `Matched`, 0 mismatches.
2. **Case 2: Different land area** → Triggers `area_decimal` status as `Mismatch` with numerical delta.
3. **Case 3: Name spelling variant** → Phonetic / prefix variants (e.g. *Md.* vs *Mohammad*, *মোঃ* vs *মোহাম্মদ*) are evaluated as `Needs review` (never blindly Matched or marked false Mismatch).
4. **Case 4: Missing or low-confidence OCR field** → Automatically flagged as `Needs review` or `Not checked`.
5. **Case 5: File bit modification** → SHA-256 returns `Unchanged` on authentic file, and `File content changed` on byte tampering.
6. **Case 6: Simulated Land Guardian event** → Produces `SIMULATED` alert, computes old vs new value diff table, and supports review acknowledgment.

---

## 7. Interactive Demo Script & Walkthrough

1. **Deed Scanner**:
   - Open `http://127.0.0.1:5173/` (Bangla-first interface).
   - In the sample dropdown, select **নমুনা ০১: মোঃ রফিকুল ইসলাম**. Notice the confidence indicators (94% - 97%).
   - Select **কাস্টম ফাইল টেস্ট (Simulate OCR failure)** to observe how low-confidence extractions automatically flag fields as `Needs review`.
   - Click **রেফারেন্স রেকর্ডের সাথে তুলনা করুন (Compare Against Reference Record)**.

2. **Mismatch Detector**:
   - Inspect the audit table displaying: *Field, Extracted, Reference, Rule Status, Reason Code*.
   - View the transparent **Demo Record-Consistency Indicator** (shows exact formula: `(Matched*1.0 + Needs_review*0.5)/Total * 100`).
   - Read the deterministic **Plain-Language Explanation** in Bangla or toggle to English via the top bar.
   - Review the mandatory sections: *"What was NOT checked"* and *"Recommended Next Official Steps"*.
   - Click **সম্পূর্ণ প্লট পাসপোর্ট দেখুন (View Plot Passport)**.

3. **Plot Passport**:
   - Inspect the unified citizen passport card with dynamic QR code and recorded coordinates.
   - Trace the chronological **Record History Timeline** (Survey -> Saf-Kabala deed -> Mutation case).
   - Use the **প্রিন্ট / PDF** button to export the citizen sheet.

4. **QR & Hash Integrity**:
   - Switch to the **হ্যাশ ও কিউআর সত্যতা (QR & Integrity)** tab.
   - Click **টেস্ট ১: অবিকৃত ফাইল (Unchanged)** to verify matching SHA-256 bit fingerprint.
   - Click **টেস্ট ২: পরিবর্তিত ফাইল (Changed)** to verify instant detection of modified document bytes.

5. **Land Guardian (Simulated)**:
   - Switch to the **ল্যান্ড গার্ডিয়ান (Land Guardian)** tab.
   - Select event `evt-001` (Mutation application detected on Plot 1058) and click **সিমুলেশন শুরু করুন (Trigger Simulation)**.
   - View the pulsing `SIMULATED DEMO ALERT`, review the **Old vs Proposed New Value** diff table (15.5 dec -> 10.0 dec), and click **পর্যালোচিত হিসেবে চিহ্নিত করুন (Mark as Reviewed)**.

---

## 8. Data-Source Statement & Scope Limits
- **Data Source Statement**: All data, including person names, father names, plot/dag numbers, khatian numbers, and land values, are purely synthetic dummy data generated for technical demonstration purposes.
- **Scope Limits**:
  - Does NOT represent a court ruling, land title registration, or certified government record.
  - Does NOT check for pending civil suits, injunctions, vested property status, or bank mortgages.
  - Citizens must verify all official records at their respective Upazila Land Office (AC Land) and Sub-Registry Office.
