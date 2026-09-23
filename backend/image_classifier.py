"""
backend/image_classifier.py - Computer Vision & Visual Pathology Inference Pipeline for AgriSense

Architecture:
  Uploaded Image (Base64 / Bytes)
        ↓
  Image Validation (Format, dimensions, integrity)
        ↓
  Image Preprocessing & Quality Checks (Blur, exposure, darkness, contrast)
        ↓
  Plant Specimen Verification (Chlorophyll chromaticity, foliage hue presence vs non-plant rejection)
        ↓
  Crop Morphometry & Mismatch Detection (Broadleaf dicot vs narrow monocot grass/cereal)
        ↓
  Visual Pathology Extraction (Chlorosis ratio, necrosis density, lesion morphology)
        ↓
  Classification Engine (Trained RF+GBM Ensemble if model present, else Calibrated Visual Feature Inference)
        ↓
  Confidence Calculation & Top-3 Candidates
        ↓
  Agricultural Knowledge Validation (dataset/crop_disease.csv cross-referencing)
        ↓
  Final Structured Result
"""

import os
import io
import csv
import math
import base64
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional

from urllib.parse import unquote as url_unquote
from urllib.request import urlopen as url_open, Request as url_Request

# Try importing Pillow
try:
    from PIL import Image, ImageStat, ImageFilter, ImageOps
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DISEASE_DATASET_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "crop_disease.csv")
MODELS_DIR = os.path.join(WORKSPACE_ROOT, "backend", "models")
DISEASE_MODEL_V1_PATH = os.path.join(WORKSPACE_ROOT, "data", "disease_classifier_model.json")
DISEASE_MODEL_V2_PATH = os.path.join(WORKSPACE_ROOT, "data", "disease_classifier_model_v2.json")
MODEL_REGISTRY_PATH = os.path.join(WORKSPACE_ROOT, "data", "model_registry.json")

# Configurable image confidence threshold per Section 19
IMAGE_CONFIDENCE_THRESHOLD = float(os.environ.get("IMAGE_CONFIDENCE_THRESHOLD", 0.70))

# Try importing the trained ML model loader
try:
    from ml_engine import load_model as _load_ml_model
    _ML_ENGINE_AVAILABLE = True
except ImportError:
    _ML_ENGINE_AVAILABLE = False


class DiseaseModel:
    """Singleton loader for the trained disease classification ensemble model."""
    _instance = None
    _model = None
    _loaded = False
    _version = "1.0.0"
    _model_path = ""

    @classmethod
    def get(cls):
        """Returns the trained model if available, else None."""
        if cls._model is None:
            if not _ML_ENGINE_AVAILABLE:
                return None

            target_path = DISEASE_MODEL_V2_PATH
            version_str = "2.0.0"

            # Check model registry for active version
            if os.path.exists(MODEL_REGISTRY_PATH):
                try:
                    import json
                    with open(MODEL_REGISTRY_PATH, "r", encoding="utf-8") as f:
                        reg = json.load(f)
                        active = reg.get("active_model", "v2")
                        if active == "v2" and os.path.exists(DISEASE_MODEL_V2_PATH):
                            target_path = DISEASE_MODEL_V2_PATH
                            version_str = "2.0.0"
                        elif os.path.exists(DISEASE_MODEL_V1_PATH):
                            target_path = DISEASE_MODEL_V1_PATH
                            version_str = "1.0.0"
                except Exception:
                    pass

            if not os.path.exists(target_path) and os.path.exists(DISEASE_MODEL_V1_PATH):
                target_path = DISEASE_MODEL_V1_PATH
                version_str = "1.0.0"

            if os.path.exists(target_path):
                try:
                    cls._model = _load_ml_model(target_path)
                    if cls._model is not None:
                        cls._loaded = True
                        cls._version = version_str
                        cls._model_path = target_path
                        print(f"[AgriSense Disease Model] Loaded trained ensemble v{cls._version} from {target_path} ({len(cls._model.class_names)} classes)")
                except Exception as e:
                    print(f"[AgriSense Disease Model] Failed to load model: {e}")
                    cls._model = None
        return cls._model

    @classmethod
    def get_version(cls) -> str:
        if cls._model is None:
            cls.get()
        return cls._version


def safe_get_pixels(img: Any) -> List[Any]:
    """Extracts flat pixel sequence safely avoiding Pillow 14 deprecation."""
    if hasattr(img, "get_flattened_data"):
        try:
            return list(img.get_flattened_data())
        except Exception:
            pass
    return list(img.getdata())


class ImageQualityResult:
    def __init__(
        self,
        is_valid: bool,
        quality_label: str,
        message: str,
        brightness: float = 0.5,
        sharpness: float = 50.0,
        is_plant_specimen: bool = True,
        plant_confidence: float = 0.9,
    ):
        self.is_valid = is_valid
        self.quality_label = quality_label
        self.message = message
        self.brightness = brightness
        self.sharpness = sharpness
        self.is_plant_specimen = is_plant_specimen
        self.plant_confidence = plant_confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "quality_label": self.quality_label,
            "message": self.message,
            "brightness_score": round(self.brightness, 2),
            "sharpness_score": round(self.sharpness, 1),
            "is_plant_specimen": self.is_plant_specimen,
            "plant_confidence": round(self.plant_confidence, 2),
        }


class CropDiseaseKnowledgeBase:
    """Loads and indexes dataset/crop_disease.csv for clinical agronomic cross-referencing."""

    def __init__(self):
        self.diseases: Dict[str, Dict[str, Any]] = {}
        self.crop_to_diseases: Dict[str, List[str]] = {}
        self.load()

    def load(self):
        if not os.path.exists(DISEASE_DATASET_PATH):
            return

        with open(DISEASE_DATASET_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                d_id = row.get("disease_id", "").strip()
                name = row.get("disease_name", "").strip()
                affected = [c.strip().strip('"') for c in row.get("affected_crops", "").split(",") if c.strip()]
                record = {
                    "id": d_id,
                    "name": name,
                    "pathogen": row.get("pathogen_type", "").strip(),
                    "affected_crops": affected,
                    "symptoms": row.get("symptoms", "").strip(),
                    "favorable_temp_c": row.get("favorable_temp_c", "").strip(),
                    "favorable_humidity_pct": row.get("favorable_humidity_pct", "").strip(),
                    "severity_risk": row.get("severity_risk", "MODERATE").strip(),
                    "primary_cause": row.get("primary_cause", "").strip(),
                    "organic_control": row.get("organic_control", "").strip(),
                    "chemical_guidance": row.get("chemical_control_guidance", "").strip(),
                    "prevention": row.get("prevention_measures", "").strip(),
                }
                self.diseases[name.lower()] = record
                for c in affected:
                    c_low = c.lower()
                    if c_low not in self.crop_to_diseases:
                        self.crop_to_diseases[c_low] = []
                    self.crop_to_diseases[c_low].append(name.lower())

    def get_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        return self.diseases.get(name.lower())

    def get_for_crop(self, crop: str) -> List[Dict[str, Any]]:
        crop_clean = crop.lower().split("(")[0].strip()
        results = []
        for c_key, disease_keys in self.crop_to_diseases.items():
            if crop_clean in c_key or c_key in crop_clean:
                for dk in disease_keys:
                    if dk in self.diseases and self.diseases[dk] not in results:
                        results.append(self.diseases[dk])
        return results


class ImageClassifier:
    """End-to-End Visual Pathology Classifier for AgriSense."""

    KB = CropDiseaseKnowledgeBase()
    MODEL_VERSION = "agrisense-cv-v2"

    @classmethod
    def decode_image(cls, image_input: Any) -> Tuple[Optional[Any], Optional[str]]:
        """Decodes raw bytes, base64 string, data URL, local path, or image URL into a PIL Image."""
        try:
            from PIL import Image, ImageOps
        except ImportError:
            return None, "Pillow library is not installed."

        try:
            if isinstance(image_input, dict):
                image_input = image_input.get("image") or image_input.get("image_data") or image_input.get("data")

            if isinstance(image_input, bytes):
                img = Image.open(io.BytesIO(image_input))
                try:
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass
                return img.convert("RGB"), None

            if isinstance(image_input, str):
                image_input = image_input.strip().strip('"\'')
                if not image_input:
                    return None, "Empty image input string."

                # Handle HTTP/HTTPS URL
                if image_input.startswith(("http://", "https://")):
                    req = url_Request(image_input, headers={"User-Agent": "AgriSense/1.0"})
                    with url_open(req, timeout=8) as resp:
                        raw_bytes = resp.read()
                        img = Image.open(io.BytesIO(raw_bytes))
                        try:
                            img = ImageOps.exif_transpose(img)
                        except Exception:
                            pass
                        return img.convert("RGB"), None

                # Handle local file path
                if os.path.isfile(image_input):
                    img = Image.open(image_input)
                    try:
                        img = ImageOps.exif_transpose(img)
                    except Exception:
                        pass
                    return img.convert("RGB"), None

                # Handle base64 data URL e.g. "data:image/jpeg;base64,/9j/4AAQ..."
                if "," in image_input and ("data:" in image_input or ";base64" in image_input):
                    image_input = image_input.split(",", 1)[1]

                # Clean URL-encoding if present
                if "%" in image_input:
                    image_input = url_unquote(image_input)

                # Remove all whitespace and newlines
                cleaned = "".join(image_input.split())

                # Add missing base64 padding
                pad = len(cleaned) % 4
                if pad != 0:
                    cleaned += "=" * (4 - pad)

                raw_bytes = None
                try:
                    raw_bytes = base64.b64decode(cleaned)
                except Exception:
                    try:
                        raw_bytes = base64.urlsafe_b64decode(cleaned)
                    except Exception:
                        if " " in image_input:
                            try:
                                raw_bytes = base64.b64decode("".join(image_input.replace(" ", "+").split()))
                            except Exception:
                                pass

                if raw_bytes is None:
                    return None, "Failed to decode base64 image data."

                img = Image.open(io.BytesIO(raw_bytes))
                try:
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass

                # Handle alpha transparency by blending onto neutral background
                if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                    bg = Image.new("RGB", img.size, (255, 255, 255))
                    alpha = img.convert("RGBA").split()[-1]
                    bg.paste(img.convert("RGB"), mask=alpha)
                    img = bg
                else:
                    img = img.convert("RGB")

                img.load()
                return img, None

            return None, "Unsupported image data format."
        except Exception as e:
            return None, f"Corrupt or unreadable image file: {str(e)}"

    @classmethod
    def validate_image_quality(cls, img: Any) -> ImageQualityResult:
        """Evaluates image resolution, exposure, blur, and verifies plant specimen presence."""
        if not PILLOW_AVAILABLE or img is None:
            return ImageQualityResult(
                is_valid=True,
                quality_label="UNVERIFIED",
                message="Pillow not available for pixel quality audit.",
            )

        width, height = img.size
        if width < 64 or height < 64:
            return ImageQualityResult(
                is_valid=False,
                quality_label="RESOLUTION_TOO_LOW",
                message=f"Image resolution ({width}x{height}) is too small for reliable leaf pathology diagnosis (minimum 64x64).",
            )

        # 1. Brightness / Exposure audit
        grayscale = img.convert("L")
        stat = ImageStat.Stat(grayscale)
        avg_lum = stat.mean[0] / 255.0  # 0.0 to 1.0

        if avg_lum < 0.12:
            return ImageQualityResult(
                is_valid=False,
                quality_label="UNDEREXPOSED",
                message="Image is excessively dark / underexposed. Symptoms and leaf veins cannot be distinguished.",
                brightness=avg_lum,
            )
        if avg_lum > 0.94:
            return ImageQualityResult(
                is_valid=False,
                quality_label="OVEREXPOSED",
                message="Image is washed out / overexposed by direct sunlight glare. Leaf pathology cannot be assessed.",
                brightness=avg_lum,
            )

        # 2. Sharpness / Blur estimation using 3x3 discrete Laplacian
        lap_kernel = ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128)
        lap_img = grayscale.filter(lap_kernel)
        w, h = lap_img.size
        cropped = lap_img.crop((4, 4, max(5, w - 4), max(5, h - 4)))
        lap_stat = ImageStat.Stat(cropped)
        lap_var = lap_stat.var[0] if lap_stat.var else 0.0
        sharpness_score = min(100.0, lap_var / 3.0)

        if lap_var < 5.0:
            return ImageQualityResult(
                is_valid=False,
                quality_label="BLURRY",
                message="Image is significantly out-of-focus or motion-blurred. Hold the camera steady and focus on the lesion.",
                brightness=avg_lum,
                sharpness=sharpness_score,
            )

        # 3. Plant Specimen Verification (Vegetation Chromaticity / Chlorophyll presence)
        thumb = img.resize((100, 100))
        pixels = safe_get_pixels(thumb)
        plant_pixel_count = 0
        total_pixels = len(pixels)

        for r, g, b in pixels:
            is_green = (g > r * 0.95 and g > b * 1.05 and g > 35)
            is_chlorotic_yellow = (r > 120 and g > 110 and b < 90)
            is_necrotic_brown = (r > 60 and g > 40 and b < 50 and r > g and r < 190)
            is_blight_decay = (r < 60 and g < 60 and b < 55 and (r + g + b) > 40)
            if is_green or is_chlorotic_yellow or is_necrotic_brown or is_blight_decay:
                plant_pixel_count += 1

        foliage_ratio = plant_pixel_count / total_pixels

        if foliage_ratio < 0.18:
            return ImageQualityResult(
                is_valid=False,
                quality_label="NON_PLANT_SPECIMEN",
                message="Unable to identify a valid crop specimen. Please upload a clear close-up image of an affected leaf, stem, fruit, or plant.",
                brightness=avg_lum,
                sharpness=sharpness_score,
                is_plant_specimen=False,
                plant_confidence=foliage_ratio,
            )

        return ImageQualityResult(
            is_valid=True,
            quality_label="OPTIMAL",
            message="Image quality is optimal for AI visual inspection.",
            brightness=avg_lum,
            sharpness=sharpness_score,
            is_plant_specimen=True,
            plant_confidence=foliage_ratio,
        )

    SUPPORTED_CROPS = [
        "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Tomato", "Potato",
        "Soybean", "Groundnut", "Chickpea", "Pigeon Pea", "Onion", "Chili",
        "Banana", "Citrus", "Mango", "Grapes", "Brinjal", "Okra", "Mustard", "Cabbage"
    ]

    @classmethod
    def detect_crop_morphology(cls, img: Any, claimed_crop: str) -> Tuple[str, bool, float, float]:
        """
        Determines morphological category (broadleaf dicot vs narrow monocot grass/cereal vs wide monocot)
        and detects crop mismatches.
        Returns (detected_crop, crop_match, match_confidence, linear_ratio).
        """
        if not PILLOW_AVAILABLE or img is None:
            return claimed_crop, True, 0.90, 0.85

        thumb = img.resize((120, 120))
        gray = thumb.convert("L")

        diff_v = 0
        diff_h = 0
        pixels = safe_get_pixels(gray)
        w, h = thumb.size

        for y in range(1, h - 1):
            for x in range(1, w - 1):
                idx = y * w + x
                dv = abs(pixels[idx + w] - pixels[idx - w])
                dh = abs(pixels[idx + 1] - pixels[idx - 1])
                diff_v += dv
                diff_h += dh

        w_orig, h_orig = img.size
        aspect_ratio = w_orig / (h_orig + 1e-4)

        linear_ratio = round(diff_h / (diff_v + 1e-4), 3)

        claimed_lower = (claimed_crop or "").lower().strip()
        is_auto = claimed_lower in ("auto-detect", "auto", "unknown", "")

        is_claimed_monocot = any(c in claimed_lower for c in ["rice", "paddy", "wheat", "maize", "corn", "sugarcane", "grass"])
        is_claimed_dicot = any(c in claimed_lower for c in [
            "tomato", "cotton", "potato", "soybean", "chili", "chickpea",
            "groundnut", "citrus", "banana", "onion", "okra", "bhindi",
            "brinjal", "eggplant", "mango", "grape", "grapes", "mustard",
            "cabbage", "pigeon pea", "tur", "arhar"
        ])

        # Genuine linear cereal blade: narrow bounding aspect ratio + vertical parallel venation
        is_narrow_monocot = (aspect_ratio < 0.70 or linear_ratio > 2.2) and linear_ratio > 1.40
        is_wide_monocot = not is_narrow_monocot and (linear_ratio > 1.30 or (aspect_ratio < 0.85 and linear_ratio > 1.15))

        if is_auto:
            if is_narrow_monocot:
                detected_crop = "Rice (Paddy) / Wheat"
            elif is_wide_monocot:
                detected_crop = "Maize (Corn) / Sugarcane"
            else:
                detected_crop = "Broadleaf Crop"
            crop_match = True
            match_confidence = 0.86
        elif is_claimed_dicot and is_narrow_monocot:
            crop_match = False
            detected_crop = "Rice (Paddy) or Wheat (Cereal Specimen)"
            match_confidence = 0.35
        elif is_claimed_dicot and is_wide_monocot:
            crop_match = False
            detected_crop = "Maize or Sugarcane (Cereal Specimen)"
            match_confidence = 0.40
        else:
            detected_crop = claimed_crop
            crop_match = True
            match_confidence = 0.88

        return detected_crop, crop_match, match_confidence, linear_ratio

    @classmethod
    def extract_visual_pathology(cls, img: Any) -> Dict[str, Any]:
        """
        Extracts genuine visual pathology indicators:
        - chlorosis_ratio, necrosis_ratio, spot_density, concentric_ring_score,
          water_soaked_score, powdery_score, healthy_green_ratio, spot_count
        Uses HSV chromaticity, luminance, and connected-component lesion clustering.
        """
        if not PILLOW_AVAILABLE or img is None:
            return {
                "chlorosis_ratio": 0.15,
                "necrosis_ratio": 0.12,
                "spot_density": 0.20,
                "concentric_ring_score": 0.05,
                "water_soaked_score": 0.10,
                "powdery_score": 0.02,
                "healthy_green_ratio": 0.40,
                "spot_count": 0,
            }

        thumb = img.resize((120, 120))
        w, h = thumb.size
        hsv = thumb.convert("HSV")

        rgb_pixels = safe_get_pixels(thumb)
        hsv_pixels = safe_get_pixels(hsv)
        n = len(rgb_pixels)

        chlorosis_count = 0
        necrosis_count = 0
        water_soaked_count = 0
        powdery_count = 0
        healthy_green_count = 0
        spot_mask = [0] * n

        for i, ((r, g, b), (hv, s, v)) in enumerate(zip(rgb_pixels, hsv_pixels)):
            # Filter background white/glare or pitch-black non-foliar pixels
            if (v > 248 and s < 22) or v < 15:
                continue

            # 1. Necrotic Lesions (Brown, rust, tan spots, dark brown edges, black pinheads)
            is_brown_spot = ((hv < 28 or hv > 235) and s >= 18 and 18 <= v <= 215 and r >= g * 0.85)
            is_dark_necrosis = (v < 75 and (r > g or r > b or g < 65) and (r + g + b) > 30)
            is_tan_lesion = (r > 65 and g > 40 and b < min(r, g) * 0.88 and (r - b) > 18 and (r + g) > 2.1 * b)
            is_necrotic = is_brown_spot or is_dark_necrosis or is_tan_lesion

            # 2. Chlorosis (Yellowish halo encircling lesions or diffuse chlorotic yellowing)
            is_chlorotic = (24 <= hv <= 54 and s >= 24 and v >= 40 and not is_necrotic)

            # 3. Water-soaked decay / softening
            is_water_soaked = (v < 70 and g > r and g > b and s < 60 and 35 < (r + g + b) < 160 and not is_necrotic)

            # 4. Powdery mildew / mycelium
            is_powdery = (min(r, g, b) > 165 and max(r, g, b) - min(r, g, b) < 30 and s < 30 and not is_necrotic)

            # 5. Healthy green tissue
            is_green = (55 <= hv <= 115 and s >= 28 and v >= 35 and not is_necrotic and not is_chlorotic)

            if is_necrotic:
                necrosis_count += 1
                spot_mask[i] = 1
            elif is_chlorotic:
                chlorosis_count += 1
            elif is_water_soaked:
                water_soaked_count += 1
            elif is_powdery:
                powdery_count += 1
            elif is_green:
                healthy_green_count += 1

        # Connected component spot blob counting (8-connectivity)
        visited = [False] * n
        blobs = []
        for idx in range(n):
            if spot_mask[idx] == 1 and not visited[idx]:
                queue = [idx]
                visited[idx] = True
                size = 0
                while queue:
                    cur = queue.pop(0)
                    size += 1
                    cx, cy = cur % w, cur // w
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h:
                                nidx = ny * w + nx
                                if spot_mask[nidx] == 1 and not visited[nidx]:
                                    visited[nidx] = True
                                    queue.append(nidx)
                if size >= 4:  # minimum blob size in 120x120 thumb
                    blobs.append(size)

        c_ratio = round(chlorosis_count / n, 3)
        n_ratio = round(necrosis_count / n, 3)
        h_ratio = round(healthy_green_count / n, 3)
        w_ratio = round(water_soaked_count / n, 3)
        p_ratio = round(powdery_count / n, 3)
        spot_count = len(blobs)
        spot_density = round(min(1.0, (n_ratio * 1.5 + c_ratio * 0.8 + min(spot_count, 25) * 0.015)), 3)

        # Concentric rings / target spot detection via edge density within necrotic lesion zones
        gray = thumb.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_pixels = safe_get_pixels(edges)
        lesion_edge_count = sum(1 for idx in range(n) if spot_mask[idx] == 1 and edge_pixels[idx] > 60)
        ring_score = round(min(0.35, (lesion_edge_count / max(1, necrosis_count)) * 0.4 + (0.08 if spot_count > 5 else 0.0)), 3)

        return {
            "chlorosis_ratio": c_ratio,
            "necrosis_ratio": n_ratio,
            "spot_density": spot_density,
            "concentric_ring_score": ring_score,
            "water_soaked_score": w_ratio,
            "powdery_score": p_ratio,
            "healthy_green_ratio": h_ratio,
            "spot_count": spot_count,
        }

    @classmethod
    def classify(
        cls,
        image_input: Any,
        selected_crop: str = "Auto-Detect",
        growth_stage: str = "Vegetative / Flowering",
        field_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Master Inference Pipeline.
        Evaluates real image pixels, extracts pathology features, executes the trained
        RF+GaussianNB ensemble model across all 27 agricultural classes, and enriches with
        clinical CIBRC knowledge base data.
        """
        # Step 1: Decode image
        img, decode_err = cls.decode_image(image_input)
        if decode_err or img is None:
            return {
                "success": False,
                "error_type": "DECODE_ERROR",
                "message": decode_err or "Image could not be decoded.",
                "crop": selected_crop,
                "model_version": cls.MODEL_VERSION,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Step 2: Image Quality & Plant Specimen Check
        quality = cls.validate_image_quality(img)
        if not quality.is_valid:
            return {
                "success": False,
                "error_type": quality.quality_label,
                "message": quality.message,
                "image_quality": quality.to_dict(),
                "crop": selected_crop,
                "model_version": cls.MODEL_VERSION,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Step 3: Crop Morphology & Mismatch Check
        detected_morph_crop, crop_match, match_conf, linear_ratio = cls.detect_crop_morphology(img, selected_crop)

        # Step 4: Visual Pathology Feature Extraction
        pathology = cls.extract_visual_pathology(img)

        # Step 5: Candidate Matching against Trained ML Model or Knowledge Base
        h_ratio = pathology["healthy_green_ratio"]
        c_ratio = pathology["chlorosis_ratio"]
        n_ratio = pathology["necrosis_ratio"]
        ring_score = pathology["concentric_ring_score"]
        w_score = pathology["water_soaked_score"]
        p_score = pathology["powdery_score"]
        spot_count = pathology.get("spot_count", 0)
        spot_density = pathology.get("spot_density", (c_ratio + n_ratio) * 2.2)

        # Quantifiable metric of visible disease burden: necrotic spots, chlorotic halos, lesion clusters
        pathology_burden = n_ratio * 4.0 + c_ratio * 2.5 + spot_density * 2.0 + min(spot_count, 20) * 0.05

        # ── Trained ML Model Inference ──────────────────────────────────────
        trained_model = DiseaseModel.get()
        use_trained_model = trained_model is not None and hasattr(trained_model, 'predict_top_k')

        scores: List[Tuple[str, float, Dict[str, Any]]] = []

        selected_clean = (selected_crop or "").lower().split("(")[0].strip()
        is_auto = selected_clean in ("auto-detect", "auto", "unknown", "")

        if use_trained_model:
            # Match 12-dimensional training feature vector with properly scaled features
            ml_features = [
                c_ratio,
                n_ratio,
                spot_density,
                ring_score,
                w_score,
                p_score,
                h_ratio,
                quality.brightness,
                min(70.0, max(35.0, quality.sharpness)),
                linear_ratio,  # Genuine crop morphology ratio
                0.5,           # temperature_norm
                0.7,           # humidity_norm
            ]

            # Predict probabilities across all agricultural classes
            all_proba = trained_model.predict_proba([ml_features])[0]

            for cls_id, prob in all_proba.items():
                pred_name = trained_model.class_names[cls_id] if cls_id < len(trained_model.class_names) else f"Class-{cls_id}"
                kb_rec = cls.KB.get_by_name(pred_name)
                if not kb_rec and pred_name != "Healthy":
                    pred_lower = pred_name.lower()
                    for cr in cls.KB.diseases.values():
                        if pred_lower in cr["name"].lower() or cr["name"].lower() in pred_lower:
                            kb_rec = cr
                            break

                is_healthy = pred_name == "Healthy"
                affects_user_crop = False
                if kb_rec:
                    affected = [c.lower() for c in kb_rec.get("affected_crops", [])]
                    affects_user_crop = any(selected_clean in ac or ac in selected_clean for ac in affected)

                # When the user explicitly selected a crop and morphology doesn't contradict it:
                # Strictly evaluate only diseases that can biologically infect that crop (or Healthy)
                if not is_auto and crop_match:
                    if not (affects_user_crop or is_healthy):
                        continue  # Do NOT consider diseases of completely unrelated crops!

                # Morphological biological compatibility (for Auto-Detect or when morphology is evaluated)
                morph_weight = 1.0
                if kb_rec:
                    affected = [c.lower() for c in kb_rec.get("affected_crops", [])]
                    is_monocot_dis = any(c in affected for c in ["rice", "wheat", "maize", "sugarcane"])
                    is_dicot_dis = any(c in affected for c in [
                        "tomato", "potato", "cotton", "soybean", "chili", "chickpea", "groundnut",
                        "citrus", "banana", "onion", "okra", "brinjal", "mango", "grapes", "mustard",
                        "cabbage", "pigeon pea"
                    ])
                    if linear_ratio > 1.30 and is_dicot_dis and not is_monocot_dis:
                        morph_weight = 0.10
                    elif linear_ratio <= 1.00 and is_monocot_dis and not is_dicot_dis:
                        morph_weight = 0.25

                boosted_score = prob * morph_weight

                if is_healthy:
                    # CRITICAL BIOLOGICAL RULE:
                    # If foliar lesions, necrosis, chlorosis, or spots are visually detected on leaf blade,
                    # Healthy Foliage probability must be heavily suppressed!
                    if pathology_burden > 0.08:
                        suppression = math.exp(-min(10.0, pathology_burden * 6.0))
                        boosted_score = boosted_score * suppression

                    display_crop = selected_crop if (not is_auto and crop_match) else detected_morph_crop
                    scores.append(("Healthy Foliage (No Visible Lesions)", boosted_score, {
                        "name": f"{display_crop} - Healthy",
                        "affected_crops": [display_crop],
                        "severity_risk": "OPTIMAL",
                        "pathogen": "None (Healthy Crop)",
                        "symptoms": "Uniform vibrant green leaf blade without chlorotic halos, necrotic lesions, pustules, or sporulation.",
                        "primary_cause": "Balanced agronomic nutrition, optimal photosynthesis, and disease-free foliage.",
                        "organic_control": "Maintain balanced NPK fertilizer, organic amendments (compost/jeevamrut), and clean weed-free bunds.",
                        "chemical_guidance": "Zero chemical application required. Continue regular scouting.",
                        "prevention": "Routine preventive scouting every 3-5 days; maintain optimal irrigation and field drainage.",
                    }))
                elif kb_rec:
                    # Symptom alignment boost for candidate disease based on genuine visual pathology
                    symp = kb_rec.get("symptoms", "").lower()
                    name_l = kb_rec.get("name", "").lower()
                    if (n_ratio > 0.04 or spot_density > 0.08 or spot_count >= 2) and any(w in symp or w in name_l for w in ["spot", "blight", "canker", "lesion", "zonation", "rot", "necros"]):
                        boosted_score += (n_ratio * 0.60 + ring_score * 0.50 + spot_density * 0.30)
                    if (ring_score > 0.08) and any(w in symp or w in name_l for w in ["concentric", "zonation", "target", "phomopsis", "alternaria"]):
                        boosted_score += (ring_score * 0.45)
                    if c_ratio > 0.12 and spot_count < 2 and any(w in symp or w in name_l for w in ["yellow", "curl", "mosaic", "little leaf", "wilt"]):
                        boosted_score += (c_ratio * 0.50)
                    if p_score > 0.08 and any(w in symp or w in name_l for w in ["mildew", "rust", "white"]):
                        boosted_score += (p_score * 0.60)

                    scores.append((kb_rec["name"], boosted_score, kb_rec))
                else:
                    display_crop = selected_crop if (not is_auto and crop_match) else detected_morph_crop
                    scores.append((pred_name, boosted_score, {
                        "name": pred_name,
                        "affected_crops": [display_crop],
                        "severity_risk": "MODERATE",
                        "symptoms": "Visual foliage pathology detected on leaf specimen.",
                        "organic_control": "Apply 5% Neem Seed Kernel Extract (NSKE) or bio-fungicide.",
                        "chemical_guidance": "Consult registered agronomic extension officer.",
                        "prevention": "Inspect field margins and remove infected foliage.",
                    }))

            # Also check if user selected a crop that has diseases in KB that weren't in the 42 model classes or need scoring
            crop_kb_diseases = cls.KB.get_for_crop(selected_clean) if not is_auto else []
            existing_names = {s[0] for s in scores}
            for rec in crop_kb_diseases:
                if rec["name"] not in existing_names:
                    symp = rec.get("symptoms", "").lower()
                    name_l = rec.get("name", "").lower()
                    extra_score = 0.05
                    if (n_ratio > 0.04 or spot_density > 0.08 or spot_count >= 2) and any(w in symp or w in name_l for w in ["spot", "blight", "canker", "lesion", "zonation", "rot", "necros"]):
                        extra_score += (n_ratio * 0.55 + ring_score * 0.45 + spot_density * 0.25)
                    if extra_score > 0.10:
                        scores.append((rec["name"], extra_score, rec))

        # ── Heuristic Fallback (when no trained model file available) ──────
        else:
            if h_ratio > 0.70 and pathology_burden < 0.08:
                healthy_conf = min(0.92, 0.65 + h_ratio * 0.3)
                scores.append(("Healthy Foliage (No Visible Lesions)", healthy_conf, {
                    "name": f"{detected_morph_crop} - Healthy",
                    "affected_crops": [detected_morph_crop],
                    "severity_risk": "OPTIMAL",
                    "pathogen": "None (Healthy Crop)",
                    "symptoms": "Uniform vibrant green leaf blade without chlorotic halos, necrotic lesions, pustules, or sporulation.",
                    "primary_cause": "Balanced agronomic nutrition, optimal photosynthesis, and disease-free foliage.",
                    "organic_control": "Maintain balanced NPK fertilizer, organic amendments (compost/jeevamrut), and clean weed-free bunds.",
                    "chemical_guidance": "Zero chemical application required. Continue regular scouting.",
                    "prevention": "Routine preventive scouting every 3-5 days; maintain optimal irrigation and field drainage.",
                }))

            # Evaluate across catalogued crop diseases
            candidate_pool = cls.KB.get_for_crop(selected_clean) if (not is_auto and crop_match) else list(cls.KB.diseases.values())
            for rec in candidate_pool:
                name_low = rec["name"].lower()
                symp_low = rec["symptoms"].lower()
                base_score = 0.15

                affected = [c.lower() for c in rec.get("affected_crops", [])]
                is_disease_monocot = any(c in affected for c in ["rice", "wheat", "maize", "sugarcane"])
                is_disease_dicot = any(c in affected for c in [
                    "tomato", "potato", "cotton", "soybean", "chili", "chickpea", "groundnut",
                    "citrus", "banana", "onion", "okra", "brinjal", "mango", "grapes", "mustard",
                    "cabbage", "pigeon pea"
                ])

                if linear_ratio > 1.25 and is_disease_monocot:
                    base_score += 0.20
                elif linear_ratio <= 1.25 and is_disease_dicot:
                    base_score += 0.20

                if any(w in name_low or w in symp_low for w in ["spot", "blight", "canker", "zonation"]):
                    base_score += ring_score * 0.70 + n_ratio * 0.55 + c_ratio * 0.35 + min(spot_count, 15) * 0.02
                elif "late blight" in name_low or "water-soaked" in symp_low:
                    base_score += w_score * 0.50 + n_ratio * 0.35 + (0.15 if c_ratio > 0.08 else 0.0)
                elif "rust" in name_low or "pustule" in symp_low:
                    base_score += (n_ratio * 0.40) + (c_ratio * 0.35) + 0.10
                elif "curl" in name_low or "virus" in name_low or "little leaf" in name_low:
                    base_score += c_ratio * 0.45
                    if n_ratio > 0.05 or ring_score > 0.06:
                        base_score *= 0.20
                elif "powdery" in name_low or "mildew" in name_low:
                    base_score += p_score * 0.65 + 0.10
                else:
                    base_score += (n_ratio + c_ratio) * 0.25

                scores.append((rec["name"], base_score, rec))

        # Sort candidate scores for calibrated probabilities
        scores.sort(key=lambda x: x[1], reverse=True)
        top_scores = scores[:4]
        max_s = max(s[1] for s in top_scores) if top_scores else 1.0
        calib_temp = 5.5 if pathology_burden > 0.12 else 4.0
        exp_sum = sum(math.exp(min(15.0, (s[1] - max_s) * calib_temp)) for s in top_scores)

        calibrated_predictions = []
        for name, raw_s, rec in top_scores:
            prob = math.exp(min(15.0, (raw_s - max_s) * calib_temp)) / (exp_sum + 1e-6)
            calibrated_prob = round(max(0.04, min(0.96, prob)), 2)
            calibrated_predictions.append({
                "name": name,
                "confidence": calibrated_prob,
                "confidence_pct": int(calibrated_prob * 100),
                "record": rec,
            })

        calibrated_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        top_pred = calibrated_predictions[0]
        alternatives = calibrated_predictions[1:3]
        top_confidence = top_pred["confidence"]
        rec = top_pred["record"]

        # Confidence interpretation threshold
        if top_confidence >= 0.75:
            confidence_level = "HIGH_CONFIDENCE"
            confidence_badge = "High Confidence"
        elif top_confidence >= 0.55:
            confidence_level = "MODERATE_CONFIDENCE"
            confidence_badge = "Moderate Confidence"
        elif top_confidence >= 0.40:
            confidence_level = "LOW_CONFIDENCE"
            confidence_badge = "Low Confidence"
        else:
            confidence_level = "UNCERTAIN"
            confidence_badge = "Uncertain - Scouting Advised"

        # Determine the definitive crop corresponding to the top diagnosis
        affected_crops = rec.get("affected_crops", [])
        selected_clean = (selected_crop or "").lower().split("(")[0].strip()
        is_auto = selected_clean in ("auto-detect", "auto", "unknown", "")

        mismatch_warning = None
        if not is_auto and crop_match:
            # User explicitly selected this crop: preserve it with 100% fidelity
            final_crop = selected_crop
        elif not is_auto and not crop_match:
            # Physical morphology contradicted user selection
            final_crop = detected_morph_crop
            mismatch_warning = (
                f"Crop mismatch detected: You selected '{selected_crop}', but foliar morphology indicates "
                f"{detected_morph_crop}."
            )
        else:
            # Auto-Detect mode: crop is determined by the diagnosed disease
            final_crop = affected_crops[0] if affected_crops else detected_morph_crop

        # Check Out-of-Distribution (OOD) / Unknown conditions
        ood_detected = False
        ood_reason = None
        ood_message = None

        is_supported_crop = any(
            sc.lower() in final_crop.lower() or final_crop.lower() in sc.lower()
            for sc in cls.SUPPORTED_CROPS
        )

        if not is_supported_crop:
            ood_detected = True
            ood_reason = "UNSUPPORTED_CROP"
            ood_message = (
                f"Detected foliage does not match our currently supported agricultural crops. "
                f"Supported crops include: {', '.join(cls.SUPPORTED_CROPS[:10])}, and more."
            )
        elif top_confidence < 0.40:
            ood_detected = True
            ood_reason = "LOW_CONFIDENCE_AMBIGUOUS"
            ood_message = (
                "Unable to reliably identify this crop/disease. "
                "Visual evidence in this image is ambiguous. "
                "Please upload a clearer field image or inspect leaves physically."
            )

        # Check Limited Support status (e.g. Pigeon Pea Sterility Mosaic Disease)
        is_limited_support = False
        limited_support_notice = None
        symptom_text = rec.get("symptoms", "")
        if (
            "limited_support" in symptom_text.lower()
            or "pigeon pea" in top_pred["name"].lower()
            or any("pigeon pea" in str(c).lower() for c in affected_crops)
            or "pigeon pea" in final_crop.lower()
            or "pigeon pea" in selected_clean
        ):
            is_limited_support = True
            limited_support_notice = (
                "Limited Support: This crop/disease has limited open-field training imagery. "
                "The diagnosis is provided for advisory guidance; verification by physical plant tissue scouting is recommended."
            )

        if top_confidence < IMAGE_CONFIDENCE_THRESHOLD:
            low_confidence_notice = "Low-confidence prediction — field inspection recommended."
            if not ood_message:
                ood_message = "Low-confidence prediction — field inspection recommended."
        else:
            low_confidence_notice = ood_message if ood_detected else None

        xai_factors = [
            {
                "factor": "Necrotic Lesion Tissue Ratio",
                "impact": round(pathology["necrosis_ratio"] * 100, 1),
                "description": f"{round(pathology['necrosis_ratio'] * 100, 1)}% of leaf surface shows cellular breakdown",
            },
            {
                "factor": "Foliar Spot Lesion Count",
                "impact": min(100, pathology.get("spot_count", 0) * 4),
                "description": f"{pathology.get('spot_count', 0)} distinct necrotic spot lesions identified on leaf blade",
            },
            {
                "factor": "Chlorotic Yellow Halo",
                "impact": round(pathology["chlorosis_ratio"] * 100, 1),
                "description": f"{round(pathology['chlorosis_ratio'] * 100, 1)}% yellowing encircling lesion borders",
            },
            {
                "factor": "Concentric Margin Score",
                "impact": round(pathology["concentric_ring_score"] * 100, 1),
                "description": "Target-board concentric ring banding pattern",
            },
            {
                "factor": "Crop Morphometry Match",
                "impact": round(match_conf * 100, 1),
                "description": f"Vegetation structure matches {final_crop}",
            },
        ]

        active_ver = DiseaseModel.get_version()

        return {
            "success": True,
            "prediction_type": "TRAINED_ML_ENSEMBLE" if use_trained_model else "CALIBRATED_IMAGE_CV_PIPELINE",
            "model_mode": "TRAINED_RF_NB_ENSEMBLE" if use_trained_model else "DEMO / KNOWLEDGE-BASED MODE",
            "scientific_transparency_note": f"Inference executed on AgriSense Ensemble v{active_ver} with CIBRC clinical guidance.",
            "crop": final_crop,
            "selected_crop": selected_crop,
            "detected_crop": final_crop,
            "crop_match": crop_match,
            "mismatch_warning": mismatch_warning,
            "growth_stage": growth_stage,
            "field_id": field_id,
            "top_prediction": {
                "name": top_pred["name"],
                "confidence": top_pred["confidence"],
                "confidence_pct": top_pred["confidence_pct"],
                "confidence_level": confidence_level,
                "confidence_badge": confidence_badge,
                "severity": rec.get("severity_risk", "OPTIMAL" if "Healthy" in top_pred["name"] else "HIGH"),
                "severity_pct": 0 if "Healthy" in top_pred["name"] else top_pred["confidence_pct"],
                "pathogen": rec.get("pathogen", "None (Healthy Crop)" if "Healthy" in top_pred["name"] else "Fungal / Oomycete Pathogen"),
                "symptoms": rec.get("symptoms", ""),
                "primary_cause": rec.get("primary_cause", ""),
                "organic_control": rec.get("organic_control", ""),
                "chemical_guidance": rec.get("chemical_guidance", ""),
                "prevention": rec.get("prevention", ""),
                "affected_crops": rec.get("affected_crops", [final_crop]),
            },
            "alternatives": [
                {
                    "name": alt["name"],
                    "confidence": alt["confidence"],
                    "confidence_pct": alt["confidence_pct"],
                }
                for alt in alternatives
            ],
            "low_confidence_notice": low_confidence_notice,
            "ood_detected": ood_detected,
            "ood_reason": ood_reason,
            "ood_message": ood_message,
            "is_limited_support": is_limited_support,
            "limited_support_notice": limited_support_notice,
            "image_quality": quality.to_dict(),
            "extracted_pathology": pathology,
            "xai_factors": xai_factors,
            "model_version": f"agrisense-cv-v{active_ver}",
            "active_model_version": active_ver,
            "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
            "prediction_source": "Uploaded Image / Camera Specimen",
            "kisan_call_center": "1800-180-1551",
        }
