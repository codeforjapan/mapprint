import { vi } from 'vitest';
import { mount } from '@vue/test-utils';

// ky は ESM で配布されており node_modules は変換対象外のため require できない。
// このテストでは sources を空にして通信を起こさないので、存在するだけでよい。
vi.mock('ky', () => ({ default: { get: () => ({ text: async () => '' }) } }));

// maplibre-gl は WebGL を要求するので Map / Marker / Popup / 各 Control を差し替える。
// LngLat と LngLatBounds は MapHelper が bounds 計算に使うため本物を残す。
// vi.mock のファクトリは巻き上げられるため、モックは別モジュールから await import する。
vi.mock('maplibre-gl', async () => {
  const actual = await vi.importActual('maplibre-gl');
  // maplibre-gl 1.x は UMD なので、実体は default の下に来ることがある。
  // 素通しに失敗すると LngLatBounds が消えて deserializeBounds が黙って undefined を返す。
  const base = actual.default ?? actual;
  const m = await import('../mocks/maplibreMock');
  const mocked = {
    ...base,
    Map: m.MockMap,
    Marker: m.MockMarker,
    Popup: m.MockPopup,
    NavigationControl: m.MockNavigationControl,
    GeolocateControl: m.MockGeolocateControl,
  };
  // PrintableMap は `import MapLibre from` で default を、
  // MapHelper は `import * as MapLibre` で名前空間を見るため両方を満たす形にする。
  return { ...mocked, default: mocked };
});

import { mapInstances, markerInstances, resetInstances } from '../mocks/maplibreMock';

import PrintableMap from '~/components/PrintableMap.vue';

const MAP_STYLE = 'https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json';
const DEFAULT_HASH = '32.7,130.6-32.5,130.8';

const mapConfig = () => ({
  map_id: 'test',
  map_title: 'テスト',
  center: [130.7, 32.6],
  default_hash: DEFAULT_HASH,
  type: 'geojson',
  sources: [], // 空にして mounted 内の fetch を起こさない
  layer_settings: {
    給水: { name: '給水', color: '#285797', bg_color: '#A3BBDA', icon_class: 'fa-solid fa-droplet' },
  },
});

const marker = (lng, lat, name) => ({
  category: '給水',
  feature: {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { name },
  },
});

const LAYER = {
  source: { id: 'test', title: 'テスト', type: 'geojson', show: true, url: 'http://example.test/a.geojson' },
  markers: [marker(130.7, 32.6, '氷川町役場'), marker(130.68, 32.55, '宮原振興局')],
};

const factory = async (overrides = {}) => {
  const wrapper = mount(PrintableMap, {
    props: { mapConfig: mapConfig() },
    global: {
      stubs: {
        'client-only': { template: '<div><slot /></div>' },
        simplebar: { template: '<div><slot /></div>' },
      },
      mocks: { $i18n: { locale: 'ja', t: (key) => key }, $t: (key) => key },
    },
    ...overrides,
  });
  // layers が空だと地図コンテナが描画されない（template の v-if='layers.length'）。
  // 本来は mounted 内の非同期取得で埋まるので、テストでは直接与える。
  await wrapper.setData({ layers: [LAYER], checkedArea: ['テスト'] });
  await wrapper.vm.$nextTick();
  return wrapper;
};

beforeEach(() => {
  resetInstances();
  window.location.hash = '';
});

describe('PrintableMap の地図生成', () => {
  test('layers が入ると maplibre の Map が1つ生成される', async () => {
    await factory();
    expect(mapInstances).toHaveLength(1);
  });

  test('preserveDrawingBuffer: true が渡る（印刷で canvas を読み戻すため必須）', async () => {
    await factory();
    expect(mapInstances[0].options.preserveDrawingBuffer).toBe(true);
  });

  test('style / center / zoom が渡る', async () => {
    await factory();
    const { style, center, zoom } = mapInstances[0].options;
    expect(style).toBe(MAP_STYLE);
    expect(center).toEqual([130.7, 32.6]);
    expect(zoom).toBe(15);
  });

  test('container に地図用の要素が渡る', async () => {
    await factory();
    expect(mapInstances[0].options.container).toBeTruthy();
  });

  test('NavigationControl と GeolocateControl が追加される', async () => {
    await factory();
    const kinds = mapInstances[0].controls.map((c) => c.constructor.name);
    expect(kinds).toContain('MockNavigationControl');
    expect(kinds).toContain('MockGeolocateControl');
  });
});

describe('PrintableMap の表示範囲', () => {
  test('URL ハッシュが無いときは default_hash で fitBounds する', async () => {
    await factory();
    expect(mapInstances[0].fitBoundsCalls).toHaveLength(1);
    const b = mapInstances[0].fitBoundsCalls[0].bounds;
    const lats = [b.getNorthEast().lat, b.getSouthWest().lat];
    expect(Math.min(...lats)).toBeCloseTo(32.5, 6);
    expect(Math.max(...lats)).toBeCloseTo(32.7, 6);
  });

  test('URL ハッシュがあればそちらを優先して fitBounds する', async () => {
    window.location.hash = '#33.1,131.1-33.0,131.2';
    await factory();
    const b = mapInstances[0].fitBoundsCalls[0].bounds;
    const lngs = [b.getNorthEast().lng, b.getSouthWest().lng];
    expect(Math.min(...lngs)).toBeCloseTo(131.1, 6);
    expect(Math.max(...lngs)).toBeCloseTo(131.2, 6);
  });

  test('moveend で bounds-changed を emit する', async () => {
    const wrapper = await factory();
    expect(mapInstances[0].handlers.moveend).toBeDefined();
    mapInstances[0].fire('moveend');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('bounds-changed')).toBeTruthy();
  });
});

describe('PrintableMap のマーカー', () => {
  test('表示対象のマーカーごとに Marker が生成され地図に追加される', async () => {
    await factory();
    const added = markerInstances.filter((m) => m.addedTo);
    expect(added).toHaveLength(LAYER.markers.length);
    expect(added[0].lngLat).toEqual([130.7, 32.6]);
  });

  test('マーカーには Popup が設定される', async () => {
    await factory();
    const withPopup = markerInstances.filter((m) => m.popup);
    expect(withPopup).toHaveLength(LAYER.markers.length);
  });

  test('表示対象から外れたマーカーは地図から取り除かれる', async () => {
    const wrapper = await factory();
    const before = markerInstances.filter((m) => m.addedTo).length;
    // 1件だけになるよう絞る
    await wrapper.setData({ layers: [{ ...LAYER, markers: [LAYER.markers[0]] }] });
    await wrapper.vm.$nextTick();
    const removed = markerInstances.filter((m) => m.removed).length;
    expect(before).toBe(2);
    expect(removed).toBeGreaterThanOrEqual(1);
  });
});

describe('PrintableMap の破棄', () => {
  test('コンポーネント破棄時に map.remove() される', async () => {
    const wrapper = await factory();
    wrapper.unmount();
    expect(mapInstances[0].removed).toBe(true);
  });
});
