"""
Tests for ML model scikit-learn version alignment check.
"""

from backend.ml.predict import check_sklearn_version_alignment


def test_sklearn_version_alignment_matching():
    # Currently matching
    msg = check_sklearn_version_alignment()
    assert msg is None
