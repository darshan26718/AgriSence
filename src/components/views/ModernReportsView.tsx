import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  Share2,
  FileCheck,
  X,
} from 'lucide-react';
import { FieldRecord } from '../../types/agri';

interface ModernReportsViewProps {
  fields: FieldRecord[];
  onShowToast: (msg: string) => void;
}

export const ModernReportsView: React.FC<ModernReportsViewProps> = ({
  fields = [],
  onShowToast,
}) => {
  const [activePreviewReport, setActivePreviewReport] = useState<string | null>(null);

  const reports = [
    {
      id: 'REP-HEALTH-01',
      title: 'Crop Health & Vigor Dossier',
      category: 'Crop Health Report',
      date: 'Generated Sep 17, 2026',
      summary: 'Comprehensive survey of 6 registered farm fields. Mean foliar health score is 87% with minor localized fungal rust vulnerability.',
      pages: '4 Pages',
    },
    {
      id: 'REP-DISEASE-02',
      title: 'Pathogen & Outbreak Risk Assessment',
      category: 'Disease Report',
      date: 'Generated Sep 15, 2026',
      summary: 'Epidemiological spore model analysis for Cotton Pink Bollworm and Asian Soybean Rust. Recommended CIBRC chemical & bio controls.',
      pages: '6 Pages',
    },
    {
      id: 'REP-FIELD-03',
      title: 'Cadastral Field & Soil Fertility Audit',
      category: 'Field Report',
      date: 'Generated Sep 10, 2026',
      summary: 'Plot 42/B & Basin South acreage soil moisture capacity, N-P-K mineral levels, and electrical conductivity telemetry.',
      pages: '8 Pages',
    },
    {
      id: 'REP-SCAN-04',
      title: 'AI Foliar Image Diagnostic Synthesis',
      category: 'AI Scan Report',
      date: 'Generated Sep 08, 2026',
      summary: 'Convolutional neural network Grad-CAM classification logs on Tomato Early Blight and Soybean Cercospora leaf spots.',
      pages: '3 Pages',
    },
  ];

  const handleDownload = (title: string) => {
    onShowToast(`Downloading official PDF: ${title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Reports & Insights</h2>
        <p className="text-sm text-slate-500">
          Official agronomy audits, disease surveillance documentation, and printable PDF reports.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(report => (
          <div
            key={report.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {report.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">{report.title}</h3>
                <span className="text-xs text-slate-400 block mt-0.5">{report.date} • {report.pages}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                {report.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{report.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePreviewReport(report.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownload(report.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {activePreviewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">{activePreviewReport}</h3>
                <span className="text-xs text-slate-500">Document Preview • Official Government Extension Standard</span>
              </div>
              <button
                onClick={() => setActivePreviewReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-3 font-mono text-slate-700 max-h-72 overflow-y-auto">
              <div className="border-b border-slate-200 pb-2 text-slate-900 font-bold">
                DEPARTMENT OF AGRICULTURAL ADVISORY & REVENUE<br />
                CROP INTELLIGENCE AUDIT RECORD #2026-AG-99
              </div>
              <p>Plot Register: 6 Fields verified under GPS cadastral surveillance.</p>
              <p>Pathogen Survey: Asian Soybean Rust identified under early warning matrix. Microclimate humidity 78%.</p>
              <p>CIBRC Chemical Allocation: Approved Azoxystrobin & Hexaconazole within standard ETL threshold.</p>
              <p>Soil Moisture Vafsa Status: 75.4% mean field capacity across root zones.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActivePreviewReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(activePreviewReport);
                  setActivePreviewReport(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
