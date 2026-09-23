"""
test_risk_engine.py - Automated Unit Test Suite for AgriSense Risk Prioritization
Tests:
  1. Weather favorability risk calculations
  2. Crop calendar stage susceptibility scaling
  3. Historical outbreak decay
  4. Field inspection priority ranking ("Inspect these fields first")
  5. Multi-horizon 3, 5, 7-day forecast summary
  6. Remote sensing NDVI and canopy stress indicators
  7. Synthetic outbreak simulator and reset
  8. Controlled CIBRC treatment recommendations
"""

import sys
import os
import unittest

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

from risk_engine import risk_engine
from remote_sensing import remote_sensing_service
from outbreak_simulator import outbreak_simulator
from management_advisor import management_advisor


class TestAgriSenseRiskEngine(unittest.TestCase):
    def setUp(self):
        self.sample_fields = [
            {
                "id": "FLD-001",
                "name": "North Sector Plot A-1",
                "crop": "Rice (Paddy)",
                "growth_stage": "Tillering",
                "area_acres": 4.5,
            },
            {
                "id": "FLD-003",
                "name": "Karnal Central Research Acre",
                "crop": "Wheat",
                "growth_stage": "Jointing",
                "area_acres": 5.0,
            },
            {
                "id": "FLD-006",
                "name": "Cotton Demonstration Farm",
                "crop": "Cotton",
                "growth_stage": "Boll Formation",
                "area_acres": 8.0,
            },
        ]

    def test_weather_favorability(self):
        # High humidity (92%) and extended wetness (14h) should yield high disease risk
        d_risk, p_risk, env_risk, reasons = risk_engine.calculate_weather_risk(
            temperature=27.0,
            humidity=92.0,
            rainfall=28.0,
            leaf_wetness_hours=14.0,
            horizon_days=5,
        )
        self.assertGreater(d_risk, 65.0)
        self.assertTrue(any("humidity" in r.lower() for r in reasons))

    def test_crop_stage_susceptibility(self):
        # Cotton in boll formation should have higher pest multiplier than vegetative
        p_mult_boll, _, _, _ = risk_engine.calculate_crop_stage_susceptibility("Cotton", "Boll Formation")
        p_mult_veg, _, _, _ = risk_engine.calculate_crop_stage_susceptibility("Cotton", "Vegetative")
        self.assertGreater(p_mult_boll, p_mult_veg)

    def test_field_prioritization_ranking(self):
        prioritized = risk_engine.prioritize_fields(self.sample_fields, forecast_days=5)
        self.assertEqual(len(prioritized), len(self.sample_fields))
        # Ensure rankings are assigned 1, 2, 3...
        for idx, f in enumerate(prioritized):
            self.assertEqual(f["inspection_priority"], idx + 1)
        # Priority 1 should have highest or equal risk score to Priority 2
        self.assertGreaterEqual(prioritized[0]["risk_score"], prioritized[1]["risk_score"])
        # Should contain directive reasons
        self.assertIn("reasons", prioritized[0])
        self.assertTrue(len(prioritized[0]["reasons"]) > 0)

    def test_forecast_summary_3_5_7_days(self):
        summary = risk_engine.get_forecast_summary(self.sample_fields)
        self.assertIn("horizons", summary)
        self.assertIn("3_days", summary["horizons"])
        self.assertIn("5_days", summary["horizons"])
        self.assertIn("7_days", summary["horizons"])
        self.assertIn("daily_trend_7_days", summary)
        self.assertEqual(len(summary["daily_trend_7_days"]), 7)

    def test_remote_sensing_layer(self):
        ind = remote_sensing_service.get_field_indicators("FLD-001", "Rice (Paddy)")
        self.assertTrue(ind["is_simulated"])
        self.assertIn("metrics", ind)
        self.assertIn("ndvi", ind["metrics"])
        self.assertIn("satellite_signal", ind)
        # Strict wording verification: should NOT state disease is confirmed
        self.assertNotIn("disease confirmed", ind["advisory_wording"].lower())

    def test_synthetic_outbreak_simulator(self):
        scenario = outbreak_simulator.start_simulation(
            starting_field_id="FLD-001",
            pest_or_disease="Pink Bollworm",
            target_crop="Cotton",
            intensity=0.9,
            simulated_days=3,
        )
        self.assertTrue(scenario["is_simulation"])
        self.assertEqual(len(scenario["timeline"]), 3)
        self.assertTrue(outbreak_simulator.is_active)

        # Test reset
        reset_res = outbreak_simulator.reset_simulation()
        self.assertTrue(reset_res["success"])
        self.assertFalse(outbreak_simulator.is_active)

    def test_controlled_management_recommendation(self):
        rec = management_advisor.get_recommendation_for_risk(
            crop="Cotton",
            risk_level="CRITICAL",
            primary_threat="Pink Bollworm",
            growth_stage="Boll Formation",
        )
        self.assertEqual(rec["risk_level"], "CRITICAL")
        self.assertIn("action_steps", rec)
        # Phase 1 should be cultural/physical
        self.assertTrue("Phase 1" in rec["action_steps"][0]["phase"])
        # Regulatory disclaimer must be present
        self.assertIn("regulatory_disclaimer", rec)


if __name__ == "__main__":
    unittest.main()
