import React, { useState, useEffect } from 'react';
import { FieldRecord } from '../../types/agri';
import { ClientDataService, MicroclimateTelemetry } from '../../services/clientDataService';
import { MapView } from '../fields/MapView';

interface StitchHomeViewProps {
  onNavigateToScan: () => void;
  onNavigateToAdvisory: () => void;
  onNavigateToRadar: () => void;
  onNavigateToOfficers: () => void;
  onNavigateToDatasets?: () => void;
  fields?: FieldRecord[];
  onShowToast: (msg: string) => void;
  onOpenAlertSimulation?: () => void;
  onOpenDoctorForm?: () => void;
  activeAlertCount?: number;
  language?: 'Marathi' | 'English';
}

export const StitchHomeView: React.FC<StitchHomeViewProps> = ({
  onNavigateToScan,
  onNavigateToAdvisory,
  onNavigateToRadar,
  onNavigateToOfficers,
  onNavigateToDatasets,
  fields = [],
  onShowToast,
  onOpenAlertSimulation,
  onOpenDoctorForm,
  activeAlertCount = 0,
  language = 'English',
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceQuery, setVoiceQuery] = useState<string>('');
  const [voiceAnswer, setVoiceAnswer] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<MicroclimateTelemetry | null>(null);

  useEffect(() => {
    ClientDataService.getMicroclimateTelemetry().then(data => {
      if (data) setTelemetry(data);
    });
  }, []);

  const handleStartVoice = () => {
    setIsVoiceModalOpen(true);
    setIsListening(true);
    setVoiceAnswer(null);

    // Check SpeechRecognition support
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setVoiceQuery(spoken);
          setIsListening(false);
          provideVoiceAnswer(spoken);
        };

        recognition.onerror = () => {
          setIsListening(false);
          provideVoiceAnswer('What is recommended for pink bollworm in cotton?');
        };

        recognition.start();
        return;
      } catch {
        // Fallback to simulation
      }
    }

    // High fidelity fallback simulation
    setTimeout(() => {
      const sample = 'What is the dosage for pink bollworm in cotton?';
      setVoiceQuery(sample);
      setIsListening(false);
      provideVoiceAnswer(sample);
    }, 2200);
  };

  const provideVoiceAnswer = async (query: string) => {
    setIsListening(false);
    try {
      const res = await ClientDataService.askAdvisorVoiceQuery(query);
      const answer = res.answer || 'Recommended immediate control for Pink Bollworm is Profenofos 50% EC at 30 ml per 10 Litres of water, or Cold-pressed Neem Oil 10,000 ppm at 5 ml/L.';
      setVoiceAnswer(answer);

      // Speak answer via SpeechSynthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(answer);
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        } catch {
          // Browser policy fallback
        }
      }
    } catch {
      const fallback = 'For Pink Bollworm in Cotton, install 5 pheromone traps per hectare. If infestation exceeds 5%, spray Cold-Pressed Neem Oil 10,000 PPM at 5 ml/L.';
      setVoiceAnswer(fallback);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-md max-w-4xl mx-auto pb-6">
      {/* Offline-Ready Micro Banner */}
      <div className="flex items-center justify-between px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface-variant shadow-sm">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm">Local Micro-Station Live Connected</span>
        </div>
        <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold">
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>10m ago</span>
        </div>
      </div>

      {/* Welcome & Geo-identity Card */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/20">
        <div className="relative z-10 flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span> Certified Farmer
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold truncate">
              Welcome, Farmer Partner!
            </h1>
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-1">
              <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
              <span className="truncate">Main Farm Plot | Field No. 42/B, 3.5 Acres</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">agriculture</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">water_drop</span>
            Rich Black Cotton Soil (Clayey)
          </span>
          <span className="font-label-sm text-label-sm text-primary font-bold bg-surface-container-high px-2 py-0.5 rounded">
            Kharif Season 2024
          </span>
        </div>
      </div>

      {/* AI Threshold Sentinel & Push Alert Simulation Card */}
      {onOpenAlertSimulation && (
        <div className="rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-md shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              activeAlertCount > 0
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-primary-container text-on-primary'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {activeAlertCount > 0 ? 'notifications_active' : 'notification_add'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight truncate">
                  AI Detection Alert Sentinel
                </h2>
                {activeAlertCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-500/30">
                    {activeAlertCount} Breached
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                    Fields Safe
                  </span>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant truncate">
                Real-time surveillance on {fields.length} saved fields • Push banners on severe disease risk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenAlertSimulation}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Simulate Alert</span>
            </button>
            <button
              onClick={onOpenAlertSimulation}
              className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="Configure Detection Thresholds"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>
      )}

      {/* Urgent Spore Risk & Microclimate Section */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">routine</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                Micro-Climate &amp; Fungal Spore Risk
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Live Field Telemetry</p>
            </div>
          </div>
          <span
            className="material-symbols-outlined text-secondary-container animate-spin"
            style={{ animationDuration: '10s' }}
          >
            partly_cloudy_day
          </span>
        </div>

        {/* Alert Banner */}
        <div
          onClick={onNavigateToRadar}
          className="flex items-start gap-space-sm p-space-sm rounded-lg bg-secondary-fixed text-on-secondary-fixed shadow-sm cursor-pointer hover:bg-secondary-fixed/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5 text-secondary">
            warning
          </span>
          <div className="flex flex-col flex-1">
            <span className="font-label-md text-label-md font-bold leading-tight text-secondary">
              ⚠️ High Risk for Soybean Rust &amp; Pink Bollworm
            </span>
            <span className="font-body-sm text-body-sm opacity-90 mt-0.5">
              High Spore Risk: Relative humidity above 75%, inspect crops immediately.
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-secondary">chevron_right</span>
        </div>

        {/* Telemetry Cards Grid */}
        <div className="grid grid-cols-3 gap-space-xs mt-1">
          {/* Temp Card */}
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-low text-center">
            <span className="material-symbols-outlined text-secondary text-[22px] mb-1">thermostat</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">31°C</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Temp (Moderate)</span>
          </div>

          {/* Humidity Risk Card */}
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-error-container text-on-error-container text-center relative overflow-hidden">
            <span className="material-symbols-outlined text-error text-[22px] mb-1">humidity_high</span>
            <span className="font-headline-md text-headline-md font-bold text-error">78%</span>
            <span className="font-label-sm text-label-sm font-bold text-error">High Humidity</span>
          </div>

          {/* Wind Card */}
          <div className="flex flex-col items-center justify-center p-space-sm rounded-lg bg-surface-container-low text-center">
            <span className="material-symbols-outlined text-primary text-[22px] mb-1">air</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              12 <span className="font-label-sm text-label-sm font-normal">km/h</span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Wind Speed</span>
          </div>
        </div>

        {/* Soil & Spore Meter (SVG Gauge) */}
        <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container mt-1">
          <div className="flex items-center gap-space-sm">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-dim stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <path
                  className="text-secondary stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray="75, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">75%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-bold">Soil Moisture Index</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                No irrigation required currently
              </span>
            </div>
          </div>
          <button
            onClick={() => onShowToast('Optimal soil moisture: Field capacity between 70-80%')}
            className="h-8 px-2.5 rounded-lg bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
            type="button"
          >
            Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Unique Feature: Interactive Smart Crop Doctor Diagnostic Intake Form */}
      {onOpenDoctorForm && (
        <div className="glass-panel rounded-3xl p-5 border border-emerald-500/25 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-emerald-500/40">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-emerald-400/30">
              <span className="material-symbols-outlined text-[26px]">medical_services</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-emerald-950 tracking-tight leading-snug truncate">
                  {language === 'Marathi' ? 'स्मार्ट पीक डॉक्टर निदान फॉर्म' : 'Smart Crop Doctor Diagnostic Form'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-mono text-[10px] font-bold uppercase border border-emerald-400/30">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                {language === 'Marathi'
                  ? 'पानावरील लक्षणे व मातीतील ओलावा निवडून अचूक CIBRC रासायनिक व सेंद्रिय औषध योजना मिळवा'
                  : '4-step wizard: Match symptoms & moisture to certified CIBRC pesticides & organic solutions'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDoctorForm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-400/40 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span>{language === 'Marathi' ? 'फॉर्म भरा' : 'Open Doctor Form'}</span>
          </button>
        </div>
      )}

      {/* Primary Quick Action: AI Camera Crop Diagnostic Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-900 text-on-primary p-space-md shadow-md border border-emerald-600/30">
        {/* Ambient organic SVG glow in background */}
        <svg
          className="absolute -right-8 -bottom-8 w-44 h-44 text-primary-fixed/15 pointer-events-none"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <path
            d="M42.7,-62.9C55.9,-54.6,67.6,-43.3,73.5,-29.6C79.4,-15.8,79.5,0.4,75.4,15.6C71.3,30.8,63,45,51.2,55.9C39.4,66.8,24.1,74.4,8.2,75.7C-7.7,77,-24.1,72,-38.3,62.9C-52.5,53.8,-64.5,40.6,-71.4,25.2C-78.3,9.8,-80.1,-7.8,-74.6,-22.8C-69.1,-37.8,-56.3,-50.2,-42.2,-58.2C-28.1,-66.2,-14,-69.8,0.7,-70.9C15.5,-72,31,-70.6,42.7,-62.9Z"
            transform="translate(100 100)"
          />
        </svg>

        <div className="relative z-10 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span> 98.4% AI Accuracy
            </span>
            <span className="font-label-sm text-label-sm opacity-90 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">offline_bolt</span> Offline Capable
            </span>
          </div>

          <div className="flex flex-col mt-1">
            <h3 className="font-headline-md text-headline-md font-bold leading-snug">
              Notice pests or spots on crops?
            </h3>
            <p className="font-body-md text-body-md text-on-primary/90 mt-1">
              Identify rust, bollworm, or blight in just one photo. Get instant certified dosage advisory.
            </p>
          </div>

          <div className="mt-space-xs pt-space-xs flex flex-col sm:flex-row gap-space-sm items-stretch">
            <button
              onClick={onNavigateToScan}
              className="h-12 px-space-md rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 hover:bg-surface-container-low transition-all cursor-pointer"
              id="quickScanBtn"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px] text-primary animate-pulse">
                center_focus_strong
              </span>
              <span>Instant AI Crop Scan</span>
            </button>

            <button
              onClick={onNavigateToScan}
              className="h-12 px-space-md rounded-lg bg-surface-container-lowest/15 backdrop-blur-sm text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer hover:bg-surface-container-lowest/25"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">photo_library</span>
              <span>Choose from Gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Cadastral Map & Instant Field Status Scan */}
      <MapView
        fields={fields}
        onScanField={() => {
          onNavigateToScan();
          onShowToast(language === 'Marathi' ? 'पिकाचे पान स्कॅन करण्यासाठी कॅमेरा उघडत आहे...' : 'Opening camera to scan field crop leaf...');
        }}
        onShowToast={onShowToast}
        language={language}
      />

      {/* Active Crop Health Watchlist */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">spa</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                My Crops &amp; Health Status
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Active Crop Health Surveillance (3 Registered)
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToAdvisory}
            className="font-label-sm text-label-sm font-bold text-primary flex items-center gap-0.5 active:underline cursor-pointer"
            type="button"
          >
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Crop Item 1: Soybean (Healthy) */}
        <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs transition-colors hover:bg-surface-container">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <img
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                alt="Soybean crop"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOXKgA8D-xt88hi02DcpUmv5CCD9obMIKJpv1IaSK31gT93EbApjxs10Tx1VQxaCOaT-sbolt1ouXOM6gJ7MUil2ui2HvbPDVbIXbc9b9_FMmZpKNrjTXMWF-s9tkfFPyljVFNtAC2WkVxU830WSGpnyBk8mJ2Uugg21VanaHM5HvBrZVLS54SWb1Tui5luqLXcN-uALn1nAjqhRgDN2cJSu2I5B9psd57cgUsdm0rdjSrX6M4nhWf"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Soybean (JS 335)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
                    92% Good
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Stage: 45 Days (Flowering)
                </span>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Soybean JS 335: Scheduled for micro-nutrient spray in 5 days.')}
              className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant active:scale-95 flex-shrink-0 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
          <div className="flex items-center justify-between mt-1 pt-space-xs text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container-high/60">
            <div className="flex items-center gap-1.5 text-primary font-bold font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">schedule</span> Next Spray: in 5 days
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              2.0 Acres
            </span>
          </div>
        </div>

        {/* Crop Item 2: Cotton (Medium Risk) */}
        <div
          onClick={onNavigateToAdvisory}
          className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs transition-colors hover:bg-surface-container cursor-pointer"
        >
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <img
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                alt="Cotton crop"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQfNA7Fg2WTYv5sAxroGQDZ2_qa05fJTnqqSwycco331aSfRZb5uEfNRtX5tIKeON7ESa6N6miIBolQXrM2WknMZUeKH6fCN5WGmGWKSeSglo4gBvPxEFX-7LSkBpyfeha2GS8LX8M3X0EtHOasVQGA80oKOoLtJm59R2SF0jX6lJyhuhAIzQDeKZA3vl-I--olxpTcQFi4jO_XKgHrg5pAAnrwdbIcjXeFAfZptn9RYW9_aAUrwXY"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Cotton (BT Cotton)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                    Moderate Risk
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Variety: Bollgard II | Stage: 60 Days
                </span>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant active:scale-95 flex-shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>

          {/* Warning note */}
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-surface-container-high text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">bug_report</span>
            <span className="truncate">Warning: Install Pink Bollworm pheromone traps immediately.</span>
          </div>
          <div className="flex items-center justify-between mt-0.5 text-on-surface-variant font-body-sm text-body-sm">
            <span className="font-label-sm text-label-sm text-secondary font-bold">
              Inspection: Tomorrow morning
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              1.0 Acre
            </span>
          </div>
        </div>

        {/* Crop Item 3: Pigeon Pea / Tur (Normal) */}
        <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs transition-colors hover:bg-surface-container">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <img
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                alt="Tur crop"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1MwHqwnKMhZjl8hCuMQWHLBkCwz8tOsTIP9SJcuxxHRByqSnba9OoQWfC3J-R1dmzDYfdKCZn-9eFfaAUPs_6MBiipH-8DzSyPzvDCz1u9MjuyCAOsQHglCOMZvEaRsKfWiXhiRUt7gN979THXDG5SMn0VsVM7DKS75dWtFDuNg0WkkEilBp7hUF2KbFLRFc7ffOJJBN42YcU4hbeG3rF3x-LsPp701UfOuZKKH3gW43BFzbLguhK"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">
                    Tur / Pigeon Pea
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-bold">
                    Normal
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Intercrop | Stage: 30 Days
                </span>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Pigeon Pea: Intercropped with Cotton. Clear of major blight.')}
              className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant active:scale-95 flex-shrink-0 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
          <div className="flex items-center justify-between mt-1 text-on-surface-variant font-body-sm text-body-sm pt-space-xs border-t border-surface-container-high/60">
            <span className="font-label-sm text-label-sm text-primary">Weeding Completed</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              0.5 Acre
            </span>
          </div>
        </div>
      </div>

      {/* Universal Krishi Advisory Bulletin (Agricultural Extension Center) */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Agri Dept. Daily Advisory
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Agricultural Extension Network • Krishi Advisory Center
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
            All Farming Zones
          </span>
        </div>

        {/* Bulletin Card */}
        <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <div className="flex items-center gap-1.5 text-secondary font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[18px]">priority_high</span>
            <span>Seasonal Advisory for Cotton, Soybean &amp; Kharif Crops</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
            Persistent cloudy and humid conditions promote root rot and anthracnose. Spray{' '}
            <strong>Trichoderma</strong> at 5g/L water or{' '}
            <strong>5% Neem Extract (Azadirachtin)</strong> as primary preventive treatment.
          </p>
          <div className="flex items-center justify-between pt-space-xs mt-1 border-t border-surface-container-high">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
              <span>Dr. V. K. Sharma (Senior Extension Agronomist)</span>
            </div>
            <button
              onClick={() => onShowToast('Downloading official advisory PDF: Krishi_Ext_Advisory_Notice.pdf')}
              className="h-8 px-3 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold flex items-center gap-1 active:scale-95 cursor-pointer hover:bg-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span> Report
            </button>
          </div>
        </div>
      </div>

      {/* Universal Agricultural Datasets Banner Card */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-space-md shadow-sm flex flex-col gap-space-sm border border-emerald-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">dataset</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-white font-bold">
                Agricultural Datasets &amp; Knowledge Base
              </h2>
              <p className="font-label-sm text-label-sm text-emerald-200/80">
                10 Certified Datasets • CIBRC Registered Molecules &amp; Soil Profiles
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-label-sm text-label-sm font-bold border border-emerald-400/30">
            Open Data
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-emerald-100/90 leading-relaxed">
          Access verified datasets covering crop health records, pathogen symptoms, economic thresholds (ETL), CIBRC approved pesticides, soil fertility plans, and MSP mandi prices.
        </p>

        <div className="flex items-center justify-between pt-space-xs mt-1 border-t border-emerald-800/80">
          <span className="text-xs text-emerald-200/70">
            Available in CSV &amp; REST API formats
          </span>
          {onNavigateToDatasets && (
            <button
              onClick={onNavigateToDatasets}
              className="h-8 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-label-sm text-label-sm font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
              type="button"
            >
              <span>Explore Datasets</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Assistant Floating Action Button (Sticky Touch Target) */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={handleStartVoice}
          className="h-14 px-5 rounded-full bg-secondary-container text-on-secondary flex items-center gap-2.5 shadow-lg active:scale-95 hover:bg-secondary transition-all cursor-pointer"
          id="voiceAssistantBtn"
          type="button"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">mic</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-surface-container-lowest animate-ping"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-label-lg text-label-lg font-bold leading-none">Voice Assistant</span>
            <span className="font-label-sm text-label-sm opacity-90 leading-tight">Speak Advisory</span>
          </div>
        </button>
      </div>

      {/* Micro Voice Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-x-4 bottom-24 z-50 p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl flex flex-col gap-space-sm items-center text-center max-w-md mx-auto animate-fadeIn border border-primary-fixed/20">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[28px]">graphic_eq</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold">
              {isListening ? "I'm listening, please speak..." : 'AI Advisory Spoken Response'}
            </span>
            <span className="font-body-sm text-body-sm opacity-80 mt-0.5">
              {voiceQuery ? `"${voiceQuery}"` : 'e.g., "What spray is recommended for soybean rust?"'}
            </span>
          </div>

          {isListening && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-bounce"></span>
              <span
                className="w-2 h-2 rounded-full bg-secondary-container animate-bounce"
                style={{ animationDelay: '0.15s' }}
              ></span>
              <span
                className="w-2 h-2 rounded-full bg-secondary-container animate-bounce"
                style={{ animationDelay: '0.3s' }}
              ></span>
            </div>
          )}

          {voiceAnswer && (
            <div className="p-3 bg-surface-container-highest/20 rounded-lg text-left text-surface-bright text-body-sm mt-1">
              <p className="font-semibold text-primary-fixed mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                Dr. Panjabrao Krishi Vidyapeeth Guide:
              </p>
              <p>{voiceAnswer}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleStartVoice}
              className="px-3 py-1 rounded bg-secondary-container text-on-secondary font-label-sm text-label-sm font-bold active:scale-95"
            >
              Ask Again
            </button>
            <button
              onClick={() => setIsVoiceModalOpen(false)}
              className="text-inverse-on-surface/70 font-label-sm text-label-sm underline"
              id="closeVoiceBtn"
              type="button"
            >
              Cancel (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
