import * as fs from "fs";
import sortCSSmq from "sort-css-media-queries";
import i18n from "./nuxt-i18n.config";

let router = {
  base: "/",
};
try {
  if (fs.existsSync("./nuxt-router-override.config.js")) {
    router = require("./nuxt-router-override.config").default;
  }
// eslint-disable-next-line no-empty
} finally {
}

export default {
  /*
   ** Headers of the page
   */
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
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: [
    {
      src: "~/assets/fonts/fontawesome/css/all.css",
      "data-viewport-units-buggyfill": "ignore",
    },
    { src: "~/assets/sass/styles.scss", lang: "scss" },
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "~/plugins/mapbox", mode: "client" },
    { src: "~/plugins/simplebar", mode: "client" },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module'
    "@nuxt/typescript-build",
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    ["nuxt-i18n", i18n],
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},

  i18n: {
    vueI18n: {
      silentTranslationWarn: true,
    },
  },
  /*
   ** Build configuration
   */
  generate: {
    routes() {
      const list = require("./assets/config/list.json");
      const mapped = list.map((name) => {
        return [
          "/map/" + name.replace(".json", ""),
          "/en/map/" + name.replace(".json", ""),
        ];
      });
      return [].concat(...mapped);
    },
    fallback: true,
  },
  router,
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.resolve.alias["mapbox-gl"] = "maplibre-gl";
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    },
    postcss: {
      postcssOptions: {
        plugins: {
          "css-mqpacker": {
            sort: sortCSSmq,
          },
          cssnano: {
            reduceIdents: false,
            zindex: false,
          },
        },
        preset: {
          autoprefixer: {
            grid: "autoplace",
          },
        },
      },
    },
  },
  watchers: {
    webpack: {
      ignored: /node_modules/,
    },
  },
};
