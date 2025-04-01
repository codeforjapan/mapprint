// Define i18n configuration
export default {
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  // Necessary for proper routing
  globalInjection: true,
  // Add missing translation warning in development
  missingWarn: process.env.NODE_ENV === 'development',
  // When using lazy loading, messages are loaded by the i18n module
  messages: {}
}