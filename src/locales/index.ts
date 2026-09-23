import { AppLanguage, LocaleTranslations } from './types';
import { en } from './en';
import { kn } from './kn';
import { te } from './te';
import { hi } from './hi';

export * from './types';

export const LOCALES: Record<AppLanguage, LocaleTranslations> = {
  en,
  kn,
  te,
  hi,
};

export const AVAILABLE_LANGUAGES: {
  code: AppLanguage;
  label: string;
  nativeName: string;
  badge: string;
  speechCode: 'en-IN' | 'kn-IN' | 'te-IN' | 'hi-IN';
}[] = [
  { code: 'en', label: 'English', nativeName: 'English', badge: 'EN', speechCode: 'en-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', badge: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', badge: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', badge: 'हिंदी', speechCode: 'hi-IN' },
];

const STORAGE_KEY = 'agrisense_language';

export const getLocale = (lang?: AppLanguage | string): LocaleTranslations => {
  const normalized = (lang as AppLanguage) || 'en';
  return LOCALES[normalized] || LOCALES.en;
};

export const loadLanguageFromStorage = (): AppLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'kn' || saved === 'te' || saved === 'hi') {
      return saved;
    }
    if (saved === 'Kannada') return 'kn';
    if (saved === 'Telugu') return 'te';
    if (saved === 'Hindi') return 'hi';
    return 'en';
  } catch {
    return 'en';
  }
};

export const saveLanguageToStorage = (lang: AppLanguage) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
};
