import { defineVitestConfig } from '@nuxt/test-utils/config';

// Nuxt の変換パイプライン（pug テンプレート、SFC の style ブロック、
// ~ / @ エイリアス、自動 import）をそのままテストに使う。
export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    // 既存の spec は describe / test / expect をグローバルで使っているため有効にする
    globals: true,
    setupFiles: ['./test-unit/setup.ts'],
    include: ['test-unit/**/*.spec.{js,ts}'],
  },
});
