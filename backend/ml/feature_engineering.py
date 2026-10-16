from typing import List, Tuple
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from backend.ml.config import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    BINARY_FEATURES,
    ALL_FEATURE_COLUMNS,
)

def build_feature_preprocessor() -> ColumnTransformer:
    """
    Constructs a robust, production-grade scikit-learn ColumnTransformer.
    - Imputes missing numerical values using median.
    - Standardizes numerical variables.
    - Imputes missing categorical values as 'missing'.
    - Encodes categoricals via OneHotEncoder with handle_unknown='ignore'.
    - Imputes binary values using most frequent value.
    Ensures zero target leakage and identical transformations for training and inference.
    """
    numerical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    binary_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_pipeline, NUMERICAL_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
            ("bin", binary_pipeline, BINARY_FEATURES),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    return preprocessor

def get_feature_column_order() -> List[str]:
    """Returns canonical, immutable feature column ordering for dataset alignment."""
    return list(ALL_FEATURE_COLUMNS)
