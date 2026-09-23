import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  CheckCircle2,
  ChevronRight,
  Eye,
  Camera,
  Play,
  RotateCcw,
  Info,
  Sliders,
  TrendingUp,
  Activity,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  FileCheck,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ClientDataService } from '../../services/clientDataService';
import { AppLanguage, getLocale } from '../../locales';
import { FieldRecord } from '../../types/agri';
import { AiVoiceSpeakerButton } from '../speech/AiVoiceSpeakerButton';

interface EarlyRiskIntelligenceViewProps {
  fields?: FieldRecord[];
  onNavigateToScan?: () => void;
  onNavigateToFields?: () => void;
  language?: AppLanguage;
  onShowToast?: (msg: string) => void;
}

export const EarlyRiskIntelligenceView: React.FC<EarlyRiskIntelligenceViewProps> = ({
  fields = [],
  onNavigateToScan,
  onNavigateToFields,
  language = 'en',
  onShowToast,
}) => {
  const [horizonDays, setHorizonDays] = useState<3 | 5 | 7>(5);
  const [forecastData, setForecastData] = useState<any>(null);
  const [prioritizedFields, setPrioritizedFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('FLD-001');
  const [fieldDeepDive, setFieldDeepDive] = useState<any>(null);
  const [remoteSensingData, setRemoteSensingData] = useState<any[]>([]);
  const [weatherRisk, setWeatherRisk] = useState<any>(null);
  const [controlledRec, setControlledRec] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map Layer States
  const [layerBoundaries, setLayerBoundaries] = useState<boolean>(true);
  const [layerHeatmap, setLayerHeatmap] = useState<boolean>(true);
  const [layerSatellite, setLayerSatellite] = useState<boolean>(false);
  const [layerNdvi, setLayerNdvi] = useState<boolean>(false);
  const [layerUav, setLayerUav] = useState<boolean>(false);

  // Filter state for priority list
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCrop, setFilterCrop] = useState<string>('ALL');

  // Synthetic Outbreak Simulator States
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simStartingField, setSimStartingField] = useState<string>('FLD-001');
  const [simThreat, setSimThreat] = useState<string>('Pink Bollworm & Spore Wave');
  const [simIntensity, setSimIntensity] = useState<number>(0.85);
  const [simDays, setSimDays] = useState<number>(5);
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);

  // Load initial risk forecast & prioritized fields
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [forecast, priorityRes, rsRes, wRes] = await Promise.all([
          ClientDataService.getRiskForecastSummary(),
          ClientDataService.getPrioritizedFields(horizonDays),
          ClientDataService.getRemoteSensingFields(),
          ClientDataService.getWeatherRiskAnalysis(),
        ]);

        setForecastData(forecast);
        const ranked = priorityRes.ranked_priority_list || forecast.prioritized_fields_ranked || [];
        setPrioritizedFields(ranked);
        setRemoteSensingData(rsRes.fields || []);
        setWeatherRisk(wRes);

        if (ranked.length > 0) {
          setSelectedFieldId(ranked[0].field_id);
        }
      } catch (err) {
        console.error('Failed to load risk intelligence data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [horizonDays]);

  // Load deep dive and controlled recommendation when selectedFieldId changes
  useEffect(() => {
    if (!selectedFieldId) return;
    async function loadFieldDetails() {
      try {
        const deepDive = await ClientDataService.getFieldRiskDeepDive(selectedFieldId, horizonDays);
        setFieldDeepDive(deepDive);

        if (deepDive) {
          const rec = await ClientDataService.getControlledRecommendation({
            crop: deepDive.crop,
            risk_level: deepDive.risk_level,
            primary_threat: deepDive.primary_concern,
            growth_stage: deepDive.growth_stage,
          });
          setControlledRec(rec);
        }
      } catch (err) {
        console.error('Failed to load field deep dive', err);
      }
    }
    loadFieldDetails();
  }, [selectedFieldId, horizonDays]);

  // Active selected field object
  const activeField = useMemo(() => {
    return (
      prioritizedFields.find((f) => f.field_id === selectedFieldId) ||
      fieldDeepDive ||
      prioritizedFields[0]
    );
  }, [prioritizedFields, selectedFieldId, fieldDeepDive]);

  // Filtered fields for inspection list
  const displayFields = useMemo(() => {
    return prioritizedFields.filter((f) => {
      if (filterRisk !== 'ALL' && f.risk_level !== filterRisk) return false;
      if (filterCrop !== 'ALL' && !String(f.crop || '').toLowerCase().includes(filterCrop.toLowerCase())) return false;
      return true;
    });
  }, [prioritizedFields, filterRisk, filterCrop]);

  // Simulator handlers
  const handleStartSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await ClientDataService.startOutbreakSimulation({
        starting_field_id: simStartingField,
        pest_or_disease: simThreat,
        target_crop: 'Cotton',
        intensity: simIntensity,
        wind_direction: 'NE',
        simulated_days: simDays,
      });
      setSimResult(res);
      setIsSimulationActive(true);
      onShowToast?.('Synthetic outbreak scenario active. Map dispersion updated.');
    } catch (e) {
      console.error('Simulation error', e);
      onShowToast?.('Could not start simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await ClientDataService.resetOutbreakSimulation();
      setSimResult(null);
      setIsSimulationActive(false);
      onShowToast?.('Simulation reset. Restored actual field observation baseline.');
    } catch (e) {
      console.error('Simulation reset error', e);
    }
  };

  const getRiskBadgeClasses = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-700 border-red-300 dark:text-red-300 dark:border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-700 border-orange-300 dark:text-orange-300 dark:border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-300 dark:text-emerald-300 dark:border-emerald-500/40';
    }
  };

  return (
    <div id="risk-intelligence-page" className="space-y-6 pb-16 animate-fadeIn text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Core Header & Philosophy Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        {/* Background ambient decorative rings */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                3–7 Day Early Warning Intelligence
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-emerald-300 border border-white/10">
                Field-Level Prioritization Engine
              </span>
              {isSimulationActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse">
                  SIMULATION MODE ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Field Inspection Priority &amp; Early Risk Forecast
            </h1>

            {/* Core Philosophy Directive */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              <p className="font-semibold text-emerald-300 mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Farmer Scouting Directive:
              </p>
              <p>
                <strong>Farmers should NOT photograph every plant every day.</strong> AgriSense continuously
                synthesizes microclimate forecasts, crop calendar vulnerability stages, historical outbreak memory,
                and multispectral satellite/UAV canopy stress to tell you exactly <strong>which fields to inspect first.</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions & AI Voice Briefing */}
          <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 self-start lg:self-auto">
            <AiVoiceSpeakerButton
              text={
                prioritizedFields.length > 0
                  ? `AgriSense 7-Day Field Risk Briefing. We identified ${prioritizedFields.filter(f => f.risk_level === 'CRITICAL' || f.risk_level === 'HIGH').length} priority fields requiring field scouting. Top Priority is ${prioritizedFields[0].field_name}, growing ${prioritizedFields[0].crop} at ${prioritizedFields[0].growth_stage} stage. Risk level is ${prioritizedFields[0].risk_level}, risk score ${prioritizedFields[0].risk_score} out of 100. Primary threat: ${prioritizedFields[0].primary_threat}. Key driver: ${prioritizedFields[0].primary_driver}. Recommended scouting action: ${prioritizedFields[0].recommended_action}.`
                  : 'AgriSense 7-Day Risk Briefing: All farm plots currently maintain low disease and insect vulnerability.'
              }
              title="7-Day Farm Risk Briefing"
              variant="outline"
              size="md"
              label="🔊 Listen to Risk Briefing"
              className="bg-white/10 hover:bg-white/20 text-emerald-300 border-white/20 hover:border-emerald-400"
            />

            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {isSimulatorOpen ? 'Hide Simulator' : 'Outbreak Simulator'}
            </button>

            {isSimulationActive && (
              <button
                onClick={handleResetSimulation}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Simulation
              </button>
            )}
          </div>
        </div>

        {/* Forecast Horizon Selector Tabs */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          {([3, 5, 7] as const).map((days) => {
            const hKey = `${days}_days`;
            const hInfo = forecastData?.horizons?.[hKey];
            const isSelected = horizonDays === days;

            return (
              <button
                key={days}
                onClick={() => setHorizonDays(days)}
                className={`p-3 sm:p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Next {days} Days
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white font-display">
                    {hInfo?.average_risk_score ?? (days === 3 ? 62 : days === 5 ? 71 : 78)}
                  </span>
                  <span className="text-[10px] text-slate-400">/100 Avg Risk</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>
                    <strong>{hInfo?.high_risk_fields_count ?? (days === 3 ? 3 : 4)} fields</strong> high risk
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Synthetic Outbreak Simulator Drawer / Modal (When Opened) */}
      {isSimulatorOpen && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border-2 border-amber-500/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                Hackathon Simulation &amp; Stress Testing
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                Synthetic Outbreak Simulator
              </h3>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Test and demonstrate how AgriSense early warning detects an emerging pathogen or insect swarm
            over consecutive days. Deterministic spatial simulation predicts which neighbor plots will cross
            the threshold next. <em>Does not overwrite real historical records.</em>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Outbreak Epicenter Field
              </label>
              <select
                value={simStartingField}
                onChange={(e) => setSimStartingField(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {prioritizedFields.map((f) => (
                  <option key={f.field_id} value={f.field_id}>
                    {f.field_id} - {f.crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Simulated Pathogen / Pest
              </label>
              <select
                value={simThreat}
                onChange={(e) => setSimThreat(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="Pink Bollworm & Spore Wave">Pink Bollworm (Pectinophora gossypiella)</option>
                <option value="Soybean Foliar Rust Epidemic">Soybean Rust (Phakopsora pachyrhizi)</option>
                <option value="Rice Blast & Hopperburn">Rice Blast (Magnaporthe oryzae)</option>
                <option value="Potato Late Blight Wave">Late Blight (Phytophthora infestans)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Outbreak Intensity ({Math.round(simIntensity * 100)}%)
              </label>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={simIntensity}
                onChange={(e) => setSimIntensity(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Simulation Horizon
              </label>
              <select
                value={simDays}
                onChange={(e) => setSimDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={3}>3 Days Projection</option>
                <option value={5}>5 Days Projection</option>
                <option value={7}>7 Days Projection</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleStartSimulation}
                disabled={isSimulating}
                className="w-full px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {isSimulating ? 'Simulating...' : 'Run Spread'}
              </button>
            </div>
          </div>

          {/* Simulation Output Timeline */}
          {simResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-amber-400/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">
                  Spread Progression Timeline ({simThreat})
                </span>
                <span className="text-[11px] text-slate-400">
                  Deterministic Spatial Decay Model (Seed 42)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {simResult.timeline?.map((step: any) => (
                  <div key={step.day_number} className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                      <span>{step.label}</span>
                      <span className="text-red-400">{step.active_outbreak_fields} High Risk</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      {step.fields.slice(0, 3).map((f: any) => (
                        <div key={f.field_id} className="flex items-center justify-between">
                          <span>{f.field_id}</span>
                          <span className={`font-semibold ${f.simulated_risk_score >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                            {f.simulated_risk_score}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Grid: Priority Inspection Engine (Left 7 Cols) + Map & Satellite Layers (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Ranked Field Inspection Priority (Most Important Feature) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    Field Inspection Priority
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                    Inspect Top Fields First
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by combined risk probability over the next {horizonDays} days.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Only</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Crops</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>
            </div>

            {/* Ranked Field Cards */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
              {displayFields.map((field) => {
                const isSelected = field.field_id === selectedFieldId;
                const isUrgent = field.risk_level === 'CRITICAL' || field.risk_level === 'HIGH';

                return (
                  <div
                    key={field.field_id}
                    onClick={() => setSelectedFieldId(field.field_id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : isUrgent
                        ? 'bg-red-50/30 border-red-200 hover:border-red-300'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top priority banner & Rank */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          field.inspection_priority === 1
                            ? 'bg-red-600 text-white shadow-xs'
                            : field.inspection_priority <= 3
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}>
                          {field.inspection_priority}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {field.field_name}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              ({field.field_id})
                            </span>
                          </div>
                          <span className="text-xs text-slate-600">
                            {field.crop || 'Crop'} • {field.growth_stage || 'Growth Phase'} • {field.area_acres ?? 3.5} Acres
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getRiskBadgeClasses(field.risk_level)}`}>
                          {field.risk_level || 'MONITOR'} ({field.risk_score ?? 50})
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {field.main_risk
                            ? (String(field.main_risk).toLowerCase() === 'both' ? 'Disease + Pest' : String(field.main_risk).toUpperCase())
                            : (field.primary_threat ? String(field.primary_threat).toUpperCase() : 'DISEASE & PEST')}
                        </div>
                      </div>
                    </div>

                    {/* Primary Concern & Action Directive */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${isUrgent ? 'text-red-600' : 'text-amber-500'}`} />
                        <span className="font-semibold text-slate-800 truncate">
                          Threat: {field.primary_concern || field.primary_threat || 'General Foliar Health'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                        {(field.disease_risk ?? 40)}% Disease / {(field.pest_risk ?? 30)}% Pest
                      </span>
                    </div>

                    {/* Reasons list (XAI explanation why this field is prioritized) */}
                    <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                      {(field.reasons || []).slice(0, 2).map((r: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-600 truncate">
                          <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] italic truncate max-w-[280px]">
                        {field.recommended_action_timeline || field.inspection_action || 'Routine weekly monitoring recommended.'}
                      </span>

                      <div className="flex items-center gap-2">
                        {isUrgent && onNavigateToScan && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToScan();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            Targeted Photo Check
                          </button>
                        )}
                        <span className="text-emerald-700 font-semibold text-xs flex items-center">
                          Inspect Risk <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Risk Projection Chart */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Regional 7-Day Outbreak Trend Projection
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated trajectory based on incoming rainfall frequency and temperature shifts.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                Weather + Phenology Composite
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecastData?.daily_trend_7_days || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    name="Overall Risk"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#riskGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pest"
                    name="Pest Activity"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#pestGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cadastral Map + Satellite/UAV Layers + XAI Drill-Down (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Field Risk Map */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Cadastral Field Risk Map</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Sector 1–4 Grid</span>
            </div>

            {/* Map Layer Switcher Toggles */}
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Map Layers &amp; Remote Sensing
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setLayerBoundaries(!layerBoundaries)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    layerBoundaries ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  ✓ Boundaries
                </button>
                <button
                  onClick={() => setLayerHeatmap(!layerHeatmap)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    layerHeatmap ? 'bg-red-100 text-red-800 border-red-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {layerHeatmap ? '✓ Heatmap' : 'Heatmap'}
                </button>
                <button
                  onClick={() => setLayerSatellite(!layerSatellite)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    layerSatellite ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {layerSatellite ? '✓ Satellite' : '🛰️ Satellite'}
                </button>
                <button
                  onClick={() => setLayerNdvi(!layerNdvi)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    layerNdvi ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {layerNdvi ? '✓ NDVI Stress' : '🌿 NDVI'}
                </button>
                <button
                  onClick={() => setLayerUav(!layerUav)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    layerUav ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {layerUav ? '✓ UAV Drone' : '🛸 UAV Drone'}
                </button>
              </div>

              {(layerSatellite || layerNdvi || layerUav) && (
                <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  <strong>Simulated Remote Sensing:</strong> Sentinel-2 &amp; UAV imagery indices are generated to demonstrate biophysical anomaly detection.
                </div>
              )}
            </div>

            {/* SVG Visual Stage with Cadastral Field Polygons */}
            <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              {/* Satellite raster background texture if enabled */}
              {layerSatellite && (
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
              )}

              <svg className="w-full h-full p-3" viewBox="0 0 400 250">
                {/* Visual Field Grid Boxes simulating cadastral boundaries */}
                {[
                  { id: 'FLD-001', x: 20, y: 20, w: 105, h: 95, crop: 'Rice', score: 87, level: 'CRITICAL', ndvi: 0.48 },
                  { id: 'FLD-002', x: 135, y: 20, w: 120, h: 95, crop: 'Rice', score: 74, level: 'HIGH', ndvi: 0.58 },
                  { id: 'FLD-003', x: 265, y: 20, w: 115, h: 95, crop: 'Wheat', score: 32, level: 'LOW', ndvi: 0.82 },
                  { id: 'FLD-004', x: 20, y: 125, w: 115, h: 105, crop: 'Tomato', score: 82, level: 'CRITICAL', ndvi: 0.45 },
                  { id: 'FLD-005', x: 145, y: 125, w: 110, h: 105, crop: 'Potato', score: 85, level: 'CRITICAL', ndvi: 0.42 },
                  { id: 'FLD-006', x: 265, y: 125, w: 115, h: 105, crop: 'Cotton', score: 78, level: 'HIGH', ndvi: 0.54 },
                ].map((poly) => {
                  const isCurSelected = poly.id === selectedFieldId;

                  // Fill color depends on active layer
                  let fillColor = '#10b981'; // Green
                  if (layerNdvi) {
                    fillColor = poly.ndvi < 0.5 ? '#ef4444' : poly.ndvi < 0.65 ? '#f59e0b' : '#10b981';
                  } else if (layerHeatmap) {
                    fillColor = poly.level === 'CRITICAL' ? '#ef4444' : poly.level === 'HIGH' ? '#f97316' : poly.level === 'MODERATE' ? '#eab308' : '#10b981';
                  }

                  return (
                    <g
                      key={poly.id}
                      onClick={() => setSelectedFieldId(poly.id)}
                      className="cursor-pointer transition-all hover:opacity-90"
                    >
                      <rect
                        x={poly.x}
                        y={poly.y}
                        width={poly.w}
                        height={poly.h}
                        rx={10}
                        fill={fillColor}
                        fillOpacity={isCurSelected ? 0.85 : 0.45}
                        stroke={isCurSelected ? '#ffffff' : fillColor}
                        strokeWidth={isCurSelected ? 3 : 1.5}
                      />
                      {/* Active Pulse Ring on Critical fields */}
                      {poly.level === 'CRITICAL' && (
                        <circle
                          cx={poly.x + poly.w / 2}
                          cy={poly.y + poly.h / 2}
                          r={18}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          className="animate-ping origin-center"
                        />
                      )}
                      <text
                        x={poly.x + poly.w / 2}
                        y={poly.y + poly.h / 2 - 8}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {poly.id}
                      </text>
                      <text
                        x={poly.x + poly.w / 2}
                        y={poly.y + poly.h / 2 + 8}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="9"
                      >
                        {poly.crop} ({poly.score})
                      </text>
                      {layerNdvi && (
                        <text
                          x={poly.x + poly.w / 2}
                          y={poly.y + poly.h / 2 + 20}
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="8"
                          fontFamily="monospace"
                        >
                          NDVI {poly.ndvi}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Map Legend Floating Pill */}
              <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] text-slate-300 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Risk Scale:</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* XAI Factor Attribution Breakdown & Remote Sensing Card */}
          {activeField && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Explainable AI (XAI) Factor Attribution
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Why is {activeField.field_name} at {activeField.risk_level} Risk?
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase border ${getRiskBadgeClasses(activeField.risk_level)}`}>
                  {activeField.risk_score}/100
                </span>
              </div>

              {/* XAI Factor Points Waterfall */}
              <div className="space-y-2 text-xs">
                {activeField.xai_contributors?.map((item: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{item.factor}</div>
                      <div className="text-[11px] text-slate-500">{item.description}</div>
                    </div>
                    <span className="font-mono font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                      +{item.impact}
                    </span>
                  </div>
                ))}
              </div>

              {/* Satellite / UAV Indicator Details */}
              {activeField.remote_sensing_details && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Multispectral Satellite Telemetry
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                      Sentinel-2 MSI
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Current NDVI</div>
                      <div className="text-sm font-black text-white font-mono">
                        {activeField.remote_sensing_details.metrics?.ndvi}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Baseline NDVI</div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {activeField.remote_sensing_details.metrics?.crop_baseline_ndvi}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Anomaly %</div>
                      <div className="text-sm font-black text-red-400 font-mono">
                        {activeField.remote_sensing_details.metrics?.vegetation_anomaly_pct}%
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 italic leading-relaxed">
                    "{activeField.remote_sensing_details.advisory_wording}"
                  </p>
                </div>
              )}

              {/* Controlled Treatment Protocol (IPM + CIBRC) */}
              {controlledRec && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      Controlled IPM Action Protocol
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      CIBRC Compliant
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {controlledRec.action_steps?.map((st: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                        <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                          <span>{st.phase}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">{st.urgency}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {st.action}
                        </p>
                        {st.cibrc_data && (
                          <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-500 flex flex-wrap gap-2">
                            <span>PHI: <strong>{st.cibrc_data.pre_harvest_interval_days} Days</strong></span>
                            <span>Toxicity: <strong>{st.cibrc_data.toxicity_band}</strong></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    {controlledRec.regulatory_disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
