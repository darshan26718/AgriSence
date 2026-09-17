import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Activity,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';
import { FieldRecord } from '../../types/agri';
import { ClientDataService } from '../../services/clientDataService';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface FieldManagementViewProps {
  fields: FieldRecord[];
  onAddField: (newField: FieldRecord) => void;
  setActiveView?: (view: NavView) => void;
  onTriggerSimulation?: (field: FieldRecord) => void;
}

export const FieldManagementView: React.FC<FieldManagementViewProps> = ({
  fields = [],
  onAddField,
  setActiveView,
  onTriggerSimulation,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [crop, setCrop] = useState<string>('Rice (Paddy)');
  const [variety, setVariety] = useState<string>('Swarna Sub-1');
  const [area, setArea] = useState<number>(3.5);
  const [location, setLocation] = useState<string>('Varanasi Agro-Zone Plot D');
  const [soilType, setSoilType] = useState<string>('Alluvial Silt Loam');
  const [growthStage, setGrowthStage] = useState<string>('Tillering');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await ClientDataService.addField({
      name: name || 'Farm Sector 5',
      crop,
      variety,
      area_acres: Number(area),
      location,
      soil_type: soilType,
      growth_stage: growthStage,
      health_score: 78,
      disease_risk: 'MODERATE',
      pest_risk: 'LOW',
      recommended_action: 'Routine weekly scouting and moisture monitoring.',
    });
    onAddField(created);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div id="field-management-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-4 text-xs text-slate-300 shadow-sm">
        <div className="flex items-start gap-3">
          <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              Farm Plot &amp; Sector Management
            </div>
            <p className="text-slate-400 leading-relaxed">
              Spatial segmentation of farm acreage to track micro-varietal performance, soil types, pathogen hotspots, and scheduled agronomic interventions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Farm Plot</span>
        </button>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map(field => (
          <div
            key={field.id}
            id={`field-card-${field.id}`}
            className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors"
          >
            <div>
              {/* Header Title */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-700/60">
                <div>
                  <h4 className="font-bold text-base text-slate-100">{field.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{field.location}</span>
                  </div>
                </div>
                <RiskBadge level={field.disease_risk} size="sm" />
              </div>

              {/* Crop details */}
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Crop &amp; Variety</span>
                  <span className="font-bold text-slate-200 truncate block mt-0.5">{field.crop}</span>
                  <span className="text-[10px] text-slate-400 italic block">{field.variety}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Area &amp; Soil</span>
                  <span className="font-bold text-slate-200 block mt-0.5">{field.area_acres} Acres</span>
                  <span className="text-[10px] text-slate-400 truncate block">{field.soil_type}</span>
                </div>
              </div>

              {/* Health and Growth Stage */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Health Index:</span>
                  <span className="font-mono font-bold text-emerald-400">{field.health_score}/100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${field.health_score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Stage: <strong className="text-slate-200">{field.growth_stage}</strong></span>
                  <span>Inspected: {field.last_inspection}</span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-[11px] text-slate-300 mt-3">
                <span className="font-bold text-emerald-400 block mb-0.5">Action Directive:</span>
                {field.recommended_action}
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
              {onTriggerSimulation ? (
                <button
                  type="button"
                  onClick={() => onTriggerSimulation(field)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Test AI threshold breach and trigger push alert banner"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate Alert</span>
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => setActiveView?.('disease-detect')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Launch Plot Inspection →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Register New Farm Sector Plot
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Plot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 - West Canal Basin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Crop</label>
                  <select
                    value={crop}
                    onChange={e => setCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={area}
                    onChange={e => setArea(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Variety / Hybrid</label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Soil Type</label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={e => setSoilType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={e => setGrowthStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetative">Vegetative</option>
                    <option value="Tillering">Tillering</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
                >
                  Save Sector Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
