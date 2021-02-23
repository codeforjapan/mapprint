module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2016,
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/recommended'
  ],
  plugins: [
    'vue',
    'html'
  ],
  // add your custom rules here
  rules: {
    quotes: ['error', 'single'],
    camelcase: 'warn',
    'vue/no-mutating-props': 'warn',
    'brace-style': 'warn',
    'eqeqeq': 'warn',
    'quotes': 'warn',
    semi: 'error'
  }
}
