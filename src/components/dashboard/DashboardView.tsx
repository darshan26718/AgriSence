import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bug,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  ScanSearch,
  Droplets,
  Thermometer,
  Layers,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DashboardKPIs } from '../../services/clientDataService';
import { DetectionResult, FieldRecord } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface DashboardViewProps {
  kpis?: DashboardKPIs;
  recentDetections: DetectionResult[];
  fields: FieldRecord[];
  setActiveView?: (view: NavView) => void;
  onLaunchDemoTour?: () => void;
  onOpenLiveCamera?: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const RISK_COLORS = {
  LOW: '#10b981',
  MODERATE: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  recentDetections = [],
  fields = [],
  setActiveView,
  onLaunchDemoTour,
  onOpenLiveCamera,
}) => {
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('All');

  const handleNav = (view: NavView) => {
    if (typeof setActiveView === 'function') {
      setActiveView(view);
    }
  };

  // Safe KPI resolution: use passed prop or calculate dynamically from fields and detections
  const activeFieldsCount = fields?.length ?? 6;
  const safeAvgHealth = activeFieldsCount > 0
    ? Math.round(fields.reduce((acc, f) => acc + (f.health_score || 70), 0) / activeFieldsCount)
    : 72;

  const resolvedKpis: DashboardKPIs = {
    total_crop_records: kpis?.total_crop_records ?? 25,
    healthy_crops: kpis?.healthy_crops ?? fields.filter(f => (f.health_score || 0) >= 80).length ?? 8,
    diseased_crops: kpis?.diseased_crops ?? fields.filter(f => f.disease_risk === 'HIGH' || f.disease_risk === 'CRITICAL').length ?? 14,
    pest_affected_crops: kpis?.pest_affected_crops ?? fields.filter(f => f.pest_risk === 'HIGH' || f.pest_risk === 'CRITICAL').length ?? 12,
    high_risk_crops: kpis?.high_risk_crops ?? fields.filter(f => f.disease_risk === 'CRITICAL' || f.pest_risk === 'CRITICAL' || (f.health_score || 100) < 60).length ?? 11,
    average_health_score: kpis?.average_health_score ?? safeAvgHealth,
    most_common_disease: kpis?.most_common_disease ?? 'Rice Blast',
    most_common_pest: kpis?.most_common_pest ?? 'Brown Planthopper',
    detection_count: kpis?.detection_count ?? (recentDetections?.length ?? 5),
    recovery_rate_pct: kpis?.recovery_rate_pct ?? 84.6,
    active_fields_monitored: kpis?.active_fields_monitored ?? activeFieldsCount,
  };

  // Chart dataset based on realistic local records
  const diseaseDistributionData = [
    { name: 'Rice Blast', cases: 9, fill: '#ef4444' },
    { name: 'Tomato Early Blight', cases: 7, fill: '#f97316' },
    { name: 'Potato Late Blight', cases: 6, fill: '#dc2626' },
    { name: 'Wheat Stripe Rust', cases: 5, fill: '#eab308' },
    { name: 'Bacterial Blight', cases: 4, fill: '#3b82f6' },
    { name: 'Tikka Leaf Spot', cases: 3, fill: '#8b5cf6' },
  ];

  const pestDistributionData = [
    { name: 'Brown Planthopper', count: 8, fill: '#ef4444' },
    { name: 'Fall Armyworm', count: 7, fill: '#dc2626' },
    { name: 'Whiteflies', count: 6, fill: '#f59e0b' },
    { name: 'Pink Bollworm', count: 6, fill: '#ec4899' },
    { name: 'Aphids', count: 5, fill: '#06b6d4' },
    { name: 'Stem Borer', count: 4, fill: '#3b82f6' },
  ];

  const seasonalTrendsData = [
    { month: 'Apr', disease: 14, pest: 20, health: 84, rainfall: 2 },
    { month: 'May', disease: 19, pest: 32, health: 80, rainfall: 8 },
    { month: 'Jun', disease: 28, pest: 40, health: 74, rainfall: 45 },
    { month: 'Jul', disease: 62, pest: 48, health: 63, rainfall: 110 },
    { month: 'Aug', disease: 85, pest: 66, health: 53, rainfall: 145 },
    { month: 'Sep', disease: 42, pest: 34, health: 75, rainfall: 30 },
  ];

  const severityData = [
    { name: 'Low', count: 6, fill: '#10b981' },
    { name: 'Mild', count: 5, fill: '#84cc16' },
    { name: 'Moderate', count: 7, fill: '#f59e0b' },
    { name: 'High', count: 8, fill: '#f97316' },
    { name: 'Critical', count: 9, fill: '#ef4444' },
  ];

  const cropComparisonData = [
    { crop: 'Rice', health: 58, diseaseRisk: 82, pestRisk: 65 },
    { crop: 'Tomato', health: 52, diseaseRisk: 88, pestRisk: 74 },
    { crop: 'Potato', health: 48, diseaseRisk: 92, pestRisk: 45 },
    { crop: 'Cotton', health: 64, diseaseRisk: 42, pestRisk: 89 },
    { crop: 'Wheat', health: 82, diseaseRisk: 35, pestRisk: 28 },
    { crop: 'Maize', health: 71, diseaseRisk: 45, pestRisk: 80 },
  ];

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* SIH Welcome & Quick Flow Banner */}
      <div
        id="sih-hero-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-emerald-500/30 p-5 sm:p-6 shadow-xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Smart India Hackathon (SIH) Showcase Edition
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Early Detection &amp; Smart Management of Crop &amp; Pest Infestations
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              AI-driven multi-spectral crop diagnostic pipeline combining leaf computer-vision,
              microclimate epidemiology, explainable AI (XAI), and actionable IPM recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="dash-live-camera-btn"
              onClick={() => {
                if (onOpenLiveCamera) {
                  onOpenLiveCamera();
                } else {
                  handleNav('disease-detect');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              Live Camera Scan
            </button>
            <button
              id="dash-launch-tour-btn"
              onClick={onLaunchDemoTour}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Run 10-Step SIH Journey
            </button>
            <button
              id="dash-detect-btn"
              onClick={() => handleNav('disease-detect')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <ScanSearch className="w-4 h-4 text-emerald-400" />
              Upload &amp; Detect
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 10 Core Required KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Total Records */}
        <div
          id="kpi-total-records"
          className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 shadow-sm hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Crop Records</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{resolvedKpis.total_crop_records}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Built-in Dataset Loaded
          </div>
        </div>

        {/* KPI 2: Healthy Crops */}
        <div
          id="kpi-healthy-crops"
          className="p-4 rounded-xl bg-slate-800/70 border border-emerald-500/20 shadow-sm hover:border-emerald-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Healthy Crops</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{resolvedKpis.healthy_crops}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Score &gt;= 80/100
          </div>
        </div>

        {/* KPI 3: Diseased Crops */}
        <div
          id="kpi-diseased-crops"
          className="p-4 rounded-xl bg-slate-800/70 border border-amber-500/20 shadow-sm hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Diseased Crops</span>
            <Stethoscope className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{resolvedKpis.diseased_crops}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Fungal / bacterial signs
          </div>
        </div>

        {/* KPI 4: Pest-Affected */}
        <div
          id="kpi-pest-affected"
          className="p-4 rounded-xl bg-slate-800/70 border border-red-500/20 shadow-sm hover:border-red-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pest-Affected</span>
            <Bug className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{resolvedKpis.pest_affected_crops}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Above ETL threshold
          </div>
        </div>

        {/* KPI 5: High-Risk Crops */}
        <div
          id="kpi-high-risk"
          className="p-4 rounded-xl bg-slate-800/70 border border-red-500/30 shadow-sm bg-red-950/10"
        >
          <div className="flex items-center justify-between text-red-300 mb-1">
            <span className="text-xs font-medium">High / Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-red-400">{resolvedKpis.high_risk_crops}</div>
          <div className="text-[11px] text-red-300/80 mt-1">
            Immediate intervention
          </div>
        </div>

        {/* KPI 6: Average Health Score */}
        <div
          id="kpi-avg-health"
          className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{resolvedKpis.average_health_score}/100</div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${resolvedKpis.average_health_score}%` }}
            />
          </div>
        </div>

        {/* KPI 7: Most Common Disease */}
        <div
          id="kpi-common-disease"
          className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Common Disease</span>
            <Stethoscope className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate">{resolvedKpis.most_common_disease}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dominant in monsoon
          </div>
        </div>

        {/* KPI 8: Most Common Pest */}
        <div
          id="kpi-common-pest"
          className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Common Pest</span>
            <Bug className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate">{resolvedKpis.most_common_pest}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sap-sucking vector
          </div>
        </div>

        {/* KPI 9: Detection Count */}
        <div
          id="kpi-detections"
          className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">AI Detections Run</span>
            <ScanSearch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{resolvedKpis.detection_count}</div>
          <div className="text-[11px] text-cyan-400 mt-1">
            Logged in history
          </div>
        </div>

        {/* KPI 10: Recovery / Improvement Rate */}
        <div
          id="kpi-recovery-rate"
          className="p-4 rounded-xl bg-slate-800/70 border border-emerald-500/30 shadow-sm bg-emerald-950/10"
        >
          <div className="flex items-center justify-between text-emerald-300 mb-1">
            <span className="text-xs font-medium">Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{resolvedKpis.recovery_rate_pct}%</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            Post IPM protocol
          </div>
        </div>
      </div>

      {/* Row 1: Disease & Pest Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Distribution */}
        <div
          id="card-disease-distribution"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-amber-400" />
                Disease Occurrence Distribution
              </h3>
              <p className="text-xs text-slate-400">Relative incidence across monitored field plots</p>
            </div>
            <button
              onClick={() => handleNav('disease-db')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Browse Catalog <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseDistributionData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="cases" radius={[0, 6, 6, 0]}>
                  {diseaseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pest Distribution */}
        <div
          id="card-pest-distribution"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-400" />
                Major Crop Pest Distribution
              </h3>
              <p className="text-xs text-slate-400">Pest surveillance cases breaching economic thresholds</p>
            </div>
            <button
              onClick={() => handleNav('pest-db')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Pest Guide <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pestDistributionData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {pestDistributionData.map((entry, index) => (
                    <Cell key={`cell-pest-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Disease & Pest Infestation Trends vs Rainfall */}
      <div
        id="card-infestation-trends"
        className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Seasonal Infestation Trends vs Rainfall (6-Month Historical)
            </h3>
            <p className="text-xs text-slate-400">
              Correlating monsoon humidity surges with disease outbreaks and pest population cycles
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Disease Cases
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pest Incidents
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Avg Health Score
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seasonalTrendsData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="disease" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Disease Cases" />
              <Line type="monotone" dataKey="pest" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Pest Incidents" />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Health Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Severity Breakdown & Crop-wise Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity & Risk Distribution */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md">
          <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Infestation Severity Ratio
          </h3>
          <p className="text-xs text-slate-400 mb-4">Categorized by damage extent on canopy</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`severity-pie-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-700/60 text-center">
            <div>
              <div className="text-[11px] text-slate-400">Critical</div>
              <div className="text-sm font-bold text-red-400">25.7%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">High / Mod</div>
              <div className="text-sm font-bold text-amber-400">42.8%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Low / Mild</div>
              <div className="text-sm font-bold text-emerald-400">31.5%</div>
            </div>
          </div>
        </div>

        {/* Crop-wise Health & Vulnerability */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Crop-wise Disease &amp; Health Comparison
              </h3>
              <p className="text-xs text-slate-400">Comparative health score and vulnerability scores</p>
            </div>
            <button
              onClick={() => handleNav('analytics')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="crop" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="health" fill="#10b981" name="Health Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diseaseRisk" fill="#ef4444" name="Disease Risk" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pestRisk" fill="#f59e0b" name="Pest Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Field Alerts & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitored Fields Status */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Monitored Farm Sectors
              </h3>
              <p className="text-xs text-slate-400">Live surveillance across regional test plots</p>
            </div>
            <button
              onClick={() => handleNav('field-management')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Manage Fields <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(fields || []).slice(0, 4).map(f => (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400">({f.area_acres} Acres)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {f.crop} • Stage: {f.growth_stage} • {f.location}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge level={f.disease_risk} size="sm" />
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-200">{f.health_score}/100</div>
                    <div className="text-[9px] text-slate-400">Health</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Detection Audit Log */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ScanSearch className="w-4 h-4 text-cyan-400" />
                Latest AI Detections
              </h3>
              <p className="text-xs text-slate-400">Recent leaf diagnoses and validated pathogen profiles</p>
            </div>
            <button
              onClick={() => handleNav('detection-history')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              View Full History <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(recentDetections || []).slice(0, 4).map(d => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => handleNav('detection-history')}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{d.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {d.crop}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    Confidence: {(d.confidence * 100).toFixed(0)}% • Severity: {d.severity_pct}% • {d.timestamp}
                  </div>
                </div>

                <div className="shrink-0">
                  <RiskBadge level={d.risk_level} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
