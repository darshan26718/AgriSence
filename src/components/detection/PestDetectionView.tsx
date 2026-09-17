import React, { useState } from 'react';
import {
  Bug,
  Upload,
  Camera,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sliders,
  Filter,
} from 'lucide-react';
import { PESTS_DATA } from '../../data/agriData';
import { PestInfo } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { LeafVisualizer } from '../common/LeafVisualizer';
import { NavView } from '../layout/Sidebar';
import { LiveCameraModal } from '../common/LiveCameraModal';

interface PestDetectionViewProps {
  setActiveView?: (view: NavView) => void;
}

export const PestDetectionView: React.FC<PestDetectionViewProps> = ({ setActiveView }) => {
  const [selectedPest, setSelectedPest] = useState<PestInfo>(PESTS_DATA[0]);
  const [scoutingCount, setScoutingCount] = useState<number>(14); // Pests per plant / sweep
  const [observedStage, setObservedStage] = useState<string>('Nymph / Larval instar');
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Economic threshold calculation based on numerical extraction
  const thresholdNum = parseInt(selectedPest.economic_threshold.replace(/\D+/g, ' '), 10) || 10;
  const isAboveETL = scoutingCount >= thresholdNum;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserUploadedImage(reader.result as string);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setUserUploadedImage(dataUrl);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 500);
  };

  return (
    <div id="pest-detection-page" className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Bug className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            AI Entomological Scouting &amp; Economic Threshold (ETL) Evaluator
          </div>
          <p className="text-slate-400 leading-relaxed">
            Identifies destructive insect pests across key crop phonological stages, cross-references observed field sweep counts with IPM Economic Threshold Levels, and provides predator conservation advice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pest Classifier & Scouting Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
            {/* Image upload & Live Camera area */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  1. Acquire Pest Specimen / Photo
                </h3>
                {userUploadedImage && (
                  <button
                    onClick={() => setUserUploadedImage(null)}
                    className="text-[11px] text-slate-400 hover:text-red-400 font-medium"
                  >
                    Clear Photo
                  </button>
                )}
              </div>

              {/* Active Specimen Banner */}
              {userUploadedImage && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300 animate-fadeIn">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold truncate">Active Pest Photo Loaded</span>
                  </div>
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium text-[11px] shrink-0 flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" /> Retake
                  </button>
                </div>
              )}

              {/* 1. Live Camera Button */}
              <button
                type="button"
                id="pest-open-live-camera-btn"
                onClick={() => setIsCameraOpen(true)}
                className="w-full group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-600/20 via-slate-800 to-orange-600/20 border border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-inner">
                    <Camera className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                      Scan via Live Camera
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-medium">
                        Macro Focus
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Stream camera to isolate nymph, larva, or damage
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 group-hover:border-amber-400 text-xs font-semibold items-center gap-1">
                  Open
                </div>
              </button>

              {/* 2. File Upload */}
              <label
                htmlFor="pest-image-upload"
                className="group relative flex items-center justify-between p-3.5 border border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl bg-slate-900/60 cursor-pointer transition-all hover:bg-slate-900/90 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                      Upload from Device / Gallery
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Macro photo of insect or foliage borehole
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
                  Browse
                </span>
                <input
                  id="pest-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Pest Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                2. Or Select Suspected Pest Species
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {PESTS_DATA.map(pest => {
                  const isSelected = selectedPest.id === pest.id;
                  return (
                    <button
                      key={pest.id}
                      id={`pest-btn-${pest.id}`}
                      onClick={() => {
                        setSelectedPest(pest);
                        setUserUploadedImage(null);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-sm'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 truncate">{pest.name}</div>
                        <div className="text-[10px] text-slate-400 italic truncate">{pest.scientific_name}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {pest.danger_life_stage}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field Scouting Counter */}
            <div className="pt-3 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  3. Field Scouting Count:
                </label>
                <span className="font-mono text-sm font-bold text-amber-400">{scoutingCount} pests/plant</span>
              </div>
              <input
                id="scouting-count-slider"
                type="range"
                min="1"
                max="40"
                value={scoutingCount}
                onChange={e => setScoutingCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Safe Range</span>
                <span className="font-mono font-bold text-slate-200">
                  ETL: {selectedPest.economic_threshold}
                </span>
                <span>Severe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pest Profile, Visual Detection & Control Strategies (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Visualizer card */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bug className="w-4 h-4 text-amber-400" />
                Target Visual Inspection &amp; Infestation Morphology
              </h3>
              <RiskBadge level={isAboveETL ? 'CRITICAL' : 'LOW'} size="sm" />
            </div>

            <LeafVisualizer
              type={
                selectedPest.name.includes('Bollworm') || selectedPest.name.includes('Borer')
                  ? 'bollworm_damage'
                  : 'aphid_colony'
              }
              imageSrc={userUploadedImage || undefined}
              showBoundingBoxes={true}
              confidence={0.93}
              label={`${selectedPest.name} (${selectedPest.scientific_name})`}
            />

            {/* Economic Threshold Level (ETL) Status Box */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                isAboveETL
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <AlertOctagon
                className={`w-5 h-5 shrink-0 mt-0.5 ${isAboveETL ? 'text-red-400' : 'text-emerald-400'}`}
              />
              <div className="space-y-1 text-xs">
                <div className="font-bold flex items-center gap-2">
                  {isAboveETL
                    ? '⚠️ Economic Threshold Breached (Immediate Chemical/Bio Sprays Required)'
                    : '✅ Below Economic Threshold (Maintain Regular Scouting & Biological Reserves)'}
                </div>
                <p className="leading-relaxed opacity-90">
                  Observed field scouting density is <span className="font-bold">{scoutingCount}</span> insects/plant.
                  The scientific economic injury threshold is established at <span className="font-bold">{selectedPest.economic_threshold}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Pest Profile & Comprehensive Management Card */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg space-y-5">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Taxonomic Profile
              </div>
              <h4 className="text-xl font-extrabold text-slate-100">{selectedPest.name}</h4>
              <div className="text-xs text-amber-400 font-mono italic mt-0.5">
                {selectedPest.scientific_name} • Order: Hemiptera / Lepidoptera
              </div>
              <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                <span className="font-bold text-slate-200">Host Crops: </span>
                {selectedPest.crops_affected.join(', ')}
              </div>
            </div>

            {/* Damage Symptoms */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Characteristic Foliar &amp; Structural Damage
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedPest.symptoms_and_damage}</p>
            </div>

            {/* Three-Tier Control Strategy (Biological, Cultural, Chemical) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Biological */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Biological Control
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.biological_control}</p>
              </div>

              {/* Cultural */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-500/30 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cultural / Trapping
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.cultural_control}</p>
              </div>

              {/* Chemical */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-red-500/30 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Targeted Chemical
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedPest.chemical_guidance}</p>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <button
                onClick={() => setActiveView?.('smart-management')}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors"
              >
                Explore Full IPM Protocol
              </button>

              <button
                onClick={() => setActiveView?.('farmer-advisor')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Farmer Advisory Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Macro Camera Modal */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Pest & Foliage Macro Camera Scanner"
        subtitle={`Align specimen or damage for ${selectedPest.name} diagnosis`}
        accentColor="amber"
      />
    </div>
  );
};
