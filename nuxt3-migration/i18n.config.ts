export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  // When using lazy loading, messages are loaded by the i18n module
  messages: {}
}))