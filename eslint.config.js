export default [
  {
    ignores: ['node_modules/**', 'dist/**', '.nuxt/**'],
  },
  {
    files: ['**/*.js', '**/*.vue'],
    rules: {
      // Basic rules to maintain compatibility
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];