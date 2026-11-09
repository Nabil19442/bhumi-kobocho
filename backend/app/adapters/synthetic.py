from typing import Dict, Any, List, Optional
from .base import LandRecordSource

try:
    from ..transaction_registry import (
        get_parcel_by_id,
        find_history_for_deed,
        normalize_digits
    )
    from ..case_registry import get_cases_for_parcel
except ImportError:
    from backend.app.transaction_registry import (
        get_parcel_by_id,
        find_history_for_deed,
        normalize_digits
    )
    from backend.app.case_registry import get_cases_for_parcel


class SyntheticSource(LandRecordSource):
    """
    Synthetic demo data source wrapping SQLite transaction registry and synthetic case catalog.
    Enforces that all records are tagged with is_synthetic=True and demo disclaimers.
    """

    def get_parcel(self, parcel_id: str) -> Optional[Dict[str, Any]]:
        history = get_parcel_by_id(parcel_id)
        if not history:
            return None
        first_tx = history[0]
        latest_tx = history[-1]
        try:
            total_area = float(first_tx.get("total_parcel_area") or 10.0)
        except (ValueError, TypeError):
            total_area = 10.0

        return {
            "parcel_id": parcel_id,
            "mouza": first_tx.get("mouza"),
            "khatian_no": latest_tx.get("khatian_no"),
            "dag_no": latest_tx.get("dag_no"),
            "land_class": first_tx.get("land_class", "নাল (Nal / Agricultural)"),
            "total_area": total_area,
            "current_owner_bn": latest_tx.get("buyer_name_bn"),
            "current_owner_en": latest_tx.get("buyer_name_en"),
            "is_synthetic": True,
            "record_source": latest_tx.get("record_source", "Synthetic Demo Records"),
        }

    def search(
        self,
        dag_no: Optional[str] = None,
        khatian_no: Optional[str] = None,
        mouza: Optional[str] = None,
        deed_no: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        return find_history_for_deed(
            dag_no=dag_no,
            khatian_no=khatian_no,
            mouza=mouza,
            deed_no=deed_no
        )

    def get_history(self, parcel_id: str) -> List[Dict[str, Any]]:
        return get_parcel_by_id(parcel_id)

    def get_cases(self, parcel_id: str) -> List[Dict[str, Any]]:
        return get_cases_for_parcel(parcel_id)
