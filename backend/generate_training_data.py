"""
generate_training_data.py - Synthetic Training Data Generator for AgriSense ML Models

Generates realistic feature vectors for disease and pest classification by
building per-class visual-feature distribution profiles from the CSV datasets.
Each disease/pest has a characteristic "visual fingerprint" that maps symptoms
to expected extracted image feature ranges.
"""

import os
import csv
import math
import random
from typing import Dict, Any, List, Tuple

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DISEASE_CSV = os.path.join(WORKSPACE_ROOT, "dataset", "crop_disease.csv")
PEST_CSV = os.path.join(WORKSPACE_ROOT, "dataset", "pest_dataset.csv")


# ---------------------------------------------------------------------------
# Disease Visual Fingerprints
# ---------------------------------------------------------------------------

# Each disease maps to expected ranges of extracted visual features.
# These are derived from the symptom descriptions in crop_disease.csv and
# agronomic knowledge of what each pathology looks like under camera.

DISEASE_FEATURE_PROFILES: Dict[str, Dict[str, Tuple[float, float, float]]] = {
    # Format: feature_name: (mean, std, clip_min_max_range)
    # Features: chlorosis_ratio, necrosis_ratio, spot_density, concentric_ring_score,
    #           water_soaked_score, powdery_score, healthy_green_ratio, brightness,
    #           sharpness, crop_morphology_linear_ratio, temperature_norm, humidity_norm

    "Healthy": {
        "chlorosis_ratio":          (0.02, 0.015, 0.0),
        "necrosis_ratio":           (0.01, 0.008, 0.0),
        "spot_density":             (0.02, 0.015, 0.0),
        "concentric_ring_score":    (0.01, 0.008, 0.0),
        "water_soaked_score":       (0.01, 0.005, 0.0),
        "powdery_score":            (0.01, 0.008, 0.0),
        "healthy_green_ratio":      (0.78, 0.08, 0.0),
        "brightness":               (0.55, 0.10, 0.0),
        "sharpness":                (65.0, 15.0, 0.0),
        "crop_morphology_linear":   (1.0, 0.3, 0.0),
        "temperature_norm":         (0.5, 0.15, 0.0),
        "humidity_norm":            (0.5, 0.15, 0.0),
    },

    "Rice Blast": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.18, 0.06, 0.0),
        "spot_density":             (0.35, 0.10, 0.0),
        "concentric_ring_score":    (0.08, 0.04, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.40, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (55.0, 12.0, 0.0),
        "crop_morphology_linear":   (1.45, 0.15, 0.0),
        "temperature_norm":         (0.55, 0.10, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Bacterial Leaf Blight": {
        "chlorosis_ratio":          (0.20, 0.06, 0.0),
        "necrosis_ratio":           (0.10, 0.04, 0.0),
        "spot_density":             (0.25, 0.08, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.25, 0.08, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.52, 0.08, 0.0),
        "sharpness":                (50.0, 12.0, 0.0),
        "crop_morphology_linear":   (1.50, 0.12, 0.0),
        "temperature_norm":         (0.65, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Rice Sheath Blight": {
        "chlorosis_ratio":          (0.08, 0.03, 0.0),
        "necrosis_ratio":           (0.22, 0.07, 0.0),
        "spot_density":             (0.30, 0.10, 0.0),
        "concentric_ring_score":    (0.05, 0.03, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.38, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (52.0, 12.0, 0.0),
        "crop_morphology_linear":   (1.48, 0.12, 0.0),
        "temperature_norm":         (0.62, 0.08, 0.0),
        "humidity_norm":            (0.90, 0.04, 0.0),
    },

    "Wheat Yellow / Stripe Rust": {
        "chlorosis_ratio":          (0.25, 0.07, 0.0),
        "necrosis_ratio":           (0.08, 0.03, 0.0),
        "spot_density":             (0.20, 0.06, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.05, 0.03, 0.0),
        "healthy_green_ratio":      (0.42, 0.10, 0.0),
        "brightness":               (0.55, 0.08, 0.0),
        "sharpness":                (58.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.55, 0.12, 0.0),
        "temperature_norm":         (0.35, 0.08, 0.0),
        "humidity_norm":            (0.78, 0.08, 0.0),
    },

    "Wheat Brown / Leaf Rust": {
        "chlorosis_ratio":          (0.15, 0.05, 0.0),
        "necrosis_ratio":           (0.15, 0.05, 0.0),
        "spot_density":             (0.35, 0.08, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.04, 0.02, 0.0),
        "healthy_green_ratio":      (0.38, 0.10, 0.0),
        "brightness":               (0.52, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.52, 0.12, 0.0),
        "temperature_norm":         (0.45, 0.08, 0.0),
        "humidity_norm":            (0.80, 0.06, 0.0),
    },

    "Wheat Powdery Mildew": {
        "chlorosis_ratio":          (0.08, 0.03, 0.0),
        "necrosis_ratio":           (0.05, 0.02, 0.0),
        "spot_density":             (0.10, 0.04, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.40, 0.10, 0.0),
        "healthy_green_ratio":      (0.45, 0.10, 0.0),
        "brightness":               (0.62, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.50, 0.12, 0.0),
        "temperature_norm":         (0.38, 0.08, 0.0),
        "humidity_norm":            (0.75, 0.07, 0.0),
    },

    "Tomato Early Blight": {
        "chlorosis_ratio":          (0.22, 0.06, 0.0),
        "necrosis_ratio":           (0.25, 0.07, 0.0),
        "spot_density":             (0.45, 0.10, 0.0),
        "concentric_ring_score":    (0.35, 0.10, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.05, 0.0),
    },

    "Tomato Late Blight": {
        "chlorosis_ratio":          (0.10, 0.04, 0.0),
        "necrosis_ratio":           (0.30, 0.08, 0.0),
        "spot_density":             (0.35, 0.10, 0.0),
        "concentric_ring_score":    (0.05, 0.03, 0.0),
        "water_soaked_score":       (0.35, 0.10, 0.0),
        "powdery_score":            (0.08, 0.04, 0.0),
        "healthy_green_ratio":      (0.25, 0.08, 0.0),
        "brightness":               (0.42, 0.08, 0.0),
        "sharpness":                (48.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.82, 0.12, 0.0),
        "temperature_norm":         (0.40, 0.06, 0.0),
        "humidity_norm":            (0.92, 0.04, 0.0),
    },

    "Tomato Leaf Curl (ToLCV)": {
        "chlorosis_ratio":          (0.30, 0.08, 0.0),
        "necrosis_ratio":           (0.03, 0.02, 0.0),
        "spot_density":             (0.08, 0.03, 0.0),
        "concentric_ring_score":    (0.01, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.45, 0.12, 0.0),
        "brightness":               (0.55, 0.08, 0.0),
        "sharpness":                (45.0, 12.0, 0.0),
        "crop_morphology_linear":   (0.80, 0.15, 0.0),
        "temperature_norm":         (0.68, 0.08, 0.0),
        "humidity_norm":            (0.62, 0.10, 0.0),
    },

    "Potato Late Blight": {
        "chlorosis_ratio":          (0.08, 0.03, 0.0),
        "necrosis_ratio":           (0.32, 0.08, 0.0),
        "spot_density":             (0.30, 0.08, 0.0),
        "concentric_ring_score":    (0.04, 0.02, 0.0),
        "water_soaked_score":       (0.38, 0.10, 0.0),
        "powdery_score":            (0.06, 0.03, 0.0),
        "healthy_green_ratio":      (0.22, 0.08, 0.0),
        "brightness":               (0.40, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.38, 0.06, 0.0),
        "humidity_norm":            (0.90, 0.04, 0.0),
    },

    "Potato Black Scurf": {
        "chlorosis_ratio":          (0.05, 0.02, 0.0),
        "necrosis_ratio":           (0.28, 0.08, 0.0),
        "spot_density":             (0.40, 0.10, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.38, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.88, 0.12, 0.0),
        "temperature_norm":         (0.42, 0.08, 0.0),
        "humidity_norm":            (0.75, 0.08, 0.0),
    },

    "Cotton Bacterial Blight / Blackarm": {
        "chlorosis_ratio":          (0.10, 0.04, 0.0),
        "necrosis_ratio":           (0.20, 0.06, 0.0),
        "spot_density":             (0.30, 0.08, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.22, 0.07, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.38, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.90, 0.12, 0.0),
        "temperature_norm":         (0.65, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Cotton Leaf Curl Virus (CLCuV)": {
        "chlorosis_ratio":          (0.28, 0.08, 0.0),
        "necrosis_ratio":           (0.03, 0.02, 0.0),
        "spot_density":             (0.06, 0.03, 0.0),
        "concentric_ring_score":    (0.01, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.42, 0.12, 0.0),
        "brightness":               (0.55, 0.08, 0.0),
        "sharpness":                (42.0, 12.0, 0.0),
        "crop_morphology_linear":   (0.88, 0.15, 0.0),
        "temperature_norm":         (0.72, 0.08, 0.0),
        "humidity_norm":            (0.65, 0.10, 0.0),
    },

    "Soybean Rust": {
        "chlorosis_ratio":          (0.18, 0.05, 0.0),
        "necrosis_ratio":           (0.12, 0.04, 0.0),
        "spot_density":             (0.30, 0.08, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.03, 0.02, 0.0),
        "powdery_score":            (0.03, 0.02, 0.0),
        "healthy_green_ratio":      (0.40, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.88, 0.12, 0.0),
        "temperature_norm":         (0.50, 0.08, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Soybean Anthracnose / Pod Blight": {
        "chlorosis_ratio":          (0.08, 0.03, 0.0),
        "necrosis_ratio":           (0.25, 0.07, 0.0),
        "spot_density":             (0.35, 0.10, 0.0),
        "concentric_ring_score":    (0.05, 0.03, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.45, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.60, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Groundnut Tikka Leaf Spot (Cercospora)": {
        "chlorosis_ratio":          (0.20, 0.06, 0.0),
        "necrosis_ratio":           (0.18, 0.06, 0.0),
        "spot_density":             (0.42, 0.10, 0.0),
        "concentric_ring_score":    (0.08, 0.04, 0.0),
        "water_soaked_score":       (0.03, 0.02, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.32, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.82, 0.12, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.80, 0.06, 0.0),
    },

    "Groundnut Collar Rot": {
        "chlorosis_ratio":          (0.05, 0.02, 0.0),
        "necrosis_ratio":           (0.35, 0.08, 0.0),
        "spot_density":             (0.25, 0.08, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.10, 0.05, 0.0),
        "powdery_score":            (0.15, 0.06, 0.0),
        "healthy_green_ratio":      (0.28, 0.10, 0.0),
        "brightness":               (0.40, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.82, 0.12, 0.0),
        "temperature_norm":         (0.65, 0.08, 0.0),
        "humidity_norm":            (0.75, 0.08, 0.0),
    },

    "Sugarcane Red Rot": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.30, 0.08, 0.0),
        "spot_density":             (0.20, 0.06, 0.0),
        "concentric_ring_score":    (0.04, 0.02, 0.0),
        "water_soaked_score":       (0.12, 0.05, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.42, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.55, 0.10, 0.0),
        "temperature_norm":         (0.65, 0.06, 0.0),
        "humidity_norm":            (0.85, 0.05, 0.0),
    },

    "Sugarcane Smut": {
        "chlorosis_ratio":          (0.06, 0.03, 0.0),
        "necrosis_ratio":           (0.20, 0.06, 0.0),
        "spot_density":             (0.15, 0.05, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.04, 0.02, 0.0),
        "powdery_score":            (0.25, 0.08, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.38, 0.08, 0.0),
        "sharpness":                (45.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.55, 0.10, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.70, 0.08, 0.0),
    },

    "Citrus Gummosis / Foot Rot": {
        "chlorosis_ratio":          (0.15, 0.05, 0.0),
        "necrosis_ratio":           (0.22, 0.07, 0.0),
        "spot_density":             (0.18, 0.06, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.15, 0.06, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.15, 0.0),
        "temperature_norm":         (0.55, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Citrus Canker": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.15, 0.05, 0.0),
        "spot_density":             (0.45, 0.10, 0.0),
        "concentric_ring_score":    (0.10, 0.05, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.40, 0.10, 0.0),
        "brightness":               (0.52, 0.08, 0.0),
        "sharpness":                (58.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.15, 0.0),
        "temperature_norm":         (0.65, 0.08, 0.0),
        "humidity_norm":            (0.80, 0.06, 0.0),
    },

    "Banana Sigatoka Leaf Spot": {
        "chlorosis_ratio":          (0.15, 0.05, 0.0),
        "necrosis_ratio":           (0.22, 0.06, 0.0),
        "spot_density":             (0.38, 0.10, 0.0),
        "concentric_ring_score":    (0.06, 0.03, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.20, 0.15, 0.0),
        "temperature_norm":         (0.60, 0.08, 0.0),
        "humidity_norm":            (0.90, 0.04, 0.0),
    },

    "Banana Fusarium Wilt (Panama)": {
        "chlorosis_ratio":          (0.25, 0.07, 0.0),
        "necrosis_ratio":           (0.18, 0.06, 0.0),
        "spot_density":             (0.15, 0.05, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.45, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.18, 0.15, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.75, 0.08, 0.0),
    },

    "Onion Purple Blotch": {
        "chlorosis_ratio":          (0.10, 0.04, 0.0),
        "necrosis_ratio":           (0.20, 0.06, 0.0),
        "spot_density":             (0.30, 0.08, 0.0),
        "concentric_ring_score":    (0.12, 0.05, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.38, 0.10, 0.0),
        "brightness":               (0.42, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.40, 0.12, 0.0),
        "temperature_norm":         (0.52, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Chili Anthracnose / Dieback": {
        "chlorosis_ratio":          (0.08, 0.03, 0.0),
        "necrosis_ratio":           (0.28, 0.08, 0.0),
        "spot_density":             (0.35, 0.10, 0.0),
        "concentric_ring_score":    (0.08, 0.04, 0.0),
        "water_soaked_score":       (0.06, 0.03, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.32, 0.10, 0.0),
        "brightness":               (0.45, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.82, 0.12, 0.0),
        "temperature_norm":         (0.60, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Chickpea Fusarium Wilt": {
        "chlorosis_ratio":          (0.22, 0.06, 0.0),
        "necrosis_ratio":           (0.15, 0.05, 0.0),
        "spot_density":             (0.12, 0.04, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.52, 0.08, 0.0),
        "humidity_norm":            (0.55, 0.08, 0.0),
    },

    "Northern Corn Leaf Blight": {
        "chlorosis_ratio":          (0.14, 0.04, 0.0),
        "necrosis_ratio":           (0.24, 0.06, 0.0),
        "spot_density":             (0.26, 0.08, 0.0),
        "concentric_ring_score":    (0.04, 0.02, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.38, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.42, 0.12, 0.0),
        "temperature_norm":         (0.52, 0.08, 0.0),
        "humidity_norm":            (0.90, 0.04, 0.0),
    },

    "Common Corn Rust": {
        "chlorosis_ratio":          (0.18, 0.05, 0.0),
        "necrosis_ratio":           (0.12, 0.04, 0.0),
        "spot_density":             (0.40, 0.10, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.22, 0.06, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.52, 0.08, 0.0),
        "sharpness":                (54.0, 10.0, 0.0),
        "crop_morphology_linear":   (1.45, 0.12, 0.0),
        "temperature_norm":         (0.48, 0.08, 0.0),
        "humidity_norm":            (0.85, 0.06, 0.0),
    },

    "Mango Anthracnose": {
        "chlorosis_ratio":          (0.10, 0.04, 0.0),
        "necrosis_ratio":           (0.28, 0.07, 0.0),
        "spot_density":             (0.32, 0.09, 0.0),
        "concentric_ring_score":    (0.05, 0.02, 0.0),
        "water_soaked_score":       (0.08, 0.04, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.36, 0.10, 0.0),
        "brightness":               (0.44, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.75, 0.12, 0.0),
        "temperature_norm":         (0.60, 0.08, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Mango Powdery Mildew": {
        "chlorosis_ratio":          (0.14, 0.05, 0.0),
        "necrosis_ratio":           (0.04, 0.02, 0.0),
        "spot_density":             (0.15, 0.05, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.45, 0.10, 0.0),
        "healthy_green_ratio":      (0.42, 0.10, 0.0),
        "brightness":               (0.58, 0.08, 0.0),
        "sharpness":                (48.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.78, 0.12, 0.0),
        "temperature_norm":         (0.48, 0.08, 0.0),
        "humidity_norm":            (0.70, 0.08, 0.0),
    },

    "Grape Downy Mildew": {
        "chlorosis_ratio":          (0.28, 0.08, 0.0),
        "necrosis_ratio":           (0.10, 0.04, 0.0),
        "spot_density":             (0.25, 0.08, 0.0),
        "concentric_ring_score":    (0.03, 0.02, 0.0),
        "water_soaked_score":       (0.15, 0.05, 0.0),
        "powdery_score":            (0.35, 0.09, 0.0),
        "healthy_green_ratio":      (0.32, 0.10, 0.0),
        "brightness":               (0.54, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.70, 0.12, 0.0),
        "temperature_norm":         (0.50, 0.08, 0.0),
        "humidity_norm":            (0.92, 0.04, 0.0),
    },

    "Grape Black Rot": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.25, 0.07, 0.0),
        "spot_density":             (0.30, 0.08, 0.0),
        "concentric_ring_score":    (0.14, 0.05, 0.0),
        "water_soaked_score":       (0.04, 0.02, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.35, 0.10, 0.0),
        "brightness":               (0.42, 0.08, 0.0),
        "sharpness":                (56.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.72, 0.12, 0.0),
        "temperature_norm":         (0.56, 0.08, 0.0),
        "humidity_norm":            (0.82, 0.06, 0.0),
    },

    "Okra Yellow Vein Mosaic Virus (YVMV)": {
        "chlorosis_ratio":          (0.42, 0.08, 0.0),
        "necrosis_ratio":           (0.03, 0.02, 0.0),
        "spot_density":             (0.05, 0.03, 0.0),
        "concentric_ring_score":    (0.01, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.58, 0.08, 0.0),
        "sharpness":                (48.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.80, 0.12, 0.0),
        "temperature_norm":         (0.68, 0.08, 0.0),
        "humidity_norm":            (0.70, 0.08, 0.0),
    },

    "Okra Cercospora Leaf Spot": {
        "chlorosis_ratio":          (0.15, 0.05, 0.0),
        "necrosis_ratio":           (0.22, 0.06, 0.0),
        "spot_density":             (0.38, 0.10, 0.0),
        "concentric_ring_score":    (0.06, 0.03, 0.0),
        "water_soaked_score":       (0.04, 0.02, 0.0),
        "powdery_score":            (0.02, 0.01, 0.0),
        "healthy_green_ratio":      (0.34, 0.10, 0.0),
        "brightness":               (0.44, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.82, 0.12, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Brinjal Phomopsis Blight": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.26, 0.07, 0.0),
        "spot_density":             (0.28, 0.08, 0.0),
        "concentric_ring_score":    (0.16, 0.05, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.32, 0.10, 0.0),
        "brightness":               (0.45, 0.08, 0.0),
        "sharpness":                (54.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.78, 0.12, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.82, 0.06, 0.0),
    },

    "Brinjal Little Leaf": {
        "chlorosis_ratio":          (0.25, 0.07, 0.0),
        "necrosis_ratio":           (0.02, 0.01, 0.0),
        "spot_density":             (0.03, 0.02, 0.0),
        "concentric_ring_score":    (0.01, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.45, 0.10, 0.0),
        "brightness":               (0.52, 0.08, 0.0),
        "sharpness":                (45.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.75, 0.12, 0.0),
        "temperature_norm":         (0.62, 0.08, 0.0),
        "humidity_norm":            (0.70, 0.08, 0.0),
    },

    "Mustard White Rust / Blister": {
        "chlorosis_ratio":          (0.18, 0.06, 0.0),
        "necrosis_ratio":           (0.08, 0.03, 0.0),
        "spot_density":             (0.35, 0.09, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.03, 0.02, 0.0),
        "powdery_score":            (0.38, 0.09, 0.0),
        "healthy_green_ratio":      (0.36, 0.10, 0.0),
        "brightness":               (0.56, 0.08, 0.0),
        "sharpness":                (52.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.38, 0.08, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Mustard Alternaria Leaf Blight": {
        "chlorosis_ratio":          (0.16, 0.05, 0.0),
        "necrosis_ratio":           (0.25, 0.07, 0.0),
        "spot_density":             (0.32, 0.08, 0.0),
        "concentric_ring_score":    (0.18, 0.05, 0.0),
        "water_soaked_score":       (0.04, 0.02, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.32, 0.10, 0.0),
        "brightness":               (0.44, 0.08, 0.0),
        "sharpness":                (55.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.86, 0.12, 0.0),
        "temperature_norm":         (0.45, 0.08, 0.0),
        "humidity_norm":            (0.80, 0.06, 0.0),
    },

    "Cabbage Black Rot": {
        "chlorosis_ratio":          (0.30, 0.08, 0.0),
        "necrosis_ratio":           (0.20, 0.06, 0.0),
        "spot_density":             (0.18, 0.06, 0.0),
        "concentric_ring_score":    (0.02, 0.01, 0.0),
        "water_soaked_score":       (0.20, 0.06, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.30, 0.10, 0.0),
        "brightness":               (0.48, 0.08, 0.0),
        "sharpness":                (50.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.65, 0.12, 0.0),
        "temperature_norm":         (0.56, 0.08, 0.0),
        "humidity_norm":            (0.90, 0.04, 0.0),
    },

    "Cabbage Alternaria Leaf Spot": {
        "chlorosis_ratio":          (0.12, 0.04, 0.0),
        "necrosis_ratio":           (0.22, 0.06, 0.0),
        "spot_density":             (0.28, 0.08, 0.0),
        "concentric_ring_score":    (0.15, 0.05, 0.0),
        "water_soaked_score":       (0.05, 0.03, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.36, 0.10, 0.0),
        "brightness":               (0.44, 0.08, 0.0),
        "sharpness":                (53.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.68, 0.12, 0.0),
        "temperature_norm":         (0.48, 0.08, 0.0),
        "humidity_norm":            (0.88, 0.05, 0.0),
    },

    "Pigeon Pea Sterility Mosaic Disease": {
        "chlorosis_ratio":          (0.28, 0.07, 0.0),
        "necrosis_ratio":           (0.03, 0.02, 0.0),
        "spot_density":             (0.04, 0.02, 0.0),
        "concentric_ring_score":    (0.01, 0.01, 0.0),
        "water_soaked_score":       (0.02, 0.01, 0.0),
        "powdery_score":            (0.01, 0.01, 0.0),
        "healthy_green_ratio":      (0.40, 0.10, 0.0),
        "brightness":               (0.50, 0.08, 0.0),
        "sharpness":                (48.0, 10.0, 0.0),
        "crop_morphology_linear":   (0.85, 0.12, 0.0),
        "temperature_norm":         (0.58, 0.08, 0.0),
        "humidity_norm":            (0.70, 0.08, 0.0),
    },
}


# ---------------------------------------------------------------------------
# Pest Damage Fingerprints
# ---------------------------------------------------------------------------

PEST_FEATURE_PROFILES: Dict[str, Dict[str, Tuple[float, float, float]]] = {
    # Features: bore_hole_dark_spots, chewing_defoliation, hopperburn_bronzing,
    #           silken_webbing, honeydew_sooty, scorched_ratio, healthy_ratio,
    #           crop_id_norm, brightness, contrast

    "Pink Bollworm": {
        "bore_hole_dark_spots":    (0.35, 0.10, 0.0),
        "chewing_defoliation":     (0.08, 0.04, 0.0),
        "hopperburn_bronzing":     (0.03, 0.02, 0.0),
        "silken_webbing":          (0.05, 0.03, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.04, 0.02, 0.0),
        "healthy_ratio":           (0.42, 0.10, 0.0),
        "crop_id_norm":            (0.50, 0.05, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.55, 0.10, 0.0),
    },

    "Fall Armyworm (FAW)": {
        "bore_hole_dark_spots":    (0.10, 0.05, 0.0),
        "chewing_defoliation":     (0.40, 0.10, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.03, 0.02, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.35, 0.10, 0.0),
        "crop_id_norm":            (0.30, 0.08, 0.0),
        "brightness":              (0.50, 0.08, 0.0),
        "contrast":                (0.60, 0.10, 0.0),
    },

    "Brown Planthopper (BPH)": {
        "bore_hole_dark_spots":    (0.05, 0.03, 0.0),
        "chewing_defoliation":     (0.05, 0.03, 0.0),
        "hopperburn_bronzing":     (0.42, 0.10, 0.0),
        "silken_webbing":          (0.02, 0.01, 0.0),
        "honeydew_sooty":          (0.12, 0.05, 0.0),
        "scorched_ratio":          (0.30, 0.08, 0.0),
        "healthy_ratio":           (0.25, 0.08, 0.0),
        "crop_id_norm":            (0.15, 0.05, 0.0),
        "brightness":              (0.45, 0.08, 0.0),
        "contrast":                (0.50, 0.10, 0.0),
    },

    "Whiteflies": {
        "bore_hole_dark_spots":    (0.02, 0.01, 0.0),
        "chewing_defoliation":     (0.05, 0.03, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.20, 0.08, 0.0),
        "honeydew_sooty":          (0.30, 0.08, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.40, 0.10, 0.0),
        "crop_id_norm":            (0.45, 0.10, 0.0),
        "brightness":              (0.52, 0.08, 0.0),
        "contrast":                (0.45, 0.10, 0.0),
    },

    "Yellow Stem Borer": {
        "bore_hole_dark_spots":    (0.25, 0.08, 0.0),
        "chewing_defoliation":     (0.12, 0.05, 0.0),
        "hopperburn_bronzing":     (0.08, 0.04, 0.0),
        "silken_webbing":          (0.03, 0.02, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.10, 0.05, 0.0),
        "healthy_ratio":           (0.38, 0.10, 0.0),
        "crop_id_norm":            (0.15, 0.05, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.52, 0.10, 0.0),
    },

    "Aphids": {
        "bore_hole_dark_spots":    (0.02, 0.01, 0.0),
        "chewing_defoliation":     (0.08, 0.04, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.08, 0.04, 0.0),
        "honeydew_sooty":          (0.35, 0.10, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.45, 0.10, 0.0),
        "crop_id_norm":            (0.40, 0.12, 0.0),
        "brightness":              (0.50, 0.08, 0.0),
        "contrast":                (0.42, 0.10, 0.0),
    },

    "Thrips": {
        "bore_hole_dark_spots":    (0.03, 0.02, 0.0),
        "chewing_defoliation":     (0.10, 0.05, 0.0),
        "hopperburn_bronzing":     (0.20, 0.08, 0.0),
        "silken_webbing":          (0.15, 0.06, 0.0),
        "honeydew_sooty":          (0.05, 0.03, 0.0),
        "scorched_ratio":          (0.12, 0.05, 0.0),
        "healthy_ratio":           (0.42, 0.10, 0.0),
        "crop_id_norm":            (0.45, 0.10, 0.0),
        "brightness":              (0.55, 0.08, 0.0),
        "contrast":                (0.48, 0.10, 0.0),
    },

    "Fruit and Shoot Borer (Helicoverpa / Leucinodes)": {
        "bore_hole_dark_spots":    (0.30, 0.08, 0.0),
        "chewing_defoliation":     (0.18, 0.06, 0.0),
        "hopperburn_bronzing":     (0.03, 0.02, 0.0),
        "silken_webbing":          (0.05, 0.03, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.08, 0.04, 0.0),
        "healthy_ratio":           (0.38, 0.10, 0.0),
        "crop_id_norm":            (0.55, 0.10, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.55, 0.10, 0.0),
    },

    "Flea Beetles & Blister Beetles": {
        "bore_hole_dark_spots":    (0.15, 0.06, 0.0),
        "chewing_defoliation":     (0.35, 0.10, 0.0),
        "hopperburn_bronzing":     (0.03, 0.02, 0.0),
        "silken_webbing":          (0.02, 0.01, 0.0),
        "honeydew_sooty":          (0.01, 0.01, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.38, 0.10, 0.0),
        "crop_id_norm":            (0.50, 0.10, 0.0),
        "brightness":              (0.52, 0.08, 0.0),
        "contrast":                (0.58, 0.10, 0.0),
    },

    "Stem Fly": {
        "bore_hole_dark_spots":    (0.22, 0.07, 0.0),
        "chewing_defoliation":     (0.10, 0.05, 0.0),
        "hopperburn_bronzing":     (0.08, 0.04, 0.0),
        "silken_webbing":          (0.02, 0.01, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.12, 0.05, 0.0),
        "healthy_ratio":           (0.35, 0.10, 0.0),
        "crop_id_norm":            (0.35, 0.08, 0.0),
        "brightness":              (0.45, 0.08, 0.0),
        "contrast":                (0.50, 0.10, 0.0),
    },

    "Red Spider Mite": {
        "bore_hole_dark_spots":    (0.03, 0.02, 0.0),
        "chewing_defoliation":     (0.05, 0.03, 0.0),
        "hopperburn_bronzing":     (0.15, 0.06, 0.0),
        "silken_webbing":          (0.40, 0.10, 0.0),
        "honeydew_sooty":          (0.03, 0.02, 0.0),
        "scorched_ratio":          (0.10, 0.05, 0.0),
        "healthy_ratio":           (0.35, 0.10, 0.0),
        "crop_id_norm":            (0.50, 0.10, 0.0),
        "brightness":              (0.50, 0.08, 0.0),
        "contrast":                (0.45, 0.10, 0.0),
    },

    "Shoot Borer of Sugarcane": {
        "bore_hole_dark_spots":    (0.28, 0.08, 0.0),
        "chewing_defoliation":     (0.15, 0.06, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.03, 0.02, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.08, 0.04, 0.0),
        "healthy_ratio":           (0.38, 0.10, 0.0),
        "crop_id_norm":            (0.20, 0.05, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.52, 0.10, 0.0),
    },

    "Citrus Psylla": {
        "bore_hole_dark_spots":    (0.03, 0.02, 0.0),
        "chewing_defoliation":     (0.05, 0.03, 0.0),
        "hopperburn_bronzing":     (0.08, 0.04, 0.0),
        "silken_webbing":          (0.15, 0.06, 0.0),
        "honeydew_sooty":          (0.22, 0.07, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.45, 0.10, 0.0),
        "crop_id_norm":            (0.60, 0.05, 0.0),
        "brightness":              (0.52, 0.08, 0.0),
        "contrast":                (0.45, 0.10, 0.0),
    },

    "Citrus Leaf Miner": {
        "bore_hole_dark_spots":    (0.05, 0.03, 0.0),
        "chewing_defoliation":     (0.12, 0.05, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.25, 0.08, 0.0),
        "honeydew_sooty":          (0.03, 0.02, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.42, 0.10, 0.0),
        "crop_id_norm":            (0.60, 0.05, 0.0),
        "brightness":              (0.55, 0.08, 0.0),
        "contrast":                (0.50, 0.10, 0.0),
    },

    "Mustard Aphid": {
        "bore_hole_dark_spots":    (0.02, 0.01, 0.0),
        "chewing_defoliation":     (0.08, 0.04, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.05, 0.03, 0.0),
        "honeydew_sooty":          (0.38, 0.10, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.40, 0.10, 0.0),
        "crop_id_norm":            (0.70, 0.05, 0.0),
        "brightness":              (0.50, 0.08, 0.0),
        "contrast":                (0.42, 0.10, 0.0),
    },

    "Pod Borer / Pod Fly": {
        "bore_hole_dark_spots":    (0.28, 0.08, 0.0),
        "chewing_defoliation":     (0.15, 0.06, 0.0),
        "hopperburn_bronzing":     (0.03, 0.02, 0.0),
        "silken_webbing":          (0.03, 0.02, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.40, 0.10, 0.0),
        "crop_id_norm":            (0.42, 0.08, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.52, 0.10, 0.0),
    },

    "Spodoptera Cutworm / Armyworm": {
        "bore_hole_dark_spots":    (0.08, 0.04, 0.0),
        "chewing_defoliation":     (0.38, 0.10, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.05, 0.03, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.08, 0.04, 0.0),
        "healthy_ratio":           (0.35, 0.10, 0.0),
        "crop_id_norm":            (0.40, 0.10, 0.0),
        "brightness":              (0.48, 0.08, 0.0),
        "contrast":                (0.55, 0.10, 0.0),
    },

    "Banana Pseudostem Weevil": {
        "bore_hole_dark_spots":    (0.32, 0.08, 0.0),
        "chewing_defoliation":     (0.10, 0.05, 0.0),
        "hopperburn_bronzing":     (0.03, 0.02, 0.0),
        "silken_webbing":          (0.02, 0.01, 0.0),
        "honeydew_sooty":          (0.05, 0.03, 0.0),
        "scorched_ratio":          (0.12, 0.05, 0.0),
        "healthy_ratio":           (0.35, 0.10, 0.0),
        "crop_id_norm":            (0.55, 0.05, 0.0),
        "brightness":              (0.42, 0.08, 0.0),
        "contrast":                (0.50, 0.10, 0.0),
    },

    "Mealybugs": {
        "bore_hole_dark_spots":    (0.02, 0.01, 0.0),
        "chewing_defoliation":     (0.05, 0.03, 0.0),
        "hopperburn_bronzing":     (0.05, 0.03, 0.0),
        "silken_webbing":          (0.35, 0.10, 0.0),
        "honeydew_sooty":          (0.25, 0.08, 0.0),
        "scorched_ratio":          (0.05, 0.03, 0.0),
        "healthy_ratio":           (0.38, 0.10, 0.0),
        "crop_id_norm":            (0.48, 0.10, 0.0),
        "brightness":              (0.55, 0.08, 0.0),
        "contrast":                (0.42, 0.10, 0.0),
    },

    "Termites / White Ants": {
        "bore_hole_dark_spots":    (0.18, 0.07, 0.0),
        "chewing_defoliation":     (0.15, 0.06, 0.0),
        "hopperburn_bronzing":     (0.08, 0.04, 0.0),
        "silken_webbing":          (0.02, 0.01, 0.0),
        "honeydew_sooty":          (0.02, 0.01, 0.0),
        "scorched_ratio":          (0.15, 0.06, 0.0),
        "healthy_ratio":           (0.30, 0.10, 0.0),
        "crop_id_norm":            (0.35, 0.12, 0.0),
        "brightness":              (0.42, 0.08, 0.0),
        "contrast":                (0.48, 0.10, 0.0),
    },
}


# ---------------------------------------------------------------------------
# Feature Names (ordered)
# ---------------------------------------------------------------------------

DISEASE_FEATURE_NAMES = [
    "chlorosis_ratio",
    "necrosis_ratio",
    "spot_density",
    "concentric_ring_score",
    "water_soaked_score",
    "powdery_score",
    "healthy_green_ratio",
    "brightness",
    "sharpness",
    "crop_morphology_linear",
    "temperature_norm",
    "humidity_norm",
]

PEST_FEATURE_NAMES = [
    "bore_hole_dark_spots",
    "chewing_defoliation",
    "hopperburn_bronzing",
    "silken_webbing",
    "honeydew_sooty",
    "scorched_ratio",
    "healthy_ratio",
    "crop_id_norm",
    "brightness",
    "contrast",
]


# ---------------------------------------------------------------------------
# Data Generation
# ---------------------------------------------------------------------------

def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def generate_disease_training_data(
    samples_per_class: int = 5000,
    seed: int = 42,
) -> Tuple[List[List[float]], List[int], List[str]]:
    """
    Generates synthetic training data for disease classification.
    Returns (X, y, class_names) where X is feature matrix, y is class labels (int).
    """
    rng = random.Random(seed)
    class_names = list(DISEASE_FEATURE_PROFILES.keys())
    X: List[List[float]] = []
    y: List[int] = []

    for cls_idx, cls_name in enumerate(class_names):
        profile = DISEASE_FEATURE_PROFILES[cls_name]

        for _ in range(samples_per_class):
            features = []
            for feat_name in DISEASE_FEATURE_NAMES:
                mean, std, _ = profile[feat_name]
                # Generate with Gaussian noise
                value = rng.gauss(mean, std)
                # Clamp to valid ranges
                if feat_name == "sharpness":
                    value = _clamp(value, 5.0, 100.0)
                elif feat_name in ("brightness",):
                    value = _clamp(value, 0.12, 0.95)
                elif feat_name == "crop_morphology_linear":
                    value = _clamp(value, 0.2, 2.5)
                else:
                    value = _clamp(value, 0.0, 1.0)
                features.append(round(value, 4))

            X.append(features)
            y.append(cls_idx)

    # Shuffle
    combined = list(zip(X, y))
    rng.shuffle(combined)
    X, y = zip(*combined)
    return list(X), list(y), class_names


def generate_pest_training_data(
    samples_per_class: int = 3000,
    seed: int = 42,
) -> Tuple[List[List[float]], List[int], List[str]]:
    """
    Generates synthetic training data for pest classification.
    Returns (X, y, class_names) where X is feature matrix, y is class labels (int).
    """
    rng = random.Random(seed)
    class_names = list(PEST_FEATURE_PROFILES.keys())
    X: List[List[float]] = []
    y: List[int] = []

    for cls_idx, cls_name in enumerate(class_names):
        profile = PEST_FEATURE_PROFILES[cls_name]

        for _ in range(samples_per_class):
            features = []
            for feat_name in PEST_FEATURE_NAMES:
                mean, std, _ = profile[feat_name]
                value = rng.gauss(mean, std)
                value = _clamp(value, 0.0, 1.0)
                features.append(round(value, 4))

            X.append(features)
            y.append(cls_idx)

    combined = list(zip(X, y))
    rng.shuffle(combined)
    X, y = zip(*combined)
    return list(X), list(y), class_names
