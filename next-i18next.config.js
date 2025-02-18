const HttpBackend = require('i18next-http-backend/cjs');
const ChainedBackend = require('i18next-chained-backend').default;
const LocalStorageBackend = require('i18next-localstorage-backend').default;

module.exports = {
  backend: {
    backendOptions: [
      { expirationTime: 60 * 60 * 1000 },
      {
        /* loadPath: 'https:// somewhere else' */
      }
    ], // 1 hour
    backends: typeof window !== 'undefined' ? [LocalStorageBackend, HttpBackend] : []
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en']
  },
  // debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  serializeConfig: false,
  use: typeof window !== 'undefined' ? [ChainedBackend] : [],
  localeDetection: false
};
