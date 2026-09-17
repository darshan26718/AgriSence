import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { PredictionInput, PredictionResult } from '../../services/aiEngine';
import { ClientDataService } from '../../services/clientDataService';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface MLPredictionViewProps {
  setActiveView?: (view: NavView) => void;
}

export const MLPredictionView: React.FC<MLPredictionViewProps> = ({ setActiveView }) => {
  const [crop, setCrop] = useState<string>('Rice (Paddy)');
  const [growthStage, setGrowthStage] = useState<string>('Tillering / Flowering');
  const [temperature, setTemperature] = useState<number>(28.5);
  const [humidity, setHumidity] = useState<number>(88);
  const [rainfall, setRainfall] = useState<number>(14.0);
  const [soilMoisture, setSoilMoisture] = useState<number>(76);
  const [prevHistory, setPrevHistory] = useState<boolean>(true);
  const [pestPressure, setPestPressure] = useState<'Low' | 'Medium' | 'High'>('High');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const runPrediction = async () => {
    setIsLoading(true);
    const input: PredictionInput = {
      crop,
      growth_stage: growthStage,
      temperature,
      humidity,
      rainfall,
      soil_moisture: soilMoisture,
      previous_disease_history: prevHistory,
      pest_pressure_level: pestPressure,
    };

    setTimeout(async () => {
      const result = await ClientDataService.predictRisk(input);
      setPrediction(result);
      setIsLoading(false);
    }, 350);
  };

  // Run initial prediction on load if null
  React.useEffect(() => {
    runPrediction();
  }, []);

  return (
    <div id="ml-prediction-page" className="space-y-6">
      {/* Header Overview */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
        <BrainCircuit className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            AI/ML Risk Prediction Engine with Transparent Explainable AI (XAI)
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              SHAP / Feature Attribution
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Evaluates agronomic microclimate parameters using an ensemble risk prediction model.
            Explicitly quantifies the exact contribution of each environmental factor and generates
            counterfactual "What-If" actionable recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-md space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-700">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Agronomic &amp; Environmental Inputs
            </h3>

            {/* Crop & Growth Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Crop</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Rice (Paddy)">Rice (Paddy)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Maize">Maize</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={e => setGrowthStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Seedling / Nursery">Seedling / Nursery</option>
                  <option value="Tillering / Vegetative">Tillering / Vegetative</option>
                  <option value="Flowering / Panicle">Flowering / Panicle</option>
                  <option value="Grain Filling / Boll">Grain Filling / Boll</option>
                </select>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Relative Humidity:</span>
                <span className="font-mono font-bold text-blue-400">{humidity}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="98"
                value={humidity}
                onChange={e => setHumidity(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Temperature:</span>
                <span className="font-mono font-bold text-amber-400">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="42"
                step="0.5"
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Rainfall */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Daily Rainfall:</span>
                <span className="font-mono font-bold text-cyan-400">{rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={rainfall}
                onChange={e => setRainfall(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Soil Moisture */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Soil Moisture:</span>
                <span className="font-mono font-bold text-emerald-400">{soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={soilMoisture}
                onChange={e => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Previous History & Pest Pressure */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Previous Disease</label>
                <button
                  type="button"
                  onClick={() => setPrevHistory(!prevHistory)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-colors text-center ${
                    prevHistory
                      ? 'bg-red-500/20 border-red-400 text-red-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {prevHistory ? 'Yes (Past Spores)' : 'No (Clean Soil)'}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Pest Pressure</label>
                <select
                  value={pestPressure}
                  onChange={e => setPestPressure(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Execute Model Button */}
            <button
              id="recompute-prediction-btn"
              onClick={runPrediction}
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Ensemble Inference...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  Compute Risk &amp; XAI Attribution
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Score Cards & XAI Feature Attribution (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {prediction && (
            <>
              {/* Prediction Summary Header */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Model Output
                    </div>
                    <h4 className="text-xl font-black text-slate-100 flex items-center gap-2 mt-0.5">
                      {prediction.predicted_health_status}
                    </h4>
                    <div className="text-xs text-slate-300">
                      Overall Health Score: <span className="font-bold text-emerald-400">{prediction.health_score}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-right">
                      <div className="text-[10px] text-slate-400">Confidence</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <RiskBadge level={prediction.overall_risk} size="lg" />
                  </div>
                </div>

                {/* Risk Levels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Disease Risk</div>
                    <div className="mt-1">
                      <RiskBadge level={prediction.disease_risk} size="sm" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Pest Risk</div>
                    <div className="mt-1">
                      <RiskBadge level={prediction.pest_risk} size="sm" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected Impact</div>
                    <div className="text-xs font-bold text-amber-400 mt-1">
                      {prediction.overall_risk === 'CRITICAL' ? 'Yield loss 25-40%' : prediction.overall_risk === 'HIGH' ? 'Yield loss 15-25%' : 'Minimal (<5%)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable AI (XAI) Feature Importance Chart */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Explainable AI (XAI) Feature Importance Breakdown
                    </h4>
                    <p className="text-xs text-slate-400">
                      Attribution percentage showing why the AI arrived at this risk verdict
                    </p>
                  </div>
                </div>

                {/* XAI Attribution Bar Chart */}
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prediction.xai_factors}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#94a3b8" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="factor" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={140} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        formatter={(val: any) => [`${val}%`, 'Attribution Weight']}
                      />
                      <Bar dataKey="contribution_pct" radius={[0, 6, 6, 0]}>
                        {(prediction.xai_factors || []).map((entry, index) => (
                          <Cell
                            key={`xai-${index}`}
                            fill={
                              entry.impact_direction === 'Increases Risk'
                                ? '#ef4444'
                                : entry.impact_direction === 'Reduces Risk'
                                ? '#10b981'
                                : '#f59e0b'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* "Why This Prediction?" Interpretation Cards */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    Why did the model reach this conclusion?
                  </div>
                  <div className="space-y-1.5">
                    {(prediction.xai_factors || []).slice(0, 3).map((f, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">{f.factor}</span>
                          <p className="text-[11px] text-slate-400">{f.description}</p>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                            f.impact_direction === 'Increases Risk'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {f.impact_direction} (+{f.contribution_pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Counterfactual "What-If" Simulation Insight */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Counterfactual "What If?" Farmer Guidance
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {prediction.counterfactual_tip}
                  </p>
                </div>

                {/* Next Step: Smart Management */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <span className="text-xs text-slate-400">
                    Next step in SIH journey: Apply integrated management
                  </span>
                  <button
                    onClick={() => setActiveView?.('smart-management')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>View Management &amp; IPM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
