#!/usr/bin/env python3
"""
ml/train_severity_model.py - Train and Compare Severity Classification Models for AgriSense

Target:
  severity (Classification: LOW, MEDIUM, HIGH)

Compares:
  - Logistic Regression (Baseline)
  - Random Forest Classifier
  - HistGradientBoosting Classifier
  - XGBoost Classifier

Selects best model based on Validation F1-score and serializes:
  - models/severity_model.pkl
"""

import os
import sys
import joblib
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score
from xgboost import XGBClassifier
from typing import Dict, Any, Tuple

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(WORKSPACE_ROOT, "dataset", "processed")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "models")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
SAVE_SEVERITY_MODEL_PATH = os.path.join(MODELS_DIR, "severity_model.pkl")


def train_severity_model(
    train_path: str = os.path.join(PROCESSED_DIR, "train.csv"),
    val_path: str = os.path.join(PROCESSED_DIR, "val.csv"),
) -> Dict[str, Any]:
    print("=" * 72)
    print("[Severity Model Trainer] Training & Comparing Severity Classifiers")
    print("=" * 72)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    feature_cols = config["feature_columns"]

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    train_df = pd.read_csv(train_path, keep_default_na=False)
    val_df = pd.read_csv(val_path, keep_default_na=False)

    X_train = preprocessor.transform(train_df[feature_cols])
    X_val = preprocessor.transform(val_df[feature_cols])

    y_train_raw = train_df["severity"].astype(str)
    y_val_raw = val_df["severity"].astype(str)

    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)
    y_val = le.transform(y_val_raw)

    classes_list = list(le.classes_)
    print(f"Severity target classes: {classes_list}")

    candidates = {
        "Logistic Regression": LogisticRegression(max_iter=600, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=16, random_state=42, n_jobs=-1),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=150, random_state=42),
        "XGBoost": XGBClassifier(
            n_estimators=120,
            max_depth=6,
            learning_rate=0.08,
            random_state=42,
            eval_metric="mlogloss",
            n_jobs=-1,
        ),
    }

    best_name = None
    best_model = None
    best_f1 = -1.0
    best_acc = -1.0
    comparison = {}

    print("\n--- Comparing Severity Classification Models on Validation Set ---")
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_val)
        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds, average="weighted", zero_division=0)
        comparison[name] = {"accuracy": round(float(acc), 4), "f1_weighted": round(float(f1), 4)}
        print(f"  {name:22s} | Val Accuracy: {acc*100:.2f}% | Val Weighted F1: {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_acc = acc
            best_name = name
            best_model = model

    print(f"\n=> Best Severity Model: {best_name} (F1: {best_f1:.4f})")

    severity_model_bundle = {
        "model_name": best_name,
        "model": best_model,
        "label_encoder": le,
        "target": "severity",
        "classes": classes_list,
        "validation_metrics": comparison[best_name],
        "all_comparisons": comparison,
    }
    joblib.dump(severity_model_bundle, SAVE_SEVERITY_MODEL_PATH)
    print(f"  Saved severity model bundle to: {SAVE_SEVERITY_MODEL_PATH}")

    return severity_model_bundle


if __name__ == "__main__":
    train_severity_model()
