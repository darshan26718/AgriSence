import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sliders,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { ParsedVoiceCommand, VoiceRecognitionStatus } from '../../types/speech';
import { VOICE_COMMANDS_GUIDE } from '../../data/voiceCommandsGuide';

interface FieldVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: VoiceRecognitionStatus;
  transcript: string;
  interimTranscript: string;
  lastCommand: ParsedVoiceCommand | null;
  errorMessage: string | null;
  onExecuteCommand: (cmd: ParsedVoiceCommand) => void;
  currentLanguage: 'mr-IN' | 'en-IN' | 'hi-IN' | 'en-US' | 'kn-IN' | 'te-IN';
  onLanguageChange: (lang: 'mr-IN' | 'en-IN' | 'hi-IN' | 'en-US' | 'kn-IN' | 'te-IN') => void;
  voiceResponsesEnabled: boolean;
  onToggleVoiceResponses: () => void;
  isContinuous: boolean;
  onToggleContinuous: () => void;
}

export const FieldVoiceAssistantModal: React.FC<FieldVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  status,
  transcript,
  interimTranscript,
  lastCommand,
  errorMessage,
  onExecuteCommand,
  currentLanguage,
  onLanguageChange,
  voiceResponsesEnabled,
  onToggleVoiceResponses,
  isContinuous,
  onToggleContinuous,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Scanner Controls' | 'Navigation' | 'Crop Selection'>('all');
  const isListening = status === 'listening';
  const isSupported = speechService.isSupported();

  if (!isOpen) return null;

  const filteredGuide =
    activeTab === 'all'
      ? VOICE_COMMANDS_GUIDE
      : VOICE_COMMANDS_GUIDE.filter(g => g.category === activeTab);

  const handleTestPhrase = (phrase: string) => {
    const cmd = speechService.executeVoiceCommandString(phrase);
    onExecuteCommand(cmd);
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
    } else {
      speechService.startListening(currentLanguage);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-emerald-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 font-display">
                  Hands-Free Field Voice Assistant
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-200 font-bold">
                    Web Speech API
                  </span>
                </h3>
                <p className="text-emerald-100 text-xs mt-0.5">
                  Voice navigation & instant AI crop shutter for work in the field
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
            {/* Listening Status & Visual Waveform Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isListening ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {isListening
                      ? '🎙️ Listening actively for commands...'
                      : status === 'permission_denied'
                      ? '❌ Microphone Permission Denied'
                      : !isSupported
                      ? '⚠️ Browser Speech Recognition Not Supported'
                      : 'Mic Inactive (Tap Start to Listen)'}
                  </span>
                </div>

                {/* Big Mic Toggle Button */}
                <button
                  onClick={handleToggleListening}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-600/20'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95 shadow-emerald-700/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
                </button>
              </div>

              {/* Animated Waveform Visualizer */}
              {isListening && (
                <div className="flex items-center justify-center gap-1.5 h-8 py-1 bg-white/70 rounded-xl border border-slate-200/50">
                  {[24, 40, 16, 56, 32, 48, 20, 60, 36, 50, 18, 44, 28, 52].map((height, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-emerald-600 rounded-full transition-all duration-150 animate-pulse"
                      style={{
                        height: `${Math.max(12, height * (0.4 + (i % 3) * 0.25))}px`,
                        animationDelay: `${i * 65}ms`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Live Transcript / Interim feedback */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 min-h-[56px] flex flex-col justify-center">
                {interimTranscript ? (
                  <p className="text-xs sm:text-sm text-emerald-700 font-semibold italic">
                    "{interimTranscript}..."
                  </p>
                ) : transcript ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Heard Phrase:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                      "{transcript}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center">
                    Speak clearly: <strong className="text-emerald-700">"Capture"</strong>,{' '}
                    <strong className="text-emerald-700">"Open Scanner"</strong>,{' '}
                    <strong className="text-emerald-700">"Advisory"</strong>,{' '}
                    <strong className="text-emerald-700">"कापूस" / "कपास"</strong>, or{' '}
                    <strong className="text-emerald-700">"Home"</strong>
                  </p>
                )}
              </div>

              {/* Last Action Executed Badge */}
              {lastCommand && (
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    lastCommand.type !== 'UNKNOWN'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">
                      Action:{' '}
                      {currentLanguage.startsWith('mr')
                        ? lastCommand.marathiDescription
                        : currentLanguage.startsWith('hi')
                        ? lastCommand.hindiDescription || lastCommand.description
                        : lastCommand.description}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 ml-2 flex-shrink-0">
                    {lastCommand.type}
                  </span>
                </div>
              )}

              {/* Error Message if blocked */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMessage}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Tip: You can use the quick test buttons below to test all voice-driven interactions immediately!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Settings Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Language Selection */}
              <div className="bg-slate-50 rounded-2xl p-3 flex flex-col gap-1.5 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  Speech Language
                </span>
                <select
                  value={currentLanguage}
                  onChange={e => onLanguageChange(e.target.value as any)}
                  className="w-full bg-white text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold border border-slate-200 cursor-pointer focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="mr-IN">Marathi (मराठी)</option>
                  <option value="hi-IN">Hindi (हिंदी)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              {/* Spoken Audio Feedback (TTS) */}
              <div className="bg-slate-50 rounded-2xl p-3 flex flex-col justify-between gap-1.5 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  {voiceResponsesEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  Spoken Feedback (TTS)
                </span>
                <button
                  onClick={onToggleVoiceResponses}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    voiceResponsesEnabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{voiceResponsesEnabled ? 'Voice Replies ON' : 'Voice Replies Muted'}</span>
                </button>
              </div>

              {/* Hands-Free Field Mode (Continuous) */}
              <div className="bg-slate-50 rounded-2xl p-3 flex flex-col justify-between gap-1.5 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-emerald-700" />
                  Continuous Mode
                </span>
                <button
                  onClick={onToggleContinuous}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    isContinuous
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{isContinuous ? 'Always Listening' : 'Push-to-Talk'}</span>
                </button>
              </div>
            </div>

            {/* Quick Voice Commands Guide & Fast Test Interactive Chips */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Voice Command Phrase Guide (EN / MR / HI)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Tap card to test command
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(['all', 'Scanner Controls', 'Navigation', 'Crop Selection'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'all' ? 'All Commands' : tab}
                  </button>
                ))}
              </div>

              {/* Guide Command Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {(filteredGuide || []).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTestPhrase(item.sampleTestPhrase)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between gap-1.5"
                    title={`Click to simulate: "${item.sampleTestPhrase}"`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs group-hover:text-emerald-900">
                          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span className="truncate">{(item.englishPhrases || []).slice(0, 2).join(' / ')}</span>
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium mt-0.5">
                          {(item.marathiPhrases || []).slice(0, 2).join(' / ')}
                          {item.hindiPhrases && item.hindiPhrases.length > 0 && (
                            <span className="text-slate-500"> • {item.hindiPhrases.slice(0, 2).join(' / ')}</span>
                          )}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        Test
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.actionDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Practice Best Practices Box */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 flex items-start gap-2.5 text-emerald-950">
              <Lightbulb className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold">Tips for Field Work:</strong> Connect earphones with mic. Say <span className="font-bold text-emerald-800">"Open Scanner"</span> (or <span className="font-bold text-emerald-800">"स्कॅनर उघडा"</span> / <span className="font-bold text-emerald-800">"स्कैनर खोलो"</span>), aim phone at affected leaf, then say <span className="font-bold text-emerald-800">"Capture"</span> to diagnose pests and pathogens completely hands-free!
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              {isListening ? '🎙️ Mic active in background' : 'Mic paused'}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
