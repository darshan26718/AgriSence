export type AppLanguage = 'English' | 'Marathi' | 'Hindi';

export interface Translations {
  // Navigation
  dashboard: string;
  aiCropScan: string;
  myFields: string;
  cropHealth: string;
  diseaseDetection: string;
  weather: string;
  irrigation: string;
  aiAdvisory: string;
  reports: string;
  settings: string;
  helpSupport: string;
  profile: string;

  // Header
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  headerSubtitle: string;
  voiceAssistant: string;
  voiceAssistantActive: string;
  voiceAssistantTooltip: string;
  switchLanguage: string;
  notifications: string;

  // Dashboard
  fieldOverview: string;
  activeFieldsCount: string;
  healthyCropsPct: string;
  criticalAlertsCount: string;
  quickActions: string;
  scanLeafAction: string;
  scanLeafDesc: string;
  askAiAction: string;
  askAiDesc: string;
  irrigationAction: string;
  irrigationDesc: string;
  callOfficerAction: string;
  callOfficerDesc: string;
  recentDetections: string;
  viewAllFields: string;
  healthTrends: string;

  // Voice Assistant
  voiceModalTitle: string;
  voiceModalSubtitle: string;
  listeningActive: string;
  tapToListen: string;
  stopListening: string;
  startListening: string;
  heardPhrase: string;
  allCommands: string;
  scannerControls: string;
  cropSelection: string;
  continuousFieldMode: string;
  spokenFeedback: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  English: {
    dashboard: 'Dashboard',
    aiCropScan: 'AI Crop Scan',
    myFields: 'My Fields',
    cropHealth: 'Crop Health',
    diseaseDetection: 'Disease Detection',
    weather: 'Weather',
    irrigation: 'Irrigation',
    aiAdvisory: 'AI Advisory',
    reports: 'Reports',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    profile: 'Profile',

    greetingMorning: 'Good morning, Farmer 👋',
    greetingAfternoon: 'Good afternoon, Farmer 👋',
    greetingEvening: 'Good evening, Farmer 👋',
    headerSubtitle: "Here's your crop intelligence overview for today.",
    voiceAssistant: 'Voice Assistant',
    voiceAssistantActive: 'Voice Listening...',
    voiceAssistantTooltip: 'Hands-Free Field Voice Assistant',
    switchLanguage: 'Language',
    notifications: 'Notifications',

    fieldOverview: 'Crop Intelligence Overview',
    activeFieldsCount: 'Monitored Fields',
    healthyCropsPct: 'Crop Health Index',
    criticalAlertsCount: 'Critical Risk Alerts',
    quickActions: 'Quick Field Actions',
    scanLeafAction: 'Scan Leaf Photo',
    scanLeafDesc: 'Instant AI pathogen & pest detection',
    askAiAction: 'Ask AI Advisor',
    askAiDesc: 'CIBRC certified remedies & dosage',
    irrigationAction: 'Irrigation Schedule',
    irrigationDesc: 'Soil moisture & evapotranspiration',
    callOfficerAction: 'Call Krishi Officer',
    callOfficerDesc: 'Direct line to extension experts',
    recentDetections: 'Recent Field Detections',
    viewAllFields: 'View All Fields',
    healthTrends: 'Crop Health & Risk Trends',

    voiceModalTitle: 'Hands-Free Field Voice Assistant',
    voiceModalSubtitle: 'Voice navigation & instant AI crop shutter for work in the field',
    listeningActive: '🎙️ Listening actively for commands...',
    tapToListen: 'Mic Inactive (Tap Start to Listen)',
    stopListening: 'Stop Listening',
    startListening: 'Start Listening',
    heardPhrase: 'Heard Phrase:',
    allCommands: 'All Commands',
    scannerControls: 'Scanner Controls',
    cropSelection: 'Crop Selection',
    continuousFieldMode: 'Continuous Field Mode',
    spokenFeedback: 'Spoken Feedback (TTS)',
  },
  Marathi: {
    dashboard: 'डॅशबोर्ड',
    aiCropScan: 'एआय पीक स्कॅन',
    myFields: 'माझी शेती',
    cropHealth: 'पीक आरोग्य',
    diseaseDetection: 'रोग निदान',
    weather: 'हवामान',
    irrigation: 'सिंचन व्यवस्था',
    aiAdvisory: 'एआय सल्लागार',
    reports: 'अहवाल',
    settings: 'सेटिंग्ज',
    helpSupport: 'मदत व सहाय्य',
    profile: 'शेतकरी प्रोफाइल',

    greetingMorning: 'शुभ प्रभात, शेतकरी बंधू 👋',
    greetingAfternoon: 'शुभ दुपार, शेतकरी बंधू 👋',
    greetingEvening: 'शुभ संध्याकाळ, शेतकरी बंधू 👋',
    headerSubtitle: 'तुमच्या शेतीचे व पिकांचे आजचे बुद्धिमत्ता विश्लेषण येथे आहे.',
    voiceAssistant: 'व्हॉइस असिस्टंट',
    voiceAssistantActive: 'आवाज ऐकत आहे...',
    voiceAssistantTooltip: 'हँड्स-फ्री फील्ड व्हॉइस असिस्टंट',
    switchLanguage: 'भाषा',
    notifications: 'सूचना',

    fieldOverview: 'शेती बुद्धिमत्ता डॅशबोर्ड',
    activeFieldsCount: 'एकूण शेत क्षेत्र',
    healthyCropsPct: 'निरोगी पीक प्रमाण',
    criticalAlertsCount: 'गंभीर रोग धोके',
    quickActions: 'त्वरित कृती पर्याय',
    scanLeafAction: 'पानाचा फोटो स्कॅन करा',
    scanLeafDesc: 'झटपट एआय रोग व कीड ओळख',
    askAiAction: 'एआय सल्लागारास विचारा',
    askAiDesc: 'अधिकृत CIBRC औषध फवारणी मात्रा',
    irrigationAction: 'सिंचन वेळापत्रक',
    irrigationDesc: 'जमिनीतील ओलावा आणि बाष्पीभवन',
    callOfficerAction: 'कृषी अधिकाऱ्यांना कॉल करा',
    callOfficerDesc: 'तालुका कृषी तज्ज्ञांशी थेट संपर्क',
    recentDetections: 'अलीकडील पीक तपासण्या',
    viewAllFields: 'सर्व शेती पाहा',
    healthTrends: 'पीक आरोग्य व रोग कल',

    voiceModalTitle: 'हँड्स-फ्री शेतकरी व्हॉइस असिस्टंट',
    voiceModalSubtitle: 'शेतात काम करताना थेट आवाजाने कॅमेरा shutter व नेव्हिगेशन नियंत्रित करा',
    listeningActive: '🎙️ कमांड ऐकत आहे (माईक सुरू आहे)...',
    tapToListen: 'माईक बंद आहे (सुरू करण्यासाठी दाबा)',
    stopListening: 'ऐकणे थांबवा',
    startListening: 'आवाज सुरू करा',
    heardPhrase: 'ऐकलेले शब्द:',
    allCommands: 'सर्व कमांड्स',
    scannerControls: 'कॅमेरा नियंत्रणे',
    cropSelection: 'पीक निवड',
    continuousFieldMode: 'सतत सुरू मोड',
    spokenFeedback: 'आवाजात उत्तर द्या (TTS)',
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    aiCropScan: 'एआई फसल स्कैन',
    myFields: 'मेरे खेत',
    cropHealth: 'फसल स्वास्थ्य',
    diseaseDetection: 'रोग पहचान',
    weather: 'मौसम',
    irrigation: 'सिंचाई प्रबंधन',
    aiAdvisory: 'एआई कृषि सलाह',
    reports: 'रिपोर्ट्स',
    settings: 'सेटिंग्स',
    helpSupport: 'मदद और सहायता',
    profile: 'किसान प्रोफाइल',

    greetingMorning: 'शुभ प्रभात, किसान भाई 👋',
    greetingAfternoon: 'शुभ दोपहर, किसान भाई 👋',
    greetingEvening: 'शुभ संध्या, किसान भाई 👋',
    headerSubtitle: 'आपकी फसल और खेतों का आज का समग्र एआई विश्लेषण।',
    voiceAssistant: 'वॉइस असिस्टेंट',
    voiceAssistantActive: 'आवाज सुन रहा है...',
    voiceAssistantTooltip: 'हैंड्स-फ्री फील्ड वॉइस असिस्टेंट',
    switchLanguage: 'भाषा',
    notifications: 'सूचनाएं',

    fieldOverview: 'कृषि और फसल विश्लेषण',
    activeFieldsCount: 'निगरानी में कुल खेत',
    healthyCropsPct: 'स्वस्थ फसल प्रतिशत',
    criticalAlertsCount: 'गंभीर रोग चेतावनी',
    quickActions: 'त्वरित कृषि कार्य',
    scanLeafAction: 'पत्ती का फोटो स्कैन करें',
    scanLeafDesc: 'तुरंत एआई रोग व कीट पहचान',
    askAiAction: 'एआई सलाहकार से पूछें',
    askAiDesc: 'प्रमाणित CIBRC दवा और कीटनाशक मात्रा',
    irrigationAction: 'सिंचाई समय-सारणी',
    irrigationDesc: 'मिट्टी की नमी और जल स्तर',
    callOfficerAction: 'कृषि अधिकारी को कॉल करें',
    callOfficerDesc: 'जिला कृषि विशेषज्ञों से सीधा संपर्क',
    recentDetections: 'हाल ही में किए गए स्कैन',
    viewAllFields: 'सभी खेत देखें',
    healthTrends: 'फसल स्वास्थ्य और जोखिम रुझान',

    voiceModalTitle: 'हैंड्स-फ्री किसान वॉइस असिस्टेंट',
    voiceModalSubtitle: 'खेत में काम करते हुए सीधे आवाज से कैमरा और ऐप नियंत्रित करें',
    listeningActive: '🎙️ आपकी आवाज सुन रहा है...',
    tapToListen: 'माइक बंद है (शुरू करने के लिए दबाएं)',
    stopListening: 'सुनना बंद करें',
    startListening: 'आवाज शुरू करें',
    heardPhrase: 'सुने गए शब्द:',
    allCommands: 'सभी कमांड',
    scannerControls: 'कैमरा नियंत्रण',
    cropSelection: 'फसल चयन',
    continuousFieldMode: 'निरंतर फील्ड मोड',
    spokenFeedback: 'बोलकर उत्तर दें (TTS)',
  },
};

export const getTranslation = (lang: AppLanguage): Translations => {
  return TRANSLATIONS[lang] || TRANSLATIONS.English;
};
