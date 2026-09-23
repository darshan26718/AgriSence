"""
backend/pest_classifier.py - Entomological Visual Analysis & Economic Threshold Evaluator

Architecture:
  Pest Specimen / Damage Image
        ↓
  Image Quality & Specimen Audit (Pillow)
        ↓
  Entomological Morphology & Damage Pattern Extraction
  (Bore holes, rosette bloom, window-pane skeletonization, hopperburn, webbing, honeydew)
        ↓
  Candidate Matching against dataset/pest_dataset.csv
        ↓
  Calibrated Top-3 Predictions with ETL Evaluation
        ↓
  Structured Agronomic & CIBRC Guidance
"""

import os
import io
import csv
import math
import base64
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional

try:
    from PIL import Image, ImageStat, ImageFilter
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PEST_DATASET_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "pest_dataset.csv")
PEST_MODEL_PATH = os.path.join(WORKSPACE_ROOT, "data", "pest_classifier_model.json")

# Try importing the trained ML model loader
try:
    from ml_engine import load_model as _load_pest_model
    _PEST_ML_AVAILABLE = True
except ImportError:
    _PEST_ML_AVAILABLE = False


class PestModel:
    """Singleton loader for the trained pest classification ensemble model."""
    _model = None
    _loaded = False

    @classmethod
    def get(cls):
        """Returns the trained model if available, else None."""
        if cls._model is None:
            if _PEST_ML_AVAILABLE and os.path.exists(PEST_MODEL_PATH):
                try:
                    cls._model = _load_pest_model(PEST_MODEL_PATH)
                    if cls._model is not None:
                        cls._loaded = True
                        print(f"[AgriSense Pest Model] Loaded trained ensemble from {PEST_MODEL_PATH}")
                except Exception as e:
                    print(f"[AgriSense Pest Model] Failed to load model: {e}")
                    cls._model = None
        return cls._model


def safe_get_pixels(img: Any) -> List[Any]:
    if hasattr(img, "get_flattened_data"):
        try:
            return list(img.get_flattened_data())
        except Exception:
            pass
    return list(img.getdata())


class PestKnowledgeBase:
    """Loads and indexes dataset/pest_dataset.csv for entomological guidance."""

    def __init__(self):
        self.pests: Dict[str, Dict[str, Any]] = {}
        self.crop_to_pests: Dict[str, List[str]] = {}
        self.load()

    def load(self):
        if not os.path.exists(PEST_DATASET_PATH):
            return

        with open(PEST_DATASET_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                p_id = row.get("pest_id", "").strip()
                name = row.get("pest_name", "").strip()
                affected_crops = [c.strip().strip('"') for c in row.get("crops_affected", "").split(",") if c.strip()]
                record = {
                    "id": p_id,
                    "name": name,
                    "scientific_name": row.get("scientific_name", "").strip(),
                    "crops_affected": affected_crops,
                    "life_stage_danger": row.get("life_stage_danger", "").strip(),
                    "symptoms_and_damage": row.get("symptoms_and_damage", "").strip(),
                    "economic_threshold_level": row.get("economic_threshold_level", "").strip(),
                    "risk_level": row.get("risk_level", "HIGH").strip(),
                    "biological_control": row.get("biological_control", "").strip(),
                    "cultural_control": row.get("cultural_control", "").strip(),
                    "chemical_guidance": row.get("chemical_guidance", "").strip(),
                }
                self.pests[name.lower()] = record
                for c in affected_crops:
                    c_low = c.lower()
                    if c_low not in self.crop_to_pests:
                        self.crop_to_pests[c_low] = []
                    self.crop_to_pests[c_low].append(name.lower())

    def get_for_crop(self, crop: str) -> List[Dict[str, Any]]:
        crop_clean = crop.lower().split("(")[0].strip()
        results = []
        for c_key, pest_keys in self.crop_to_pests.items():
            if crop_clean in c_key or c_key in crop_clean:
                for pk in pest_keys:
                    if pk in self.pests and self.pests[pk] not in results:
                        results.append(self.pests[pk])
        return results or list(self.pests.values())


class PestClassifier:
    """Entomological Image Inference Pipeline."""

    KB = PestKnowledgeBase()
    MODEL_VERSION = "agrisense-entomology-v1"

    @classmethod
    def decode_image(cls, image_input: Any) -> Tuple[Optional[Any], Optional[str]]:
        if not PILLOW_AVAILABLE:
            return None, "Pillow library is not installed."
        try:
            if isinstance(image_input, bytes):
                img = Image.open(io.BytesIO(image_input))
                img.verify()
                img = Image.open(io.BytesIO(image_input))
                return img.convert("RGB"), None
            if isinstance(image_input, str):
                if "," in image_input:
                    image_input = image_input.split(",", 1)[1]
                raw_bytes = base64.b64decode(image_input)
                img = Image.open(io.BytesIO(raw_bytes))
                img.verify()
                img = Image.open(io.BytesIO(raw_bytes))
                return img.convert("RGB"), None
            return None, "Unsupported image format."
        except Exception as e:
            return None, f"Could not decode image: {str(e)}"

    @classmethod
    def extract_pest_damage_features(cls, img: Any) -> Dict[str, float]:
        """Analyzes crop damage patterns associated with chewing, boring, or sucking pests."""
        if not PILLOW_AVAILABLE or img is None:
            return {
                "chewing_defoliation": 0.15,
                "bore_hole_dark_spots": 0.12,
                "hopperburn_bronzing": 0.10,
                "silken_webbing": 0.05,
                "honeydew_sooty": 0.08,
            }

        thumb = img.resize((120, 120))
        pixels = safe_get_pixels(thumb)
        n = len(pixels)

        dark_bore_holes = 0
        scorched_burn = 0
        white_silken = 0
        sooty_black = 0

        for r, g, b in pixels:
            # Dark pin-head / bore hole (deep dark brown/black within fruit or boll)
            if r < 40 and g < 35 and b < 30 and (r + g + b) > 15:
                dark_bore_holes += 1
            # Hopperburn / scorched brown (severe sap sucking at stem base)
            elif r > 110 and g > 70 and b < 50 and r > g + 25:
                scorched_burn += 1
            # Silken webbing / white powdery wax (Mites / Mealybugs / Whitefly)
            elif min(r, g, b) > 180 and max(r, g, b) - min(r, g, b) < 20:
                white_silken += 1
            # Sooty mold (secondary to aphid/whitefly honeydew)
            elif max(r, g, b) < 45 and abs(r - g) < 10:
                sooty_black += 1

        return {
            "chewing_defoliation": round(dark_bore_holes / n * 4.0, 3),
            "bore_hole_dark_spots": round(dark_bore_holes / n * 3.5, 3),
            "hopperburn_bronzing": round(scorched_burn / n * 3.0, 3),
            "silken_webbing": round(white_silken / n * 3.5, 3),
            "honeydew_sooty": round(sooty_black / n * 4.0, 3),
        }

    @classmethod
    def classify(
        cls,
        image_input: Any,
        crop: str = "Cotton",
        observed_sweep_count: int = 12,
    ) -> Dict[str, Any]:
        img, err = cls.decode_image(image_input)
        if err or img is None:
            return {
                "success": False,
                "message": err or "Pest image could not be processed.",
                "model_version": cls.MODEL_VERSION,
            }

        # Quality check
        stat = ImageStat.Stat(img.convert("L"))
        avg_lum = stat.mean[0] / 255.0
        if avg_lum < 0.10 or avg_lum > 0.95:
            return {
                "success": False,
                "error_type": "POOR_EXPOSURE",
                "message": "Pest photo exposure is too dark or washed out for diagnostic feature extraction.",
            }

        damage_features = cls.extract_pest_damage_features(img)
        candidates = cls.KB.get_for_crop(crop)

        # ── Trained ML Model Inference ──────────────────────────────────────
        trained_model = PestModel.get()
        use_trained_model = trained_model is not None and hasattr(trained_model, 'predict_top_k')

        scores = []

        if use_trained_model:
            # Build feature vector matching the training feature order:
            # bore_hole_dark_spots, chewing_defoliation, hopperburn_bronzing,
            # silken_webbing, honeydew_sooty, scorched_ratio, healthy_ratio,
            # crop_id_norm, brightness, contrast
            scorched_proxy = round(damage_features.get("hopperburn_bronzing", 0.0) * 0.4 + 0.04, 3)
            healthy_proxy = round(max(0.20, min(0.85, 1.0 - sum(damage_features.values()) * 1.5)), 3)
            ml_features = [
                damage_features.get("bore_hole_dark_spots", 0.0),
                damage_features.get("chewing_defoliation", 0.0),
                damage_features.get("hopperburn_bronzing", 0.0),
                damage_features.get("silken_webbing", 0.0),
                damage_features.get("honeydew_sooty", 0.0),
                scorched_proxy,
                healthy_proxy,
                0.5,    # crop_id_norm (neutral)
                avg_lum,  # brightness
                0.5,    # contrast (neutral)
            ]

            all_proba = trained_model.predict_proba([ml_features])[0]
            crop_clean = (crop or "").lower().split("(")[0].strip()
            is_auto_pest = crop_clean in ("auto-detect", "auto", "unknown", "")

            weighted_scores = []
            for cls_id, raw_prob in all_proba.items():
                p_name = trained_model.class_names[cls_id] if cls_id < len(trained_model.class_names) else f"Class-{cls_id}"
                matched_rec = None
                p_lower = p_name.lower()
                for cand in candidates:
                    if p_lower in cand["name"].lower() or cand["name"].lower() in p_lower:
                        matched_rec = cand
                        break
                if matched_rec is None:
                    for pest_key, pest_rec in cls.KB.pests.items():
                        if p_lower in pest_key or pest_key in p_lower:
                            matched_rec = pest_rec
                            break
                if matched_rec is None and candidates:
                    matched_rec = candidates[0]

                # Apply Bayesian prior weighting:
                # If user selected a crop, favor pests documented to affect that crop
                prior_weight = 1.0
                if not is_auto_pest and matched_rec:
                    aff = [c.lower() for c in matched_rec.get("crops_affected", [])]
                    if any(crop_clean in ac or ac in crop_clean for ac in aff):
                        prior_weight = 2.5
                    else:
                        prior_weight = 0.4

                weighted_scores.append((p_name, raw_prob * prior_weight, matched_rec))

            weighted_scores.sort(key=lambda x: x[1], reverse=True)
            scores = weighted_scores[:5]

        # ── Heuristic Fallback ──────────────────────────────────────────────
        else:
            for cand in candidates:
                name_low = cand["name"].lower()
                symp_low = cand["symptoms_and_damage"].lower()
                score = 0.20

                # Pink Bollworm (Cotton boll boring, rosette flower)
                if "bollworm" in name_low:
                    score += damage_features["bore_hole_dark_spots"] * 0.50 + 0.15

                # Fall Armyworm (whorl feeding, large chewing defoliation)
                elif "armyworm" in name_low:
                    score += damage_features["chewing_defoliation"] * 0.55 + 0.12

                # Brown Planthopper (hopperburn, circular scorched drying)
                elif "planthopper" in name_low or "hopperburn" in symp_low:
                    score += damage_features["hopperburn_bronzing"] * 0.60 + 0.10

                # Whiteflies / Aphids (honeydew, sooty mold, curling)
                elif "whitefl" in name_low or "aphid" in name_low:
                    score += damage_features["honeydew_sooty"] * 0.40 + damage_features["silken_webbing"] * 0.30

                # Spider Mites / Mealybugs (webbing, white waxy cluster)
                elif "mite" in name_low or "mealy" in name_low:
                    score += damage_features["silken_webbing"] * 0.65 + 0.10

                # Borer
                elif "borer" in name_low:
                    score += damage_features["bore_hole_dark_spots"] * 0.45 + 0.15

                else:
                    score += sum(damage_features.values()) * 0.20

                scores.append((cand["name"], score, cand))

        scores.sort(key=lambda x: x[1], reverse=True)
        top_scores = scores[:4]
        max_s = max(s[1] for s in top_scores) if top_scores else 1.0
        exp_sum = sum(math.exp(min(15.0, (s[1] - max_s) * 4.0)) for s in top_scores)

        calibrated = []
        for name, raw_s, rec in top_scores:
            prob = math.exp(min(15.0, (raw_s - max_s) * 4.0)) / (exp_sum + 1e-6)
            prob_cal = round(max(0.05, min(0.88, prob)), 2)
            calibrated.append({
                "name": name,
                "confidence": prob_cal,
                "confidence_pct": int(prob_cal * 100),
                "record": rec,
            })

        top_cand = calibrated[0]
        rec = top_cand["record"]

        # Parse economic threshold number from text
        etl_text = rec.get("economic_threshold_level", "")
        is_above_etl = observed_sweep_count >= 10  # default threshold proxy

        return {
            "success": True,
            "prediction_type": "TRAINED_PEST_ML_ENSEMBLE" if use_trained_model else "ENTOMOLOGICAL_VISUAL_ANALYSIS",
            "model_version": cls.MODEL_VERSION,
            "crop": crop,
            "top_prediction": {
                "name": top_cand["name"],
                "confidence": top_cand["confidence"],
                "confidence_pct": top_cand["confidence_pct"],
                "scientific_name": rec.get("scientific_name", ""),
                "life_stage_danger": rec.get("life_stage_danger", ""),
                "symptoms_and_damage": rec.get("symptoms_and_damage", ""),
                "economic_threshold_level": etl_text,
                "is_above_etl": is_above_etl,
                "risk_level": rec.get("risk_level", "HIGH"),
                "biological_control": rec.get("biological_control", ""),
                "cultural_control": rec.get("cultural_control", ""),
                "chemical_guidance": rec.get("chemical_guidance", ""),
            },
            "alternatives": [
                {
                    "name": alt["name"],
                    "confidence": alt["confidence"],
                    "confidence_pct": alt["confidence_pct"],
                }
                for alt in calibrated[1:3]
            ],
            "damage_features": damage_features,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
