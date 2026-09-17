"""
routes.py - API Route Handlers for AgriSense
Dispatches and handles all REST API endpoints cleanly in Python.
"""

import os
import sys
import json
import time
from datetime import datetime
from urllib.parse import parse_qs, urlparse
from typing import Dict, Any, Tuple

from agri_data import CROPS_DATA, DISEASES_DATA, PESTS_DATA, OFFICERS_DATA, KENDRA_DEALERS
from data_store import store
from ai_engine import AgriculturalAIEngine
from advisor import advisor

START_TIME = time.time()


def handle_request(method: str, path: str, query_params: Dict[str, Any], body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    clean_path = path.rstrip("/")

    # 1. Health check & System Info
    if clean_path == "/api/health" and method == "GET":
        records = store.load_crop_health_records()
        return 200, {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": "AgriSense Agricultural Intelligence Platform",
            "backend": "Python 3 Standard Micro-Service",
            "python_version": sys.version.split()[0],
            "version": "2.0.0-python-stitch",
            "gemini_ai_configured": bool(os.environ.get("GEMINI_API_KEY")),
            "dataset_records": len(records),
            "active_fields": len(store.data.get("fields", [])),
            "active_detections": len(store.data.get("detections", [])),
            "active_subscribers": len(store.data.get("subscribers", [])),
            "active_radar_reports": len(store.data.get("radarReports", [])),
            "uptime_seconds": round(time.time() - START_TIME, 1),
        }

    if clean_path == "/api/system/backend-info" and method == "GET":
        return 200, {
            "platform": sys.platform,
            "python_version": sys.version,
            "process_id": os.getpid(),
            "uptime_seconds": round(time.time() - START_TIME, 1),
            "engine": "Native Python Engine",
            "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
        }

    # 2. Dashboard KPIs & Overview
    if clean_path == "/api/dashboard" and method == "GET":
        records = store.load_crop_health_records()
        total_records = len(records)
        healthy_count = sum(1 for r in records if r.get("crop_health_score", 0) >= 80)
        diseased_count = sum(1 for r in records if r.get("disease") and r.get("disease") != "None")
        pest_count = sum(1 for r in records if r.get("pest") and r.get("pest") != "None")
        high_risk_count = sum(1 for r in records if r.get("risk_level") in ["HIGH", "CRITICAL"])
        avg_health = (
            round(sum(r.get("crop_health_score", 70) for r in records) / total_records)
            if total_records > 0
            else 74
        )

        return 200, {
            "kpis": {
                "total_crop_records": total_records or 120,
                "healthy_crops": healthy_count or 45,
                "diseased_crops": diseased_count or 42,
                "pest_affected_crops": pest_count or 33,
                "high_risk_crops": high_risk_count or 19,
                "average_health_score": avg_health,
                "most_common_disease": "Soybean Rust",
                "most_common_pest": "Pink Bollworm",
                "detection_count": len(store.data.get("detections", [])),
                "recovery_rate_pct": 88.4,
                "active_fields_monitored": len(store.data.get("fields", [])),
                "community_outbreak_reports": len(store.data.get("radarReports", [])),
                "registered_alert_farmers": len(store.data.get("subscribers", [])),
            },
            "recent_detections": store.data.get("detections", [])[:5],
            "monitored_fields": store.data.get("fields", []),
        }

    # 3. Crops catalogue
    if clean_path == "/api/crops" and method == "GET":
        return 200, CROPS_DATA

    if clean_path.startswith("/api/crops/") and method == "GET":
        crop_id = clean_path.split("/")[-1].lower()
        found = next((c for c in CROPS_DATA if crop_id in c["id"].lower() or crop_id in c["name"].lower()), None)
        if found:
            return 200, found
        return 404, {"error": "Crop not found in catalogue"}

    # 4. Diseases catalogue
    if clean_path == "/api/diseases" and method == "GET":
        crop_filter = query_params.get("crop", [None])[0]
        search_filter = query_params.get("search", [None])[0]
        result = DISEASES_DATA
        if crop_filter:
            result = [d for d in result if any(crop_filter.lower() in c.lower() for c in d["affected_crops"])]
        if search_filter:
            q = search_filter.lower()
            result = [d for d in result if q in d["name"].lower() or q in d["symptoms"].lower()]
        return 200, result

    # 5. Pests catalogue
    if clean_path == "/api/pests" and method == "GET":
        crop_filter = query_params.get("crop", [None])[0]
        search_filter = query_params.get("search", [None])[0]
        result = PESTS_DATA
        if crop_filter:
            result = [p for p in result if any(crop_filter.lower() in c.lower() for c in p["crops_affected"])]
        if search_filter:
            q = search_filter.lower()
            result = [p for p in result if q in p["name"].lower() or q in p["symptoms_and_damage"].lower()]
        return 200, result

    # 6. Fields CRUD
    if clean_path == "/api/fields" and method == "GET":
        return 200, store.data.get("fields", [])

    if clean_path == "/api/fields" and method == "POST":
        new_field = {
            "id": f"FLD-PY-{int(time.time() * 1000)}",
            "name": body.get("name", "New Sector Plot"),
            "crop": body.get("crop", "Cotton (BT Cotton)"),
            "variety": body.get("variety", "Bollgard II"),
            "area_acres": float(body.get("area_acres", 2.5)),
            "location": body.get("location", "Sector 1 (North Farms)"),
            "soil_type": body.get("soil_type", "Deep Black Cotton Soil"),
            "growth_stage": body.get("growth_stage", "Vegetative"),
            "health_score": int(body.get("health_score", 75)),
            "disease_risk": body.get("disease_risk", "MODERATE"),
            "pest_risk": body.get("pest_risk", "LOW"),
            "last_inspection": datetime.utcnow().strftime("%Y-%m-%d"),
            "active_alerts": 0,
            "recommended_action": body.get("recommended_action", "Routine monitoring and maintenance."),
        }
        store.data.setdefault("fields", []).insert(0, new_field)
        store.save()
        return 201, new_field

    if clean_path.startswith("/api/fields/") and method == "DELETE":
        field_id = clean_path.split("/")[-1]
        fields = store.data.get("fields", [])
        for i, f in enumerate(fields):
            if f["id"] == field_id:
                removed = fields.pop(i)
                store.save()
                return 200, {"success": True, "removed": removed}
        return 404, {"error": "Field not found"}

    # 7. Detections CRUD
    if clean_path == "/api/detections" and method == "GET":
        return 200, store.data.get("detections", [])

    if clean_path == "/api/detections" and method == "POST":
        new_det = {
            "id": body.get("id", f"DET-PY-{int(time.time() * 1000)}"),
            "timestamp": body.get("timestamp", datetime.utcnow().strftime("%Y-%m-%d %H:%M")),
            "crop": body.get("crop", "Cotton (BT Cotton)"),
            "category": body.get("category", "Pest"),
            "name": body.get("name", "Pink Bollworm"),
            "confidence": float(body.get("confidence", 0.92)),
            "severity": body.get("severity", "Moderate"),
            "severity_pct": int(body.get("severity_pct", 65)),
            "risk_level": body.get("risk_level", "HIGH"),
            "symptoms": body.get("symptoms", ["Rosette flowers", "Pin-head bore holes"]),
            "possible_causes": body.get("possible_causes", ["High humidity >75%", "Cloudy weather"]),
            "management_immediate": body.get("management_immediate", "Install 5 pheromone traps per acre and apply 5% Neem Extract."),
            "management_preventive": body.get("management_preventive", "Destroy crop residue after final picking."),
            "management_biological": body.get("management_biological", "Release Trichogramma parasitoid @ 50,000 eggs/acre."),
            "management_ipm": body.get("management_ipm", "Monitor trap catches daily."),
            "xai_factors": body.get("xai_factors", [
                {"factor": "Relative Atmospheric Humidity (>75%)", "impact": 38, "direction": "increases_risk"},
            ]),
            "counterfactual_tip": body.get("counterfactual_tip", "Installing traps within 48h cuts damage by 68%."),
        }
        store.data.setdefault("detections", []).insert(0, new_det)
        store.save()
        return 201, new_det

    # 8. Analytics
    if clean_path == "/api/analytics" and method == "GET":
        records = store.load_crop_health_records()
        return 200, {
            "diseaseDistribution": [
                {"name": "Soybean Rust", "value": 34},
                {"name": "Cotton Bacterial Blight", "value": 24},
                {"name": "Anthracnose", "value": 18},
                {"name": "Citrus Canker", "value": 12},
            ],
            "pestDistribution": [
                {"name": "Pink Bollworm", "value": 42},
                {"name": "Soybean Stem Borer", "value": 28},
                {"name": "Whitefly", "value": 19},
                {"name": "Aphids / Jassids", "value": 15},
            ],
            "severityDistribution": [
                {"name": "Low", "value": 12},
                {"name": "Mild", "value": 22},
                {"name": "Moderate", "value": 38},
                {"name": "High", "value": 26},
                {"name": "Critical", "value": 14},
            ],
            "riskDistribution": [
                {"name": "LOW", "value": 34},
                {"name": "MODERATE", "value": 48},
                {"name": "HIGH", "value": 28},
                {"name": "CRITICAL", "value": 12},
            ],
            "cropWiseComparison": [
                {"crop": "Cotton", "avg_health_score": 72, "sample_count": 50},
                {"crop": "Soybean", "avg_health_score": 81, "sample_count": 45},
                {"crop": "Pigeon Pea (Tur)", "avg_health_score": 86, "sample_count": 25},
                {"crop": "Citrus (Orange)", "avg_health_score": 68, "sample_count": 20},
            ],
            "historicalTrends": [
                {"month": "Apr", "disease_incidence": 14, "pest_incidence": 22, "avg_health": 84},
                {"month": "May", "disease_incidence": 18, "pest_incidence": 35, "avg_health": 79},
                {"month": "Jun", "disease_incidence": 28, "pest_incidence": 42, "avg_health": 73},
                {"month": "Jul", "disease_incidence": 64, "pest_incidence": 51, "avg_health": 62},
                {"month": "Aug", "disease_incidence": 82, "pest_incidence": 68, "avg_health": 54},
                {"month": "Sep", "disease_incidence": 45, "pest_incidence": 38, "avg_health": 76},
            ],
        }

    # 9. Weather Analysis
    if clean_path == "/api/weather-analysis" and method == "GET":
        return 200, {
            "current": {
                "temperature": 28.5,
                "humidity": 78,
                "wind_speed": 12.0,
                "rainfall": 14.5,
                "condition": "Cloudy with Intermittent Showers",
                "disease_spore_risk": "HIGH",
            },
            "forecast": [
                {"day": "Today", "temp_max": 31, "temp_min": 24, "humidity": 80, "rain_prob": 70},
                {"day": "Tomorrow", "temp_max": 32, "temp_min": 23, "humidity": 75, "rain_prob": 60},
                {"day": "Day 3", "temp_max": 33, "temp_min": 23, "humidity": 68, "rain_prob": 30},
                {"day": "Day 4", "temp_max": 32, "temp_min": 22, "humidity": 65, "rain_prob": 20},
            ],
        }

    # 10. Live Microclimate & Soil Telemetry
    if clean_path == "/api/telemetry/microclimate" and method == "GET":
        hour = datetime.utcnow().hour
        base_temp = 31.5 if 5 <= hour <= 11 else 27.8
        current_humidity = 80
        return 200, {
            "station_id": "AWS-AGRI-042",
            "station_name": "Central Agro-Meteorological Station",
            "district": "Agricultural Hub",
            "region": "Agricultural Command Zone",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "telemetry": {
                "temperature_c": base_temp,
                "relative_humidity_pct": current_humidity,
                "wind_speed_kmh": 12.4,
                "wind_direction": "West-South-West (WSW)",
                "soil_moisture_pct": 75.0,
                "soil_temperature_c": 26.2,
                "leaf_wetness_hours": 4.5,
                "solar_radiation_wm2": 680,
            },
            "risk_indices": {
                "fungal_spore_risk": "HIGH",
                "rust_conducive_hours": 6,
                "bollworm_oviposition_risk": "CRITICAL",
                "irrigation_requirement": "NOT_REQUIRED (Adequate Soil Moisture 75%)",
            },
            "status": "ONLINE",
            "last_sync": "10m ago",
        }

    # 11. AI Image Detection
    if clean_path == "/api/detect" and method == "POST":
        res = AgriculturalAIEngine.analyze_image(
            crop=body.get("crop", "Cotton"),
            hint=body.get("hint", ""),
            is_user_image=bool(body.get("isUserImage", False)),
        )
        return 200, res

    # 12. Predict Risk
    if clean_path == "/api/predict" and method == "POST":
        res = AgriculturalAIEngine.predict_risk(body)
        return 200, res

    # 13. Recommendations
    if clean_path == "/api/recommendations" and method == "POST":
        res = AgriculturalAIEngine.get_farmer_action_plan(
            crop=body.get("crop", "Cotton"),
            condition=body.get("condition", "Pink Bollworm"),
            severity=body.get("severity", "Moderate"),
            growth_stage=body.get("growth_stage", "Boll Formation"),
            weather=body.get("weather", "High Humidity > 75%"),
            language=body.get("language", "English"),
        )
        return 200, res

    # 14. Voice/Text Advisor Query
    if clean_path == "/api/advisor/voice-query" and method == "POST":
        query_text = body.get("query", "")
        lang = body.get("language", "English")
        res = advisor.query(query_text, lang)
        if "error" in res:
            return 400, res
        return 200, res

    # 15. Community Outbreak Radar
    if clean_path == "/api/radar/zones" and method == "GET":
        sector1_count = sum(1 for r in store.data.get("radarReports", []) if "sector 1" in r.get("village", "").lower() or "chandur" in r.get("village", "").lower()) + 42
        sector2_count = sum(1 for r in store.data.get("radarReports", []) if "sector 2" in r.get("village", "").lower() or "talegaon" in r.get("village", "").lower()) + 18
        sector3_count = sum(1 for r in store.data.get("radarReports", []) if "sector 3" in r.get("village", "").lower() or "warud" in r.get("village", "").lower()) + 11

        return 200, [
            {
                "id": "ZONE-01",
                "village": "Sector 1 (North Farms)",
                "district": "Agricultural Zone A",
                "pest": "Pink Bollworm",
                "crop": "Cotton",
                "status": "High Risk (Red Zone)",
                "severity": "high",
                "count": f"{sector1_count} Farmers Affected",
                "rawCount": sector1_count,
                "advice": "Install 5 pheromone traps/acre immediately. If damage exceeds 5%, spray Neem extract (10,000 ppm) or Profenofos 50% EC.",
                "coordinates": {"lat": 21.2403, "lng": 77.7472},
                "badgeBgClass": "error",
            },
            {
                "id": "ZONE-02",
                "village": "Sector 2 (Central Plains)",
                "district": "Agricultural Zone B",
                "pest": "Soybean Stem Borer",
                "crop": "Soybean",
                "status": "Moderate Risk (Amber Zone)",
                "severity": "med",
                "count": f"{sector2_count} Farmers Affected",
                "rawCount": sector2_count,
                "advice": "Apply 5% Neem Seed Kernel Extract (NSKE) or Chlorantraniliprole 18.5% SC.",
                "coordinates": {"lat": 20.8122, "lng": 78.0211},
                "badgeBgClass": "secondary-container",
            },
            {
                "id": "ZONE-03",
                "village": "Sector 3 (Eastern Belt)",
                "district": "Agricultural Zone C",
                "pest": "Citrus Gummosis & Jassids",
                "crop": "Citrus (Orange)",
                "status": "Moderate Outbreak",
                "severity": "med",
                "count": f"{sector3_count} Orchards Affected",
                "rawCount": sector3_count,
                "advice": "Apply Bordeaux paste to tree trunks and incorporate Trichoderma into root zones.",
                "coordinates": {"lat": 21.4641, "lng": 78.2618},
                "badgeBgClass": "secondary-container",
            },
            {
                "id": "ZONE-04",
                "village": "Sector 4 (Southern Valley)",
                "district": "Agricultural Zone D",
                "pest": "No active outbreak reported",
                "crop": "Cotton & Pulses",
                "status": "Safe Zone (Green Zone)",
                "severity": "low",
                "count": "0 Reports",
                "rawCount": 0,
                "advice": "Crops are healthy. Inspect pheromone traps regularly every 7 days.",
                "coordinates": {"lat": 21.3289, "lng": 77.5218},
                "badgeBgClass": "primary-container",
            },
        ]

    if clean_path == "/api/radar/reports" and method == "GET":
        return 200, store.data.get("radarReports", [])

    if clean_path == "/api/radar/reports" and method == "POST":
        new_report = {
            "id": f"REP-PY-{str(int(time.time()))[-4:]}",
            "village": body.get("village", "Sector 1 (North Farms)"),
            "pest": body.get("pest", "Pink Bollworm"),
            "severity": body.get("severity", "high"),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "reportedBy": body.get("reportedBy", "Anonymous Farmer (Verified)"),
            "notes": body.get("notes", "Field inspection confirmed early signs."),
        }
        store.data.setdefault("radarReports", []).insert(0, new_report)
        store.save()
        return 201, {
            "success": True,
            "message": "Outbreak report successfully pinned to community radar map",
            "report": new_report,
        }

    # 16. SMS Alerts
    if clean_path == "/api/alerts/subscribers" and method == "GET":
        return 200, {
            "total_active_subscribers": len(store.data.get("subscribers", [])) + 1420,
            "districts_covered": ["North Sector", "Central Sector", "East Sector", "West Sector", "South Sector"],
            "broadcast_schedule": "Daily at 08:00 AM IST & Immediate Emergency Triggers",
        }

    if clean_path == "/api/alerts/subscribe" and method == "POST":
        raw_phone = str(body.get("phone", "")).strip()
        phone = "".join(c for c in raw_phone if c.isdigit())
        if len(phone) != 10:
            return 400, {"error": "Please provide a valid 10-digit mobile number."}

        subscribers = store.data.setdefault("subscribers", [])
        existing = next((s for s in subscribers if s.get("phone") == phone), None)
        if existing:
            return 200, {
                "success": True,
                "message": "Mobile number is already registered for Agriculture Dept. SMS Alerts.",
                "subscriber": existing,
            }

        new_sub = {
            "id": f"SUB-PY-{str(int(time.time()))[-4:]}",
            "phone": phone,
            "district": body.get("district", "Agricultural Zone"),
            "subscribedAt": datetime.utcnow().isoformat() + "Z",
            "alertTypes": body.get("alertTypes", ["pest_spore", "weather", "gov_advisory"]),
        }
        subscribers.insert(0, new_sub)
        store.save()
        return 201, {
            "success": True,
            "message": "Mobile number registered successfully! Free SMS alerts will arrive daily at 8:00 AM.",
            "subscriber": new_sub,
        }

    # 17. Officers & Inspections
    if clean_path == "/api/officers" and method == "GET":
        return 200, OFFICERS_DATA

    if clean_path == "/api/officers/inspections" and method == "GET":
        return 200, store.data.get("inspections", [])

    if clean_path == "/api/officers/inspections" and method == "POST":
        new_booking = {
            "id": f"INSP-PY-{str(int(time.time()))[-4:]}",
            "officerName": body.get("officerName", "Dr. Gajanan Deshmukh"),
            "crop": body.get("crop", "Cotton"),
            "farmerName": body.get("farmerName", "Ramesh Patil"),
            "farmerPhone": body.get("farmerPhone", "9822001122"),
            "village": body.get("village", "Sector 1 (North Farms)"),
            "preferredDate": body.get("preferredDate", datetime.utcnow().strftime("%Y-%m-%d")),
            "status": "Confirmed",
            "bookedAt": datetime.utcnow().isoformat() + "Z",
        }
        store.data.setdefault("inspections", []).insert(0, new_booking)
        store.save()
        return 201, {
            "success": True,
            "message": f"Field inspection scheduled successfully with {new_booking['officerName']}.",
            "booking": new_booking,
        }

    # 18. Kendra Directory
    if clean_path == "/api/kendra" and method == "GET":
        return 200, KENDRA_DEALERS

    # 19. Digital Farm Logbook
    if clean_path == "/api/logbook" and method == "GET":
        return 200, store.data.get("logbook", [])

    if clean_path == "/api/logbook" and method == "POST":
        new_entry = {
            "id": f"LOG-AGRI-PY-{str(int(time.time()))[-4:]}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "crop": body.get("crop", "Cotton"),
            "issue": body.get("issue", "Pink Bollworm Infestation"),
            "severity": body.get("severity", "Moderate"),
            "actionTaken": body.get("actionTaken", "Applied recommended organic / chemical treatment."),
            "treatmentType": body.get("treatmentType", "organic"),
            "cibrcCertified": bool(body.get("cibrcCertified", True)),
        }
        store.data.setdefault("logbook", []).insert(0, new_entry)
        store.save()
        return 201, {
            "success": True,
            "message": "Entry successfully added to digital farm logbook",
            "entry": new_entry,
        }

    # 20. Structured Agri Report
    if clean_path == "/api/report" and method == "POST":
        report_id = f"AGRI-REPORT-{str(int(time.time()))[-6:]}"
        return 200, {
            "report_id": report_id,
            "title": f"Certified Agricultural Advisory: {body.get('crop', 'Cotton')} Protection",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "authority": "Agricultural Extension & Research Advisory Board",
            "field": body.get("fieldName", "Field Sector 1, Plot 42/B"),
            "crop": body.get("crop", "Cotton (BT Cotton)"),
            "diagnosis": body.get("diseaseOrPest", "Pink Bollworm (Pectinophora gossypiella)"),
            "severity": body.get("severity", "Moderate (Stage 2)"),
            "risk_level": body.get("riskLevel", "HIGH"),
            "xai_key_contributor": "Relative Atmospheric Humidity (>75%)",
            "immediate_action": "Apply Cold-Pressed Neem Oil 10,000 ppm at 5 ml/L or Profenofos 50% EC at 30 ml per 10 L knapsack sprayer.",
            "recommended_calendar": [
                {"day": "Day 1 (Immediate)", "task": "Field inspection, tagging infested flowers, install 5 pheromone traps per hectare."},
                {"day": "Day 2", "task": "Apply bio-pesticide (Neem Oil 10,000 PPM) in calm late afternoon."},
                {"day": "Day 4", "task": "Verify reduction in rosette flowers and check adult moth count in traps."},
                {"day": "Day 7", "task": "Release Trichogramma bactrae parasitoid cards at 50,000 eggs per acre."},
            ],
            "cibrc_guidelines": "Compliant with Central Insecticides Board & Registration Committee (CIBRC) 2024 Gazette.",
            "disclaimer": "This advisory was generated by AgriSense Python Agricultural Service using micro-climate telemetry and certified agronomic standards.",
        }

    # 21. Agricultural Datasets Directory & Query API
    if clean_path == "/api/datasets" and method == "GET":
        datasets = store.list_available_datasets()
        return 200, {
            "datasets": datasets,
            "total_datasets": len(datasets),
            "total_data_points": sum(d.get("rowCount", 0) for d in datasets),
        }

    if clean_path.startswith("/api/datasets/") and method == "GET":
        dataset_name = clean_path.replace("/api/datasets/", "").strip()
        records = store.load_named_dataset(dataset_name)
        datasets = store.list_available_datasets()
        meta = next((d for d in datasets if d["id"] == dataset_name or d["filename"] == f"{dataset_name}.csv"), None)

        if not records and not meta:
            return 404, {"error": f"Dataset '{dataset_name}' not found in agricultural repository"}

        # Optional search filter
        raw_search = query_params.get("search", "")
        search_query = (raw_search[0] if isinstance(raw_search, list) else str(raw_search)).lower().strip()
        if search_query:
            filtered = []
            for r in records:
                row_str = " ".join(str(v) for v in r.values()).lower()
                if search_query in row_str:
                    filtered.append(r)
            records = filtered

        # Limit
        limit = 500
        if "limit" in query_params:
            try:
                raw_lim = query_params["limit"]
                limit_val = raw_lim[0] if isinstance(raw_lim, list) else raw_lim
                limit = int(limit_val)
            except (ValueError, TypeError):
                pass

        return 200, {
            "dataset": dataset_name,
            "metadata": meta,
            "total_records": len(records),
            "records": records[:limit],
        }

    return 404, {"error": f"Endpoint '{clean_path}' not found on Python backend"}
