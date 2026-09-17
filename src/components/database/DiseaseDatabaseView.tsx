import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Info,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { DISEASES_DATA } from '../../data/agriData';
import { DiseaseInfo } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface DiseaseDatabaseViewProps {
  setActiveView?: (view: NavView) => void;
}

export const DiseaseDatabaseView: React.FC<DiseaseDatabaseViewProps> = ({ setActiveView }) => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo>(DISEASES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filtered = DISEASES_DATA.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pathogen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.symptoms.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop =
      cropFilter === 'All' ||
      d.affected_crops.some(c => c.toLowerCase().includes(cropFilter.toLowerCase()));

    const matchesType =
      typeFilter === 'All' ||
      d.primary_cause.toLowerCase().includes(typeFilter.toLowerCase()) ||
      d.name.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesCrop && matchesType;
  });

  return (
    <div id="disease-database-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Comprehensive Phytopathological Disease Directory
          </div>
          <p className="text-slate-400 leading-relaxed">
            Fungal, bacterial, and viral crop diseases with characteristic leaf lesions, favorable microclimate triggers, and integrated chemical &amp; biological solutions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search diseases, pathogens, symptoms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 flex-1 sm:flex-none"
          >
            <option value="All">All Crops</option>
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Groundnut">Groundnut</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 flex-1 sm:flex-none"
          >
            <option value="All">All Types</option>
            <option value="Fungal">Fungal</option>
            <option value="Bacterial">Bacterial</option>
            <option value="Viral">Viral</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Disease Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
          {filtered.map(disease => {
            const isSelected = selectedDisease.id === disease.id;
            return (
              <div
                key={disease.id}
                id={`disease-card-${disease.id}`}
                onClick={() => setSelectedDisease(disease)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-sm ring-1 ring-amber-400/20'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs text-slate-100 truncate">{disease.name}</div>
                  <RiskBadge level={disease.severity.toUpperCase() as any} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                  Pathogen: {disease.pathogen}
                </div>
                <div className="text-[10px] text-emerald-400 mt-2 truncate">
                  Crops: {disease.affected_crops.join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Disease Profile (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {selectedDisease.primary_cause}
                </span>
                <h3 className="text-2xl font-black text-slate-100 mt-0.5">{selectedDisease.name}</h3>
                <div className="text-xs text-slate-300 italic mt-0.5 font-mono">
                  {selectedDisease.pathogen}
                </div>
              </div>
              <RiskBadge level={selectedDisease.severity.toUpperCase() as any} size="lg" />
            </div>

            {/* Environmental Favorability Box */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Optimal Temperature
                </span>
                <span className="font-bold text-slate-100">{selectedDisease.favorable_conditions.temp_c}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Optimal Humidity
                </span>
                <span className="font-bold text-slate-100">{selectedDisease.favorable_conditions.humidity_pct}</span>
              </div>
            </div>

            {/* Characteristic Symptoms */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Characteristic Diagnostic Symptoms
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedDisease.symptoms}</p>
            </div>

            {/* Biological vs Chemical Solutions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Biological &amp; Organic Control
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedDisease.organic_control}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-red-500/20 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Recommended Chemical Control
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedDisease.chemical_control_guidance}</p>
              </div>
            </div>

            {/* Quick action button */}
            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveView?.('disease-detect')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Test Diagnosis on Image Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
