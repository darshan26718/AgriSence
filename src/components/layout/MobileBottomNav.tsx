import React from 'react';
import {
  Home,
  CloudSun,
  Camera,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';
import { AppLanguage, getLocale } from '../../locales';
import { ModernNavTab } from './ModernSidebar';

interface MobileBottomNavProps {
  activeTab: ModernNavTab;
  onSelectTab: (tab: ModernNavTab) => void;
  language?: AppLanguage;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  language = 'en',
}) => {
  const labels = {
    hi: {
      home: 'होम',
      weather: 'मौसम',
      scan: 'रोग जांचें',
      advisory: 'एआई सलाह',
      risk: 'चेतावनी',
      profile: 'प्रोफाइल',
    },
    kn: {
      home: 'ಮುಖಪುಟ',
      weather: 'ಹವಾಮಾನ',
      scan: 'ಪರೀಕ್ಷಿಸಿ',
      advisory: 'ಸಲಹೆ',
      risk: 'ಎಚ್ಚರಿಕೆ',
      profile: 'ಪ್ರೊಫೈಲ್',
    },
    te: {
      home: 'హోమ్',
      weather: 'వాతావరణం',
      scan: 'పరీక్షించండి',
      advisory: 'సలహా',
      risk: 'హెచ్చరిక',
      profile: 'ప్రొఫైల్',
    },
    en: {
      home: 'Home',
      weather: 'Weather',
      scan: 'Scan Leaf',
      advisory: 'Advisory',
      risk: 'Risk Radar',
      profile: 'Profile',
    },
  };

  const l = labels[language] || labels.en;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto relative">
        
        {/* TAB 1: HOME */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'dashboard' || activeTab === 'home'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 leading-tight tracking-tight font-medium">
            {l.home}
          </span>
        </button>

        {/* TAB 2: WEATHER */}
        <button
          onClick={() => onSelectTab('weather')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'weather'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CloudSun className={`w-5 h-5 ${activeTab === 'weather' ? 'text-amber-500 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 leading-tight tracking-tight font-medium">
            {l.weather}
          </span>
        </button>

        {/* TAB 3: ELEVATED CENTER SCAN CAMERA BUTTON */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => onSelectTab('ai-scan')}
            className="flex flex-col items-center group cursor-pointer"
            aria-label="Scan Crop Leaf"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              activeTab === 'ai-scan'
                ? 'bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white ring-4 ring-emerald-100 scale-110 shadow-emerald-700/40'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white shadow-emerald-700/30 group-active:scale-95'
            }`}>
              <Camera className="w-7 h-7 animate-pulse" />
            </div>
            <span className={`text-[10px] mt-1 font-extrabold ${
              activeTab === 'ai-scan' ? 'text-emerald-800 font-black' : 'text-slate-700'
            }`}>
              {l.scan}
            </span>
          </button>
        </div>

        {/* TAB 4: ADVISORY / RISK */}
        <button
          onClick={() => onSelectTab('advisory')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'advisory'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className={`w-5 h-5 ${activeTab === 'advisory' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 leading-tight tracking-tight font-medium">
            {l.advisory}
          </span>
        </button>

        {/* TAB 5: PROFILE */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-emerald-700 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 leading-tight tracking-tight font-medium">
            {l.profile}
          </span>
        </button>

      </div>
    </nav>
  );
};
