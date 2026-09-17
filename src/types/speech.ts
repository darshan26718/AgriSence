export type VoiceCommandType =
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_SCAN'
  | 'NAVIGATE_ADVISORY'
  | 'NAVIGATE_RADAR'
  | 'NAVIGATE_OFFICERS'
  | 'NAVIGATE_DATASETS'
  | 'NAVIGATE_ANALYTICS'
  | 'NAVIGATE_FIELDS'
  | 'NAVIGATE_PREDICTION'
  | 'NAVIGATE_SMART_MGMT'
  | 'NAVIGATE_REPORTS'
  | 'NAVIGATE_BACK'
  | 'TRIGGER_CAPTURE'
  | 'FAST_SCAN_COUNTDOWN'
  | 'TOGGLE_TORCH'
  | 'FLIP_CAMERA'
  | 'CYCLE_ZOOM'
  | 'SELECT_CROP'
  | 'SWITCH_CAMERA_MODE'
  | 'TOGGLE_VOICE_FEEDBACK'
  | 'HELP'
  | 'UNKNOWN';

export type VoiceRecognitionStatus =
  | 'unsupported'
  | 'permission_denied'
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export interface ParsedVoiceCommand {
  type: VoiceCommandType;
  rawTranscript: string;
  matchedPhrase: string;
  confidence: number;
  cropParam?: 'cotton' | 'soybean' | 'tur' | 'sugarcane';
  description: string;
  marathiDescription: string;
  hindiDescription?: string;
}

export interface VoiceCommandGuideItem {
  category: 'Navigation' | 'Scanner Controls' | 'Crop Selection' | 'General';
  englishPhrases: string[];
  marathiPhrases: string[];
  hindiPhrases?: string[];
  actionDescription: string;
  sampleTestPhrase: string;
}

export interface VoiceHistoryItem {
  id: string;
  timestamp: Date;
  transcript: string;
  command: ParsedVoiceCommand;
  success: boolean;
}
