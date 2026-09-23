#!/usr/bin/env python3
"""
ml/train_all.py - Complete ML Training Pipeline Orchestration for AgriSense

Executes the full machine learning training lifecycle:
  1. Generate / Prepare 10,000 agriculturally consistent records
  2. Validate dataset quality, integrity & domain rules
  3. Preprocess data (imputation, scaling, one-hot encoding)
  4. Perform 70/15/15 Train-Validation-Test stratified split (zero leakage)
  5. Train & Compare models (Random Forest, HistGradientBoosting, XGBoost, Logistic Regression)
  6. Select winning models based on validation performance
  7. Evaluate selected models on untouched 15% test dataset
  8. Save all trained models, preprocessor, and metrics
  9. Print genuine, calculated training report
"""

import os
import sys
import time

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

ML_DIR = os.path.join(WORKSPACE_ROOT, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from ml.generate_dataset import generate_records, save_dataset, TARGET_COUNT
from scripts.validate_dataset import validate_dataset
from ml.preprocess import run_preprocessing
from ml.train_risk_model import train_risk_models
from ml.train_disease_model import train_disease_model
from ml.train_pest_model import train_pest_model
from ml.train_severity_model import train_severity_model
from ml.evaluate_models import run_full_evaluation


def run_all(target_count: int = TARGET_COUNT):
    start_time = time.time()
    print("\n" + "=" * 76)
    print("      AGRISENSE AGRICULTURAL MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 76)

    # Step 1: Generate / Prepare 10,000 records
    print("\n>>> STEP 1: Generating 10,000 Agricultural Field-Observation Records...")
    records = generate_records(count=target_count, seed=42)
    save_dataset(records)

    # Step 2: Validate Dataset Quality
    print("\n>>> STEP 2: Running Strict Dataset Quality & Domain Validation...")
    val_report = validate_dataset()
    if val_report["status"] != "PASSED":
        print(f"[ERROR] Dataset validation failed with anomalies. Please check logs.")
        sys.exit(1)

    # Step 3 & 4: Preprocess & Split (70/15/15)
    print("\n>>> STEP 3 & 4: Preprocessing Data & Performing 70/15/15 Stratified Split...")
    train_df, val_df, test_df, preprocessor, feature_config = run_preprocessing()

    # Step 5 & 6: Train & Compare Models
    print("\n>>> STEP 5 & 6: Training & Comparing Models on Validation Data...")
    risk_bundle, score_bundle = train_risk_models()
    disease_bundle = train_disease_model()
    pest_bundle = train_pest_model()
    severity_bundle = train_severity_model()

    # Step 7: Evaluate on Untouched 15% Test Dataset
    print("\n>>> STEP 7: Evaluating Selected Best Models on Untouched Test Dataset...")
    test_metrics = run_full_evaluation()

    elapsed = round(time.time() - start_time, 1)

    # Step 8: Print Final Genuine Training Report
    print("\n" + "=" * 76)
    print("AGRISENSE ML TRAINING COMPLETE")
    print("=" * 76)
    print(f"\nDataset:")
    print(f"  {val_report['total_records']:,} records ({val_report['dataset_file']})")
    print(f"  Data Source Identification: {val_report['synthetic_data_identified']} ('synthetic_training_data')")

    print(f"\nSplits:")
    print(f"  Training   : {len(train_df):,} records ({len(train_df)/val_report['total_records']*100:.1f}%)")
    print(f"  Validation : {len(val_df):,} records ({len(val_df)/val_report['total_records']*100:.1f}%)")
    print(f"  Testing    : {len(test_df):,} records ({len(test_df)/val_report['total_records']*100:.1f}%)")

    print(f"\nSelected Best Models (Validated on Holdout Val Set):")
    print(f"  Risk Model     : {risk_bundle['model_name']}")
    print(f"  Disease Model  : {disease_bundle['model_name']}")
    print(f"  Pest Model     : {pest_bundle['model_name']}")
    print(f"  Severity Model : {severity_bundle['model_name']}")
    if score_bundle:
        print(f"  Risk Score Reg : {score_bundle['model_name']}")

    print(f"\nTest Metrics (Strictly Calculated from 1,500 Untouched Test Records):")
    for target_key, m in test_metrics["models"].items():
        if m["model_type"] == "classification":
            print(f"  • {target_key.upper():12s} | Acc: {m['accuracy']*100:5.2f}% | Precision: {m['precision_weighted']:.4f} | Recall: {m['recall_weighted']:.4f} | F1: {m['f1_weighted']:.4f} | Algorithm: {m['selected_algorithm']}")
        else:
            print(f"  • {target_key.upper():12s} | RMSE: {m['rmse']:5.2f} | MAE: {m['mae']:.2f} | R²: {m['r2_score']:.4f} | Algorithm: {m['selected_algorithm']}")

    print(f"\nSaved Model Artifacts:")
    print(f"  - models/risk_model.pkl")
    print(f"  - models/risk_score_model.pkl")
    print(f"  - models/disease_model.pkl")
    print(f"  - models/pest_model.pkl")
    print(f"  - models/severity_model.pkl")
    print(f"  - models/preprocessor.pkl")
    print(f"  - models/feature_config.json")
    print(f"  - models/model_metrics.json")
    print(f"  - reports/model_evaluation_report.json")
    print(f"  - reports/model_evaluation_report.csv")
    print(f"  - reports/dataset_quality_report.json")

    print(f"\nElapsed Pipeline Time: {elapsed} seconds")
    print("=" * 76 + "\n")


if __name__ == "__main__":
    count = TARGET_COUNT
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    run_all(target_count=count)
