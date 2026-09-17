import React, { useState } from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  Compass,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { CROPS_DATA } from '../../data/agriData';
import { AppLanguage, getLocale } from '../../locales';

interface ModernWeatherViewProps {
  language?: AppLanguage;
  onShowToast?: (msg: string) => void;
}

export const ModernWeatherView: React.FC<ModernWeatherViewProps> = ({
  language = 'en',
  onShowToast,
}) => {
  const t = getLocale(language).weather;
  const common = getLocale(language).common;

  // Live microclimate reading
  const currentWeather = {
    temp: 31,
    feelsLike: 34,
    humidity: 78,
    windSpeed: 12,
    rainfallMm: 4.5,
    rainProb: 65,
    soilMoisturePct: 74,
  };

  const [filterSuitability, setFilterSuitability] = useState<'all' | 'suitable' | 'moderate'>('all');
  const [selectedCropDetail, setSelectedCropDetail] = useState<any | null>(null);

  // Weather-driven agronomic suitability engine based on live temp (31°C) and humidity (78%)
  const suitableCrops = [
    {
      id: 'cotton',
      name: language === 'kn' ? 'ಹತ್ತಿ (Cotton)' : language === 'te' ? 'పత్తి (Cotton)' : 'Cotton',
      suitability: 'suitable' as const,
      badgeText: t.suitableBadge,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tempRange: '24°C - 35°C',
      waterReq: 'Medium (500-700 mm)',
      season: 'Kharif / Monsoon',
      reason:
        language === 'kn'
          ? 'ಪ್ರಸ್ತುತ 31°C ತಾಪಮಾನ ಮತ್ತು ಹಗಲಿನ ಬಿಸಿಲು ಹತ್ತಿ ಬೆಳೆಯ ಬೆಳವಣಿಗೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.'
          : language === 'te'
          ? 'ప్రస్తుత 31°C ఉష్ణోగ్రత మరియు తగినంత సూర్యరశ్మి పత్తి పంటకు చాలా అనుకూలంగా ఉంది.'
          : 'Current 31°C temperature and sunny daytime hours provide optimal vegetative vigor for cotton.',
    },
    {
      id: 'soybean',
      name: language === 'kn' ? 'ಸೋಯಾಬೀನ್ (Soybean)' : language === 'te' ? 'సోయాబీన్ (Soybean)' : 'Soybean',
      suitability: 'suitable' as const,
      badgeText: t.suitableBadge,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tempRange: '20°C - 32°C',
      waterReq: 'Moderate (450-650 mm)',
      season: 'Kharif',
      reason:
        language === 'kn'
          ? '78% ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ ಮತ್ತು ಸಾಧಾರಣ ಮಣ್ಣಿನ ತೇವಾಂಶವು ಬೀಜ ಮೊಳಕೆಯೊಡೆಯಲು ಅನುಕೂಲಕರವಾಗಿದೆ.'
          : language === 'te'
          ? '78% సాపేక్ష తేమ మరియు నేల తేమ విత్తన అంకురోత్పత్తికి సరైన వాతావరణం కల్పిస్తున్నాయి.'
          : 'High relative humidity (78%) and adequate field capacity moisture support active pod development.',
    },
    {
      id: 'tur',
      name: language === 'kn' ? 'ತೊಗರಿ (Pigeon Pea / Tur)' : language === 'te' ? 'కందులు (Red Gram / Tur)' : 'Pigeon Pea (Tur)',
      suitability: 'suitable' as const,
      badgeText: t.suitableBadge,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tempRange: '25°C - 35°C',
      waterReq: 'Low to Medium (350-500 mm)',
      season: 'Kharif Intercrop',
      reason:
        language === 'kn'
          ? 'ಉತ್ತಮ ಒಳಚರಂಡಿ ಇರುವ ಮಣ್ಣಿನಲ್ಲಿ 31°C ತಾಪಮಾನವು ತೊಗರಿ ಬೆಳೆಯ ಆಳವಾದ ಬೇರಿನ ಬೆಳವಣಿಗೆಗೆ ಸಹಕಾರಿಯಾಗಿದೆ.'
          : language === 'te'
          ? 'సరైన నీటి పారుదల ఉన్న నేలల్లో 31°C ఉష్ణోగ్రత కంది పంట వేర్ల పెరుగుదలకు అనుకూలం.'
          : 'Deep root system thrives in warm 30-33°C conditions and tolerates intermittent dry spells.',
    },
    {
      id: 'maize',
      name: language === 'kn' ? 'ಮೆಕ್ಕೆಜೋಳ (Maize / Corn)' : language === 'te' ? 'మొక్కజొన్న (Maize)' : 'Maize (Corn)',
      suitability: 'moderate' as const,
      badgeText: t.modSuitableBadge,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      tempRange: '21°C - 30°C',
      waterReq: 'Medium-High (500-800 mm)',
      season: 'Kharif & Rabi',
      reason:
        language === 'kn'
          ? 'ತಾಪಮಾನ ಸೂಕ್ತವಾಗಿದೆ, ಆದರೆ ಸಂಜೆಯ ಮಳೆಯಿಂದ ಕಾಂಡಕೊರಕ ಕೀಟಗಳ ಮೇಲೆ ನಿಗಾ ಇಡುವುದು ಅಗತ್ಯ.'
          : language === 'te'
          ? 'ఉష్ణోగ్రత అనుకూలమే, కానీ అధిక తేమ వల్ల తెగుళ్లు రాకుండా చూసుకోవాలి.'
          : 'Temperatures are favorable; monitor canopy for Fall Armyworm during warm humid periods.',
    },
    {
      id: 'sugarcane',
      name: language === 'kn' ? 'ಕಬ್ಬು (Sugarcane)' : language === 'te' ? 'చెరకు (Sugarcane)' : 'Sugarcane',
      suitability: 'moderate' as const,
      badgeText: t.highWaterBadge,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      tempRange: '26°C - 38°C',
      waterReq: 'Very High (1500-2500 mm)',
      season: 'Perennial / Annual',
      reason:
        language === 'kn'
          ? 'ಬೆಳವಣಿಗೆಗೆ ತಾಪಮಾನ ಉತ್ತಮವಾಗಿದೆ, ಆದರೆ ದೀರ್ಘಾವಧಿಯ ನಿರಂತರ ನೀರಾವರಿ ಮೂಲ ಅತ್ಯಗತ್ಯ.'
          : language === 'te'
          ? 'ఉష్ణోగ్రత బాగానే ఉంది, అయితే నిరంతర నీటి వనరులు సమృద్ధిగా ఉండాలి.'
          : 'Excellent thermal conditions for tillering, requires dedicated canal or borewell irrigation backup.',
    },
    {
      id: 'tomato',
      name: language === 'kn' ? 'ಟೊಮೆಟೊ (Tomato)' : language === 'te' ? 'టమోటా (Tomato)' : 'Tomato',
      suitability: 'moderate' as const,
      badgeText: t.modSuitableBadge,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
      tempRange: '18°C - 29°C',
      waterReq: 'Frequent Light Irrigation',
      season: 'Year-round Protected',
      reason:
        language === 'kn'
          ? 'ಪ್ರಸ್ತುತ 31°C ತಾಪಮಾನವು ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದ್ದು, ನೆರಳು ಪರದೆ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಸೂಕ್ತ.'
          : language === 'te'
          ? 'ప్రస్తుత 31°C ఉష్ణోగ్రత కొంత ఎక్కువ, డ్రిప్ ఇరిగేషన్ ద్వారా తగిన తేమ అందించాలి.'
          : 'Slightly higher daytime temperature; requires drip irrigation and staking to prevent fruit contact with wet soil.',
    },
  ];

  const filteredCrops = suitableCrops.filter(c => {
    if (filterSuitability === 'all') return true;
    return c.suitability === filterSuitability;
  });

  const hourly = [
    { time: '09:00', temp: 27, pop: 10, icon: Sun },
    { time: '12:00', temp: 31, pop: 25, icon: CloudSun },
    { time: '15:00', temp: 32, pop: 40, icon: CloudSun },
    { time: '18:00', temp: 29, pop: 65, icon: CloudRain },
    { time: '21:00', temp: 26, pop: 30, icon: CloudSun },
  ];

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

      {/* Farmer Weather Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Rain Alert */}
        <div className="p-4 rounded-3xl bg-blue-50 border border-blue-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <CloudRain className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-blue-950 font-display">
              {t.rainAlertTitle}
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              {t.rainAlertMsg}
            </p>
          </div>
        </div>

        {/* Temperature Alert */}
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 font-display">
              {t.tempAlertTitle}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t.tempAlertMsg}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Key Weather Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Temp */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.temp}</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-display">{currentWeather.temp}°C</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Feels {currentWeather.feelsLike}°C</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.humidity}</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-600 font-display">{currentWeather.humidity}%</span>
            <span className="text-[10px] text-orange-600 font-semibold block mt-0.5">Humid canopy</span>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.rainProb}</span>
            <CloudRain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-indigo-600 font-display">{currentWeather.rainProb}%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Post 17:00</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.windSpeed}</span>
            <Wind className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-display">{currentWeather.windSpeed} km/h</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Spray safe</span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rainfall 24h</span>
            <CloudRain className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-display">{currentWeather.rainfallMm} mm</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Light rain</span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.soilMoist}</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-700 font-display">{currentWeather.soilMoisturePct}%</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Optimal capacity</span>
          </div>
        </div>
      </div>

      {/* SECTION: Which crop is suitable for this weather? */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>{t.suitableCropsTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.suitableCropsSubtitle}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(['all', 'suitable', 'moderate'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterSuitability(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterSuitability === f
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'suitable' ? t.suitableBadge : t.modSuitableBadge}
              </button>
            ))}
          </div>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all space-y-3 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                    {crop.name}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${crop.badgeColor}`}>
                    {crop.badgeText}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.tempRange}</span>
                    <span className="font-bold text-slate-800">{crop.tempRange}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.waterReq}</span>
                    <span className="font-bold text-slate-800">{crop.waterReq}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.season}</span>
                  <span className="text-xs text-slate-700 font-medium">{crop.season}</span>
                </div>

                {/* Agronomic Reason */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-bold block mb-0.5">{t.reason}:</strong>
                  {crop.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Strip */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-display">
          {t.hourlyForecast}
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {hourly.map(h => {
            const Icon = h.icon;
            return (
              <div key={h.time} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{h.time}</span>
                <Icon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-slate-900">{h.temp}°C</span>
                <span className="text-[10px] text-blue-600 font-semibold">{h.pop}% rain</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
