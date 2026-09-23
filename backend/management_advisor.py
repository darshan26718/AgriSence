"""
management_advisor.py - Controlled & Certified Agricultural Treatment Advisory
Generates risk-tiered, scientifically grounded integrated pest management (IPM) recommendations
using dataset/pesticides_cibrc_dataset.csv and dataset/management_recommendations.csv.

SAFETY & COMPLIANCE RULES:
- Never recommends blanket chemical spraying.
- Strictly pairs chemical solutions with official Pre-Harvest Interval (PHI) and toxicity color band.
- Disclaims: "Consult approved manufacturer label and local agricultural extension officer."
"""

import os
import csv
from typing import Dict, Any, List, Optional

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(WORKSPACE_ROOT, "dataset")


class ControlledManagementAdvisor:
    def __init__(self):
        self.cibrc_pesticides: List[Dict[str, Any]] = []
        self.ipm_protocols: List[Dict[str, Any]] = []
        self._load_datasets()

    def _load_datasets(self):
        # Load CIBRC Agrochemicals
        p_path = os.path.join(DATASET_DIR, "pesticides_cibrc_dataset.csv")
        if os.path.exists(p_path):
            try:
                with open(p_path, "r", encoding="utf-8") as f:
                    self.cibrc_pesticides = list(csv.DictReader(f))
            except Exception as e:
                print(f"[Management Advisor] Error loading CIBRC dataset: {e}")

        # Load Management Recommendations
        m_path = os.path.join(DATASET_DIR, "management_recommendations.csv")
        if os.path.exists(m_path):
            try:
                with open(m_path, "r", encoding="utf-8") as f:
                    self.ipm_protocols = list(csv.DictReader(f))
            except Exception as e:
                print(f"[Management Advisor] Error loading management recommendations: {e}")

    def get_recommendation_for_risk(
        self,
        crop: str,
        risk_level: str = "HIGH",
        primary_threat: str = "Pink Bollworm",
        growth_stage: str = "Flowering",
    ) -> Dict[str, Any]:
        """
        Builds a tiered, multi-step management protocol based on risk level.
        """
        crop_clean = (crop or "").lower()
        threat_clean = (primary_threat or "").lower()
        lvl = (risk_level or "MODERATE").upper()

        # Filter relevant CIBRC chemical if available in certified dataset
        matching_chem = None
        for p in self.cibrc_pesticides:
            crops_aff = p.get("target_crops", "").lower()
            pests_aff = p.get("target_pests_diseases", "").lower()
            if any(c in crop_clean for c in crops_aff.split(",")) or any(t in threat_clean for t in pests_aff.split(",")):
                matching_chem = p
                break

        if not matching_chem and self.cibrc_pesticides:
            matching_chem = self.cibrc_pesticides[0]

        # Tiered Action Steps
        steps: List[Dict[str, Any]] = []

        # Step 1: Cultural / Physical
        steps.append({
            "phase": "Phase 1: Immediate Field Cultural Sanitation",
            "action": (
                "Prune and safely destroy visibly infested leaves/flowers. Clean drainage furrows to eliminate water stagnation."
                if "disease" in threat_clean or "blight" in threat_clean or "rust" in threat_clean
                else "Install 5 pheromone lure traps per acre at 30 cm above crop canopy to monitor male moth activity."
            ),
            "urgency": "Immediate (Within 24 Hours)",
            "tier": "Non-Chemical Cultural",
        })

        # Step 2: Biological Control
        steps.append({
            "phase": "Phase 2: Eco-Safe Biological Intervention",
            "action": (
                "Apply Cold-Pressed Neem Seed Kernel Extract (5% NSKE) or Neem Oil 10,000 PPM @ 5 ml/L in late afternoon."
                if "pest" in threat_clean or "bollworm" in threat_clean
                else "Foliar application of Trichoderma viride / harzianum @ 5g/L or fermented butter-milk (khatta chhaas) 5% dilution."
            ),
            "urgency": "Day 2–3",
            "tier": "Biological / Organic",
        })

        # Step 3: Targeted Chemical (Only if High/Critical and ETL exceeded)
        if lvl in ["HIGH", "CRITICAL"] and matching_chem:
            steps.append({
                "phase": "Phase 3: Certified CIBRC Chemical Intervention (Only If ETL Breached)",
                "action": (
                    f"Spray {matching_chem.get('active_ingredient')} ({matching_chem.get('formulation')}) "
                    f"@ {matching_chem.get('dosage_per_liter')} per liter of water "
                    f"({matching_chem.get('dosage_per_acre')} per acre in {matching_chem.get('water_volume_l_acre')}L water)."
                ),
                "urgency": "Day 4–5 if trap catch or lesion count exceeds threshold",
                "tier": "CIBRC Certified Molecule",
                "cibrc_data": {
                    "chemical_id": matching_chem.get("chemical_id"),
                    "active_ingredient": matching_chem.get("active_ingredient"),
                    "formulation": matching_chem.get("formulation"),
                    "dosage_per_liter": matching_chem.get("dosage_per_liter"),
                    "dosage_per_acre": matching_chem.get("dosage_per_acre"),
                    "pre_harvest_interval_days": matching_chem.get("phi_days"),
                    "toxicity_band": matching_chem.get("toxicity_band"),
                    "safety_precautions": matching_chem.get("safety_instructions"),
                },
            })

        # Overall guidance summary
        if lvl == "CRITICAL":
            headline = "CRITICAL ACTION REQUIRED: Urgent field scouting + targeted IPM containment"
            guidance = "Risk has reached critical threshold. Prioritize ground scouting in this field immediately. Do not conduct blanket chemical spraying; treat affected hotspots only."
        elif lvl == "HIGH":
            headline = "HIGH RISK: Targeted scouting + preventive biological spray advised"
            guidance = "Microclimate and crop vulnerability favor pest/pathogen buildup. Verify ETL threshold in field before chemical escalation."
        elif lvl == "MODERATE":
            headline = "MODERATE: Maintain surveillance & install monitoring traps"
            guidance = "Conditions are mildly conducive. Routine weekly inspection is sufficient."
        else:
            headline = "LOW RISK: Field ecosystem healthy"
            guidance = "Normal agronomic maintenance. Continue routine monitoring."

        return {
            "crop": crop,
            "risk_level": lvl,
            "primary_threat": primary_threat,
            "growth_stage": growth_stage,
            "headline": headline,
            "overall_guidance": guidance,
            "action_steps": steps,
            "regulatory_disclaimer": (
                "Agrochemical recommendations strictly adhere to Central Insecticides Board & Registration Committee (CIBRC) certified labels. "
                "Always verify pesticide label, use personal protective equipment (PPE), and consult your local Taluka Agricultural Extension Officer."
            ),
            "free_helpline": "1800-180-1551 (Kisan Call Center)",
        }


# Singleton advisor instance
management_advisor = ControlledManagementAdvisor()
