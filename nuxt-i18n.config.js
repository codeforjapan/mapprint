export default {
  locales: [
    {
      code: 'en',
      iso: 'en',
      name: 'English',
      file: 'en.json'
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
  langDir: 'locales/'
}