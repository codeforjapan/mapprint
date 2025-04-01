// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans' }
      ]
    }
  },

  modules: [
    '@nuxtjs/i18n'
  ],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ja',
    locales: [
      { code: 'ja', name: '日本語', file: 'ja.ts' },
      { code: 'en', name: 'English', file: 'en.ts' }
    ],
    langDir: 'locales',
    lazy: true,
    defaultDirection: 'ltr'
  },

  css: [
    // Will add Font Awesome later
    // '@/assets/fonts/fontawesome/css/all.css',
    // Will add SASS styles later
    // '@/assets/sass/styles.scss',
  ],

  vite: {
    resolve: {
      alias: {
        'mapbox-gl': 'maplibre-gl'
      }
    }
  },

  compatibilityDate: '2025-04-01'
})