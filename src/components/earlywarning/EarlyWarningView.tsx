import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface EarlyWarningViewProps {
  setActiveView?: (view: NavView) => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({ setActiveView }) => {
  // Live Simulated Microclimate Sensor Sliders
  const [temperature, setTemperature] = useState<number>(29.5); // deg C
  const [humidity, setHumidity] = useState<number>(88); // %
  const [rainfall, setRainfall] = useState<number>(18.5); // mm
  const [leafWetnessHours, setLeafWetnessHours] = useState<number>(14); // hours
  const [windSpeed, setWindSpeed] = useState<number>(12); // km/h
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');

  // Dynamic Multi-criteria Early Warning Index Calculation
  const simulationMetrics = useMemo(() => {
    let diseaseScore = 20;
    let pestScore = 20;

    // High humidity accelerates fungal sporulation
    if (humidity > 85) diseaseScore += 35;
    else if (humidity > 70) diseaseScore += 20;

    // Prolonged leaf wetness > 10 hours is prime fungal germination window
    if (leafWetnessHours >= 12) diseaseScore += 30;
    else if (leafWetnessHours >= 8) diseaseScore += 15;

    // Moderate warm temperature (24-30 C) with high humidity triggers blast / blight
    if (temperature >= 24 && temperature <= 32) diseaseScore += 15;

    // Warm temp + moderate humidity stimulates aphid / armyworm / whitefly reproduction
    if (temperature >= 28 && temperature <= 36) pestScore += 30;
    if (humidity >= 65 && humidity <= 85) pestScore += 25;
    if (windSpeed > 15) pestScore += 15; // wind disperses spores & small pests

    const overallRiskScore = Math.min(100, Math.round((diseaseScore * 0.6) + (pestScore * 0.4)));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (overallRiskScore >= 80) riskLevel = 'CRITICAL';
    else if (overallRiskScore >= 60) riskLevel = 'HIGH';
    else if (overallRiskScore >= 40) riskLevel = 'MODERATE';

    // Identified Outbreak Forecasts
    const activeThreats: string[] = [];
    if (humidity >= 80 && temperature >= 24) {
      activeThreats.push(`${selectedCrop} Fungal Blast & Leaf Blight (94% Probability)`);
    }
    if (humidity >= 75 && leafWetnessHours >= 10) {
      activeThreats.push('Bacterial Leaf Streak & Downy Mildew Spore Germination');
    }
    if (temperature >= 28 && humidity >= 65) {
      activeThreats.push('Brown Planthopper & Aphid Colony Population Explosion');
    }

    return {
      diseaseScore: Math.min(100, diseaseScore),
      pestScore: Math.min(100, pestScore),
      overallRiskScore,
      riskLevel,
      activeThreats,
    };
  }, [temperature, humidity, rainfall, leafWetnessHours, windSpeed, selectedCrop]);

  return (
    <div id="early-warning-page" className="space-y-6">
      {/* Overview Card */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <Radio className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            Automated Agricultural Early Warning System (EWS)
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">
              IoT Microclimate Node Simulation
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Continuously monitors field microclimate parameters to identify pre-symptomatic spore germination windows and insect pest reproduction surges before visible leaf damage appears.
          </p>
        </div>
      </div>

      {/* Main Grid: Live Sensor Controller & Predictive Outbreak Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sensor Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Live Sensor Telemetry Simulation
              </h3>
              <button
                onClick={() => {
                  setTemperature(26.0);
                  setHumidity(60);
                  setRainfall(2.0);
                  setLeafWetnessHours(4);
                  setWindSpeed(8);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Normal
              </button>
            </div>

            {/* Target Crop */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Monitored Crop</label>
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Rice (Paddy)">Rice (Paddy)</option>
                <option value="Wheat">Wheat</option>
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize</option>
              </select>
            </div>

            {/* Slider 1: Humidity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Relative Humidity (RH)
                </span>
                <span className={`font-mono font-bold ${humidity > 80 ? 'text-red-400' : 'text-slate-200'}`}>
                  {humidity}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="98"
                value={humidity}
                onChange={e => setHumidity(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>30% (Dry)</span>
                <span className="text-amber-400">&gt;80% Spore Germination</span>
                <span>98% (Saturated)</span>
              </div>
            </div>

            {/* Slider 2: Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Canopy Ambient Temperature
                </span>
                <span className="font-mono font-bold text-slate-200">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10°C (Cold)</span>
                <span className="text-emerald-400">24-30°C Incubation Peak</span>
                <span>45°C (Heatwave)</span>
              </div>
            </div>

            {/* Slider 3: Leaf Wetness Duration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  Leaf Wetness Duration
                </span>
                <span className={`font-mono font-bold ${leafWetnessHours > 10 ? 'text-red-400' : 'text-slate-200'}`}>
                  {leafWetnessHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={leafWetnessHours}
                onChange={e => setLeafWetnessHours(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1h (Dry Leaf)</span>
                <span className="text-red-400">&gt;10h Critical Penetration</span>
                <span>24h (Continuous)</span>
              </div>
            </div>

            {/* Slider 4: 24h Rainfall */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                  Accumulated Rainfall (24h)
                </span>
                <span className="font-mono font-bold text-slate-200">{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={rainfall}
                onChange={e => setRainfall(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Slider 5: Wind Speed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />
                  Wind Velocity
                </span>
                <span className="font-mono font-bold text-slate-200">{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={windSpeed}
                onChange={e => setWindSpeed(Number(e.target.value))}
                className="w-full accent-slate-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Dynamic Early Warning Gauge & Alert Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Risk Status Card */}
          <div
            id="ews-status-card"
            className={`p-6 rounded-2xl border shadow-xl space-y-5 transition-all duration-300 ${
              simulationMetrics.riskLevel === 'CRITICAL'
                ? 'bg-red-950/20 border-red-500/50 shadow-red-950/20'
                : simulationMetrics.riskLevel === 'HIGH'
                ? 'bg-amber-950/20 border-amber-500/50'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Current Threat Level
                </div>
                <h4 className="text-2xl font-black text-slate-100 flex items-center gap-2 mt-0.5">
                  {simulationMetrics.riskLevel} EPIDEMIC RISK
                </h4>
                <div className="text-xs text-slate-300 mt-1">
                  Computed for {selectedCrop} based on current microclimate telemetry
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Cumulative Index</div>
                  <div className="text-2xl font-mono font-black text-slate-100">
                    {simulationMetrics.overallRiskScore}/100
                  </div>
                </div>
                <RiskBadge level={simulationMetrics.riskLevel} size="lg" />
              </div>
            </div>

            {/* Visual Risk Gauge Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-400">Low (0-39)</span>
                <span className="text-yellow-400">Moderate (40-59)</span>
                <span className="text-amber-400">High (60-79)</span>
                <span className="text-red-400">Critical (80-100)</span>
              </div>
              <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    simulationMetrics.riskLevel === 'CRITICAL'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : simulationMetrics.riskLevel === 'HIGH'
                      ? 'bg-amber-500'
                      : simulationMetrics.riskLevel === 'MODERATE'
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${simulationMetrics.overallRiskScore}%` }}
                />
              </div>
            </div>

            {/* Split Disease vs Pest Risk Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs space-y-1">
                <div className="text-slate-400 font-medium">Disease Spore Risk Index</div>
                <div className="text-lg font-bold font-mono text-amber-400">{simulationMetrics.diseaseScore}/100</div>
                <div className="text-[11px] text-slate-400">High RH + Leaf Wetness</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs space-y-1">
                <div className="text-slate-400 font-medium">Pest Reproduction Vector Index</div>
                <div className="text-lg font-bold font-mono text-orange-400">{simulationMetrics.pestScore}/100</div>
                <div className="text-[11px] text-slate-400">Thermal + Dispersal Window</div>
              </div>
            </div>

            {/* Forecasted Outbreak Warnings */}
            <div className="space-y-2 pt-2 border-t border-slate-700/80">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Active Early Warning Advisories &amp; Pathogen Forecasts:
              </div>
              {simulationMetrics.activeThreats.length > 0 ? (
                <div className="space-y-2">
                  {simulationMetrics.activeThreats.map((threat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0 animate-ping" />
                      <div className="space-y-0.5">
                        <div className="font-bold">{threat}</div>
                        <div className="text-[11px] text-red-300/80">
                          Microclimate crosses the physiological threshold for rapid fungal hyphal growth or insect egg hatch.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No imminent pathogen outbreaks forecasted under current atmospheric conditions.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <button
                onClick={() => setActiveView?.('smart-management')}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors"
              >
                Proactive IPM Measures
              </button>

              <button
                onClick={() => setActiveView?.('ml-prediction')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Run Full ML Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
