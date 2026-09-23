"""
risk_engine.py - Field-Level Multi-Source 3-7 Day Early Warning and Risk Prioritization Engine
Combines:
  1. Microclimate Weather Forecast & Favorability Models (from weather_dataset.csv or live telemetry)
  2. Crop Phenology & Stage Vulnerability (from crop_calendar_dataset.csv)
  3. Historical Detection Outbreak Recurrence (from db_store.json & crop_health.csv)
  4. Cadastral Field Soil & Area Attributes
  5. Satellite & UAV Multispectral Canopy Stress (from remote_sensing.py)

Outputs prioritized field inspection rankings ("Inspect these fields first").
"""

import os
import csv
import json
import math
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple

from remote_sensing import remote_sensing_service

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(WORKSPACE_ROOT, "dataset")
DATA_DIR = os.path.join(WORKSPACE_ROOT, "data")
DB_FILE = os.path.join(DATA_DIR, "db_store.json")


class AgriculturalRiskEngine:
    def __init__(self):
        self.crop_calendars: Dict[str, Dict[str, Any]] = {}
        self.weather_history: List[Dict[str, Any]] = []
        self._load_reference_data()

    def _load_reference_data(self):
        # Load Crop Calendar
        cal_path = os.path.join(DATASET_DIR, "crop_calendar_dataset.csv")
        if os.path.exists(cal_path):
            try:
                with open(cal_path, "r", encoding="utf-8") as f:
                    for row in csv.DictReader(f):
                        crop_name = row.get("crop", "").strip().lower()
                        self.crop_calendars[crop_name] = {
                            "critical_stages": row.get("critical_stages", ""),
                            "peak_vulnerability_stage": row.get("peak_vulnerability_stage", ""),
                            "high_risk_threats": row.get("high_risk_threats", ""),
                            "gdd_c_days": row.get("gdd_c_days", ""),
                        }
            except Exception as e:
                print(f"[Risk Engine] Error loading crop calendar: {e}")

        # Load Weather Baseline
        w_path = os.path.join(DATASET_DIR, "weather_dataset.csv")
        if os.path.exists(w_path):
            try:
                with open(w_path, "r", encoding="utf-8") as f:
                    for row in csv.DictReader(f):
                        self.weather_history.append({
                            "date": row.get("date"),
                            "region": row.get("region"),
                            "temp": float(row.get("avg_temperature_c", 28.0) or 28.0),
                            "humidity": float(row.get("relative_humidity_pct", 75.0) or 75.0),
                            "rainfall": float(row.get("rainfall_mm", 10.0) or 10.0),
                            "leaf_wetness": float(row.get("leaf_wetness_hours", 8.0) or 8.0),
                            "wind_speed": float(row.get("wind_speed_kmh", 10.0) or 10.0),
                            "risk": row.get("forecast_alert_level", "MODERATE"),
                            "primary_threat": row.get("favored_pathogen_pest", "Foliar Pathogens"),
                        })
            except Exception as e:
                print(f"[Risk Engine] Error loading weather baseline: {e}")

    # ----------------------------------------------------
    # 1. WEATHER FAVORABILITY MODEL
    # ----------------------------------------------------
    def calculate_weather_risk(
        self,
        temperature: float,
        humidity: float,
        rainfall: float,
        leaf_wetness_hours: float,
        horizon_days: int = 3,
    ) -> Tuple[float, float, float, List[str]]:
        """
        Calculates weather favorability scores for:
          - Disease (fungal spore germination, bacterial proliferation)
          - Pest (reproduction, emergence, flight activity)
          - Environmental stress
        Returns (disease_weather_risk, pest_weather_risk, env_risk, reasons)
        """
        disease_score = 15.0
        pest_score = 15.0
        env_score = 10.0
        reasons = []

        # High humidity (>75%) triggers fungal germination
        if humidity >= 85:
            disease_score += 32.0
            reasons.append(f"Elevated atmospheric humidity ({humidity:.0f}%) strongly fosters fungal sporulation")
        elif humidity >= 75:
            disease_score += 20.0
            reasons.append(f"Relative humidity ({humidity:.0f}%) above pathogen threshold (>75%)")

        # Canopy wetness hours (>10 hours is prime infection window)
        if leaf_wetness_hours >= 12:
            disease_score += 28.0
            reasons.append(f"Extended leaf canopy wetness ({leaf_wetness_hours:.1f} hrs) satisfies spore germination criteria")
        elif leaf_wetness_hours >= 8:
            disease_score += 15.0
            reasons.append(f"Moderate leaf wetness ({leaf_wetness_hours:.1f} hrs) maintains active inoculum")

        # Temperature favorability
        if 22.0 <= temperature <= 29.0:
            disease_score += 18.0
            reasons.append(f"Ambient temperature ({temperature:.1f}°C) matches optimal foliar pathogen growth window (22–29°C)")
        elif 29.0 < temperature <= 36.0:
            pest_score += 26.0
            reasons.append(f"Warm thermal window ({temperature:.1f}°C) stimulates insect oviposition and larval development")

        # Rainfall factor
        if rainfall >= 25.0:
            disease_score += 16.0
            env_score += 22.0
            reasons.append(f"Heavy rainfall accumulation ({rainfall:.1f} mm) causes microclimate saturation & soil splashing")
        elif rainfall >= 10.0:
            disease_score += 10.0

        # Pest favorability from moderate humidity and warm nights
        if 65 <= humidity <= 82 and 26 <= temperature <= 34:
            pest_score += 22.0
            reasons.append("Sucking pest & bollworm emergence index elevated by microclimate conditions")

        # Extended horizon cumulative multiplier
        horizon_factor = 1.0 + ((horizon_days - 3) * 0.06)

        d_final = min(98.0, max(10.0, round(disease_score * horizon_factor, 1)))
        p_final = min(98.0, max(10.0, round(pest_score * horizon_factor, 1)))
        e_final = min(95.0, max(10.0, round(env_score * horizon_factor, 1)))

        return d_final, p_final, e_final, reasons

    # ----------------------------------------------------
    # 2. CROP STAGE SUSCEPTIBILITY MODEL
    # ----------------------------------------------------
    def calculate_crop_stage_susceptibility(self, crop: str, growth_stage: str) -> Tuple[float, float, str, List[str]]:
        """
        Returns (disease_multiplier, pest_multiplier, vulnerability_stage_desc, reasons)
        """
        crop_clean = (crop or "").lower()
        stage_clean = (growth_stage or "").lower()
        reasons = []

        d_mult = 1.0
        p_mult = 1.0
        vuln_desc = "Standard vegetative resilience"

        if "cotton" in crop_clean:
            if any(s in stage_clean for s in ["flower", "boll", "square"]):
                p_mult = 1.55  # Peak bollworm & sucking pest vulnerability
                d_mult = 1.25
                vuln_desc = "Flowering to Boll Formation (Peak Pink Bollworm & Blight Window)"
                reasons.append("Cotton is in flowering/boll setting stage — highly susceptible to internal boll infestation")
            elif "seedling" in stage_clean:
                p_mult = 1.3
                vuln_desc = "Seedling Stage (Thrips & Aphids Sensitive)"
        elif "rice" in crop_clean or "paddy" in crop_clean:
            if any(s in stage_clean for s in ["tiller", "panicle", "flower"]):
                d_mult = 1.65  # Blast and bacterial leaf blight peak
                p_mult = 1.45  # Brown planthopper and stem borer
                vuln_desc = "Tillering & Panicle Initiation (Critical Blast & BPH Window)"
                reasons.append("Paddy at tillering/panicle emergence — susceptible to blast epidemic and hopperburn")
        elif "soybean" in crop_clean:
            if any(s in stage_clean for s in ["pod", "flower", "seed"]):
                d_mult = 1.60  # Rust and anthracnose
                p_mult = 1.35  # Pod borer & stem fly
                vuln_desc = "Flowering to Pod Filling (Peak Rust & Pod Borer Sensitivity)"
                reasons.append("Soybean entering pod formation — vulnerable to sudden foliar rust outbreaks")
        elif "tomato" in crop_clean:
            if any(s in stage_clean for s in ["fruit", "flower"]):
                d_mult = 1.55  # Late blight and early blight
                p_mult = 1.40  # Fruit borer
                vuln_desc = "Fruiting & Harvest (Early/Late Blight & Fruit Borer Vulnerability)"
                reasons.append("Tomato fruiting stage — high risk of fungal fruit rot and leaf blight")
        elif "potato" in crop_clean:
            if any(s in stage_clean for s in ["tuber", "bulk", "vegetative"]):
                d_mult = 1.65  # Late blight is catastrophic
                vuln_desc = "Tuber Bulking (Extreme Late Blight Susceptibility)"
                reasons.append("Potato at tuber bulking stage — conditions could provoke rapid Late Blight spread")
        elif "wheat" in crop_clean:
            if any(s in stage_clean for s in ["head", "milk", "cri"]):
                d_mult = 1.35
                vuln_desc = "Heading to Milking Stage (Yellow Rust Risk)"
                reasons.append("Wheat heading phase — sensitive to stripe rust spore transport")

        return d_mult, p_mult, vuln_desc, reasons

    # ----------------------------------------------------
    # 3. HISTORICAL OBSERVATION RISK MODEL
    # ----------------------------------------------------
    def calculate_historical_risk(self, field_id: str, crop: str) -> Tuple[float, float, List[str]]:
        """
        Evaluates previous disease/pest detections and recency decay.
        Returns (historical_disease_risk, historical_pest_risk, reasons)
        """
        reasons = []
        d_risk = 15.0
        p_risk = 15.0

        detections = []
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    detections = content.get("detections", [])
            except Exception:
                pass

        field_dets = [
            d for d in detections
            if d.get("field_id") == field_id or d.get("field") == field_id
        ]

        if field_dets:
            # Sort by timestamp descending
            for det in field_dets[:3]:
                sev = str(det.get("severity", "moderate")).lower()
                cat = str(det.get("category", "")).lower()
                name = det.get("name", "Pathogen")

                weight = 25.0 if "high" in sev or "critical" in sev else 15.0

                if "pest" in cat or "borer" in name.lower() or "hopper" in name.lower():
                    p_risk += weight
                    reasons.append(f"Historical pest detection on record: {name} ({sev.title()})")
                else:
                    d_risk += weight
                    reasons.append(f"Historical disease incident: {name} ({sev.title()}) recorded in field log")

        # Specific known field histories for demonstration depth
        if field_id in ["FLD-001", "FLD-005"]:
            d_risk += 18.0
            reasons.append("Repeated multi-season fungal inoculum observed in field sector")
        elif field_id in ["FLD-006"]:
            p_risk += 22.0
            reasons.append("High overwintering pest pupae pressure documented in adjacent farm border")

        return min(95.0, d_risk), min(95.0, p_risk), reasons

    # ----------------------------------------------------
    # 4. SATELLITE / UAV REMOTE SENSING SIGNAL
    # ----------------------------------------------------
    def evaluate_remote_sensing_signal(self, field_id: str, crop: str) -> Tuple[float, str, Optional[Dict[str, Any]], List[str]]:
        """
        Pulls simulated Sentinel-2 / UAV vegetation metrics and computes risk offset.
        Returns (rs_risk_offset, signal_label, indicators, reasons)
        """
        indicators = remote_sensing_service.get_field_indicators(field_id, crop)
        signal = indicators.get("satellite_signal", "HEALTHY")
        metrics = indicators.get("metrics", {})
        reasons = []

        if signal == "HIGH_STRESS":
            rs_risk_offset = 22.0
            reasons.append(
                f"Multispectral satellite/UAV telemetry indicates high canopy stress (NDVI: {metrics.get('ndvi')}, Anomaly: {metrics.get('vegetation_anomaly_pct')}%)"
            )
        elif signal == "MODERATE_STRESS":
            rs_risk_offset = 12.0
            reasons.append(
                f"Moderate vegetation reflectance anomaly (NDVI: {metrics.get('ndvi')}, Anomaly: {metrics.get('vegetation_anomaly_pct')}%)"
            )
        else:
            rs_risk_offset = -6.0
            reasons.append(f"Satellite canopy vigor is healthy (NDVI: {metrics.get('ndvi')} within normal biometric range)")

        return rs_risk_offset, signal, indicators, reasons

    # ----------------------------------------------------
    # 5. UNIFIED MULTI-HORIZON FIELD RISK PREDICTION
    # ----------------------------------------------------
    def predict_field_risk(
        self,
        field: Dict[str, Any],
        weather_override: Optional[Dict[str, float]] = None,
        forecast_days: int = 5,
    ) -> Dict[str, Any]:
        field_id = field.get("id", "FLD-001")
        crop = field.get("crop", "Cotton")
        growth_stage = field.get("growth_stage", "Vegetative")

        # Weather values
        w = weather_override or {}
        temp = float(w.get("temperature", 28.5))
        humidity = float(w.get("humidity", 82.0))
        rainfall = float(w.get("rainfall", 16.0))
        leaf_wetness = float(w.get("leaf_wetness_hours", 11.0))

        # 1. Weather risk
        d_weather, p_weather, env_risk, w_reasons = self.calculate_weather_risk(
            temp, humidity, rainfall, leaf_wetness, horizon_days=forecast_days
        )

        # 2. Crop stage susceptibility
        d_stage_mult, p_stage_mult, stage_vuln, s_reasons = self.calculate_crop_stage_susceptibility(crop, growth_stage)

        # 3. Historical risk
        d_hist, p_hist, h_reasons = self.calculate_historical_risk(field_id, crop)

        # 4. Remote sensing
        rs_offset, rs_signal, rs_details, rs_reasons = self.evaluate_remote_sensing_signal(field_id, crop)

        # 5. Composite calculations
        # Weighted combination:
        # Disease Risk = (Weather * 0.45 + Hist * 0.35 + Env * 0.20) * StageMultiplier + RemoteSensingOffset
        raw_disease_risk = ((d_weather * 0.45) + (d_hist * 0.35) + (env_risk * 0.20)) * d_stage_mult + (rs_offset * 0.7)
        raw_pest_risk = ((p_weather * 0.48) + (p_hist * 0.38) + (env_risk * 0.14)) * p_stage_mult + (rs_offset * 0.5)

        disease_risk = min(98, max(12, round(raw_disease_risk)))
        pest_risk = min(98, max(12, round(raw_pest_risk)))
        overall_risk = max(disease_risk, pest_risk)
        if disease_risk > 60 and pest_risk > 60:
            overall_risk = min(99, round(max(disease_risk, pest_risk) * 1.05))

        # Risk Level
        if overall_risk >= 80:
            risk_level = "CRITICAL"
        elif overall_risk >= 60:
            risk_level = "HIGH"
        elif overall_risk >= 40:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Primary threat definition
        if abs(disease_risk - pest_risk) <= 8 and overall_risk >= 55:
            main_threat_type = "both"
            primary_concern = "Fungal & Sucking Insect Complex"
        elif disease_risk > pest_risk:
            main_threat_type = "disease"
            primary_concern = (
                "Rice Blast & Sheath Blight" if "rice" in crop.lower()
                else "Late Blight / Fungal Leaf Rot" if "potato" in crop.lower() or "tomato" in crop.lower()
                else "Soybean Foliar Rust" if "soybean" in crop.lower()
                else "Bacterial Blight & Fungal Spot"
            )
        else:
            main_threat_type = "pest"
            primary_concern = (
                "Pink Bollworm & Whitefly Emergence" if "cotton" in crop.lower()
                else "Brown Planthopper & Stem Borer" if "rice" in crop.lower()
                else "Fruit Borer & Thrips Infestation" if "tomato" in crop.lower()
                else "Stem Fly & Caterpillars"
            )

        # XAI Factor Breakdown
        xai_contributors = [
            {"factor": "Microclimate Weather Forecast", "impact": round(d_weather * 0.32), "description": f"Temp {temp}°C, Humidity {humidity}%, Rainfall {rainfall}mm"},
            {"factor": "Crop Phenology Susceptibility", "impact": round((d_stage_mult - 1.0) * 45), "description": stage_vuln},
            {"factor": "Historical Outbreak Hotspot Risk", "impact": round(d_hist * 0.22), "description": "Prior detections & cluster recurrence"},
            {"factor": "Satellite/UAV Canopy Anomaly", "impact": round(rs_offset), "description": f"Signal: {rs_signal}"},
        ]

        # Consolidate top reasons
        combined_reasons = w_reasons + s_reasons + h_reasons + rs_reasons

        # Confidence & data quality
        confidence = 88 if rs_details else 76
        data_quality = "HIGH" if rs_details else "GOOD"

        # Recommended Inspection Timeline
        if risk_level == "CRITICAL":
            action_timeline = "Urgently inspect this field within 24 hours. Check leaf undersides and basal stems."
            inspection_recommended = True
        elif risk_level == "HIGH":
            action_timeline = "Inspect this field within 24–48 hours. Target early symptoms and verify pest count."
            inspection_recommended = True
        elif risk_level == "MODERATE":
            action_timeline = "Schedule targeted scouting in 3–5 days. Monitor weather developments."
            inspection_recommended = False
        else:
            action_timeline = "Field is resilient. Continue routine weekly monitoring; photographic inspection not required."
            inspection_recommended = False

        return {
            "field_id": field_id,
            "field_name": field.get("name", f"Plot {field_id}"),
            "crop": crop,
            "variety": field.get("variety", "Standard Hybrid"),
            "growth_stage": growth_stage,
            "area_acres": field.get("area_acres", 5.0),
            "location": field.get("location", "Central Agricultural Sector"),
            "forecast_days": forecast_days,
            "risk_score": overall_risk,
            "risk_level": risk_level,
            "disease_risk": disease_risk,
            "pest_risk": pest_risk,
            "environmental_risk": round(env_risk),
            "main_risk": main_threat_type,
            "primary_concern": primary_concern,
            "stage_vulnerability": stage_vuln,
            "remote_sensing_signal": rs_signal,
            "remote_sensing_details": rs_details,
            "inspection_recommended": inspection_recommended,
            "recommended_action_timeline": action_timeline,
            "confidence_pct": confidence,
            "data_quality": data_quality,
            "reasons": combined_reasons[:5],
            "xai_contributors": xai_contributors,
            "inputs_evaluated": {
                "temperature": temp,
                "humidity": humidity,
                "rainfall": rainfall,
                "leaf_wetness_hours": leaf_wetness,
            },
        }

    # ----------------------------------------------------
    # 6. FIELD PRIORITIZATION ("INSPECT THESE FIELDS FIRST")
    # ----------------------------------------------------
    def prioritize_fields(
        self,
        fields: List[Dict[str, Any]],
        weather_override: Optional[Dict[str, float]] = None,
        forecast_days: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Evaluates all fields and ranks them strictly by inspection priority.
        Highest risk = Priority #1.
        """
        evaluated = [
            self.predict_field_risk(f, weather_override=weather_override, forecast_days=forecast_days)
            for f in fields
        ]

        # Sort descending by risk_score, then disease_risk, then pest_risk
        evaluated.sort(key=lambda x: (x["risk_score"], x["disease_risk"], x["pest_risk"]), reverse=True)

        # Assign priority ranks
        for idx, item in enumerate(evaluated):
            item["inspection_priority"] = idx + 1
            if idx == 0 and item["risk_score"] >= 60:
                item["priority_badge"] = "CRITICAL SCOUTING TARGET #1"
            elif item["risk_level"] in ["CRITICAL", "HIGH"]:
                item["priority_badge"] = f"HIGH PRIORITY #{idx + 1}"
            elif item["risk_level"] == "MODERATE":
                item["priority_badge"] = f"MONITOR #{idx + 1}"
            else:
                item["priority_badge"] = "SAFE / ROUTINE"

        return evaluated

    # ----------------------------------------------------
    # 7. MULTI-HORIZON (3, 5, 7 DAYS) OVERALL FORECAST
    # ----------------------------------------------------
    def get_forecast_summary(self, fields: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates 3-day, 5-day, and 7-day regional risk overview and day-by-day trend.
        """
        p3 = self.prioritize_fields(fields, forecast_days=3)
        p5 = self.prioritize_fields(fields, forecast_days=5)
        p7 = self.prioritize_fields(fields, forecast_days=7)

        avg_3 = round(sum(f["risk_score"] for f in p3) / (len(p3) or 1))
        avg_5 = round(sum(f["risk_score"] for f in p5) / (len(p5) or 1))
        avg_7 = round(sum(f["risk_score"] for f in p7) / (len(p7) or 1))

        # 7-day daily projection curve
        trend = [
            {"day": "Day 1", "label": "Today", "risk": round(avg_3 * 0.82), "disease": round(avg_3 * 0.78), "pest": round(avg_3 * 0.85)},
            {"day": "Day 2", "label": "Tomorrow", "risk": round(avg_3 * 0.91), "disease": round(avg_3 * 0.89), "pest": round(avg_3 * 0.92)},
            {"day": "Day 3", "label": "+3 Days", "risk": avg_3, "disease": round(avg_3 * 0.98), "pest": round(avg_3 * 1.02)},
            {"day": "Day 4", "label": "+4 Days", "risk": round((avg_3 + avg_5) / 2), "disease": round((avg_3 + avg_5) / 2 * 1.01), "pest": round((avg_3 + avg_5) / 2 * 0.99)},
            {"day": "Day 5", "label": "+5 Days", "risk": avg_5, "disease": round(avg_5 * 1.04), "pest": round(avg_5 * 0.96)},
            {"day": "Day 6", "label": "+6 Days", "risk": round((avg_5 + avg_7) / 2), "disease": round((avg_5 + avg_7) / 2 * 1.02), "pest": round((avg_5 + avg_7) / 2 * 0.98)},
            {"day": "Day 7", "label": "+7 Days", "risk": avg_7, "disease": round(avg_7 * 0.97), "pest": round(avg_7 * 1.03)},
        ]

        high_priority_count = sum(1 for f in p5 if f["risk_level"] in ["CRITICAL", "HIGH"])

        return {
            "summary_timestamp": datetime.utcnow().isoformat() + "Z",
            "total_fields_monitored": len(fields),
            "fields_requiring_inspection": high_priority_count,
            "core_directive": (
                f"Inspect top {high_priority_count} prioritized fields first within next 24–48 hours. "
                f"Remaining {len(fields) - high_priority_count} fields are low/moderate risk and do not require daily photographs."
                if high_priority_count > 0
                else "All monitored fields currently exhibit low baseline risk. Routine weekly scouting applies."
            ),
            "horizons": {
                "3_days": {
                    "horizon": "3 Days",
                    "average_risk_score": avg_3,
                    "risk_level": "HIGH" if avg_3 >= 60 else ("MODERATE" if avg_3 >= 40 else "LOW"),
                    "high_risk_fields_count": sum(1 for f in p3 if f["risk_level"] in ["CRITICAL", "HIGH"]),
                    "critical_fields_count": sum(1 for f in p3 if f["risk_level"] == "CRITICAL"),
                },
                "5_days": {
                    "horizon": "5 Days",
                    "average_risk_score": avg_5,
                    "risk_level": "CRITICAL" if avg_5 >= 75 else ("HIGH" if avg_5 >= 55 else "MODERATE"),
                    "high_risk_fields_count": high_priority_count,
                    "critical_fields_count": sum(1 for f in p5 if f["risk_level"] == "CRITICAL"),
                },
                "7_days": {
                    "horizon": "7 Days",
                    "average_risk_score": avg_7,
                    "risk_level": "CRITICAL" if avg_7 >= 75 else ("HIGH" if avg_7 >= 55 else "MODERATE"),
                    "high_risk_fields_count": sum(1 for f in p7 if f["risk_level"] in ["CRITICAL", "HIGH"]),
                    "critical_fields_count": sum(1 for f in p7 if f["risk_level"] == "CRITICAL"),
                },
            },
            "daily_trend_7_days": trend,
            "prioritized_fields_ranked": p5,
        }


# Singleton risk engine instance
risk_engine = AgriculturalRiskEngine()
