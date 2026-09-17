import React, { useState } from 'react';
import {
  UserCheck,
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
  Filter,
  GraduationCap,
  Sparkles,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Video,
  Send,
  Lock,
} from 'lucide-react';
import {
  AGRI_EXPERTS_DATA,
  AgriExpertRecord,
  calculateDistanceKm,
} from '../../data/agriExpertsData';
import { AGRO_CENTRES_DATA } from '../../data/agroCentresData';
import { LiveLocationMap } from '../common/LiveLocationMap';
import { UserLiveLocation } from '../../types/location';
import { AppLanguage, getLocale } from '../../locales';

interface ModernAgriDoctorsViewProps {
  language?: AppLanguage;
  onShowToast?: (msg: string) => void;
  userLocation?: UserLiveLocation;
  onRequestLiveLocation?: () => void;
}

export const ModernAgriDoctorsView: React.FC<ModernAgriDoctorsViewProps> = ({
  language = 'en',
  onShowToast,
  userLocation,
  onRequestLiveLocation,
}) => {
  const t = getLocale(language).agriExperts;
  const locT = getLocale(language).liveLocation;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'disease' | 'entomology' | 'soil' | 'horticulture'
  >('all');
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<AgriExpertRecord | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingCrop, setBookingCrop] = useState<string>('Tomato');
  const [bookingDate, setBookingDate] = useState<string>('2026-09-22');
  const [bookingTime, setBookingTime] = useState<string>('10:30 AM');
  const [bookingNotes, setBookingNotes] = useState<string>('');

  // Internal location state if not supplied from parent
  const [internalLocation, setInternalLocation] = useState<UserLiveLocation>({
    status: 'idle',
    coords: null,
  });

  const activeLocation = userLocation || internalLocation;

  const handleRequestLocation = () => {
    if (onRequestLiveLocation) {
      onRequestLiveLocation();
      return;
    }

    if (!navigator.geolocation) {
      setInternalLocation({
        status: 'unavailable',
        coords: null,
        errorMessage: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setInternalLocation(prev => ({ ...prev, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setInternalLocation({
          status: 'enabled',
          coords,
          approxAddress: `Lat ${coords.lat.toFixed(3)}, Lng ${coords.lng.toFixed(3)} (Karnataka/Telangana Agricultural Zone)`,
          accuracyMeters: pos.coords.accuracy,
          timestamp: Date.now(),
        });
        if (onShowToast) {
          onShowToast(locT.currentLocationDetected);
        }
      },
      err => {
        const status = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
        setInternalLocation({
          status,
          coords: null,
          errorMessage: err.message,
        });
        if (onShowToast) {
          onShowToast(status === 'denied' ? locT.locationDenied : locT.locationUnavailable);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Compute live distances if coordinates are enabled
  const expertsWithDistances = AGRI_EXPERTS_DATA.map(exp => {
    if (activeLocation.coords) {
      const dist = calculateDistanceKm(
        activeLocation.coords.lat,
        activeLocation.coords.lng,
        exp.coordinates.lat,
        exp.coordinates.lng
      );
      return { ...exp, distanceKm: dist };
    }
    return exp;
  });

  const agroCentresWithDistances = AGRO_CENTRES_DATA.map(centre => {
    if (activeLocation.coords) {
      const dist = calculateDistanceKm(
        activeLocation.coords.lat,
        activeLocation.coords.lng,
        centre.coordinates.lat,
        centre.coordinates.lng
      );
      return { ...centre, distanceKm: dist };
    }
    return centre;
  });

  // Filter and sort experts
  const filteredExperts = expertsWithDistances
    .filter(exp => {
      const matchesSearch =
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        exp.diseasesSupported.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || exp.category === selectedCategory;

      const matchesAvail = !availabilityOnly || exp.availability === 'available';

      return matchesSearch && matchesCat && matchesAvail;
    })
    .sort((a, b) => {
      if (activeLocation.coords && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return a.availability === 'available' ? -1 : 1;
    });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingOpen(false);
    if (onShowToast && selectedExpert) {
      onShowToast(
        `${t.bookingSuccess}: ${selectedExpert.name} for ${bookingCrop} on ${bookingDate} at ${bookingTime}.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {t.title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          {t.subtitle}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.notice}</span>
        </div>
      </div>

      {/* Live Location Action & Status Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                activeLocation.status === 'enabled'
                  ? 'bg-emerald-100 text-emerald-700'
                  : activeLocation.status === 'denied'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Navigation
                className={`w-5 h-5 ${
                  activeLocation.status === 'requesting' ? 'animate-spin' : ''
                }`}
              />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                {activeLocation.status === 'enabled'
                  ? locT.locationEnabled
                  : activeLocation.status === 'denied'
                  ? locT.locationDenied
                  : activeLocation.status === 'unavailable'
                  ? locT.locationUnavailable
                  : activeLocation.status === 'requesting'
                  ? locT.updatingLocation
                  : locT.locationTurnedOff}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeLocation.status === 'enabled'
                  ? activeLocation.approxAddress || locT.currentLocationDetected
                  : activeLocation.status === 'denied'
                  ? locT.enableInSettings
                  : locT.permissionRequest}
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestLocation}
            disabled={activeLocation.status === 'requesting'}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Navigation className="w-4 h-4" />
            <span>
              {activeLocation.status === 'enabled'
                ? 'Refresh Live Location'
                : activeLocation.status === 'denied' || activeLocation.status === 'unavailable'
                ? locT.tryAgain
                : locT.useLiveLocation}
            </span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>{locT.privacyNotice}</span>
        </div>
      </div>

      {/* Interactive Agricultural GIS Map */}
      <LiveLocationMap
        userCoords={activeLocation.coords}
        approxLocationName={activeLocation.approxAddress}
        agroCentres={agroCentresWithDistances}
        agriExperts={expertsWithDistances}
        onSelectExpert={exp => setSelectedExpert(exp)}
        language={language}
        onRefreshLocation={handleRequestLocation}
      />

      {/* Search and Category Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setAvailabilityOnly(!availabilityOnly)}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              availabilityOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                availabilityOnly ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'
              }`}
            ></span>
            <span>{t.filterAvailable}</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: t.filterAll },
            { id: 'disease', label: t.filterDisease },
            { id: 'entomology', label: t.filterPest },
            { id: 'soil', label: t.filterSoil },
            { id: 'horticulture', label: 'Horticulture & Organic' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experts Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
            {activeLocation.coords ? locT.nearbyExperts : t.title}
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {filteredExperts.length} Specialists Available
          </span>
        </div>

        {filteredExperts.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-6 flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No experts found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Try changing your search query or reset filters to view all available agricultural doctors.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setAvailabilityOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExperts.map(exp => {
              const isAvail = exp.availability === 'available';
              return (
                <div
                  key={exp.id}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Avatar, Name, Status */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={exp.avatar}
                          alt={exp.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-emerald-200 transition-all"
                        />
                        <span
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                            isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                          title={isAvail ? t.availableNow : t.currentlyOffline}
                        ></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvail
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAvail ? 'bg-emerald-600' : 'bg-slate-400'
                              }`}
                            ></span>
                            <span>{isAvail ? t.availableNow : t.currentlyOffline}</span>
                          </span>
                          {exp.distanceKm !== undefined && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                              📍 {exp.distanceKm} km
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1 font-display truncate">
                          {exp.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-emerald-700 truncate">
                          {exp.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Specialization & Experience */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="font-bold text-slate-800 line-clamp-1">
                        {exp.specialization}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {exp.experience} • {exp.institute}
                      </div>
                    </div>

                    {/* Crops Supported */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        {t.cropsSupported}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {exp.crops.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location & Timings */}
                    <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{exp.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{exp.consultationTiming}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          Languages: {exp.languages.join(' • ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExpert(exp)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      {t.viewProfileBtn}
                    </button>
                    <a
                      href={`tel:${exp.phone}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Call expert"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.callBtn}</span>
                    </a>
                    <button
                      onClick={() => {
                        setSelectedExpert(exp);
                        setIsBookingOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                      title="Book consultation"
                    >
                      {t.bookConsultationBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Expert Profile Modal */}
      {selectedExpert && !isBookingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedExpert.avatar}
                  alt={selectedExpert.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-200 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedExpert.availability === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedExpert.availability === 'available'
                            ? 'bg-emerald-600 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      <span>
                        {selectedExpert.availability === 'available'
                          ? t.availableNow
                          : t.currentlyOffline}
                      </span>
                    </span>
                    {selectedExpert.distanceKm !== undefined && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        📍 {selectedExpert.distanceKm} km away
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                    {selectedExpert.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    {selectedExpert.qualification} • {selectedExpert.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExpert(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* About */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t.about}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedExpert.about}
                </p>
              </div>

              {/* Specialization & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Specialization</span>
                  <span className="font-bold text-slate-800">
                    {selectedExpert.specialization}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Experience</span>
                  <span className="font-bold text-slate-800">
                    {selectedExpert.experience}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Consultation Fee</span>
                  <span className="font-bold text-emerald-700">
                    {selectedExpert.fee}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Languages</span>
                  <span className="font-bold text-slate-800">
                    {selectedExpert.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Crops Supported */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t.cropsSupported}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedExpert.crops.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                    >
                      🌱 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diseases Supported */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t.diseasesSupported}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedExpert.diseasesSupported.map((d, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/80"
                    >
                      🛡️ {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location and Working Hours */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-800 font-medium">
                    {selectedExpert.location}, {selectedExpert.district}, {selectedExpert.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-800 font-medium">
                    {selectedExpert.consultationTiming} (Helpline & Clinic Hours)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-800 font-mono font-medium">
                    {selectedExpert.phone} • WhatsApp: {selectedExpert.whatsapp}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedExpert.phone}`}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.callExpertBtn}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedExpert.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedExpert.coordinates.lat},${selectedExpert.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.getDirectionsBtn}</span>
                </a>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {t.bookConsultationBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Consultation Modal */}
      {selectedExpert && isBookingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  {t.bookModalTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Consultation with {selectedExpert.name} ({selectedExpert.qualification})
                </p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crop Under Observation
                </label>
                <select
                  value={bookingCrop}
                  onChange={e => setBookingCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {selectedExpert.crops.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other Crop">Other Agricultural Crop</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="10:00 AM">10:00 AM – 10:30 AM</option>
                    <option value="11:30 AM">11:30 AM – 12:00 PM</option>
                    <option value="02:30 PM">02:30 PM – 03:00 PM</option>
                    <option value="04:00 PM">04:00 PM – 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Symptoms & Problem Description
                </label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  placeholder="Describe leaf spots, curling, wilting, or attach scan notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Consultation fee is {selectedExpert.fee}. Booking confirmation SMS will be sent to your mobile.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
