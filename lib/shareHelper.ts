export interface ShareLink {
  id: string;
  label: string;
  iconClass: string;
  href: string;
}

/**
 * 地図ページを SNS で共有するためのリンクを組み立てる。
 *
 * トップページは公式の埋め込みウィジェット（Facebook SDK / Twitter widgets.js /
 * LINE の social-plugin loader）を使っているが、地図ページでは使えない。
 * 地図ページの URL は表示範囲がハッシュに載って利用者の操作で変わるのに対し、
 * ウィジェットは描画時点の data-url を固定してしまうためで、
 * 「いま見えている範囲の地図」を共有するには URL を都度組み立てる必要がある。
 * 外部スクリプトを読まない分、回線の細い被災地でも表示を妨げない。
 */
export function buildShareLinks(shareUrl: string, shareText: string): ShareLink[] {
  const url = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(shareText);
  return [
    {
      id: 'x',
      label: 'X',
      iconClass: 'fab fa-x-twitter',
      href: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      iconClass: 'fab fa-facebook',
      href: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    },
    {
      id: 'line',
      label: 'LINE',
      iconClass: 'fab fa-line',
      href: 'https://social-plugins.line.me/lineit/share?url=' + url + '&text=' + text,
    },
  ];
}
