import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, CheckCheck, Bell } from 'lucide-react';
import { PushNotificationAlert } from '../../types/notification';
import { AppLanguage, getLocale } from '../../locales';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PushNotificationAlert[];
  onDismissAlert: (id: string) => void;
  onDismissAll: () => void;
  onViewAdvisory: (alert: PushNotificationAlert) => void;
  language?: AppLanguage;
}

type NotificationFilter = 'ALL' | 'CRITICAL' | 'WARNING' | 'INFORMATION';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts = [],
  onDismissAlert,
  onDismissAll,
  onViewAdvisory,
  language = 'en',
}) => {
  const t = getLocale(language);
  const [filter, setFilter] = useState<NotificationFilter>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return a.riskLevel === 'CRITICAL';
    if (filter === 'WARNING') return a.riskLevel === 'HIGH' || a.riskLevel === 'MODERATE';
    return a.riskLevel === 'LOW';
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  {language === 'kn' ? 'ಸೂಚನೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು' : language === 'te' ? 'నోటిఫికేషన్లు & హెచ్చరికలు' : 'Notifications & Alerts'}
                </h2>
                <p className="text-xs text-slate-500">
                  {alerts.length} {language === 'kn' ? 'ಒಟ್ಟು ಎಚ್ಚರಿಕೆಗಳು' : language === 'te' ? 'మొత్తం హెచ్చరికలు' : 'total notifications'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFORMATION'] as NotificationFilter[]).map(cat => {
              const getCatLabel = () => {
                if (cat === 'ALL') {
                  return language === 'kn' ? `ಎಲ್ಲ (${alerts.length})` : language === 'te' ? `అన్నీ (${alerts.length})` : `All (${alerts.length})`;
                }
                if (cat === 'CRITICAL') {
                  return language === 'kn' ? 'ಗಂಭೀರ' : language === 'te' ? 'కీలకం' : 'Critical';
                }
                if (cat === 'WARNING') {
                  return language === 'kn' ? 'ಎಚ್ಚರಿಕೆ' : language === 'te' ? 'హెచ్చరిక' : 'Warning';
                }
                return language === 'kn' ? 'ಮಾಹಿತಿ' : language === 'te' ? 'సమాచారం' : 'Information';
              };

              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filter === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {getCatLabel()}
                </button>
              );
            })}
          </div>

          {/* Alert List Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center text-slate-400">
                <CheckCheck className="w-10 h-10 text-emerald-500/60 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {language === 'kn' ? 'ಎಲ್ಲವೂ ಸಾಮಾನ್ಯವಾಗಿದೆ!' : language === 'te' ? 'అన్నీ సాధారణంగా ఉన్నాయి!' : 'All caught up!'}
                </p>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5">
                  {language === 'kn'
                    ? 'ಈ ವರ್ಗದಲ್ಲಿ ಯಾವುದೇ ಹೊಸ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ. ನಿಮ್ಮ ಹೊಲಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ.'
                    : language === 'te'
                    ? 'ఈ విభాగంలో క్రియాశీల హెచ్చరికలు లేవు. మీ పొలాలు నిఘాలో ఉన్నాయి.'
                    : 'No active alerts in this category. Your field conditions are under surveillance.'}
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isCritical = alert.riskLevel === 'CRITICAL';
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-50/50 border-red-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold font-display">{alert.fieldName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alert.crop}
                        </span>
                      </div>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{alert.message}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => {
                          onViewAdvisory(alert);
                          onClose();
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        {language === 'kn' ? 'ಸಲಹೆ ನೋಡಿ →' : language === 'te' ? 'సలహా చూడండి →' : 'View Advisory →'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={onDismissAll}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : language === 'te' ? 'అన్నీ క్లియర్ చేయండి' : 'Clear All Notifications'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
