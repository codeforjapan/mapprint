// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true }, // Enable devtools for debugging
  
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://kamimap.com/images/ogp_main.png' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }
      ],
      script: [
        { 
          src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js',
          defer: true
        }
      ]
    }
  },

  // Auto-import components
  components: true,

  modules: [
    '@nuxtjs/i18n'
  ],
  
  // Register plugins
  plugins: [
    '~/plugins/maplibre.ts',
    '~/plugins/simplebar.ts'
  ],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ja',
    locales: [
      { code: 'ja', name: '日本語', file: 'ja.ts' },
      { code: 'en', name: 'English', file: 'en.ts' },
      { code: 'es', name: 'Español', file: 'es.ts' },
      { code: 'hi', name: 'हिंदी', file: 'hi.ts' },
      { code: 'ko', name: '한국어', file: 'ko.ts' },
      { code: 'my', name: 'မြန်မာ', file: 'my.ts' },
      { code: 'ne', name: 'नेपाली', file: 'ne.ts' },
      { code: 'pt', name: 'português', file: 'pt.ts' },
      { code: 'si', name: 'සිංහල', file: 'si.ts' },
      { code: 'th', name: 'แบบไทย', file: 'th.ts' },
      { code: 'tw', name: '正體中文 (繁體)', file: 'tw.ts' },
      { code: 'vn', name: 'Tiếng Việt', file: 'vn.ts' },
      { code: 'zh', name: '中文（简体）', file: 'zh.ts' }
    ],
    langDir: 'locales',
    lazy: true,
    defaultDirection: 'ltr',
    bundle: {
      optimizeTranslationDirective: false
    }
  },

  css: [
    // Will add Font Awesome later
    // '@/assets/fonts/fontawesome/css/all.css',
    // Will add SASS styles later
    // '@/assets/sass/styles.scss',
  ],

  // Configure Vite for processing JSON files and other static assets
  vite: {
    resolve: {
      alias: {
        'mapbox-gl': 'maplibre-gl'
      }
    },
    json: {
      stringify: true // This enables importing JSON as objects
    }
  },

  // Add assets to be processed during build
  nitro: {
    publicAssets: [
      {
        dir: 'assets/config',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }
    ]
  },

  // Parse and process JSON files in assets
  webpack: {
    loaders: {
      json: {
        stringify: true
      }
    }
  },

  compatibilityDate: '2025-04-01'
})