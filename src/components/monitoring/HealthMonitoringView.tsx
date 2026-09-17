import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { FieldRecord } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface HealthMonitoringViewProps {
  fields: FieldRecord[];
  setActiveView?: (view: NavView) => void;
}

export const HealthMonitoringView: React.FC<HealthMonitoringViewProps> = ({
  fields = [],
  setActiveView,
}) => {
  const [selectedField, setSelectedField] = useState<FieldRecord | undefined>(fields[0]);

  // Synthetic NDVI / Chlorophyll proxy indices for demo
  const chlorophyllIndex = ((selectedField?.health_score || 70) * 0.008).toFixed(2);
  const canopyCoverPct = Math.min(95, Math.round((selectedField?.health_score || 70) * 1.1));

  return (
    <div id="crop-health-monitoring-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Crop Health, Chlorophyll Proxy &amp; Vigor Monitoring
          </div>
          <p className="text-slate-400 leading-relaxed">
            Multi-spectral vegetation index surrogate tracking chlorophyll absorption, transpiration stress, and micro-nutrient assimilation.
          </p>
        </div>
      </div>

      {/* Field Selector Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {(fields || []).map(field => {
          const isSelected = selectedField?.id === field.id;
          return (
            <button
              key={field.id}
              onClick={() => setSelectedField(field)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-sm'
                  : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span>{field.name}</span>
              <span className="font-mono text-[11px] text-emerald-400 font-normal">
                {field.health_score}/100
              </span>
            </button>
          );
        })}
      </div>

      {selectedField && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Health Card (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Foliar Health Score
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 mt-0.5">{selectedField.name}</h3>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {selectedField.crop} ({selectedField.variety}) • {selectedField.area_acres} Acres • Stage: {selectedField.growth_stage}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</div>
                    <div className="text-3xl font-black text-emerald-400">
                      {selectedField.health_score}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                  <RiskBadge level={selectedField.disease_risk} size="lg" />
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Composite Vigor Scale</span>
                  <span className="text-emerald-400">
                    {selectedField.health_score >= 80 ? 'Vigorous / Healthy' : selectedField.health_score >= 60 ? 'Moderate Stress' : 'Severe Chlorosis / Necrosis'}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      selectedField.health_score >= 80
                        ? 'bg-emerald-500'
                        : selectedField.health_score >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedField.health_score}%` }}
                  />
                </div>
              </div>

              {/* Biophysical Indices */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 block mb-1">NDVI Index (Proxy)</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{chlorophyllIndex}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Optimal range: 0.65 - 0.85</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 block mb-1">Canopy Green Fraction</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">{canopyCoverPct}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Foliage density</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 block mb-1">Soil Texture</span>
                  <span className="text-xs font-bold text-slate-200 block truncate mt-1">{selectedField.soil_type}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">High water retention</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 block mb-1">Last Inspection</span>
                  <span className="text-xs font-bold text-slate-200 block mt-1">{selectedField.last_inspection}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Weekly cadence</span>
                </div>
              </div>

              {/* Action Directive */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/80 text-xs space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Plot Agronomic Management Directive
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedField.recommended_action}</p>
              </div>

              {/* Next Steps */}
              <div className="pt-3 border-t border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setActiveView('disease-detect')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Launch Visual Disease Scanner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Key Alerts (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Pathology Vulnerabilities
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                During the <span className="font-bold text-slate-200">{selectedField.growth_stage}</span> stage, {selectedField.crop} canopy is vulnerable to rapid spore penetration and sap-sucking nymphs.
              </p>

              <div className="pt-2 border-t border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Disease Threat:</span>
                  <RiskBadge level={selectedField.disease_risk} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pest Threat:</span>
                  <RiskBadge level={selectedField.pest_risk} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick jump to Early Warning */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Microclimate Simulator
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulate weather humidity or temperature spikes to view pre-symptomatic spore germination warnings for this sector.
              </p>
              <button
                onClick={() => setActiveView?.('early-warning')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Early Warning Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
