"""
remote_sensing.py - Satellite and UAV Remote Sensing Intelligence Layer for AgriSense
Provides field-level vegetation vigor indices (NDVI, NDRE, EVI), canopy moisture stress,
and anomaly detection relative to healthy agronomic baselines.

TRANSPARENCY NOTE:
All synthetic / demo data is explicitly flagged with `is_simulated: true`.
Wording strictly recommends field inspection rather than declaring confirmed disease.
"""

import math
from typing import Dict, Any, List, Optional


class RemoteSensingProvider:
    """Base interface for satellite and UAV aerial telemetry providers."""
    def get_field_indicators(self, field_id: str, crop: str) -> Dict[str, Any]:
        raise NotImplementedError

    def get_all_fields_indicators(self, fields: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        raise NotImplementedError


class DemoSatelliteProvider(RemoteSensingProvider):
    """
    Simulated Sentinel-2 / Landsat 8-day satellite revisit provider.
    Calculates calibrated NDVI, NDRE, and vegetation anomaly against crop baselines.
    """
    def __init__(self):
        # Baseline healthy NDVI ranges per crop during active vegetative/fruiting stage
        self.crop_baselines: Dict[str, float] = {
            "cotton": 0.74,
            "rice": 0.82,
            "wheat": 0.78,
            "soybean": 0.76,
            "tomato": 0.72,
            "potato": 0.75,
            "maize": 0.80,
            "sugarcane": 0.85,
            "citrus": 0.70,
        }

    def _get_crop_key(self, crop_name: str) -> str:
        clean = (crop_name or "").lower()
        for key in self.crop_baselines:
            if key in clean:
                return key
        return "cotton"

    def get_field_indicators(self, field_id: str, crop: str) -> Dict[str, Any]:
        crop_key = self._get_crop_key(crop)
        baseline_ndvi = self.crop_baselines.get(crop_key, 0.75)

        # Deterministic variation based on field id hash for consistent demo reproducibility
        h = sum(ord(c) for c in (field_id or "FLD-001"))
        offset = ((h % 40) - 25) / 100.0  # -0.25 to +0.15 deviation

        # Specific known fields can reflect targeted stress patterns
        if field_id in ["FLD-001", "FLD-004", "FLD-005"]:
            # Known stressed fields
            current_ndvi = round(max(0.28, baseline_ndvi - 0.28 + (h % 5) / 100.0), 3)
            current_ndre = round(max(0.22, current_ndvi * 0.82), 3)
            evi = round(max(0.25, current_ndvi * 0.90), 3)
            anomaly_pct = round(((current_ndvi - baseline_ndvi) / baseline_ndvi) * 100, 1)
            signal = "HIGH_STRESS"
            moisture_stress = "Moderate to High"
            status_text = "Severe canopy vigor deficit detected relative to 3-year baseline."
        elif field_id in ["FLD-002", "FLD-006"]:
            # Moderate stress
            current_ndvi = round(max(0.45, baseline_ndvi - 0.16 + (h % 5) / 100.0), 3)
            current_ndre = round(max(0.38, current_ndvi * 0.85), 3)
            evi = round(max(0.40, current_ndvi * 0.92), 3)
            anomaly_pct = round(((current_ndvi - baseline_ndvi) / baseline_ndvi) * 100, 1)
            signal = "MODERATE_STRESS"
            moisture_stress = "Moderate"
            status_text = "Early localized canopy thinning observed in vegetative sector."
        else:
            # Healthy or mild variation
            current_ndvi = round(min(0.88, baseline_ndvi + (h % 8) / 100.0), 3)
            current_ndre = round(current_ndvi * 0.88, 3)
            evi = round(current_ndvi * 0.95, 3)
            anomaly_pct = round(((current_ndvi - baseline_ndvi) / baseline_ndvi) * 100, 1)
            signal = "HEALTHY"
            moisture_stress = "Adequate"
            status_text = "Canopy reflectance within optimal biometric range."

        return {
            "field_id": field_id,
            "crop": crop,
            "provider": "Simulated Sentinel-2 Multispectral MSI",
            "is_simulated": True,
            "data_transparency_label": "SIMULATED SATELLITE TELEMETRY",
            "last_acquisition": "2026-09-18 (8-day revisit interval)",
            "cloud_cover_pct": 12.4,
            "resolution_meters": 10.0,
            "metrics": {
                "ndvi": current_ndvi,
                "ndre": current_ndre,
                "evi": evi,
                "crop_baseline_ndvi": baseline_ndvi,
                "vegetation_anomaly_pct": anomaly_pct,
                "canopy_moisture_stress": moisture_stress,
            },
            "satellite_signal": signal,
            "advisory_wording": (
                "Vegetation stress detected from multispectral indices — field inspection recommended."
                if signal in ["HIGH_STRESS", "MODERATE_STRESS"]
                else "Vegetation vigor normal. Continue routine monitoring."
            ),
            "scientific_disclaimer": "Multispectral signals reflect biophysical canopy reflectance anomalies, not a definitive laboratory diagnosis. Targeted physical ground scouting is advised.",
            "observation_summary": status_text,
        }

    def get_all_fields_indicators(self, fields: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            self.get_field_indicators(f.get("id", f"FLD-{i+1}"), f.get("crop", "Cotton"))
            for i, f in enumerate(fields)
        ]


class UAVProvider(RemoteSensingProvider):
    """Simulated High-Resolution (2cm/pixel) UAV Aerial Scout Provider."""
    def get_field_indicators(self, field_id: str, crop: str) -> Dict[str, Any]:
        sat = DemoSatelliteProvider().get_field_indicators(field_id, crop)
        sat["provider"] = "Simulated Multispectral UAV Drone Scout"
        sat["resolution_meters"] = 0.05
        sat["data_transparency_label"] = "SIMULATED UAV DRONE TELEMETRY"
        sat["metrics"]["sub_canopy_uniformity_pct"] = 84.5 if sat["satellite_signal"] == "HEALTHY" else 61.2
        return sat

    def get_all_fields_indicators(self, fields: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            self.get_field_indicators(f.get("id", f"FLD-{i+1}"), f.get("crop", "Cotton"))
            for i, f in enumerate(fields)
        ]


# Singleton demo instance
remote_sensing_service = DemoSatelliteProvider()
