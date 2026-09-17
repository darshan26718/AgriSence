import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  AlertTriangle,
  Droplets,
  Thermometer,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ModernCropHealthView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'SEASON'>('30D');

  const healthTrend = [
    { date: 'Aug 01', health: 88, disease: 10, moisture: 78 },
    { date: 'Aug 05', health: 86, disease: 14, moisture: 80 },
    { date: 'Aug 10', health: 82, disease: 22, moisture: 84 },
    { date: 'Aug 15', health: 79, disease: 32, moisture: 76 },
    { date: 'Aug 20', health: 84, disease: 24, moisture: 74 },
    { date: 'Aug 25', health: 89, disease: 15, moisture: 72 },
    { date: 'Sep 01', health: 91, disease: 12, moisture: 75 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Crop Health Analytics</h2>
          <p className="text-sm text-slate-500">
            Foliar vigor, pathogen susceptibility trends, and moisture dynamics.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          {(['30D', '90D', 'SEASON'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === range ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {range === '30D' ? 'Last 30 Days' : range === '90D' ? 'Quarter' : 'Full Season'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Overall Health</span>
            <HeartPulse className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-display">87%</span>
            <span className="text-xs text-emerald-600 font-medium block mt-0.5">High vigor baseline</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Disease Risk</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-orange-600 font-display">22%</span>
            <span className="text-xs text-slate-500 block mt-0.5">Below economic threshold</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Soil Moisture</span>
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">76%</span>
            <span className="text-xs text-blue-600 font-medium block mt-0.5">Optimal Vafsa condition</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Temperature</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">30.8°C</span>
            <span className="text-xs text-slate-500 block mt-0.5">Favorable growth window</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Health Trend */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display">Crop Health Index Trend</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cropHealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="health" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#cropHealthGrad)" name="Health %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Charts: Disease Risk & Moisture Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disease Risk Trend */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">Pathogen Disease Trend</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 50]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="disease" fill="#ea580c" radius={[6, 6, 0, 0]} name="Disease Risk %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moisture Trend */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">Soil Moisture Dynamics</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[60, 90]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="moisture" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} name="Moisture %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
