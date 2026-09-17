import React, { useState } from 'react';
import { ShieldAlert, Bug, Search, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { DISEASES_DATA, PESTS_DATA } from '../../data/agriData';
import { DiseaseInfo, PestInfo } from '../../types/agri';

export const ModernDiseaseDetectionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diseases' | 'pests'>('diseases');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<DiseaseInfo | PestInfo>(DISEASES_DATA[0]);

  const filteredDiseases = DISEASES_DATA.filter(
    d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.affected_crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPests = PESTS_DATA.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.crops_affected.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Disease & Pest Detection</h2>
        <p className="text-sm text-slate-500">
          Knowledge database of verified agricultural pathogens, economic threshold levels, and IPM treatments.
        </p>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveTab('diseases');
              setSelectedItem(DISEASES_DATA[0]);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'diseases' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            <span>Fungal & Bacterial Diseases ({DISEASES_DATA.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('pests');
              setSelectedItem(PESTS_DATA[0]);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'pests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Bug className="w-4 h-4 text-orange-600" />
            <span>Insect & Pest Vectors ({PESTS_DATA.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pathogen or crop..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {activeTab === 'diseases'
            ? filteredDiseases.map(disease => {
                const isSelected = selectedItem.id === disease.id;
                return (
                  <button
                    key={disease.id}
                    onClick={() => setSelectedItem(disease)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm font-display truncate">{disease.name}</h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Crops: {disease.affected_crops.join(', ')}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {disease.pathogen}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}
                    />
                  </button>
                );
              })
            : filteredPests.map(pest => {
                const isSelected = selectedItem.id === pest.id;
                return (
                  <button
                    key={pest.id}
                    onClick={() => setSelectedItem(pest)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-50/70 border-orange-600 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm font-display truncate">{pest.name}</h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Target: {pest.crops_affected.join(', ')}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                        Risk: {pest.risk_level}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}
                    />
                  </button>
                );
              })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                {selectedItem.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Verified CIBRC Protocol
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display mt-2">{selectedItem.name}</h3>
            <p className="text-xs text-slate-500 italic">
              {(selectedItem as any).scientific_name || (selectedItem as any).pathogen}
            </p>
          </div>

          {/* Symptoms Section */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Symptoms & Damage Pattern</h5>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {(selectedItem as any).symptoms || (selectedItem as any).symptoms_and_damage}
            </p>
          </div>

          {/* Primary Cause or Life Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Cause / Life Stage</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {(selectedItem as any).primary_cause || (selectedItem as any).danger_life_stage || 'Fungal spores via high humidity'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Economic Threshold (ETL)</span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {(selectedItem as any).economic_threshold || '5% foliar infection spread'}
              </span>
            </div>
          </div>

          {/* Recommended Action / Chemical & Biological */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Biological & Organic Control</span>
              </span>
              <p className="text-xs text-emerald-900/90 leading-relaxed">
                {(selectedItem as any).organic_control || (selectedItem as any).biological_control}
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-700" />
                <span>Chemical Dosage & IPM Protocol</span>
              </span>
              <p className="text-xs text-blue-950/90 leading-relaxed">
                {(selectedItem as any).chemical_control_guidance || (selectedItem as any).chemical_guidance}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
