import { FieldRecord, RiskLevel } from '../types/agri';
import { DetectionThresholds, PushNotificationAlert } from '../types/notification';

const RISK_RANKS: Record<RiskLevel, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
};

/**
 * Checks a single field against user-defined AI detection thresholds.
 */
export function evaluateFieldThreshold(
  field: FieldRecord,
  thresholds: DetectionThresholds,
  currentHumidity: number = 78
): PushNotificationAlert | null {
  const targetDiseaseRank = RISK_RANKS[thresholds.diseaseRiskThreshold] || 3;
  const fieldDiseaseRank = RISK_RANKS[field.disease_risk] || 1;

  const targetPestRank = RISK_RANKS[thresholds.pestRiskThreshold] || 3;
  const fieldPestRank = RISK_RANKS[field.pest_risk] || 1;

  // Case 1: Severe Disease Risk Threshold Breached
  if (fieldDiseaseRank >= targetDiseaseRank) {
    const isCritical = field.disease_risk === 'CRITICAL';
    return {
      id: `ALERT-DIS-${field.id}-${Date.now().toString().slice(-4)}`,
      fieldId: field.id,
      fieldName: field.name,
      crop: field.crop,
      title: isCritical
        ? `⚠️ CRITICAL DISEASE OUTBREAK THREAT`
        : `⚡ HIGH DISEASE RISK EXCEEDED`,
      message: `AI sensor telemetry flagged that ${field.name} (${field.crop}) has reached ${field.disease_risk} disease probability, exceeding your safety threshold of ${thresholds.diseaseRiskThreshold}.`,
      severity: isCritical ? 'critical' : 'high',
      triggerReason: `Disease Risk Level: ${field.disease_risk} (Threshold: ${thresholds.diseaseRiskThreshold})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Disease Probability',
      metricValue: `${field.disease_risk} (${field.health_score}% health)`,
      thresholdExceeded: `≥ ${thresholds.diseaseRiskThreshold}`,
      cibrcAdvisorySnippet: getCibrcAdvisoryForCrop(field.crop, 'disease'),
      isRead: false,
      isDismissed: false,
      source: 'ai-detection-threshold',
    };
  }

  // Case 2: Crop Health Score Dropped Below Floor
  if (field.health_score < thresholds.minHealthScoreFloor) {
    const healthDeficit = thresholds.minHealthScoreFloor - field.health_score;
    const isCritical = field.health_score <= 50;
    return {
      id: `ALERT-HLT-${field.id}-${Date.now().toString().slice(-4)}`,
      fieldId: field.id,
      fieldName: field.name,
      crop: field.crop,
      title: isCritical
        ? `🚨 SEVERE CROP HEALTH DROP DETECTED`
        : `⚠️ CROP HEALTH BELOW MINIMUM FLOOR`,
      message: `Field health index for ${field.name} dropped to ${field.health_score}%, which is ${healthDeficit}% below your set minimum floor (${thresholds.minHealthScoreFloor}%). Immediate agronomic scouting recommended.`,
      severity: isCritical ? 'critical' : 'high',
      triggerReason: `Health Score: ${field.health_score}% (Minimum Floor: ${thresholds.minHealthScoreFloor}%)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Health Score',
      metricValue: `${field.health_score}%`,
      thresholdExceeded: `< ${thresholds.minHealthScoreFloor}%`,
      cibrcAdvisorySnippet: getCibrcAdvisoryForCrop(field.crop, 'health'),
      isRead: false,
      isDismissed: false,
      source: 'ai-detection-threshold',
    };
  }

  // Case 3: Pest Economic Threshold Level (ETL) Exceeded
  if (fieldPestRank >= targetPestRank) {
    const isCritical = field.pest_risk === 'CRITICAL';
    return {
      id: `ALERT-PST-${field.id}-${Date.now().toString().slice(-4)}`,
      fieldId: field.id,
      fieldName: field.name,
      crop: field.crop,
      title: isCritical
        ? `🐛 CRITICAL PEST INFESTATION SPIKE`
        : `⚠️ PEST PRESSURE EXCEEDED THRESHOLD`,
      message: `Pest activity on ${field.name} (${field.crop}) has crossed economic injury levels to ${field.pest_risk}, exceeding your monitor limit of ${thresholds.pestRiskThreshold}.`,
      severity: isCritical ? 'critical' : 'warning',
      triggerReason: `Pest Pressure: ${field.pest_risk} (Threshold: ${thresholds.pestRiskThreshold})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Pest Level',
      metricValue: field.pest_risk,
      thresholdExceeded: `≥ ${thresholds.pestRiskThreshold}`,
      cibrcAdvisorySnippet: getCibrcAdvisoryForCrop(field.crop, 'pest'),
      isRead: false,
      isDismissed: false,
      source: 'ai-detection-threshold',
    };
  }

  // Case 4: Atmospheric Microclimate Spore Trigger
  if (currentHumidity >= thresholds.microclimateHumidityTrigger && field.crop.toLowerCase().includes('soybean')) {
    return {
      id: `ALERT-MIC-${field.id}-${Date.now().toString().slice(-4)}`,
      fieldId: field.id,
      fieldName: field.name,
      crop: field.crop,
      title: `🌧️ HIGH FUNGAL SPORE GERMINATION RISK`,
      message: `Ambient humidity of ${currentHumidity}% has exceeded your ${thresholds.microclimateHumidityTrigger}% spore threshold. Favorable for rapid Soybean Rust spreading across vulnerable crop plots.`,
      severity: 'warning',
      triggerReason: `Relative Humidity: ${currentHumidity}% (Threshold: ${thresholds.microclimateHumidityTrigger}%)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Atmospheric Humidity',
      metricValue: `${currentHumidity}% RH`,
      thresholdExceeded: `≥ ${thresholds.microclimateHumidityTrigger}%`,
      cibrcAdvisorySnippet: 'Spray Hexaconazole 5% EC @ 2 ml/L or apply Trichoderma harzianum @ 5g/L on leaf undersides.',
      isRead: false,
      isDismissed: false,
      source: 'microclimate-telemetry',
    };
  }

  return null;
}

/**
 * Evaluates all user saved fields against thresholds.
 */
export function evaluateAllFields(
  fields: FieldRecord[],
  thresholds: DetectionThresholds,
  currentHumidity: number = 78
): PushNotificationAlert[] {
  const alerts: PushNotificationAlert[] = [];
  for (const field of fields) {
    const alert = evaluateFieldThreshold(field, thresholds, currentHumidity);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}

/**
 * Returns certified CIBRC quick management advice.
 */
function getCibrcAdvisoryForCrop(crop: string, alertType: 'disease' | 'pest' | 'health'): string {
  const c = crop.toLowerCase();
  if (c.includes('cotton')) {
    if (alertType === 'pest') {
      return 'Install 5 pheromone traps/acre. Spray Cold-Pressed Neem Oil 10,000 PPM (5 ml/L) or Profenofos 50% EC (30 ml/10L).';
    }
    return 'Spray Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline 1 g/10L. Inspect lower leaves for angular blackarm.';
  }
  if (c.includes('soybean')) {
    return 'Apply Hexaconazole 5% EC @ 2 ml/L or Tebuconazole 25.9% EC @ 1.5 ml/L. Direct spray nozzles to leaf undersides.';
  }
  if (c.includes('citrus') || c.includes('orange')) {
    return 'Scrape affected tree bark and apply Bordeaux paste (1:1:10). Soil drenching with Metalaxyl + Mancozeb @ 2.5 g/L.';
  }
  if (c.includes('tur') || c.includes('pigeon')) {
    return 'Install 20 T-shaped bird perches per acre. Spray Indoxacarb 14.5% SC @ 10 ml/10L at 50% flowering.';
  }
  return 'Apply 5% Neem Seed Kernel Extract (NSKE) and inspect field edges every 48 hours. Consult Taluka Agriculture Officer.';
}

/**
 * Creates an immediate simulated alert for any given field.
 */
export function createSimulatedAlertForField(
  field: FieldRecord,
  severity: 'critical' | 'high' | 'warning' = 'critical',
  triggerType: 'disease' | 'pest' | 'health' = 'disease'
): PushNotificationAlert {
  const isCritical = severity === 'critical';
  const title =
    triggerType === 'disease'
      ? isCritical
        ? `⚠️ CRITICAL DISEASE OUTBREAK THREAT`
        : `⚡ HIGH DISEASE RISK EXCEEDED`
      : triggerType === 'pest'
      ? `🐛 INVASIVE PEST THRESHOLD EXCEEDED`
      : `🚨 SEVERE CROP HEALTH DROP DETECTED`;

  const triggerReason =
    triggerType === 'disease'
      ? `AI Detected Severe Pathogen Inoculum: Critical Disease Risk`
      : triggerType === 'pest'
      ? `Invasive Pest Intensity Exceeded Threshold`
      : `Crop Health Dropped Below Minimum Threshold Floor (42%)`;

  return {
    id: `ALERT-SIM-${field.id}-${Date.now().toString().slice(-4)}`,
    fieldId: field.id,
    fieldName: field.name,
    crop: field.crop,
    title,
    message: `AI diagnostic simulation triggered: ${field.name} (${field.crop}) has exceeded the safety alert boundary. Immediate field intervention required.`,
    severity,
    triggerReason,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    metricLabel: triggerType === 'disease' ? 'Disease Risk Level' : 'Health Score',
    metricValue: triggerType === 'disease' ? 'CRITICAL (94.2% AI Confidence)' : '42% (Deficit: 28%)',
    thresholdExceeded: triggerType === 'disease' ? '≥ HIGH' : '< 70% Minimum Floor',
    cibrcAdvisorySnippet: getCibrcAdvisoryForCrop(field.crop, triggerType),
    isRead: false,
    isDismissed: false,
    source: 'manual-simulation',
  };
}
