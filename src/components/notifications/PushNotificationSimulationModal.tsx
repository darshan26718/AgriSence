import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FieldRecord, RiskLevel } from '../../types/agri';
import { DetectionThresholds, PushNotificationAlert } from '../../types/notification';
import { evaluateFieldThreshold, evaluateAllFields } from '../../utils/thresholdEvaluator';
import { playNotificationChime } from '../../utils/notificationSound';

interface PushNotificationSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldRecord[];
  thresholds: DetectionThresholds;
  onUpdateThresholds: (newThresholds: DetectionThresholds) => void;
  onTriggerAlert: (alert: PushNotificationAlert) => void;
  alertHistory: PushNotificationAlert[];
  onClearHistory: () => void;
  onNavigateToAdvisory: (crop: string, pestOrDisease: string) => void;
}

export const PushNotificationSimulationModal: React.FC<PushNotificationSimulationModalProps> = ({
  isOpen,
  onClose,
  fields = [],
  thresholds,
  onUpdateThresholds,
  onTriggerAlert,
  alertHistory = [],
  onClearHistory,
  onNavigateToAdvisory,
}) => {
  const [activeTab, setActiveTab] = useState<'thresholds' | 'fields-audit' | 'simulation' | 'history'>('thresholds');
  const [testSoundState, setTestSoundState] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestSound = (severity: 'critical' | 'high') => {
    setTestSoundState(severity);
    playNotificationChime(severity);
    setTimeout(() => setTestSoundState(null), 1000);
  };

  // Preset simulation helpers
  const handleSimulateCriticalCotton = () => {
    const cottonField = fields.find(f => f.crop.toLowerCase().includes('cotton')) || fields[0] || {
      id: 'FLD-SIM-COTTON',
      name: 'Gut No. 42/B - Main Cotton Field',
      crop: 'Cotton (Kapus)',
      health_score: 54,
      disease_risk: 'CRITICAL' as RiskLevel,
      pest_risk: 'HIGH' as RiskLevel,
    };

    const alert: PushNotificationAlert = {
      id: `ALERT-SIM-${Date.now()}`,
      fieldId: cottonField.id,
      fieldName: cottonField.name,
      crop: cottonField.crop,
      title: '🚨 CRITICAL PINK BOLLWORM & BACTERIAL BLIGHT SURGE',
      message: `AI Surveillance detected 14% damaged flowers & high oviposition on ${cottonField.name}. Disease & Pest risk reached CRITICAL, exceeding your ${thresholds.diseaseRiskThreshold} limit.`,
      severity: 'critical',
      triggerReason: `Severe Disease Risk: CRITICAL (Threshold: ${thresholds.diseaseRiskThreshold})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Infestation Level',
      metricValue: 'CRITICAL (54% Health)',
      thresholdExceeded: `≥ ${thresholds.diseaseRiskThreshold}`,
      cibrcAdvisorySnippet: 'Install 5 pheromone traps/acre immediately. Spray Cold-Pressed Neem Oil 10,000 PPM (5 ml/L) or Profenofos 50% EC.',
      isRead: false,
      isDismissed: false,
      source: 'manual-simulation',
    };

    if (thresholds.enableSound) {
      playNotificationChime('critical');
    }
    onTriggerAlert(alert);
    onClose();
  };

  const handleSimulateSoybeanRust = () => {
    const soyField = fields.find(f => f.crop.toLowerCase().includes('soybean')) || {
      id: 'FLD-SIM-SOY',
      name: 'Plot 18/A - Soybean Sector',
      crop: 'Soybean (JS 335)',
      health_score: 58,
      disease_risk: 'HIGH' as RiskLevel,
      pest_risk: 'MODERATE' as RiskLevel,
    };

    const alert: PushNotificationAlert = {
      id: `ALERT-SIM-${Date.now()}`,
      fieldId: soyField.id,
      fieldName: soyField.name,
      crop: soyField.crop,
      title: '⚠️ SOYBEAN RUST SPORE GERMINATION HAZARD',
      message: `Atmospheric microclimate telemetry indicates 82% humidity for 6 consecutive hours. Soybean Rust risk has breached your ${thresholds.diseaseRiskThreshold} threshold.`,
      severity: 'high',
      triggerReason: `High Humidity (82%) + Disease Risk HIGH (Threshold: ${thresholds.diseaseRiskThreshold})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Spore Conducive Hours',
      metricValue: '6.5 hrs (82% RH)',
      thresholdExceeded: `≥ ${thresholds.microclimateHumidityTrigger}% RH`,
      cibrcAdvisorySnippet: 'Spray Hexaconazole 5% EC @ 2 ml/L or Tebuconazole 25.9% EC @ 1.5 ml/L on leaf undersides.',
      isRead: false,
      isDismissed: false,
      source: 'microclimate-telemetry',
    };

    if (thresholds.enableSound) {
      playNotificationChime('high');
    }
    onTriggerAlert(alert);
    onClose();
  };

  const handleSimulateHealthDeficit = () => {
    const targetField = fields[0] || {
      id: 'FLD-GENERIC',
      name: 'Gut No. 42/B',
      crop: 'Cotton',
      health_score: 48,
    };

    const alert: PushNotificationAlert = {
      id: `ALERT-SIM-HLT-${Date.now()}`,
      fieldId: targetField.id,
      fieldName: targetField.name,
      crop: targetField.crop,
      title: '🚨 SEVERE CROP HEALTH DEFICIT (< 50%)',
      message: `Vegetative vigor and canopy density for ${targetField.name} dropped to 48%, significantly below your ${thresholds.minHealthScoreFloor}% minimum health score floor.`,
      severity: 'critical',
      triggerReason: `Crop Health Score: 48% (Threshold Floor: ${thresholds.minHealthScoreFloor}%)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metricLabel: 'Health Score Deficit',
      metricValue: '48% (-22% deficit)',
      thresholdExceeded: `< ${thresholds.minHealthScoreFloor}%`,
      cibrcAdvisorySnippet: 'Immediate field inspection required. Take leaf photo via AI Scanner for microscopic diagnosis.',
      isRead: false,
      isDismissed: false,
      source: 'ai-detection-threshold',
    };

    if (thresholds.enableSound) {
      playNotificationChime('critical');
    }
    onTriggerAlert(alert);
    onClose();
  };

  const handleRunBatchAudit = () => {
    const alerts = evaluateAllFields(fields, thresholds, 80);
    if (alerts.length > 0) {
      alerts.forEach(a => onTriggerAlert(a));
      if (thresholds.enableSound) {
        playNotificationChime(alerts[0].severity);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-outline-variant/20 bg-surface-container flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">notifications_active</span>
            </div>
            <div>
              <h2 className="text-title-md font-bold text-on-surface leading-tight">
                AI Detection Push Alert Simulator
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Configure threshold triggers & test live notification banners on saved fields
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/20 px-5 pt-2 bg-surface-container/50 gap-2 overflow-x-auto text-label-md font-bold">
          {[
            { id: 'thresholds', label: 'Alert Thresholds', icon: 'tune' },
            { id: 'fields-audit', label: `Saved Fields (${fields.length})`, icon: 'agriculture' },
            { id: 'simulation', label: 'Instant Simulator', icon: 'bolt' },
            { id: 'history', label: `Logs (${alertHistory.length})`, icon: 'history' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: THRESHOLD CONFIGURATION */}
          {activeTab === 'thresholds' && (
            <div className="space-y-5">
              {/* Threshold 1: Disease Risk Level */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-600 text-[20px]">coronavirus</span>
                    <span className="font-bold text-title-sm text-on-surface">
                      Severe Disease Risk Trigger
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Currently: {thresholds.diseaseRiskThreshold}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  Triggers an urgent push banner whenever AI image diagnosis or sensor analytics detects disease probability at or above this level.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(['MODERATE', 'HIGH', 'CRITICAL'] as RiskLevel[]).map(level => {
                    const isSelected = thresholds.diseaseRiskThreshold === level;
                    return (
                      <button
                        key={level}
                        onClick={() =>
                          onUpdateThresholds({ ...thresholds, diseaseRiskThreshold: level })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? level === 'CRITICAL'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                              : level === 'HIGH'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                              : 'bg-primary text-on-primary border-primary shadow-md'
                            : 'bg-surface hover:bg-surface-container border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <span>{level}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {level === 'CRITICAL' ? '≥ 85% Risk' : level === 'HIGH' ? '≥ 65% Risk' : '≥ 45% Risk'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threshold 2: Minimum Health Score Floor */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">ecg_heart</span>
                    <span className="font-bold text-title-sm text-on-surface">
                      Minimum Health Score Floor
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Alert if &lt; {thresholds.minHealthScoreFloor}%
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  If any saved field's composite health index drops below this percentage, trigger an early-warning push banner.
                </p>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="40"
                    max="90"
                    step="5"
                    value={thresholds.minHealthScoreFloor}
                    onChange={e =>
                      onUpdateThresholds({
                        ...thresholds,
                        minHealthScoreFloor: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <span className="font-mono font-bold text-lg text-primary min-w-[50px] text-right">
                    {thresholds.minHealthScoreFloor}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-1.5 px-1">
                  <span>40% (Permissive)</span>
                  <span>70% (Standard ICAR)</span>
                  <span>90% (Strict)</span>
                </div>
              </div>

              {/* Threshold 3: Pest Economic Threshold (ETL) */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">pest_control</span>
                    <span className="font-bold text-title-sm text-on-surface">
                      Pest ETL Trigger Level
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Currently: {thresholds.pestRiskThreshold}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  Triggers notification when trap counts or larval scouting breaches economic injury levels.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(['MODERATE', 'HIGH', 'CRITICAL'] as RiskLevel[]).map(level => {
                    const isSelected = thresholds.pestRiskThreshold === level;
                    return (
                      <button
                        key={level}
                        onClick={() =>
                          onUpdateThresholds({ ...thresholds, pestRiskThreshold: level })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                            : 'bg-surface hover:bg-surface-container border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <span>{level}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {level === 'CRITICAL' ? 'ETL > 10% damage' : level === 'HIGH' ? 'ETL > 5% damage' : 'Early sighting'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threshold 4: Microclimate Humidity Spore Trigger */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">water_drop</span>
                    <span className="font-bold text-title-sm text-on-surface">
                      Microclimate Spore Humidity Trigger
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Alert if &gt;= {thresholds.microclimateHumidityTrigger}% RH
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  Continuous high humidity triggers spore germination alerts for Soybean Rust & Cotton Blight.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="65"
                    max="90"
                    step="5"
                    value={thresholds.microclimateHumidityTrigger}
                    onChange={e =>
                      onUpdateThresholds({
                        ...thresholds,
                        microclimateHumidityTrigger: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <span className="font-mono font-bold text-lg text-primary min-w-[50px] text-right">
                    {thresholds.microclimateHumidityTrigger}%
                  </span>
                </div>
              </div>

              {/* Audio and Haptic Controls */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-title-sm text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">volume_up</span>
                    Audio Chime & Vibration
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Synthesize mobile push chime & haptic vibration when alert fires.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestSound('critical')}
                    className="px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>{testSoundState ? 'Playing...' : 'Test Chime'}</span>
                  </button>

                  <button
                    onClick={() =>
                      onUpdateThresholds({ ...thresholds, enableSound: !thresholds.enableSound })
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      thresholds.enableSound
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {thresholds.enableSound ? 'Sound ON' : 'Muted'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED FIELDS THRESHOLD AUDIT */}
          {activeTab === 'fields-audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-title-sm text-on-surface">
                    Saved Fields Threshold Status
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Real-time evaluation against current threshold criteria
                  </p>
                </div>

                <button
                  onClick={handleRunBatchAudit}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  <span>Audit All Fields</span>
                </button>
              </div>

              <div className="space-y-3">
                {(fields || []).map(field => {
                  const alert = evaluateFieldThreshold(field, thresholds, 78);
                  const isBreached = Boolean(alert);

                  return (
                    <div
                      key={field.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBreached
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : 'bg-surface-container-low border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-title-sm text-on-surface">
                              {field.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-semibold">
                              {field.crop}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1.5">
                            <span>Health: <strong>{field.health_score}%</strong></span>
                            <span>•</span>
                            <span>Disease: <strong className={field.disease_risk === 'HIGH' || field.disease_risk === 'CRITICAL' ? 'text-rose-600' : ''}>{field.disease_risk}</strong></span>
                            <span>•</span>
                            <span>Pest: <strong className={field.pest_risk === 'HIGH' || field.pest_risk === 'CRITICAL' ? 'text-amber-600' : ''}>{field.pest_risk}</strong></span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1.5">
                          {isBreached ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              THRESHOLD EXCEEDED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              SAFE
                            </span>
                          )}

                          <button
                            onClick={() => {
                              if (alert) {
                                if (thresholds.enableSound) playNotificationChime(alert.severity);
                                onTriggerAlert(alert);
                              } else {
                                // Force simulate on this field
                                const manualAlert: PushNotificationAlert = {
                                  id: `ALERT-MANUAL-${field.id}-${Date.now()}`,
                                  fieldId: field.id,
                                  fieldName: field.name,
                                  crop: field.crop,
                                  title: `⚠️ SIMULATED THRESHOLD BREACH ON ${field.name}`,
                                  message: `Simulated test alert: AI detection threshold for ${field.crop} was triggered for verification.`,
                                  severity: 'high',
                                  triggerReason: 'Manual Simulation Trigger',
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  metricLabel: 'Simulated Index',
                                  metricValue: 'Exceeded',
                                  thresholdExceeded: 'Yes',
                                  cibrcAdvisorySnippet: 'Apply certified bio-control measures per CIBRC handbook.',
                                  isRead: false,
                                  isDismissed: false,
                                  source: 'manual-simulation',
                                };
                                if (thresholds.enableSound) playNotificationChime('high');
                                onTriggerAlert(manualAlert);
                              }
                              onClose();
                            }}
                            className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <span>Trigger Push Banner</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>

                      {isBreached && alert && (
                        <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs font-medium">
                          <strong>Trigger Reason: </strong> {alert.triggerReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INSTANT SIMULATOR PRESETS */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-title-sm text-on-surface">
                  Instant Agricultural Threat Simulations
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  One-click scenarios to verify alert banner layout, audio chime, and CIBRC advisory integration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Scenario 1 */}
                <button
                  onClick={handleSimulateCriticalCotton}
                  className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-rose-600 text-[22px]">
                        pest_control_rodent
                      </span>
                      <span className="font-bold text-sm text-rose-900 dark:text-rose-200">
                        Critical Pink Bollworm Breach
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Simulates Gut No. 42/B Cotton exceeding ETL with 14% damaged rosette flowers & high oviposition threat.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
                    <span>Fire Critical Push Banner</span>
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                </button>

                {/* Scenario 2 */}
                <button
                  onClick={handleSimulateSoybeanRust}
                  className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[22px]">
                        air
                      </span>
                      <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        Soybean Rust Spore Surge
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Simulates microclimate humidity &gt; 80% triggering high fungal rust risk in soybean plots.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    <span>Fire Spore Alert Banner</span>
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                </button>

                {/* Scenario 3 */}
                <button
                  onClick={handleSimulateHealthDeficit}
                  className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-[22px]">
                        health_and_safety
                      </span>
                      <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                        Severe Crop Health Deficit (&lt;50%)
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Simulates rapid vegetative vigor drop triggering early warning advisory.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                    <span>Fire Health Floor Banner</span>
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                </button>

                {/* Scenario 4 */}
                <button
                  onClick={handleRunBatchAudit}
                  className="p-4 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-primary text-[22px]">
                        fact_check
                      </span>
                      <span className="font-bold text-sm text-primary">
                        Batch Audit All Saved Fields
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Evaluates all {fields.length} saved fields against configured thresholds in parallel.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Execute Full Audit</span>
                    <span className="material-symbols-outlined text-[16px]">radar</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ALERT HISTORY / LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-title-sm text-on-surface">
                    Notification Log History
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Record of triggered alerts and threshold violations
                  </p>
                </div>

                {alertHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              {alertHistory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">
                    notifications_off
                  </span>
                  <p className="text-body-md text-on-surface-variant font-medium">
                    No push notification alerts recorded yet.
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">
                    Trigger an alert from the Instant Simulator tab to test.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(alertHistory || []).map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              item.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {item.severity}
                          </span>
                          <span className="font-bold text-on-surface">{item.fieldName}</span>
                          <span className="text-on-surface-variant">({item.crop})</span>
                        </div>
                        <p className="text-on-surface font-semibold">{item.title}</p>
                        <p className="text-on-surface-variant mt-0.5">{item.message}</p>
                        <div className="mt-1 text-[11px] text-on-surface-variant/80">
                          <span>{item.timestamp}</span> • <span>{item.triggerReason}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onTriggerAlert(item);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary font-bold transition-colors cursor-pointer flex-shrink-0"
                      >
                        Re-trigger
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-outline-variant/20 bg-surface-container flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Central Insecticides Board & Registration Committee (CIBRC) certified logic
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
