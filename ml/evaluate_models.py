#!/usr/bin/env python3
"""
ml/evaluate_models.py - Test Dataset Model Evaluation & Reporting Engine for AgriSense

Evaluates all winning saved models strictly against the untouched 15% TEST dataset (1,500 records).
Calculates genuine metrics:
  - Accuracy
  - Precision (Macro & Weighted)
  - Recall (Macro & Weighted)
  - F1-Score (Macro & Weighted)
  - Confusion Matrix
  - ROC-AUC (Multiclass OvR where probabilities exist)
  - RMSE, MAE, R² (for risk_score regression)

Outputs:
  models/model_metrics.json
  reports/model_evaluation_report.json
  reports/model_evaluation_report.csv
"""

import os
import sys
import json
import csv
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)
from typing import Dict, Any

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(WORKSPACE_ROOT, "dataset", "processed")
TEST_PATH = os.path.join(PROCESSED_DIR, "test.csv")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "models")
REPORTS_DIR = os.path.join(WORKSPACE_ROOT, "reports")

PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")

RISK_MODEL_PATH = os.path.join(MODELS_DIR, "risk_model.pkl")
SCORE_MODEL_PATH = os.path.join(MODELS_DIR, "risk_score_model.pkl")
DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, "disease_model.pkl")
PEST_MODEL_PATH = os.path.join(MODELS_DIR, "pest_model.pkl")
SEVERITY_MODEL_PATH = os.path.join(MODELS_DIR, "severity_model.pkl")

METRICS_JSON_PATH = os.path.join(MODELS_DIR, "model_metrics.json")
REPORT_JSON_PATH = os.path.join(REPORTS_DIR, "model_evaluation_report.json")
REPORT_CSV_PATH = os.path.join(REPORTS_DIR, "model_evaluation_report.csv")


def evaluate_classification_model(bundle: Dict[str, Any], X_test: np.ndarray, y_test_raw: pd.Series, target_name: str) -> Dict[str, Any]:
    model = bundle["model"]
    le = bundle["label_encoder"]
    classes = bundle["classes"]

    # Transform ground truth labels safely
    classes_set = set(classes)
    y_test_indices = []
    fallback_val = "None" if "None" in classes_set else classes[0]
    fallback_idx = list(classes).index(fallback_val)

    for val in y_test_raw:
        s_val = str(val)
        if s_val in classes_set:
            y_test_indices.append(le.transform([s_val])[0])
        else:
            y_test_indices.append(fallback_idx)
    y_test = np.array(y_test_indices)

    y_pred = model.predict(X_test)
    y_pred_labels = le.inverse_transform(y_pred)

    acc = float(accuracy_score(y_test, y_pred))
    p_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    p_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    r_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    r_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()

    # ROC-AUC calculation if predict_proba is supported
    roc_auc = None
    if hasattr(model, "predict_proba"):
        try:
            probas = model.predict_proba(X_test)
            if probas.shape[1] == len(np.unique(y_test)):
                roc_auc = float(roc_auc_score(y_test, probas, multi_class="ovr", average="weighted"))
            else:
                # subset present in test
                roc_auc = float(roc_auc_score(y_test, probas, multi_class="ovr", average="weighted", labels=np.unique(y_test)))
        except Exception:
            roc_auc = None

    result = {
        "target": target_name,
        "model_type": "classification",
        "selected_algorithm": bundle.get("model_name", "Ensemble"),
        "test_records": len(y_test),
        "classes": classes,
        "accuracy": round(acc, 4),
        "precision_macro": round(p_macro, 4),
        "precision_weighted": round(p_weighted, 4),
        "recall_macro": round(r_macro, 4),
        "recall_weighted": round(r_weighted, 4),
        "f1_macro": round(f1_macro, 4),
        "f1_weighted": round(f1_weighted, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else "N/A",
        "confusion_matrix": cm,
    }
    return result


def evaluate_regression_model(bundle: Dict[str, Any], X_test: np.ndarray, y_test_series: pd.Series, target_name: str) -> Dict[str, Any]:
    model = bundle["model"]
    y_test = y_test_series.astype(float).values
    y_pred = model.predict(X_test)

    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    result = {
        "target": target_name,
        "model_type": "regression",
        "selected_algorithm": bundle.get("model_name", "Regressor"),
        "test_records": len(y_test),
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2_score": round(r2, 4),
    }
    return result


def run_full_evaluation(test_file: str = TEST_PATH) -> Dict[str, Any]:
    print("=" * 72)
    print("[Evaluation Engine] Evaluating Selected Models on UNTOUCHED Test Dataset")
    print(f"Test File : {test_file}")
    print("=" * 72)

    if not os.path.exists(test_file):
        raise FileNotFoundError(f"Test dataset not found at {test_file}. Please run ml/preprocess.py first.")

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    feature_cols = config["feature_columns"]

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    test_df = pd.read_csv(test_file, keep_default_na=False)
    X_test = preprocessor.transform(test_df[feature_cols])

    # Load Model Bundles
    risk_bundle = joblib.load(RISK_MODEL_PATH)
    disease_bundle = joblib.load(DISEASE_MODEL_PATH)
    pest_bundle = joblib.load(PEST_MODEL_PATH)
    severity_bundle = joblib.load(SEVERITY_MODEL_PATH)

    # 1. Evaluate Risk Model
    risk_metrics = evaluate_classification_model(risk_bundle, X_test, test_df["risk_level"], "risk_level")
    print(f"  [Risk Level]   Accuracy: {risk_metrics['accuracy']*100:.2f}% | F1-Score: {risk_metrics['f1_weighted']:.4f} | Model: {risk_metrics['selected_algorithm']}")

    # 2. Evaluate Disease Model
    disease_metrics = evaluate_classification_model(disease_bundle, X_test, test_df["disease"], "disease")
    print(f"  [Disease]      Accuracy: {disease_metrics['accuracy']*100:.2f}% | F1-Score: {disease_metrics['f1_weighted']:.4f} | Model: {disease_metrics['selected_algorithm']}")

    # 3. Evaluate Pest Model
    pest_metrics = evaluate_classification_model(pest_bundle, X_test, test_df["pest"], "pest")
    print(f"  [Pest]         Accuracy: {pest_metrics['accuracy']*100:.2f}% | F1-Score: {pest_metrics['f1_weighted']:.4f} | Model: {pest_metrics['selected_algorithm']}")

    # 4. Evaluate Severity Model
    severity_metrics = evaluate_classification_model(severity_bundle, X_test, test_df["severity"], "severity")
    print(f"  [Severity]     Accuracy: {severity_metrics['accuracy']*100:.2f}% | F1-Score: {severity_metrics['f1_weighted']:.4f} | Model: {severity_metrics['selected_algorithm']}")

    # 5. Evaluate Risk Score Regressor if present
    score_metrics = None
    if os.path.exists(SCORE_MODEL_PATH):
        score_bundle = joblib.load(SCORE_MODEL_PATH)
        score_metrics = evaluate_regression_model(score_bundle, X_test, test_df["risk_score"], "risk_score")
        print(f"  [Risk Score]   RMSE: {score_metrics['rmse']:.4f} | R2: {score_metrics['r2_score']:.4f} | Model: {score_metrics['selected_algorithm']}")

    all_metrics = {
        "evaluation_dataset": "Untouched 15% Holdout Test Set",
        "total_test_samples": len(test_df),
        "models": {
            "risk_level": risk_metrics,
            "disease": disease_metrics,
            "pest": pest_metrics,
            "severity": severity_metrics,
        },
    }
    if score_metrics:
        all_metrics["models"]["risk_score"] = score_metrics

    # Save to models/model_metrics.json
    with open(METRICS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"\n  Saved test metrics to: {METRICS_JSON_PATH}")

    # Save to reports/model_evaluation_report.json
    os.makedirs(REPORTS_DIR, exist_ok=True)
    with open(REPORT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"  Saved JSON report to:  {REPORT_JSON_PATH}")

    # Save summary table to reports/model_evaluation_report.csv
    csv_rows = [
        ["Target", "Model_Type", "Best_Algorithm", "Test_Records", "Accuracy_Pct", "Precision_Weighted", "Recall_Weighted", "F1_Weighted", "ROC_AUC", "RMSE", "R2_Score"]
    ]
    for key, m in all_metrics["models"].items():
        if m["model_type"] == "classification":
            csv_rows.append([
                m["target"],
                m["model_type"],
                m["selected_algorithm"],
                m["test_records"],
                f"{m['accuracy']*100:.2f}%",
                m["precision_weighted"],
                m["recall_weighted"],
                m["f1_weighted"],
                m["roc_auc"],
                "N/A",
                "N/A",
            ])
        else:
            csv_rows.append([
                m["target"],
                m["model_type"],
                m["selected_algorithm"],
                m["test_records"],
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                m["rmse"],
                m["r2_score"],
            ])

    with open(REPORT_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(csv_rows)
    print(f"  Saved CSV report to:   {REPORT_CSV_PATH}")

    return all_metrics


if __name__ == "__main__":
    run_full_evaluation()
