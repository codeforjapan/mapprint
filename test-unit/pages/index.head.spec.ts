// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { useNuxtApp } from '#app';
import IndexPage from '~/pages/index.vue';

// defineNuxtComponent の head() は setup 経由で評価されるため、その時点では
// this から computed も setup の戻り値も見えない。以前ここで this.locale が
// undefined になり、日本語でもタイトルが "KamiMap" になっていた。
// 例外は出ず画面も崩れないので、実際に描画したタイトルで固定する。

const titleFor = async (locale: string) => {
  const { $i18n } = useNuxtApp() as any;
  $i18n.locale.value = locale;
  await mountSuspended(IndexPage);
  // useHead はクライアントでは document に反映されるので、実際のタイトルを見る
  await new Promise((r) => setTimeout(r, 0));
  return document.title;
};

describe('トップページのタイトル', () => {
  test('ja では翻訳された名前を使う', async () => {
    expect(await titleFor('ja')).toBe('紙マップ');
  });

  test('翻訳のないロケールでは英語の固定名にフォールバックする', async () => {
    expect(await titleFor('zh')).toBe('KamiMap');
  });
});
