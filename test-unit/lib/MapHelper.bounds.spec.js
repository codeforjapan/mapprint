import MapLibre from 'maplibre-gl';
import MapHelper from '~/lib/MapHelper';

// vue-mapbox を撤去して maplibre-gl を直接使う変更のための回帰テスト。
// PrintableMap は地図の移動ごとに bounds を取り直し、URL ハッシュと
// マーカーの絞り込みに使う。この3つの挙動は実装を入れ替えても変わってはいけない。

const helper = new MapHelper();

// 熊本県宇城市付近（震度7の観測点）を囲む矩形
const NW = { lat: 32.7, lng: 130.6 };
const SE = { lat: 32.5, lng: 130.8 };
const bounds = new MapLibre.LngLatBounds(
  new MapLibre.LngLat(NW.lng, SE.lat), // south west
  new MapLibre.LngLat(SE.lng, NW.lat)  // north east
);

describe('MapHelper bounds のシリアライズ', () => {
  test('serializeBounds は "北西lat,lng-南東lat,lng" を返す', () => {
    expect(helper.serializeBounds(bounds)).toBe('32.7,130.6-32.5,130.8');
  });

  // 注意: serializeBounds は「北西 → 南東」の順で書き出すが、deserializeBounds は
  // new LngLatBounds([a, b]) に渡すため maplibre 側が「[南西, 北東]」として解釈する。
  // その結果、経度は正しく復元されるが緯度は _sw / _ne が入れ替わる。
  // 復元後の bounds の用途は fitBounds（2隅を囲むだけ）と inBounds（差の積の符号で
  // 判定）に限られ、どちらも角の順序に依存しないため実害が出ていない。
  // 実装を入れ替えるときはこの非対称性を「直さない」こと。直すと URL ハッシュの
  // 互換性が変わる。
  const extentOf = (b) => {
    const lats = [b.getNorthEast().lat, b.getSouthWest().lat];
    const lngs = [b.getNorthEast().lng, b.getSouthWest().lng];
    return {
      latMin: Math.min(...lats), latMax: Math.max(...lats),
      lngMin: Math.min(...lngs), lngMax: Math.max(...lngs),
    };
  };

  test('deserializeBounds は serializeBounds の出力と同じ範囲を復元する', () => {
    const e = extentOf(helper.deserializeBounds(helper.serializeBounds(bounds)));
    expect(e.latMin).toBeCloseTo(SE.lat, 6);
    expect(e.latMax).toBeCloseTo(NW.lat, 6);
    expect(e.lngMin).toBeCloseTo(NW.lng, 6);
    expect(e.lngMax).toBeCloseTo(SE.lng, 6);
  });

  test('deserializeBounds は設定ファイルの default_hash を解釈できる', () => {
    // assets/config/2024-noto-earthquake.json の default_hash と同じ形式
    const hash = '37.47529547606749,136.86173646804122-37.23376666876564,137.36853736803096';
    const e = extentOf(helper.deserializeBounds(hash));
    expect(e.latMin).toBeCloseTo(37.23376666876564, 6);
    expect(e.latMax).toBeCloseTo(37.47529547606749, 6);
    expect(e.lngMin).toBeCloseTo(136.86173646804122, 6);
    expect(e.lngMax).toBeCloseTo(137.36853736803096, 6);
  });

  test('deserializeBounds は不正な文字列に対して undefined を返す', () => {
    expect(helper.deserializeBounds('')).toBeUndefined();
    expect(helper.deserializeBounds('not-a-bounds')).toBeUndefined();
  });
});

describe('MapHelper.inBounds によるマーカーの絞り込み', () => {
  test.each([
    ['矩形の内側', [130.7, 32.6], true],
    ['経度が西に外れる', [130.5, 32.6], false],
    ['経度が東に外れる', [130.9, 32.6], false],
    ['緯度が北に外れる', [130.7, 32.8], false],
    ['緯度が南に外れる', [130.7, 32.4], false],
  ])('%s → %p', (_label, point, expected) => {
    expect(helper.inBounds(point, bounds)).toBe(expected);
  });

  test('境界線上の点は内側と判定されない（現在の実装の挙動）', () => {
    expect(helper.inBounds([NW.lng, NW.lat], bounds)).toBe(false);
  });
});
