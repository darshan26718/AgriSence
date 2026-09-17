import React, { useState, useEffect, useRef } from 'react';
import { ClientDataService } from '../../services/clientDataService';

interface StitchAdvisoryViewProps {
  onNavigateToOfficers: () => void;
  onNavigateToScan?: () => void;
  onShowToast: (msg: string) => void;
  capturedImage?: string | null;
}

export const StitchAdvisoryView: React.FC<StitchAdvisoryViewProps> = ({
  onNavigateToOfficers,
  onNavigateToScan,
  onShowToast,
  capturedImage,
}) => {
  const [activeTreatment, setActiveTreatment] = useState<'organic' | 'chemical'>('organic');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(45);
  const [isSavedToLog, setIsSavedToLog] = useState<boolean>(false);
  const audioIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlayingAudio) {
      audioIntervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsPlayingAudio(false);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            return 45;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isPlayingAudio]);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(
            'Agricultural University and CIBRC certified advisory for Pink Bollworm. Apply Neem Oil 10,000 PPM at 5 ml per liter of water, or Profenofos 50% EC at 30 ml per knapsack sprayer. Ensure 14 days pre-harvest interval.'
          );
          utterance.rate = 0.92;
          utterance.onend = () => {
            setIsPlayingAudio(false);
            setSecondsLeft(45);
          };
          window.speechSynthesis.speak(utterance);
        } catch {
          // fallback
        }
      }
    }
  };

  const handleSaveToLog = () => {
    setIsSavedToLog(true);
    ClientDataService.saveLogbookEntry({
      crop: 'Cotton (Bollgard II)',
      issue: 'Pink Bollworm (Stage 2 - Moderate)',
      severity: 'Moderate',
      actionTaken:
        activeTreatment === 'organic'
          ? 'Applied Cold-Pressed Neem Oil 10,000 PPM (5 ml/L) & installed 5 pheromone traps'
          : 'Applied Profenofos 50% EC (30 ml/10L knapsack sprayer) with 14-day PHI',
      treatmentType: activeTreatment,
      cibrcCertified: true,
    });
    onShowToast('Report saved to farm logbook (ID: #AGRI-8829).');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      'AgriSense Crop Diagnosis Report (#AGRI-8829):\nCrop: Cotton\nPest: Pink Bollworm (Stage 2 - Moderate)\nAccuracy: 91.8%\nRecommended: Neem Oil 10,000 ppm (5ml/L) or Profenofos 50% EC (30ml/10L pump)\nCertified Farmer Krishi Advisory'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onShowToast('Sharing diagnosis report on WhatsApp...');
  };

  return (
    <div className="flex flex-col w-full gap-space-md max-w-4xl mx-auto pb-6 select-none">
      {/* Top Offline / Cloud Verified Status Ribbon */}
      <div className="flex items-center justify-between px-space-md py-space-xs rounded-xl bg-surface-container-high text-on-surface-variant shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-xs">
          <span
            className="material-symbols-outlined text-primary text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span className="font-label-sm text-label-sm font-semibold">
            CIBRC Certified Protocol 2024 | Akola Center
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-primary font-bold">ID: #MH-8829</span>
      </div>

      {/* Primary Diagnostic Assessment Card */}
      <div className="flex flex-col w-full rounded-xl bg-surface-container-lowest p-space-md shadow-md gap-space-md border border-outline-variant/20">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                Moderate Infestation (Stage 2)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                Action Required within 48h
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold pt-1">
              Pink Bollworm Infestation
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pink Bollworm (<span className="italic">Pectinophora gossypiella</span>) - Cotton Crop
            </p>
          </div>

          {/* AI Confidence Badge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-low min-w-[72px] text-center border border-outline-variant/20">
            <span className="font-headline-md text-headline-md text-primary leading-none font-bold">
              91.8%
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 font-medium">
              Accuracy
            </span>
          </div>
        </div>

        {/* Leaf Scan Inspection Split View */}
        <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-high h-56 shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt="Cotton boll pink bollworm inspection"
            src={
              capturedImage ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA6bDK9QswgcG-qVkioIJyDtTekmy2OdvwNHxiUL1LOHomVdYr5GA8WTGiTW9RF1FT1q3uy1-MZuXI5o0BikgfxHppXLFZ74XMfc_T1O0AsyY_Fu3UzJGaPViVpLtYKYg6wKHx4X7S03eIDo3aAuZF_PAjMgZM44w_vALsjFCGuChbeYxpRrYlLqb292UWt0p2FR_C1Ki_d_uTBz3o2TTRUEf6sMNQjl228bLj_3ANVhRZtP7lmYMMb"
            }
          />
          {capturedImage && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-inverse-surface/85 backdrop-blur-sm text-surface-bright text-[11px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping"></span>
              <span>LIVE CAMERA CAPTURE</span>
            </div>
          )}

          {onNavigateToScan && (
            <button
              onClick={onNavigateToScan}
              type="button"
              className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-primary text-label-sm font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Retake Photo</span>
            </button>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-space-sm justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm shadow">
              <span className="material-symbols-outlined text-secondary text-[16px]">crisis_alert</span>
              <span className="font-label-sm text-label-sm text-on-surface font-bold">
                {capturedImage ? 'Field Specimen Analysis' : 'Infestation Entry Point (Boll Entrance)'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface/90 text-on-surface text-[11px] font-label-sm font-semibold">
              <span>YOLOv8 + MobileNetV2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Advisory Player Card */}
      <div
        className="flex flex-col w-full rounded-xl bg-primary-container text-on-primary p-space-md shadow-md gap-space-sm"
        id="audioSection"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-on-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                campaign
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-primary leading-snug font-bold">
                Dr. Panjabrao Deshmukh Krishi Vidyapeeth Advisory
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Spoken Audio Guide (45s)
              </span>
            </div>
          </div>
          <span className="font-label-sm text-label-sm bg-primary px-2 py-0.5 rounded-full text-on-primary font-bold">
            Audio
          </span>
        </div>

        <div className="flex items-center gap-space-md pt-1">
          <button
            onClick={toggleAudio}
            aria-label="Play audio message"
            className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-lg active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
            id="audioToggleBtn"
            type="button"
          >
            <span className="material-symbols-outlined text-[28px]" id="playIcon">
              {isPlayingAudio ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Waveform Indicator */}
          <div
            className="flex items-center gap-1 flex-1 h-8 px-2 rounded-lg bg-primary/40 overflow-hidden"
            id="waveform"
          >
            {[3, 6, 4, 7, 5, 8, 4, 6, 3, 5, 2, 6, 4, 7, 3, 5].map((h, idx) => (
              <span
                key={idx}
                className={`w-1 bg-on-primary-container rounded-full transition-all duration-300 ${
                  isPlayingAudio ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${h * 3}px`,
                  animationDelay: `${(idx % 4) * 0.15}s`,
                }}
              ></span>
            ))}
          </div>
          <span
            className="font-label-sm text-label-sm text-on-primary-container flex-shrink-0 font-mono"
            id="audioTimer"
          >
            0:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
        </div>
      </div>

      {/* Dual Treatment Selection Section */}
      <div className="flex flex-col w-full gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Certified Spray &amp; Control Measures
          </h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Select</span>
        </div>

        {/* Segmented Control Bar */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container gap-1 shadow-inner">
          <button
            className={`py-2.5 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
              activeTreatment === 'organic'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            onClick={() => setActiveTreatment('organic')}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">eco</span>
            <span>Organic / Biological</span>
          </button>
          <button
            className={`py-2.5 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
              activeTreatment === 'chemical'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            onClick={() => setActiveTreatment('chemical')}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Chemical Spray</span>
          </button>
        </div>

        {/* Treatment Content: Organic */}
        {activeTreatment === 'organic' && (
          <div className="flex flex-col gap-space-sm" id="organicContent">
            {/* Organic Action Item 1 */}
            <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm gap-2 border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">spa</span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                      Neem Oil 10,000 ppm (Cold Pressed)
                    </h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Natural Pest Deterrent &amp; Ovicidal
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-bold">
                  Affordable
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-on-surface border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Recommended Dose:
                  </span>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    5 ml per Liter of water
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Per Acre:</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    1000 ml / 200 L water
                  </span>
                </div>
              </div>
            </div>

            {/* Organic Action Item 2 */}
            <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm gap-2 border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">wb_twilight</span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                      Pheromone Traps
                    </h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      With lure for male moths
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Field Dose:</span>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    5 traps per hectare
                  </span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">
                  Placement: 1 ft above crop canopy
                </div>
              </div>
            </div>

            {/* Organic Action Item 3 */}
            <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm gap-2 border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">pest_control</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                    Trichogramma bactrae
                  </h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Biological parasitoid (50,000 eggs/acre)
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              </div>
            </div>
          </div>
        )}

        {/* Treatment Content: Chemical */}
        {activeTreatment === 'chemical' && (
          <div className="flex flex-col gap-space-sm" id="chemicalContent">
            {/* CIBRC Primary Drug Card */}
            <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm gap-space-sm border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">sanitizer</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                        Profenofos 50% EC
                      </h3>
                      <span
                        className="w-2.5 h-2.5 bg-blue-600 rotate-45 inline-block"
                        title="Blue Triangle Toxicity - Moderate Danger"
                      ></span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Profenofos 50% EC (Contact &amp; Systemic)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold">
                  CIBRC Approved
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-space-sm rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Knapsack Pump Dose (10 L):
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">30 ml</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Est. Cost Per Acre:
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    ₹420 / acre
                  </span>
                </div>
              </div>
              {/* CIBRC Mandatory Safety Warning */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-high text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">
                    Pre-Harvest Interval (PHI): 14 Days
                  </span>
                  <span className="font-body-sm text-body-sm">
                    Do not harvest crop or allow cattle grazing for 14 days after spraying.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Direct Action Buttons */}
      <div className="flex flex-col w-full gap-space-sm pt-2">
        {/* Primary Stock Action */}
        <button
          onClick={onNavigateToOfficers}
          className="flex items-center justify-between w-full h-12 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md active:scale-[0.99] transition-transform cursor-pointer hover:bg-primary-container font-bold"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">storefront</span>
            <span>Check Stock at Local Krishi Seva Kendra</span>
          </div>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        {/* Secondary Split Utilities */}
        <div className="grid grid-cols-2 gap-space-sm">
          <button
            onClick={handleSaveToLog}
            className="flex items-center justify-center gap-1.5 h-12 px-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm active:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 font-bold"
            id="saveLogBtn"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isSavedToLog ? 'text-primary' : ''
              }`}
              id="logIcon"
            >
              {isSavedToLog ? 'task_alt' : 'book_online'}
            </span>
            <span id="logText">{isSavedToLog ? 'Saved to Logbook' : 'Add to Farm Logbook'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 h-12 px-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm active:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 font-bold"
            id="shareWaBtn"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">share</span>
            <span>Share Report on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
