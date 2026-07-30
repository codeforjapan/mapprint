import fs from 'node:fs';
import path from 'node:path';
import MapHelper from '~/lib/MapHelper';

// KML の取り込みは mapprint の中核。webpack から Vite に変わって
// @mapbox/togeojson の import 形が変わると、例外を出さずにマーカー0件になる。
// 静かに壊れる経路なので固定する。
const kml = fs.readFileSync(
  path.join(process.cwd(), 'public/data/kml/2024-noto.kml'),
  'utf-8'
);

describe('MapHelper.parse で KML を読む', () => {
  const helper = new MapHelper();

  test('KML から1件以上のマーカーを取り出せる', () => {
    const [markers] = helper.parse('kml', kml, undefined);
    expect(Array.isArray(markers)).toBe(true);
    expect(markers.length).toBeGreaterThan(0);
  });

  test('各マーカーが座標とカテゴリを持つ', () => {
    const [markers] = helper.parse('kml', kml, undefined);
    markers.slice(0, 20).forEach((m) => {
      expect(m.category).toBeTruthy();
      expect(m.feature.geometry.type).toBe('Point');
      const [lng, lat] = m.feature.geometry.coordinates;
      expect(typeof lng).toBe('number');
      expect(typeof lat).toBe('number');
      // 能登半島のあたりに収まっていること
      expect(lng).toBeGreaterThan(135);
      expect(lng).toBeLessThan(140);
      expect(lat).toBeGreaterThan(35);
      expect(lat).toBeLessThan(40);
    });
  });
});
