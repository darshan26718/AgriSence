import React, { useState } from 'react';
import {
  Wheat,
  Search,
  Droplets,
  Thermometer,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Sprout,
  Info,
} from 'lucide-react';
import { CROPS_DATA } from '../../data/agriData';
import { CropInfo } from '../../types/agri';
import { NavView } from '../layout/Sidebar';

interface CropDatabaseViewProps {
  setActiveView?: (view: NavView) => void;
}

export const CropDatabaseView: React.FC<CropDatabaseViewProps> = ({ setActiveView }) => {
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(CROPS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCrops = CROPS_DATA.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="crop-database-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Wheat className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Agronomic Crop Intelligence Repository (10 Major Indian Crops)
          </div>
          <p className="text-slate-400 leading-relaxed">
            Detailed phenological parameters, optimal climate thresholds, vulnerable developmental stages, and common disease/pest vectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Crop List with Search (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crops, botanical names..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
            {filteredCrops.map(crop => {
              const isSelected = selectedCrop.id === crop.id;
              return (
                <button
                  key={crop.id}
                  id={`crop-item-${crop.id}`}
                  onClick={() => setSelectedCrop(crop)}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-sm ring-1 ring-emerald-400/20'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-100 truncate">{crop.name}</div>
                    <div className="text-[11px] text-slate-400 italic truncate mt-0.5">
                      {crop.scientific_name}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 shrink-0">
                    {crop.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Crop Deep-Dive Detail (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-6">
            {/* Title & Botanical Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  {selectedCrop.category} Crop
                </span>
                <h3 className="text-2xl font-black text-slate-100 mt-0.5">{selectedCrop.name}</h3>
                <div className="text-xs text-slate-400 italic mt-0.5">
                  Botanical: <span className="text-slate-300 font-medium">{selectedCrop.scientific_name}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveView?.('disease-detect')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Run Diagnostics for {selectedCrop.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Environmental Requirements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Optimal Temp
                </div>
                <div className="font-bold text-slate-100">{selectedCrop.optimal_temperature}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Optimal Humidity
                </div>
                <div className="font-bold text-slate-100">{selectedCrop.optimal_humidity}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                <div className="text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Crop Duration
                </div>
                <div className="font-bold text-slate-100">{selectedCrop.growth_duration_days} Days</div>
              </div>
            </div>

            {/* Growth Stages */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Phenological Growth Stages
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedCrop.growth_stages || []).map((stage, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-medium"
                  >
                    Stage {idx + 1}: {stage}
                  </span>
                ))}
              </div>
            </div>

            {/* Vulnerabilities: Major Diseases & Pests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Susceptible Diseases
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {(selectedCrop.common_diseases || []).map((d, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-red-500/20 space-y-2">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Major Damaging Pests
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {(selectedCrop.common_pests || []).map((p, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prevention Tips & Best Practices */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Agronomic Management &amp; Prevention Practices
              </div>
              <ul className="space-y-1 text-slate-300 leading-relaxed">
                {(selectedCrop.prevention_tips || []).map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
