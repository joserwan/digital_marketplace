import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment-timezone';

import resources from 'shared/lib/i18n/locales';
i18n
  // connect with React
  .use(initReactI18next)
  .use(LanguageDetector)
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: false,
    resources,
    nonExplicitSupportedLngs: false,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
 
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      format: function(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase();
        if(value instanceof Date) return moment(value).format(format);
        return value;
      }
    },

    detection: {
      // order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

      // keys or params to lookup language from
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // cache user language on
      useCookie: true,
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)
    }
  });
  
i18n.on('languageChanged', function(lng) {
    moment.locale(lng);
  });
 
export default i18n;