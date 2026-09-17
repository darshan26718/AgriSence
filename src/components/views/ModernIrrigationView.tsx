import React, { useState } from 'react';
import {
  Droplets,
  Waves,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Power,
  RotateCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ModernIrrigationView: React.FC = () => {
  const [valvesActive, setValvesActive] = useState<boolean>(false);

  const moistureData = [
    { time: '00:00', plot1: 76, plot2: 70, plot3: 82 },
    { time: '04:00', plot1: 75, plot2: 69, plot3: 81 },
    { time: '08:00', plot1: 73, plot2: 67, plot3: 79 },
    { time: '12:00', plot1: 70, plot2: 65, plot3: 76 },
    { time: '16:00', plot1: 74, plot2: 68, plot3: 78 },
    { time: '20:00', plot1: 76, plot2: 71, plot3: 80 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Irrigation Intelligence</h2>
          <p className="text-sm text-slate-500">
            Real-time soil moisture sensors, evapotranspiration indices, and smart solenoid valve control.
          </p>
        </div>

        <button
          onClick={() => setValvesActive(!valvesActive)}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
            valvesActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{valvesActive ? 'Stop Drip Lines' : 'Trigger Automated Drip Cycle'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Soil Moisture</span>
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">75.4%</span>
            <span className="text-xs text-blue-600 font-semibold block mt-0.5">Optimal Vafsa field capacity</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Water Requirement</span>
            <Waves className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">0 mm</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-0.5">Sufficient for next 48 hrs</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Irrigation Status</span>
            <Gauge className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-bold font-display ${
              valvesActive ? 'text-emerald-700' : 'text-slate-900'
            }`}>
              {valvesActive ? 'Active' : 'Standby'}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">Drip automation enabled</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Next Scheduled Run</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">In 2 Days</span>
            <span className="text-xs text-slate-500 block mt-0.5">06:00 AM Morning cycle</span>
          </div>
        </div>
      </div>

      {/* Moisture Trend Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Soil Moisture Sensor Feeds</h3>
            <p className="text-xs text-slate-500">Root-zone capillary capacity across 3 telemetry probes</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="text-emerald-700 font-semibold">Plot 1 (Cotton)</span>
            <span className="text-blue-600 font-semibold">Plot 2 (Soybean)</span>
            <span className="text-indigo-600 font-semibold hidden sm:inline">Plot 3 (Rice)</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moistureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="plot1" stroke="#15803d" fill="#15803d" fillOpacity={0.15} strokeWidth={2} name="Plot 1 %" />
              <Area type="monotone" dataKey="plot2" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} name="Plot 2 %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Irrigation Recommendation Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>Smart Agronomic Recommendation</span>
        </div>
        <p className="text-xs text-emerald-900/90 leading-relaxed">
          Current root-zone soil tension across all cotton and soybean acreage indicates adequate capillary moisture (&gt;72%). Evapotranspiration is compensated by morning dew and upcoming evening showers. <strong>No manual irrigation required today.</strong>
        </p>
      </div>
    </div>
  );
};
