export default {
  locales: [
    {
      code: 'en',
      iso: 'en',
      name: 'English',
      file: 'en.json'
    },
    {
      code: 'es',
      iso: 'es',
      name: 'Español',
      file: 'es.json'
    },
    {
      code: 'tw',
      iso: 'tw',
      name: '正體中文 (繁體)',
      file: 'tw.json'
    },
    {
      code: 'ja',
      iso: 'ja',
      name: '日本語',
      file: 'ja.json'
    }
  ],
  strategy: 'prefix_except_default',
  defaultLocale: 'ja',
  lazy: true,
  loadLanguagesAsync: true,
  langDir: 'locales/'
}
