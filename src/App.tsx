import React, { useState, useEffect } from 'react';
import { ModernSidebar, ModernNavTab } from './components/layout/ModernSidebar';
import { ModernHeader } from './components/layout/ModernHeader';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Modern Views with Full i18n
import { ModernDashboardView } from './components/views/ModernDashboardView';
import { ModernAiScanView } from './components/views/ModernAiScanView';
import { ModernMyFieldsView } from './components/views/ModernMyFieldsView';
import { ModernCropHealthView } from './components/views/ModernCropHealthView';
import { ModernDiseaseDetectionView } from './components/views/ModernDiseaseDetectionView';
import { ModernWeatherView } from './components/views/ModernWeatherView';
import { ModernAgroCentresView } from './components/views/ModernAgroCentresView';
import { ModernAgriDoctorsView } from './components/views/ModernAgriDoctorsView';
import { ModernIrrigationView } from './components/views/ModernIrrigationView';
import { ModernAiAdvisoryView } from './components/views/ModernAiAdvisoryView';
import { ModernReportsView } from './components/views/ModernReportsView';
import { ModernProfileView } from './components/views/ModernProfileView';
import { EarlyRiskIntelligenceView } from './components/earlywarning/EarlyRiskIntelligenceView';

// Auth Pages & Modals
import { ModernLoginPage } from './components/auth/ModernLoginPage';
import { LoginOtpModal } from './components/auth/LoginOtpModal';
import { FarmerUser, DEMO_FARMER_ACCOUNTS } from './types/auth';

// Error Boundary
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Hands-Free Voice Assistance Components & Services
import { FloatingVoiceButton } from './components/speech/FloatingVoiceButton';
import { FieldVoiceAssistantModal } from './components/speech/FieldVoiceAssistantModal';
import { GlobalVoicePlayerBar } from './components/speech/GlobalVoicePlayerBar';
import { speechService } from './services/speechService';
import { ParsedVoiceCommand, VoiceRecognitionStatus } from './types/speech';

// Multi-language system (en, kn, te, hi)
import { AppLanguage, loadLanguageFromStorage, saveLanguageToStorage } from './locales';

// Live Location Types
import { UserLiveLocation } from './types/location';

// Existing Data Flow and Services (100% Unchanged Backend Connection)
import { INITIAL_FIELDS, SAMPLE_DETECTIONS } from './data/agriData';
import { FieldRecord, DetectionResult } from './types/agri';
import { ClientDataService, DashboardKPIs } from './services/clientDataService';
import {
  DetectionThresholds,
  PushNotificationAlert,
  DEFAULT_DETECTION_THRESHOLDS,
} from './types/notification';
import { evaluateAllFields } from './utils/thresholdEvaluator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModernNavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguageFromStorage());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [advisoryInitialQuery, setAdvisoryInitialQuery] = useState<string>('');

  // Login & Farmer Session State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FarmerUser | null>(() => {
    try {
      const saved = localStorage.getItem('agrisense_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('agrisense_user');
    } catch {}
    setCurrentUser(null);
    showToast(
      language === 'kn'
        ? 'ನೀವು ಅಗ್ರಿಸೆನ್ಸ್‌ನಿಂದ ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್‌ಔಟ್ ಆಗಿದ್ದೀರಿ'
        : language === 'te'
        ? 'మీరు అగ్రిసెన్స్ నుండి విజయవంతంగా లాగ్ అవుట్ అయ్యారు'
        : language === 'hi'
        ? 'आप एग्रीसेंस से सफलतापूर्वक लॉग आउट हो गए हैं'
        : 'You have signed out of AgriSense successfully'
    );
  };

  // Unified Live Location State across all agricultural features
  const [userLocation, setUserLocation] = useState<UserLiveLocation>({
    status: 'idle',
    coords: null,
  });

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation({
        status: 'unavailable',
        coords: null,
        errorMessage: 'Geolocation is not supported by your browser.',
      });
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setUserLocation(prev => ({ ...prev, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation({
          status: 'enabled',
          coords,
          approxAddress: `Lat ${coords.lat.toFixed(3)}, Lng ${coords.lng.toFixed(3)} (Regional Agricultural Sector)`,
          accuracyMeters: pos.coords.accuracy,
          timestamp: Date.now(),
        });
        showToast(
          language === 'kn'
            ? '📍 ಲೈವ್ ಸ್ಥಳವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ: ಸಮೀಪದ ಕೇಂದ್ರಗಳು ಮತ್ತು ತಜ್ಞರನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ'
            : language === 'te'
            ? '📍 లైవ్ లొకేషన్ ప్రారంభించబడింది: సమీప కేంద్రాలు మరియు నిపుణులు గుర్తించబడ్డారు'
            : language === 'hi'
            ? '📍 लाइव लोकेशन सक्रिय: निकटतम केंद्र एवं डॉक्टर खोजे गए'
            : '📍 Live location enabled: Showing nearby agricultural centres & doctors'
        );
      },
      err => {
        const status = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
        setUserLocation({
          status,
          coords: null,
          errorMessage: err.message,
        });
        showToast(
          status === 'denied'
            ? 'Location permission was denied. Please enable permission in browser settings.'
            : "Couldn't determine location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Hands-Free Voice Assistant States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<{
    status: VoiceRecognitionStatus;
    transcript: string;
    interimTranscript: string;
    lastCommand: ParsedVoiceCommand | null;
    errorMessage: string | null;
  }>({
    status: 'idle',
    transcript: '',
    interimTranscript: '',
    lastCommand: null,
    errorMessage: null,
  });
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState<boolean>(true);
  const [isContinuousVoice, setIsContinuousVoice] = useState<boolean>(true);

  // Push Notification & AI Threshold States (Existing Logic)
  const [thresholds, setThresholds] = useState<DetectionThresholds>(() => {
    try {
      const saved = localStorage.getItem('mahaagri_thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_DETECTION_THRESHOLDS;
    } catch {
      return DEFAULT_DETECTION_THRESHOLDS;
    }
  });
  const [activeAlerts, setActiveAlerts] = useState<PushNotificationAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<PushNotificationAlert[]>([]);

  // Backend connected data (Existing Read-Only Data Flow)
  const [kpis, setKpis] = useState<DashboardKPIs | undefined>(undefined);
  const [fields, setFields] = useState<FieldRecord[]>(INITIAL_FIELDS);
  const [detections, setDetections] = useState<DetectionResult[]>(SAMPLE_DETECTIONS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Subscribe to voice recognition events
  useEffect(() => {
    const unsubscribe = speechService.subscribe(state => {
      setVoiceState({ ...state });
    });
    return () => unsubscribe();
  }, []);

  // Sync speech engine with UI language changes
  const handleLanguageChange = (newLang: AppLanguage) => {
    setLanguage(newLang);
    saveLanguageToStorage(newLang);
    const speechLang =
      newLang === 'kn'
        ? 'kn-IN'
        : newLang === 'te'
        ? 'te-IN'
        : newLang === 'hi'
        ? 'hi-IN'
        : 'en-IN';
    speechService.setLanguage(speechLang);
    const langToast =
      newLang === 'kn'
        ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ (Kannada)'
        : newLang === 'te'
        ? 'భాషను తెలుగుకు మార్చబడింది (Telugu)'
        : newLang === 'hi'
        ? 'भाषा हिंदी में बदल दी गई है (Hindi)'
        : 'Language switched to English';
    showToast(langToast);
  };

  // Voice command execution dispatcher
  const handleExecuteVoiceCommand = (cmd: ParsedVoiceCommand) => {
    if (!cmd || cmd.type === 'UNKNOWN') return;

    switch (cmd.type) {
      case 'NAVIGATE_HOME':
        handleTabSelect('dashboard');
        break;
      case 'NAVIGATE_SCAN':
        handleTabSelect('ai-scan');
        break;
      case 'TRIGGER_CAPTURE':
      case 'FAST_SCAN_COUNTDOWN':
        handleTabSelect('ai-scan');
        window.dispatchEvent(
          new CustomEvent('agrisense:voice-capture', {
            detail: { countdown: cmd.type === 'FAST_SCAN_COUNTDOWN' ? 3 : 0 },
          })
        );
        break;
      case 'NAVIGATE_ADVISORY':
        handleTabSelect('advisory');
        break;
      case 'NAVIGATE_FIELDS':
        handleTabSelect('fields');
        break;
      case 'NAVIGATE_RADAR':
        handleTabSelect('crop-health');
        break;
      case 'NAVIGATE_REPORTS':
      case 'NAVIGATE_DATASETS':
        handleTabSelect('reports');
        break;
      case 'NAVIGATE_ANALYTICS':
        handleTabSelect('crop-health');
        break;
      case 'NAVIGATE_OFFICERS':
        handleTabSelect('agri-experts');
        break;
      case 'SELECT_CROP':
        if (cmd.cropParam) {
          showToast(`🌱 Crop: ${cmd.cropParam.toUpperCase()}`);
        }
        break;
      case 'HELP':
        setIsVoiceModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Evaluate saved fields against AI thresholds (Existing logic)
  useEffect(() => {
    const breaches = evaluateAllFields(fields, thresholds, 82);
    if (breaches && breaches.length > 0) {
      setActiveAlerts(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existingMap = new Map(safePrev.map(a => [a.fieldId, a]));
        breaches.forEach(b => existingMap.set(b.fieldId, b));
        return Array.from(existingMap.values());
      });
      setAlertHistory(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existingIds = new Set(safePrev.map(a => a.id));
        const toAdd = breaches.filter(b => !existingIds.has(b.id));
        return [...toAdd, ...safePrev];
      });
    }
  }, [fields, thresholds]);

  // Connect to backend API with silent resilient local fallback
  useEffect(() => {
    async function loadData() {
      try {
        const dashData = await ClientDataService.getDashboardData();
        if (dashData?.kpis) {
          setKpis(dashData.kpis);
        }
      } catch {
        // safe fallback
      }

      try {
        const liveFields = await ClientDataService.getFields();
        if (liveFields && liveFields.length > 0) {
          setFields(liveFields);
        }
      } catch {
        // safe fallback
      }

      try {
        const liveDetections = await ClientDataService.getDetections();
        if (liveDetections && liveDetections.length > 0) {
          setDetections(liveDetections);
        }
      } catch {
        // safe fallback
      }
    }
    loadData();
  }, []);

  const handleTabSelect = (tab: ModernNavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
      case 'dashboard':
        return (
          <ModernDashboardView
            fields={fields}
            onNavigateToScan={() => handleTabSelect('ai-scan')}
            onNavigateToFields={() => handleTabSelect('fields')}
            onNavigateToWeather={() => handleTabSelect('weather')}
            onNavigateToAgroCentres={() => handleTabSelect('agro-centres')}
            onNavigateToAdvisory={crop => {
              if (crop) setAdvisoryInitialQuery(`Tell me about ${crop}`);
              handleTabSelect('advisory');
            }}
            onNavigateToEarlyWarning={() => handleTabSelect('early-warning')}
            onViewFieldDetails={() => handleTabSelect('fields')}
            activeAlerts={activeAlerts}
            onDismissAlert={id => setActiveAlerts(prev => prev.filter(a => a.id !== id))}
            language={language}
          />
        );
      case 'early-warning':
        return (
          <EarlyRiskIntelligenceView
            fields={fields}
            onNavigateToScan={() => handleTabSelect('ai-scan')}
            onNavigateToFields={() => handleTabSelect('fields')}
            language={language}
            onShowToast={showToast}
          />
        );
      case 'ai-scan':
        return (

          <ModernAiScanView
            onShowToast={showToast}
            onNavigateToAdvisory={() => handleTabSelect('advisory')}
            onNavigateToExperts={() => handleTabSelect('agri-experts')}
            onNavigateToAgroCentres={() => handleTabSelect('agro-centres')}
            userLocation={userLocation}
            onRequestLiveLocation={requestLiveLocation}
            language={language}
          />
        );
      case 'fields':
        return (
          <ModernMyFieldsView
            fields={fields}
            onAddField={newField => setFields(prev => [newField, ...prev])}
            onShowToast={showToast}
          />
        );
      case 'crop-health':
        return <ModernCropHealthView />;
      case 'disease-detection':
        return <ModernDiseaseDetectionView />;
      case 'weather':
        return <ModernWeatherView language={language} onShowToast={showToast} />;
      case 'agro-centres':
        return (
          <ModernAgroCentresView
            language={language}
            onShowToast={showToast}
            userLocation={userLocation}
            onRequestLiveLocation={requestLiveLocation}
          />
        );
      case 'agri-experts':
        return (
          <ModernAgriDoctorsView
            language={language}
            onShowToast={showToast}
            userLocation={userLocation}
            onRequestLiveLocation={requestLiveLocation}
          />
        );
      case 'irrigation':
        return <ModernIrrigationView />;
      case 'advisory':
        return (
          <ModernAiAdvisoryView
            language={language}
            initialQuery={advisoryInitialQuery}
          />
        );
      case 'reports':
        return <ModernReportsView fields={fields} onShowToast={showToast} />;
      case 'community':
        return (
          <ModernAiAdvisoryView
            language={language}
            initialQuery={
              language === 'kn'
                ? 'ಸಮೀಪದ ರೈತರ ಅನುಭವಗಳು ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು'
                : language === 'te'
                ? 'రైతుల అనుభవాలు మరియు సాగు సలహాలు'
                : language === 'hi'
                ? 'किसान समुदाय के अनुभव एवं सलाह'
                : 'Farmer community insights and best practices'
            }
          />
        );
      case 'settings':
      case 'help':
      case 'profile':
        return (
          <ModernProfileView
            onShowToast={showToast}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <ModernDashboardView
            fields={fields}
            onNavigateToScan={() => handleTabSelect('ai-scan')}
            onNavigateToFields={() => handleTabSelect('fields')}
            onNavigateToWeather={() => handleTabSelect('weather')}
            onNavigateToAgroCentres={() => handleTabSelect('agro-centres')}
            onNavigateToAdvisory={() => handleTabSelect('advisory')}
            onNavigateToEarlyWarning={() => handleTabSelect('early-warning')}
            onViewFieldDetails={() => handleTabSelect('fields')}
            activeAlerts={activeAlerts}
            onDismissAlert={id => setActiveAlerts(prev => prev.filter(a => a.id !== id))}
            language={language}
          />
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#07130b] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <ModernLoginPage
          language={language}
          onSelectLanguage={handleLanguageChange}
          onLoginSuccess={(user: FarmerUser) => {
            try {
              localStorage.setItem('agrisense_user', JSON.stringify(user));
            } catch {}
            setCurrentUser(user);
            showToast(
              language === 'kn'
                ? `ಸ್ವಾಗತ ${user.name}! ನಿಮ್ಮ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ.`
                : language === 'te'
                ? `స్వాగతం ${user.name}! మీ వ్యవసాయ డాష్‌బోర్డ్ సిద్ధంగా ఉంది.`
                : language === 'hi'
                ? `स्वागत है ${user.name}! आपका कृषि डैशबोर्ड तैयार है।`
                : `Welcome ${user.name}! Your farm dashboard is ready.`
            );
          }}
          onContinueAsGuest={() => {
            const guestUser: FarmerUser = { ...DEMO_FARMER_ACCOUNTS[0], isGuest: true };
            try {
              localStorage.setItem('agrisense_user', JSON.stringify(guestUser));
            } catch {}
            setCurrentUser(guestUser);
            showToast(
              language === 'kn'
                ? `ಅತಿಥಿ ಪೂರ್ವವೀಕ್ಷಣೆ: ${guestUser.name}`
                : language === 'te'
                ? `అతిథి ప్రివ్యూ: ${guestUser.name}`
                : language === 'hi'
                ? `अतिथि पूर्वावलोकन: ${guestUser.name}`
                : `Guest Preview mode: ${guestUser.name}`
            );
          }}
        />
        {/* Global Interactive Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 max-w-sm border border-slate-700 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="flex-1 truncate">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900 flex font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Fixed Modern Sidebar (Desktop & Tablet) */}
      <div className="hidden md:block">
        <ModernSidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          unreadCount={activeAlerts.length}
          language={language}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Application Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Modern Clean Header */}
        <ModernHeader
          language={language}
          onSelectLanguage={handleLanguageChange}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadAlertCount={activeAlerts.length}
          onNavigateToProfile={() => handleTabSelect('profile')}
          onOpenSignIn={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          isVoiceListening={voiceState.status === 'listening'}
          onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          onSearchSubmit={query => {
            setAdvisoryInitialQuery(query);
            handleTabSelect('advisory');
          }}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
          <ErrorBoundary>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>

        {/* Responsive Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} onSelectTab={handleTabSelect} language={language} />
      </div>

      {/* Farmer Login & OTP Verification Modal */}
      <LoginOtpModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={user => {
          const fullUser: FarmerUser = {
            id: 'FARMER-KA-01',
            name: user.name,
            phone: user.phone,
            state: 'Karnataka',
            district: 'Dharwad, Karnataka',
            primaryCrop: 'Tomato & Cotton',
            farmSizeAcres: 4.5,
            avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
          };
          try {
            localStorage.setItem('agrisense_user', JSON.stringify(fullUser));
          } catch {}
          setCurrentUser(fullUser);
          showToast(`Welcome ${fullUser.name}!`);
        }}
        language={language}
      />

      {/* Global Floating AI Voice Speaker Audio Player */}
      <GlobalVoicePlayerBar />

      {/* Global Floating Hands-Free Voice Assistant Button */}
      <FloatingVoiceButton
        status={voiceState.status}
        transcript={voiceState.transcript}
        interimTranscript={voiceState.interimTranscript}
        lastCommand={voiceState.lastCommand}
        onOpenGuide={() => setIsVoiceModalOpen(true)}
        onExecuteCommand={handleExecuteVoiceCommand}
        language={language}
      />

      {/* Comprehensive Voice Assistant & Commands Guide Modal */}
      <FieldVoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        status={voiceState.status}
        transcript={voiceState.transcript}
        interimTranscript={voiceState.interimTranscript}
        lastCommand={voiceState.lastCommand}
        errorMessage={voiceState.errorMessage}
        onExecuteCommand={handleExecuteVoiceCommand}
        currentLanguage={
          language === 'kn'
            ? 'kn-IN'
            : language === 'te'
            ? 'te-IN'
            : language === 'hi'
            ? 'hi-IN'
            : 'en-IN'
        }
        onLanguageChange={lang => {
          const nextLang: AppLanguage = lang.startsWith('kn')
            ? 'kn'
            : lang.startsWith('te')
            ? 'te'
            : lang.startsWith('hi')
            ? 'hi'
            : 'en';
          handleLanguageChange(nextLang);
        }}
        voiceResponsesEnabled={voiceResponsesEnabled}
        onToggleVoiceResponses={() => {
          const next = !voiceResponsesEnabled;
          setVoiceResponsesEnabled(next);
          speechService.setVoiceResponsesEnabled(next);
        }}
        isContinuous={isContinuousVoice}
        onToggleContinuous={() => {
          const next = !isContinuousVoice;
          setIsContinuousVoice(next);
          speechService.setContinuousMode(next);
        }}
      />

      {/* Right-Side Notification Panel */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        alerts={activeAlerts}
        onDismissAlert={id => setActiveAlerts(prev => prev.filter(a => a.id !== id))}
        onDismissAll={() => {
          setActiveAlerts([]);
          showToast(
            language === 'kn'
              ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ'
              : language === 'te'
              ? 'అన్ని నోటిఫికేషన్లు క్లియర్ చేయబడ్డాయి'
              : language === 'hi'
              ? 'सभी सूचनाएं हटा दी गई हैं'
              : 'All notifications cleared'
          );
        }}
        onViewAdvisory={alert => {
          setAdvisoryInitialQuery(`Advice for ${alert.crop} with ${alert.message}`);
          handleTabSelect('advisory');
          showToast(`Viewing advisory for ${alert.crop}...`);
        }}
        language={language}
      />

      {/* Global Interactive Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 max-w-sm border border-slate-700 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="flex-1 truncate">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
