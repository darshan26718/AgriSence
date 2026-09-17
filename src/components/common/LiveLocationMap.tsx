import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Building2,
  UserCheck,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { AgroCentreRecord } from '../../data/agroCentresData';
import { AgriExpertRecord } from '../../data/agriExpertsData';
import { AppLanguage, getLocale } from '../../locales';

interface LiveLocationMapProps {
  userCoords: { lat: number; lng: number } | null;
  approxLocationName?: string;
  agroCentres: (AgroCentreRecord & { distanceKm?: number })[];
  agriExperts: (AgriExpertRecord & { distanceKm?: number })[];
  onSelectCentre?: (centre: AgroCentreRecord) => void;
  onSelectExpert?: (expert: AgriExpertRecord) => void;
  language?: AppLanguage;
  onRefreshLocation?: () => void;
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  userCoords,
  approxLocationName,
  agroCentres,
  agriExperts,
  onSelectCentre,
  onSelectExpert,
  language = 'en',
  onRefreshLocation,
}) => {
  const t = getLocale(language).liveLocation;
  const [activeFilter, setActiveFilter] = useState<'all' | 'centres' | 'experts'>('all');
  const [selectedMarker, setSelectedMarker] = useState<{
    type: 'centre' | 'expert' | 'user';
    data?: AgroCentreRecord | AgriExpertRecord;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Compute map bounds or relative coordinates
  // Reference center point: userCoords or default regional agricultural cluster center
  const centerLat = userCoords ? userCoords.lat : 16.8;
  const centerLng = userCoords ? userCoords.lng : 77.2;

  // Convert lat/lng to SVG percentage coordinates (50% is center)
  const getSvgCoordinates = (lat: number, lng: number) => {
    // Scaling factors based on regional degree span
    const latSpan = 4.0 / zoomLevel;
    const lngSpan = 5.0 / zoomLevel;

    const x = 50 + ((lng - centerLng) / lngSpan) * 40;
    const y = 50 - ((lat - centerLat) / latSpan) * 40;

    // Clamp within visible map canvas
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  const visibleCentres = activeFilter === 'experts' ? [] : agroCentres;
  const visibleExperts = activeFilter === 'centres' ? [] : agriExperts;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Map Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              {t.mapTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {userCoords
              ? `${t.youAreHere}: ${approxLocationName || `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`}`
              : t.locationTurnedOff}
          </p>
        </div>

        {/* Filters & Zoom controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({agroCentres.length + agriExperts.length})
            </button>
            <button
              onClick={() => setActiveFilter('centres')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'centres'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Agro Centres ({agroCentres.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('experts')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'experts'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Agri Doctors ({agriExperts.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.25))}
              className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.25))}
              className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {onRefreshLocation && (
              <button
                onClick={onRefreshLocation}
                className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shadow-2xs"
                title="Recenter location"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full h-[380px] sm:h-[420px] bg-[#edf3ed] overflow-hidden select-none">
        {/* Subtle Map Grid Lines and Agricultural Land Texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#cde0cd"
                strokeWidth="1"
              />
            </pattern>
            {/* Topographic organic curves */}
            <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d5e8d5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ebf4eb" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Subtle agricultural land clusters */}
          <circle cx="30%" cy="40%" r="22%" fill="url(#fieldGradient)" />
          <circle cx="75%" cy="65%" r="28%" fill="url(#fieldGradient)" />
          <circle cx="60%" cy="25%" r="18%" fill="url(#fieldGradient)" />
        </svg>

        {/* User Location Marker (📍 You are here) */}
        {userCoords ? (
          <div
            style={{
              left: `${getSvgCoordinates(userCoords.lat, userCoords.lng).x}%`,
              top: `${getSvgCoordinates(userCoords.lat, userCoords.lng).y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            onClick={() => setSelectedMarker({ type: 'user' })}
          >
            {/* Radar wave pulse ring */}
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping"></div>
            <div className="relative w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-500/30">
              <Navigation className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap shadow-md">
              📍 {t.youAreHere}
            </span>
          </div>
        ) : null}

        {/* Agro Centres Markers (🌱 Green Pins) */}
        {visibleCentres.map((c, i) => {
          const coords = getSvgCoordinates(c.coordinates.lat, c.coordinates.lng);
          const isSelected = selectedMarker?.data?.id === c.id;

          return (
            <div
              key={c.id}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
              onClick={() => setSelectedMarker({ type: 'centre', data: c })}
            >
              <div
                className={`transition-transform duration-200 transform group-hover:scale-125 ${
                  isSelected ? 'scale-125' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-600 text-emerald-800 flex items-center justify-center shadow-md">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {c.distanceKm !== undefined && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-white/90 text-slate-800 text-[9px] font-bold shadow-xs whitespace-nowrap border border-slate-200">
                      {c.distanceKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Agriculture Experts / Crop Doctors Markers (👨‍🌾 Blue/Emerald Pins) */}
        {visibleExperts.map((exp, i) => {
          const coords = getSvgCoordinates(exp.coordinates.lat, exp.coordinates.lng);
          const isSelected = selectedMarker?.data?.id === exp.id;
          const isAvailable = exp.availability === 'available';

          return (
            <div
              key={exp.id}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
              onClick={() => setSelectedMarker({ type: 'expert', data: exp })}
            >
              <div
                className={`transition-transform duration-200 transform group-hover:scale-125 ${
                  isSelected ? 'scale-125' : ''
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full bg-white border-2 text-slate-800 flex items-center justify-center shadow-md overflow-hidden ${
                      isAvailable ? 'border-blue-600 ring-2 ring-blue-400/30' : 'border-slate-400'
                    }`}
                  >
                    <img
                      src={exp.avatar}
                      alt={exp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-1 ring-white ${
                      isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  ></span>
                  {exp.distanceKm !== undefined && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-white/90 text-slate-800 text-[9px] font-bold shadow-xs whitespace-nowrap border border-slate-200">
                      {exp.distanceKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Marker Detail Card Popover */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 z-30 animate-fadeIn">
            {selectedMarker.type === 'user' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    <span>{t.currentLocationDetected}</span>
                  </div>
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {approxLocationName ||
                    `Latitude: ${userCoords?.lat.toFixed(5)}, Longitude: ${userCoords?.lng.toFixed(5)}`}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Nearby: {visibleCentres.length} Centres</span>
                  <span>{visibleExperts.length} Crop Doctors</span>
                </div>
              </div>
            ) : selectedMarker.type === 'centre' ? (
              (() => {
                const centre = selectedMarker.data as AgroCentreRecord;
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          Agro Centre
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                          {centre.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedMarker(null)}
                        className="text-slate-400 hover:text-slate-700 text-xs p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{centre.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{centre.timings} ({centre.workingDays})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {onSelectCentre && (
                        <button
                          onClick={() => {
                            onSelectCentre(centre);
                            setSelectedMarker(null);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          View Details
                        </button>
                      )}
                      <a
                        href={`tel:${centre.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${centre.coordinates.lat},${centre.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                );
              })()
            ) : (
              (() => {
                const exp = selectedMarker.data as AgriExpertRecord;
                const isAvail = exp.availability === 'available';
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={exp.avatar}
                          alt={exp.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {exp.name}
                          </h4>
                          <p className="text-[11px] text-blue-700 font-semibold truncate">
                            {exp.role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMarker(null)}
                        className="text-slate-400 hover:text-slate-700 text-xs p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAvail ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span>{isAvail ? 'Available Now' : 'Currently Offline'}</span>
                        </span>
                        {exp.distanceKm !== undefined && (
                          <span className="text-slate-500 font-medium">
                            • {exp.distanceKm} km away
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 line-clamp-1">{exp.specialization}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      {onSelectExpert && (
                        <button
                          onClick={() => {
                            onSelectExpert(exp);
                            setSelectedMarker(null);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                      )}
                      <a
                        href={`tel:${exp.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-700" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Map Footer Information */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-700 border-2 border-white"></span>
            <span>📍 Your Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>🌱 Agro Centres</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>👨‍🌾 Crop Doctors</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any marker on the map to view instant directions and contact info.
        </span>
      </div>
    </div>
  );
};
