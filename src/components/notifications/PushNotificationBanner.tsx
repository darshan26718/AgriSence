import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PushNotificationAlert } from '../../types/notification';

interface PushNotificationBannerProps {
  alerts: PushNotificationAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
  onViewAdvisory: (alert: PushNotificationAlert) => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
  onViewAdvisory,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active undismissed alerts
  const activeAlerts = alerts.filter(a => !a.isDismissed);

  if (activeAlerts.length === 0) {
    return null;
  }

  // Bound index safely
  const safeIndex = Math.min(currentIndex, activeAlerts.length - 1);
  const currentAlert = activeAlerts[safeIndex] || activeAlerts[0];

  const isCritical = currentAlert.severity === 'critical';
  const isHigh = currentAlert.severity === 'high';

  return (
    <div className="fixed top-20 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id={`alert-banner-${currentAlert.id}`}
            role="alert"
            aria-live="assertive"
            className={`w-full rounded-2xl shadow-xl backdrop-blur-md border p-3.5 sm:p-4 transition-all ${
              isCritical
                ? 'bg-rose-950/95 text-rose-50 border-rose-600/70 shadow-rose-950/30 ring-1 ring-rose-500/30'
                : isHigh
                ? 'bg-amber-950/95 text-amber-50 border-amber-600/70 shadow-amber-950/30 ring-1 ring-amber-500/30'
                : 'bg-emerald-950/95 text-emerald-50 border-emerald-600/70 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
            }`}
          >
            {/* Header row: Badge, Field Name, Multi-alert pager, and Controls */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {/* Pulsating Severity Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs tracking-wider uppercase bg-white/15 backdrop-blur-sm border border-white/20">
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${
                      isCritical ? 'bg-rose-400' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span>
                    {isCritical ? 'CRITICAL DETECTION' : isHigh ? 'HIGH RISK ALERT' : 'WARNING'}
                  </span>
                </div>

                {/* Target Field Pill */}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold truncate max-w-[240px]">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate">{currentAlert.fieldName}</span>
                  <span className="opacity-60 font-normal">({currentAlert.crop})</span>
                </div>

                {/* Timestamp */}
                <span className="text-xs opacity-75 hidden sm:inline">
                  {currentAlert.timestamp}
                </span>
              </div>

              {/* Top-right action controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Mute/Sound toggle */}
                <button
                  onClick={onToggleSound}
                  title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
                  className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Sound"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {soundEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                </button>

                {/* Configure Thresholds */}
                <button
                  onClick={onOpenSettings}
                  title="Configure AI Detection Thresholds"
                  className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Configure Thresholds"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>

                {/* Dismiss current alert */}
                <button
                  onClick={() => onDismiss(currentAlert.id)}
                  title="Dismiss Alert"
                  className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Dismiss Alert"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Alert Body & Metric Comparison */}
            <div className="mt-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm sm:text-base flex items-center gap-1.5 leading-snug">
                  <span>{currentAlert.title}</span>
                </div>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5 leading-relaxed line-clamp-2">
                  {currentAlert.message}
                </p>

                {/* CIBRC Advisory recommendation excerpt */}
                {currentAlert.cibrcAdvisorySnippet && (
                  <div className="mt-2 text-xs flex items-start gap-1.5 p-2 rounded-lg bg-black/25 border border-white/10 font-mono">
                    <span className="material-symbols-outlined text-[15px] flex-shrink-0 mt-0.5 text-emerald-400">
                      verified
                    </span>
                    <span className="line-clamp-2">
                      <strong className="text-emerald-300 font-sans">CIBRC Action: </strong>
                      {currentAlert.cibrcAdvisorySnippet}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Metrics & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 pt-1 md:pt-0">
                {/* Threshold Metric Box */}
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between sm:flex-col sm:items-end text-xs">
                  <span className="opacity-75">{currentAlert.metricLabel}</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                    <span className={isCritical ? 'text-rose-300' : 'text-amber-300'}>
                      {currentAlert.metricValue}
                    </span>
                    <span className="opacity-60 text-[11px] font-sans">
                      (Limit: {currentAlert.thresholdExceeded})
                    </span>
                  </div>
                </div>

                {/* Primary CTA button: View Advisory Plan */}
                <button
                  onClick={() => onViewAdvisory(currentAlert)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                    isCritical
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                  }`}
                >
                  <span>Advisory Plan</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Bottom Multi-Alert Pager (if >1 field has exceeded threshold) */}
            {activeAlerts.length > 1 && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 opacity-85">
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  <span>
                    Field Threat <strong>{safeIndex + 1}</strong> of <strong>{activeAlerts.length}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={safeIndex === 0}
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Previous Alert"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  <button
                    disabled={safeIndex >= activeAlerts.length - 1}
                    onClick={() => setCurrentIndex(prev => Math.min(activeAlerts.length - 1, prev + 1))}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Next Alert"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>

                  <button
                    onClick={onDismissAll}
                    className="ml-2 px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Dismiss All
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
