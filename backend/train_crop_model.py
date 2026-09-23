#!/usr/bin/env python3
"""
train_crop_model.py - Standalone Training Script for AgriSense Crop Recommendation Model
Usage: python backend/train_crop_model.py
"""

import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from crop_recommender import crop_recommender, DATASET_PATH, MODEL_SAVE_PATH


def main():
    print("=" * 70)
    print("[AgriSense] Machine Learning Crop Recommendation Model Trainer")
    print("=" * 70)
    print(f"Dataset path : {DATASET_PATH}")
    print(f"Model output : {MODEL_SAVE_PATH}")
    print("\nStarting training pipeline...")

    summary = crop_recommender.train()

    print("\n" + "=" * 70)
    print("[AgriSense] Model Training Completed Successfully!")
    print("=" * 70)
    print(f"Algorithm         : {summary.get('algorithm')}")
    print(f"Training Samples  : {summary.get('total_samples')}")
    print(f"Target Crop Count : {summary.get('num_classes')}")
    print(f"Model Accuracy    : {summary.get('accuracy_pct')}%")
    print(f"Feature Inputs    : {', '.join(summary.get('features', []))}")
    print("\nSample Test Prediction:")
    test_sample = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 21.0,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 200.0,
    }
    pred = crop_recommender.predict(test_sample)
    print(f"Inputs : {test_sample}")
    print(f"Result : {pred['recommended_crop_name']} ({pred['confidence_pct']}% confidence)")
    print(f"Advisory: {pred['agronomic_advisory']}")
    print("=" * 70)


if __name__ == "__main__":
    main()
