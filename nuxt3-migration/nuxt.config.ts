// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Set compatibility date for Nuxt
  compatibilityDate: '2025-04-01',
  // General
  app: {
    head: {
      htmlAttrs: {
        prefix: "og: http://ogp.me/ns#",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "og:type", property: "og:type", content: "website" },
        {
          hid: "og:image",
          property: "og:image",
          content: "https://kamimap.com/images/ogp_main.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: "/apple-touch-icon.png",
        },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Open+Sans",
        },
      ],
      script: [
        { src: "https://www.googletagmanager.com/gtag/js?id=UA-45275834-9" },
        { src: "/ga.js" },
      ],
    },
  },

  // CSS
  css: [
    "~/assets/fonts/fontawesome/css/all.css",
    "~/assets/sass/styles.scss",
  ],

  // Modules
  modules: [
    '@nuxtjs/i18n',
  ],
  
  // Enable dev tools in development mode
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  // Module configurations
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ja',
    debug: true, // Enable debug for development
    locales: [
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'pt', name: 'Português', file: 'pt.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' },
      { code: 'vn', name: 'Tiếng Việt', file: 'vn.json' },
      { code: 'my', name: 'မြန်မာ', file: 'my.json' },
      { code: 'ne', name: 'नेपाली', file: 'ne.json' },
      { code: 'si', name: 'සිංහල', file: 'si.json' },
      { code: 'hi', name: 'हिन्दी', file: 'hi.json' },
      { code: 'tw', name: '繁体中文', file: 'tw.json' },
    ],
    lazy: true,
    langDir: 'locales',
    vueI18n: './i18n.config.ts',
    pages: {
      'index': {
        ja: '/',
        en: '/en'
      },
      'map/[map]': {
        ja: '/map/:map',
        en: '/en/map/:map'
      }
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      // Configuration accessible from client-side code
      mapStyle: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
    }
  },

  // Build configuration
  build: {
    transpile: [
      "maplibre-gl"
    ],
  },

  // TypeScript - disable type checking until migration is complete
  typescript: {
    strict: false,
    typeCheck: false,
    shim: false
  },

  // Vite
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Add your SASS options here
        }
      }
    }
  }
});