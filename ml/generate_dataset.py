#!/usr/bin/env python3
"""
ml/generate_dataset.py - 10,000-Record Agriculturally Consistent Dataset Generator for AgriSense

Generates approximately 10,000 unique, agriculturally realistic field-observation records
with authentic agronomic relationships between microclimate, soil chemistry, crop phenology,
pathogen pathology, pest dynamics, NDVI, severity, and risk scores.

Outputs:
  dataset/agrisense_training_dataset.csv
  dataset/raw/agrisense_training_dataset_raw.csv (immutable archive)
"""

import os
import sys
import math
import random
import csv
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "agrisense_training_dataset.csv")
RAW_ARCHIVE_PATH = os.path.join(WORKSPACE_ROOT, "dataset", "raw", "agrisense_training_dataset_raw.csv")

# Crop-specific varieties, typical growth stages, soils, and regional distribution
CROP_SPECS = {
    "Rice": {
        "varieties": ["Basmati-Super", "IR-64 High-Yield", "Swarna Medium", "MTU-1010", "Pusa-44"],
        "stages": [("Seedling", 10, 25), ("Tillering", 25, 55), ("Panicle Initiation", 55, 75), ("Booting", 75, 90), ("Heading", 90, 105), ("Milking", 105, 120), ("Maturity", 120, 140)],
        "soils": ["Clay Loam", "Alluvial", "Clay"],
        "states_districts": [("Punjab", "Ludhiana"), ("Haryana", "Karnal"), ("West Bengal", "Burdwan"), ("Andhra Pradesh", "Krishna"), ("Telangana", "Warangal"), ("Uttar Pradesh", "Varanasi")],
        "temp_range": (20.0, 36.0),
        "moisture_pref": (65, 95),
        "diseases": [
            ("Rice Blast", "Fungus", (22.0, 29.0), (85, 98), 6, "Apply Tricyclazole 75 WP @ 0.6g/L; drain excess water"),
            ("Bacterial Leaf Blight", "Bacteria", (27.0, 35.0), (80, 95), 4, "Apply Copper Oxychloride 50 WP with Streptomycin; ensure drainage"),
            ("Rice Sheath Blight", "Fungus", (26.0, 33.0), (85, 98), 7, "Apply Validamycin 3L @ 2.5ml/L; optimize plant spacing"),
        ],
        "pests": [
            ("Brown Planthopper", (26.0, 33.0), (70, 90), "Tillering", "Apply Pymetrozine 50 WG @ 0.6g/L; alternate wetting and drying"),
            ("Yellow Stem Borer", (24.0, 32.0), (60, 85), "Tillering", "Apply Cartap hydrochloride 4G; install light traps"),
        ],
    },
    "Wheat": {
        "varieties": ["HD-2967 Prime", "PBW-550 Early", "Sharbati Gold", "DBW-187", "WH-1105"],
        "stages": [("Seedling", 10, 20), ("Crown Root", 20, 35), ("Tillering", 35, 55), ("Jointing", 55, 75), ("Heading", 75, 95), ("Milking", 95, 115), ("Maturity", 115, 135)],
        "soils": ["Alluvial", "Loam", "Clay Loam"],
        "states_districts": [("Punjab", "Patiala"), ("Haryana", "Hisar"), ("Uttar Pradesh", "Meerut"), ("Madhya Pradesh", "Sehore"), ("Rajasthan", "Kota")],
        "temp_range": (10.0, 28.0),
        "moisture_pref": (45, 75),
        "diseases": [
            ("Wheat Yellow Rust", "Fungus", (12.0, 20.0), (75, 95), 5, "Foliar spray of Propiconazole 25 EC @ 1ml/L at first stripe sighting"),
            ("Wheat Brown Rust", "Fungus", (18.0, 26.0), (70, 90), 4, "Apply Tebuconazole 250 EC @ 1ml/L; monitor flag leaves"),
            ("Wheat Powdery Mildew", "Fungus", (15.0, 22.0), (65, 85), 3, "Apply Wettable Sulfur (0.2%) or Hexaconazole 5 EC"),
        ],
        "pests": [
            ("Aphids", (15.0, 25.0), (45, 75), "Heading", "Spray Thiamethoxam 25 WG @ 0.3g/L or 5% neem extract"),
            ("Termites", (18.0, 30.0), (30, 60), "Seedling", "Apply Chlorpyrifos 20 EC or Fipronil 5 SC in irrigation furrow"),
        ],
    },
    "Cotton": {
        "varieties": ["RCH-659 Hybrid", "Bt-Cotton-II", "Bollgard-II", "Suraj", "Bunny Bt"],
        "stages": [("Seedling", 10, 25), ("Vegetative", 25, 50), ("Square Formation", 50, 75), ("Flowering", 75, 95), ("Boll Formation", 95, 125), ("Boll Bursting", 125, 160)],
        "soils": ["Black Soil", "Medium Black", "Deep Clay"],
        "states_districts": [("Maharashtra", "Nagpur"), ("Gujarat", "Rajkot"), ("Andhra Pradesh", "Guntur"), ("Telangana", "Warangal"), ("Punjab", "Bathinda")],
        "temp_range": (24.0, 40.0),
        "moisture_pref": (45, 75),
        "diseases": [
            ("Cotton Bacterial Blight", "Bacteria", (28.0, 36.0), (80, 95), 4, "Spray Copper Oxychloride 50 WP (2.5g/L) + Streptocycline (1g/10L)"),
            ("Cotton Leaf Curl Virus", "Virus", (30.0, 38.0), (55, 75), 2, "Control whitefly vectors using Diafenthiuron 50 WP; remove infected weeds"),
        ],
        "pests": [
            ("Pink Bollworm", (27.0, 36.0), (60, 85), "Boll Formation", "Install 5-8 pheromone traps/acre; spray Flubendiamide 39.35 SC"),
            ("Whiteflies", (28.0, 38.0), (45, 75), "Vegetative", "Install yellow sticky traps (20/acre); spray Spiromesifen 22.9 SC"),
            ("Thrips", (28.0, 37.0), (40, 70), "Seedling", "Spray Spinosad 45 SC @ 0.3ml/L; avoid moisture stress"),
        ],
    },
    "Tomato": {
        "varieties": ["Pusa Ruby", "Abhinav Hybrid", "Vaibhav Fresh", "Arka Rakshak", "Sivaji F1"],
        "stages": [("Seedling", 10, 25), ("Vegetative", 25, 45), ("Flowering", 45, 65), ("Fruit Setting", 65, 85), ("Fruit Maturation", 85, 115)],
        "soils": ["Sandy Loam", "Loam", "Red Sandy"],
        "states_districts": [("Karnataka", "Kolar"), ("Maharashtra", "Nashik"), ("Andhra Pradesh", "Chittoor"), ("Madhya Pradesh", "Indore"), ("Bihar", "Vaishali")],
        "temp_range": (18.0, 34.0),
        "moisture_pref": (55, 80),
        "diseases": [
            ("Tomato Early Blight", "Fungus", (24.0, 31.0), (75, 92), 5, "Apply Mancozeb 75 WP (2g/L); stake plants off moist soil"),
            ("Tomato Late Blight", "Oomycete", (17.0, 23.0), (88, 99), 8, "Apply Metalaxyl + Mancozeb preventively; rogue out infected plants"),
            ("Tomato Leaf Curl", "Virus", (28.0, 36.0), (50, 70), 2, "Manage whitefly vectors with yellow traps and Imidacloprid 17.8 SL"),
        ],
        "pests": [
            ("Fruit and Shoot Borer", (24.0, 34.0), (55, 85), "Fruit Setting", "Deploy pheromone lures @ 12/ha; spray Chlorantraniliprole 18.5 SC"),
            ("Whiteflies", (26.0, 36.0), (45, 75), "Vegetative", "Install yellow sticky cards; spray NSKE 5% neem extract"),
            ("Red Spider Mite", (28.0, 37.0), (35, 65), "Flowering", "Spray Spiromesifen 22.9 SC or wettable sulfur; break silken webbing"),
        ],
    },
    "Potato": {
        "varieties": ["Kufri Jyoti", "Kufri Bahar", "Kufri Pukhraj", "Kufri Chandramukhi", "Kufri Chipsona"],
        "stages": [("Sprouting", 10, 20), ("Vegetative", 20, 40), ("Stolon Formation", 40, 60), ("Tuber Bulking", 60, 90), ("Haulm Senescence", 90, 110)],
        "soils": ["Sandy Loam", "Alluvial", "Loam"],
        "states_districts": [("Uttar Pradesh", "Agra"), ("West Bengal", "Hooghly"), ("Punjab", "Jalandhar"), ("Gujarat", "Banaskantha"), ("Bihar", "Patna")],
        "temp_range": (12.0, 28.0),
        "moisture_pref": (60, 85),
        "diseases": [
            ("Potato Late Blight", "Oomycete", (15.0, 22.0), (85, 99), 8, "Spray Cymoxanil 8% + Mancozeb 64% WP upon morning blight advisory"),
            ("Potato Black Scurf", "Fungus", (18.0, 25.0), (70, 88), 4, "Tuber dip with Boric acid (3%) and practice earthing up"),
        ],
        "pests": [
            ("Aphids", (16.0, 26.0), (50, 80), "Vegetative", "Spray Imidacloprid 17.8 SL @ 0.4ml/L to prevent viral transmission"),
            ("Flea Beetles", (20.0, 30.0), (40, 70), "Vegetative", "Dust diatomaceous earth or spray Azadirachtin 1500 ppm"),
        ],
    },
    "Maize": {
        "varieties": ["Pioneer-3396", "DKC-9108", "PAC-751", "ProAgro-4212", "Bio-9681"],
        "stages": [("Seedling", 10, 20), ("Knee High", 20, 40), ("Tasseling", 40, 60), ("Silking", 60, 75), ("Grain Fill", 75, 95), ("Maturity", 95, 115)],
        "soils": ["Loam", "Sandy Loam", "Alluvial"],
        "states_districts": [("Karnataka", "Davanagere"), ("Madhya Pradesh", "Chhindwara"), ("Bihar", "Khagaria"), ("Telangana", "Nizamabad"), ("Maharashtra", "Aurangabad")],
        "temp_range": (20.0, 36.0),
        "moisture_pref": (50, 80),
        "diseases": [
            ("Northern Corn Leaf Blight", "Fungus", (18.0, 27.0), (80, 98), 6, "Apply Azoxystrobin + Difenoconazole; avoid sprinkler irrigation"),
            ("Common Corn Rust", "Fungus", (16.0, 25.0), (75, 95), 5, "Spray Propiconazole 25 EC @ 1ml/L at first golden pustule"),
        ],
        "pests": [
            ("Fall Armyworm", (22.0, 35.0), (50, 85), "Knee High", "Apply Emamectin Benzoate 5 SG @ 0.4g/L directly into whorl"),
            ("Aphids", (20.0, 30.0), (45, 75), "Tasseling", "Spray NSKE 5% or Thiamethoxam 25 WG @ 0.3g/L"),
        ],
    },
    "Soybean": {
        "varieties": ["JS-335 Standard", "JS-9560 Early", "NRC-37", "JS-20-29", "MACS-1407"],
        "stages": [("Emergence", 8, 18), ("Vegetative", 18, 35), ("Flowering", 35, 50), ("Pod Formation", 50, 70), ("Pod Filling", 70, 90), ("Maturity", 90, 105)],
        "soils": ["Black Cotton Soil", "Clay Loam", "Medium Black"],
        "states_districts": [("Madhya Pradesh", "Ujjain"), ("Maharashtra", "Amravati"), ("Rajasthan", "Kota"), ("Karnataka", "Belagavi"), ("Gujarat", "Dahod")],
        "temp_range": (22.0, 35.0),
        "moisture_pref": (55, 85),
        "diseases": [
            ("Soybean Rust", "Fungus", (20.0, 28.0), (85, 98), 6, "Spray Hexaconazole 5% EC @ 2ml/L to lower canopy surfaces"),
            ("Soybean Anthracnose", "Fungus", (25.0, 32.0), (80, 95), 5, "Apply Carbendazim 12% + Mancozeb 63% WP @ 2g/L"),
        ],
        "pests": [
            ("Stem Fly", (24.0, 34.0), (50, 80), "Vegetative", "Seed treatment with Thiamethoxam 30 FS; foliar spray of Quinalphos"),
            ("Spodoptera Armyworm", (25.0, 35.0), (55, 85), "Flowering", "Deploy Spodolure pheromone traps; spray Novaluron 10 EC"),
        ],
    },
    "Groundnut": {
        "varieties": ["TAG-24 Early", "GG-20 Bold", "Kadiri-6", "JL-24", "TMV-2"],
        "stages": [("Seedling", 10, 25), ("Vegetative", 25, 45), ("Flowering", 45, 60), ("Pegging", 60, 80), ("Pod Development", 80, 105), ("Maturity", 105, 120)],
        "soils": ["Red Sandy Loam", "Sandy Loam", "Medium Black"],
        "states_districts": [("Gujarat", "Junagadh"), ("Andhra Pradesh", "Anantapur"), ("Tamil Nadu", "Coimbatore"), ("Karnataka", "Dharwad"), ("Rajasthan", "Bikaner")],
        "temp_range": (24.0, 36.0),
        "moisture_pref": (45, 75),
        "diseases": [
            ("Tikka Leaf Spot", "Fungus", (25.0, 31.0), (75, 92), 5, "Spray Carbendazim + Mancozeb @ 2g/L; avoid water stagnation"),
            ("Groundnut Collar Rot", "Fungus", (28.0, 35.0), (70, 88), 4, "Seed treatment with Trichoderma harzianum; avoid deep planting"),
        ],
        "pests": [
            ("Thrips", (26.0, 36.0), (40, 70), "Flowering", "Install blue sticky traps; spray Spinosad 45 SC"),
            ("Spodoptera Cutworm", (26.0, 35.0), (50, 80), "Pod Development", "Spray SlNPV @ 250 LE/ha or Emamectin Benzoate 5 SG"),
        ],
    },
    "Sugarcane": {
        "varieties": ["Co-0238 Champion", "Co-86032 Sweet", "CoM-0265", "Co-0118", "Co-98014"],
        "stages": [("Germination", 15, 40), ("Tillering", 40, 110), ("Grand Growth", 110, 240), ("Maturity", 240, 360)],
        "soils": ["Clay Loam", "Deep Black", "Alluvial Loam"],
        "states_districts": [("Uttar Pradesh", "Muzaffarnagar"), ("Maharashtra", "Kolhapur"), ("Karnataka", "Mandya"), ("Tamil Nadu", "Erode"), ("Punjab", "Jalandhar")],
        "temp_range": (22.0, 38.0),
        "moisture_pref": (65, 95),
        "diseases": [
            ("Sugarcane Red Rot", "Fungus", (28.0, 36.0), (80, 98), 7, "Rogue infected clumps; drench root zone with Trichoderma; ensure drainage"),
            ("Sugarcane Smut", "Fungus", (25.0, 33.0), (65, 85), 3, "Remove and incinerate whips in plastic bags; dip setts in Propiconazole"),
        ],
        "pests": [
            ("Shoot Borer", (26.0, 36.0), (55, 80), "Tillering", "Earthing up at 45 DAP; release Trichogramma chilonis egg parasitoids"),
            ("Termites", (24.0, 36.0), (35, 65), "Germination", "Apply Chlorpyrifos 20 EC or Fipronil 0.3% GR in furrow"),
        ],
    },
    "Chickpea": {
        "varieties": ["JG-11", "JAKI-9218", "Pusa-362", "Vijay", "Digvijay"],
        "stages": [("Seedling", 10, 25), ("Branching", 25, 45), ("Flowering", 45, 70), ("Pod Development", 70, 95), ("Maturity", 95, 115)],
        "soils": ["Black Soil", "Sandy Loam", "Alluvial"],
        "states_districts": [("Madhya Pradesh", "Vidisha"), ("Maharashtra", "Solapur"), ("Rajasthan", "Bikaner"), ("Karnataka", "Vijayapura"), ("Uttar Pradesh", "Banda")],
        "temp_range": (14.0, 30.0),
        "moisture_pref": (35, 65),
        "diseases": [
            ("Chickpea Fusarium Wilt", "Fungus", (22.0, 29.0), (45, 70), 2, "Seed dress with Trichoderma viride; sow wilt-resistant cultivars"),
        ],
        "pests": [
            ("Pod Borer", (20.0, 32.0), (40, 75), "Flowering", "Erect T-perches for insectivorous birds; spray HaNPV @ 250 LE/ha"),
        ],
    },
    "Pigeon Pea": {
        "varieties": ["BDN-711 White", "Asha ICPL-87119", "Maruti ICP-8863", "BSMR-736"],
        "stages": [("Seedling", 15, 35), ("Vegetative", 35, 75), ("Flowering", 75, 110), ("Pod Setting", 110, 140), ("Maturity", 140, 180)],
        "soils": ["Medium Black", "Loam", "Red Sandy"],
        "states_districts": [("Maharashtra", "Latur"), ("Karnataka", "Kalaburagi"), ("Madhya Pradesh", "Narsinghpur"), ("Gujarat", "Bharuch"), ("Telangana", "Adilabad")],
        "temp_range": (20.0, 36.0),
        "moisture_pref": (45, 75),
        "diseases": [
            ("Chickpea Fusarium Wilt", "Fungus", (22.0, 30.0), (50, 75), 3, "Crop rotation with sorghum; soil application of Trichoderma"),
        ],
        "pests": [
            ("Pod Borer", (22.0, 34.0), (45, 75), "Flowering", "Install pheromone lures; spray Chlorantraniliprole 18.5 SC"),
            ("Pod Fly", (24.0, 35.0), (50, 80), "Pod Setting", "Spray Neem seed kernel extract (5% NSKE) at 50% flowering"),
        ],
    },
    "Chili": {
        "varieties": ["Guntur Sannam", "Byadagi", "Teja", "Pusa Jwala", "Armoor"],
        "stages": [("Seedling", 15, 35), ("Vegetative", 35, 60), ("Flowering", 60, 85), ("Fruit Setting", 85, 110), ("Harvesting", 110, 150)],
        "soils": ["Black Cotton", "Loam", "Red Sandy"],
        "states_districts": [("Andhra Pradesh", "Guntur"), ("Telangana", "Khammam"), ("Karnataka", "Haveri"), ("Madhya Pradesh", "Khargone"), ("Maharashtra", "Nagpur")],
        "temp_range": (20.0, 36.0),
        "moisture_pref": (50, 80),
        "diseases": [
            ("Chili Anthracnose", "Fungus", (25.0, 32.0), (80, 96), 6, "Spray Azoxystrobin 23% SC or Difenoconazole; pick diseased pods"),
        ],
        "pests": [
            ("Thrips", (26.0, 36.0), (40, 70), "Flowering", "Spray Spinosad 45 SC; install blue sticky traps"),
            ("Red Spider Mite", (28.0, 37.0), (35, 65), "Vegetative", "Apply Propargite 57 EC or Spiromesifen 22.9 SC"),
        ],
    },
    "Onion": {
        "varieties": ["Bhima Super", "AgriFound Dark Red", "N-53", "Bhima Red", "Pusa Red"],
        "stages": [("Seedling", 15, 40), ("Vegetative", 40, 70), ("Bulb Initiation", 70, 95), ("Bulb Development", 95, 120), ("Harvesting", 120, 140)],
        "soils": ["Sandy Loam", "Alluvial", "Clay Loam"],
        "states_districts": [("Maharashtra", "Nashik"), ("Karnataka", "Gadag"), ("Gujarat", "Bhavnagar"), ("Madhya Pradesh", "Khandwa"), ("Rajasthan", "Sikar")],
        "temp_range": (15.0, 32.0),
        "moisture_pref": (50, 75),
        "diseases": [
            ("Onion Purple Blotch", "Fungus", (22.0, 29.0), (78, 95), 5, "Spray Mancozeb 75 WP (2.5g/L) with agricultural sticker adjuvant"),
        ],
        "pests": [
            ("Thrips", (22.0, 34.0), (40, 70), "Vegetative", "Install blue sticky traps; spray Fipronil 5 SC"),
        ],
    },
    "Banana": {
        "varieties": ["Grand Naine", "Robusta", "Poovan", "Rasthali", "Red Banana"],
        "stages": [("Planting", 15, 60), ("Vegetative", 60, 180), ("Shooting", 180, 240), ("Bunch Development", 240, 330), ("Harvest", 330, 365)],
        "soils": ["Clay Loam", "Alluvial", "Deep Loam"],
        "states_districts": [("Tamil Nadu", "Thanjavur"), ("Maharashtra", "Jalgaon"), ("Gujarat", "Bharuch"), ("Andhra Pradesh", "Kadapa"), ("Kerala", "Thrissur")],
        "temp_range": (20.0, 38.0),
        "moisture_pref": (70, 95),
        "diseases": [
            ("Banana Sigatoka Leaf Spot", "Fungus", (25.0, 33.0), (82, 98), 7, "Spray Propiconazole 25 EC with mineral oil emulsion; cut diseased leaves"),
        ],
        "pests": [
            ("Banana Pseudostem Weevil", (24.0, 34.0), (60, 90), "Vegetative", "Deploy split pseudostem disc traps; swab with Chlorpyrifos"),
        ],
    },
    "Citrus": {
        "varieties": ["Nagpur Mandarin", "Kagzi Lime", "Mosambi", "Kinnow", "Coorg Mandarin"],
        "stages": [("Flush Emergence", 15, 45), ("Flowering", 45, 75), ("Fruit Set", 75, 120), ("Fruit Growth", 120, 210), ("Maturity", 210, 270)],
        "soils": ["Sandy Loam", "Alluvial", "Medium Black"],
        "states_districts": [("Maharashtra", "Nagpur"), ("Punjab", "Abohar"), ("Andhra Pradesh", "Nellore"), ("Madhya Pradesh", "Chhindwara"), ("Rajasthan", "Jhalawar")],
        "temp_range": (18.0, 38.0),
        "moisture_pref": (50, 80),
        "diseases": [
            ("Citrus Canker", "Bacteria", (26.0, 35.0), (75, 92), 4, "Prune cankered twigs; spray Copper Oxychloride 50 WP + Streptocycline"),
        ],
        "pests": [
            ("Citrus Psylla", (25.0, 36.0), (45, 75), "Flush Emergence", "Spray Thiamethoxam 25 WG @ 0.3g/L during flush emergence"),
            ("Citrus Leaf Miner", (24.0, 34.0), (50, 80), "Flush Emergence", "Spray Abamectin 1.9 EC or 5% NSKE neem kernel extract"),
        ],
    },
}

ALL_CROPS = list(CROP_SPECS.keys())
TARGET_COUNT = 10000


def generate_records(count: int = TARGET_COUNT, seed: int = 42) -> List[Dict[str, Any]]:
    rng = random.Random(seed)
    records: List[Dict[str, Any]] = []

    start_date = datetime(2025, 6, 1)
    field_ids = [f"FIELD_{i:03d}" for i in range(1, 101)]

    # We distribute records across crops with a realistic frequency reflecting Indian acreage
    crop_weights = {
        "Rice": 0.20,
        "Wheat": 0.16,
        "Cotton": 0.13,
        "Tomato": 0.08,
        "Potato": 0.08,
        "Maize": 0.07,
        "Soybean": 0.07,
        "Groundnut": 0.06,
        "Sugarcane": 0.05,
        "Chickpea": 0.03,
        "Pigeon Pea": 0.02,
        "Chili": 0.02,
        "Onion": 0.015,
        "Banana": 0.01,
        "Citrus": 0.005,
    }

    # Normalize weights
    total_w = sum(crop_weights.values())
    crops_pool = []
    for c, w in crop_weights.items():
        crops_pool.extend([c] * int(round(w / total_w * 1000)))

    for i in range(1, count + 1):
        rec_id = f"REC_{i:05d}"
        field_id = rng.choice(field_ids)
        date_offset = rng.randint(0, 420)
        curr_date = (start_date + timedelta(days=date_offset)).strftime("%Y-%m-%d")

        crop = rng.choice(crops_pool)
        spec = CROP_SPECS[crop]

        variety = rng.choice(spec["varieties"])
        stage_info = rng.choice(spec["stages"])
        growth_stage = stage_info[0]
        crop_age_days = rng.randint(stage_info[1], stage_info[2])
        area_acres = round(rng.uniform(1.0, 15.0), 1)

        soil_type = rng.choice(spec["soils"])
        soil_ph = round(rng.gauss(6.8, 0.6), 2)
        soil_ph = max(5.0, min(8.6, soil_ph))

        # Soil Nutrients
        nitrogen = int(round(rng.gauss(75, 25)))
        nitrogen = max(20, min(150, nitrogen))
        phosphorus = int(round(rng.gauss(38, 14)))
        phosphorus = max(10, min(80, phosphorus))
        potassium = int(round(rng.gauss(48, 16)))
        potassium = max(15, min(95, potassium))

        # Baseline weather based on crop season profile
        min_temp, max_temp = spec["temp_range"]
        temperature = round(rng.uniform(min_temp, max_temp), 1)

        # Humidity correlated with rainfall
        rain_prob = round(rng.uniform(0.0, 1.0), 2)
        is_raining = rain_prob > 0.55
        if is_raining:
            rainfall = round(rng.uniform(5.0, 55.0), 1)
            humidity = round(rng.uniform(75.0, 98.0), 1)
            leaf_wetness_hours = round(rng.uniform(5.0, 16.0), 1)
            sunlight_hours = round(rng.uniform(2.0, 6.5), 1)
        else:
            rainfall = 0.0 if rain_prob < 0.4 else round(rng.uniform(0.5, 4.0), 1)
            humidity = round(rng.uniform(30.0, 78.0), 1)
            leaf_wetness_hours = round(rng.uniform(0.0, 5.0), 1)
            sunlight_hours = round(rng.uniform(6.0, 11.0), 1)

        wind_speed = round(rng.uniform(4.0, 28.0), 1)

        # Soil moisture derived from rainfall and irrigation
        irrigation_level = rng.choice(["Rainfed", "Adequate", "Deficit", "Excessive"])
        base_moisture = spec["moisture_pref"][0] + (spec["moisture_pref"][1] - spec["moisture_pref"][0]) * 0.5
        if irrigation_level == "Excessive" or rainfall > 25:
            soil_moisture = round(rng.uniform(78.0, 96.0), 1)
        elif irrigation_level == "Deficit" and rainfall == 0:
            soil_moisture = round(rng.uniform(22.0, 48.0), 1)
        else:
            soil_moisture = round(rng.uniform(50.0, 78.0), 1)

        # History factors
        prev_disease = rng.choice([True, False, False, False])
        prev_pest = rng.choice([True, False, False])
        disease_history = "High" if prev_disease else rng.choice(["None", "Low", "Moderate"])
        pest_history = "High" if prev_pest else rng.choice(["None", "Low", "Moderate"])

        state_dist = rng.choice(spec["states_districts"])
        state = state_dist[0]
        district = state_dist[1]

        # -------------------------------------------------------------
        # Realistic Pathology & Entomology Risk Calculation
        # -------------------------------------------------------------
        disease = "None"
        disease_prob = 0.05
        pest = "None"
        pest_prob = 0.05
        recommended_action = "Maintain regular monitoring and standard agronomic hygiene."

        # Evaluate candidate diseases
        best_dis_score = 0.0
        candidate_dis = None
        for d_name, d_type, d_temp, d_hum, d_wet, d_rec in spec["diseases"]:
            temp_fit = 1.0 - min(1.0, abs(temperature - (d_temp[0] + d_temp[1]) / 2) / 10.0)
            hum_fit = 1.0 if humidity >= d_hum[0] else max(0.0, humidity / d_hum[0])
            wet_fit = min(1.0, leaf_wetness_hours / d_wet)
            n_excess = max(0.0, (nitrogen - 85) / 60.0)
            hist_boost = 0.25 if prev_disease else 0.0

            dis_score = 0.35 * temp_fit + 0.35 * hum_fit + 0.20 * wet_fit + 0.10 * n_excess + hist_boost
            if dis_score > best_dis_score:
                best_dis_score = dis_score
                candidate_dis = (d_name, d_rec)

        if best_dis_score > 0.68 and candidate_dis:
            disease = candidate_dis[0]
            disease_prob = min(0.98, round(best_dis_score * rng.uniform(0.85, 1.05), 2))
            recommended_action = candidate_dis[1]
        elif best_dis_score > 0.45 and rng.random() < 0.35 and candidate_dis:
            disease = candidate_dis[0]
            disease_prob = min(0.75, round(best_dis_score * 0.85, 2))
            recommended_action = candidate_dis[1]
        else:
            disease = "None"
            disease_prob = round(rng.uniform(0.02, 0.22), 2)

        # Evaluate candidate pests
        best_pest_score = 0.0
        candidate_pest = None
        for p_name, p_temp, p_hum, p_stage, p_rec in spec["pests"]:
            temp_fit = 1.0 - min(1.0, abs(temperature - (p_temp[0] + p_temp[1]) / 2) / 12.0)
            hum_fit = 1.0 - min(1.0, abs(humidity - (p_hum[0] + p_hum[1]) / 2) / 35.0)
            stage_fit = 1.3 if growth_stage.lower() in p_stage.lower() else 0.7
            hist_boost = 0.25 if prev_pest else 0.0

            p_score = (0.45 * temp_fit + 0.30 * hum_fit + hist_boost) * stage_fit
            if p_score > best_pest_score:
                best_pest_score = p_score
                candidate_pest = (p_name, p_rec)

        if best_pest_score > 0.75 and candidate_pest:
            pest = candidate_pest[0]
            pest_prob = min(0.96, round(best_pest_score * rng.uniform(0.82, 1.02), 2))
            if disease == "None":
                recommended_action = candidate_pest[1]
            else:
                recommended_action += f" Also {candidate_pest[1]}"
        elif best_pest_score > 0.50 and rng.random() < 0.30 and candidate_pest:
            pest = candidate_pest[0]
            pest_prob = min(0.70, round(best_pest_score * 0.8, 2))
            if disease == "None":
                recommended_action = candidate_pest[1]
        else:
            pest = "None"
            pest_prob = round(rng.uniform(0.02, 0.20), 2)

        # -------------------------------------------------------------
        # Overall Risk Score (0 - 100 continuous) and Severity
        # -------------------------------------------------------------
        env_stress = 0.0
        if humidity > 80:
            env_stress += (humidity - 80) * 0.8
        if rainfall > 20:
            env_stress += min(15.0, rainfall * 0.4)
        if leaf_wetness_hours > 6:
            env_stress += (leaf_wetness_hours - 6) * 1.5
        if soil_moisture > 85:
            env_stress += (soil_moisture - 85) * 1.2

        threat_pressure = (disease_prob if disease != "None" else 0.0) * 45.0 + (pest_prob if pest != "None" else 0.0) * 40.0
        hist_term = (15.0 if prev_disease else 0.0) + (10.0 if prev_pest else 0.0)

        raw_risk = threat_pressure + env_stress * 0.5 + hist_term
        risk_score = round(min(98.5, max(8.0, raw_risk + rng.uniform(-4.0, 4.0))), 1)

        # Map to Risk Level & Severity
        if risk_score >= 75.0:
            risk_level = "CRITICAL"
            severity = "HIGH"
        elif risk_score >= 52.0:
            risk_level = "HIGH"
            severity = "MEDIUM" if rng.random() < 0.4 else "HIGH"
        elif risk_score >= 32.0:
            risk_level = "MEDIUM"
            severity = "LOW" if rng.random() < 0.5 else "MEDIUM"
        else:
            risk_level = "LOW"
            severity = "LOW"

        # NDVI and Vegetation Health inversely correlated with risk
        if risk_level == "CRITICAL":
            ndvi = round(rng.uniform(0.32, 0.54), 3)
            veg_health = round(rng.uniform(25.0, 52.0), 1)
        elif risk_level == "HIGH":
            ndvi = round(rng.uniform(0.48, 0.66), 3)
            veg_health = round(rng.uniform(50.0, 68.0), 1)
        elif risk_level == "MEDIUM":
            ndvi = round(rng.uniform(0.62, 0.76), 3)
            veg_health = round(rng.uniform(66.0, 82.0), 1)
        else:
            ndvi = round(rng.uniform(0.72, 0.88), 3)
            veg_health = round(rng.uniform(80.0, 96.0), 1)

        record = {
            "record_id": rec_id,
            "field_id": field_id,
            "date": curr_date,
            "state": state,
            "district": district,
            "crop": crop,
            "crop_variety": variety,
            "growth_stage": growth_stage,
            "crop_age_days": crop_age_days,
            "area_acres": area_acres,
            "soil_type": soil_type,
            "soil_ph": soil_ph,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "soil_moisture": soil_moisture,
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": rainfall,
            "rain_probability": rain_prob,
            "wind_speed": wind_speed,
            "leaf_wetness_hours": leaf_wetness_hours,
            "sunlight_hours": sunlight_hours,
            "irrigation_level": irrigation_level,
            "previous_disease": 1 if prev_disease else 0,
            "previous_pest": 1 if prev_pest else 0,
            "disease_history": disease_history,
            "pest_history": pest_history,
            "ndvi": ndvi,
            "vegetation_health": veg_health,
            "disease": disease,
            "disease_probability": disease_prob,
            "pest": pest,
            "pest_probability": pest_prob,
            "severity": severity,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            "data_source": "synthetic_training_data",
        }
        records.append(record)

    return records


def save_dataset(records: List[Dict[str, Any]], filepath: str = OUTPUT_PATH):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    os.makedirs(os.path.dirname(RAW_ARCHIVE_PATH), exist_ok=True)

    fieldnames = list(records[0].keys())

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    # Save immutable raw copy
    with open(RAW_ARCHIVE_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"[Dataset Generator] Successfully saved {len(records)} records to:")
    print(f"  -> {filepath}")
    print(f"  -> {RAW_ARCHIVE_PATH}")


if __name__ == "__main__":
    count = TARGET_COUNT
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    print(f"[Dataset Generator] Generating {count} agricultural observation records...")
    recs = generate_records(count=count)
    save_dataset(recs)
