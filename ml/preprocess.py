#!/usr/bin/env python3
"""
ml/preprocess.py - Preprocessing, Split & Featurizer Pipeline for AgriSense

Performs:
  1. Strict 70% Train / 15% Validation / 15% Test split with fixed random seed
  2. Saves split subsets into dataset/processed/ (train.csv, val.csv, test.csv)
  3. Preprocessing ColumnTransformer:
     - Numerical features: Imputer (median) + StandardScaler
     - Categorical features: Imputer (most_frequent) + OneHotEncoder (handle_unknown='ignore')
  4. Fits preprocessor STRICTLY on the training set only (zero test data leakage)
  5. Serializes:
     - models/preprocessor.pkl
     - models/feature_config.json
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from typing import Dict, Any, Tuple

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "agrisense_training_dataset.csv")
PROCESSED_DIR = os.path.join(WORKSPACE_ROOT, "dataset", "processed")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "models")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")

# Targets
TARGET_COLUMNS = ["risk_level", "disease", "pest", "severity", "risk_score"]

# Leakage / metadata columns to exclude from input features
EXCLUDE_COLUMNS = [
    "record_id",
    "field_id",
    "date",
    "data_source",
    "disease_probability",
    "pest_probability",
    "recommended_action",
] + TARGET_COLUMNS

CATEGORICAL_FEATURES = [
    "crop",
    "crop_variety",
    "growth_stage",
    "soil_type",
    "state",
    "district",
    "irrigation_level",
    "disease_history",
    "pest_history",
]

NUMERICAL_FEATURES = [
    "crop_age_days",
    "area_acres",
    "soil_ph",
    "nitrogen",
    "phosphorus",
    "potassium",
    "soil_moisture",
    "temperature",
    "humidity",
    "rainfall",
    "rain_probability",
    "wind_speed",
    "leaf_wetness_hours",
    "sunlight_hours",
    "previous_disease",
    "previous_pest",
    "ndvi",
    "vegetation_health",
]

FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


def create_preprocessor() -> ColumnTransformer:
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def run_preprocessing(dataset_path: str = DATASET_PATH) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, ColumnTransformer, Dict[str, Any]]:
    print("=" * 72)
    print("[Preprocessing] Splitting dataset & building feature pipelines...")
    print("=" * 72)

    df = pd.read_csv(dataset_path, keep_default_na=False)
    total_records = len(df)
    print(f"Loaded {total_records} records from {dataset_path}")

    # Ensure processed and models directories exist
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. 70% Train, 30% Temp (Val + Test)
    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=42,
        stratify=df["risk_level"],
    )

    # 2. Split Temp into 50% Val, 50% Test (15% and 15% of total)
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=42,
        stratify=temp_df["risk_level"],
    )

    print(f"  Training set   : {len(train_df)} records ({len(train_df)/total_records*100:.1f}%)")
    print(f"  Validation set : {len(val_df)} records ({len(val_df)/total_records*100:.1f}%)")
    print(f"  Test set       : {len(test_df)} records ({len(test_df)/total_records*100:.1f}%)")

    # Save splits
    train_path = os.path.join(PROCESSED_DIR, "train.csv")
    val_path = os.path.join(PROCESSED_DIR, "val.csv")
    test_path = os.path.join(PROCESSED_DIR, "test.csv")

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)
    print(f"  Saved split CSVs to {PROCESSED_DIR}")

    # 3. Fit preprocessor strictly on train_df
    preprocessor = create_preprocessor()
    X_train_df = train_df[FEATURE_COLUMNS]
    preprocessor.fit(X_train_df)

    # Save preprocessor
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    print(f"  Saved fitted preprocessor to: {PREPROCESSOR_PATH}")

    # 4. Save feature config
    feature_config = {
        "feature_columns": FEATURE_COLUMNS,
        "categorical_columns": CATEGORICAL_FEATURES,
        "numerical_columns": NUMERICAL_FEATURES,
        "target_columns": TARGET_COLUMNS,
        "excluded_columns": EXCLUDE_COLUMNS,
        "splits": {
            "total_records": total_records,
            "train_count": len(train_df),
            "val_count": len(val_df),
            "test_count": len(test_df),
        },
        "target_classes": {
            "risk_level": sorted([str(x) for x in df["risk_level"].unique()]),
            "severity": sorted([str(x) for x in df["severity"].unique()]),
            "disease": sorted([str(x) for x in df["disease"].unique()]),
            "pest": sorted([str(x) for x in df["pest"].unique()]),
        },
    }

    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_config, f, indent=2)
    print(f"  Saved feature configuration to: {CONFIG_PATH}")

    return train_df, val_df, test_df, preprocessor, feature_config


if __name__ == "__main__":
    run_preprocessing()
