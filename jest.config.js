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
  testMatch: ['<rootDir>/test/**/*.spec.js'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
};
