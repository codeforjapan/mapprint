import globals from 'globals';

const importPlugin = async (name) => (await import(name)).default;

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = async () => {
  return [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.nuxt/**',
      'coverage/**',
      '*.min.js',
    ],
  },
  // Plugin rules
  {
    plugins: {
      import: await importPlugin('eslint-plugin-import'),
      vue: await importPlugin('eslint-plugin-vue'),
    },
    rules: {},
  },
  // Default config for all files
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    files: ['**/*.js', '**/*.ts'],
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  // Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: await importPlugin('vue-eslint-parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  },
  // TypeScript source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: await importPlugin('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json', // tsconfig.json がある場所
      },
    },
  },
  // TypeScript declaration files
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: await importPlugin('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  },
];
};

export default await config();