export type SeverityLevel = 'Low' | 'Mild' | 'Moderate' | 'High' | 'Critical';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface CropRecord {
  id: string;
  crop: string;
  variety: string;
  location: string;
  field: string;
  date: string;
  growth_stage: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_moisture: number;
  crop_health_score: number;
  disease: string;
  disease_probability: number;
  pest: string;
  pest_probability: number;
  severity: SeverityLevel;
  risk_level: RiskLevel;
  recommended_action: string;
}

export interface CropInfo {
  id: string;
  name: string;
  scientific_name: string;
  category: 'Cereal' | 'Vegetable' | 'Cash Crop' | 'Legume' | 'Oilseed';
  optimal_temperature: string;
  optimal_humidity: string;
  growth_duration_days: number;
  growth_stages: string[];
  common_diseases: string[];
  common_pests: string[];
  prevention_tips: string[];
  management_practices: string[];
  icon_name: string;
}

export interface DiseaseInfo {
  id: string;
  name: string;
  pathogen: string;
  affected_crops: string[];
  symptoms: string;
  favorable_conditions: {
    temp_c: string;
    humidity_pct: string;
    description: string;
  };
  severity: SeverityLevel;
  primary_cause: string;
  organic_control: string;
  chemical_control_guidance: string;
  prevention_measures: string[];
  detection_pattern: string;
}

export interface PestInfo {
  id: string;
  name: string;
  scientific_name: string;
  crops_affected: string[];
  danger_life_stage: string;
  symptoms_and_damage: string;
  economic_threshold: string;
  risk_level: RiskLevel;
  biological_control: string;
  cultural_control: string;
  chemical_guidance: string;
  identification_traits: string[];
}

export interface FieldRecord {
  id: string;
  name: string;
  crop: string;
  variety: string;
  area_acres: number;
  location: string;
  soil_type: string;
  growth_stage: string;
  health_score: number;
  disease_risk: RiskLevel;
  pest_risk: RiskLevel;
  last_inspection: string;
  active_alerts: number;
  recommended_action: string;
}

export interface XAIFactor {
  factor: string;
  category: 'Environmental' | 'Crop' | 'Historical' | 'Field Condition';
  contribution_pct: number;
  value_observed: string;
  threshold: string;
  direction: 'Increases Risk' | 'Decreases Risk' | 'Neutral';
  description: string;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  imageUrl?: string;
  imageName?: string;
  crop: string;
  category: 'Disease' | 'Pest' | 'Healthy' | 'Fungal Disease' | 'Insect Pest' | 'Oomycete Disease' | 'Bacterial Disease' | string;
  name: string;
  confidence: number;
  severity: SeverityLevel;
  severity_pct: number;
  risk_level: RiskLevel;
  symptoms: string[];
  possible_causes: string[];
  management_immediate: string;
  management_preventive: string;
  management_biological: string;
  management_ipm: string;
  xai_factors?: XAIFactor[];
  counterfactual_tip?: string;
}

export interface WeatherAnalysisPoint {
  date: string;
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  leaf_wetness_hours: number;
  wind_speed_kmh: number;
  primary_risk: string;
  favored_threat: string;
  alert_level: RiskLevel;
}

export interface FarmerAdvisorPlan {
  crop: string;
  condition: string;
  severity: SeverityLevel;
  growth_stage: string;
  weather: string;
  summary_message: string;
  action_steps: Array<{
    step: number;
    title: string;
    details: string;
    priority: 'Immediate' | 'Important' | 'Routine';
  }>;
  safety_advisory: string;
}
