import React, { useState, useEffect } from 'react';
import { ClientDataService, RadarZone } from '../../services/clientDataService';

interface ZoneData {
  village: string;
  pest: string;
  status: string;
  count: string;
  advice: string;
  badgeBgClass: 'error' | 'secondary-container' | 'primary-container';
}

interface StitchOutbreakRadarViewProps {
  onShowToast: (msg: string) => void;
}

export const StitchOutbreakRadarView: React.FC<StitchOutbreakRadarViewProps> = ({ onShowToast }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'bollworm' | 'stemborer' | 'safe'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [zones, setZones] = useState<RadarZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData>({
    village: 'Sector 1 (North Farms)',
    pest: 'Pink Bollworm',
    status: 'High Risk (Red Zone)',
    count: '48 Farmers Affected',
    advice:
      'Install 5 pheromone traps/acre immediately. If damage exceeds 5%, spray Neem extract or Profenofos + Cypermethrin.',
    badgeBgClass: 'error',
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportVillage, setReportVillage] = useState<string>('Sector 1 (North Farms)');
  const [reportPest, setReportPest] = useState<string>('Pink Bollworm');
  const [reportSeverity, setReportSeverity] = useState<string>('high');
  const [smsPhone, setSmsPhone] = useState<string>('');
  const [isSmsSubscribed, setIsSmsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    ClientDataService.getRadarZones().then(data => {
      if (data && data.length > 0) {
        setZones(data);
        setSelectedZone(data[0]);
      }
    });
  }, []);

  const handleRefreshMap = () => {
    setIsRefreshing(true);
    ClientDataService.getRadarZones().then(data => {
      setIsRefreshing(false);
      if (data && data.length > 0) {
        setZones(data);
      }
      onShowToast('Radar map and pest surveillance telemetry refreshed!');
    });
  };

  const handleSelectNode = (zone: ZoneData) => {
    setSelectedZone(zone);
    onShowToast(`Inspecting ${zone.village} cluster`);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    await ClientDataService.submitRadarReport({
      village: reportVillage,
      pest: reportPest,
      severity: reportSeverity,
      notes: 'Submitted via AgriSense Community Radar',
    });
    onShowToast('Your report was pinned to the map. Neighboring farms alerted.');
  };

  const handleSmsSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (smsPhone.length === 10) {
      const res = await ClientDataService.subscribeAlerts(smsPhone);
      setIsSmsSubscribed(true);
      setSmsPhone('');
      onShowToast(res.message || 'SMS subscription activated! Daily alerts arrive at 8:00 AM.');
    } else {
      onShowToast('Please enter a valid 10-digit mobile number.');
    }
  };

  const openDirections = (name: string) => {
    onShowToast(`Opening Google Maps directions for ${name}...`);
    window.open(`https://maps.google.com/?q=${encodeURIComponent(name)}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full gap-space-md max-w-4xl mx-auto pb-6 select-none">
      {/* Live Outbreak Ticker (Civic Alert Banner) */}
      <div className="w-full bg-secondary-container text-on-secondary-container rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm overflow-hidden relative border border-secondary-container/50">
        <div className="w-2.5 h-2.5 rounded-full bg-error animate-ping shrink-0 ml-1"></div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="material-symbols-outlined text-headline-sm shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <p className="font-label-md text-label-md truncate font-bold">
            Live Alert: 42 new Pink Bollworm cases detected across surrounding farm sectors in past 24h
          </p>
        </div>
        <span className="font-label-sm text-label-sm bg-surface/40 text-on-surface px-2 py-0.5 rounded-full shrink-0 font-bold">
          Regional Alert
        </span>
      </div>

      {/* Interactive Pest Heat Map & Community Surveillance Deck */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/20">
        {/* Map Header & Filter Chips */}
        <div className="p-space-md pb-space-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">radar</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Outbreak Radar &amp; Surveillance
                </h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Surrounding Farming Clusters &amp; Sectors (50 km monitoring radius)
                </p>
              </div>
            </div>
            <button
              onClick={handleRefreshMap}
              className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
            </button>
          </div>

          {/* Quick Toggle Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => {
                setActiveFilter('all');
                onShowToast('Filter: Showing all agricultural pests');
              }}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                activeFilter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error"></span>
              All Pests (All)
            </button>
            <button
              onClick={() => {
                setActiveFilter('bollworm');
                onShowToast('Filter: Pink Bollworm (Cotton)');
              }}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 transition-all cursor-pointer font-bold ${
                activeFilter === 'bollworm'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Pink Bollworm (Cotton)
            </button>
            <button
              onClick={() => {
                setActiveFilter('stemborer');
                onShowToast('Filter: Stem Borer (Soybean)');
              }}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 transition-all cursor-pointer font-bold ${
                activeFilter === 'stemborer'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Stem Borer (Soybean)
            </button>
            <button
              onClick={() => {
                setActiveFilter('safe');
                onShowToast('Filter: Safe Villages (Green)');
              }}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 transition-all cursor-pointer font-bold ${
                activeFilter === 'safe'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              Safe Villages (Green)
            </button>
          </div>
        </div>

        {/* Stylized Map Canvas */}
        <div
          className="relative w-full h-80 bg-surface-container-high overflow-hidden select-none border-y border-outline-variant/15"
          id="radar-canvas-container"
        >
          {/* Topo Agrarian Grid Canvas */}
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="40" id="crop-grid" patternUnits="userSpaceOnUse" width="40">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#717a6d"
                  strokeDasharray="3,3"
                  strokeWidth="0.75"
                ></path>
              </pattern>
            </defs>
            <rect fill="url(#crop-grid)" height="100%" width="100%"></rect>
            {/* Simplified River contour */}
            <path
              d="M-20,190 C60,160 140,240 220,180 C300,120 380,190 460,150"
              fill="none"
              opacity="0.4"
              stroke="#2a6b2c"
              strokeLinecap="round"
              strokeWidth="3"
            ></path>
          </svg>

          {/* Heat Zones (SVG Ambient Radial Gradients) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient cx="50%" cy="50%" id="redZone" r="50%">
                <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.55"></stop>
                <stop offset="65%" stopColor="#ba1a1a" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0"></stop>
              </radialGradient>
              <radialGradient cx="50%" cy="50%" id="amberZone" r="50%">
                <stop offset="0%" stopColor="#fe851f" stopOpacity="0.5"></stop>
                <stop offset="70%" stopColor="#fe851f" stopOpacity="0.15"></stop>
                <stop offset="100%" stopColor="#fe851f" stopOpacity="0"></stop>
              </radialGradient>
              <radialGradient cx="50%" cy="50%" id="greenZone" r="50%">
                <stop offset="0%" stopColor="#1b5e20" stopOpacity="0.45"></stop>
                <stop offset="70%" stopColor="#1b5e20" stopOpacity="0.1"></stop>
                <stop offset="100%" stopColor="#1b5e20" stopOpacity="0"></stop>
              </radialGradient>
            </defs>
            {(activeFilter === 'all' || activeFilter === 'bollworm') && (
              <circle cx="58%" cy="52%" fill="url(#redZone)" r="85"></circle>
            )}
            {(activeFilter === 'all' || activeFilter === 'stemborer') && (
              <>
                <circle cx="28%" cy="38%" fill="url(#amberZone)" r="65"></circle>
                <circle cx="82%" cy="30%" fill="url(#amberZone)" r="55"></circle>
              </>
            )}
            {(activeFilter === 'all' || activeFilter === 'safe') && (
              <circle cx="34%" cy="78%" fill="url(#greenZone)" r="65"></circle>
            )}
          </svg>

          {/* Village Nodes */}
          {/* Node 1: Sector 1 - North Farms (Severe Outbreak) */}
          {(activeFilter === 'all' || activeFilter === 'bollworm') && (
            <div
              className="absolute left-[54%] top-[46%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() =>
                handleSelectNode({
                  village: 'Sector 1 (North Farms)',
                  pest: 'Pink Bollworm',
                  status: 'High Risk (Red Zone)',
                  count: '48 Farmers Affected',
                  advice:
                    'Install pheromone traps immediately and apply Profenofos 50% EC spray or 5% Neem extract.',
                  badgeBgClass: 'error',
                })
              }
            >
              <div className="relative flex flex-col items-center group">
                <span className="flex h-7 w-7 relative items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-error text-on-error items-center justify-center text-[10px] font-bold shadow-md">
                    !
                  </span>
                </span>
                <div className="mt-1 px-2 py-0.5 rounded bg-inverse-surface/90 text-inverse-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-md flex items-center gap-1 font-bold">
                  <span>Sector 1 (North Farms)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                </div>
              </div>
            </div>
          )}

          {/* Node 2: Sector 2 - Central Plains (Moderate/Amber) */}
          {(activeFilter === 'all' || activeFilter === 'stemborer') && (
            <div
              className="absolute left-[26%] top-[34%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() =>
                handleSelectNode({
                  village: 'Sector 2 (Central Plains)',
                  pest: 'Soybean Stem Borer',
                  status: 'Moderate Risk (Amber Zone)',
                  count: '19 Farmers Affected',
                  advice: '5% Neem Extract or Chlorantraniliprole 18.5% SC recommended.',
                  badgeBgClass: 'secondary-container',
                })
              }
            >
              <div className="relative flex flex-col items-center">
                <span className="h-5 w-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px] shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">pest_control</span>
                </span>
                <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-lowest/95 text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm font-semibold">
                  Sector 2 (Central)
                </div>
              </div>
            </div>
          )}

          {/* Node 3: Sector 3 - Eastern Belt (Moderate/Amber) */}
          {(activeFilter === 'all' || activeFilter === 'stemborer') && (
            <div
              className="absolute left-[80%] top-[26%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() =>
                handleSelectNode({
                  village: 'Sector 3 (Eastern Belt)',
                  pest: 'Citrus Gummosis & Jassids',
                  status: 'Moderate Outbreak',
                  count: '12 Orchards Affected',
                  advice: 'Apply Bordeaux paste to trunks and mix Trichoderma into soil.',
                  badgeBgClass: 'secondary-container',
                })
              }
            >
              <div className="relative flex flex-col items-center">
                <span className="h-4 w-4 rounded-full bg-secondary-container flex items-center justify-center shadow-sm"></span>
                <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-lowest/95 text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm font-semibold">
                  Sector 3 (East)
                </div>
              </div>
            </div>
          )}

          {/* Node 4: Sector 4 - Southern Valley (Green/Safe) */}
          {(activeFilter === 'all' || activeFilter === 'safe') && (
            <div
              className="absolute left-[32%] top-[74%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() =>
                handleSelectNode({
                  village: 'Sector 4 (Southern Valley)',
                  pest: 'No active outbreak reported',
                  status: 'Safe Zone (Green Zone)',
                  count: '0 Reports',
                  advice: 'Crops are healthy. Inspect pheromone traps regularly every 7 days.',
                  badgeBgClass: 'primary-container',
                })
              }
            >
              <div className="relative flex flex-col items-center">
                <span className="h-5 w-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </span>
                <div className="mt-1 px-2 py-0.5 rounded bg-surface-container-lowest/95 text-on-surface font-label-sm text-label-sm whitespace-nowrap shadow-sm font-semibold">
                  Sector 4 (South)
                </div>
              </div>
            </div>
          )}

          {/* Map Floating Legend Overlay */}
          <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-md rounded-lg p-2 shadow-sm flex flex-col gap-1 z-10 border border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium">
                Red Zone (High Outbreak)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium">
                Orange Zone (Moderate Infestation)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium">
                Green Zone (Safe / Protected)
              </span>
            </div>
          </div>

          {/* Map Expand/Compass Control */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            <button
              onClick={() => onShowToast('Oriented Map to Magnetic North')}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
              title="North Direction"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
            </button>
            <button
              onClick={() => onShowToast('Centering on your farm coordinates (Gut No. 42/B)')}
              className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
              title="My Location"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
            </button>
          </div>
        </div>

        {/* Active Zone Drilldown Card */}
        <div className="p-space-md bg-surface-container-low transition-all" id="zone-detail-panel">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                    selectedZone.badgeBgClass === 'error'
                      ? 'bg-error text-on-error'
                      : selectedZone.badgeBgClass === 'secondary-container'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary-container text-on-primary'
                  }`}
                  id="zone-badge"
                >
                  {selectedZone.status}
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold" id="zone-name">
                  {selectedZone.village} Cluster
                </span>
              </div>
              <p className="font-label-md text-label-md text-secondary font-bold" id="zone-pest">
                {selectedZone.pest} •{' '}
                <span className="text-on-surface-variant font-normal" id="zone-count">
                  {selectedZone.count}
                </span>
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1" id="zone-advice">
                Immediate Action: {selectedZone.advice}
              </p>
            </div>
            <button
              className="shrink-0 px-3 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer font-bold"
              onClick={() => setIsReportModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Crowdsourced Action Button (Report Pin) */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">share_location</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-label-lg text-label-lg text-on-surface font-bold truncate">
              Report Pest in Your Field
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
              Confidential early warning to alert neighboring farms
            </p>
          </div>
        </div>
        <button
          className="px-3.5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shrink-0 shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-bold"
          onClick={() => setIsReportModalOpen(true)}
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Drop Pin</span>
        </button>
      </div>

      {/* Govt of Maharashtra Agronomist & KVK Support (Authority Verified Card) */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/20">
        {/* Header Banner */}
        <div className="bg-primary-container text-on-primary px-space-md py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wide">
              Krishi Vigyan Kendra (KVK) • Agricultural Extension
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-on-primary-container text-primary font-label-sm text-label-sm font-bold">
            Verified Officer
          </span>
        </div>

        {/* Officer Details */}
        <div className="p-space-md flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img
                className="w-16 h-16 rounded-full object-cover shadow-sm bg-surface-container ring-2 ring-primary"
                alt="Dr. Gajanan Deshmukh"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHuAD4oDl-tSyT9WbJlb2b7Smep6AC-hQgtPqrYzVaCiY-RMt8ZiDvfcAJF1_pIlmvdVIqrr6TvvYlcosIQNr9Ld2GXJFnr-1qEQO9PdWD8igTD9vdsuNOcCY28SenpiMBoUFGFyNS10jU9BZqux7UuBhr1ap9MzCy9Gz4geBU1_kWoQKbbMhaKjHa1EbyThJJQlQZIosLErljSuCgCwWJMsA5mBNGd5e2soe6pAtVggT-wck3vxpu"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] shadow-sm font-bold">
                ✓
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Dr. Gajanan Deshmukh
                </h4>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-bold">
                  Senior Entomologist
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Krishi Vigyan Kendra (KVK) Agricultural Research Center
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  Currently Available (10:00 AM - 4:30 PM)
                </span>
              </div>
            </div>
          </div>

          {/* Officer Connect Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              className="h-12 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm active:bg-primary-container transition-colors font-bold cursor-pointer"
              href="tel:18001801551"
            >
              <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
              <span>Direct Call (Toll-Free)</span>
            </a>
            <a
              className="h-12 px-3 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-highest active:scale-[0.98] transition-all font-bold cursor-pointer"
              href="https://wa.me/919420000000?text=Hello%20Dr.%20Deshmukh,%20I%20have%20detected%20a%20pest%20in%20my%20field."
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">chat</span>
              <span>Ask Query on WhatsApp</span>
            </a>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
            Or Central Kisan Call Center: <strong>1800-180-1551</strong> (24x7 Free)
          </p>
        </div>
      </div>

      {/* Nearest Authorized Krishi Seva Kendra List */}
      <div className="w-full flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Nearby Authorized Agro Service Centers (Krishi Seva Kendra)
            </h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Govt-authorized pesticides &amp; traps
            </p>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-bold">2 Available</span>
        </div>

        {/* Center Card 1: Kisan Krishi Seva Kendra */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
                    Kisan Krishi Seva Kendra
                  </h4>
                  <span
                    className="material-symbols-outlined text-primary text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Govt Licensed Authorized"
                  >
                    verified
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Main Market Road, Sector 1 • <strong className="text-primary">2.1 km away</strong>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-primary shrink-0 font-bold">
              In Stock
            </span>
          </div>

          <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              inventory_2
            </span>
            <p className="font-body-sm text-body-sm text-on-surface">
              <strong>Available:</strong> 5% Neem Extract, Pink Bollworm Lures, Pheromone Traps, Profex
              Super.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              className="flex-1 h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
              href="tel:0721200000"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Call Shop</span>
            </a>
            <button
              className="flex-1 h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
              onClick={() => openDirections('Kisan Krishi Seva Kendra, Main Market')}
            >
              <span className="material-symbols-outlined text-[18px] text-primary">directions</span>
              <span>Directions</span>
            </button>
          </div>
        </div>

        {/* Center Card 2: Farmer Agri Store & Seeds */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
                    Farmer Agri Store &amp; Seeds
                  </h4>
                  <span
                    className="material-symbols-outlined text-primary text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Govt Licensed Authorized"
                  >
                    verified
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Market Yard Chowk, Sector 2 • <strong className="text-primary">6.4 km away</strong>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-primary shrink-0 font-bold">
              Open Now
            </span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
              inventory_2
            </span>
            <p className="font-body-sm text-body-sm text-on-surface">
              <strong>Available:</strong> Trichoderma, Neem Oil 10,000 PPM, Yellow Sticky Traps.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <a
              className="flex-1 h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
              href="tel:0721200001"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Call Shop</span>
            </a>
            <button
              className="flex-1 h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
              onClick={() => openDirections('Farmer Agri Store, Sector 2')}
            >
              <span className="material-symbols-outlined text-[18px] text-primary">directions</span>
              <span>Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Alert Subscription Banner */}
      <div className="w-full bg-surface-container-high text-on-surface rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden border border-outline-variant/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">sms</span>
          </div>
          <div className="flex-1">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
              Get Free Pest &amp; Weather SMS Alerts
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Receive official agricultural advisory alerts for your farm block directly on mobile.
            </p>
          </div>
        </div>

        <form className="flex flex-col sm:flex-row gap-2 mt-1" onSubmit={handleSmsSubscribe}>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-sm text-label-sm font-bold">
              +91
            </span>
            <input
              className="w-full h-12 pl-11 pr-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none shadow-sm border border-outline-variant/30"
              id="mobile-number-input"
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              required
              type="tel"
              value={smsPhone}
              onChange={e => setSmsPhone(e.target.value)}
            />
          </div>
          <button
            className="h-12 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shrink-0 shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            id="subscribe-btn"
            type="submit"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>Subscribe for Alerts</span>
          </button>
        </form>

        {isSmsSubscribed && (
          <div
            className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1 mt-1 animate-fadeIn"
            id="subscription-success"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>
              Thank you! Your mobile number has been registered for Agriculture Dept. SMS Alerts.
            </span>
          </div>
        )}
      </div>

      {/* Interactive Modal Dialog: Anonymous Field Outbreak Reporting Pin */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md animate-fadeIn"
          id="report-modal"
        >
          <div className="w-full max-w-md bg-surface-container-lowest text-on-surface rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/30">
            <div className="bg-primary-container text-on-primary p-space-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">add_location_alt</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Report Pest in Your Field</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center text-on-primary hover:bg-surface/30 cursor-pointer"
                onClick={() => setIsReportModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form className="p-space-md flex flex-col gap-space-md" onSubmit={handleReportSubmit}>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Select your Village / Farm Region
                </label>
                <select
                  value={reportVillage}
                  onChange={e => setReportVillage(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md focus:outline-none border border-outline-variant/30"
                >
                  <option value="sector1">Sector 1 (North Farms)</option>
                  <option value="sector2">Sector 2 (Central Plains)</option>
                  <option value="sector3">Sector 3 (Eastern Belt)</option>
                  <option value="sector4">Sector 4 (Southern Valley)</option>
                  <option value="other">Other Local Farm Block</option>
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Detected Pest / Disease
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bollworm', label: 'Pink Bollworm' },
                    { id: 'stemfly', label: 'Soybean Stem Borer' },
                    { id: 'citrus', label: 'Citrus Gummosis' },
                    { id: 'other', label: 'Other Pest' },
                  ].map(pest => (
                    <label
                      key={pest.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container cursor-pointer border border-outline-variant/20"
                    >
                      <input
                        checked={reportPest === pest.id}
                        onChange={() => setReportPest(pest.id)}
                        className="accent-primary"
                        name="pest_type"
                        type="radio"
                        value={pest.id}
                      />
                      <span className="font-label-sm text-label-sm font-semibold">{pest.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Outbreak Severity
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'low', label: 'Low (<5%)' },
                    { id: 'med', label: 'Medium' },
                    { id: 'high', label: 'Severe (>20%)' },
                  ].map(sev => (
                    <label
                      key={sev.id}
                      className={`flex-1 text-center py-2 rounded-lg font-label-sm text-label-sm cursor-pointer transition-colors font-bold ${
                        reportSeverity === sev.id
                          ? 'bg-primary-container text-on-primary'
                          : 'bg-surface-container text-on-surface'
                      }`}
                    >
                      <input
                        checked={reportSeverity === sev.id}
                        onChange={() => setReportSeverity(sev.id)}
                        className="hidden"
                        name="severity"
                        type="radio"
                        value={sev.id}
                      />
                      {sev.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  This entry remains <strong>confidential</strong>. Only an anonymous marker will appear
                  on neighboring farmers&apos; radar map.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  className="flex-1 h-12 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold cursor-pointer"
                  onClick={() => setIsReportModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm active:scale-95 transition-all font-bold cursor-pointer hover:bg-primary-container"
                  type="submit"
                >
                  Pin on Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
