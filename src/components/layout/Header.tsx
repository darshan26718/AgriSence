import React from 'react';
import {
  Menu,
  Sparkles,
  ScanSearch,
  Languages,
  ShieldAlert,
  Leaf,
  Camera,
} from 'lucide-react';
import { NavView } from './Sidebar';

interface HeaderProps {
  activeView: NavView;
  setActiveView?: (view: NavView) => void;
  onOpenSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  onLaunchDemoTour?: () => void;
  onOpenTour?: () => void;
  onOpenLiveCamera?: () => void;
  currentLanguage: 'English' | 'Hindi';
  setCurrentLanguage: (lang: 'English' | 'Hindi') => void;
  criticalAlertCount?: number;
}

const VIEW_TITLES: Record<NavView, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Smart Agriculture Dashboard',
    subtitle: 'Real-time crop health monitoring, infestation KPIs, and field analytics',
  },
  monitoring: {
    title: 'Crop Health Monitoring',
    subtitle: 'Evaluate crop vigor, chlorophyll proxy, and field health scores',
  },
  'disease-detect': {
    title: 'AI Crop Disease Detection',
    subtitle: 'Deep computer vision leaf diagnostic pipeline with severity estimation',
  },
  'pest-detect': {
    title: 'AI Pest Identification & Scouting',
    subtitle: 'Identify damaging insect pests, life stages, and economic thresholds (ETL)',
  },
  'early-warning': {
    title: 'Early Warning & Risk Matrix',
    subtitle: 'Dynamic agro-climatic simulation and microclimate spore germination alerts',
  },
  'ml-prediction': {
    title: 'AI/ML Risk Prediction & Explainable AI',
    subtitle: 'Feature importance SHAP attribution, counterfactuals, and confidence scoring',
  },
  'smart-management': {
    title: 'Smart Management & IPM Recommendations',
    subtitle: 'Immediate biological solutions, cultural practices, and IPM guidelines',
  },
  'farmer-advisor': {
    title: 'Farmer Advisor (Multilingual Action Plan)',
    subtitle: 'Plain-language step-by-step guidance tailored for rural field execution',
  },
  'crop-db': {
    title: 'Crop Information Repository',
    subtitle: 'Agronomic profiles, phenology, vulnerable stages, and management for 10 crops',
  },
  'disease-db': {
    title: 'Crop Disease Database',
    subtitle: 'Directory of fungal, bacterial, and viral crop pathogens with visual traits',
  },
  'pest-db': {
    title: 'Agricultural Pest Database',
    subtitle: 'Taxonomic reference, biological predators, and threshold criteria',
  },
  'field-management': {
    title: 'Farm & Field Management',
    subtitle: 'Monitor individual farm plots, acreages, varieties, and scheduled actions',
  },
  'detection-history': {
    title: 'Detection History & Audit Trail',
    subtitle: 'Historical archive of leaf inspections, diagnoses, and treatments applied',
  },
  analytics: {
    title: 'Agricultural Analytics & Trends',
    subtitle: 'Seasonal disease spread curves, severity breakdown, and recovery benchmarks',
  },
  'weather-analysis': {
    title: 'Weather & Infestation Dynamics',
    subtitle: 'Empirical correlation analysis between humidity, temperature, and epidemics',
  },
  reports: {
    title: 'Advisory Report Generation',
    subtitle: 'Generate professional SIH-compliant crop protection advisory reports (PDF/Print)',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenSidebar,
  onToggleMobileMenu,
  onLaunchDemoTour,
  onOpenTour,
  onOpenLiveCamera,
  currentLanguage,
  setCurrentLanguage,
  criticalAlertCount = 0,
}) => {
  const meta = VIEW_TITLES[activeView] || {
    title: 'Smart Agriculture Platform',
    subtitle: 'Crop & Pest Infestation Management',
  };

  const handleSidebarClick = () => {
    if (typeof onOpenSidebar === 'function') {
      onOpenSidebar();
    } else if (typeof onToggleMobileMenu === 'function') {
      onToggleMobileMenu();
    }
  };

  const handleTourClick = () => {
    if (typeof onLaunchDemoTour === 'function') {
      onLaunchDemoTour();
    } else if (typeof onOpenTour === 'function') {
      onOpenTour();
    }
  };

  const handleNavClick = (view: NavView) => {
    if (typeof setActiveView === 'function') {
      setActiveView(view);
    }
  };

  return (
    <header
      id="top-navigation-header"
      className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="open-sidebar-btn"
          onClick={handleSidebarClick}
          className="p-2 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 lg:hidden focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate flex items-center gap-2">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-400 truncate hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Critical Alerts Banner Pill */}
        {criticalAlertCount > 0 && (
          <button
            id="header-alerts-btn"
            onClick={() => handleNavClick('early-warning')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/25 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>{criticalAlertCount} Critical Alerts</span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          id="toggle-language-btn"
          onClick={() => setCurrentLanguage(currentLanguage === 'English' ? 'Hindi' : 'English')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
          title="Switch advisory language"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{currentLanguage === 'English' ? 'English' : 'हिंदी'}</span>
          <span className="sm:hidden">{currentLanguage === 'English' ? 'EN' : 'HI'}</span>
        </button>

        {/* Quick Live Camera Button */}
        <button
          id="header-live-cam-btn"
          onClick={() => {
            if (onOpenLiveCamera) {
              onOpenLiveCamera();
            } else {
              handleNavClick('disease-detect');
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all hover:border-emerald-300"
          title="Open Field Camera Scanner"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Camera</span>
        </button>

        {/* Quick Detect Button */}
        <button
          id="header-quick-detect-btn"
          onClick={() => handleNavClick('disease-detect')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all hover:border-slate-600"
        >
          <ScanSearch className="w-3.5 h-3.5" />
          <span>Detect Disease</span>
        </button>

        {/* Launch SIH Tour */}
        <button
          id="header-launch-sih-tour-btn"
          onClick={handleTourClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden sm:inline">SIH 10-Step Flow</span>
          <span className="sm:hidden">SIH Flow</span>
        </button>
      </div>
    </header>
  );
};
