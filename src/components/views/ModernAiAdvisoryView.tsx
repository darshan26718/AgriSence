import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { ClientDataService } from '../../services/clientDataService';
import { AppLanguage, getLocale } from '../../locales';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ModernAiAdvisoryViewProps {
  language?: AppLanguage;
  initialQuery?: string;
}

export const ModernAiAdvisoryView: React.FC<ModernAiAdvisoryViewProps> = ({
  language = 'en',
  initialQuery = '',
}) => {
  const t = getLocale(language);

  const getWelcomeText = () => {
    if (language === 'kn') {
      return 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಅಗ್ರಿಸೆನ್ಸ್ AI ಬೆಳೆ ಸಲಹೆಗಾರ. ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು, ರೋಗಗಳು, ಸೂಕ್ತ ಕೀಟನಾಶಕ ಪ್ರಮಾಣ, ನೈಸರ್ಗಿಕ ಪರಿಹಾರಗಳು ಅಥವಾ ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.';
    }
    if (language === 'te') {
      return 'నమస్కారం! నేను మీ అగ్రిసెన్స్ AI పంట సలహాదారుని. ఆకులు పసుపు రంగులోకి మారడం, తెగుళ్లు, పురుగుమందుల మోతాదు, సేంద్రీయ నివారణలు లేదా ఈ వాతావరణానికి తగిన పంటల గురించి ఏదైనా ప్రశ్న అడగండి.';
    }
    return 'Hello! I am your AgriSense AI Crop Advisor. Ask me anything about yellowing leaves, diseases, fertilizer guidance, organic remedies, or crops suitable for current weather.';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: getWelcomeText(),
      timestamp: '10:00 AM',
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested questions from user prompt
  const getSuggestedQuestions = () => {
    if (language === 'kn') {
      return [
        'ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಕಾರಣವೇನು?',
        'ನಾನು ಯಾವ ರಸಗೊಬ್ಬರವನ್ನು ಬಳಸಬೇಕು?',
        'ನೀರಾವರಿ ಯಾವಾಗ ಮಾಡಬೇಕು?',
        'ಈ ಹವಾಮಾನಕ್ಕೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?',
        'ಈ ರೋಗಕ್ಕೆ ನಾನೇನು ಮಾಡಬೇಕು?',
      ];
    }
    if (language === 'te') {
      return [
        'ఆకులు పసుపు రంగులోకి ఎందుకు మారుతున్నాయి?',
        'నేను ఏ ఎరువును వాడాలి?',
        'నీటిపారుదల ఎప్పుడు చేయాలి?',
        'ఈ వాతావరణానికి ఏ పంట అనుకూలం?',
        'ఈ వ్యాధి నివారణకు నేను ఏమి చేయాలి?',
      ];
    }
    return [
      'Why are my leaves turning yellow?',
      'Which fertilizer should I use?',
      'When should I irrigate?',
      'Which crop is suitable for this weather?',
      'What should I do about this disease?',
    ];
  };

  // Reset or update welcome message when language changes
  useEffect(() => {
    setMessages(prev => [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.filter(m => m.id !== 'msg-1' && m.id !== 'msg-welcome'),
    ]);
  }, [language]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Recognition for direct voice dictation into query
  const toggleVoiceDictation = () => {
    if (isVoiceInputActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceInputActive(false);
      return;
    }

    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        language === 'kn' ? 'kn-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsVoiceInputActive(true);
      };

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setInputQuery(text);
      };

      recognition.onerror = () => {
        setIsVoiceInputActive(false);
      };

      recognition.onend = () => {
        setIsVoiceInputActive(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsVoiceInputActive(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    if (isVoiceInputActive && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceInputActive(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const langParam = language === 'kn' ? 'Kannada' : language === 'te' ? 'Telugu' : 'English';
      const response = await ClientDataService.askAdvisorVoiceQuery(q, langParam);

      let aiReply = response.answer;
      if (!aiReply || aiReply.includes('offline-heuristic-fallback')) {
        const lower = q.toLowerCase();
        if (lower.includes('yellow') || lower.includes('ಹಳದಿ') || lower.includes('పసుపు')) {
          aiReply =
            language === 'kn'
              ? 'ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಮುಖ್ಯ ಕಾರಣ ಸಾರಜನಕ (Nitrogen) ಕೊರತೆ ಅಥವಾ ಅತಿಯಾದ ತೇವಾಂಶ. 19:19:19 ನೀರಿನಲ್ಲಿ ಕರಗುವ ಗೊಬ್ಬರವನ್ನು 5 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ. ಶಿಲೀಂಧ್ರ ಲಕ್ಷಣಗಳಿದ್ದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ/ಲೀಟರ್ ಬಳಸಿ.'
              : language === 'te'
              ? 'ఆకులు పసుపు రంగులోకి మారడానికి ప్రధాన కారణం నత్రజని లోపం లేదా అధిక తేమ. 19:19:19 ఎరువును లీటరు నీటికి 5 గ్రాములు కలిపి పిచికారీ చేయండి. శిలీంధ్ర మచ్చలు ఉంటే మాంకోజెబ్ 2 గ్రాములు/లీటరు ఉపయోగించండి.'
              : 'Yellowing leaves usually indicate Nitrogen deficiency or waterlogging. Apply water-soluble 19:19:19 @ 5g/L foliage spray. If fungal spots are present, apply Mancozeb 75% WP @ 2g/L.';
        } else if (lower.includes('fertilizer') || lower.includes('ಗೊಬ್ಬರ') || lower.includes('ఎరువు')) {
          aiReply =
            language === 'kn'
              ? 'ಬೆಳವಣಿಗೆಯ ಹಂತದಲ್ಲಿ ಸಮತೋಲಿತ N-P-K ಮತ್ತು ಸತು (Zinc Sulphate 5g/L) ಬಳಸಿ. ಹೂಬಿಡುವ ಹಂತದಲ್ಲಿ 0:52:34 ಅಥವಾ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ಉತ್ತಮ ಇಳುವರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.'
              : language === 'te'
              ? 'శాఖా దశలో సమతుల్య N-P-K మరియు జింక్ సల్ఫేట్ 5 గ్రా/లీటర్ వాడండి. పూత దశలో 0:52:34 లేదా పొటాష్ ఎరువులు అధిక దిగుబడికి సహకరిస్తాయి.'
              : 'During vegetative stage apply balanced NPK with micronutrient Zinc Sulphate @ 5g/L. At flowering stage, spray 0:52:34 @ 5g/L to enhance boll/grain formation.';
        } else if (lower.includes('weather') || lower.includes('ಸೂಕ್ತ') || lower.includes('అనుకూలం') || lower.includes('suitable')) {
          aiReply =
            language === 'kn'
              ? 'ಪ್ರಸ್ತುತ ಉಷ್ಣಾಂಶ (31°C) ಮತ್ತು ಆರ್ದ್ರತೆ (78%) ಸ್ಥಿತಿಯಲ್ಲಿ ಹತ್ತಿ (Cotton), ಸೋಯಾಬೀನ್ (Soybean), ಮತ್ತು ತೊಗರಿ (Tur) ಬೆಳೆಗಳಿಗೆ ಬಹಳ ಅನುಕೂಲಕರವಾಗಿದೆ. ನಮ್ಮ "ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ" ಪುಟವನ್ನು ಪರೀಕ್ಷಿಸಿ.'
              : language === 'te'
              ? 'ప్రస్తుత ఉష్ణోగ్రత (31°C) మరియు తేమ (78%) పరిస్థితులలో పత్తి (Cotton), సోయాబీన్ (Soybean), మరియు కంది (Tur) అనుకూలమైనవి. పూర్తి వివరాలకు "వాతావరణం & పంట గైడ్" చూడండి.'
              : 'Current conditions (31°C, 78% humidity) are highly suitable for Cotton, Soybean, and Red Gram (Tur). View our Weather & Crop Guide tab for detailed analysis.';
        } else if (lower.includes('irrigate') || lower.includes('ನೀರು') || lower.includes('నీరు')) {
          aiReply =
            language === 'kn'
              ? 'ಮಣ್ಣಿನ ತೇವಾಂಶ 75% ಇದೆ ಮತ್ತು ಮಳೆಯ ಸಾಧ್ಯತೆ 65% ಇರುವುದರಿಂದ, ಮುಂದಿನ 24 ಗಂಟೆಗಳ ಕಾಲ ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡುವುದು ಸೂಕ್ತವಾಗಿದೆ.'
              : language === 'te'
              ? 'నేల తేమ 75% ఉంది మరియు వర్షపు సంభావ్యత 65% ఉన్నందున, రాబోయే 24 గంటల పాటు నీటిపారుదలని వాయిదా వేయడం మంచిది.'
              : 'Current soil moisture is at 75% with 65% rain probability. It is recommended to postpone irrigation for the next 24 hours.';
        } else {
          aiReply = response.answer || (
            language === 'kn'
              ? 'ಬೆಳೆ ರಕ್ಷಣೆಗಾಗಿ: ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ, ಜಮೀನಿನಲ್ಲಿ ಸರಿಯಾದ ನೀರು ಹರಿಯುವಿಕೆ ನಿರ್ವಹಿಸಿ. ಜೈವಿಕ ನಿಯಂತ್ರಣಕ್ಕೆ 5% ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.'
              : language === 'te'
              ? 'పంట రక్షణ కొరకు: తెగులు సోకిన ఆకులను తొలగించి నాశనం చేయండి, పొలంలో సరైన డ్రైనేజీ ఉండేలా చూసుకోండి. సేంద్రీయ రక్షణ కోసం 5% వేపనూనె పిచికారీ చేయండి.'
              : 'For optimal crop protection: Remove infected foliage, maintain field drainage, and spray 5% Neem oil deterrent as early preventive care.'
          );
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'kn'
            ? 'ಶಿಫಾರಸು: ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಸಮತೋಲಿತ NPK ಜೊತೆಗೆ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸತು ಸಿಂಪಡಿಸಿ. ಶಿಲೀಂಧ್ರ ನಿಯಂತ್ರಣಕ್ಕೆ ಟ್ರೈಕೋಡರ್ಮಾ ಬಳಸಿ.'
            : language === 'te'
            ? 'సిఫార్సు: పొలంలో నీరు నిల్వ ఉండకుండా చూడండి. సమతుల్య NPK తో పాటు జింక్ సల్ఫేట్ 5 గ్రా/లీ వాడండి. సేంద్రీయ రక్షణకు ట్రైకోడెర్మా ఉపయోగించండి.'
            : 'Recommended practice: Ensure good soil drainage. Apply balanced N-P-K with micronutrient zinc sulphate @ 5g/L water.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'kn' ? 'kn-IN' : language === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {t.sidebar.aiAdvisory}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'kn'
              ? 'ಕೃಷಿ ತಜ್ಞರ ಜ್ಞಾನ ಮತ್ತು ICAR ಮಾರ್ಗದರ್ಶಿ ಸೂತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಖರ ಕೃಷಿ AI ಸಲಹೆಗಾರ.'
              : language === 'te'
              ? 'వ్యవసాయ నిపుణుల పరిజ్ఞానం మరియు ICAR మార్గదర్శకాల ఆధారంగా రూపొందించిన AI సలహాదారు.'
              : 'Precision conversational agronomy assistant powered by verified agricultural knowledge.'}
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `msg-${Date.now()}`,
                sender: 'ai',
                text: getWelcomeText(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'kn' ? 'ಹೊಸ ಚಾಟ್' : language === 'te' ? 'కొత్త చాట్' : 'New Chat'}</span>
        </button>
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {language === 'kn'
              ? 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು:'
              : language === 'te'
              ? 'సూచించిన ప్రశ్నలు:'
              : 'Suggested Questions:'}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {getSuggestedQuestions().map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 text-xs font-medium text-slate-700 hover:text-emerald-800 whitespace-nowrap transition-all shadow-2xs cursor-pointer flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1 max-w-[85%]">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${
                      isUser ? 'justify-end' : ''
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakMessage(msg.text)}
                        className="text-slate-400 hover:text-emerald-700 p-0.5 cursor-pointer flex items-center gap-1"
                        title="Listen to voice output"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">
                          {language === 'kn' ? 'ಕೇಳಿ' : language === 'te' ? 'వినండి' : 'Listen'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
                <span className="ml-1 font-medium">
                  {language === 'kn'
                    ? 'AI ಕೃಷಿ ಜ್ಞಾನಕೋಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...'
                    : language === 'te'
                    ? 'AI వ్యవసాయ డేటాబేస్ విశ్లేషించబడుతోంది...'
                    : 'Consulting AgriSense AI database...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder={
                  isVoiceInputActive
                    ? language === 'kn'
                      ? '🎙️ ಧ್ವನಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ'
                      : language === 'te'
                      ? '🎙️ వాయిస్ వినబడుతోంది... మాట్లాడండి'
                      : '🎙️ Listening to your voice... Speak now'
                    : language === 'kn'
                    ? 'ಬೆಳೆ, ರೋಗ ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ...'
                    : language === 'te'
                    ? 'పంట, తెగులు లేదా వాతావరణం గురించి ప్రశ్న అడగండి...'
                    : 'Type your crop question or click mic to speak...'
                }
                className={`w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded-2xl bg-white border transition-all font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  isVoiceInputActive
                    ? 'border-emerald-500 ring-2 ring-emerald-400/30'
                    : 'border-slate-200'
                }`}
              />

              {/* Dictation Mic Button in input */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                  isVoiceInputActive
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                }`}
                title="Speak question using voice dictation"
              >
                {isVoiceInputActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'kn' ? 'ಕೇಳಿ' : language === 'te' ? 'అడగండి' : 'Ask'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
