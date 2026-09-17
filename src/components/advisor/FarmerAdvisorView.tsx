import React, { useState } from 'react';
import {
  UserCheck,
  Languages,
  Volume2,
  VolumeX,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FarmerAdvisorPlan } from '../../types/agri';
import { ClientDataService } from '../../services/clientDataService';
import { NavView } from '../layout/Sidebar';

interface FarmerAdvisorViewProps {
  currentLanguage: 'English' | 'Hindi';
  setCurrentLanguage: (lang: 'English' | 'Hindi') => void;
  setActiveView?: (view: NavView) => void;
}

export const FarmerAdvisorView: React.FC<FarmerAdvisorViewProps> = ({
  currentLanguage,
  setCurrentLanguage,
  setActiveView,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');
  const [selectedCondition, setSelectedCondition] = useState<string>('Rice Blast');
  const [plan, setPlan] = useState<FarmerAdvisorPlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Load plan when crop/condition/language changes
  React.useEffect(() => {
    async function load() {
      const p = await ClientDataService.getFarmerAdvisory(
        selectedCrop,
        selectedCondition,
        'High',
        'Tillering',
        'High Humidity > 85%',
        currentLanguage
      );
      setPlan(p);
    }
    load();
  }, [selectedCrop, selectedCondition, currentLanguage]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleAudioPlayback = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser window.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (plan) {
      window.speechSynthesis.cancel();
      const textToRead = `${plan.summary_message}. ${(plan.action_steps || [])
        .map(s => `Step ${s.step}: ${s.title}. ${s.details}`)
        .join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = currentLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = plan?.action_steps.length || 5;

  return (
    <div id="farmer-advisor-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Farmer Field Advisor &amp; Audio Voice Companion
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Accessible Rural UI
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Distills high-level machine learning predictions into direct, practical, field-executable steps in vernacular language with an audio speaker interface for on-farm guidance.
          </p>
        </div>
      </div>

      {/* Control Strip: Language Toggle, Crop & Condition Selector, Audio Button */}
      <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Switch */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-700">
            <button
              onClick={() => setCurrentLanguage('English')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentLanguage === 'English'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setCurrentLanguage('Hindi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentLanguage === 'Hindi'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          {/* Target Selection */}
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="Rice (Paddy)">Rice (Paddy)</option>
            <option value="Wheat">Wheat</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Cotton">Cotton</option>
          </select>

          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="Rice Blast">Rice Blast</option>
            <option value="Bacterial Leaf Blight">Bacterial Leaf Blight</option>
            <option value="Tomato Early Blight">Tomato Early Blight</option>
            <option value="Potato Late Blight">Potato Late Blight</option>
            <option value="Brown Planthopper">Brown Planthopper</option>
            <option value="Fall Armyworm">Fall Armyworm</option>
          </select>
        </div>

        {/* Audio Voice Readout Button */}
        <button
          id="audio-readout-btn"
          onClick={handleAudioPlayback}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
            isPlayingAudio
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>{currentLanguage === 'Hindi' ? 'आवाज़ बंद करें' : 'Stop Audio Readout'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{currentLanguage === 'Hindi' ? 'आवाज़ में सुनें (Voice)' : 'Listen via Audio'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Advisory Content */}
      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Step-by-Step Interactive Checklist (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {currentLanguage === 'Hindi' ? 'किसान सलाह संदेश' : 'Advisory Summary'}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {completedCount} / {totalSteps} {currentLanguage === 'Hindi' ? 'पूर्ण' : 'Completed'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {plan.summary_message}
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {currentLanguage === 'Hindi' ? 'खेत में करने योग्य कदम (Checklist)' : 'Field Action Checklist'}
              </h3>

              {(plan.action_steps || []).map(step => {
                const isDone = completedSteps[step.step];
                return (
                  <div
                    key={step.step}
                    id={`step-card-${step.step}`}
                    onClick={() => toggleStep(step.step)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                        : 'bg-slate-800/70 border-slate-700/80 text-slate-100 hover:border-slate-600'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-emerald-400 hover:text-emerald-300 shrink-0"
                      aria-label="Toggle task"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {step.step}. {step.title}
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${
                            step.priority === 'Immediate'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {step.priority}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-300'}`}>
                        {step.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Safety Advisory & Support Helpline (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Safety Advisory Card */}
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  {currentLanguage === 'Hindi' ? 'सुरक्षा एवं सावधानी' : 'Safety Advisory'}
                </h4>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {plan.safety_advisory}
              </p>
              <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-300 space-y-1">
                <div>• Wear rubber gloves and N95 / cloth mask during mixing.</div>
                <div>• Do not spray against the direction of the wind.</div>
                <div>• Wash spray equipment and clothes thoroughly after use.</div>
              </div>
            </div>

            {/* Kisan Call Center Helpline */}
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <PhoneCall className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  {currentLanguage === 'Hindi' ? 'मुफ्त किसान सहायता (KVK)' : 'Farmer Support Helpline'}
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                For complex or unresponsive crop symptoms, contact the Government Kisan Call Center or your local Krishi Vigyan Kendra.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                <div className="text-[11px] text-slate-400">Toll-Free Helpline</div>
                <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">1800-180-1551</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Available 6:00 AM - 10:00 PM Daily</div>
              </div>
            </div>

            {/* Print / Report link */}
            <button
              onClick={() => setActiveView?.('reports')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Download Official Advisory PDF</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
