import * as fs from "fs";
import i18n from "./nuxt-i18n.config";
import list from "./assets/config/list.json";

let baseURL = "/";
if (fs.existsSync("./nuxt-router-override.config.js")) {
  // eslint-disable-next-line
  baseURL = require("./nuxt-router-override.config").default.base || "/";
}

// 静的生成するルート。Nuxt 2 の generate.routes() の置き換え。
// strategy が prefix_except_default なので、既定ロケール（ja）は接頭辞なし、
// それ以外は /{locale}/ を付ける。トップと各災害の地図ページを全ロケール分並べる。
const prefixes = i18n.locales
  .map((l) => (l.code === i18n.defaultLocale ? "" : "/" + l.code));
const mapIds = list.map((name) => name.replace(".json", ""));
const prerenderRoutes = prefixes.flatMap((prefix) => [
  prefix === "" ? "/" : prefix,
  ...mapIds.map((id) => prefix + "/map/" + id),
]);

export default defineNuxtConfig({
  // Nuxt 4 の既定 srcDir は app/ だが、既存の配置を維持する
  srcDir: ".",
  dir: {
    app: "app",
  },

  app: {
    baseURL,
    head: {
      htmlAttrs: {
        prefix: "og: http://ogp.me/ns#",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { property: "og:type", content: "website" },
        {
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

  css: [
    "~/assets/fonts/fontawesome/css/all.css",
    "~/assets/sass/styles.scss",
  ],

  plugins: [{ src: "~/plugins/simplebar", mode: "client" }],

  modules: ["@nuxtjs/i18n"],

  i18n,

  nitro: {
    prerender: {
      routes: prerenderRoutes,
      failOnError: true,
    },
  },

  vite: {
    resolve: {
      alias: {
        "mapbox-gl": "maplibre-gl",
      },
    },
  },

  compatibilityDate: "2026-07-30",
});
