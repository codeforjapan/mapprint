import sortCSSmq from 'sort-css-media-queries'

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      prefix: 'og: http://ogp.me/ns#'
    },
    titleTemplate: '%s - 紙マップ',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '印刷できる災害情報サイト' },
      { hid: 'og:site_name', property: 'og:site_name', content: '紙マップ' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:title', property: 'og:title', content: '紙マップ' },
      { hid: 'og:description', property: 'og:description', content: '印刷できる災害情報サイト' },
      { hid: 'og:image', property: 'og:image', content: 'https://kamimap.com/images/ogp_main.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    link: [
      { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans' }
    ],
    script: [
      { src: 'https://www.googletagmanager.com/gtag/js?id=UA-45275834-9' },
      { src: '/ga.js' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    { src: '~/assets/fonts/fontawesome/css/all.css', 'data-viewport-units-buggyfill': 'ignore' },
    { src: '~/assets/sass/styles.scss', lang: 'scss' }
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/mapbox', mode: 'client' },
    { src: '~/plugins/simplebar', mode: 'client' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module'
    '@nuxt/typescript-build'

  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** Build configuration
  */
  generate: {
    routes () {
      const list = require('./assets/config/list.json')
      return list.map((name) => {
        return '/map/' + name.replace('.json', '')
      })
    },
    fallback: true
  },
  router: {
    base: '/'
  },
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    },
    postcss: {
      plugins: {
        'css-mqpacker': {
          sort: sortCSSmq
        },
        'cssnano': {
          reduceIdents: false,
          zindex: false
        }
      },
      preset: {
        autoprefixer: {
          grid: true
        }
      }
    }
  }
}
