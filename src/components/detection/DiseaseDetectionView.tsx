import React, { useState, useEffect } from 'react';
import {
  Upload,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  BookmarkPlus,
  ArrowRight,
  ShieldCheck,
  FileText,
  Info,
  Layers,
  Camera,
} from 'lucide-react';
import { DEMO_TEST_SAMPLES, DemoTestSample } from '../../data/agriData';
import { DetectionResult } from '../../types/agri';
import { ClientDataService } from '../../services/clientDataService';
import { LeafVisualizer } from '../common/LeafVisualizer';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { AiVoiceSpeakerButton } from '../speech/AiVoiceSpeakerButton';
import { speechService } from '../../services/speechService';

interface DiseaseDetectionViewProps {
  onSaveDetection?: (detection: DetectionResult) => void;
  onDetectionSaved?: (detection: DetectionResult) => void;
  setActiveView?: (view: NavView) => void;
  setSelectedDetectionForReport?: (det: DetectionResult) => void;
  autoOpenCamera?: boolean;
  onResetAutoCamera?: () => void;
}

export const DiseaseDetectionView: React.FC<DiseaseDetectionViewProps> = ({
  onSaveDetection,
  onDetectionSaved,
  setActiveView,
  setSelectedDetectionForReport,
  autoOpenCamera,
  onResetAutoCamera,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Auto-Detect');
  const [selectedSample, setSelectedSample] = useState<DemoTestSample>(DEMO_TEST_SAMPLES[0]);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [imageSourceType, setImageSourceType] = useState<'camera' | 'upload' | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Auto open camera if triggered from Quick Live Camera button
  useEffect(() => {
    if (autoOpenCamera) {
      setIsCameraOpen(true);
      if (onResetAutoCamera) {
        onResetAutoCamera();
      }
    }
  }, [autoOpenCamera, onResetAutoCamera]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUserImagePreview(dataUrl);
        setImageSourceType('upload');
        // Run AI diagnosis on uploaded leaf immediately with dataUrl
        runInference(selectedCrop, 'Uploaded Image', true, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera capture handler
  const handleCameraCapture = (capturedDataUrl: string) => {
    setUserImagePreview(capturedDataUrl);
    setImageSourceType('camera');
    runInference(selectedCrop, 'Live Camera Captured Specimen', true, capturedDataUrl);
  };

  const handleClearImage = () => {
    setUserImagePreview(null);
    setImageSourceType(null);
    runInference(selectedSample.crop, selectedSample.expectedIssue, false);
  };

  const handleSelectSample = (sample: DemoTestSample) => {
    setSelectedSample(sample);
    setUserImagePreview(null);
    setImageSourceType(null);
    setSelectedCrop(sample.crop);
    runInference(sample.crop, sample.expectedIssue, false);
  };

  const runInference = async (crop: string, hint?: string, isUserImg?: boolean, imageOverride?: string) => {
    setIsAnalyzing(true);
    setSavedSuccess(false);

    try {
      const activeImage = imageOverride !== undefined ? imageOverride : userImagePreview;
      const payload = activeImage ? {
        image: activeImage,
        crop,
        hint,
        isUserImage: isUserImg,
      } : {
        crop,
        hint,
        isUserImage: isUserImg,
      };

      const result = await ClientDataService.runImageDetection(payload);
      setDetectionResult(result);
    } catch (e) {
      console.error('Image detection failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (detectionResult) {
      await ClientDataService.saveDetection(detectionResult);
      if (onSaveDetection) onSaveDetection(detectionResult);
      if (onDetectionSaved) onDetectionSaved(detectionResult);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div id="disease-detection-page" className="space-y-6">
      {/* Top Notice: Modular Architecture & CV Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            AI Computer Vision Inference Pipeline (AgriSense v2.0 - 42 Disease Classes)
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Ensemble v2 Production
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Evaluates leaf pathology features across 21 supported crops with automatic morphology detection, Out-of-Distribution rejection, and CIBRC chemical/organic guidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Sample Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Crop Selector */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                1. Select Target Crop
              </label>
              <select
                id="disease-crop-select"
                value={selectedCrop}
                onChange={e => {
                  setSelectedCrop(e.target.value);
                  runInference(e.target.value, e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Auto-Detect">✨ Auto-Detect (Morphological AI)</option>
                <option value="Rice (Paddy)">Rice (Paddy)</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize (Corn)">Maize (Corn)</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Soybean">Soybean</option>
                <option value="Groundnut (Peanut)">Groundnut</option>
                <option value="Chickpea">Chickpea</option>
                <option value="Pigeon Pea">Pigeon Pea (Arhar / Tur) [Limited Support]</option>
                <option value="Onion">Onion / Garlic</option>
                <option value="Chili">Chili / Capsicum</option>
                <option value="Banana">Banana</option>
                <option value="Citrus">Citrus (Lemon / Orange)</option>
                <option value="Mango">Mango</option>
                <option value="Grapes">Grapes</option>
                <option value="Brinjal">Brinjal (Eggplant)</option>
                <option value="Okra">Okra (Bhindi)</option>
                <option value="Mustard">Mustard (Sarson)</option>
                <option value="Cabbage">Cabbage / Cauliflower</option>
              </select>
            </div>

            {/* Image Acquisition: Live Camera & Upload */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  2. Acquire Crop / Leaf Specimen
                </label>
                {userImagePreview && (
                  <button
                    onClick={handleClearImage}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 font-medium"
                  >
                    Clear Specimen
                  </button>
                )}
              </div>

              {/* Active Specimen Banner if image is loaded */}
              {userImagePreview && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-fadeIn">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold truncate">
                      {imageSourceType === 'camera'
                        ? 'Live Camera Specimen Captured'
                        : 'Custom Leaf Image Loaded'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium text-[11px] shrink-0 flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" /> Retake
                  </button>
                </div>
              )}

              {/* 1. Live Camera Button */}
              <button
                type="button"
                id="open-live-camera-btn"
                onClick={() => setIsCameraOpen(true)}
                className="w-full group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-600/20 via-slate-800 to-teal-600/20 border border-emerald-500/40 hover:border-emerald-400 shadow-md hover:shadow-emerald-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shadow-inner">
                    <Camera className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                      Scan via Live Camera
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                        Instant Capture
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Stream smartphone or webcam with alignment reticle
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 group-hover:border-emerald-400 text-xs font-semibold items-center gap-1">
                  Open
                </div>
              </button>

              {/* 2. Drag & Drop File Upload Card */}
              <label
                htmlFor="leaf-image-upload"
                className="group relative flex items-center justify-between p-3.5 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl bg-slate-900/60 cursor-pointer transition-all hover:bg-slate-900/90 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      Upload from Device / Gallery
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP leaf photos
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
                  Browse
                </span>
                <input
                  id="leaf-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick SIH Pre-loaded Field Test Samples */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Or Test with 1-Click SIH Samples
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Instant Demo</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_TEST_SAMPLES.map(sample => {
                  const isSelected = selectedSample.id === sample.id && !userImagePreview;
                  return (
                    <button
                      key={sample.id}
                      id={`sample-btn-${sample.id}`}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-md ring-1 ring-emerald-400/40'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sample.previewColor }}
                        />
                        <span className="truncate">{sample.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {sample.expectedIssue}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis, Diagnostic Result & Recommendations (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Visualizer Frame */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ScanSearch className="w-4 h-4 text-emerald-400" />
                Pathology Scanner &amp; Lesion Bounding Box
              </h3>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Extracting feature vectors...
                </div>
              )}
            </div>

            <LeafVisualizer
              type={selectedSample.sampleType}
              imageSrc={userImagePreview || undefined}
              showBoundingBoxes={true}
              confidence={detectionResult?.confidence || 0.94}
              label={detectionResult?.name || selectedSample.expectedIssue}
            />

            {/* Run Diagnosis Trigger Button if not triggered */}
            {!detectionResult && !isAnalyzing && (
              <button
                id="run-analysis-btn"
                onClick={() => runInference(selectedCrop, selectedSample.expectedIssue)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                Analyze Leaf &amp; Classify Pathogen
              </button>
            )}
          </div>

          {/* Diagnostic Result Card */}
          {detectionResult && (
            <div
              id="detection-result-card"
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Header Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Primary Diagnosis Result
                  </div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                    {detectionResult.name}
                  </h4>
                  <div className="text-xs text-emerald-400 font-medium mt-0.5">
                    Crop: {detectionResult.crop} • Detected: {detectionResult.timestamp}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-right">
                    <div className="text-[10px] text-slate-400">Confidence</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {(detectionResult.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <RiskBadge level={detectionResult.risk_level} size="lg" />
                </div>
              </div>

              {/* OOD / Out-of-Distribution Warning Banner */}
              {((detectionResult as any).ood_detected || detectionResult.confidence < 0.40) && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300">Out-of-Distribution / Ambiguous Foliage Warning</div>
                    <div className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      {(detectionResult as any).ood_message || 'Unable to reliably identify this crop/disease. Visual evidence in this image is ambiguous. Please upload a clearer field image or inspect leaves physically.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Limited Support Banner */}
              {(detectionResult as any).is_limited_support && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/40 text-xs text-blue-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-300">Limited Support Advisory</div>
                    <div className="text-[11px] text-blue-200/90 mt-0.5 leading-relaxed">
                      {(detectionResult as any).limited_support_notice || 'This crop/disease has limited open-field training imagery. The diagnosis is provided for advisory guidance; verification by physical plant tissue scouting is recommended.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Model Engine Badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Inference Engine: <strong className="text-slate-200 font-mono">AgriSense v{(detectionResult as any).active_model_version || '2.0.0'}</strong>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">42 Disease Classes • Zero-Forgetting Verified</span>
              </div>

              {/* AI Voice Speaker Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-base">🔊</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">AI Voice Speaker</span>
                    <span className="text-[11px] text-slate-400">Listen to spoken diagnosis, symptoms, and CIBRC treatment</span>
                  </div>
                </div>
                <AiVoiceSpeakerButton
                  text={speechService.formatDiagnosisForSpeech(detectionResult)}
                  title={`${detectionResult.name} Diagnosis`}
                  variant="primary"
                  size="sm"
                  label="🔊 Speak Diagnosis"
                  className="shrink-0"
                />
              </div>

              {/* Severity Gauge */}
              {(() => {
                const isHealthy = detectionResult.name?.toLowerCase().includes('healthy') || detectionResult.severity === 'OPTIMAL';
                return (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">Severity Assessment: {isHealthy ? 'OPTIMAL' : detectionResult.severity}</span>
                        <span className={`font-mono font-bold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isHealthy ? '0% Leaf Area Affected (Optimal Health)' : `${detectionResult.severity_pct}% Leaf Area Affected`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isHealthy
                              ? 'bg-emerald-500'
                              : detectionResult.severity_pct > 70
                              ? 'bg-red-500'
                              : detectionResult.severity_pct > 40
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${isHealthy ? 100 : detectionResult.severity_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Symptoms & Possible Causes / Health Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          {isHealthy ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          {isHealthy ? 'Observed Health Indicators' : 'Observed Symptoms'}
                        </div>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {(detectionResult.symptoms || []).map((s, idx) => (
                            <li key={idx} className="leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          {isHealthy ? 'Growing Conditions & Agronomy' : 'Possible Causes & Vectors'}
                        </div>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {(detectionResult.possible_causes || []).map((c, idx) => (
                            <li key={idx} className="leading-relaxed">{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Management Recommendations */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="font-bold text-xs text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Recommended Management Action
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  <span className="font-semibold text-emerald-300">Immediate: </span>
                  {detectionResult.management_immediate}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-300">Biological / Cultural: </span>
                  {detectionResult.management_biological}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">IPM &amp; Prevention: </span>
                  {detectionResult.management_preventive}
                </p>
              </div>

              {/* Action Buttons: Save Detection, Jump to XAI, Generate Report */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700">
                <button
                  id="save-detection-record-btn"
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {savedSuccess ? 'Saved to History!' : 'Save Detection Record'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="goto-xai-btn"
                    onClick={() => setActiveView?.('ml-prediction')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Analyze Risk &amp; XAI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="goto-report-btn"
                    onClick={() => {
                      if (setSelectedDetectionForReport) {
                        setSelectedDetectionForReport(detectionResult);
                      }
                      setActiveView?.('reports');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Optical Field Camera Modal */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Foliage Optical Camera Scanner"
        subtitle={`Target leaf symptoms on ${selectedCrop} within crosshairs`}
        accentColor="emerald"
      />
    </div>
  );
};
