import React from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  CloudRain,
  Wind,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { INITIAL_WEATHER_DATA } from '../../data/agriData';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface WeatherInfestationViewProps {
  setActiveView?: (view: NavView) => void;
}

export const WeatherInfestationView: React.FC<WeatherInfestationViewProps> = ({ setActiveView }) => {
  // Correlation data connecting humidity and rainfall with risk
  const correlationData = INITIAL_WEATHER_DATA.map(d => ({
    date: `${d.date.slice(5)} (${d.region.split(' ')[0]})`,
    humidity: d.humidity,
    temperature: d.temperature,
    rainfall: d.rainfall,
    riskScore: d.alert_level === 'CRITICAL' ? 92 : d.alert_level === 'HIGH' ? 72 : d.alert_level === 'MODERATE' ? 48 : 22,
    threat: d.favored_threat,
  }));

  return (
    <div id="weather-infestation-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <CloudSun className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Agro-Meteorology &amp; Pathogen Microclimate Correlation
          </div>
          <p className="text-slate-400 leading-relaxed">
            Examines empirical correlation between ambient thermal-hygrometric fluctuations and secondary fungal inoculation cycles.
          </p>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-md space-y-4">
        <div>
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Relative Humidity vs. Disease Risk Index Trend
          </h4>
          <p className="text-xs text-slate-400">
            Strong positive correlation (r = 0.89) between sustained RH &gt; 80% and exponential foliar lesion spread
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2.5} name="Relative Humidity (%)" />
              <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="4 2" name="Epidemic Risk Index" />
              <Line type="monotone" dataKey="rainfall" stroke="#6366f1" strokeWidth={1.5} name="Rainfall (mm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather History Table */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-700 bg-slate-900/60 flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Recorded Weather Observation Points (Regional Field Stations)
          </h4>
          <span className="text-[11px] text-slate-400">Regional Agro-Climatic Dataset</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Temp (°C)</th>
                <th className="px-4 py-3">Humidity (%)</th>
                <th className="px-4 py-3">Rainfall (mm)</th>
                <th className="px-4 py-3">Leaf Wetness</th>
                <th className="px-4 py-3">Favored Threat</th>
                <th className="px-4 py-3">Alert Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {INITIAL_WEATHER_DATA.map((pt, idx) => (
                <tr key={`${pt.date}-${pt.region}-${idx}`} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-semibold">{pt.date}</td>
                  <td className="px-4 py-3 text-slate-300">{pt.region}</td>
                  <td className="px-4 py-3 font-mono">{pt.temperature}°C</td>
                  <td className="px-4 py-3 font-mono">
                    <span className={pt.humidity > 80 ? 'text-blue-400 font-bold' : ''}>
                      {pt.humidity}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{pt.rainfall} mm</td>
                  <td className="px-4 py-3">{pt.leaf_wetness_hours} h</td>
                  <td className="px-4 py-3 text-emerald-300 font-medium">{pt.favored_threat}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={pt.alert_level} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
