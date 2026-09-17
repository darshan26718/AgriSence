import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { DetectionResult } from '../../types/agri';
import { RiskBadge } from '../common/RiskBadge';
import { LeafVisualizer } from '../common/LeafVisualizer';
import { NavView } from '../layout/Sidebar';

interface DetectionHistoryViewProps {
  detections: DetectionResult[];
  setActiveView?: (view: NavView) => void;
  setSelectedDetectionForReport?: (det: DetectionResult) => void;
}

export const DetectionHistoryView: React.FC<DetectionHistoryViewProps> = ({
  detections,
  setActiveView,
  setSelectedDetectionForReport,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cropFilter, setCropFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<DetectionResult | null>(null);

  const filtered = detections.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrop = cropFilter === 'All' || d.crop.toLowerCase().includes(cropFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;

    return matchesSearch && matchesCrop && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Crop', 'Category', 'Condition', 'Confidence', 'Severity', 'Risk Level'];
    const rows = filtered.map(d => [
      d.id,
      `"${d.timestamp}"`,
      `"${d.crop}"`,
      d.category,
      `"${d.name}"`,
      (d.confidence * 100).toFixed(1) + '%',
      d.severity,
      d.risk_level,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crop_detection_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="detection-history-page" className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-4 text-xs text-slate-300 shadow-sm">
        <div className="flex items-start gap-3">
          <History className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              Pathology Inspection History &amp; Audit Trail
            </div>
            <p className="text-slate-400 leading-relaxed">
              Historical ledger of field leaf images, automated classifications, confidence scores, and applied management protocols.
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search detection archive by crop, condition, symptoms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 flex-1 sm:flex-none"
          >
            <option value="All">All Crops</option>
            <option value="Rice">Rice</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 flex-1 sm:flex-none"
          >
            <option value="All">All Categories</option>
            <option value="Disease">Disease</option>
            <option value="Pest">Pest</option>
          </select>
        </div>
      </div>

      {/* Table of Records */}
      <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp / ID</th>
                <th className="px-4 py-3">Crop</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map(item => (
                <tr
                  key={item.id}
                  id={`row-${item.id}`}
                  className="hover:bg-slate-700/30 transition-colors text-slate-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-200">{item.id}</div>
                    <div className="text-[10px] text-slate-400">{item.timestamp}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{item.crop}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.category === 'Disease'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${item.severity_pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-300">{item.severity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge level={item.risk_level} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                        title="View Detailed Diagnosis"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (setSelectedDetectionForReport) {
                            setSelectedDetectionForReport(item);
                          }
                          setActiveView?.('reports');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 transition-colors"
                        title="Generate Report"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">{selectedItem.id} • {selectedItem.timestamp}</span>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 mt-0.5">
                  {selectedItem.name} ({selectedItem.crop})
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-bold text-slate-200">{selectedItem.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-0.5">Risk Level</span>
                  <RiskBadge level={selectedItem.risk_level} size="sm" />
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-0.5">Confidence</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(selectedItem.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-200">Diagnostic Symptoms:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {(selectedItem.symptoms || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
              <span className="font-bold text-emerald-400">Immediate Action Plan:</span>
              <p className="text-slate-200 leading-relaxed">{selectedItem.management_immediate}</p>
              <span className="font-bold text-emerald-400 block pt-1">Bio/Cultural Controls:</span>
              <p className="text-slate-300 leading-relaxed">{selectedItem.management_biological}</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (setSelectedDetectionForReport) {
                    setSelectedDetectionForReport(selectedItem);
                  }
                  setSelectedItem(null);
                  setActiveView?.('reports');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Full Advisory Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
