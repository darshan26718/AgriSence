import React from 'react';

export type StitchTab = 'home' | 'advisory' | 'ai-scan' | 'radar' | 'officers';

interface StitchBottomNavProps {
  activeTab: StitchTab;
  onSelectTab: (tab: StitchTab) => void;
  onOpenDoctorForm?: () => void;
}

export const StitchBottomNav: React.FC<StitchBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenDoctorForm,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none pb-safe">
      <nav
        className="pointer-events-auto max-w-lg w-full glass-pill rounded-full px-2 py-1.5 shadow-[0_12px_36px_rgba(6,78,59,0.22)] border border-emerald-500/30 flex items-center justify-around transition-all duration-300"
        aria-label="Bottom Navigation Dock"
      >
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
          data-path="home"
        >
          <span
            className="material-symbols-outlined text-[21px]"
            style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            potted_plant
          </span>
          <span className="text-[10px] font-medium leading-none mt-0.5">Home</span>
        </button>

        {/* Tab 2: Advisory */}
        <button
          onClick={() => onSelectTab('advisory')}
          aria-current={activeTab === 'advisory' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
          data-path="advisory"
        >
          <span
            className="material-symbols-outlined text-[21px]"
            style={{ fontVariationSettings: activeTab === 'advisory' ? "'FILL' 1" : "'FILL' 0" }}
          >
            assignment
          </span>
          <span className="text-[10px] font-medium leading-none mt-0.5">Advisory</span>
        </button>

        {/* Tab 3: Center Elevated AI Scanner Button */}
        <div className="relative -top-3 flex flex-col items-center justify-center mx-1">
          <button
            onClick={() => onSelectTab('ai-scan')}
            aria-label="Launch AI Scanner"
            className={`w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(5,150,105,0.45)] ring-4 ring-white/90 active:scale-90 hover:scale-105 transition-all duration-300 cursor-pointer ${
              activeTab === 'ai-scan' ? 'ring-emerald-400 ring-offset-2' : ''
            }`}
            data-path="ai-scan"
          >
            <span
              className="material-symbols-outlined text-[26px] animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              center_focus_strong
            </span>
          </button>
          <span
            className={`text-[10px] font-bold mt-0.5 leading-none ${
              activeTab === 'ai-scan' ? 'text-emerald-700' : 'text-emerald-800'
            }`}
          >
            AI Scan
          </span>
        </div>

        {/* Tab 4: Outbreak Radar */}
        <button
          onClick={() => onSelectTab('radar')}
          aria-current={activeTab === 'radar' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
          data-path="radar"
        >
          <span
            className="material-symbols-outlined text-[21px]"
            style={{ fontVariationSettings: activeTab === 'radar' ? "'FILL' 1" : "'FILL' 0" }}
          >
            radar
          </span>
          <span className="text-[10px] font-medium leading-none mt-0.5">Radar</span>
        </button>

        {/* Tab 5: Officers */}
        <button
          onClick={() => onSelectTab('officers')}
          aria-current={activeTab === 'officers' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'officers'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-on-surface-variant hover:text-emerald-700 hover:bg-emerald-50/50'
          }`}
          data-path="officer-profile"
        >
          <span
            className="material-symbols-outlined text-[21px]"
            style={{ fontVariationSettings: activeTab === 'officers' ? "'FILL' 1" : "'FILL' 0" }}
          >
            badge
          </span>
          <span className="text-[10px] font-medium leading-none mt-0.5">Officers</span>
        </button>
      </nav>
    </div>
  );
};
