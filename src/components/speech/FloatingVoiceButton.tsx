import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, HelpCircle, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { ParsedVoiceCommand, VoiceRecognitionStatus } from '../../types/speech';
import { AppLanguage } from '../../locales';

interface FloatingVoiceButtonProps {
  status: VoiceRecognitionStatus;
  transcript: string;
  interimTranscript: string;
  lastCommand: ParsedVoiceCommand | null;
  onOpenGuide: () => void;
  onExecuteCommand: (cmd: ParsedVoiceCommand) => void;
  language?: AppLanguage | string;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({
  status,
  transcript,
  interimTranscript,
  lastCommand,
  onOpenGuide,
  onExecuteCommand,
  language = 'en',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isListening = status === 'listening';

  const handleToggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.toggleListening();
  };

  const handleQuickCommand = (phrase: string) => {
    const cmd = speechService.executeVoiceCommandString(phrase);
    onExecuteCommand(cmd);
  };

  const getQuickChips = () => {
    if (language === 'kn') {
      return [
        { label: '📸 "ಫೋಟೋ ತೆಗೆ"', phrase: 'ಫೋಟೋ ತೆಗೆ' },
        { label: '⚡ "ವೇಗದ ಸ್ಕ್ಯಾನ್"', phrase: 'ವೇಗದ ಸ್ಕ್ಯಾನ್' },
        { label: '🌿 "ಸ್ಕ್ಯಾನರ್"', phrase: 'ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ' },
        { label: '💊 "ಸಲಹೆ"', phrase: 'ಸಲಹೆ' },
      ];
    }
    if (language === 'te') {
      return [
        { label: '📸 "ఫోటో తీయి"', phrase: 'ఫోటో తీయి' },
        { label: '⚡ "త్వరిత స్కాన్"', phrase: 'త్వరిత స్కాన్' },
        { label: '🌿 "స్కానర్"', phrase: 'స్కానర్ తెరవండి' },
        { label: '💊 "సలహా"', phrase: 'సలహా' },
      ];
    }
    if (language === 'Marathi') {
      return [
        { label: '📸 "फोटो घ्या"', phrase: 'फोटो घ्या' },
        { label: '⚡ "झटपट स्कॅन"', phrase: 'झटपट स्कॅन' },
        { label: '🌿 "स्कॅनर उघडा"', phrase: 'स्कॅनर उघडा' },
        { label: '🌾 "कापूस"', phrase: 'कापूस' },
        { label: '💊 "सल्ला"', phrase: 'सल्ला' },
        { label: '📡 "राडार"', phrase: 'राडार' },
      ];
    }
    if (language === 'Hindi') {
      return [
        { label: '📸 "फोटो खींचो"', phrase: 'फोटो खींचो' },
        { label: '⚡ "जल्दी स्कैन"', phrase: 'जल्दी स्कैन' },
        { label: '🌿 "स्कैनर खोलो"', phrase: 'स्कैनर खोलो' },
        { label: '🌾 "कपास"', phrase: 'कपास' },
        { label: '💊 "सलाह"', phrase: 'सलाह' },
        { label: '📡 "रडार"', phrase: 'रडार' },
      ];
    }
    return [
      { label: '📸 "Capture"', phrase: 'Capture' },
      { label: '⚡ "Fast Scan"', phrase: 'Fast scan' },
      { label: '🌿 "AI Scan"', phrase: 'Open scanner' },
      { label: '🌾 "Cotton"', phrase: 'Select Cotton' },
      { label: '💊 "Advisory"', phrase: 'Advisory' },
      { label: '📡 "Radar"', phrase: 'Radar' },
    ];
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 select-none pointer-events-none">
      {/* Live Heard Speech Speech Bubble */}
      <AnimatePresence>
        {(interimTranscript || (isListening && transcript)) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="pointer-events-auto max-w-xs bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 mb-1"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-bold">
                {interimTranscript ? 'Hearing Voice...' : 'Voice Recognized:'}
              </span>
              <p className="text-xs font-semibold truncate text-slate-100">
                "{interimTranscript || transcript}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Quick Action Dock */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-2.5 max-w-xs w-80 text-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Voice Assistant</span>
              </span>
              <button
                onClick={onOpenGuide}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer hover:underline"
              >
                <span>Full Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              {language === 'Marathi'
                ? 'शेतात काम करताना थेट बोला किंवा त्वरित कमांडवर टॅप करा:'
                : language === 'Hindi'
                ? 'खेत में काम करते हुए बोलें या नीचे दिए गए बटन दबाएं:'
                : 'Say commands hands-free or tap quick chips while working:'}
            </p>

            {/* Quick Test Chips */}
            <div className="grid grid-cols-2 gap-1.5">
              {getQuickChips().map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickCommand(chip.phrase)}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-700 active:text-white text-slate-700 hover:text-emerald-900 text-xs font-semibold text-left truncate transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100 mt-1">
              <span className="text-slate-500">
                Status:{' '}
                <strong className={isListening ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                  {isListening ? 'Listening 🎙️' : 'Paused ⏸️'}
                </strong>
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Floating Trigger Group */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Quick Expand / Settings Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-11 h-11 rounded-full bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-lg border border-slate-200 active:scale-95 transition-all cursor-pointer"
          title="Voice Commands Quick Menu & Guide"
          aria-label="Voice Commands Menu"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <HelpCircle className="w-5 h-5 text-emerald-700" />}
        </button>

        {/* Primary Mic Toggle Action Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated Pulsing Halo rings when listening */}
          {isListening && (
            <>
              <div className="absolute w-16 h-16 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
              <div className="absolute w-14 h-14 rounded-full bg-emerald-400/40 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={handleToggleListening}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all duration-200 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-emerald-400/40 shadow-rose-600/30'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30'
            }`}
            title={isListening ? 'Tap to Pause Voice Listening' : 'Tap to Start Hands-Free Voice Assistant'}
            aria-label={isListening ? 'Stop Voice Listening' : 'Start Voice Listening'}
            id="floating-voice-btn"
          >
            {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};
