import { buildShareLinks, buildShareUrl } from '~/lib/shareHelper';

describe('buildShareLinks', () => {
  const url = 'https://kamimap.com/map/2024-noto-earthquake#37.4,136.8-37.2,137.3';
  const text = '令和6年能登半島地震関連情報 - 地図情報を印刷できる「紙マップ」';

  test('returns one link per service, in a stable order', () => {
    const links = buildShareLinks(url, text);
    expect(links.map((link) => link.id)).toEqual(['x', 'facebook', 'line']);
  });

  test('carries the displayed area by encoding the whole url', () => {
    const links = buildShareLinks(url, text);
    links.forEach((link) => {
      expect(link.href).toContain(encodeURIComponent(url));
      // 生のハッシュが残るとクエリが途中で切れ、表示範囲が伝わらない
      expect(link.href).not.toContain('#');
    });
  });

  test('passes the share text only to the services that accept one', () => {
    const links = buildShareLinks(url, text);
    const withText = links.filter((link) =>
      link.href.includes(encodeURIComponent(text))
    );
    expect(withText.map((link) => link.id)).toEqual(['x', 'line']);
  });

  test('encodes text that would otherwise break the query string', () => {
    const links = buildShareLinks('https://example.com/?a=1&b=2', 'A & B');
    links.forEach((link) => {
      expect(link.href).toContain('https%3A%2F%2Fexample.com%2F%3Fa%3D1%26b%3D2');
    });
    links
      .filter((link) => link.id !== 'facebook')
      .forEach((link) => {
        expect(link.href).toContain(encodeURIComponent('A & B'));
      });
  });

  test('every link is an absolute https url', () => {
    const links = buildShareLinks(url, text);
    links.forEach((link) => {
      expect(link.href.startsWith('https://')).toBe(true);
    });
  });
});

describe('buildShareUrl', () => {
  test('uses the live url once it is available', () => {
    const live = 'https://kamimap.com/en/map/2024-noto-earthquake#37.4,136.8-37.2,137.3';
    expect(buildShareUrl(live, '/en/map/2024-noto-earthquake')).toBe(live);
  });

  test('keeps the locale prefix when falling back to the route', () => {
    // strategy は prefix_except_default なので、日本語以外は接頭辞が付く。
    // これを落とすと英語ページが日本語版の URL を共有してしまう
    expect(buildShareUrl(null, '/en/map/2024-noto-earthquake')).toBe(
      'https://kamimap.com/en/map/2024-noto-earthquake'
    );
  });

  test('leaves the default locale unprefixed', () => {
    expect(buildShareUrl(null, '/map/2024-noto-earthquake')).toBe(
      'https://kamimap.com/map/2024-noto-earthquake'
    );
  });
});
