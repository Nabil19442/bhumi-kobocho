"""
Test Forbidden Claims and Status Label Constraints (Quality Gate)

HARD RULES (from BUILD_SPEC.md):
- DEMO DATA banner must be respected.
- Only allowed status labels: Matched / Mismatch / Needs review / Not checked.
- No ownership, fraud, court-status, or single 'trust score' claims.
- i18n keys must stay in exact parity.
"""

import json
import re
from pathlib import Path
import pytest


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = REPO_ROOT / "frontend"
I18N_BN = FRONTEND_DIR / "src" / "i18n" / "bn.json"
I18N_EN = FRONTEND_DIR / "src" / "i18n" / "en.json"

ALLOWED_STATUS_LABELS = {
    "Matched",
    "Mismatch",
    "Needs review",
    "Not checked"
}

FORBIDDEN_PHRASES = [
    r"\btrust score\b",
    r"\bfraud score\b",
    r"\bauthentic title\b",
    r"\bguaranteed owner\b",
    r"\bcourt verdict\b",
    r"\blegal proof of ownership\b",
    r"আদালতের রায় প্রদান",
    r"মালিকানার আইনি প্রমাণ",
    r"ট্রাস্ট স্কোর",
    r"প্রতারণা সনাক্তকরণ স্কোর"
]


def test_i18n_exact_key_parity():
    """Verify that bn.json and en.json have identical sets of keys."""
    assert I18N_BN.exists(), f"Missing {I18N_BN}"
    assert I18N_EN.exists(), f"Missing {I18N_EN}"

    with open(I18N_BN, "r", encoding="utf-8") as f:
        bn_data = json.load(f)
    with open(I18N_EN, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    bn_keys = set(bn_data.keys())
    en_keys = set(en_data.keys())

    missing_in_en = bn_keys - en_keys
    missing_in_bn = en_keys - bn_keys

    assert missing_in_en == set(), f"Keys in bn.json but missing in en.json: {missing_in_en}"
    assert missing_in_bn == set(), f"Keys in en.json but missing in bn.json: {missing_in_bn}"
    assert len(bn_keys) == len(en_keys)


def test_no_forbidden_claims_in_i18n():
    """Verify that translation dictionaries do not assert forbidden claims."""
    with open(I18N_BN, "r", encoding="utf-8") as f:
        bn_data = json.load(f)
    with open(I18N_EN, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    for lang, data in [("bn", bn_data), ("en", en_data)]:
        for key, val in data.items():
            if not isinstance(val, str):
                continue
            text = val.lower()
            for pattern in FORBIDDEN_PHRASES:
                # Disclaimers saying 'not a legal verdict' or 'no single trust score' are permitted
                if "not a legal verdict" in text or "no trust score" in text or "not a court" in text:
                    continue
                if "আইনি সিদ্ধান্ত নয়" in text or "কোনো ট্রাস্ট স্কোর নেই" in text:
                    continue
                match = re.search(pattern, text, re.IGNORECASE)
                assert not match, f"Forbidden phrase '{pattern}' found in {lang}.json key '{key}': '{val}'"


def test_allowed_status_labels_in_rules():
    """Verify backend rule statuses conform to the 4 permitted values."""
    from backend.app.rules import compare_records

    # Dummy comparison to inspect returned statuses
    rec1 = {
        "id": "rec-1",
        "owner_name": "করিম",
        "khatian_no": "100",
        "dag_no": "200",
        "land_area": 10.0,
        "deed_no": "D-1",
        "date": "2020-01-01"
    }
    rec2 = {
        "id": "rec-2",
        "owner_name": "করিম",
        "khatian_no": "100",
        "dag_no": "200",
        "land_area": 10.0,
        "deed_no": "D-1",
        "date": "2020-01-01"
    }
    res = compare_records(rec1, rec2)
    assert "results" in res

    for item in res["results"]:
        status = item.get("status")
        assert status in ALLOWED_STATUS_LABELS, (
            f"Invalid status '{status}' for field '{item.get('field')}'. Allowed: {ALLOWED_STATUS_LABELS}"
        )
    for st in res.get("status_counts", {}).keys():
        assert st in ALLOWED_STATUS_LABELS


def test_check_land_api_status_compliance():
    """Verify /api/check-land responses only emit allowed status labels and no trust score."""
    from backend.app.check_land import check_land

    req_payload = {
        "owner_name": "আব্দুল করিম",
        "dag_no": "558",
        "khatian_no": "128",
        "area_decimal": 10.0,
        "mouza": "সাভার",
        "deed_no": "DEED-558-2026"
    }
    res = check_land(req_payload)
    
    # Must not contain single trust score
    assert "trust_score" not in res
    assert "single_score" not in res

    # Field comparisons must use allowed statuses
    for field, comp in res.get("comparison", {}).items():
        st = comp.get("status")
        assert st in ALLOWED_STATUS_LABELS, f"Illegal field status '{st}' in check_land response"
