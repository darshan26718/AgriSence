"""
backend/test_image_model.py - Automated Computer Vision Test Suite for AgriSense
Tests:
  1. Healthy leaf specimen (Should predict Healthy / No severe lesion)
  2. Known disease specimen (Tomato Early Blight with concentric necrotic lesion)
  3. Crop mismatch detection (Monocot grass leaf uploaded with Dicot Tomato selected)
  4. Pest specimen & damage patterns (Bollworm bore hole on Cotton)
  5. Non-plant image rejection (Synthetic non-foliage object)
  6. Blurry image quality rejection
  7. Underexposed / dark image quality rejection
"""

import os
import io
import sys
import unittest
from PIL import Image, ImageDraw, ImageFilter

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from image_classifier import ImageClassifier, DiseaseModel
from pest_classifier import PestClassifier


def create_healthy_leaf_image() -> bytes:
    """Creates a synthetic 200x200 vibrant green leaf specimen."""
    img = Image.new("RGB", (200, 200), (34, 139, 34))  # Forest green
    draw = ImageDraw.Draw(img)
    # Draw leaf vein network in lighter green
    draw.line([(100, 20), (100, 180)], fill=(80, 200, 80), width=3)
    draw.line([(100, 60), (40, 90)], fill=(70, 180, 70), width=2)
    draw.line([(100, 60), (160, 90)], fill=(70, 180, 70), width=2)
    draw.line([(100, 110), (30, 140)], fill=(70, 180, 70), width=2)
    draw.line([(100, 110), (170, 140)], fill=(70, 180, 70), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_early_blight_leaf_image() -> bytes:
    """Creates a tomato leaf with characteristic concentric rings & chlorotic halo."""
    img = Image.new("RGB", (220, 220), (46, 125, 50))  # Green leaf surface
    draw = ImageDraw.Draw(img)
    # Broad chlorotic bright yellow halo (Alternaria hallmark)
    draw.ellipse([(30, 30), (180, 180)], fill=(210, 200, 40))
    # Concentric dark brown/black necrotic target rings
    draw.ellipse([(50, 50), (160, 160)], fill=(101, 67, 33))
    draw.ellipse([(70, 70), (140, 140)], fill=(180, 150, 40))
    draw.ellipse([(85, 85), (125, 125)], fill=(101, 67, 33))
    draw.ellipse([(98, 98), (112, 112)], fill=(50, 30, 20))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_linear_monocot_rice_image() -> bytes:
    """Creates a tall, narrow linear rice blade with parallel vertical venation."""
    img = Image.new("RGB", (150, 260), (40, 130, 45))
    draw = ImageDraw.Draw(img)
    # Parallel vertical veins
    for x in range(20, 140, 12):
        draw.line([(x, 10), (x, 250)], fill=(60, 170, 65), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_bollworm_damage_image() -> bytes:
    """Creates a green cotton boll with a distinct dark bore entrance hole."""
    img = Image.new("RGB", (200, 200), (55, 140, 50))
    draw = ImageDraw.Draw(img)
    # Dark pin-head circular bore hole with frass
    draw.ellipse([(90, 90), (115, 115)], fill=(25, 18, 15))
    draw.ellipse([(86, 86), (119, 119)], outline=(110, 80, 40), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_non_plant_image() -> bytes:
    """Creates a synthetic metallic blue non-plant image (zero plant chromaticity)."""
    img = Image.new("RGB", (200, 200), (30, 70, 160))  # Deep metallic blue
    draw = ImageDraw.Draw(img)
    draw.rectangle([(50, 50), (150, 150)], fill=(200, 200, 210))  # Chrome box
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_blurry_image() -> bytes:
    """Creates an extremely out-of-focus Gaussian-blurred leaf."""
    img = Image.new("RGB", (200, 200), (50, 130, 50))
    # Apply severe blur
    img = img.filter(ImageFilter.GaussianBlur(radius=25))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_underexposed_image() -> bytes:
    """Creates an almost pitch black underexposed image."""
    img = Image.new("RGB", (200, 200), (12, 14, 12))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestImageModel(unittest.TestCase):

    def test_01_healthy_leaf(self):
        img_bytes = create_healthy_leaf_image()
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        self.assertTrue(res["success"])
        top_name = res["top_prediction"]["name"]
        print(f"\n[Test 1] Healthy Leaf -> Predicted: {top_name} (Conf: {res['top_prediction']['confidence_pct']}%)")
        self.assertIn("Healthy", top_name)
        self.assertGreaterEqual(res["top_prediction"]["confidence"], 0.60)

    def test_02_tomato_early_blight(self):
        img_bytes = create_early_blight_leaf_image()
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        self.assertTrue(res["success"])
        top_name = res["top_prediction"]["name"]
        print(f"[Test 2] Concentric Lesion -> Predicted: {top_name} (Conf: {res['top_prediction']['confidence_pct']}%)")
        self.assertIn("Early Blight", top_name)
        # Verify Top-3 alternatives exist
        self.assertGreaterEqual(len(res["alternatives"]), 1)
        # Verify XAI factors
        self.assertGreaterEqual(len(res["xai_factors"]), 3)

    def test_03_crop_mismatch_detection(self):
        img_bytes = create_linear_monocot_rice_image()
        # User selected Tomato (Dicot), but uploaded linear monocot grass leaf
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        self.assertTrue(res["success"])
        print(f"[Test 3] Mismatch Test -> Crop Match: {res['crop_match']}, Detected: {res['detected_crop']}")
        self.assertFalse(res["crop_match"])
        self.assertIsNotNone(res["mismatch_warning"])
        self.assertIn("Crop mismatch detected", res["mismatch_warning"])

    def test_04_pest_bore_hole(self):
        img_bytes = create_bollworm_damage_image()
        res = PestClassifier.classify(img_bytes, crop="Cotton", observed_sweep_count=14)
        self.assertTrue(res["success"])
        top_pest = res["top_prediction"]["name"]
        print(f"[Test 4] Pest Damage -> Predicted: {top_pest} (ETL Exceeded: {res['top_prediction']['is_above_etl']})")
        self.assertIn("Bollworm", top_pest)
        self.assertTrue(res["top_prediction"]["is_above_etl"])

    def test_05_non_plant_rejection(self):
        img_bytes = create_non_plant_image()
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        print(f"[Test 5] Non-Plant Image -> Success: {res['success']}, Error: {res.get('error_type')}")
        self.assertFalse(res["success"])
        self.assertEqual(res.get("error_type"), "NON_PLANT_SPECIMEN")
        self.assertIn("Unable to identify a valid crop specimen", res["message"])

    def test_06_blurry_image_rejection(self):
        img_bytes = create_blurry_image()
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        print(f"[Test 6] Blurry Image -> Success: {res['success']}, Error: {res.get('error_type')}")
        self.assertFalse(res["success"])
        self.assertEqual(res.get("error_type"), "BLURRY")

    def test_07_underexposed_image_rejection(self):
        img_bytes = create_underexposed_image()
        res = ImageClassifier.classify(img_bytes, selected_crop="Tomato")
        print(f"[Test 7] Dark Image -> Success: {res['success']}, Error: {res.get('error_type')}")
        self.assertFalse(res["success"])
        self.assertEqual(res.get("error_type"), "UNDEREXPOSED")

    def test_08_newly_supported_crops(self):
        # Create an image with chlorotic yellow vein symptoms for Okra
        img = Image.new("RGB", (200, 200), (60, 140, 45))
        draw = ImageDraw.Draw(img)
        # Draw prominent bright yellow veins
        for y in range(20, 180, 15):
            draw.line([(30, y), (170, y)], fill=(220, 200, 30), width=3)
        for x in range(30, 170, 20):
            draw.line([(x, 20), (x, 180)], fill=(220, 200, 30), width=2)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        okra_bytes = buf.getvalue()

        res = ImageClassifier.classify(okra_bytes, selected_crop="Okra")
        self.assertTrue(res["success"])
        print(f"[Test 8] Okra Specimen -> Crop: {res['crop']}, Prediction: {res['top_prediction']['name']} (Conf: {res['top_prediction']['confidence_pct']}%)")
        self.assertEqual(res["crop"], "Okra")
        # Verify Okra is correctly identified in crop or top prediction record
        pred_record_crops = res["top_prediction"].get("affected_crops", [])
        self.assertTrue(
            "Okra" in res["top_prediction"]["name"]
            or any("Okra" in c for c in pred_record_crops)
            or res["crop"] == "Okra"
        )

    def test_09_limited_support_pigeon_pea(self):
        img = Image.new("RGB", (200, 200), (45, 130, 45))
        draw = ImageDraw.Draw(img)
        # Add high-contrast veins for valid sharpness
        draw.line([(100, 15), (100, 185)], fill=(180, 210, 60), width=4)
        draw.line([(100, 60), (35, 95)], fill=(180, 210, 60), width=3)
        draw.line([(100, 60), (165, 95)], fill=(180, 210, 60), width=3)
        draw.line([(100, 120), (30, 150)], fill=(180, 210, 60), width=3)
        draw.line([(100, 120), (170, 150)], fill=(180, 210, 60), width=3)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        pp_bytes = buf.getvalue()

        res = ImageClassifier.classify(pp_bytes, selected_crop="Pigeon Pea")
        self.assertTrue(res["success"])
        print(f"[Test 9] Pigeon Pea Specimen -> Limited Support: {res.get('is_limited_support')}")
        self.assertTrue(res.get("is_limited_support"))
        self.assertIsNotNone(res.get("limited_support_notice"))

    def test_10_v2_model_registry_and_version(self):
        model = DiseaseModel.get()
        self.assertIsNotNone(model)
        self.assertEqual(len(model.class_names), 42)
        self.assertEqual(DiseaseModel.get_version(), "2.0.0")
        print(f"[Test 10] Model Registry -> Active Version: {DiseaseModel.get_version()}, Total Classes: {len(model.class_names)}")


if __name__ == "__main__":
    unittest.main()

