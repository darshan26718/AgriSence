import React, { useState } from 'react';
import {
  Bug,
  Search,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Info,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { PESTS_DATA } from '../../data/agriData';
import { PestInfo } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface PestDatabaseViewProps {
  setActiveView?: (view: NavView) => void;
}

export const PestDatabaseView: React.FC<PestDatabaseViewProps> = ({ setActiveView }) => {
  const [selectedPest, setSelectedPest] = useState<PestInfo>(PESTS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const filtered = PESTS_DATA.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symptoms_and_damage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' || p.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div id="pest-database-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Bug className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Entomological Agricultural Pest Database
          </div>
          <p className="text-slate-400 leading-relaxed">
            Economic injury levels, morphology, destructive crop symptoms, natural bio-predators, and threshold chemical sprays for major agricultural pests.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pests by common or scientific name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
        >
          <option value="All">All Risk Levels</option>
          <option value="CRITICAL">Critical Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="MODERATE">Moderate Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pest List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
          {filtered.map(pest => {
            const isSelected = selectedPest.id === pest.id;
            return (
              <div
                key={pest.id}
                id={`pest-card-${pest.id}`}
                onClick={() => setSelectedPest(pest)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-sm ring-1 ring-amber-400/20'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs text-slate-100 truncate">{pest.name}</div>
                  <RiskBadge level={pest.risk_level} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                  {pest.scientific_name}
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono mt-1 truncate">
                  ETL: {pest.economic_threshold}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 truncate">
                  Hosts: {pest.crops_affected.join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Pest Detail (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Stage: {selectedPest.danger_life_stage}
                </span>
                <h3 className="text-2xl font-black text-slate-100 mt-0.5">{selectedPest.name}</h3>
                <div className="text-xs text-slate-300 italic font-mono mt-0.5">
                  {selectedPest.scientific_name}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-right">
                <div className="text-[10px] text-slate-400">Economic Threshold (ETL)</div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {selectedPest.economic_threshold}
                </div>
              </div>
            </div>

            {/* Symptoms & Foliar Damage */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Symptoms &amp; Visual Damage Pattern
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedPest.symptoms_and_damage}</p>
            </div>

            {/* Tripartite Control Tactics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Biological
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.biological_control}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-500/30 space-y-1">
                <div className="font-bold text-blue-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Cultural
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.cultural_control}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-red-500/30 space-y-1">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Chemical
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.chemical_guidance}</p>
              </div>
            </div>

            {/* Host Crops Pill row */}
            <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Vulnerable Host Crops
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPest.crops_affected.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Button to Pest Detection Simulator */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveView?.('pest-detect')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Scout &amp; Check ETL for {selectedPest.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
