import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Filter,
  Layers,
  Thermometer,
  Droplets,
  HeartPulse,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { FieldRecord } from '../../types/agri';

interface ModernMyFieldsViewProps {
  fields: FieldRecord[];
  onAddField: (field: FieldRecord) => void;
  onShowToast: (msg: string) => void;
}

export const ModernMyFieldsView: React.FC<ModernMyFieldsViewProps> = ({
  fields = [],
  onAddField,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedFieldForDetail, setSelectedFieldForDetail] = useState<FieldRecord | null>(null);

  // New field state for the modal
  const [newFieldName, setNewFieldName] = useState('');
  const [newCrop, setNewCrop] = useState('Cotton');
  const [newArea, setNewArea] = useState('3.0');
  const [newSoil, setNewSoil] = useState('Black Cotton Soil');

  const filteredFields = fields.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCropFilter === 'ALL' || f.crop.toLowerCase().includes(selectedCropFilter.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const created: FieldRecord = {
      id: `FLD-${Date.now().toString().slice(-4)}`,
      name: newFieldName,
      crop: newCrop,
      variety: 'Hybrid Certified',
      area_acres: parseFloat(newArea) || 2.5,
      location: 'Main Farm Zone',
      soil_type: newSoil,
      growth_stage: 'Vegetative',
      health_score: 85,
      disease_risk: 'LOW',
      pest_risk: 'LOW',
      last_inspection: new Date().toISOString().split('T')[0],
      active_alerts: 0,
      recommended_action: 'Routine inspection and regular irrigation monitoring.',
    };

    onAddField(created);
    onShowToast(`Field "${newFieldName}" registered successfully.`);
    setIsAddModalOpen(false);
    setNewFieldName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header with Title and Add Field button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">My Farm Fields</h2>
          <p className="text-sm text-slate-500">
            Manage your registered agricultural acreage, cadastral plots, and real-time field telemetry.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Field</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search field by name or crop..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {['ALL', 'Cotton', 'Rice', 'Soybean', 'Wheat'].map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCropFilter(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCropFilter === crop
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {crop === 'ALL' ? 'All Crops' : crop}
            </button>
          ))}
        </div>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFields.map(field => {
          const healthScore = field.health_score ?? (field as any).healthScore ?? 82;
          const isAtRisk = field.disease_risk === 'CRITICAL' || field.disease_risk === 'HIGH';

          return (
            <div
              key={field.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate font-display">{field.name}</h4>
                      <p className="text-xs text-slate-500 truncate">
                        {field.crop} ({field.variety || 'Certified'}) • {field.area_acres ?? (field as any).areaAcres ?? 3} Acres
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isAtRisk
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isAtRisk ? 'Risk Alert' : 'Healthy'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Health</span>
                    <span className="text-xs font-bold text-slate-800">{healthScore}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Moisture</span>
                    <span className="text-xs font-bold text-slate-800">75%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Soil</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">Clayey</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-3 bg-slate-50/70 p-2.5 rounded-xl">
                  {field.recommended_action || 'Optimal vegetative status; continue normal schedule.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Stage: {field.growth_stage || 'Flowering'}
                </span>
                <button
                  onClick={() => setSelectedFieldForDetail(field)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Details Modal */}
      {selectedFieldForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {selectedFieldForDetail.name}
                </h3>
                <span className="text-xs text-slate-500">{selectedFieldForDetail.crop}</span>
              </div>
              <button
                onClick={() => setSelectedFieldForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Area</span>
                <span className="font-bold text-slate-800">{selectedFieldForDetail.area_acres ?? (selectedFieldForDetail as any).areaAcres ?? 3.5} Acres</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Soil Profile</span>
                <span className="font-bold text-slate-800">{selectedFieldForDetail.soil_type || 'Black Cotton'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Growth Phase</span>
                <span className="font-bold text-slate-800">{selectedFieldForDetail.growth_stage || 'Flowering'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-medium">Health Index</span>
                <span className="font-bold text-emerald-700">{selectedFieldForDetail.health_score ?? (selectedFieldForDetail as any).healthScore ?? 80}%</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl text-xs space-y-1 border border-emerald-200/60">
              <span className="font-bold text-emerald-900 block">Agronomy Advisory:</span>
              <p className="text-emerald-950/90 leading-relaxed">{selectedFieldForDetail.recommended_action}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFieldForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display">Add New Field Plot</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Field Name / Cadastral Number</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  placeholder="e.g. South Boundary Plot 12/B"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Crop</label>
                  <select
                    value={newCrop}
                    onChange={e => setNewCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    <option>Cotton</option>
                    <option>Soybean</option>
                    <option>Rice</option>
                    <option>Wheat</option>
                    <option>Pigeon Pea (Tur)</option>
                    <option>Sugarcane</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Soil Profile</label>
                <select
                  value={newSoil}
                  onChange={e => setNewSoil(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  <option>Black Cotton Soil (Clayey)</option>
                  <option>Alluvial Loam</option>
                  <option>Red Sandy Soil</option>
                  <option>Laterite Soil</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
