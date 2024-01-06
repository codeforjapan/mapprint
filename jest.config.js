module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest',
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/test-unit/**/*.spec.js'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx,vue}',
    '!**/node_modules/**',
    '!**/.nuxt/**',
    '!**/@types/**',
    '!**/.eslintrc.js',
    '!**/nuxt.config.js',
    '!**/jest.config.js',
    '!**/nuxt-i18n.config.js',
    '!**/nuxt-router-override-sample.config.js',
    '!**/tests/**',
    '!**/coverage/**',
  ],
};
