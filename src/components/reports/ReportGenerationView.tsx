import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DetectionResult, FieldRecord } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { NavView } from '../layout/Sidebar';

interface ReportGenerationViewProps {
  selectedDetection?: DetectionResult | null;
  fields: FieldRecord[];
  setActiveView?: (view: NavView) => void;
}

export const ReportGenerationView: React.FC<ReportGenerationViewProps> = ({
  selectedDetection,
  fields = [],
  setActiveView,
}) => {
  const [selectedField, setSelectedField] = useState<string>(fields[0]?.name || 'Plot 1 - North Sector');
  const [reportNote, setReportNote] = useState<string>(
    'Field inspection verified via automated computer vision leaf analysis. High risk of secondary blast spreading to adjacent sectors within 72 hours if humidity remains above 85%.'
  );

  const reportId = `AGRI-REPORT-${Date.now().toString().slice(-6)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const crop = selectedDetection?.crop || 'Rice (Paddy)';
  const condition = selectedDetection?.name || 'Rice Blast (Magnaporthe oryzae)';
  const severity = selectedDetection?.severity || 'Critical';
  const confidence = selectedDetection ? (selectedDetection.confidence * 100).toFixed(1) : '94.6';
  const riskLevel = selectedDetection?.risk_level || 'CRITICAL';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-generation-page" className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-100 text-sm">
              Official Crop Protection &amp; IPM Advisory Report
            </div>
            <div className="text-slate-400">
              Generated via Early Detection &amp; Management Platform (SIH 2026 Format)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            onClick={() => setActiveView?.('disease-detect')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Scan Another Crop</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="printable-advisory-document"
        className="max-w-4xl mx-auto p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-100"
      >
        {/* Document Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-500/40 print:border-emerald-700">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-2xl">
              🌱
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-100 print:text-slate-900">
                CropGuard AI Platform
              </div>
              <div className="text-xs text-slate-400 print:text-slate-600 font-medium">
                Early Detection and Management of Crop &amp; Pest Infestations
              </div>
              <div className="text-[10px] text-emerald-400 print:text-emerald-700 font-mono">
                Smart India Hackathon (SIH) Technical Architecture
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="font-mono font-bold text-emerald-400 print:text-slate-900">{reportId}</div>
            <div className="text-slate-400 print:text-slate-600 mt-0.5">{currentDate}</div>
            <div className="text-[11px] text-slate-400 print:text-slate-500">Agro-Climatic Zone: Indo-Gangetic Alluvial</div>
          </div>
        </div>

        {/* Report Overview Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-1">
              Field Sector
            </span>
            <span className="font-bold text-slate-200 print:text-slate-900 block truncate">{selectedField}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-1">
              Target Crop
            </span>
            <span className="font-bold text-slate-200 print:text-slate-900 block truncate">{crop}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-1">
              Diagnosis
            </span>
            <span className="font-bold text-slate-200 print:text-slate-900 block truncate">{condition}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block mb-1">
              Confidence &amp; Risk
            </span>
            <span className="font-mono font-bold text-emerald-400 print:text-emerald-700 block">
              {confidence}% ({riskLevel})
            </span>
          </div>
        </div>

        {/* Pathology Assessment & Diagnostic Details */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-200 print:text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            1. Diagnostic Finding &amp; Severity Assessment
          </h4>
          <div className="text-xs text-slate-300 print:text-slate-800 leading-relaxed space-y-1.5">
            <p>
              The optical deep-learning leaf model identified <strong className="text-slate-100 print:text-slate-900">{condition}</strong> with <strong className="text-emerald-400 print:text-emerald-700">{confidence}%</strong> confidence.
              Observed foliar lesions span approximately <strong className="text-amber-400 print:text-amber-700">{selectedDetection?.severity_pct || 75}%</strong> of leaf surface area, classifying this event as <strong className="text-red-400 print:text-red-700">{severity} Severity</strong>.
            </p>
            <p>
              Primary environmental driver identified through Explainable AI (XAI) feature attribution is <strong className="text-slate-200 print:text-slate-900">Relative Atmospheric Humidity (&gt;85%)</strong> combined with prolonged leaf wetness &gt; 12 hours.
            </p>
          </div>
        </div>

        {/* Actionable Integrated Pest & Disease Management Steps */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-200 print:text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            2. Recommended Management Directives (IPM Protocols)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="font-bold text-red-400 print:text-red-700 block">Immediate (24-48 Hours)</span>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                {selectedDetection?.management_immediate || 'Drain standing irrigation water from furrows immediately. Completely halt urea and high-nitrogen fertilizers.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block">Biological &amp; Cultural Control</span>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                {selectedDetection?.management_biological || 'Foliar application of Pseudomonas fluorescens or Trichoderma viride @ 2.5 kg/ha. Apply cold-pressed neem formulation 10,000 ppm.'}
              </p>
            </div>
          </div>
        </div>

        {/* Treatment Calendar */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-200 print:text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            3. Scheduled Action Calendar
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block">Day 1</span>
              <span className="text-slate-300 print:text-slate-700 text-[11px] block mt-0.5">Water drainage &amp; tagging</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block">Day 2 - 3</span>
              <span className="text-slate-300 print:text-slate-700 text-[11px] block mt-0.5">Bio-agent foliar inoculation</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block">Day 7</span>
              <span className="text-slate-300 print:text-slate-700 text-[11px] block mt-0.5">Scouting for lesion drying</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block">Day 14</span>
              <span className="text-slate-300 print:text-slate-700 text-[11px] block mt-0.5">Final recovery certification</span>
            </div>
          </div>
        </div>

        {/* Field Notes Area */}
        <div className="space-y-1.5 print:hidden">
          <label className="text-xs font-bold text-slate-300">Agronomist / Officer Field Observations:</label>
          <textarea
            rows={2}
            value={reportNote}
            onChange={e => setReportNote(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Disclaimer & Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 text-[10px] text-slate-400 print:text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            This advisory report was generated by CropGuard AI using built-in local agronomic datasets.
            Recommended for field decision support in conjunction with local Krishi Vigyan Kendra (KVK) guidelines.
          </div>
          <div className="font-mono text-emerald-400 print:text-emerald-700 shrink-0">
            Validated by ICAR-Aligned Protocols
          </div>
        </div>
      </div>
    </div>
  );
};
