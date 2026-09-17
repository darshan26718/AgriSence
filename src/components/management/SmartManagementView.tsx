import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Sprout,
  Bug,
  AlertTriangle,
  Calendar,
  Droplets,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { NavView } from '../layout/Sidebar';

interface SmartManagementViewProps {
  setActiveView?: (view: NavView) => void;
}

export const SmartManagementView: React.FC<SmartManagementViewProps> = ({ setActiveView }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');
  const [targetIssue, setTargetIssue] = useState<string>('Rice Blast & Brown Planthopper');

  const timelineSteps = [
    {
      day: 'Day 1 (Immediate)',
      title: 'Water Regulation & Nitrogen Suspension',
      desc: 'Temporarily drain flooded standing water in paddy furrows to reduce microclimate relative humidity. Immediately halt urea top-dressing.',
      priority: 'Urgent',
      category: 'Cultural',
    },
    {
      day: 'Day 2 - 3',
      title: 'Targeted Bio-Control & Microbial Inoculation',
      desc: 'Foliar spray of Pseudomonas fluorescens @ 2.5 kg/ha or Trichoderma viride. Deploy yellow sticky traps (15-20 traps/ha) for sucking pest vector monitoring.',
      priority: 'High',
      category: 'Biological',
    },
    {
      day: 'Day 5 - 7',
      title: 'Secondary Field Scouting & Canopy Evaluation',
      desc: 'Inspect marked index plants along zig-zag transects. Count active blast lesions and planthopper nymphs at the hill base.',
      priority: 'Routine',
      category: 'Monitoring',
    },
    {
      day: 'Day 10 - 14',
      title: 'Threshold Chemical Intervention (Only if ETL Exceeded)',
      desc: 'If lesions expand or pest counts stay above ETL, apply recommended selective fungicide (Tricyclazole 75% WP @ 0.6 g/L) or neem formulation. Observe safety PPE.',
      priority: 'Conditional',
      category: 'Chemical',
    },
  ];

  return (
    <div id="smart-management-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Integrated Pest &amp; Disease Management (IPM) Advisory Matrix
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              ICAR &amp; KVK Protocols
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Multi-tiered interventions prioritizing sustainable biological controls and cultural sanitation, reserving synthetic agrochemicals solely for critical economic threshold breaches.
          </p>
        </div>
      </div>

      {/* Target Selector */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Crop</label>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
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
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diagnosis</label>
            <input
              type="text"
              value={targetIssue}
              onChange={e => setTargetIssue(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 w-56 sm:w-64"
            />
          </div>
        </div>

        <button
          onClick={() => setActiveView?.('farmer-advisor')}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <span>Farmer Voice / Audio Advisor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Multi-Tiered Management Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Immediate Actions */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-red-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <Clock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100">1. Immediate Actions (24-48h)</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Halt Nitrogen Sprays:</strong> Stop urea application immediately to prevent tender foliar growth.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Drain Standing Water:</strong> Allow field furrows to dry out for 48 hours to suppress fungal humidity.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Isolate Hotspots:</strong> Clip and bag heavily sporulating lower leaves; bury away from irrigation bunds.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Cultural Controls */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-blue-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Sprout className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100">2. Cultural Sanitation</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span><strong>Canopy Airflow Spacing:</strong> Maintain adequate hill spacing (20cm x 15cm) during transplantation.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span><strong>Alley Formation:</strong> Create 30 cm alleyways every 2-3 meters to disrupt planthopper microhabitats.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400 font-bold">•</span>
              <span><strong>Crop Rotation:</strong> Rotate with non-host leguminous crops (chickpea / mungbean) in next season.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Biological & Natural */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-emerald-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Bug className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100">3. Biological Controls</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Antagonistic Bio-agents:</strong> Spray <em>Pseudomonas fluorescens</em> @ 10g/L or <em>Trichoderma viride</em>.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Neem Formulations:</strong> Apply cold-pressed Azadirachtin 10,000 ppm @ 2 ml/L as repellent and anti-feedant.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Conserve Predators:</strong> Preserve mirid bugs (<em>Cyrtorhinus lividipennis</em>) and wolf spiders in field bunds.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4: Chemical & Safety */}
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-amber-500/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="font-bold text-sm text-slate-100">4. Selective Chemical &amp; PPE</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Threshold Spray:</strong> Apply Tricyclazole 75% WP @ 0.6 g/L or Kasugamycin 3% SL only after ETL breach.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Optimal Timing:</strong> Spray during calm afternoon hours (3 PM - 5 PM) to prevent pesticide volatilization.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Safety Caution:</strong> Wear gloves, face mask, and maintain 14-day pre-harvest interval (PHI).</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 14-Day Action Timeline */}
      <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              14-Day Integrated Treatment &amp; Recovery Timeline
            </h4>
            <p className="text-xs text-slate-400">Day-by-day protocol to achieve full crop recovery</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Expected 85% Recovery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {timelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-emerald-400">{step.day}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {step.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">{step.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Priority:</span>
                <span className="font-semibold text-amber-400">{step.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soil, Fertilizer & Water Calibration Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Droplets className="w-4 h-4" />
            <h4 className="font-bold text-sm text-slate-100">Irrigation Scheduling Adjustments</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Avoid overhead sprinkler irrigation during high disease pressure as water droplets splash fungal spores onto upper leaves. Switch to furrow or drip irrigation, and schedule morning watering so foliage dries quickly under daylight sun.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sprout className="w-4 h-4" />
            <h4 className="font-bold text-sm text-slate-100">Balanced Nutrient &amp; Potash Fortification</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apply Muriate of Potash (MOP) @ 25 kg/acre. Potassium strengthens cell wall thickness and lignification in plant epidermal layers, making it significantly harder for fungal blast appressoria and sucking insect stylets to penetrate plant tissues.
          </p>
        </div>
      </div>
    </div>
  );
};
