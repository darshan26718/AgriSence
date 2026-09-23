"""
data_store.py - Persistent Disk Storage and CSV Ingestion Engine for AgriSense
Reads and writes to data/db_store.json and dataset/crop_health.csv.
"""

import os
import json
import csv
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(WORKSPACE_ROOT, "data")
DB_FILE = os.path.join(DATA_DIR, "db_store.json")
DATASET_DIR = os.path.join(WORKSPACE_ROOT, "dataset")
DATASET_FILE = os.path.join(DATASET_DIR, "crop_health.csv")


class DataStore:
    def __init__(self):
        self.data: Dict[str, Any] = {
            "fields": [],
            "detections": [],
            "radarReports": [],
            "subscribers": [],
            "inspections": [],
            "logbook": [],
        }
        self.cached_datasets: Dict[str, List[Dict[str, Any]]] = {}
        self.cached_dataset: Optional[List[Dict[str, Any]]] = None
        self.load()

    def load(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    for key in self.data:
                        if key in content:
                            self.data[key] = content[key]
                print(f"[Python DataStore] Loaded db_store.json with {len(self.data.get('fields', []))} fields.")
                return
            except Exception as e:
                print(f"[Python DataStore] Error reading db_store.json: {e}")

        # Seed defaults if file doesn't exist
        self.seed_defaults()
        self.save()

    def save(self):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Python DataStore] Error writing db_store.json: {e}")

    def seed_defaults(self):
        now_iso = datetime.utcnow().isoformat() + "Z"
        self.data["radarReports"] = [
            {
                "id": "REP-101",
                "village": "Sector 1 (North Farms)",
                "pest": "Pink Bollworm",
                "severity": "high",
                "timestamp": now_iso,
                "reportedBy": "Farmer Association (Sector 1)",
                "notes": "Rosette flowers observed, 12% boll infestation detected",
            },
            {
                "id": "REP-102",
                "village": "Sector 2 (Central Plains)",
                "pest": "Soybean Stem Borer",
                "severity": "med",
                "timestamp": now_iso,
                "reportedBy": "Field Scout (Central)",
                "notes": "Wilting of top leaves on JS 335 soybean",
            },
            {
                "id": "REP-103",
                "village": "Sector 3 (Eastern Belt)",
                "pest": "Citrus Gummosis",
                "severity": "med",
                "timestamp": now_iso,
                "reportedBy": "Orchard Manager",
                "notes": "Gum exudation on sweet orange bark after humid spell",
            },
        ]
        self.data["subscribers"] = [
            {
                "id": "SUB-1",
                "phone": "9822001122",
                "district": "North Sector",
                "subscribedAt": now_iso,
                "alertTypes": ["pest_spore", "weather", "gov_advisory"],
            },
            {
                "id": "SUB-2",
                "phone": "9420112233",
                "district": "Central Sector",
                "subscribedAt": now_iso,
                "alertTypes": ["pest_spore", "gov_advisory"],
            },
        ]
        self.data["inspections"] = [
            {
                "id": "INSP-8821",
                "officerName": "Dr. Gajanan Deshmukh",
                "crop": "Cotton (BT)",
                "farmerName": "Ramesh Patil",
                "village": "Sector 1 (North Farms)",
                "preferredDate": "2024-09-22",
                "status": "Confirmed",
                "bookedAt": now_iso,
            }
        ]
        self.data["logbook"] = [
            {
                "id": "LOG-AGRI-8829",
                "timestamp": now_iso,
                "crop": "Cotton (Bollgard II)",
                "issue": "Pink Bollworm (Stage 2 - Moderate)",
                "severity": "Moderate",
                "actionTaken": "Applied Neem Oil 10,000 PPM (5 ml/L) & installed 5 pheromone traps",
                "treatmentType": "organic",
                "cibrcCertified": True,
            }
        ]

    @staticmethod
    def _clean_val(v: Any) -> str:
        if v is None:
            return ""
        if isinstance(v, list):
            return ", ".join(str(item).strip() for item in v if item is not None).strip()
        if isinstance(v, str):
            return v.strip()
        return str(v).strip()

    @staticmethod
    def _convert_type(val: str) -> Any:
        if not val:
            return ""
        try:
            if "." in val:
                return float(val)
            return int(val)
        except ValueError:
            return val

    def load_crop_health_records(self) -> List[Dict[str, Any]]:
        if self.cached_dataset is not None:
            return self.cached_dataset

        records = []
        if os.path.exists(DATASET_FILE):
            try:
                with open(DATASET_FILE, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    fieldnames = reader.fieldnames or []
                    for idx, row in enumerate(reader):
                        parsed_row: Dict[str, Any] = {"id": f"REC-{idx + 1}"}
                        extra_vals = row.pop(None, None)
                        for k, v in row.items():
                            if k is None:
                                continue
                            key_clean = str(k).strip()
                            val_clean = self._clean_val(v)
                            parsed_row[key_clean] = self._convert_type(val_clean)

                        if extra_vals and fieldnames:
                            last_col = str(fieldnames[-1]).strip()
                            if last_col in parsed_row:
                                extra_str = ", ".join(str(x).strip() for x in extra_vals if x is not None)
                                parsed_row[last_col] = f"{parsed_row[last_col]}, {extra_str}".strip()

                        records.append(parsed_row)
                self.cached_dataset = records
                return records
            except Exception as e:
                print(f"[Python DataStore] CSV parsing error: {e}")

        # Fallback dummy sample
        return [
            {
                "id": "REC-1",
                "crop": "Cotton",
                "pest": "Pink Bollworm",
                "disease": "None",
                "crop_health_score": 68,
                "risk_level": "HIGH",
                "severity": "Moderate",
            },
            {
                "id": "REC-2",
                "crop": "Soybean",
                "pest": "None",
                "disease": "Soybean Rust",
                "crop_health_score": 55,
                "risk_level": "HIGH",
                "severity": "Critical",
            },
        ]

    def list_available_datasets(self) -> List[Dict[str, Any]]:
        metadata_map = {
            "crop_health.csv": {
                "id": "crop_health",
                "title": "Crop Health & Infestation Records",
                "description": "Multi-season crop health monitoring data, disease/pest probabilities, environmental metrics, and instant corrective actions.",
                "category": "Field Monitoring",
            },
            "crop_disease.csv": {
                "id": "crop_disease",
                "title": "Crop Disease & Pathogen Knowledge Base",
                "description": "Comprehensive plant pathology repository including fungal, bacterial, viral, and oomycete pathogens, symptoms, and bio/chemical controls.",
                "category": "Plant Pathology",
            },
            "pest_dataset.csv": {
                "id": "pest_dataset",
                "title": "Agricultural Pests & Economic Thresholds (ETL)",
                "description": "Detailed pest life cycles, damaging stages, economic threshold levels (ETL), pheromone monitoring, and integrated pest management (IPM) protocols.",
                "category": "Entomology & IPM",
            },
            "weather_dataset.csv": {
                "id": "weather_dataset",
                "title": "Microclimate Weather & Pathogen Spore Risk",
                "description": "Zone-wise ambient temperature, relative humidity, rainfall, leaf wetness hours, and forecast pathogen outbreak alert levels.",
                "category": "Agrometeorology",
            },
            "management_recommendations.csv": {
                "id": "management_recommendations",
                "title": "Smart Management & Cultural Solutions",
                "description": "Verified immediate physical, cultural, biological, and agronomic action protocols for urgent crop stress alleviation.",
                "category": "Agronomy Protocols",
            },
            "pesticides_cibrc_dataset.csv": {
                "id": "pesticides_cibrc",
                "title": "CIBRC Certified Agrochemicals & Bio-Pesticides",
                "description": "Official Central Insecticides Board registered molecules, precise dosage per liter/acre, toxicity color triangles, and Pre-Harvest Intervals (PHI).",
                "category": "Certified Chemical Advisory",
            },
            "soil_nutrients_dataset.csv": {
                "id": "soil_nutrients",
                "title": "Soil Profiles, Fertility & Fertilizer Plans",
                "description": "Soil types, pH limits, organic carbon, primary NPK levels, micronutrients (Zn, Fe, B), and targeted deficiency correction guidelines.",
                "category": "Soil Science",
            },
            "crop_calendar_dataset.csv": {
                "id": "crop_calendar",
                "title": "Crop Phenology & Seasonal Agronomic Calendar",
                "description": "Optimal sowing windows, growing degree days (GDD), critical developmental stages, vulnerability windows, and seasonal milestones.",
                "category": "Crop Phenology",
            },
            "irrigation_water_req_dataset.csv": {
                "id": "irrigation_water_req",
                "title": "Precision Irrigation & Water Requirements",
                "description": "Crop-specific total water need (mm), daily evapotranspiration (ETc), moisture depletion triggers, and smart water conservation strategies.",
                "category": "Water & Irrigation",
            },
            "market_msp_mandi_dataset.csv": {
                "id": "market_msp_mandi",
                "title": "Mandi Prices, MSP & Post-Harvest Storage",
                "description": "Minimum Support Price (MSP) benchmarks, modal market prices, harvest peak windows, safe storage moisture thresholds, and value addition.",
                "category": "Agri-Economics",
            },
            "crop_recommendation.csv": {
                "id": "crop_recommendation",
                "title": "Soil Nutrients & Precision Crop Recommendation Model Dataset",
                "description": "2,200 multi-parameter field records covering Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, pH, and Rainfall across 22 major crop species.",
                "category": "Precision Soil & Crop Recommendation",
            },
        }

        results = []
        if os.path.exists(DATASET_DIR):
            for filename in sorted(os.listdir(DATASET_DIR)):
                if filename.endswith(".csv"):
                    filepath = os.path.join(DATASET_DIR, filename)
                    size_bytes = os.path.getsize(filepath)
                    meta = metadata_map.get(
                        filename,
                        {
                            "id": filename.replace(".csv", ""),
                            "title": filename.replace("_", " ").replace(".csv", "").title(),
                            "description": "Agricultural data table in CSV format.",
                            "category": "General Agronomy",
                        },
                    )

                    # Quick count of rows and columns
                    row_count = 0
                    columns: List[str] = []
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            reader = csv.reader(f)
                            header = next(reader, None)
                            if header:
                                columns = [h.strip() for h in header]
                            for _ in reader:
                                row_count += 1
                    except Exception:
                        pass

                    results.append(
                        {
                            "id": meta["id"],
                            "filename": filename,
                            "title": meta["title"],
                            "description": meta["description"],
                            "category": meta["category"],
                            "rowCount": row_count,
                            "columnCount": len(columns),
                            "columns": columns,
                            "fileSizeBytes": size_bytes,
                        }
                    )
        return results

    def load_named_dataset(self, dataset_name: str) -> List[Dict[str, Any]]:
        clean_name = dataset_name.replace(".csv", "").strip()

        if clean_name in self.cached_datasets:
            return self.cached_datasets[clean_name]

        candidates = [
            f"{clean_name}.csv",
            f"{clean_name}_dataset.csv",
        ]
        if clean_name.endswith("_dataset"):
            candidates.append(f"{clean_name[:-8]}.csv")

        filepath = None
        filename = f"{clean_name}.csv"
        for cand in candidates:
            cand_path = os.path.join(DATASET_DIR, cand)
            if os.path.exists(cand_path):
                filepath = cand_path
                filename = cand
                break

        records = []
        if filepath and os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    fieldnames = reader.fieldnames or []
                    for idx, row in enumerate(reader):
                        parsed_row: Dict[str, Any] = {"_row_id": idx + 1}
                        extra_vals = row.pop(None, None)
                        for k, v in row.items():
                            if k is None:
                                continue
                            key_clean = str(k).strip()
                            val_clean = self._clean_val(v)
                            parsed_row[key_clean] = self._convert_type(val_clean)

                        if extra_vals and fieldnames:
                            last_col = str(fieldnames[-1]).strip()
                            if last_col in parsed_row:
                                extra_str = ", ".join(str(x).strip() for x in extra_vals if x is not None)
                                parsed_row[last_col] = f"{parsed_row[last_col]}, {extra_str}".strip()

                        records.append(parsed_row)
                self.cached_datasets[clean_name] = records
                return records
            except Exception as e:
                print(f"[Python DataStore] Error reading {filename}: {e}")
        return []


# Singleton instance
store = DataStore()
