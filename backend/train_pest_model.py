#!/usr/bin/env python3
"""
train_pest_model.py - Train the Pest Classification Model for AgriSense

Trains a Random Forest + Gradient Boosting ensemble model on synthetic feature vectors
generated from the pest_dataset.csv knowledge base. Produces a JSON model file that
the PestClassifier loads at runtime for real ML inference.

Usage: python backend/train_pest_model.py
"""

import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend directory is in python path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

WORKSPACE_ROOT = os.path.dirname(BACKEND_DIR)
MODEL_SAVE_PATH = os.path.join(WORKSPACE_ROOT, "data", "pest_classifier_model.json")

from generate_training_data import (
    generate_pest_training_data,
    PEST_FEATURE_NAMES,
)
from ml_engine import EnsembleClassifier, save_model


def main():
    print("=" * 72)
    print("[AgriSense] Pest Classification Model Trainer")
    print("=" * 72)
    print(f"Model output : {MODEL_SAVE_PATH}")
    print(f"Features     : {len(PEST_FEATURE_NAMES)} dimensions")
    print(f"Feature list : {', '.join(PEST_FEATURE_NAMES)}")

    # Step 1: Generate training data
    print("\n[Step 1/4] Generating synthetic training data...")
    t0 = time.time()
    X, y, class_names = generate_pest_training_data(samples_per_class=120, seed=42)
    n_classes = len(class_names)
    print(f"  Generated {len(X)} samples across {n_classes} classes ({time.time() - t0:.1f}s)")

    for i, name in enumerate(class_names):
        count = y.count(i)
        print(f"    [{i:2d}] {name}: {count} samples")

    # Step 2: Train/Test Split (80/20)
    print("\n[Step 2/4] Splitting into train/test sets (80/20)...")
    split_idx = int(0.8 * len(X))
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_test, y_test = X[split_idx:], y[split_idx:]
    print(f"  Train: {len(X_train)} samples  |  Test: {len(X_test)} samples")

    # Step 3: Train ensemble model
    print("\n[Step 3/4] Training RF + GaussianNB Ensemble Model...")
    t0 = time.time()

    model = EnsembleClassifier(rf_weight=0.45, nb_weight=0.55, gbm_weight=0.0)
    model.fit(
        X_train, y_train,
        class_names=class_names,
        feature_names=PEST_FEATURE_NAMES,
        rf_params={
            "n_trees": 15,
            "max_depth": 8,
            "min_samples_split": 5,
            "max_features_ratio": 0.6,
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
    print("\n[Step 4/4] Evaluating on test set...")
    metrics = model.evaluate(X_test, y_test)
    print(f"\n  Overall Accuracy: {metrics['accuracy_pct']}%")
    print(f"  Total Test Samples: {metrics['total_samples']}")
    print(f"  Correct Predictions: {metrics['correct']}")

    print("\n  Per-Class Metrics:")
    print(f"  {'Class':<50} {'Precision':>10} {'Recall':>10} {'F1':>10}")
    print("  " + "-" * 80)
    for cm in metrics["per_class"]:
        print(f"  {cm['class_name']:<50} {cm['precision']:>9.1f}% {cm['recall']:>9.1f}% {cm['f1']:>9.1f}%")

    # Save model
    print(f"\n  Saving model to {MODEL_SAVE_PATH}...")
    save_model(model, MODEL_SAVE_PATH)

    # Quick inference test
    print("\n[Inference Test]")
    # Simulate a Pink Bollworm damage feature vector
    test_features = [
        0.35,   # bore_hole_dark_spots
        0.08,   # chewing_defoliation
        0.03,   # hopperburn_bronzing
        0.05,   # silken_webbing
        0.02,   # honeydew_sooty
        0.04,   # scorched_ratio
        0.42,   # healthy_ratio
        0.50,   # crop_id_norm
        0.48,   # brightness
        0.55,   # contrast
    ]
    top3 = model.predict_top_k(test_features, k=3)
    print(f"  Input: Typical Pink Bollworm damage features")
    for rank, (cls_id, name, prob) in enumerate(top3, 1):
        print(f"    #{rank}: {name} ({prob * 100:.1f}%)")

    print("\n" + "=" * 72)
    print("[AgriSense] Pest Classification Model Training Complete!")
    print(f"  Accuracy: {metrics['accuracy_pct']}%  |  Classes: {n_classes}  |  Time: {train_time:.1f}s")
    print("=" * 72)


if __name__ == "__main__":
    main()
