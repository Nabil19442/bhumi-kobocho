# Bhumi Kobocho (ভূমি কবচ) — Build Spec

## 0. One-line goal
Build a citizen-facing **demo** web app: "Plot Passport & Land Guardian". It organizes user-supplied land record data into one readable Plot Passport, flags rule-based inconsistencies, explains them in plain Bangla/English, checks file integrity via SHA-256 + QR, and shows a clearly labelled **simulated** alert when a demo record changes.

## 1. Hard constraints (never violate)
- DEMO ONLY. Use generated dummy names, deeds, khatian/dag numbers, and random dummy NID-like values. No real personal data.
- Every screen and report shows a visible banner: "DEMO DATA — not a legal verdict".
- No scraping, no calls to government sites, no security testing of live systems.
- Never claim legal ownership, court-case status, or fraud. Use only these status labels: **Matched / Mismatch / Needs review / Not checked**. No single "trust score" (if added later, label it "demo record-consistency indicator" and show its calculation).
- Principle: **Rules decide; AI explains.** The rule engine computes all flags. Any language model may only rephrase facts the rule engine returned, and must not add legal claims.
- No secrets in Git. Use env vars and a `.env.example`. Do not rewrite Git history or force-push.
- Don't rely on color alone (use icons + text). Mobile-first, keyboard-accessible, large readable text.

## 2. Stack
- Frontend: React (Vite) PWA, Bangla-first with English toggle (i18n JSON files).
- Backend: Python FastAPI.
- Data: local JSON dataset first (`/backend/data/`), SQLite/PostgreSQL optional later.
- OCR: Tesseract (`ben+eng`) with a manual-correction fallback. Show per-field confidence; low confidence → "Needs review".
- Hashing: SHA-256. QR: `qrcode` (Python) or `qrcode.react`.
- Optional explainer: LLM behind an interface `explain(flags) -> text`, with a deterministic template fallback so the demo works with no API key.
