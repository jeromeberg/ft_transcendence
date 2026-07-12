import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// EN
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enNav from './locales/en/nav.json';
import enPages from './locales/en/pages.json';
import enAchievements from './locales/en/achievements.json';

// FR
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frNav from './locales/fr/nav.json';
import frPages from './locales/fr/pages.json';
import frAchievements from './locales/fr/achievements.json';

// ES
import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esNav from './locales/es/nav.json';
import esPages from './locales/es/pages.json';
import esAchievements from './locales/es/achievements.json';

export const SUPPORTED = ['en', 'fr', 'es'] as const;
export type Lang = (typeof SUPPORTED)[number];
export const STORAGE_KEY = 'lang';

export const DB_LANG_MAP: Record<string, Lang> = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
};

export const LANG_DB_MAP: Record<Lang, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
};

function detectGuestLanguage(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && SUPPORTED.includes(stored)) return stored;

  const browser = navigator.language.slice(0, 2) as Lang;
  if (SUPPORTED.includes(browser)) return browser;

  return 'en';
}

i18n.use(initReactI18next).init({
  lng: detectGuestLanguage(),
  fallbackLng: 'en',
  ns: ['common', 'auth', 'nav', 'pages', 'achievements'],
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      nav: enNav,
      pages: enPages,
      achievements: enAchievements,
    },
    fr: {
      common: frCommon,
      auth: frAuth,
      nav: frNav,
      pages: frPages,
      achievements: frAchievements,
    },
    es: {
      common: esCommon,
      auth: esAuth,
      nav: esNav,
      pages: esPages,
      achievements: esAchievements,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
export { tError } from './tError';
