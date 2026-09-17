import { RiskLevel } from './agri';

export interface DetectionThresholds {
  minHealthScoreFloor: number; // e.g. 70 (trigger when health_score < minHealthScoreFloor)
  diseaseRiskThreshold: RiskLevel; // trigger when field.disease_risk >= threshold
  pestRiskThreshold: RiskLevel; // trigger when field.pest_risk >= threshold
  microclimateHumidityTrigger: number; // e.g. 75%
  enableSound: boolean;
  enableVibration: boolean;
  autoMonitorPolling: boolean;
  pollingIntervalSeconds: number;
}

export interface PushNotificationAlert {
  id: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  triggerReason: string;
  timestamp: string;
  metricLabel: string;
  metricValue: string;
  thresholdExceeded: string;
  cibrcAdvisorySnippet: string;
  isRead: boolean;
  isDismissed: boolean;
  source: 'ai-detection-threshold' | 'microclimate-telemetry' | 'manual-simulation';
}

export const DEFAULT_DETECTION_THRESHOLDS: DetectionThresholds = {
  minHealthScoreFloor: 70,
  diseaseRiskThreshold: 'HIGH',
  pestRiskThreshold: 'HIGH',
  microclimateHumidityTrigger: 75,
  enableSound: true,
  enableVibration: true,
  autoMonitorPolling: false,
  pollingIntervalSeconds: 15,
};
