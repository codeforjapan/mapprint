import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrintableMap from '~/components/PrintableMap.vue';
import { markerInstances, resetInstances } from '../mocks/maplibreMock';

// 地図に渡すマーカーと吹き出しの DOM は Vue が描画したものを複製している。
// その取り出しを添字（$refs.markerEls[index]）で行うと、Vue 3 では
// v-for の template ref の配列順序が保証されないため、表示範囲が変わって
// DOM が再利用されたときに別の地点の吹き出しが付く。
// 紙も画面も「この番号はこの場所」が崩れるので、対応そのものを固定する。

// 空文字を返すと JSON.parse が投げて未処理のリジェクトになる。空の FeatureCollection にする
vi.mock('ky', () => ({
  default: {
    get: () => ({ text: async () => '{"type":"FeatureCollection","features":[]}' }),
  },
}));

vi.mock('maplibre-gl', async () => {
  const actual = await vi.importActual('maplibre-gl');
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
  return { ...mocked, default: mocked };
});

const marker = (lng, lat, name) => ({
  category: '給水',
  feature: {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { name },
  },
});

const A = marker(130.71, 32.61, 'あさひ公園');
const B = marker(130.72, 32.62, 'いずみ小学校');
const C = marker(130.73, 32.63, 'うめのき体育館');

const mapConfig = () => ({
  map_id: 'test',
  map_title: 'テスト',
  center: [130.72, 32.62],
  default_hash: '32.7,130.6-32.5,130.8',
  type: 'geojson',
  // layers は setData で直接注入する。sources に書くと mounted() の取得が
  // 同じ位置を上書きして、注入したデータと取得結果が競合する（markers.spec と同じ流儀）
  sources: [],
  layer_settings: { 給水: { name: '給水所', color: '#285797', bg_color: '#A3BBDA' } },
});

const layersOf = (markers) => [
  { source: { id: 'a', title: '水', type: 'geojson', show: true, url: 'http://test/a' }, markers },
];

const factory = async (markers) => {
  const wrapper = mount(PrintableMap, {
    props: { mapConfig: mapConfig() },
    global: {
      stubs: {
        'client-only': { template: '<div><slot /></div>' },
        simplebar: { template: '<div><slot /></div>' },
      },
      mocks: { $i18n: { locale: 'ja', t: (k) => k }, $t: (k) => k },
    },
  });
  await wrapper.setData({ layers: layersOf(markers), checkedArea: ['水'], bounds: null });
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
};

// 地図に渡された「マーカー要素の番号」と「吹き出しの地点名」の対応を取り出す
const pairs = () =>
  markerInstances
    .filter((m) => !m.removed)
    .map((m) => ({
      number: (m.options.element.textContent.match(/\d+/) || [''])[0],
      popupName: (m.popup?.dom?.textContent || '').replace(/\s+/g, ' ').trim(),
    }));

describe('マーカーと吹き出しの対応', () => {
  beforeEach(() => resetInstances());

  test('表示範囲が変わって途中に地点が増えても対応が崩れない', async () => {
    // A と C だけが範囲内。ここで 2 件が cache に入る
    const wrapper = await factory([A, C]);
    await wrapper.vm.$nextTick();
    expect(pairs()).toHaveLength(2);

    // A と C のあいだに B が入る。A と C は cache に残るので DOM が再利用される
    await wrapper.setData({ layers: layersOf([A, B, C]) });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const got = pairs();
    expect(got).toHaveLength(3);
    // 番号 n のマーカーには n 番目の地点の名前が付いていなければならない
    const names = ['あさひ公園', 'いずみ小学校', 'うめのき体育館'];
    got.forEach((p) => {
      const expected = names[Number(p.number) - 1];
      expect(p.popupName).toContain(expected);
    });
  });

  test('地点が減っても残ったマーカーの対応が崩れない', async () => {
    const wrapper = await factory([A, B, C]);
    await wrapper.vm.$nextTick();
    expect(pairs()).toHaveLength(3);

    // 先頭が範囲外になる
    await wrapper.setData({ layers: layersOf([B, C]) });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const got = pairs();
    expect(got).toHaveLength(2);
    const names = ['いずみ小学校', 'うめのき体育館'];
    got.forEach((p) => {
      const expected = names[Number(p.number) - 1];
      expect(p.popupName).toContain(expected);
    });
  });
});
