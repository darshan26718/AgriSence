/**
 * speechService.ts
 * High-performance Web Speech API manager for hands-free agricultural field operations.
 * Supports SpeechRecognition (Chrome, Edge, Safari, Android) and SpeechSynthesis with
 * dual English and Marathi command comprehension.
 */

import { ParsedVoiceCommand, VoiceCommandType, VoiceRecognitionStatus } from '../types/speech';

type SpeechStateListener = (state: {
  status: VoiceRecognitionStatus;
  transcript: string;
  interimTranscript: string;
  lastCommand: ParsedVoiceCommand | null;
  errorMessage: string | null;
}) => void;

class SpeechService {
  private recognition: any = null;
  private isContinuousMode: boolean = true;
  private isListeningActive: boolean = false;
  private currentLanguage: 'mr-IN' | 'en-IN' | 'hi-IN' | 'en-US' | 'kn-IN' | 'te-IN' = 'en-IN';
  private voiceResponsesEnabled: boolean = true;
  private listeners: Set<SpeechStateListener> = new Set();
  private audioCtx: AudioContext | null = null;
  private restartTimeout: any = null;

  // State snapshot
  private status: VoiceRecognitionStatus = 'idle';
  private transcript: string = '';
  private interimTranscript: string = '';
  private lastCommand: ParsedVoiceCommand | null = null;
  private errorMessage: string | null = null;

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  private initRecognition() {
    if (!this.isSupported()) {
      this.status = 'unsupported';
      this.notify();
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 2;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.status = 'listening';
        this.errorMessage = null;
        this.playAudioCue('start');
        this.notify();
      };

      this.recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalChunk += ' ' + text;
          } else {
            interimChunk += ' ' + text;
          }
        }

        finalChunk = finalChunk.trim();
        this.interimTranscript = interimChunk.trim();

        if (finalChunk) {
          this.transcript = finalChunk;
          this.status = 'processing';
          this.notify();

          const command = this.parseCommand(finalChunk);
          this.lastCommand = command;
          this.status = 'listening';

          if (command.type !== 'UNKNOWN') {
            this.playAudioCue('success');
            if (this.voiceResponsesEnabled) {
              const reply = this.currentLanguage.startsWith('mr')
                ? command.marathiDescription
                : this.currentLanguage.startsWith('hi')
                ? (command.hindiDescription || command.description)
                : command.description;
              this.speak(reply);
            }
          } else {
            this.playAudioCue('unrecognized');
          }

          this.notify();
        } else {
          this.notify();
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[SpeechService] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.status = 'permission_denied';
          this.errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          this.isListeningActive = false;
        } else if (event.error === 'no-speech') {
          // Normal timeout when farmer is silent in field - keep status as listening if active
          if (this.isListeningActive) {
            this.status = 'listening';
          }
        } else {
          this.errorMessage = `Microphone notice: ${event.error}`;
        }
        this.notify();
      };

      this.recognition.onend = () => {
        if (this.isListeningActive && this.isContinuousMode && this.status !== 'permission_denied') {
          // Graceful auto-restart for field continuity
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isListeningActive) {
              try {
                this.recognition.start();
              } catch {
                // ignore
              }
            }
          }, 300);
        } else {
          this.status = 'idle';
          this.notify();
        }
      };
    } catch (err: any) {
      this.status = 'error';
      this.errorMessage = err?.message || 'Speech Recognition failed to initialize.';
      this.notify();
    }
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    listener({
      status: this.status,
      transcript: this.transcript,
      interimTranscript: this.interimTranscript,
      lastCommand: this.lastCommand,
      errorMessage: this.errorMessage,
    });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = {
      status: this.status,
      transcript: this.transcript,
      interimTranscript: this.interimTranscript,
      lastCommand: this.lastCommand,
      errorMessage: this.errorMessage,
    };
    this.listeners.forEach(l => l(state));
  }

  public startListening(lang?: 'mr-IN' | 'en-IN' | 'hi-IN' | 'en-US') {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) return;

    if (lang && lang !== this.currentLanguage) {
      this.currentLanguage = lang;
      this.recognition.lang = lang;
    }

    this.isListeningActive = true;
    try {
      this.recognition.start();
    } catch {
      // If already started, ignore
    }
  }

  public stopListening() {
    this.isListeningActive = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.status = 'idle';
    this.playAudioCue('stop');
    this.notify();
  }

  public toggleListening(): boolean {
    if (this.isListeningActive) {
      this.stopListening();
      return false;
    } else {
      this.startListening();
      return true;
    }
  }

  public setLanguage(lang: 'mr-IN' | 'en-IN' | 'hi-IN' | 'en-US' | 'kn-IN' | 'te-IN') {
    this.currentLanguage = lang;
    if (this.recognition) {
      const wasListening = this.isListeningActive;
      if (wasListening) {
        this.recognition.stop();
      }
      this.recognition.lang = lang;
      if (wasListening) {
        setTimeout(() => this.recognition.start(), 200);
      }
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  public setVoiceResponsesEnabled(enabled: boolean) {
    this.voiceResponsesEnabled = enabled;
  }

  public isVoiceResponsesEnabled(): boolean {
    return this.voiceResponsesEnabled;
  }

  public setContinuousMode(continuous: boolean) {
    this.isContinuousMode = continuous;
  }

  public isContinuous(): boolean {
    return this.isContinuousMode;
  }

  /**
   * Speak text out loud using browser Text-to-Speech
   */
  public speak(text: string, customLang?: string) {
    if (!this.isSynthesisSupported() || !this.voiceResponsesEnabled) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = customLang || this.currentLanguage;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Find suitable voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = (customLang || this.currentLanguage).split('-')[0];
        const match = voices.find(v => v.lang.startsWith(langPrefix)) ||
                      voices.find(v => v.lang.includes('IN')) ||
                      voices.find(v => v.lang.startsWith('en'));
        if (match) {
          utterance.voice = match;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[SpeechService] Synthesis error:', e);
    }
  }

  /**
   * Audio tones via Web Audio API for tactical field feedback
   */
  private playAudioCue(type: 'start' | 'stop' | 'success' | 'unrecognized') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'start') {
        // Cheerful ascending double-tone (440 -> 660 Hz)
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'stop') {
        // Descending soft tone (550 -> 330 Hz)
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'success') {
        // High crisp confirmation bell (880 -> 1174 Hz)
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'unrecognized') {
        // Neutral subtle blip
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Robust multi-lingual voice command parser
   */
  public parseCommand(rawText: string): ParsedVoiceCommand {
    const clean = rawText
      .toLowerCase()
      .trim()
      .replace(/[.,?!;:_'"-]/g, ' ')
      .replace(/\s+/g, ' ');

    // 1. Shutter & AI Capture triggers
    const capturePhrases = [
      'capture', 'take photo', 'take picture', 'click photo', 'click picture',
      'snap', 'shoot', 'photo', 'click', 'capture leaf', 'scan now',
      'take a photo', 'take a picture', 'snap photo', 'capture now',
      'फोटो घ्या', 'फोटो काढा', 'फोटो', 'कॅप्चर', 'तपासा', 'पिक्चर घ्या',
      'photo ghya', 'photo kadha', 'photo kadh', 'snap kara', 'click kara',
      'chhavi lo', 'tasveer khincho', 'फोटो खींचो', 'तस्वीर लो', 'स्कैन करो', 'फोटो लो',
      'ಫೋಟೋ ತೆಗೆ', 'ಫೋಟೋ', 'ಚಿತ್ರ ತೆಗೆ', 'ಸ್ಕ್ಯಾನ್ ಮಾಡು',
      'ఫోటో తీయి', 'ఫోటో', 'చిత్రం తీయి', 'స్కాన్ చేయి'
    ];
    if (capturePhrases.some(p => clean.includes(p))) {
      return {
        type: 'TRIGGER_CAPTURE',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        description: 'Capturing crop leaf photo for AI diagnosis',
        marathiDescription: 'ರೋಗದ ಪತ್ತೆಗಾಗಿ ಫೋಟೋ ತೆಗೆಯಲಾಗುತ್ತಿದೆ',
        hindiDescription: 'రోగ నిర్ధారణ కోసం ఫోటో తీయబడుతోంది',
      };
    }

    // 2. Fast Scan Countdown ("fast scan", "quick scan", "scan with timer")
    const fastScanPhrases = [
      'fast scan', 'quick scan', 'auto scan', 'timer scan', 'झटपट स्कॅन', 'लगेच स्कॅन करा', 'zhatpat scan',
      'जल्दी स्कैन', 'तुरंत स्कैन', 'ವೇಗದ ಸ್ಕ್ಯಾನ್', 'త్వరిత స్కాన్'
    ];
    if (fastScanPhrases.some(p => clean.includes(p))) {
      return {
        type: 'FAST_SCAN_COUNTDOWN',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        description: 'Starting 3-second hands-free scan countdown',
        marathiDescription: 'ಮೂರು ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಆರಂಭವಾಗಲಿದೆ',
        hindiDescription: 'మూడు సెకన్లలో స్కాన్ ప్రారంభమవుతుంది',
      };
    }

    // 3. Navigation to AI Scanner
    const scanNavPhrases = [
      'open scanner', 'open camera', 'go to scanner', 'go to camera',
      'scan crop', 'crop scan', 'ai scan', 'ai scanner', 'scanner',
      'camera', 'detect disease', 'detect pest',
      'स्कॅनर उघडा', 'कॅमेरा उघडा', 'स्कॅनर', 'कॅमेरा', 'पीक स्कॅन करा', 'पीक स्कॅनर',
      'scanner ughada', 'camera ughada', 'pik scan kara', 'pik scan', 'scanner la ja',
      'स्कैनर खोलो', 'कैमरा खोलो', 'फसल स्कैन करो',
      'ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ', 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್', 'ಕ್ಯಾಮೆರಾ',
      'స్కానర్ తెరవండి', 'పంట స్కాన్', 'కెమెరా'
    ];
    if (scanNavPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_SCAN',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.92,
        description: 'Navigating to AI Crop Scanner',
        marathiDescription: 'AI ಬೆಳೆ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hindiDescription: 'AI పంట స్కానర్ తెరవబడుతోంది',
      };
    }

    // 4. Navigation to Advisory & Treatment
    const advisoryPhrases = [
      'advisory', 'open advisory', 'go to advisory', 'treatment', 'pesticide',
      'medicine', 'remedies', 'cibrc', 'recommendations', 'dosage', 'prescription',
      'सल्ला', 'सल्लागार', 'औषध', 'उपाय', 'कीटकनाशक', 'मात्रा',
      'salla', 'sallagar', 'aushadh', 'upay', 'advisory la ja', 'kitaknashak',
      'सलाह', 'उपचार', 'दवाई', 'कीटनाशक',
      'ಸಲಹೆ', 'ಚಿಕಿತ್ಸೆ', 'ಔಷಧ', 'ಕೃಷಿ ಸಲಹೆ',
      'సలహా', 'చికిత్స', 'మందు', 'వ్యవసాయ సలహా'
    ];
    if (advisoryPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_ADVISORY',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.92,
        description: 'Navigating to CIBRC Advisory and Treatments',
        marathiDescription: 'कृषी सल्ला आणि उपाय विभाग उघडत आहे',
        hindiDescription: 'कृषि सलाह और उपचार विभाग खोला जा रहा है',
      };
    }

    // 5. Navigation to Outbreak Radar / Map
    const radarPhrases = [
      'radar', 'outbreak', 'outbreak radar', 'map', 'pest map', 'disease radar',
      'infection map', 'community radar', 'hotspot',
      'राडार', 'उपाद्रव', 'नकाशा', 'उपाद्रव राडार', 'कीड नकाशा',
      'radar la ja', 'upadrav radar', 'nakasha', 'outbreak nakasha',
      'रडार', 'रोग प्रकोप', 'नक्शा'
    ];
    if (radarPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_RADAR',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.92,
        description: 'Navigating to Outbreak Radar',
        marathiDescription: 'कीड व रोग प्रादुर्भाव राडार उघडत आहे',
        hindiDescription: 'रोग प्रकोप रडार खोला जा रहा है',
      };
    }

    // 6. Navigation to Agriculture Officers / Krishi Kendra
    const officersPhrases = [
      'officers', 'officer', 'krishi officer', 'call officer', 'helpline',
      'expert', 'krishi kendra', 'extension', 'contact officer',
      'अधिकारी', 'कृषी अधिकारी', 'मदत', 'हेल्पलाइन', 'कृषी केंद्र',
      'adhikari', 'krishi adhikari', 'call kara', 'madat',
      'कृषि अधिकारी', 'मदद'
    ];
    if (officersPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_OFFICERS',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.92,
        description: 'Navigating to Krishi Officers and Emergency Contacts',
        marathiDescription: 'कृषी अधिकारी व मदत केंद्र उघडत आहे',
        hindiDescription: 'कृषि अधिकारी सहायता केंद्र खोला जा रहा है',
      };
    }

    // 7. Navigation to Home / Main Dashboard
    const homePhrases = [
      'home', 'go home', 'dashboard', 'main menu', 'first page',
      'होम', 'पहिले पान', 'डॅशबोर्ड', 'मुख्य पृष्ठ', 'घर',
      'ghar', 'home la ja', 'pahile pan', 'mukhyaprushta',
      'डैशबोर्ड'
    ];
    if (homePhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_HOME',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        description: 'Navigating to Home Dashboard',
        marathiDescription: 'मुख्य डॅशबोर्डवर जात आहे',
        hindiDescription: 'मुख्य डैशबोर्ड खोला जा रहा है',
      };
    }

    // 8. Navigation to Datasets & CSV Catalog
    const datasetsPhrases = [
      'dataset', 'datasets', 'csv', 'catalog', 'data catalog', 'data files',
      'डेटा', 'डेटासेट', 'माहिती', 'dataset ughada'
    ];
    if (datasetsPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_DATASETS',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening Agricultural Datasets & CSV Catalog',
        marathiDescription: 'कृषी डेटासेट व सीएसव्ही सूची उघडत आहे',
      };
    }

    // 9. Navigation to Field Analytics
    const analyticsPhrases = [
      'analytics', 'field analytics', 'charts', 'trends', 'आकडेवारी', 'विश्लेषण', 'analytics dakhav'
    ];
    if (analyticsPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_ANALYTICS',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening Agricultural Analytics',
        marathiDescription: 'शेत आकडेवारी व विश्लेषण उघडत आहे',
      };
    }

    // 10. Navigation to My Fields
    const fieldsPhrases = [
      'my fields', 'fields', 'farm', 'farms', 'शेती', 'माझी शेती', 'शेत', 'majhi sheti', 'shet'
    ];
    if (fieldsPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_FIELDS',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening My Farm Fields Manager',
        marathiDescription: 'माझी शेती व्यवस्थापन उघडत आहे',
      };
    }

    // 11. Navigation to ML Prediction
    const predictionPhrases = [
      'prediction', 'loss prediction', 'ml predict', 'crop loss', 'अंदाज', 'नुकसान अंदाज', 'andaj'
    ];
    if (predictionPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_PREDICTION',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening ML Crop Loss Predictor',
        marathiDescription: 'पीक नुकसान अंदाज मॉडेल उघडत आहे',
      };
    }

    // 12. Navigation to Smart Irrigation / Soil Management
    const smartMgmtPhrases = [
      'smart management', 'irrigation', 'water', 'soil nutrients', 'पाणी व्यवस्थापन', 'खत व्यवस्थापन'
    ];
    if (smartMgmtPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_SMART_MGMT',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening Soil & Water Smart Control',
        marathiDescription: 'माती व पाणी स्मार्ट व्यवस्थापन उघडत आहे',
      };
    }

    // 13. Navigation to Govt PDF Reports
    const reportsPhrases = [
      'report', 'reports', 'pdf report', 'ahwal', 'अहवाल', 'सरकारी अहवाल'
    ];
    if (reportsPhrases.some(p => clean.includes(p))) {
      return {
        type: 'NAVIGATE_REPORTS',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Opening Government Agronomic Reports',
        marathiDescription: 'शासकीय कृषी अहवाल उघडत आहे',
      };
    }

    // 14. Back / Return
    const backPhrases = ['go back', 'back', 'return', 'close', 'मागे', 'बंद करा', 'mage ja'];
    if (backPhrases.some(p => clean === p || clean.startsWith(p))) {
      return {
        type: 'NAVIGATE_BACK',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        description: 'Returning to previous screen',
        marathiDescription: 'मागील स्क्रीनवर परत जात आहे',
      };
    }

    // 15. Scanner Controls: Torch / Flash
    const torchPhrases = [
      'torch', 'flash', 'light', 'turn on light', 'torch on', 'flash on',
      'लाइट', 'टॉर्च', 'फ्लॅश', 'लाइट लावा', 'टॉर्च सुरू करा',
      'torch chalu kara', 'light chalu kara', 'flash lav'
    ];
    if (torchPhrases.some(p => clean.includes(p))) {
      return {
        type: 'TOGGLE_TORCH',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Toggling camera flashlight / torch',
        marathiDescription: 'कॅमेरा टॉर्च / फ्लॅश सुरू/बंद करत आहे',
      };
    }

    // 16. Scanner Controls: Flip Camera
    const flipPhrases = [
      'flip camera', 'switch camera', 'front camera', 'rear camera', 'change camera',
      'कॅमेरा बदला', 'पुढील कॅमेरा', 'मागील कॅमेरा', 'camera badla'
    ];
    if (flipPhrases.some(p => clean.includes(p))) {
      return {
        type: 'FLIP_CAMERA',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Switching camera between front and rear',
        marathiDescription: 'कॅमेरा समोरील/मागील बाजूस बदलत आहे',
      };
    }

    // 17. Scanner Controls: Cycle Zoom
    const zoomPhrases = [
      'zoom in', 'zoom out', 'zoom', 'magnify', 'झूम', 'झूम करा', 'zoom kara'
    ];
    if (zoomPhrases.some(p => clean.includes(p))) {
      return {
        type: 'CYCLE_ZOOM',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Adjusting camera optical zoom level',
        marathiDescription: 'कॅमेरा झूम स्तर बदलत आहे',
      };
    }

    // 18. Crop Selection: Cotton
    if (clean.includes('cotton') || clean.includes('कापूस') || clean.includes('kapus') || clean.includes('कपास')) {
      return {
        type: 'SELECT_CROP',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        cropParam: 'cotton',
        description: 'Selected crop: Cotton (Kapus)',
        marathiDescription: 'कापूस पीक निवडले',
        hindiDescription: 'कपास फसल चुनी गई',
      };
    }

    // 19. Crop Selection: Soybean
    if (clean.includes('soybean') || clean.includes('soya') || clean.includes('सोयाबीन')) {
      return {
        type: 'SELECT_CROP',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        cropParam: 'soybean',
        description: 'Selected crop: Soybean',
        marathiDescription: 'सोयाबीन पीक निवडले',
        hindiDescription: 'सोयाबीन फसल चुनी गई',
      };
    }

    // 20. Crop Selection: Tur / Pigeon Pea
    if (clean.includes('tur') || clean.includes('pigeon pea') || clean.includes('तूर') || clean.includes('arhar') || clean.includes('अरहर')) {
      return {
        type: 'SELECT_CROP',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        cropParam: 'tur',
        description: 'Selected crop: Pigeon Pea (Tur)',
        marathiDescription: 'तूर पीक निवडले',
        hindiDescription: 'अरहर (तूर) फसल चुनी गई',
      };
    }

    // 21. Crop Selection: Sugarcane
    if (clean.includes('sugarcane') || clean.includes('cane') || clean.includes('ऊस') || clean.includes('us') || clean.includes('गन्ना')) {
      return {
        type: 'SELECT_CROP',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        cropParam: 'sugarcane',
        description: 'Selected crop: Sugarcane (Us)',
        marathiDescription: 'ऊस पीक निवडले',
        hindiDescription: 'गन्ना फसल चुनी गई',
      };
    }

    // 22. Toggle Specimen / Demo mode
    if (clean.includes('demo') || clean.includes('specimen') || clean.includes('नमुना') || clean.includes('live camera')) {
      return {
        type: 'SWITCH_CAMERA_MODE',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.9,
        description: 'Switching camera source mode',
        marathiDescription: 'कॅमेरा मोड बदलत आहे',
        hindiDescription: 'कैमरा मोड बदला जा रहा है',
      };
    }

    // 23. Help / Guide
    if (clean.includes('help') || clean.includes('commands') || clean.includes('मदत') || clean.includes('काय बोलू') || clean.includes('मदद') || clean.includes('सहायता')) {
      return {
        type: 'HELP',
        rawTranscript: rawText,
        matchedPhrase: clean,
        confidence: 0.95,
        description: 'Opening Hands-Free Voice Commands Guide',
        marathiDescription: 'व्हॉइस कमांड मार्गदर्शक उघडत आहे',
        hindiDescription: 'वॉइस कमांड गाइड खोली जा रही है',
      };
    }

    return {
      type: 'UNKNOWN',
      rawTranscript: rawText,
      matchedPhrase: clean,
      confidence: 0.2,
      description: `Unrecognized command: "${rawText}"`,
      marathiDescription: `कमांड समजली नाही: "${rawText}"`,
    };
  }

  /**
   * Manually execute a command phrase (useful for quick chip clicks or testing)
   */
  public executeVoiceCommandString(phrase: string): ParsedVoiceCommand {
    this.transcript = phrase;
    const cmd = this.parseCommand(phrase);
    this.lastCommand = cmd;
    if (cmd.type !== 'UNKNOWN') {
      this.playAudioCue('success');
      if (this.voiceResponsesEnabled) {
        const reply = this.currentLanguage.startsWith('mr')
          ? cmd.marathiDescription
          : this.currentLanguage.startsWith('hi')
          ? (cmd.hindiDescription || cmd.description)
          : cmd.description;
        this.speak(reply);
      }
    }
    this.notify();
    return cmd;
  }
}

export const speechService = new SpeechService();
