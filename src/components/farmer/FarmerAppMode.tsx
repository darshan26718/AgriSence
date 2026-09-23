import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  Droplets,
  CloudSun,
  PhoneCall,
  Pill,
  ShieldAlert,
  Download,
  Volume2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AppLanguage, AVAILABLE_LANGUAGES, getLocale } from '../../locales';
import { FieldRecord } from '../../types/agri';
import { PushNotificationAlert } from '../../types/notification';
import { AiVoiceSpeakerButton } from '../speech/AiVoiceSpeakerButton';

interface FarmerAppModeProps {
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onNavigateToScan: () => void;
  onNavigateToVoice: () => void;
  onNavigateToWeather: () => void;
  onNavigateToIrrigation: () => void;
  onNavigateToAdvisory: (crop?: string) => void;
  onNavigateToDoctors: () => void;
  onNavigateToEarlyWarning: () => void;
  onSwitchToAdvancedMode: () => void;
  fields?: FieldRecord[];
  activeAlerts?: PushNotificationAlert[];
}

export const FarmerAppMode: React.FC<FarmerAppModeProps> = ({
  language,
  onSelectLanguage,
  onNavigateToScan,
  onNavigateToVoice,
  onNavigateToWeather,
  onNavigateToIrrigation,
  onNavigateToAdvisory,
  onNavigateToDoctors,
  onNavigateToEarlyWarning,
  onSwitchToAdvancedMode,
  fields = [],
  activeAlerts = [],
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallHelp, setShowInstallHelp] = useState<boolean>(false);

  useEffect(() => {
    // Listen for PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  // Farmer specific translations / friendly text
  const farmerContent = {
    hi: {
      greeting: 'नमस्ते किसान भाई',
      subtitle: 'आपकी फसल का सच्चा साथी • एग्रीसेंस',
      listenBriefing: '🔊 आज का कृषि बुलेटिन सुनें',
      briefingAudio: 'नमस्ते किसान भाई! आज मौसम साफ है और धूप खिली रहेगी। कीटनाशक छिड़काव और खाद देने के लिए आज का दिन बहुत अनुकूल है। आपके खेतों में नमी 75 प्रतिशत है, अगले 2 दिन सिंचाई की आवश्यकता नहीं है। किसी भी बीमारी के लिए नीचे दिए गए हरे बटन से पत्ती की फोटो खींचें।',
      weatherSummary: 'आज का मौसम: साफ और खिली धूप (31°C)',
      sprayAdvice: '✅ कीटनाशक छिड़काव के लिए आज अनुकूल समय है',
      pwaBannerTitle: '📱 अपने फोन में AgriSense ऐप डालें',
      pwaBannerSub: 'इंटरनेट धीमा होने पर भी तेज चलेगा • होम स्क्रीन पर जोड़ें',
      installBtn: 'ऐप इंस्टॉल करें',
      cards: {
        scan: {
          title: 'पत्ती की फोटो खींचें',
          sub: 'रोग व कीट की तुरंत पहचान और सही दवा',
          btn: 'कैमरा खोलें',
          badge: 'सबसे उपयोगी',
        },
        voice: {
          title: 'बोलकर सलाह लें',
          sub: 'कृषि एआई से हिंदी में कोई भी सवाल पूछें',
          btn: 'माइक दबाकर बोलें',
          badge: 'आवाज सहायक',
        },
        water: {
          title: 'पानी और सिंचाई',
          sub: 'मिट्टी में 75% नमी • 2 दिन पानी न दें',
          btn: 'नमी जांचें',
          badge: 'बचत सलाह',
        },
        weather: {
          title: 'मौसम और बारिश',
          sub: 'अगले 7 दिनों का मौसम पूर्वानुमान देखें',
          btn: 'मौसम देखें',
          badge: 'ताजा रिपोर्ट',
        },
        doctor: {
          title: 'कृषि डॉक्टर से बात करें',
          sub: 'नजदीकी केंद्र या किसान कॉल सेंटर 1800-180-1551',
          btn: 'कॉल करें / केंद्र खोजें',
          badge: 'मुफ्त सहायता',
        },
        dosage: {
          title: 'खाद और दवा की मात्रा',
          sub: 'एक एकड़ के लिए सही मात्रा और प्रमाणिक दवाएं',
          btn: 'खुराक जानें',
          badge: 'CIBRC प्रमाणित',
        },
        warning: {
          title: 'इलाके में रोग का खतरा',
          sub: 'आसपास के खेतों में कीट/फफूंद चेतावनी रडार',
          btn: 'खतरा देखें',
          badge: 'सावधानी',
        },
      },
      switchAdvanced: 'विस्तृत अनुसंधान और ग्राफ दृश्य (Agronomist Mode)',
    },
    kn: {
      greeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ',
      subtitle: 'ನಿಮ್ಮ ಬೆಳೆಯ ನಿಷ್ಠಾವಂತ ಮಿತ್ರ • ಅಗ್ರಿಸೆನ್ಸ್',
      listenBriefing: '🔊 ಇಂದಿನ ಕೃಷಿ ವರದಿ ಕೇಳಿ',
      briefingAudio: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಇಂದು ಹವಾಮಾನ ಅನುಕೂಲಕರವಾಗಿದೆ. ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಉತ್ತಮ ದಿನ. ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ಶೇಕಡಾ 75 ರಷ್ಟಿದೆ. ಬೆಳೆ ರೋಗ ಪರೀಕ್ಷೆ ಮಾಡಲು ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
      weatherSummary: 'ಇಂದಿನ ಹವಾಮಾನ: ಬಿಸಿಲು ಮತ್ತು ಶುಭ್ರ (31°C)',
      sprayAdvice: '✅ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಇಂದು ಸೂಕ್ತ ಸಮಯ',
      pwaBannerTitle: '📱 ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಆ್ಯಪ್ ಸ್ಥಾಪಿಸಿ',
      pwaBannerSub: 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸುಲಭ ಬಳಕೆ • ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ',
      installBtn: 'ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್',
      cards: {
        scan: {
          title: 'ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ',
          sub: 'ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಪರಿಹಾರ ಔಷಧಿ',
          btn: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
          badge: 'ಮುಖ್ಯ ಸೇವೆ',
        },
        voice: {
          title: 'ಮಾತನಾಡಿ ಪರಿಹಾರ ಪಡೆಯಿರಿ',
          sub: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ',
          btn: 'ಧ್ವನಿ ಸಹಾಯಕ',
          badge: 'ಧ್ವನಿ',
        },
        water: {
          title: 'ನೀರಾವರಿ ಮಾಹಿತಿ',
          sub: 'ಮಣ್ಣಿನ ತೇವಾಂಶ 75% • 2 ದಿನ ನೀರು ಅಗತ್ಯವಿಲ್ಲ',
          btn: 'ತೇವಾಂಶ ನೋಡಿ',
          badge: 'ಉಳಿತಾಯ',
        },
        weather: {
          title: 'ಹವಾಮಾನ ಮತ್ತು ಮಳೆ',
          sub: 'ಮುಂದಿನ 7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
          btn: 'ಹವಾಮಾನ ನೋಡಿ',
          badge: 'ಲೈವ್',
        },
        doctor: {
          title: 'ಕೃಷಿ ತಜ್ಞರ ಸಂಪರ್ಕ',
          sub: 'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551',
          btn: 'ಕರೆ ಮಾಡಿ',
          badge: 'ಉಚಿತ',
        },
        dosage: {
          title: 'ಗೊಬ್ಬರ ಮತ್ತು ಔಷಧ ಪ್ರಮಾಣ',
          sub: 'ಪ್ರತಿ ಎಕರೆಗೆ ಸರಿಯಾದ ಔಷಧ ಪ್ರಮಾಣ ಮಾಹಿತಿ',
          btn: 'ಪ್ರಮಾಣ ಲೆಕ್ಕಾಚಾರ',
          badge: 'ಪ್ರಮಾಣಿತ',
        },
        warning: {
          title: 'ಪ್ರದೇಶದ ರೋಗ ಎಚ್ಚರಿಕೆ',
          sub: 'ಸಮೀಪದ ಜಮೀನುಗಳಲ್ಲಿನ ಕೀಟ ಬಾಧೆ ಎಚ್ಚರಿಕೆ',
          btn: 'ಎಚ್ಚರಿಕೆ ನೋಡಿ',
          badge: 'ಜಾಗರೂಕತೆ',
        },
      },
      switchAdvanced: 'ವಿವರವಾದ ಗ್ರಾಫ್ ಮತ್ತು ತಜ್ಞರ ವೀಕ್ಷಣೆ (Advanced Mode)',
    },
    te: {
      greeting: 'నమస్కారం రైతు సోదరులారా',
      subtitle: 'మీ పంటకు నమ్మకమైన నేస్తం • అగ్రిసెన్స్',
      listenBriefing: '🔊 నేటి వ్యవసాయ బులెటిన్ వినండి',
      briefingAudio: 'నమస్కారం రైతు సోదరులారా! ఈరోజు వాతావరణం అనుకూలంగా ఉంది. మందుల పిచికారీకి అనువైన రోజు. మీ నేలలో తేమ 75 శాతంగా ఉంది. పంట వ్యాధి పరీక్ష కోసం ఆకు ఫోటో తీయండి.',
      weatherSummary: 'నేటి వాతావరణం: నిర్మలమైన ఎండ (31°C)',
      sprayAdvice: '✅ పురుగుమందుల పిచికారీకి ఈరోజు సరైన సమయం',
      pwaBannerTitle: '📱 మీ ఫోన్‌లో యాప్‌ను ఇన్‌స్టాల్ చేయండి',
      pwaBannerSub: 'సులువుగా హోమ్ స్క్రీన్‌కు చేర్చండి • వేగంగా పనిచేస్తుంది',
      installBtn: 'యాప్ పొందండి',
      cards: {
        scan: {
          title: 'ఆకు ఫోటో తీయండి',
          sub: 'తక్షణ వ్యాధి నిర్ధారణ మరియు సరైన మందుల వివరాలు',
          btn: 'కెమెరా తెరవండి',
          badge: 'అత్యవసరం',
        },
        voice: {
          title: 'మాట్లాడి సమాధానం పొందండి',
          sub: 'తెలుగులో ఏదైనా వ్యవసాయ ప్రశ్న అడగండి',
          btn: 'మాట్లాడండి',
          badge: 'వాయిస్',
        },
        water: {
          title: 'నీటి యాజమాన్యం',
          sub: 'నేల తేమ 75% • 2 రోజులు నీరు అవసరం లేదు',
          btn: 'తేమ చూడండి',
          badge: 'పొదుపు',
        },
        weather: {
          title: 'వాతావరణం మరియు వర్షం',
          sub: 'రాబోయే 7 రోజుల వాతావరణ నివేదిక',
          btn: 'వాతావరణం',
          badge: 'లైవ్',
        },
        doctor: {
          title: 'వ్యవసాయ డాక్టర్ సహాయం',
          sub: 'కిసాన్ కాల్ సెంటర్ 1800-180-1551',
          btn: 'కాల్ చేయండి',
          badge: 'ఉచితం',
        },
        dosage: {
          title: 'ఎరువులు మరియు మందుల మోతాదు',
          sub: 'ఎకరానికి సరైన మోతాదు వివరాలు',
          btn: 'మోతాదు లెక్కించండి',
          badge: 'ధృవీకరించబడింది',
        },
        warning: {
          title: 'ప్రాంతీయ వ్యాధి హెచ్చరిక',
          sub: 'పరిసర పొలాల్లో తెగుళ్ళ రాడార్ హెచ్చరిక',
          btn: 'హెచ్చరిక చూడండి',
          badge: 'జాగ్రత్త',
        },
      },
      switchAdvanced: 'వివరణాత్మక గ్రాఫ్‌లు మరియు పరిశోధన వీక్షణ (Advanced Mode)',
    },
    en: {
      greeting: 'Welcome, Respected Farmer',
      subtitle: 'Your Trusted Agricultural Companion • AgriSense',
      listenBriefing: '🔊 Listen to Daily Farm Briefing',
      briefingAudio: 'Welcome, respected farmer! Today the weather is sunny and clear at 31 degrees Celsius. It is an optimal day for pesticide spraying and fertilizer application. Your fields have 75% soil moisture, so no irrigation is needed for the next 2 days. To check any sick crop, click the green camera button below.',
      weatherSummary: "Today's Weather: Clear & Sunny (31°C)",
      sprayAdvice: '✅ Safe weather window for pesticide spraying & nutrition',
      pwaBannerTitle: '📱 Install AgriSense App on Your Phone',
      pwaBannerSub: 'Works smoothly on low internet • Add to Home Screen in 1 tap',
      installBtn: 'Install App',
      cards: {
        scan: {
          title: 'Scan Sick Crop Leaf',
          sub: 'Take a leaf photo for instant disease cure & CIBRC medicines',
          btn: 'Open Camera',
          badge: 'Most Used',
        },
        voice: {
          title: 'Ask by Voice ( बोलें )',
          sub: 'Speak your question in your language for instant advice',
          btn: 'Tap & Speak',
          badge: 'Voice AI',
        },
        water: {
          title: 'When to Irrigate',
          sub: 'Soil moisture is 75% • No irrigation needed for 2 days',
          btn: 'Check Moisture',
          badge: 'Water Saver',
        },
        weather: {
          title: 'Weather & Rain Forecast',
          sub: '7-day local rain, temperature and wind guidance',
          btn: 'View Weather',
          badge: 'Live',
        },
        doctor: {
          title: 'Talk to Agri Doctor',
          sub: 'Toll-free Kisan Helpline 1800-180-1551 or find nearby KVK',
          btn: 'Call Doctor',
          badge: 'Toll-Free',
        },
        dosage: {
          title: 'Fertilizer & Dosage Guide',
          sub: 'Accurate dosage per acre for your crops',
          btn: 'Calculate Dose',
          badge: 'Certified',
        },
        warning: {
          title: 'Regional Outbreak Radar',
          sub: 'Pest and fungus early warning alerts around your village',
          btn: 'Check Radar',
          badge: 'Alert',
        },
      },
      switchAdvanced: 'Switch to Agronomist / Detailed Analysis Mode',
    },
  };

  const text = farmerContent[language] || farmerContent.en;

  const topAlert = activeAlerts.find(
    a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH'
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-20 max-w-4xl mx-auto">
      {/* 1. TOP BAR: Big Language Pills for Easy 1-Tap Switching */}
      <div className="bg-emerald-800 text-white rounded-3xl p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                {text.greeting}
              </h1>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              {text.subtitle}
            </p>
          </div>

          {/* Language Switcher Chips */}
          <div className="flex items-center gap-1.5 bg-emerald-900/60 p-1 rounded-2xl border border-emerald-700/60 self-start sm:self-auto overflow-x-auto max-w-full">
            {AVAILABLE_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  language === lang.code
                    ? 'bg-white text-emerald-900 shadow-sm scale-102'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-700/50'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Briefing Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100">
            <span className="text-base">☀️</span>
            <span className="font-medium">{text.weatherSummary}</span>
          </div>

          <AiVoiceSpeakerButton
            text={text.briefingAudio}
            title={text.listenBriefing}
            label={text.listenBriefing}
            variant="solid"
            size="md"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold border-none shadow-sm text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* 2. PWA INSTALL APP BANNER (Shows if not already installed) */}
      {!isInstalled && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-3.5 sm:p-4 text-white shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate">
                {text.pwaBannerTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100 truncate">
                {text.pwaBannerSub}
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-white text-amber-900 font-bold text-xs sm:text-sm hover:bg-amber-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-xs"
          >
            {text.installBtn}
          </button>
        </div>
      )}

      {/* Modal / Help tooltip if browser requires manual 'Add to Home Screen' */}
      {showInstallHelp && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-slate-800 text-xs sm:text-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-amber-900">
                📲 फोन में ऐप जोड़ने का तरीका (How to Install):
              </span>
              <p className="text-slate-700">
                1. अपने ब्राउज़र (Chrome) के ऊपर 3 बिंदु (⋮) पर क्लिक करें।
              </p>
              <p className="text-slate-700">
                2. <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> या <strong>"Install app"</strong> चुनें।
              </p>
              <p className="text-emerald-700 font-semibold">
                AgriSense आपके फोन की स्क्रीन पर असली ऐप की तरह आ जाएगा!
              </p>
            </div>
            <button
              onClick={() => setShowInstallHelp(false)}
              className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. URGENT CROP ALERT (If any disease detected) */}
      {topAlert && (
        <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-3.5 sm:p-4 text-slate-900 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">
                  चेतावनी
                </span>
                <span className="font-bold text-xs sm:text-sm text-rose-950 truncate">
                  {topAlert.fieldName} ({topAlert.crop}) में रोग का खतरा
                </span>
              </div>
              <p className="text-xs text-rose-800 truncate mt-0.5">
                तुरंत जांच और अनुशंसित कवकनाशी स्प्रे की आवश्यकता है।
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToAdvisory(topAlert.crop)}
            className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer whitespace-nowrap transition-colors"
          >
            दवा देखें
          </button>
        </div>
      )}

      {/* 4. MAIN ACTION TILES (Large, farmer-friendly, high-contrast buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        {/* TILE 1: SCAN CROP LEAF (Hero Primary Action) */}
        <div
          onClick={onNavigateToScan}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 sm:p-6 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[180px]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white text-emerald-900 font-extrabold text-[11px] shadow-xs">
                {text.cards.scan.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.scan.title}. ${text.cards.scan.sub}`}
                title={text.cards.scan.title}
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
              {text.cards.scan.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 line-clamp-2">
              {text.cards.scan.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-200 group-hover:text-white transition-colors">
            <span>{text.cards.scan.btn}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* TILE 2: ASK BY VOICE (बोलकर पूछें) */}
        <div
          onClick={onNavigateToVoice}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 sm:p-6 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[180px]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Mic className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-200 text-indigo-950 font-extrabold text-[11px] shadow-xs">
                {text.cards.voice.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.voice.title}. ${text.cards.voice.sub}`}
                title={text.cards.voice.title}
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
              {text.cards.voice.title}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 line-clamp-2">
              {text.cards.voice.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-200 group-hover:text-white transition-colors">
            <span>{text.cards.voice.btn}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* TILE 3: WHEN TO IRRIGATE (पानी और सिंचाई) */}
        <div
          onClick={onNavigateToIrrigation}
          className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 text-slate-900 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                {text.cards.water.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.water.title}. ${text.cards.water.sub}`}
                title={text.cards.water.title}
                size="sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {text.cards.water.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {text.cards.water.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-sky-700">
            <span>{text.cards.water.btn}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* TILE 4: WEATHER & RAIN (मौसम और बारिश) */}
        <div
          onClick={onNavigateToWeather}
          className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 text-slate-900 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CloudSun className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                {text.cards.weather.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.weather.title}. ${text.cards.weather.sub}`}
                title={text.cards.weather.title}
                size="sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {text.cards.weather.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {text.cards.weather.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700">
            <span>{text.cards.weather.btn}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* TILE 5: TALK TO AGRI DOCTOR (कृषि डॉक्टर और सहायता) */}
        <div
          onClick={onNavigateToDoctors}
          className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 text-slate-900 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                {text.cards.doctor.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.doctor.title}. ${text.cards.doctor.sub}`}
                title={text.cards.doctor.title}
                size="sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {text.cards.doctor.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {text.cards.doctor.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-teal-700">
            <span>{text.cards.doctor.btn}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* TILE 6: FERTILIZER & DOSAGE (खाद और दवा की मात्रा) */}
        <div
          onClick={() => onNavigateToAdvisory()}
          className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 text-slate-900 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                {text.cards.dosage.badge}
              </span>
              <AiVoiceSpeakerButton
                text={`${text.cards.dosage.title}. ${text.cards.dosage.sub}`}
                title={text.cards.dosage.title}
                size="sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {text.cards.dosage.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {text.cards.dosage.sub}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-700">
            <span>{text.cards.dosage.btn}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 5. DIRECT EMERGENCY HELPLINE CALL CARD */}
      <div className="rounded-3xl bg-slate-900 text-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              सरकारी किसान कॉल सेंटर (Toll-Free Helpline)
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white">
              1800-180-1551
            </span>
            <span className="text-xs text-slate-300 block">
              सुबह 6:00 से रात 10:00 बजे तक मुफ्त कृषि वैज्ञानिक सहायता
            </span>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <PhoneCall className="w-4 h-4" />
          <span>तुरंत कॉल करें</span>
        </a>
      </div>

      {/* 6. SWITCH TO DETAILED RESEARCH VIEW (FOR ADVANCED USERS / AGRONOMISTS) */}
      <div className="pt-2 text-center">
        <button
          onClick={onSwitchToAdvancedMode}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all cursor-pointer"
        >
          <span>{text.switchAdvanced}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
