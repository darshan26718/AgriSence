#!/usr/bin/env python3
"""
ml/train_disease_model.py - Train and Compare Crop Disease Classification Models for AgriSense

Target:
  disease (Multiclass Classification: Rice Blast, Late Blight, Tikka, Rust, None, etc.)

Compares:
  - Random Forest Classifier
  - HistGradientBoosting Classifier
  - XGBoost Classifier

Selects best model based on Validation F1-score and serializes:
  - models/disease_model.pkl
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
SAVE_DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, "disease_model.pkl")


def train_disease_model(
    train_path: str = os.path.join(PROCESSED_DIR, "train.csv"),
    val_path: str = os.path.join(PROCESSED_DIR, "val.csv"),
) -> Dict[str, Any]:
    print("=" * 72)
    print("[Disease Model Trainer] Training & Comparing Multiclass Disease Classifiers")
    print("=" * 72)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    feature_cols = config["feature_columns"]

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    train_df = pd.read_csv(train_path, keep_default_na=False)
    val_df = pd.read_csv(val_path, keep_default_na=False)

    X_train = preprocessor.transform(train_df[feature_cols])
    X_val = preprocessor.transform(val_df[feature_cols])

    y_train_raw = train_df["disease"].astype(str)
    y_val_raw = val_df["disease"].astype(str)

    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)

    # Handle any unseen classes safely if present
    classes_list = list(le.classes_)
    y_val = np.array([le.transform([v])[0] if v in classes_list else le.transform(["None"])[0] for v in y_val_raw])

    print(f"Disease target classes count: {len(classes_list)}")
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

    print("\n--- Comparing Disease Classification Models on Validation Set ---")
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

    print(f"\n=> Best Disease Classification Model: {best_name} (F1: {best_f1:.4f})")

    disease_model_bundle = {
        "model_name": best_name,
        "model": best_model,
        "label_encoder": le,
        "target": "disease",
        "classes": classes_list,
        "validation_metrics": comparison[best_name],
        "all_comparisons": comparison,
    }
    joblib.dump(disease_model_bundle, SAVE_DISEASE_MODEL_PATH)
    print(f"  Saved disease model bundle to: {SAVE_DISEASE_MODEL_PATH}")

    return disease_model_bundle


if __name__ == "__main__":
    train_disease_model()
