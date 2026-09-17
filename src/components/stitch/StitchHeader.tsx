import React from 'react';
import { AgriSenseEmblem } from '../common/AgriSenseEmblem';

interface StitchHeaderProps {
  currentLanguage?: 'English' | 'Marathi';
  language?: 'English' | 'Marathi';
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onToggleLanguage: () => void;
  onOpenMoreTools?: () => void;
  onOpenTour?: () => void;
  onOpenAlertSimulation?: () => void;
  onOpenDoctorForm?: () => void;
  unreadAlertsCount?: number;
  syncStatus?: 'active' | 'syncing' | 'offline';
  onShowToast?: (msg: string) => void;
  isVoiceListening?: boolean;
  onToggleVoiceListening?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const StitchHeader: React.FC<StitchHeaderProps> = ({
  currentLanguage,
  language,
  onToggleLanguage,
  onOpenMoreTools,
  onOpenTour,
  onOpenAlertSimulation,
  onOpenDoctorForm,
  unreadAlertsCount = 0,
  syncStatus = 'active',
  isVoiceListening = false,
  onToggleVoiceListening,
  onOpenVoiceAssistant,
}) => {
  const activeLang = currentLanguage || language || 'Marathi';

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass-panel shadow-[0_4px_20px_rgba(6,78,59,0.08)] border-b border-emerald-500/20 pt-safe transition-all duration-300">
      <div className="h-18 px-4 sm:px-6 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Left: Emblem and Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <AgriSenseEmblem className="h-10 w-10 drop-shadow-sm" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl text-emerald-950 tracking-tight leading-none">
                AgriSense
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                BIO-HUD
              </span>
            </div>
            <span className="text-[11px] text-emerald-800/80 font-medium truncate max-w-[200px] sm:max-w-none">
              {activeLang === 'Marathi'
                ? 'स्मार्ट कृषी सल्लागार • महाराष्ट्र शासन धर्तीवर'
                : 'Intelligent Agricultural Command & Precision Advisory'}
            </span>
          </div>
        </div>

        {/* Center: Live Agronomic Telemetry Ticker (Desktop / Tablet) */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-500/20 text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-900">
            <span className="material-symbols-outlined text-[15px] text-amber-600">thermostat</span>
            <span>31°C</span>
          </div>
          <span className="text-emerald-300">|</span>
          <div className="flex items-center gap-1 text-emerald-900">
            <span className="material-symbols-outlined text-[15px] text-blue-600">humidity_percentage</span>
            <span>78% RH</span>
          </div>
          <span className="text-emerald-300">|</span>
          <div className="flex items-center gap-1 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-semibold text-rose-700">Rust Spore Alert</span>
          </div>
        </div>

        {/* Right: Actions, Smart Doctor Form & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          
          {/* Smart Crop Doctor Interactive Form Trigger */}
          {onOpenDoctorForm && (
            <button
              onClick={onOpenDoctorForm}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-400/40"
              title="Open Smart Crop Doctor Diagnostic Form"
            >
              <span className="material-symbols-outlined text-[16px]">stethoscope</span>
              <span className="hidden sm:inline">Doctor Form</span>
            </button>
          )}

          {/* Language Switcher Pill */}
          <button
            id="header-lang-toggle"
            onClick={onToggleLanguage}
            aria-label="Language Toggle"
            className="flex items-center bg-surface-container-high rounded-full p-0.5 h-8 min-w-[56px] text-center focus:outline-none transition-transform active:scale-95 cursor-pointer border border-outline-variant/30"
          >
            <span
              className={`flex-1 py-0.5 px-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeLang === 'Marathi'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              म
            </span>
            <span
              className={`flex-1 py-0.5 px-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeLang === 'English'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              EN
            </span>
          </button>

          {/* Hands-Free Voice Assistant Button */}
          {onToggleVoiceListening && (
            <button
              id="header-voice-btn"
              onClick={onToggleVoiceListening}
              onContextMenu={(e) => {
                e.preventDefault();
                onOpenVoiceAssistant?.();
              }}
              className={`relative p-2 rounded-full active:scale-95 transition-all shadow-sm cursor-pointer ${
                isVoiceListening
                  ? 'bg-rose-600 text-white ring-2 ring-emerald-400'
                  : 'bg-surface-container hover:bg-surface-container-high text-primary'
              }`}
              title={
                isVoiceListening
                  ? 'Voice Assistant Active (Listening) - Click to Pause'
                  : 'Hands-Free Field Voice Assistant - Click to Start'
              }
              aria-label="Field Voice Assistant"
            >
              <span
                className="material-symbols-outlined text-[19px]"
                style={{ fontVariationSettings: isVoiceListening ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isVoiceListening ? 'mic' : 'mic_none'}
              </span>
              {isVoiceListening && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          )}

          {/* Push Alert Simulation & Notification Bell */}
          {onOpenAlertSimulation && (
            <button
              id="header-alerts-btn"
              onClick={onOpenAlertSimulation}
              className="relative p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Push Notification Alerts & Detection Thresholds"
              aria-label="Alerts and notifications"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold ring-2 ring-white animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* More Tools Menu Button */}
          {onOpenMoreTools && (
            <button
              onClick={onOpenMoreTools}
              className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Agricultural Datasets & Extended Tools"
            >
              <span className="material-symbols-outlined text-[19px]">grid_view</span>
            </button>
          )}

          {/* Tour Guide Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-bold active:scale-95 transition-all cursor-pointer"
              title="Interactive Platform Tour"
            >
              <span className="material-symbols-outlined text-[15px]">help_outline</span>
              <span>Tour</span>
            </button>
          )}

          {/* Profile Avatar */}
          <div className="relative flex items-center justify-center pl-1">
            <img
              alt="Farmer Profile"
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-emerald-500/40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx5s79ZlsLi-Fw125hCClBqJNa_DBZkso6jO2sUtPHrsUubek-SUZ1N6be4PLj2bBeuKTA3hBnPaassyopD70tvF41W-HcMYB3wS_uJnmabOq6XU3KJ20YVG5pzm0m8l2SXhGLvaTiCcPOozqpOx9zU3_MVX_UmdhON5ybt5xALWjE1ec301Ksa5Hf7r3gLJtjKMt78LVS6QG9l5F3TrpWxE11ojRGVf9Ba9PMK-Ah01Ukog7k2y-k"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
