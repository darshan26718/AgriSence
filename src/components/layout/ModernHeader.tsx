import React, { useState } from 'react';
import {
  CloudSun,
  Bell,
  Globe,
  Mic,
  ChevronDown,
  Search,
  Sprout,
  User,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { AppLanguage, AVAILABLE_LANGUAGES, getLocale } from '../../locales';

interface ModernHeaderProps {
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onOpenNotifications: () => void;
  unreadAlertCount: number;
  onNavigateToProfile: () => void;
  onOpenSignIn?: () => void;
  onLogout?: () => void;
  currentUser?: { name: string; phone: string } | null;
  weatherTemp?: string;
  isVoiceListening?: boolean;
  onOpenVoiceAssistant?: () => void;
  onSearchSubmit?: (query: string) => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  language,
  onSelectLanguage,
  onOpenNotifications,
  unreadAlertCount,
  onNavigateToProfile,
  onOpenSignIn,
  onLogout,
  currentUser,
  weatherTemp = '31°C',
  isVoiceListening = false,
  onOpenVoiceAssistant,
  onSearchSubmit,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = getLocale(language).header;

  const currentLangObj =
    AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 transition-all select-none">
      {/* LEFT: AgriSense Logo + Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shadow-emerald-900/10">
          <Sprout className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight font-display tracking-tight truncate">
            {t.title}
          </span>
          <span className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
            {t.subtitle}
          </span>
        </div>
      </div>

      {/* CENTER: AI Search Box */}
      <div className="flex-1 max-w-lg mx-2 hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-700 text-white cursor-pointer"
            >
              Ask
            </button>
          )}
        </form>
      </div>

      {/* RIGHT: Weather, Language, Voice, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Weather Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>{weatherTemp} Partly Sunny</span>
        </div>

        {/* Voice Assistant Header Trigger */}
        {onOpenVoiceAssistant && (
          <button
            onClick={onOpenVoiceAssistant}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              isVoiceListening
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60'
            }`}
            title="Hands-Free Field Voice Assistant"
          >
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {isVoiceListening && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-emerald-600' : 'text-slate-600'}`} />
            </span>
            <span className="hidden xl:inline">Voice</span>
          </button>
        )}

        {/* Language Selector: 🌐 English ▼ (English / ಕನ್ನಡ / తెలుగు) */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            title="Switch Language (English / ಕನ್ನಡ / తెలుగు)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isLangMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLangMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Language
                </div>
                {AVAILABLE_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLanguage(l.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                      language === l.code
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      {l.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={t.notifications}
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Profile Avatar / Sign In */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title={`${t.profile} - ${currentUser.name}`}
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[110px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 space-y-1 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {currentUser.phone}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateToProfile();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Farmer Profile & Fields</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out / Logout</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenSignIn || onNavigateToProfile}
            className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.signIn}</span>
          </button>
        )}
      </div>
    </header>
  );
};
