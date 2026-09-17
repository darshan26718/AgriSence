import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock,
  User,
  Sprout,
  Globe,
  ChevronDown,
  Eye,
  EyeOff,
  MapPin,
  Leaf,
  Check,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, getLocale } from '../../locales';
import { FarmerUser, DEMO_FARMER_ACCOUNTS } from '../../types/auth';

interface ModernLoginPageProps {
  onLoginSuccess: (user: FarmerUser) => void;
  language: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onContinueAsGuest?: () => void;
}

export const ModernLoginPage: React.FC<ModernLoginPageProps> = ({
  onLoginSuccess,
  language,
  onSelectLanguage,
  onContinueAsGuest,
}) => {
  const t = getLocale(language).auth;
  const common = getLocale(language).common;

  const [authMode, setAuthMode] = useState<'otp' | 'pin' | 'register'>('otp');
  const [phone, setPhone] = useState('98450 88210');
  const [farmerName, setFarmerName] = useState('Ramesh Patil');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('Dharwad');
  const [crop, setCrop] = useState('Tomato & Cotton');
  const [acres, setAcres] = useState('4.5');

  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('489215');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const languagesList: { code: AppLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    // Generate random 6-digit OTP
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);

    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      setCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setShowSmsBanner(true);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    setErrorMsg('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP.');
      return;
    }

    if (entered !== generatedOtp && entered !== '123456' && entered !== '489215') {
      setErrorMsg(`Incorrect OTP code. Please use the simulated OTP: ${generatedOtp}`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user: FarmerUser = {
        id: `FARMER-${Date.now().toString().slice(-4)}`,
        name: farmerName.trim() || 'Ramesh Patil',
        phone: `+91 ${phone}`,
        state: stateName,
        district: `${district}, ${stateName}`,
        primaryCrop: crop,
        farmSizeAcres: parseFloat(acres) || 4.5,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        joinedDate: 'Kharif 2024',
      };
      localStorage.setItem('agrisense_user', JSON.stringify(user));
      onLoginSuccess(user);
    }, 600);
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pin || pin.length < 4) {
      setErrorMsg('Please enter your 4-digit PIN.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user: FarmerUser = {
        id: `FARMER-${Date.now().toString().slice(-4)}`,
        name: farmerName || 'Ramesh Patil',
        phone: `+91 ${phone}`,
        state: stateName,
        district: `${district}, ${stateName}`,
        primaryCrop: crop,
        farmSizeAcres: parseFloat(acres) || 4.5,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        joinedDate: 'Kharif 2024',
      };
      localStorage.setItem('agrisense_user', JSON.stringify(user));
      onLoginSuccess(user);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user: FarmerUser = {
        id: `FARMER-${Date.now().toString().slice(-4)}`,
        name: farmerName.trim(),
        phone: `+91 ${phone}`,
        state: stateName,
        district: `${district}, ${stateName}`,
        primaryCrop: crop,
        farmSizeAcres: parseFloat(acres) || 5.0,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        joinedDate: 'Kharif 2026',
      };
      localStorage.setItem('agrisense_user', JSON.stringify(user));
      onLoginSuccess(user);
    }, 600);
  };

  const handleSelectDemoAccount = (demo: FarmerUser) => {
    localStorage.setItem('agrisense_user', JSON.stringify(demo));
    onLoginSuccess(demo);
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-1.5">
              <span>AgriSense</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                Farmer AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Universal Agricultural Intelligence Platform
            </p>
          </div>
        </div>

        {/* Top Right: Language Selector & Guest Access */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{languagesList.find(l => l.code === language)?.native || 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Language
                  </div>
                  {languagesList.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-50 ${
                        language === l.code
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {onContinueAsGuest && (
            <button
              onClick={onContinueAsGuest}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Explore as Guest →
            </button>
          )}
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Agricultural Showcase & Value Points */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Smart Agriculture</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display leading-tight">
                Empowering Indian Farmers with Real-Time AI Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                Identify crop diseases in seconds, receive CIBRC-certified dosage recommendations, consult verified agricultural experts, and access hyper-local weather advisory.
              </p>
            </div>

            {/* Feature Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  📷
                </div>
                <h3 className="text-xs font-bold text-slate-900">AI Crop Leaf Scanner</h3>
                <p className="text-[11px] text-slate-500">
                  Instant visual detection of 120+ foliar pests and pathogens.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  👨‍🌾
                </div>
                <h3 className="text-xs font-bold text-slate-900">Crop Doctors & Specialists</h3>
                <p className="text-[11px] text-slate-500">
                  Direct phone calls and KVK clinic consultations near you.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  🌤️
                </div>
                <h3 className="text-xs font-bold text-slate-900">Weather & Suitable Crops</h3>
                <p className="text-[11px] text-slate-500">
                  Precision micro-climate alerts and safe spraying hours.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  🏢
                </div>
                <h3 className="text-xs font-bold text-slate-900">Agro Support Centres</h3>
                <p className="text-[11px] text-slate-500">
                  Locate certified Raitha Seva & Rythu Bharosa Kendras.
                </p>
              </div>
            </div>

            {/* Testimonial / Credibility Stamp */}
            <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center gap-4 shadow-sm">
              <div className="flex -space-x-2">
                {DEMO_FARMER_ACCOUNTS.map((f, i) => (
                  <img
                    key={i}
                    src={f.avatarUrl}
                    alt={f.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-800"
                  />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-100 block">
                  Trusted by 50,000+ Progressive Indian Farmers
                </span>
                <span className="text-emerald-300 text-[11px]">
                  Karnataka • Andhra Pradesh • Telangana • Maharashtra
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Login & Registration Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-fadeIn">
              {/* Card Header & Mode Switcher */}
              <div className="p-6 sm:p-7 border-b border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      {authMode === 'register'
                        ? 'Farmer Registration'
                        : language === 'kn'
                        ? 'ರೈತರ ಲಾಗಿನ್'
                        : language === 'te'
                        ? 'రైతు లాగిన్'
                        : language === 'hi'
                        ? 'किसान लॉगिन'
                        : 'Farmer Portal Login'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {authMode === 'register'
                        ? 'Create your free digital farmer account to unlock AI tools'
                        : 'Sign in to access your crop health diagnostics and advisories'}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      authMode === 'otp'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mobile OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('pin');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      authMode === 'pin'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PIN / Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    New Register
                  </button>
                </div>
              </div>

              {/* Simulated SMS Notification Banner */}
              {showSmsBanner && otpSent && (
                <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md animate-bounce-subtle flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      💬
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                        New SMS Received
                      </span>
                      <span className="text-xs font-mono font-bold truncate block">
                        Your AgriSense OTP is: <span className="underline text-amber-300">{generatedOtp}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-[11px] font-bold shadow-xs cursor-pointer flex-shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Form Body */}
              <div className="p-6 sm:p-7 space-y-5">
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* MODE 1: Mobile & OTP */}
                {authMode === 'otp' && (
                  <>
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Farmer Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={farmerName}
                              onChange={e => setFarmerName(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.mobileNumber}
                          </label>
                          <div className="relative flex">
                            <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                              🇮🇳 +91
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder="98765 43210"
                              className="flex-1 px-3.5 py-3 rounded-r-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>
                            We'll send a 6-digit verification code to this mobile number.
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <span>{isSubmitting ? 'Sending OTP...' : t.sendOtp}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center space-y-1">
                          <p className="text-xs text-slate-500">
                            {t.otpSentTo} <span className="font-bold text-slate-800">+91 {phone}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                          >
                            Change mobile number
                          </button>
                        </div>

                        {/* 6-Digit OTP Box Grid */}
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={el => {
                                inputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleOtpChange(idx, e.target.value)}
                              onKeyDown={e => handleOtpKeyDown(idx, e)}
                              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all focus:outline-none ${
                                digit
                                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                                  : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Resend Timer & Auto-fill button */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          {countdown > 0 ? (
                            <span>Resend OTP in <strong>{countdown}s</strong></span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{t.resendOtp}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAutoFillOtp}
                            className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                          >
                            Auto-fill demo code
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmitting ? 'Verifying...' : 'Verify & Enter AgriSense'}</span>
                        </button>
                      </form>
                    )}
                  </>
                )}

                {/* MODE 2: PIN / Password */}
                {authMode === 'pin' && (
                  <form onSubmit={handlePinLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t.mobileNumber}
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 px-3.5 py-3 rounded-r-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Security PIN / Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={pin}
                          onChange={e => setPin(e.target.value)}
                          placeholder="Enter 4-digit PIN"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Default demo PIN: <strong>1234</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                        <span>Remember this device</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('otp');
                          setOtpSent(false);
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Login with OTP instead
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isSubmitting ? 'Authenticating...' : 'Login with PIN'}</span>
                    </button>
                  </form>
                )}

                {/* MODE 3: New Farmer Registration */}
                {authMode === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Farmer Full Name
                      </label>
                      <input
                        type="text"
                        value={farmerName}
                        onChange={e => setFarmerName(e.target.value)}
                        placeholder="e.g. Ramesh Patil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 px-3 py-2.5 rounded-r-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          State
                        </label>
                        <select
                          value={stateName}
                          onChange={e => setStateName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                        >
                          <option value="Karnataka">Karnataka</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                          placeholder="e.g. Dharwad / Guntur"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Primary Crops
                        </label>
                        <input
                          type="text"
                          value={crop}
                          onChange={e => setCrop(e.target.value)}
                          placeholder="e.g. Tomato, Cotton"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Land Size (Acres)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={acres}
                          onChange={e => setAcres(e.target.value)}
                          placeholder="e.g. 4.5"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
                    >
                      <Sprout className="w-4 h-4" />
                      <span>{isSubmitting ? 'Registering...' : 'Register & Start Smart Farming'}</span>
                    </button>
                  </form>
                )}

                {/* 1-Click Fast Demo Farmer Accounts */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ⚡ Quick 1-Click Farmer Logins
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Instant Evaluation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DEMO_FARMER_ACCOUNTS.map(demo => (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleSelectDemoAccount(demo)}
                        className="p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={demo.avatarUrl}
                            alt={demo.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-200"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-emerald-800">
                              {demo.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {demo.district.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium truncate block">
                          🌱 {demo.primaryCrop}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-4 sm:px-8 py-4 text-center text-xs text-slate-400">
        <p>
          AgriSense Smart Agriculture Assistant • Aligned with ICAR Agronomy and CIBRC Guidance • Empowering Indian Farmers
        </p>
      </footer>
    </div>
  );
};
