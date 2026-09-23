#!/usr/bin/env python3
"""
train_disease_model_v2.py - Train Expanded v2 Crop Disease Classification Model

Preserves existing model as v1 (data/disease_classifier_model.json) and trains
the expanded v2 model (data/disease_classifier_model_v2.json) covering 42 classes
(including previously missing Indian crops: Maize, Mango, Grapes, Okra, Brinjal,
Mustard, Cabbage, and Pigeon Pea).
"""

import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

WORKSPACE_ROOT = os.path.dirname(BACKEND_DIR)
MODEL_V1_PATH = os.path.join(WORKSPACE_ROOT, "data", "disease_classifier_model.json")
MODEL_V2_PATH = os.path.join(WORKSPACE_ROOT, "data", "disease_classifier_model_v2.json")

from generate_training_data import (
    generate_disease_training_data,
    DISEASE_FEATURE_NAMES,
)
from ml_engine import EnsembleClassifier, save_model


def main():
    print("=" * 72)
    print("[AgriSense] Expanded v2 Crop Disease Model Trainer (42 Classes)")
    print("=" * 72)
    print(f"Target Output : {MODEL_V2_PATH}")
    print(f"Preserved v1  : {MODEL_V1_PATH}")
    print(f"Features      : {len(DISEASE_FEATURE_NAMES)} dimensions")

    # Step 1: Generate training data
    print("\n[Step 1/4] Generating class-balanced training data across all 42 classes...")
    t0 = time.time()
    X, y, class_names = generate_disease_training_data(samples_per_class=120, seed=42)
    n_classes = len(class_names)
    print(f"  Generated {len(X)} samples across {n_classes} classes ({time.time() - t0:.1f}s)")

    # Step 2: Stratified Train/Test Split (80/20)
    print("\n[Step 2/4] Splitting into train/test sets (80/20)...")
    split_idx = int(0.8 * len(X))
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_test, y_test = X[split_idx:], y[split_idx:]
    print(f"  Train: {len(X_train)} samples  |  Test: {len(X_test)} samples")

    # Step 3: Train ensemble model
    print("\n[Step 3/4] Training v2 RF + GaussianNB Ensemble Model...")
    t0 = time.time()

    model = EnsembleClassifier(rf_weight=0.45, nb_weight=0.55, gbm_weight=0.0)
    model.fit(
        X_train, y_train,
        class_names=class_names,
        feature_names=DISEASE_FEATURE_NAMES,
        rf_params={
            "n_trees": 20,
            "max_depth": 10,
            "min_samples_split": 4,
            "max_features_ratio": 0.65,
            "seed": 42,
        },
        nb_params={
            "var_smoothing": 1e-5,
        },
        verbose=True,
    )
    train_time = time.time() - t0
    print(f"\n  Training completed in {train_time:.1f}s")

    # Step 4: Evaluate
    print("\n[Step 4/4] Evaluating v2 on test set...")
    metrics = model.evaluate(X_test, y_test)
    print(f"\n  Overall v2 Test Accuracy: {metrics['accuracy_pct']}%")
    print(f"  Total Test Samples: {metrics['total_samples']}")
    print(f"  Correct Predictions: {metrics['correct']}")

    # Save v2 model
    print(f"\n  Saving v2 model to {MODEL_V2_PATH}...")
    save_model(model, MODEL_V2_PATH)
    print(f"  v2 Model successfully saved. Preserved baseline v1 at {MODEL_V1_PATH}.")
    print("=" * 72)
    return metrics


if __name__ == "__main__":
    main()
