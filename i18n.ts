import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['path', 'cookie', 'localStorage', 'navigator'],
            lookupFromPathIndex: 0
        },
        resources: {
            en: { translation: en },
            es: { translation: es },
            fr: { translation: fr },
            hi: { translation: hi }
        }
    });

export default i18n;
