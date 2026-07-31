// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { useNuxtApp } from '#app';
import IndexPage from '~/pages/index.vue';

// defineNuxtComponent の head() は setup 経由で評価されるため、その時点では
// this から computed も setup の戻り値も見えない。以前ここで this.locale が
// undefined になり、日本語でもタイトルが "KamiMap" になっていた。
// 例外は出ず画面も崩れないので、実際に描画したタイトルで固定する。

const titleFor = async (locale: string, expected: string) => {
  const { $i18n } = useNuxtApp() as any;
  // lazy: true なので locale.value を直接書き換えても翻訳は読み込まれない。
  // setLocale を使って読み込みまで待つ
  await $i18n.setLocale(locale);
  const wrapper = await mountSuspended(IndexPage);
  // useHead が document に反映されるのは非同期なので、期待値になるまで待つ。
  // 壊れているときは変わらないままタイムアウトして、その値で落ちる
  for (let i = 0; i < 40 && document.title !== expected; i++) {
    await new Promise((r) => setTimeout(r, 25));
  }
  const title = document.title;
  // 前のマウントが残るとその useHead が document.title を握り続けるため必ず破棄する
  wrapper.unmount();
  await new Promise((r) => setTimeout(r, 25));
  return title;
};

// 分岐そのものは test-unit/lib/siteMeta.spec.ts で見ている。
// ここは useHead が実際に locale を見られているか（head() のままなら見られない）だけを見る。
// 同じ app に2回マウントすると前の useHead が document.title を握るため、1件に絞る。
describe('トップページのタイトル', () => {
  test('ja では翻訳された名前が実際に描画される', async () => {
    expect(await titleFor('ja', '紙マップ')).toBe('紙マップ');
  });
});
