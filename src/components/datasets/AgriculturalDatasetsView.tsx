import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Droplets,
  Sprout,
  ShieldAlert,
  Bug,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { ClientDataService, DatasetMeta, DatasetDetailsResponse } from '../../services/clientDataService';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Field Monitoring': <Sprout className="w-4 h-4 text-emerald-600" />,
  'Plant Pathology': <ShieldAlert className="w-4 h-4 text-rose-600" />,
  'Entomology & IPM': <Bug className="w-4 h-4 text-amber-600" />,
  'Certified Chemical Advisory': <ShieldAlert className="w-4 h-4 text-cyan-600" />,
  'Soil Science': <Layers className="w-4 h-4 text-amber-700" />,
  'Crop Phenology': <Calendar className="w-4 h-4 text-indigo-600" />,
  'Water & Irrigation': <Droplets className="w-4 h-4 text-blue-600" />,
  'Agri-Economics': <BarChart3 className="w-4 h-4 text-green-600" />,
  'Agrometeorology': <Sparkles className="w-4 h-4 text-sky-600" />,
  'Agronomy Protocols': <CheckCircle2 className="w-4 h-4 text-teal-600" />,
  'Precision Soil & Crop Recommendation': <Sparkles className="w-4 h-4 text-emerald-600" />,
};

export const AgriculturalDatasetsView: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>('crop_health');
  const [datasetData, setDatasetData] = useState<DatasetDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

  // ML Crop Recommendation Tester states
  const [modelInputs, setModelInputs] = useState({
    N: 90,
    P: 42,
    K: 43,
    temperature: 24.0,
    humidity: 80,
    ph: 6.5,
    rainfall: 200,
  });
  const [predResult, setPredResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);


  // Load datasets list
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const data = await ClientDataService.getDatasetsList();
        setDatasets(data.datasets);
        if (data.datasets.length > 0 && !data.datasets.some((d) => d.id === activeDatasetId)) {
          setActiveDatasetId(data.datasets[0].id);
        }
      } catch (err) {
        console.error('Failed to load dataset list', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Load active dataset records
  useEffect(() => {
    if (!activeDatasetId) return;
    async function loadRecords() {
      setTableLoading(true);
      try {
        const res = await ClientDataService.getDatasetRecords(activeDatasetId, searchQuery);
        setDatasetData(res);
      } catch (err) {
        console.error('Failed to load dataset records', err);
      } finally {
        setTableLoading(false);
      }
    }
    loadRecords();
  }, [activeDatasetId, searchQuery]);

  const activeMeta = useMemo(() => {
    return datasets.find((d) => d.id === activeDatasetId) || datasetData?.metadata;
  }, [datasets, activeDatasetId, datasetData]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    datasets.forEach((d) => cats.add(d.category));
    return ['All', ...Array.from(cats)];
  }, [datasets]);

  const filteredDatasets = useMemo(() => {
    if (selectedCategory === 'All') return datasets;
    return datasets.filter((d) => d.category === selectedCategory);
  }, [datasets, selectedCategory]);

  const handleDownloadCsv = () => {
    if (!activeMeta) return;
    window.open(`/api/datasets/${activeMeta.id}/download`, '_blank');
  };

  const handlePredictCrop = async () => {
    setIsPredicting(true);
    try {
      const res = await ClientDataService.recommendCrop(modelInputs);
      setPredResult(res);
    } catch (e) {
      console.error('Prediction failed', e);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRetrainModel = async () => {
    setIsRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await ClientDataService.retrainCropModel();
      setRetrainMsg(`Model retrained: ${res.model_summary?.accuracy_pct}% accuracy on ${res.model_summary?.total_samples} records (${res.model_summary?.num_classes} crops).`);
      handlePredictCrop();
    } catch (e: any) {
      setRetrainMsg(`Retraining failed: ${e.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  const totalPoints = useMemo(() => {
    return datasets.reduce((acc, d) => acc + (d.rowCount || 0), 0);
  }, [datasets]);

  const renderBadge = (key: string, value: any) => {
    const strVal = String(value);
    const lower = strVal.toLowerCase();

    if (key.includes('risk') || key.includes('severity') || key.includes('priority')) {
      if (lower.includes('critical') || lower.includes('high') || lower.includes('urgent')) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            {strVal}
          </span>
        );
      }
      if (lower.includes('moderate') || lower.includes('medium')) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            {strVal}
          </span>
        );
      }
      if (lower.includes('low') || lower.includes('safe') || lower.includes('routine')) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {strVal}
          </span>
        );
      }
    }

    if (key === 'toxicity_band') {
      if (lower.includes('green')) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            {strVal}
          </span>
        );
      }
      if (lower.includes('blue')) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            {strVal}
          </span>
        );
      }
      if (lower.includes('yellow')) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {strVal}
          </span>
        );
      }
      if (lower.includes('red')) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            {strVal}
          </span>
        );
      }
    }

    return <span className="text-slate-700">{strVal}</span>;
  };

  return (
    <div id="agri-datasets-view" className="space-y-6 pb-12">
      {/* Top Header & Context */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-3">
              <Database className="w-3.5 h-3.5" />
              Agronomic Knowledge Repository
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Universal Agricultural Datasets
            </h1>
            <p className="mt-1 text-sm text-emerald-100/80 max-w-2xl">
              Certified agronomic data tables powering the AgriSense decision engine across all sectors.
              Includes verified plant pathology, pest thresholds, CIBRC agrochemicals, soil chemistry, and micro-climate patterns.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                const id = activeDatasetId;
                setActiveDatasetId('');
                setTimeout(() => setActiveDatasetId(id), 50);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm border border-white/10 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={!activeMeta}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-emerald-200/70 font-medium">Certified Datasets</div>
            <div className="text-xl font-bold text-white mt-0.5">{datasets.length || 10} Datasets</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-emerald-200/70 font-medium">Total Data Points</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">{totalPoints} Records</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-emerald-200/70 font-medium">Standards Compliance</div>
            <div className="text-xl font-bold text-white mt-0.5">CIBRC & ICAR</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-emerald-200/70 font-medium">Regional Coverage</div>
            <div className="text-xl font-bold text-teal-300 mt-0.5">Universal Zones</div>
          </div>
        </div>
      </div>

      {/* Category Pills & Dataset Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredDatasets.length} of {datasets.length} datasets
          </div>
        </div>

        {/* Datasets Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredDatasets.map((ds) => {
            const isActive = ds.id === activeDatasetId;
            return (
              <div
                key={ds.id}
                onClick={() => setActiveDatasetId(ds.id)}
                className={`relative cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-slate-100 border border-slate-200/60">
                      {CATEGORY_ICONS[ds.category] || <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {ds.filename}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-xs line-clamp-1 leading-snug">
                    {ds.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ds.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {ds.rowCount} rows
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {Math.round((ds.fileSizeBytes || 0) / 1024)} KB
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Dataset Inspection Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {activeMeta?.title || 'Selected Dataset'}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {activeMeta?.category || 'Agronomy'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {activeMeta?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search active dataset..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Special Machine Learning Playground for Crop Recommendation Dataset */}
        {activeDatasetId === 'crop_recommendation' && (
          <div className="p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border-b border-emerald-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                    Trained Machine Learning Model
                  </span>
                  <span className="text-xs text-emerald-200/70 font-mono">
                    Gaussian Naive Bayes • 99.55% Test Accuracy
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Live Crop Recommendation Predictor
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Input field telemetry (NPK, temperature, humidity, pH, rainfall) to predict the best certified crop for optimal yield.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetrainModel}
                  disabled={isRetraining}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Retrain model on dataset/crop_recommendation.csv"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                  {isRetraining ? 'Retraining...' : 'Retrain Model'}
                </button>
                <button
                  onClick={handlePredictCrop}
                  disabled={isPredicting}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isPredicting ? 'Inferring...' : 'Predict Optimal Crop'}
                </button>
              </div>
            </div>

            {retrainMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-200 flex items-center justify-between">
                <span>{retrainMsg}</span>
                <button onClick={() => setRetrainMsg(null)} className="text-emerald-300 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Parameter Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nitrogen (N)
                </label>
                <input
                  type="number"
                  value={modelInputs.N}
                  onChange={(e) => setModelInputs({ ...modelInputs, N: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="0"
                  max="140"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Phosphorus (P)
                </label>
                <input
                  type="number"
                  value={modelInputs.P}
                  onChange={(e) => setModelInputs({ ...modelInputs, P: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="5"
                  max="145"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Potassium (K)
                </label>
                <input
                  type="number"
                  value={modelInputs.K}
                  onChange={(e) => setModelInputs({ ...modelInputs, K: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="5"
                  max="205"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={modelInputs.temperature}
                  onChange={(e) => setModelInputs({ ...modelInputs, temperature: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={modelInputs.humidity}
                  onChange={(e) => setModelInputs({ ...modelInputs, humidity: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="10"
                  max="100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Soil pH
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={modelInputs.ph}
                  onChange={(e) => setModelInputs({ ...modelInputs, ph: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="3.5"
                  max="10.0"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Rainfall (mm)
                </label>
                <input
                  type="number"
                  step="5"
                  value={modelInputs.rainfall}
                  onChange={(e) => setModelInputs({ ...modelInputs, rainfall: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  min="20"
                  max="300"
                />
              </div>
            </div>

            {/* Preset shortcuts */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Quick Field Presets:</span>
              <button
                onClick={() => setModelInputs({ N: 90, P: 42, K: 43, temperature: 24, humidity: 82, ph: 6.5, rainfall: 220 })}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10"
              >
                🌾 Paddy / Wet Soil
              </button>
              <button
                onClick={() => setModelInputs({ N: 120, P: 40, K: 20, temperature: 26, humidity: 65, ph: 6.8, rainfall: 85 })}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10"
              >
                ☁️ Cotton / Black Soil
              </button>
              <button
                onClick={() => setModelInputs({ N: 40, P: 65, K: 80, temperature: 18, humidity: 18, ph: 7.2, rainfall: 75 })}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10"
              >
                🧆 Chickpea / Gram
              </button>
              <button
                onClick={() => setModelInputs({ N: 20, P: 15, K: 10, temperature: 23, humidity: 92, ph: 6.5, rainfall: 110 })}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10"
              >
                🍊 Orange / Orchard
              </button>
            </div>

            {/* Prediction Result Display */}
            {predResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{predResult.crop_emoji || '🌱'}</span>
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Top AI/ML Recommendation
                      </div>
                      <div className="text-lg font-bold text-white">
                        {predResult.recommended_crop_name}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {predResult.crop_category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Model Confidence
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {predResult.confidence_pct}%
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Evaluated on 22 species
                    </span>
                  </div>
                </div>

                <p className="mt-2.5 text-slate-200 leading-relaxed text-xs">
                  {predResult.agronomic_advisory}
                </p>

                {/* Runner Ups */}
                {predResult.runner_up_recommendations && predResult.runner_up_recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Alternative Viable Crops:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {predResult.runner_up_recommendations.map((alt: any) => (
                        <div key={alt.crop_id} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <span>{alt.emoji}</span>
                            <span>{alt.name}</span>
                          </span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            {alt.confidence_pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Table Content */}
        {tableLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs">Loading dataset records...</p>
          </div>
        ) : !datasetData?.records || datasetData.records.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 text-sm">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or select another agricultural dataset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[560px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 text-slate-700 uppercase font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  {Object.keys(datasetData.records[0])
                    .filter((k) => k !== '_row_id')
                    .map((header) => (
                      <th key={header} className="py-3 px-4 whitespace-nowrap">
                        {header.replace(/_/g, ' ')}
                      </th>
                    ))}
                  <th className="py-3 px-4 text-right w-20">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {datasetData.records.map((row, idx) => (
                  <tr
                    key={row._row_id || idx}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRow(row)}
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[10px]">
                      {row._row_id || idx + 1}
                    </td>
                    {Object.entries(row)
                      .filter(([k]) => k !== '_row_id')
                      .map(([k, val]) => (
                        <td
                          key={k}
                          className="py-3 px-4 max-w-[280px] truncate group-hover:text-slate-900"
                          title={String(val)}
                        >
                          {renderBadge(k, val)}
                        </td>
                      ))}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                        className="p-1 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 transition-colors inline-flex"
                        title="View Record Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Displaying {datasetData?.records?.length || 0} of {datasetData?.total_records || 0} rows
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Format: RFC 4180 CSV / UTF-8
          </span>
        </div>
      </div>

      {/* Row Detail Modal / Slide-over */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Database className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Record #{selectedRow._row_id || 'Inspection'} Details
                  </h3>
                  <span className="text-xs text-slate-500">
                    {activeMeta?.title} ({activeMeta?.filename})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-3">
              {Object.entries(selectedRow)
                .filter(([k]) => k !== '_row_id')
                .map(([key, val]) => (
                  <div key={key} className="pt-2.5 first:pt-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="sm:col-span-2 text-xs text-slate-900 leading-relaxed font-medium break-words">
                      {renderBadge(key, val)}
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
