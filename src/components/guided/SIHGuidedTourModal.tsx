import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ScanSearch,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  FileText,
  Activity,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { NavView } from '../layout/Sidebar';

interface SIHGuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView?: (view: NavView) => void;
}

export const SIHGuidedTourModal: React.FC<SIHGuidedTourModalProps> = ({
  isOpen,
  onClose,
  setActiveView,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const navigateTo = (view: NavView) => {
    if (typeof setActiveView === 'function') {
      setActiveView(view);
    }
  };

  const STEPS = [
    {
      step: 1,
      targetView: 'dashboard' as NavView,
      title: 'Step 1: Executive Agriculture Dashboard & Real-Time KPIs',
      icon: Activity,
      summary:
        'Start at the command center. Displays 10 core agricultural KPIs (Total Records, Healthy Crops, Diseased, Pest-Affected, Average Health Score, Recovery Rate, and Seasonal Infestation Trends) driven by the built-in dataset.',
      actionLabel: 'Go to Dashboard',
    },
    {
      step: 2,
      targetView: 'disease-detect' as NavView,
      title: 'Step 2: Upload Crop / Leaf Image or Select SIH Sample',
      icon: ScanSearch,
      summary:
        'Navigate to AI Disease Detection. Upload any crop leaf photo from disk or test immediately with 1-click built-in test samples (e.g. Rice Blast, Tomato Early Blight, Wheat Rust).',
      actionLabel: 'Go to Disease Scanner',
    },
    {
      step: 3,
      targetView: 'disease-detect' as NavView,
      title: 'Step 3: AI Computer Vision Inference & Lesion Localization',
      icon: Sparkles,
      summary:
        'The deep-learning leaf model analyzes optical symptoms, draws bounding boxes around infected chlorotic tissue, and computes diagnosis with confidence scoring.',
      actionLabel: 'Inspect CV Visualizer',
    },
    {
      step: 4,
      targetView: 'disease-detect' as NavView,
      title: 'Step 4: Disease & Pest Diagnostic Result Classification',
      icon: CheckCircle2,
      summary:
        'Detailed diagnosis displaying primary pathogen, scientific classification, foliar symptoms, and etiology vectors.',
      actionLabel: 'View Diagnosis Card',
    },
    {
      step: 5,
      targetView: 'disease-detect' as NavView,
      title: 'Step 5: Severity Quantification & Impact Assessment',
      icon: AlertTriangle,
      summary:
        'Quantifies the leaf area damage percentage (e.g. 75% Critical), mapping physiological leaf degradation to expected farm yield impact.',
      actionLabel: 'Inspect Severity Gauge',
    },
    {
      step: 6,
      targetView: 'ml-prediction' as NavView,
      title: 'Step 6: AI/ML Risk & Microclimate Epidemic Forecasting',
      icon: BrainCircuit,
      summary:
        'Synthesizes field weather telemetry (temperature, humidity, leaf wetness, rainfall) using an ensemble risk prediction model to forecast disease and pest outbreaks.',
      actionLabel: 'Open ML Risk Predictor',
    },
    {
      step: 7,
      targetView: 'ml-prediction' as NavView,
      title: 'Step 7: Explainable AI (XAI) & Counterfactual Guidance',
      icon: BrainCircuit,
      summary:
        'Features transparent SHAP attribution bars showing exactly why the model reached its decision (e.g., Humidity contributed +35%) along with "What-If" actionable insights.',
      actionLabel: 'Inspect Explainable AI Cards',
    },
    {
      step: 8,
      targetView: 'smart-management' as NavView,
      title: 'Step 8: Smart Management & Integrated Pest Management (IPM)',
      icon: ShieldCheck,
      summary:
        'Multi-tiered agronomic action plan: immediate drainage/water suspension, biological antagonism (Pseudomonas / Trichoderma), cultural sanitation, and 14-day calendar.',
      actionLabel: 'View IPM Protocols',
    },
    {
      step: 9,
      targetView: 'detection-history' as NavView,
      title: 'Step 9: Save Detection Record & Historical Audit Trail',
      icon: CheckCircle2,
      summary:
        'Logs diagnostic inspections into an immutable audit history with exportable CSV and search filters by crop and condition.',
      actionLabel: 'Open History Archive',
    },
    {
      step: 10,
      targetView: 'reports' as NavView,
      title: 'Step 10: Generate Printable Advisory Report & Analytics',
      icon: FileText,
      summary:
        'Complete the journey by generating a clean, printable official agricultural advisory report ready for farmers, agronomists, or evaluation committees.',
      actionLabel: 'Generate Official Report',
    },
  ];

  const current = STEPS[currentStep];
  const Icon = current.icon;

  const handleGoToStep = () => {
    navigateTo(current.targetView);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigateTo(STEPS[nextStep].targetView);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigateTo(STEPS[prevStep].targetView);
    }
  };

  return (
    <div
      id="sih-tour-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="sih-tour-modal-content"
        className="w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                SIH Hackathon 10-Step Showcase Flow
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100">
                Step {current.step} of 10
              </h3>
            </div>
          </div>

          <button
            id="close-sih-tour-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Progress</span>
            <span className="text-emerald-400 font-bold">{Math.round(((currentStep + 1) / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card Content */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <Icon className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{current.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {current.summary}
          </p>
        </div>

        {/* Quick Stepper Pills (1-10) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                navigateTo(s.targetView);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold shrink-0 transition-all flex items-center justify-center ${
                idx === currentStep
                  ? 'bg-emerald-500 text-slate-950 shadow-md scale-110'
                  : idx < currentStep
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {s.step}
            </button>
          ))}
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleGoToStep}
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{current.actionLabel}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
