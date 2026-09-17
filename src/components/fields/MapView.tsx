import React, { useState } from 'react';
import { FieldRecord, RiskLevel } from '../../types/agri';

export interface MapViewProps {
  fields?: FieldRecord[];
  onScanField?: (field: FieldRecord) => void;
  onShowToast?: (msg: string) => void;
  language?: 'Marathi' | 'English';
}

interface PlotCoordinates {
  id: string;
  points: string;
  labelX: number;
  labelY: number;
  pinX: number;
  pinY: number;
}

// Preset geometric polygon coordinates for realistic cadastral farm plots
const PLOT_COORDINATES: Record<string, PlotCoordinates> = {
  '1': {
    id: '1',
    points: '50,60 260,40 290,190 70,210',
    labelX: 160,
    labelY: 125,
    pinX: 160,
    pinY: 100,
  },
  '2': {
    id: '2',
    points: '290,40 520,30 550,180 320,190',
    labelX: 410,
    labelY: 110,
    pinX: 410,
    pinY: 85,
  },
  '3': {
    id: '3',
    points: '550,30 740,50 720,200 570,185',
    labelX: 640,
    labelY: 120,
    pinX: 640,
    pinY: 95,
  },
  '4': {
    id: '4',
    points: '60,230 310,210 330,370 80,390',
    labelX: 180,
    labelY: 290,
    pinX: 180,
    pinY: 270,
  },
  '5': {
    id: '5',
    points: '340,210 570,200 590,380 360,390',
    labelX: 460,
    labelY: 290,
    pinX: 460,
    pinY: 270,
  },
  '6': {
    id: '6',
    points: '600,215 740,225 720,410 590,400',
    labelX: 660,
    labelY: 300,
    pinX: 660,
    pinY: 280,
  },
};

export const MapView: React.FC<MapViewProps> = ({
  fields = [],
  onScanField,
  onShowToast = (_msg: string) => {},
  language = 'English',
}) => {
  const isMarathi = language === 'Marathi';

  const safeFields = Array.isArray(fields) && fields.length > 0 ? fields : [
    {
      id: '1',
      name: 'Plot 1 - North Sector (Gut 42/A)',
      crop: 'Rice (Paddy)',
      variety: 'Swarna Sub-1',
      area_acres: 3.5,
      location: 'Varanasi Alluvial Zone Plot 12',
      soil_type: 'Alluvial Silt Loam',
      growth_stage: 'Tillering (45d)',
      health_score: 92,
      disease_risk: 'LOW' as RiskLevel,
      pest_risk: 'LOW' as RiskLevel,
    },
    {
      id: '2',
      name: 'Plot 2 - Cotton Acreage (Gut 42/B)',
      crop: 'Cotton (Kapus)',
      variety: 'Bollgard II',
      area_acres: 5.0,
      location: 'Central Vidarbha Agri Belt',
      soil_type: 'Black Cotton Clay',
      growth_stage: 'Square Formation',
      health_score: 64,
      disease_risk: 'HIGH' as RiskLevel,
      pest_risk: 'CRITICAL' as RiskLevel,
    },
    {
      id: '3',
      name: 'Plot 3 - Soybean Block',
      crop: 'Soybean',
      variety: 'JS-335',
      area_acres: 4.2,
      location: 'Indore Malwa Agro Plateau',
      soil_type: 'Medium Black Loam',
      growth_stage: 'Pod Initiation',
      health_score: 88,
      disease_risk: 'LOW' as RiskLevel,
      pest_risk: 'MODERATE' as RiskLevel,
    },
    {
      id: '4',
      name: 'Plot 4 - Wheat Basin (Gut 18)',
      crop: 'Wheat',
      variety: 'HD-2967',
      area_acres: 6.0,
      location: 'Indo-Gangetic Basin Sector 4',
      soil_type: 'Deep Clay Loam',
      growth_stage: 'Crown Root Emergence',
      health_score: 74,
      disease_risk: 'MODERATE' as RiskLevel,
      pest_risk: 'LOW' as RiskLevel,
    },
  ];

  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '1');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [scanningFieldId, setScanningFieldId] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [scannedResults, setScannedResults] = useState<Record<string, { timestamp: string; health: number; status: string }>>({});

  const selectedField = safeFields.find(f => f.id === selectedFieldId) || safeFields[0];

  const filteredFields = safeFields.filter(f => {
    if (filterRisk === 'ALL') return true;
    if (filterRisk === 'HIGH') return f.disease_risk === 'HIGH' || f.disease_risk === 'CRITICAL' || f.pest_risk === 'HIGH' || f.pest_risk === 'CRITICAL';
    if (filterRisk === 'MODERATE') return f.disease_risk === 'MODERATE' || f.pest_risk === 'MODERATE';
    if (filterRisk === 'LOW') return f.disease_risk === 'LOW' && f.pest_risk === 'LOW';
    return true;
  });

  const getRiskTheme = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          fill: '#f43f5e',
          fillOpacity: '0.35',
          stroke: '#e11d48',
          text: 'text-rose-600',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'HIGH':
        return {
          fill: '#fb923c',
          fillOpacity: '0.35',
          stroke: '#ea580c',
          text: 'text-amber-600',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'MODERATE':
        return {
          fill: '#facc15',
          fillOpacity: '0.30',
          stroke: '#ca8a04',
          text: 'text-yellow-600',
          badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-500',
        };
      case 'LOW':
      default:
        return {
          fill: '#10b981',
          fillOpacity: '0.28',
          stroke: '#059669',
          text: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  const handleTriggerImmediateScan = (field: FieldRecord) => {
    if (scanningFieldId) return;

    setScanningFieldId(field.id);
    setScanStep(isMarathi ? 'मल्टी-स्पेक्ट्रल उपग्रह डेटा संकलित करत आहे...' : 'Acquiring multispectral NDVI telemetry...');

    setTimeout(() => {
      setScanStep(isMarathi ? 'पिकाचे क्लोरोफिल व रोग प्रादुर्भाव तपासत आहे...' : 'Running leaf pathology & canopy vigor audit...');
    }, 1200);

    setTimeout(() => {
      const updatedHealth = Math.min(98, Math.max(55, Math.round(field.health_score + (Math.random() * 6 - 2))));
      const newStatus = field.disease_risk === 'CRITICAL' || field.disease_risk === 'HIGH'
        ? (isMarathi ? 'तातडीने बुरशीनाशक फवारणी आवश्यक' : 'Immediate antifungal spray recommended')
        : (isMarathi ? 'पीक निरोगी आणि जोमदार आहे' : 'Optimal vigor: normal canopy index');

      setScannedResults(prev => ({
        ...prev,
        [field.id]: {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          health: updatedHealth,
          status: newStatus,
        },
      }));

      setScanningFieldId(null);
      setScanStep(null);
      onShowToast(
        isMarathi
          ? `✅ ${field.name} चे थेट स्कॅन पूर्ण झाले!`
          : `✅ Live scan completed for ${field.name}!`
      );
    }, 2400);
  };

  return (
    <div className="w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">map</span>
          </div>
          <div>
            <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
              <span>{isMarathi ? 'शेत भू-नकाशा व त्वरित स्कॅन' : 'Cadastral Field Map & Status Scanner'}</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
                {safeFields.length} {isMarathi ? 'प्लॉट्स' : 'Plots'}
              </span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isMarathi
                ? 'कोणत्याही शेतावर क्लिक करा आणि त्वरित एआय स्थिती स्कॅन करा'
                : 'Click any field plot to inspect health index and trigger an immediate status scan'}
            </p>
          </div>
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: isMarathi ? 'सर्व' : 'All' },
            { id: 'LOW', label: isMarathi ? 'सुरक्षित' : 'Healthy' },
            { id: 'MODERATE', label: isMarathi ? 'मध्यम' : 'Moderate' },
            { id: 'HIGH', label: isMarathi ? 'धोका' : 'High Risk' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterRisk(f.id)}
              className={`px-3 py-1 rounded-full text-label-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterRisk === f.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* SVG Interactive Farm Map (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl border border-outline-variant/20 p-2 sm:p-3 relative overflow-hidden flex flex-col">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant px-2 py-1 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-on-surface">GIS Cadastral Overlay</span>
              <span className="text-[11px] hidden sm:inline">• Topo Zoom 1:2500</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-600 inline-block"></span>
                {isMarathi ? 'चांगले' : 'Good'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-600 inline-block"></span>
                {isMarathi ? 'मध्यम' : 'Moderate'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-600 inline-block"></span>
                {isMarathi ? 'गंभीर' : 'Alert'}
              </span>
            </div>
          </div>

          {/* Responsive SVG Map Stage */}
          <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden border border-outline-variant/30">
            <svg
              viewBox="0 0 800 480"
              className="w-full h-full select-none cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Soil Grid Texture */}
                <pattern id="soilGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>
                {/* Crop Ridge Pattern */}
                <pattern id="cropRidge" width="12" height="12" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="12" y2="12" stroke="#475569" strokeWidth="0.6" strokeOpacity="0.25" />
                </pattern>
                {/* Radial Glow Filter for selected plot */}
                <filter id="plotGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Topo Land */}
              <rect width="800" height="480" fill="#0f172a" />
              <rect width="800" height="480" fill="url(#soilGrid)" />

              {/* Topography Contour Lines */}
              <path
                d="M-20,120 Q200,80 400,140 T820,100"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4,4"
                strokeOpacity="0.4"
              />
              <path
                d="M-20,280 Q250,220 500,290 T820,260"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4,4"
                strokeOpacity="0.4"
              />

              {/* Irrigation Canal (Waterway) */}
              <path
                d="M 280,0 Q 310,240 335,480"
                fill="none"
                stroke="#0284c7"
                strokeWidth="7"
                strokeOpacity="0.75"
              />
              <path
                d="M 280,0 Q 310,240 335,480"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="8,6"
              />

              {/* Farm Access Road */}
              <path
                d="M 0,215 L 800,205"
                fill="none"
                stroke="#64748b"
                strokeWidth="9"
                strokeOpacity="0.5"
              />
              <path
                d="M 0,215 L 800,205"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="6,8"
                strokeOpacity="0.8"
              />

              {/* Farm Plots */}
              {safeFields.map((field, index) => {
                const coord = PLOT_COORDINATES[field.id] || PLOT_COORDINATES[String((index % 6) + 1)];
                if (!coord) return null;

                const isSelected = selectedField?.id === field.id;
                const isScanning = scanningFieldId === field.id;
                const theme = getRiskTheme(field.disease_risk);

                return (
                  <g
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className="transition-all duration-200"
                  >
                    {/* Selected Plot Glow Effect */}
                    {isSelected && (
                      <polygon
                        points={coord.points}
                        fill={theme.stroke}
                        fillOpacity="0.45"
                        stroke={theme.stroke}
                        strokeWidth="5"
                        filter="url(#plotGlow)"
                      />
                    )}

                    {/* Field Plot Polygon */}
                    <polygon
                      points={coord.points}
                      fill={theme.fill}
                      fillOpacity={isSelected ? '0.5' : theme.fillOpacity}
                      stroke={isSelected ? '#38bdf8' : theme.stroke}
                      strokeWidth={isSelected ? '3.5' : '1.8'}
                      strokeLinejoin="round"
                      className="hover:fill-opacity-60 transition-all cursor-pointer"
                    />

                    {/* Crop Ridge Pattern Overlay */}
                    <polygon
                      points={coord.points}
                      fill="url(#cropRidge)"
                      pointerEvents="none"
                    />

                    {/* Scanning radar sweep animation on plot */}
                    {isScanning && (
                      <circle
                        cx={coord.pinX}
                        cy={coord.pinY}
                        r="35"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        className="animate-ping"
                      />
                    )}

                    {/* Active Alert Pulse for High/Critical Risk */}
                    {(field.disease_risk === 'HIGH' || field.disease_risk === 'CRITICAL') && !isScanning && (
                      <circle
                        cx={coord.pinX - 35}
                        cy={coord.pinY - 20}
                        r="8"
                        fill="#f43f5e"
                        className="animate-pulse"
                      />
                    )}

                    {/* Field Label Badge */}
                    <rect
                      x={coord.labelX - 58}
                      y={coord.labelY - 14}
                      width="116"
                      height="28"
                      rx="6"
                      fill="#0f172a"
                      fillOpacity="0.88"
                      stroke={isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1'}
                    />

                    {/* Text Label: Crop & Name */}
                    <text
                      x={coord.labelX}
                      y={coord.labelY + 4}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {field.crop} ({field.area_acres} Ac)
                    </text>

                    {/* Health Score Pill */}
                    <rect
                      x={coord.labelX - 24}
                      y={coord.labelY + 18}
                      width="48"
                      height="16"
                      rx="4"
                      fill={theme.stroke}
                    />
                    <text
                      x={coord.labelX}
                      y={coord.labelY + 30}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {scannedResults[field.id]?.health || field.health_score}% Health
                    </text>
                  </g>
                );
              })}

              {/* Compass Rose in Corner */}
              <g transform="translate(745, 45)">
                <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                <polygon points="0,-16 4,-3 0,0 -4,-3" fill="#f43f5e" />
                <polygon points="0,16 4,3 0,0 -4,3" fill="#94a3b8" />
                <text x="0" y="-8" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">N</text>
              </g>

              {/* Canal Label */}
              <text
                x="285"
                y="35"
                fill="#38bdf8"
                fontSize="9"
                fontWeight="bold"
                letterSpacing="1"
                transform="rotate(82 285 35)"
              >
                DISTRIBUTARY CANAL 4
              </text>

              {/* Village Main Road Label */}
              <text
                x="15"
                y="200"
                fill="#cbd5e1"
                fontSize="8.5"
                fontWeight="bold"
                letterSpacing="1"
              >
                GRAM PANCHAYAT ROAD
              </text>
            </svg>
          </div>

          {/* Quick Field Selector Bar below SVG */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 custom-scrollbar">
            {filteredFields.map(f => {
              const isSelected = selectedField?.id === f.id;
              const theme = getRiskTheme(f.disease_risk);
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-primary shadow-sm'
                      : 'bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                  <span>{f.name.split('(')[0]}</span>
                  <span className="text-[10px] text-on-surface-variant">({f.crop})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Field Details & Immediate Status Scan Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl border border-outline-variant/30 p-4 flex flex-col justify-between gap-4">
          <div>
            {/* Header of selected field */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-surface-container">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  {isMarathi ? 'निवडलेला शेत तुकडा' : 'Selected Farm Plot'}
                </span>
                <h4 className="font-title-md text-title-md font-bold text-on-surface mt-0.5 leading-snug">
                  {selectedField.name}
                </h4>
                <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                  <span className="truncate">{selectedField.location}</span>
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase shrink-0 ${
                  getRiskTheme(selectedField.disease_risk).badge
                }`}
              >
                {selectedField.disease_risk} {isMarathi ? 'धोका' : 'Risk'}
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/15">
                <span className="text-[10px] text-on-surface-variant block">
                  {isMarathi ? 'पीक व जात' : 'Crop & Variety'}
                </span>
                <span className="font-bold text-on-surface truncate block mt-0.5">
                  {selectedField.crop}
                </span>
                <span className="text-[10px] text-primary font-medium block truncate">
                  {selectedField.variety || 'Standard Hybrid'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/15">
                <span className="text-[10px] text-on-surface-variant block">
                  {isMarathi ? 'क्षेत्रफळ / माती' : 'Acreage & Soil'}
                </span>
                <span className="font-bold text-on-surface block mt-0.5">
                  {selectedField.area_acres} {isMarathi ? 'एकर' : 'Acres'}
                </span>
                <span className="text-[10px] text-on-surface-variant block truncate">
                  {selectedField.soil_type || 'Alluvial'}
                </span>
              </div>
            </div>

            {/* Live Health Gauge */}
            <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">ecg_heart</span>
                  <span>{isMarathi ? 'कॅनोपी आरोग्य निर्देशांक' : 'Canopy Health Score'}</span>
                </span>
                <span className="font-bold text-primary text-sm">
                  {scannedResults[selectedField.id]?.health || selectedField.health_score}/100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (scannedResults[selectedField.id]?.health || selectedField.health_score) > 75
                      ? 'bg-emerald-500'
                      : (scannedResults[selectedField.id]?.health || selectedField.health_score) > 55
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${scannedResults[selectedField.id]?.health || selectedField.health_score}%` }}
                ></div>
              </div>

              {/* Last scan info */}
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                <span>{isMarathi ? 'वाढ अवस्था' : 'Stage'}: {selectedField.growth_stage}</span>
                <span>
                  {scannedResults[selectedField.id]
                    ? `${isMarathi ? 'स्कॅन वेळ' : 'Audited'}: ${scannedResults[selectedField.id]?.timestamp}`
                    : `${isMarathi ? 'नियमित डेटा' : 'Telemetry Sync'}`}
                </span>
              </div>
            </div>

            {/* Scanning Progress Card (during scan) */}
            {scanningFieldId === selectedField.id && (
              <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 animate-pulse">
                <span className="material-symbols-outlined text-primary text-[24px] animate-spin">
                  sync
                </span>
                <div className="text-xs">
                  <span className="font-bold text-primary block">
                    {isMarathi ? 'एआय स्कॅनर सक्रिय आहे...' : 'AI Field Scanner Running...'}
                  </span>
                  <span className="text-on-surface-variant text-[11px]">{scanStep}</span>
                </div>
              </div>
            )}

            {/* Diagnostic result feedback if scanned */}
            {scannedResults[selectedField.id] && !scanningFieldId && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                  verified
                </span>
                <div>
                  <span className="font-bold block">
                    {isMarathi ? 'स्थिती स्कॅन निष्कर्ष:' : 'Status Scan Result:'}
                  </span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {scannedResults[selectedField.id].status}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Immediate Status Scan & AI Camera Trigger */}
          <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
            <button
              onClick={() => handleTriggerImmediateScan(selectedField)}
              disabled={Boolean(scanningFieldId)}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {scanningFieldId ? 'progress_activity' : 'radar'}
              </span>
              <span>
                {scanningFieldId
                  ? (isMarathi ? 'स्कॅनिंग चालू आहे...' : 'Scanning Plot...')
                  : (isMarathi ? 'या शेताचे त्वरित स्थिती स्कॅन करा' : 'Trigger Immediate Status Scan')}
              </span>
            </button>

            {onScanField && (
              <button
                onClick={() => onScanField(selectedField)}
                className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">photo_camera</span>
                <span>{isMarathi ? 'कॅमेऱ्याने पान स्कॅन करा' : 'Open Leaf Diagnostic Scanner'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
