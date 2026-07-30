import { getSiteMeta } from '~/lib/siteMeta';

const t = (key: string) => ({ 'common.site_name': '紙マップ', 'common.site_desc': '説明' }[key] ?? key);

describe('getSiteMeta', () => {
  test.each(['ja', 'en', 'kr'])('%s は翻訳を使う', (locale) => {
    expect(getSiteMeta(locale, t)).toEqual({ siteName: '紙マップ', siteDesc: '説明' });
  });

  // 翻訳が揃っていないロケールで空にならないことを確認する。
  // ここが空になると日本語圏以外の利用者にタイトルも説明も出なくなる。
  test.each(['zh', 'th', 'ne', 'si'])('%s は英語の固定文にフォールバックする', (locale) => {
    expect(getSiteMeta(locale, t)).toEqual({
      siteName: 'KamiMap',
      siteDesc: 'Paper Map for printable map information',
    });
  });

  // head() が setup 経由で評価されると locale が undefined になる。
  // その場合も落ちずに固定文を返すが、ja でこれになっては困る（回帰は index.head.spec が見る）
  test('locale が undefined でも落ちない', () => {
    expect(getSiteMeta(undefined, t).siteName).toBe('KamiMap');
  });

  // ko は翻訳ファイルがあるのに "kr" と書かれているため翻訳されない（移行前からの誤り）
  test('ko は現状フォールバックする（移行前からの誤りを保持）', () => {
    expect(getSiteMeta('ko', t).siteName).toBe('KamiMap');
  });
});
