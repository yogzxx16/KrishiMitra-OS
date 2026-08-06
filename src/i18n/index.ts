import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';

i18n
  // Detect user language from browser settings / localStorage
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ta'],
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already safe from XSS
    }
  });

export default i18n;
