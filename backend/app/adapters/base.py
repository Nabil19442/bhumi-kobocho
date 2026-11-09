from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class LandRecordSource(ABC):
    """
    Abstract interface for land record data adapters.
    Decouples Bhumi Kobocho's citizen intelligence and rule evaluation engines
    from underlying data providers. In hackathon/demo mode, SyntheticSource is active.
    In future production deployment under official government partnership, an
    AuthorizedGovtSource would implement this interface.
    """

    @abstractmethod
    def get_parcel(self, parcel_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve parcel header/summary information by parcel ID."""
        pass

    @abstractmethod
    def search(
        self,
        dag_no: Optional[str] = None,
        khatian_no: Optional[str] = None,
        mouza: Optional[str] = None,
        deed_no: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Search records matching criteria."""
        pass

    @abstractmethod
    def get_history(self, parcel_id: str) -> List[Dict[str, Any]]:
        """Retrieve chronological chain-of-title transaction history for a parcel."""
        pass

    @abstractmethod
    def get_cases(self, parcel_id: str) -> List[Dict[str, Any]]:
        """Retrieve active cases (civil suits, mutation objections, mortgages) for a parcel."""
        pass
