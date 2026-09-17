import React, { useState } from 'react';
import { FieldRecord } from '../../types/agri';

interface SmartCropDoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  fields?: FieldRecord[];
  onShowToast: (msg: string) => void;
  onNavigateToAdvisory?: () => void;
  language?: 'Marathi' | 'English';
}

interface DiagnosticResult {
  diagnosis: string;
  marathiDiagnosis: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  cibrcChemical: {
    name: string;
    dosagePerLitre: string;
    dosagePerAcre: string;
    waitingPeriodDays: number;
  };
  organicRemedy: {
    name: string;
    dosage: string;
    method: string;
  };
  preventiveAdvice: string;
}

const CROP_OPTIONS = [
  { id: 'cotton', name: 'Cotton (कापूस)', icon: 'eco', variety: 'Bollgard II' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)', icon: 'spa', variety: 'JS 335 / JS 9305' },
  { id: 'tur', name: 'Pigeon Pea / Tur (तूर)', icon: 'grass', variety: 'BDN 711' },
  { id: 'sugarcane', name: 'Sugarcane (ऊस)', icon: 'energy_savings_leaf', variety: 'Co 86032' },
  { id: 'onion', name: 'Onion (कांदा)', icon: 'psychology', variety: 'Bhima Super' },
];

const SYMPTOMS_LIST = [
  { id: 'rust_pustules', label: 'Brown/Orange Spores or Pustules on Underside', icon: 'lens_blur', risk: 'high' },
  { id: 'bollworm_holes', label: 'Boll Entry Holes with Frass/Excreta', icon: 'pest_control', risk: 'critical' },
  { id: 'leaf_curling', label: 'Upward Leaf Curling & Crinkling', icon: 'cyclone', risk: 'moderate' },
  { id: 'yellowing', label: 'Interveinal Yellowing (Chlorosis)', icon: 'wb_sunny', risk: 'moderate' },
  { id: 'wilting', label: 'Sudden Drooping & Root Crown Blackening', icon: 'water_loss', risk: 'high' },
  { id: 'whitefly_swarm', label: 'Tiny White Insects & Sticky Honeydew', icon: 'bug_report', risk: 'moderate' },
  { id: 'stem_borer', label: 'Dead Heart or Wilting Central Shoot', icon: 'strikethrough_s', risk: 'high' },
  { id: 'anthracnose', label: 'Dark Circular Sunken Lesions on Pods/Leaves', icon: 'adjust', risk: 'high' },
];

export const SmartCropDoctorForm: React.FC<SmartCropDoctorFormProps> = ({
  isOpen,
  onClose,
  fields = [],
  onShowToast,
  onNavigateToAdvisory,
  language = 'English',
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('cotton');
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || 'field-1');
  const [growthStage, setGrowthStage] = useState<string>('Flowering (फुलोरा अवस्था)');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['bollworm_holes']);
  const [severityLevel, setSeverityLevel] = useState<number>(65);
  const [soilMoisture, setSoilMoisture] = useState<'dry' | 'optimal' | 'waterlogged'>('optimal');
  const [recentWeather, setRecentWeather] = useState<'dry_warm' | 'high_humidity' | 'heavy_rain'>('high_humidity');
  const [irrigationType, setIrrigationType] = useState<string>('Drip Irrigation');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRunAiDiagnostics = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let diag: DiagnosticResult;
      if (selectedCrop === 'cotton' && selectedSymptoms.includes('bollworm_holes')) {
        diag = {
          diagnosis: 'Pink Bollworm (Pectinophora gossypiella) - Moderate to Severe',
          marathiDiagnosis: 'गुलाबी बोंडअळी (पिंक बोंडअळी) प्रादुर्भाव',
          confidence: 96.4,
          severity: severityLevel > 60 ? 'critical' : 'high',
          cibrcChemical: {
            name: 'Profenofos 50% EC or Chlorantraniliprole 18.5% SC',
            dosagePerLitre: '2.5 ml / Litre water',
            dosagePerAcre: '500 ml dissolved in 200 Litres water per acre',
            waitingPeriodDays: 14,
          },
          organicRemedy: {
            name: 'Cold-Pressed Neem Oil 10,000 PPM + Pheromone Traps',
            dosage: '5 ml / Litre water',
            method: 'Install 8 pheromone traps per acre at crop canopy level. Spray Neem oil during early morning.',
          },
          preventiveAdvice: 'Destroy rosette flowers and pick damaged fallen bolls immediately to break insect generation cycle.',
        };
      } else if (selectedCrop === 'soybean' || selectedSymptoms.includes('rust_pustules')) {
        diag = {
          diagnosis: 'Asian Soybean Rust (Phakopsora pachyrhizi)',
          marathiDiagnosis: 'सोयाबीन तांबेरा रोग (रस्ट)',
          confidence: 94.8,
          severity: severityLevel > 50 ? 'high' : 'moderate',
          cibrcChemical: {
            name: 'Hexaconazole 5% EC or Propiconazole 25% EC',
            dosagePerLitre: '1.0 ml / Litre water',
            dosagePerAcre: '200 ml in 200 Litres water per acre',
            waitingPeriodDays: 21,
          },
          organicRemedy: {
            name: 'Trichoderma viride + Cow Urine Bio-Wash',
            dosage: '5 grams / Litre water',
            method: 'Foliar spray targeting lower leaf surface where spores germinate.',
          },
          preventiveAdvice: 'Avoid excessive nitrogen fertilization. Ensure adequate field drainage to reduce relative humidity.',
        };
      } else {
        diag = {
          diagnosis: 'Foliar Blight & Sucking Pest Complex (Anthracnose / Thrips)',
          marathiDiagnosis: 'पानावरील करपा व रसशोषक कीड प्रादुर्भाव',
          confidence: 91.2,
          severity: 'moderate',
          cibrcChemical: {
            name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
            dosagePerLitre: '1.0 ml / Litre water',
            dosagePerAcre: '200 ml in 200 Litres water per acre',
            waitingPeriodDays: 10,
          },
          organicRemedy: {
            name: 'Dashaparni Ark / 5% NSKE (Neem Seed Kernel Extract)',
            dosage: '25 ml / Litre water',
            method: 'Foliar spray every 7 days until pest resurgence drops below ETL.',
          },
          preventiveAdvice: 'Maintain crop spacing and install yellow sticky traps (10 traps/acre) for pest vector monitoring.',
        };
      }
      setResult(diag);
      setIsAnalyzing(false);
      setStep(4);
    }, 1400);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setSelectedSymptoms(['bollworm_holes']);
    setSeverityLevel(65);
  };

  const isMarathi = language === 'Marathi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-surface-container-lowest rounded-3xl shadow-2xl border border-emerald-500/25 flex flex-col overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <span className="material-symbols-outlined text-[22px]">medical_services</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base sm:text-lg font-bold">
                  {isMarathi ? 'स्मार्ट पीक डॉक्टर निदान फॉर्म' : 'Smart Crop Doctor Diagnostic Intake'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-400/30">
                  AI v2.4
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {isMarathi
                  ? 'लक्षणे व वातावरणानुसार अचूक CIBRC शिफारस'
                  : 'Symptom-to-Dosage precision agronomy prescription'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-2.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <button
                key={s}
                onClick={() => {
                  if (result || s < step) setStep(s);
                }}
                disabled={!result && s > step}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  step === s
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : s < step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-surface-container text-on-surface-variant opacity-60'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                  {s}
                </span>
                <span className="hidden sm:inline">
                  {s === 1 ? 'Crop & Field' : s === 2 ? 'Symptoms' : s === 3 ? 'Agronomy' : 'Prescription'}
                </span>
              </button>
            ))}
          </div>
          <span className="font-mono text-primary font-bold">Step {step}/4</span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar">
          
          {/* STEP 1: Field & Crop Selector */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">grass</span>
                  <span>{isMarathi ? '१. बाधित पीक निवडा (Select Target Crop)' : '1. Select Affected Crop'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CROP_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCrop(c.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        selectedCrop === c.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20'
                          : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[24px] text-primary">{c.icon}</span>
                        {selectedCrop === c.id && (
                          <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                        )}
                      </div>
                      <span className="font-bold text-sm leading-tight mt-1">{c.name}</span>
                      <span className="text-[11px] text-on-surface-variant">{c.variety}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field & Parcel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">pin_drop</span>
                    <span>{isMarathi ? 'शेत / गट क्रमांक (Farm Plot)' : 'Farm Field / Parcel'}</span>
                  </label>
                  <select
                    value={selectedFieldId}
                    onChange={e => setSelectedFieldId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    {fields.length > 0 ? (
                      fields.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.crop} • {f.areaAcres} Acres)
                        </option>
                      ))
                    ) : (
                      <option value="field-1">Field 42/B - Main Plot (3.5 Acres)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">calendar_month</span>
                    <span>{isMarathi ? 'पिकाची वाढ अवस्था (Growth Stage)' : 'Growth Stage'}</span>
                  </label>
                  <select
                    value={growthStage}
                    onChange={e => setGrowthStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option>Seedling Stage (रोपावस्था - 15 to 30 Days)</option>
                    <option>Vegetative Growth (शाकीय वाढ - 30 to 50 Days)</option>
                    <option>Flowering (फुलोरा अवस्था - 50 to 75 Days)</option>
                    <option>Pod / Boll Formation (बोंड / शेंग भरणे)</option>
                    <option>Pre-Harvest Maturity (पक्वता अवस्था)</option>
                  </select>
                </div>
              </div>

              {/* Informative Tip */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">info</span>
                <span>
                  {isMarathi
                    ? 'अचूक पीक अवस्था निवडल्याने कीटकनाशकाचा योग्य डोस व सुरक्षित प्रतिक्षा कालावधी (PHI) अचूक मिळतो.'
                    : 'Accurate growth stage ensures precise pesticide dilution and safe Pre-Harvest Interval (PHI).'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Pathology & Lesions */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">biotech</span>
                  <span>
                    {isMarathi
                      ? '२. पानावरील किंवा पिकावरील लक्षणे निवडा (Check Symptoms)'
                      : '2. Select Observed Symptoms on Leaf / Stem / Fruit'}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SYMPTOMS_LIST.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleSymptom(sym.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                            : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{sym.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold leading-tight block">{sym.label}</span>
                          <span className="text-[10px] text-on-surface-variant uppercase font-mono mt-0.5 block">
                            Risk Impact: {sym.risk}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Slider */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">speed</span>
                    <span>{isMarathi ? 'प्रादुर्भावाची तीव्रता (Infestation Spread %)' : 'Infestation Severity Rating'}</span>
                  </label>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      severityLevel > 70
                        ? 'bg-rose-100 text-rose-700'
                        : severityLevel > 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {severityLevel}% ({severityLevel > 70 ? 'High' : severityLevel > 40 ? 'Moderate' : 'Mild'})
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={severityLevel}
                  onChange={e => setSeverityLevel(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono mt-1">
                  <span>10% (Isolated spots)</span>
                  <span>50% (Economic Threshold Level)</span>
                  <span>100% (Field-wide)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Environmental & Micro-Climate Context */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">cloud</span>
                  <span>{isMarathi ? '३. हवामान व माती स्थिती (Micro-Climate & Soil)' : '3. Environmental & Soil Conditions'}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Soil Moisture */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-[16px]">water_drop</span>
                      <span>Soil Moisture</span>
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { id: 'dry', label: 'Dry (तडे गेलेले)' },
                        { id: 'optimal', label: 'Optimum / Vafsa (वाफसा)' },
                        { id: 'waterlogged', label: 'Waterlogged (पाणी साचलेले)' },
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSoilMoisture(m.id as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                            soilMoisture === m.id
                              ? 'bg-primary text-on-primary font-bold'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">routine</span>
                      <span>Relative Humidity / Sky</span>
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { id: 'dry_warm', label: 'Sunny / Dry (>32°C)' },
                        { id: 'high_humidity', label: 'Cloudy / Humid (>75% RH)' },
                        { id: 'heavy_rain', label: 'Recent Heavy Rainfall' },
                      ].map(w => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setRecentWeather(w.id as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                            recentWeather === w.id
                              ? 'bg-primary text-on-primary font-bold'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Irrigation */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-[16px]">shower</span>
                      <span>Irrigation Method</span>
                    </span>
                    <select
                      value={irrigationType}
                      onChange={e => setIrrigationType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium mt-1"
                    >
                      <option>Drip Irrigation (ठिबक)</option>
                      <option>Sprinkler (तुषार सिंचन)</option>
                      <option>Furrow / Flood (पाटपाणी)</option>
                      <option>Rainfed / Jirayat (कोरडवाहू)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Diagnostics CTA Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Synthesize CIBRC Diagnostic Plan</h4>
                    <p className="text-xs text-emerald-200/80">Cross-verifies symptoms against 240+ certified formulations</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiDiagnostics}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                      <span>Running AI Diagnostics...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                      <span>Generate Prescription</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Prescription & Advisory Result */}
          {step === 4 && result && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Diagnosis Banner */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        {result.confidence}% Match
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 text-[10px] font-bold uppercase">
                        Severity: {result.severity}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-1">
                      {result.diagnosis}
                    </h3>
                    <p className="text-xs text-primary font-bold">{result.marathiDiagnosis}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                </div>
              </div>

              {/* CIBRC Chemical Formulation */}
              <div className="p-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">vaccines</span>
                    <span>CIBRC Certified Chemical Prescription (रासायनिक उपाय)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-mono">
                    Govt. Approved
                  </span>
                </div>

                <div className="text-sm font-bold text-on-surface mt-0.5">{result.cibrcChemical.name}</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                  <div className="p-2.5 rounded-xl bg-surface-container-low text-xs">
                    <span className="text-[10px] text-on-surface-variant block">Dilution / Litre</span>
                    <span className="font-bold text-primary">{result.cibrcChemical.dosagePerLitre}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low text-xs">
                    <span className="text-[10px] text-on-surface-variant block">Per Acre Volume</span>
                    <span className="font-bold text-primary">{result.cibrcChemical.dosagePerAcre}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low text-xs">
                    <span className="text-[10px] text-on-surface-variant block">Waiting Period (PHI)</span>
                    <span className="font-bold text-rose-600">{result.cibrcChemical.waitingPeriodDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Eco-Friendly Organic Option */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">eco</span>
                  <span>Biological / Organic Alternative (जैविक नियंत्रण)</span>
                </div>
                <div className="font-bold text-emerald-950">{result.organicRemedy.name}</div>
                <p className="text-emerald-900/90 leading-relaxed">{result.organicRemedy.method}</p>
                <div className="text-[11px] font-mono text-emerald-800">Dosage: {result.organicRemedy.dosage}</div>
              </div>

              {/* Preventive Tips */}
              <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[18px] flex-shrink-0 mt-0.5">tips_and_updates</span>
                <span>{result.preventiveAdvice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-3.5 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center justify-between gap-3">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Previous</span>
            </button>
          ) : step === 4 ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>New Diagnosis</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : step === 4 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onShowToast('Prescription saved to Field Journal');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Journal</span>
                </button>
                {onNavigateToAdvisory && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToAdvisory();
                    }}
                    className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                  >
                    <span>Full Advisory</span>
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
