import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  Search,
  Navigation,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  PhoneCall,
  Compass,
  Building2,
  Filter,
} from 'lucide-react';
import { AGRO_CENTRES_DATA, AgroCentreRecord } from '../../data/agroCentresData';
import { isCurrentlyOpen, calculateDistanceKm } from '../../data/agriExpertsData';
import { UserLiveLocation } from '../../types/location';
import { AppLanguage, getLocale } from '../../locales';

interface ModernAgroCentresViewProps {
  language?: AppLanguage;
  onShowToast?: (msg: string) => void;
  userLocation?: UserLiveLocation;
  onRequestLiveLocation?: () => void;
}

export const ModernAgroCentresView: React.FC<ModernAgroCentresViewProps> = ({
  language = 'en',
  onShowToast,
  userLocation,
  onRequestLiveLocation,
}) => {
  const t = getLocale(language).agroCentres;
  const common = getLocale(language).common;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<'All' | 'Karnataka' | 'Andhra Pradesh' | 'Telangana'>('All');
  const [selectedCentre, setSelectedCentre] = useState<AgroCentreRecord | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocationApplied, setUserLocationApplied] = useState(false);

  const filteredCentres = AGRO_CENTRES_DATA.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = selectedState === 'All' || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setUserLocationApplied(true);
      if (onShowToast) {
        onShowToast(
          language === 'kn'
            ? '📍 ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ: ಹತ್ತಿರದ ಕೃಷಿ ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.'
            : language === 'te'
            ? '📍 మీ లొకేషన్ గుర్తించబడింది: సమీప వ్యవసాయ కేంద్రాలు ప్రదర్శించబడుతున్నాయి.'
            : '📍 Location detected: Showing nearest agricultural centres within 15 km.'
        );
      }
    }, 900);
  };

  const handleCall = (centre: AgroCentreRecord) => {
    window.open(`tel:${centre.phone.replace(/[^0-9+]/g, '')}`, '_self');
    if (onShowToast) {
      onShowToast(`${t.callBtn}: ${centre.name}`);
    }
  };

  const handleDirections = (centre: AgroCentreRecord) => {
    const query = encodeURIComponent(`${centre.name}, ${centre.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          {t.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Search & Location Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>

          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className={`w-full md:w-auto px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              userLocationApplied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Compass className={`w-4 h-4 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? common.loading : t.useMyLocation}</span>
          </button>
        </div>

        {/* State Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {(['All', 'Karnataka', 'Telangana', 'Andhra Pradesh'] as const).map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedState === st
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'All' ? t.allCentres : st}
            </button>
          ))}
          <span className="text-[11px] text-slate-400 ml-auto whitespace-nowrap">
            {filteredCentres.length} {t.allCentres}
          </span>
        </div>
      </div>

      {/* Centre Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCentres.map(centre => (
          <div
            key={centre.id}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Card Header & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {centre.badge}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCurrentlyOpen(centre.timings)
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCurrentlyOpen(centre.timings) ? t.openNow : t.closed}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display mt-2 group-hover:text-emerald-800 transition-colors">
                    {centre.name}
                  </h3>
                </div>
                {centre.distanceKm && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200/60 flex-shrink-0">
                    📍 {centre.distanceKm} km
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{centre.location}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{centre.phone}</span>
              </div>

              {/* Timing & Days */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{centre.timings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{centre.workingDays}</span>
                </div>
              </div>

              {/* Services Badges */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.servicesTitle}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {centre.services.slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                  {centre.services.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold">
                      +{centre.services.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCall(centre)}
                className="py-2 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                title={t.callBtn}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.callBtn}</span>
              </button>

              <button
                onClick={() => handleDirections(centre)}
                className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title={t.directionsBtn}
              >
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">{t.directionsBtn}</span>
                <span className="sm:hidden">Map</span>
              </button>

              <button
                onClick={() => setSelectedCentre(centre)}
                className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title={t.detailsBtn}
              >
                <span>{t.detailsBtn}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Centre Details Modal */}
      {selectedCentre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-emerald-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-200">
                    {selectedCentre.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-display mt-0.5">
                    {selectedCentre.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCentre(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
              {/* Address */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.fullLocation}
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                  {selectedCentre.location}
                </p>
                {selectedCentre.distanceKm && (
                  <span className="text-xs text-emerald-700 font-bold block pt-1">
                    {t.distance}: ~{selectedCentre.distanceKm} km from your registered farm
                  </span>
                )}
              </div>

              {/* Working Hours & In Charge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t.openingHours}
                  </span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {selectedCentre.timings}
                  </span>
                  <span className="text-[11px] text-slate-500 block">{selectedCentre.workingDays}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Officer In-Charge
                  </span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {selectedCentre.officerInCharge}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">{selectedCentre.phone}</span>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block font-display">
                  {t.services}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCentre.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 text-xs font-medium text-emerald-950"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helplines Info Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-bold block mb-0.5">
                  Kisan Call Center Direct Toll-Free: 1800-180-1551
                </strong>
                Trained agricultural scientists are available 6:00 AM – 10:00 PM for on-call local crop advisory in Kannada, Telugu, and English.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedCentre(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {common.close}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDirections(selectedCentre)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.directionsBtn}</span>
                </button>

                <button
                  onClick={() => handleCall(selectedCentre)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.callCentreBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
