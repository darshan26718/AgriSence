import React from 'react';
import {
  Home,
  LayoutDashboard,
  ScanSearch,
  MapPin,
  Activity,
  CloudSun,
  Building2,
  GraduationCap,
  Sparkles,
  FileText,
  Users,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sprout,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { AppLanguage, getLocale } from '../../locales';

export type ModernNavTab =
  | 'home'
  | 'dashboard'
  | 'early-warning'
  | 'ai-scan'
  | 'fields'
  | 'crop-health'
  | 'weather'
  | 'agro-centres'
  | 'agri-experts'
  | 'advisory'
  | 'reports'
  | 'community'
  | 'settings'
  | 'profile';

interface ModernSidebarProps {
  activeTab: ModernNavTab;
  onSelectTab: (tab: ModernNavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
  language?: AppLanguage;
  currentUser?: { name: string; phone: string; district?: string } | null;
  onLogout?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  unreadCount = 0,
  language = 'en',
  currentUser,
  onLogout,
}) => {
  const t = getLocale(language).sidebar;

  const mainNavItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'early-warning', label: 'Risk Intelligence', icon: ShieldAlert, badge: '3-7D' },
    { id: 'ai-scan', label: t.aiCropScan, icon: ScanSearch, badge: 'AI' },
    { id: 'fields', label: t.myFields, icon: MapPin },
    { id: 'crop-health', label: t.cropHealth, icon: Activity },
    { id: 'weather', label: t.weatherCropGuide, icon: CloudSun },
    { id: 'agro-centres', label: t.agroCentres, icon: Building2 },
    { id: 'agri-experts', label: t.agriExperts, icon: GraduationCap },
    { id: 'advisory', label: t.aiAdvisory, icon: Sparkles },
    { id: 'reports', label: t.reports, icon: FileText },
    { id: 'community', label: t.community, icon: Users },
  ] as const;


  const bottomNavItems = [
    { id: 'settings', label: t.settings, icon: Settings },
    { id: 'profile', label: t.profile, icon: User },
  ] as const;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs shadow-emerald-900/10">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none font-display">
                AgriSense
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                AI Farming Assistant
              </span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {!isCollapsed ? 'Navigation' : '•••'}
        </div>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ModernNavTab)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs shadow-emerald-800/15'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {!isCollapsed && (
                <span className="truncate flex-1 font-semibold">{item.label}</span>
              )}
              {!isCollapsed && (item as any).badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {(item as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Preferences / Profile */}
      <div className="p-3 border-t border-slate-100 space-y-1 flex-shrink-0 bg-slate-50/50">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ModernNavTab)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
            </button>
          );
        })}

        {/* Active Logged-in Farmer Info & Sign Out */}
        {currentUser && (
          <div className={`pt-2 mt-1 border-t border-slate-200/60 ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-300 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                      {currentUser.district ? currentUser.district.split(',')[0] : 'Farmer Member'}
                    </span>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sign Out / Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              onLogout && (
                <button
                  onClick={onLogout}
                  className="w-9 h-9 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                  title={`Sign out (${currentUser.name})`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
