// https://nuxt.com/docs/api/configuration/nuxt-config
// Note: defineNuxtConfig is automatically available during build process
export default {
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


  // Enable dev tools in development mode
  devtools: { enabled: process.env.NODE_ENV !== 'production' },


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

  // TypeScript - configuration for debugging
  typescript: {
    strict: false,
    typeCheck: true, // Enable for VSCode debugging
    shim: false
  },

  // Enable source maps for debugging
  sourcemap: true,

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
};