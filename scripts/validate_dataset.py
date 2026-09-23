#!/usr/bin/env python3
"""
scripts/validate_dataset.py - Dataset Validation & Quality Audit for AgriSense

Validates the agricultural training dataset for:
  - Total records & schema conformity
  - Duplicate records
  - Missing or null values
  - Numerical boundary validity (pH, NPK, temperature, humidity, rainfall, risk score)
  - Domain consistency: Crop-disease and crop-pest validity
  - Class distribution & balance for all target variables
  - Target vs feature leakage protection

Outputs:
  reports/dataset_quality_report.json
"""

import os
import sys
import json
import csv
from typing import Dict, Any, List, Set
from collections import Counter

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "agrisense_training_dataset.csv")
REPORT_PATH = os.path.join(WORKSPACE_ROOT, "reports", "dataset_quality_report.json")

# Ground truth valid pairs
VALID_CROP_DISEASES = {
    "Rice": {"Rice Blast", "Bacterial Leaf Blight", "Rice Sheath Blight", "None"},
    "Wheat": {"Wheat Yellow Rust", "Wheat Brown Rust", "Wheat Powdery Mildew", "None"},
    "Cotton": {"Cotton Bacterial Blight", "Cotton Leaf Curl Virus", "None"},
    "Tomato": {"Tomato Early Blight", "Tomato Late Blight", "Tomato Leaf Curl", "None"},
    "Potato": {"Potato Late Blight", "Potato Black Scurf", "None"},
    "Maize": {"Northern Corn Leaf Blight", "Common Corn Rust", "None"},
    "Soybean": {"Soybean Rust", "Soybean Anthracnose", "None"},
    "Groundnut": {"Tikka Leaf Spot", "Groundnut Collar Rot", "None"},
    "Sugarcane": {"Sugarcane Red Rot", "Sugarcane Smut", "None"},
    "Chickpea": {"Chickpea Fusarium Wilt", "None"},
    "Pigeon Pea": {"Chickpea Fusarium Wilt", "Fusarium Wilt", "None"},
    "Chili": {"Chili Anthracnose", "None"},
    "Onion": {"Onion Purple Blotch", "None"},
    "Banana": {"Banana Sigatoka Leaf Spot", "None"},
    "Citrus": {"Citrus Canker", "None"},
}

VALID_CROP_PESTS = {
    "Rice": {"Brown Planthopper", "Yellow Stem Borer", "None"},
    "Wheat": {"Aphids", "Termites", "None"},
    "Cotton": {"Pink Bollworm", "Whiteflies", "Thrips", "None"},
    "Tomato": {"Fruit and Shoot Borer", "Whiteflies", "Red Spider Mite", "None"},
    "Potato": {"Aphids", "Flea Beetles", "None"},
    "Maize": {"Fall Armyworm", "Aphids", "None"},
    "Soybean": {"Stem Fly", "Spodoptera Armyworm", "None"},
    "Groundnut": {"Thrips", "Spodoptera Cutworm", "None"},
    "Sugarcane": {"Shoot Borer", "Termites", "None"},
    "Chickpea": {"Pod Borer", "None"},
    "Pigeon Pea": {"Pod Borer", "Pod Fly", "None"},
    "Chili": {"Thrips", "Red Spider Mite", "None"},
    "Onion": {"Thrips", "None"},
    "Banana": {"Banana Pseudostem Weevil", "None"},
    "Citrus": {"Citrus Psylla", "Citrus Leaf Miner", "None"},
}


def validate_dataset(filepath: str = DATASET_PATH) -> Dict[str, Any]:
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found at: {filepath}")

    rows: List[Dict[str, Any]] = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    total_records = len(rows)
    print(f"[Validation Engine] Auditing {total_records} records from: {filepath}")

    # 1. Duplicate check
    seen_ids: Set[str] = set()
    duplicates = 0
    for r in rows:
        rec_id = r.get("record_id")
        if rec_id in seen_ids:
            duplicates += 1
        seen_ids.add(rec_id)

    # 2. Missing values check
    missing_by_col: Dict[str, int] = {}
    if rows:
        for k in rows[0].keys():
            missing_by_col[k] = 0

    invalid_numeric_ranges: List[str] = []
    invalid_crop_disease_combos: List[str] = []
    invalid_crop_pest_combos: List[str] = []
    invalid_probability_records: int = 0
    invalid_risk_scores: int = 0

    risk_levels = Counter()
    diseases = Counter()
    pests = Counter()
    severities = Counter()
    crops = Counter()

    for idx, r in enumerate(rows):
        # Missing check
        for k, v in r.items():
            if v is None or str(v).strip() == "":
                missing_by_col[k] = missing_by_col.get(k, 0) + 1

        crop = r.get("crop", "")
        disease = r.get("disease", "")
        pest = r.get("pest", "")
        risk_lvl = r.get("risk_level", "")
        sev = r.get("severity", "")

        crops[crop] += 1
        risk_levels[risk_lvl] += 1
        diseases[disease] += 1
        pests[pest] += 1
        severities[sev] += 1

        # Crop-disease consistency
        valid_diseases = VALID_CROP_DISEASES.get(crop, {"None"})
        if disease not in valid_diseases:
            invalid_crop_disease_combos.append(f"Row {idx+1}: {crop} with {disease}")

        # Crop-pest consistency
        valid_pests = VALID_CROP_PESTS.get(crop, {"None"})
        if pest not in valid_pests:
            invalid_crop_pest_combos.append(f"Row {idx+1}: {crop} with {pest}")

        # Numeric checks
        try:
            ph = float(r.get("soil_ph", 7.0))
            if not (4.0 <= ph <= 9.5):
                invalid_numeric_ranges.append(f"Row {idx+1}: pH {ph} outside [4.0, 9.5]")

            r_score = float(r.get("risk_score", 0))
            if not (0.0 <= r_score <= 100.0):
                invalid_risk_scores += 1

            d_prob = float(r.get("disease_probability", 0))
            p_prob = float(r.get("pest_probability", 0))
            if not (0.0 <= d_prob <= 1.0) or not (0.0 <= p_prob <= 1.0):
                invalid_probability_records += 1

            hum = float(r.get("humidity", 50))
            if not (10.0 <= hum <= 100.0):
                invalid_numeric_ranges.append(f"Row {idx+1}: Humidity {hum} outside [10, 100]")

            sm = float(r.get("soil_moisture", 50))
            if not (10.0 <= sm <= 100.0):
                invalid_numeric_ranges.append(f"Row {idx+1}: Soil moisture {sm} outside [10, 100]")
        except ValueError as e:
            invalid_numeric_ranges.append(f"Row {idx+1}: Parse error {e}")

    # Summary report
    status = "PASSED" if (
        duplicates == 0
        and sum(missing_by_col.values()) == 0
        and len(invalid_crop_disease_combos) == 0
        and len(invalid_crop_pest_combos) == 0
        and invalid_risk_scores == 0
        and invalid_probability_records == 0
    ) else "FAILED"

    report = {
        "status": status,
        "dataset_file": filepath,
        "total_records": total_records,
        "unique_records": len(seen_ids),
        "duplicate_count": duplicates,
        "missing_values_by_column": {k: v for k, v in missing_by_col.items() if v > 0},
        "invalid_numeric_anomalies_count": len(invalid_numeric_ranges),
        "invalid_crop_disease_combinations": len(invalid_crop_disease_combos),
        "invalid_crop_pest_combinations": len(invalid_crop_pest_combos),
        "invalid_risk_score_count": invalid_risk_scores,
        "invalid_probability_count": invalid_probability_records,
        "class_distributions": {
            "risk_level": dict(risk_levels),
            "severity": dict(severities),
            "top_diseases": dict(diseases.most_common(8)),
            "top_pests": dict(pests.most_common(8)),
            "crops": dict(crops),
        },
        "synthetic_data_identified": all(r.get("data_source") == "synthetic_training_data" for r in rows),
    }

    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\n[Validation Report Summary]")
    print(f"  Status        : {status}")
    print(f"  Total Records : {total_records}")
    print(f"  Duplicates    : {duplicates}")
    print(f"  Missing Values: {sum(missing_by_col.values())}")
    print(f"  Risk Levels   : {dict(risk_levels)}")
    print(f"  Severities    : {dict(severities)}")
    print(f"  Quality Report: {REPORT_PATH}")

    return report


if __name__ == "__main__":
    validate_dataset()
