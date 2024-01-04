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
      code: 'hi',
      iso: 'hi',
      name: 'हिंदी',
      file: 'hi.json'
    },
    {
      code: 'ja',
      iso: 'ja',
      name: '日本語',
      file: 'ja.json'
    },
    {
      code: 'kr',
      iso: 'kr',
      name: '한국어',
      file: 'kr.json'
    },
    {
      code: 'my',
      iso: 'my',
      name: 'မြန်မာ',
      file: 'my.json'
    },
    {
      code: 'ne',
      iso: 'ne',
      name: 'नेपाली',
      file: 'ne.json'
    },
    {
      code: 'pt',
      iso: 'pt',
      name: 'português',
      file: 'pt.json'
    },
    {
      code: 'si',
      iso: 'si',
      name: 'සිංහල',
      file: 'si.json'
    },
    {
      code: 'th',
      iso: 'th',
      name: 'แบบไทย',
      file: 'th.json'
    },
    {
      code: 'tw',
      iso: 'tw',
      name: '正體中文 (繁體)',
      file: 'tw.json'
    },
    {
      code: 'vn',
      iso: 'vn',
      name: 'Tiếng Việt',
      file: 'vn.json'
    },
    {
      code: 'zh',
      iso: 'zh',
      name: '中文（简体）',
      file: 'zh.json'
    }
  ],
  strategy: 'prefix_except_default',
  defaultLocale: 'ja',
  lazy: true,
  loadLanguagesAsync: true,
  langDir: 'locales/'
}
