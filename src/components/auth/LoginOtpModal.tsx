import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock,
  User,
  Sprout,
} from 'lucide-react';
import { AppLanguage, getLocale } from '../../locales';

interface LoginOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; phone: string }) => void;
  language?: AppLanguage;
}

export const LoginOtpModal: React.FC<LoginOtpModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language = 'en',
}) => {
  const t = getLocale(language).auth;

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('98450 88210');
  const [farmerName, setFarmerName] = useState('Ramesh Patil');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setCountdown(30);
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user = {
        name: farmerName || 'Farmer Member',
        phone: phoneNumber,
      };
      try {
        localStorage.setItem('agrisense_user', JSON.stringify(user));
      } catch {}
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Top Banner */}
        <div className="p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">AgriSense Login</h3>
              <p className="text-xs text-emerald-200">
                Farmer Verification & Smart Advisory
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farmer Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={farmerName}
                    onChange={e => setFarmerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.mobileNumber}
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-red-600">{errorMsg}</p>
              )}

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  We will send a 6-digit OTP for instant login verification.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Sending OTP...' : t.sendOtp}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500">
                  {t.otpSentTo} <span className="font-bold text-slate-800">+91 {phoneNumber}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Change mobile number
                </button>
              </div>

              {/* 6-digit OTP Inputs */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 rounded-xl text-center text-lg font-bold border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none bg-slate-50 font-mono"
                  />
                ))}
              </div>

              {/* Demo OTP Helper */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 text-center font-medium">
                💡 {t.demoOtpHint}: <span className="font-bold font-mono">123456</span>
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-red-600 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Verifying...' : t.verifyAndLogin}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive OTP?</span>
                {countdown > 0 ? (
                  <span className="font-mono text-slate-400">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(30);
                      setOtpDigits(['1', '2', '3', '4', '5', '6']);
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {t.resendOtp}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
