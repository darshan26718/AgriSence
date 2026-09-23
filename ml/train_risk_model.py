#!/usr/bin/env python3
"""
ml/train_risk_model.py - Train and Compare Risk Classification & Regression Models for AgriSense

Targets:
  1. risk_level (Classification: LOW, MEDIUM, HIGH, CRITICAL)
  2. risk_score (Regression: 0.0 to 100.0)

Compares:
  - Logistic Regression (Baseline)
  - Random Forest Classifier / Regressor
  - HistGradientBoosting Classifier / Regressor
  - XGBoost Classifier / Regressor

Selects best model based on Validation F1-score / RMSE, then serializes:
  - models/risk_model.pkl
  - models/risk_score_model.pkl
"""

import os
import sys
import joblib
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import (
    RandomForestClassifier,
    RandomForestRegressor,
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
)
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
from xgboost import XGBClassifier, XGBRegressor
from typing import Dict, Any, Tuple

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(WORKSPACE_ROOT, "dataset", "processed")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "models")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
SAVE_RISK_MODEL_PATH = os.path.join(MODELS_DIR, "risk_model.pkl")
SAVE_SCORE_MODEL_PATH = os.path.join(MODELS_DIR, "risk_score_model.pkl")


def train_risk_models(
    train_path: str = os.path.join(PROCESSED_DIR, "train.csv"),
    val_path: str = os.path.join(PROCESSED_DIR, "val.csv"),
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    print("=" * 72)
    print("[Risk Model Trainer] Training & Comparing Models for risk_level & risk_score")
    print("=" * 72)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    feature_cols = config["feature_columns"]

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    train_df = pd.read_csv(train_path, keep_default_na=False)
    val_df = pd.read_csv(val_path, keep_default_na=False)

    X_train = preprocessor.transform(train_df[feature_cols])
    X_val = preprocessor.transform(val_df[feature_cols])

    # -------------------------------------------------------------
    # 1. RISK LEVEL CLASSIFICATION
    # -------------------------------------------------------------
    y_train_raw = train_df["risk_level"].astype(str)
    y_val_raw = val_df["risk_level"].astype(str)

    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)
    y_val = le.transform(y_val_raw)

    print(f"Target 'risk_level' classes: {list(le.classes_)}")

    clf_candidates = {
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

    best_clf_name = None
    best_clf_model = None
    best_clf_f1 = -1.0
    best_clf_acc = -1.0
    clf_comparison = {}

    print("\n--- Comparing Risk Classification Models on Validation Set ---")
    for name, model in clf_candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_val)
        acc = accuracy_score(y_val, preds)
        f1 = f1_score(y_val, preds, average="weighted")
        clf_comparison[name] = {"accuracy": round(float(acc), 4), "f1_weighted": round(float(f1), 4)}
        print(f"  {name:22s} | Val Accuracy: {acc*100:.2f}% | Val Weighted F1: {f1:.4f}")

        if f1 > best_clf_f1:
            best_clf_f1 = f1
            best_clf_acc = acc
            best_clf_name = name
            best_clf_model = model

    print(f"\n=> Best Risk Classification Model: {best_clf_name} (F1: {best_clf_f1:.4f})")

    risk_model_bundle = {
        "model_name": best_clf_name,
        "model": best_clf_model,
        "label_encoder": le,
        "target": "risk_level",
        "classes": list(le.classes_),
        "validation_metrics": clf_comparison[best_clf_name],
        "all_comparisons": clf_comparison,
    }
    joblib.dump(risk_model_bundle, SAVE_RISK_MODEL_PATH)
    print(f"  Saved risk model bundle to: {SAVE_RISK_MODEL_PATH}")

    # -------------------------------------------------------------
    # 2. RISK SCORE REGRESSION
    # -------------------------------------------------------------
    y_train_score = train_df["risk_score"].astype(float).values
    y_val_score = val_df["risk_score"].astype(float).values

    reg_candidates = {
        "Ridge Baseline": Ridge(alpha=1.0),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=14, random_state=42, n_jobs=-1),
        "HistGradientBoosting Regressor": HistGradientBoostingRegressor(max_iter=150, random_state=42),
        "XGBoost Regressor": XGBRegressor(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1),
    }

    best_reg_name = None
    best_reg_model = None
    best_reg_rmse = float("inf")
    best_reg_r2 = -1.0
    reg_comparison = {}

    print("\n--- Comparing Risk Score Regression Models on Validation Set ---")
    for name, model in reg_candidates.items():
        model.fit(X_train, y_train_score)
        preds = model.predict(X_val)
        rmse = float(np.sqrt(mean_squared_error(y_val_score, preds)))
        r2 = float(r2_score(y_val_score, preds))
        reg_comparison[name] = {"rmse": round(rmse, 4), "r2": round(r2, 4)}
        print(f"  {name:30s} | Val RMSE: {rmse:.4f} | Val R2: {r2:.4f}")

        if rmse < best_reg_rmse:
            best_reg_rmse = rmse
            best_reg_r2 = r2
            best_reg_name = name
            best_reg_model = model

    print(f"\n=> Best Risk Score Regressor: {best_reg_name} (RMSE: {best_reg_rmse:.4f}, R2: {best_reg_r2:.4f})")

    score_model_bundle = {
        "model_name": best_reg_name,
        "model": best_reg_model,
        "target": "risk_score",
        "validation_metrics": reg_comparison[best_reg_name],
        "all_comparisons": reg_comparison,
    }
    joblib.dump(score_model_bundle, SAVE_SCORE_MODEL_PATH)
    print(f"  Saved risk score model bundle to: {SAVE_SCORE_MODEL_PATH}")

    return risk_model_bundle, score_model_bundle


if __name__ == "__main__":
    train_risk_models()
