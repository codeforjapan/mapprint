export default {
  locales: [
    {
      code: 'en',
      language: 'en',
      name: 'English',
      file: 'en.json'
    },
    {
      code: 'es',
      language: 'es',
      name: 'Español',
      file: 'es.json'
    },
    {
      code: 'hi',
      language: 'hi',
      name: 'हिंदी',
      file: 'hi.json'
    },
    {
      code: 'ja',
      language: 'ja',
      name: '日本語',
      file: 'ja.json'
    },
    {
      code: 'ko',
      language: 'ko',
      name: '한국어',
      file: 'ko.json'
    },
    {
      code: 'my',
      language: 'my',
      name: 'မြန်မာ',
      file: 'my.json'
    },
    {
      code: 'ne',
      language: 'ne',
      name: 'नेपाली',
      file: 'ne.json'
    },
    {
      code: 'pt',
      language: 'pt',
      name: 'português',
      file: 'pt.json'
    },
    {
      code: 'si',
      language: 'si',
      name: 'සිංහල',
      file: 'si.json'
    },
    {
      code: 'th',
      language: 'th',
      name: 'แบบไทย',
      file: 'th.json'
    },
    {
      code: 'tw',
      language: 'tw',
      name: '正體中文 (繁體)',
      file: 'tw.json'
    },
    {
      code: 'vn',
      language: 'vn',
      name: 'Tiếng Việt',
      file: 'vn.json'
    },
    {
      code: 'zh',
      language: 'zh',
      name: '中文（简体）',
      file: 'zh.json'
    }
  ],
  strategy: 'prefix_except_default',
  defaultLocale: 'ja',
  lazy: true,
  langDir: '../locales',
  bundle: {
    optimizeTranslationDirective: false
  },
  // 接頭辞なしの / に来たときだけブラウザの言語で振り分ける。
  // /en/ のように明示された接頭辞は尊重する（redirectOn: 'root'）。
  // nuxt-i18n v6 の既定は全ルートで振り分けるため、日本語端末で /en/ を開くと
  // 日本語になっていた。これは i18n を導入した #299 の受け入れ条件に反する。
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root'
  }
}
