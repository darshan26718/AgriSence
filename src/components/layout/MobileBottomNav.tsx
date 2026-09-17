import React from 'react';
import { LayoutDashboard, ScanSearch, MapPin, CloudSun, Building2, GraduationCap, User } from 'lucide-react';
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
  const t = getLocale(language).sidebar;

  const tabs = [
    { id: 'dashboard', label: t.home, icon: LayoutDashboard },
    { id: 'ai-scan', label: 'Scan', icon: ScanSearch },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'agro-centres', label: 'Centres', icon: Building2 },
    { id: 'agri-experts', label: 'Doctors', icon: GraduationCap },
    { id: 'profile', label: t.profile, icon: User },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 shadow-lg select-none">
      <div className="flex justify-around items-center h-14">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as ModernNavTab)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span className="text-[10px] mt-0.5 leading-none truncate max-w-[56px] text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
