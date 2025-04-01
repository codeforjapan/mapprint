// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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

  // Module configurations
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ja', 
    locales: [
      { code: 'ja', iso: 'ja-JP', name: '日本語' },
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'zh', iso: 'zh-CN', name: '中文' },
      { code: 'ko', iso: 'ko-KR', name: '한국어' },
      { code: 'es', iso: 'es-ES', name: 'Español' },
      { code: 'pt', iso: 'pt-BR', name: 'Português' },
      { code: 'th', iso: 'th-TH', name: 'ไทย' },
      { code: 'vn', iso: 'vi-VN', name: 'Tiếng Việt' },
      { code: 'my', iso: 'my-MM', name: 'မြန်မာ' },
      { code: 'ne', iso: 'ne-NP', name: 'नेपाली' },
      { code: 'si', iso: 'si-LK', name: 'සිංහල' },
      { code: 'hi', iso: 'hi-IN', name: 'हिन्दी' },
      { code: 'tw', iso: 'zh-TW', name: '繁体中文' },
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'ja',
    // Using the new Vue I18n 9 integration
    vueI18n: './i18n.config.ts'
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

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true
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