#!/usr/bin/env python3
"""
scripts/train_all.py - AgriSense Master Training Script

Usage:
  python scripts/train_all.py

Executes the complete machine learning workflow:
  1. Generate 10,000 unique, agriculturally realistic records
  2. Validate dataset
  3. Preprocess and split into 70% Train, 15% Val, 15% Test
  4. Train and compare models (Random Forest, HistGradientBoosting, XGBoost, etc.)
  5. Select best models based on validation performance
  6. Evaluate on untouched test data
  7. Save trained models, preprocessor, and metrics
  8. Print final training report
"""

import os
import sys

# Ensure repository root is in python path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from ml.train_all import run_all

if __name__ == "__main__":
    count = 10000
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    run_all(target_count=count)
