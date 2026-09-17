import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ScanSearch,
  Bug,
  AlertTriangle,
  BrainCircuit,
  ShieldCheck,
  UserCheck,
  Wheat,
  Stethoscope,
  Compass,
  History,
  BarChart3,
  CloudSun,
  FileText,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'monitoring'
  | 'disease-detect'
  | 'pest-detect'
  | 'early-warning'
  | 'ml-prediction'
  | 'smart-management'
  | 'farmer-advisor'
  | 'crop-db'
  | 'disease-db'
  | 'pest-db'
  | 'field-management'
  | 'detection-history'
  | 'analytics'
  | 'weather-analysis'
  | 'reports';

interface SidebarProps {
  activeView: NavView;
  setActiveView?: (view: NavView) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  onLaunchDemoTour?: () => void;
  onOpenTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
  onLaunchDemoTour,
  onOpenTour,
}) => {
  const effectiveOpen = Boolean(isOpen ?? isMobileOpen);

  const closeSidebar = () => {
    if (typeof setIsOpen === 'function') setIsOpen(false);
    if (typeof setIsMobileOpen === 'function') setIsMobileOpen(false);
  };

  const handleNavClick = (view: NavView) => {
    if (typeof setActiveView === 'function') {
      setActiveView(view);
    }
    closeSidebar();
  };

  const handleTourClick = () => {
    if (typeof onLaunchDemoTour === 'function') {
      onLaunchDemoTour();
    } else if (typeof onOpenTour === 'function') {
      onOpenTour();
    }
    closeSidebar();
  };
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard' as NavView, label: 'Dashboard & KPIs', icon: LayoutDashboard, badge: null },
        { id: 'monitoring' as NavView, label: 'Crop Health Monitor', icon: Activity, badge: 'Live' },
        { id: 'early-warning' as NavView, label: 'Early Warning System', icon: AlertTriangle, badge: 'Alert' },
      ],
    },
    {
      title: 'AI DIAGNOSTICS & VISION',
      items: [
        { id: 'disease-detect' as NavView, label: 'AI Disease Detection', icon: ScanSearch, badge: 'CV' },
        { id: 'pest-detect' as NavView, label: 'AI Pest Identification', icon: Bug, badge: 'CV' },
        { id: 'ml-prediction' as NavView, label: 'ML Risk & Explainable AI', icon: BrainCircuit, badge: 'XAI' },
      ],
    },
    {
      title: 'ADVISORY & ACTION',
      items: [
        { id: 'smart-management' as NavView, label: 'Smart Management & IPM', icon: ShieldCheck, badge: null },
        { id: 'farmer-advisor' as NavView, label: 'Farmer Advisor (Multilingual)', icon: UserCheck, badge: 'Voice' },
        { id: 'field-management' as NavView, label: 'Farm / Field Plots', icon: Compass, badge: null },
      ],
    },
    {
      title: 'KNOWLEDGE REPOSITORY',
      items: [
        { id: 'crop-db' as NavView, label: 'Crop Information', icon: Wheat, badge: '10 Crops' },
        { id: 'disease-db' as NavView, label: 'Disease Database', icon: Stethoscope, badge: null },
        { id: 'pest-db' as NavView, label: 'Pest Database', icon: Bug, badge: null },
      ],
    },
    {
      title: 'ANALYTICS & REPORTING',
      items: [
        { id: 'analytics' as NavView, label: 'Agricultural Analytics', icon: BarChart3, badge: null },
        { id: 'weather-analysis' as NavView, label: 'Weather vs Infestation', icon: CloudSun, badge: 'Corr' },
        { id: 'detection-history' as NavView, label: 'Detection History', icon: History, badge: null },
        { id: 'reports' as NavView, label: 'Advisory Report Gen', icon: FileText, badge: 'Export' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {effectiveOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          effectiveOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <span className="text-xl leading-none">🌱</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                CropGuard AI
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIH
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Early Detection & Management</div>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick SIH Demo Guided Flow Button */}
        <div className="px-3 pt-3">
          <button
            id="sih-guided-flow-btn"
            onClick={handleTourClick}
            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-left text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1">
                    SIH Demo Journey
                  </div>
                  <div className="text-[10px] text-emerald-100">End-to-end 10-step flow</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all text-left ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-wide ${
                          isActive
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* System & Mode Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Local Dataset Active
            </span>
            <span className="font-mono text-[10px] text-slate-400">v1.4 Offline</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 leading-tight">
            Built-in AI models • Zero external API keys needed
          </p>
        </div>
      </aside>
    </>
  );
};
