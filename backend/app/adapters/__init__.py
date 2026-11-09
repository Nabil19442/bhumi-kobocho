from typing import Optional
from .base import LandRecordSource
from .synthetic import SyntheticSource

_DEFAULT_SOURCE: Optional[LandRecordSource] = None


def get_record_source() -> LandRecordSource:
    """Returns the globally configured land record source adapter (defaults to SyntheticSource)."""
    global _DEFAULT_SOURCE
    if _DEFAULT_SOURCE is None:
        _DEFAULT_SOURCE = SyntheticSource()
    return _DEFAULT_SOURCE


def set_record_source(source: LandRecordSource) -> None:
    """Configures a custom record source adapter (primarily for testing and mock injection)."""
    global _DEFAULT_SOURCE
    _DEFAULT_SOURCE = source
