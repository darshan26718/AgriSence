import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Square, Play, Pause, FastForward, X, ChevronUp, ChevronDown } from 'lucide-react';
import { speechService, SpeakerState } from '../../services/speechService';

export const GlobalVoicePlayerBar: React.FC = () => {
  const [speakerState, setSpeakerState] = useState<SpeakerState>(() => speechService.getSpeakerState());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.subscribeSpeaker(state => {
      setSpeakerState(state);
      if (state.isSpeaking) {
        setIsMinimized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!speakerState.isSpeaking && !speakerState.isPaused) {
    return null;
  }

  const handleTogglePlayPause = () => {
    if (speakerState.isPaused) {
      speechService.resumeSpeaking();
    } else {
      speechService.pauseSpeaking();
    }
  };

  const handleStop = () => {
    speechService.stopSpeaking();
  };

  const handleSpeedCycle = () => {
    const rates = [0.8, 1.0, 1.2, 1.4];
    const currentIndex = rates.indexOf(speakerState.playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    speechService.setPlaybackRate(nextRate);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg select-none"
      >
        <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 ring-1 ring-white/10">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  AI Voice Speaker
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {speakerState.currentTitle || 'Agricultural Field Briefing'}
                </h4>
              </div>
            </div>

            {/* Sound Wave Animation Visualizer */}
            <div className="flex items-center gap-1 h-5 px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 shrink-0">
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.1s] h-4" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.15s] h-4.5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.25s] h-2.5" />
            </div>

            {/* Minimize / Close */}
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Stop and dismiss speaker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Spoken Text Snippet */}
          {!isMinimized && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              "{speakerState.currentText}"
            </p>
          )}

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
            {/* Speed Selector Button */}
            <button
              type="button"
              onClick={handleSpeedCycle}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold transition-all cursor-pointer border border-slate-700"
              title="Change Voice Speed"
            >
              {speakerState.playbackRate}x Speed
            </button>

            {/* Center Controls: Play/Pause, Stop */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlayPause}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {speakerState.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            </div>

            {/* Language indicator */}
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {speakerState.language || 'en-IN'}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
