#!/usr/bin/env python3
"""
ml/train_pest_model.py - Train and Compare Pest Infestation Classification Models for AgriSense

Target:
  pest (Multiclass Classification: Pink Bollworm, Fall Armyworm, Brown Planthopper, Whiteflies, None, etc.)

Compares:
  - Random Forest Classifier
  - HistGradientBoosting Classifier
  - XGBoost Classifier

Selects best model based on Validation F1-score and serializes:
  - models/pest_model.pkl
"""

import os
import sys
import joblib
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score
from xgboost import XGBClassifier
from typing import Dict, Any, Tuple

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(WORKSPACE_ROOT, "dataset", "processed")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "models")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
SAVE_PEST_MODEL_PATH = os.path.join(MODELS_DIR, "pest_model.pkl")


def train_pest_model(
    train_path: str = os.path.join(PROCESSED_DIR, "train.csv"),
    val_path: str = os.path.join(PROCESSED_DIR, "val.csv"),
) -> Dict[str, Any]:
    print("=" * 72)
    print("[Pest Model Trainer] Training & Comparing Multiclass Pest Classifiers")
    print("=" * 72)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    feature_cols = config["feature_columns"]

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    train_df = pd.read_csv(train_path, keep_default_na=False)
    val_df = pd.read_csv(val_path, keep_default_na=False)

    X_train = preprocessor.transform(train_df[feature_cols])
    X_val = preprocessor.transform(val_df[feature_cols])

    y_train_raw = train_df["pest"].astype(str)
    y_val_raw = val_df["pest"].astype(str)

    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)

    classes_list = list(le.classes_)
    y_val = np.array([le.transform([v])[0] if v in classes_list else le.transform(["None"])[0] for v in y_val_raw])

    print(f"Pest target classes count: {len(classes_list)}")
    print(f"Classes: {classes_list}")

    candidates = {
        "Random Forest": RandomForestClassifier(n_estimators=130, max_depth=18, min_samples_split=3, random_state=42, n_jobs=-1),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=150, min_samples_leaf=5, random_state=42),
        "XGBoost": XGBClassifier(
            n_estimators=130,
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

    print("\n--- Comparing Pest Classification Models on Validation Set ---")
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

    print(f"\n=> Best Pest Classification Model: {best_name} (F1: {best_f1:.4f})")

    pest_model_bundle = {
        "model_name": best_name,
        "model": best_model,
        "label_encoder": le,
        "target": "pest",
        "classes": classes_list,
        "validation_metrics": comparison[best_name],
        "all_comparisons": comparison,
    }
    joblib.dump(pest_model_bundle, SAVE_PEST_MODEL_PATH)
    print(f"  Saved pest model bundle to: {SAVE_PEST_MODEL_PATH}")

    return pest_model_bundle


if __name__ == "__main__":
    train_pest_model()
