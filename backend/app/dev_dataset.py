"""
Development Seed Dataset Loader for Bhumi Kobocho (ভূমি কবচ)
Loads 20 diverse, realistic fictional land deed scenarios for dev testing and evaluation.
Kept 100% separate from production databases and archives.
"""

import os
import json
from typing import Dict, Any, List, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DEV_SEEDS_FILE = os.path.join(DATA_DIR, "dev_seed_deeds.json")

_DEV_SEEDS_CACHE: Optional[List[Dict[str, Any]]] = None

def load_dev_seed_deeds() -> List[Dict[str, Any]]:
    """Loads all 20 fictional development land deed records from backend/data/dev_seed_deeds.json."""
    global _DEV_SEEDS_CACHE
    if _DEV_SEEDS_CACHE is not None:
        return _DEV_SEEDS_CACHE

    if os.path.exists(DEV_SEEDS_FILE):
        try:
            with open(DEV_SEEDS_FILE, "r", encoding="utf-8") as f:
                _DEV_SEEDS_CACHE = json.load(f)
                return _DEV_SEEDS_CACHE
        except Exception:
            pass

    return []

def get_dev_seed_by_id(deed_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single development deed by its unique deed identifier."""
    seeds = load_dev_seed_deeds()
    clean_id = str(deed_id).strip().lower()
    return next((d for d in seeds if str(d.get("id")).lower() == clean_id), None)

def get_dev_seed_by_scenario(scenario_number: int) -> Optional[Dict[str, Any]]:
    """Retrieves a development deed record by its scenario number (1 to 20)."""
    seeds = load_dev_seed_deeds()
    return next((d for d in seeds if d.get("scenario_number") == scenario_number), None)
