import en from './locales/en.json'
import ja from './locales/ja.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'ja',
  messages: {
    en,
    ja
  }
}))