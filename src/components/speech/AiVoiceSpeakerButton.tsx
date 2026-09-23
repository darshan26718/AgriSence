import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square, Play, Pause } from 'lucide-react';
import { speechService, SpeakerState } from '../../services/speechService';

export interface AiVoiceSpeakerButtonProps {
  text: string;
  title?: string;
  lang?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'pill' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onBeforeSpeak?: () => void;
}

export const AiVoiceSpeakerButton: React.FC<AiVoiceSpeakerButtonProps> = ({
  text,
  title,
  lang,
  label,
  variant = 'secondary',
  size = 'md',
  className = '',
  onBeforeSpeak,
}) => {
  const [speakerState, setSpeakerState] = useState<SpeakerState>(() => speechService.getSpeakerState());

  useEffect(() => {
    const unsubscribe = speechService.subscribeSpeaker(state => {
      setSpeakerState(state);
    });
    return () => unsubscribe();
  }, []);

  const isCurrent = speakerState.isSpeaking && speakerState.currentText === text;
  const isPaused = isCurrent && speakerState.isPaused;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      speechService.stopSpeaking();
    } else {
      if (onBeforeSpeak) onBeforeSpeak();
      speechService.speakText(text, {
        title: title || 'AgriSense Field Voice Speaker',
        lang: lang,
      });
    }
  };

  // Sound wave animation bars
  const renderWaveBars = () => (
    <span className="flex items-center gap-0.5 h-3.5 px-0.5">
      <span className="w-0.5 bg-current rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
      <span className="w-0.5 bg-current rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.15s] h-3.5" />
      <span className="w-0.5 bg-current rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.3s] h-2.5" />
      <span className="w-0.5 bg-current rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.1s] h-3" />
    </span>
  );

  // Icon only
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={isCurrent ? 'Stop speaking' : 'Listen with AI Voice Speaker'}
        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isCurrent
            ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
            : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
        } ${className}`}
      >
        {isCurrent ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
      </button>
    );
  }

  // Compact Pill / Table row
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          isCurrent
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
        } ${className}`}
      >
        {isCurrent ? renderWaveBars() : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
        <span>{isCurrent ? 'Stop' : (label || 'Listen')}</span>
      </button>
    );
  }

  // Primary / Pill / Outline / Secondary
  const baseClasses =
    'inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 rounded-2xl gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 rounded-2xl gap-2.5',
  }[size];

  const variantClasses = {
    primary: isCurrent
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md ring-2 ring-red-300'
      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg',
    secondary: isCurrent
      ? 'bg-emerald-600 text-white shadow-md'
      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300',
    outline: isCurrent
      ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
      : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 shadow-2xs',
    pill: isCurrent
      ? 'bg-slate-900 text-white ring-2 ring-emerald-400'
      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs',
    compact: '',
    icon: '',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isCurrent ? (
        <>
          {renderWaveBars()}
          <span>{isPaused ? 'Resume' : 'Stop Speaking'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 shrink-0 text-current" />
          <span>{label || '🔊 Listen to AI Voice Speaker'}</span>
        </>
      )}
    </button>
  );
};
