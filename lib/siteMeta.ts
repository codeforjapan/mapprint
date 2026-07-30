// トップページのタイトルと説明。翻訳が揃っているロケールは翻訳を使い、
// それ以外は英語の固定文にフォールバックする。
// "kr" は移行前からの誤りで、ロケールコードは ko である。挙動を変えないためそのまま残す。
const TRANSLATED_LOCALES = ["ja", "en", "kr"];

export function getSiteMeta(
  locale: string | undefined,
  // eslint-disable-next-line no-unused-vars -- 型注釈の引数名を未使用変数と誤検知するため
  t: (key: string) => string
): { siteName: string; siteDesc: string } {
  if (locale && TRANSLATED_LOCALES.includes(locale)) {
    return { siteName: t("common.site_name"), siteDesc: t("common.site_desc") };
  }
  return {
    siteName: "KamiMap",
    siteDesc: "Paper Map for printable map information",
  };
}
