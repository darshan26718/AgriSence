import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Droplets,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
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
  AreaChart,
  Area,
} from 'recharts';
import { NavView } from '../layout/Sidebar';

interface AgriculturalAnalyticsViewProps {
  setActiveView?: (view: NavView) => void;
}

export const AgriculturalAnalyticsView: React.FC<AgriculturalAnalyticsViewProps> = ({ setActiveView }) => {
  const epidemiologicalSpread = [
    { week: 'W1', blastSporeCount: 120, blightIncidence: 5, armywormEggMasses: 10, humidityAvg: 62 },
    { week: 'W2', blastSporeCount: 190, blightIncidence: 9, armywormEggMasses: 18, humidityAvg: 68 },
    { week: 'W3', blastSporeCount: 380, blightIncidence: 18, armywormEggMasses: 34, humidityAvg: 79 },
    { week: 'W4 (Rain)', blastSporeCount: 920, blightIncidence: 48, armywormEggMasses: 62, humidityAvg: 91 },
    { week: 'W5 (Peak)', blastSporeCount: 1250, blightIncidence: 76, armywormEggMasses: 85, humidityAvg: 94 },
    { week: 'W6 (IPM)', blastSporeCount: 420, blightIncidence: 32, armywormEggMasses: 28, humidityAvg: 74 },
    { week: 'W7 (Recovery)', blastSporeCount: 140, blightIncidence: 12, armywormEggMasses: 12, humidityAvg: 65 },
  ];

  const cropLossAvoidance = [
    { crop: 'Rice', projectedLossNoIPM: 35, actualLossWithAI: 6, yieldSavedPct: 29 },
    { crop: 'Tomato', projectedLossNoIPM: 45, actualLossWithAI: 8, yieldSavedPct: 37 },
    { crop: 'Potato', projectedLossNoIPM: 52, actualLossWithAI: 11, yieldSavedPct: 41 },
    { crop: 'Cotton', projectedLossNoIPM: 38, actualLossWithAI: 7, yieldSavedPct: 31 },
    { crop: 'Wheat', projectedLossNoIPM: 25, actualLossWithAI: 4, yieldSavedPct: 21 },
  ];

  const severityPieData = [
    { name: 'Low (0-20%)', value: 18, color: '#10b981' },
    { name: 'Moderate (20-40%)', value: 32, color: '#f59e0b' },
    { name: 'High (40-70%)', value: 28, color: '#f97316' },
    { name: 'Critical (>70%)', value: 22, color: '#ef4444' },
  ];

  return (
    <div id="agricultural-analytics-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Agricultural Epidemiology &amp; Impact Analytics
          </div>
          <p className="text-slate-400 leading-relaxed">
            Longitudinal crop surveillance data demonstrating spore accumulation surges, microclimate humidity triggers, and measured economic yield loss avoidance across test sectors.
          </p>
        </div>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-emerald-500/30 shadow-md">
          <div className="text-xs font-bold text-slate-400 uppercase">Average Yield Protected</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">+31.8%</div>
          <div className="text-xs text-slate-300 mt-1">Compared to unmonitored control fields</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/70 border border-blue-500/30 shadow-md">
          <div className="text-xs font-bold text-slate-400 uppercase">Early Warning Lead Time</div>
          <div className="text-3xl font-black text-blue-400 mt-1">4.5 Days</div>
          <div className="text-xs text-slate-300 mt-1">Before visible macroscopic foliar lesions</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/70 border border-amber-500/30 shadow-md">
          <div className="text-xs font-bold text-slate-400 uppercase">Chemical Spray Reduction</div>
          <div className="text-3xl font-black text-amber-400 mt-1">-42%</div>
          <div className="text-xs text-slate-300 mt-1">Through targeted biological timing &amp; ETL checks</div>
        </div>
      </div>

      {/* Chart 1: Epidemic Curve & Humidity Correlation */}
      <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Epidemic Progression Curve &amp; Microclimate Humidity Surge (7-Week Cycle)
            </h4>
            <p className="text-xs text-slate-400">
              Shows spore explosion during Week 4 monsoon rain, followed by rapid containment after Week 5 IPM intervention
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            IPM Intervention: W5
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={epidemiologicalSpread} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpore" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="blastSporeCount" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpore)" name="Spore Trap Index" />
              <Area type="monotone" dataKey="blightIncidence" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBlight)" name="Blight Incidence (%)" />
              <Line type="monotone" dataKey="humidityAvg" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} name="Avg RH (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Crop Loss Avoidance and Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Loss Avoidance Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Yield Loss Comparison (Unmonitored vs. CropGuard AI)
            </h4>
            <p className="text-xs text-slate-400">Yield preserved across staple Indian crops</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropLossAvoidance} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="crop" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(v: any) => [`${v}%`, 'Yield Loss']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="projectedLossNoIPM" fill="#ef4444" name="Projected Loss without AI" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualLossWithAI" fill="#10b981" name="Actual Loss with Early Action" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Level Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-md space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Pathology Severity Distribution
            </h4>
            <p className="text-xs text-slate-400">Canopy damage severity across 120 validated field samples</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`sev-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
