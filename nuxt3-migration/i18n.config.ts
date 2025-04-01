export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ja',
  messages: {
    ja: {
      common: {
        title: 'カミマップ',
        site_name: 'カミマップ - 紙でマップ',
        site_desc: '地図情報を印刷できる「紙マップ」',
        about: 'このサイトについて',
        contribute: '貢献する',
        share: '共有'
      }
    },
    en: {
      common: {
        title: 'KamiMap',
        site_name: 'KamiMap - Paper Map',
        site_desc: 'Paper Map for printable map information',
        about: 'About',
        contribute: 'Contribute',
        share: 'Share'
      }
    }
  }
}))