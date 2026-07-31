import { mount } from '@vue/test-utils';
import PrintableMap from '~/components/PrintableMap.vue';

// PrintableMap のうち、地図ライブラリに依存しない部分を固定する。
// 表示範囲での絞り込みとカテゴリ分類は、印刷される POI 一覧の中身を決めているので、
// ここが壊れると紙の内容が変わる。地図の生成方法とは独立している。

jest.mock('ky', () => ({ default: { get: () => ({ text: async () => '' }) } }));

// vue-mapbox を撤去したので、このコンポーネントは自分で maplibre の Map を作る。
// この spec は地図に関心がないが、モックしないと jsdom で WebGL 初期化が失敗して
// 未処理のリジェクトになる（jest は落とさないが vitest は落とす）。
jest.mock('maplibre-gl', () => {
  const actual = jest.requireActual('maplibre-gl');
  // maplibre-gl 1.x は UMD なので実体が default の下に来ることがある
  const base = actual.default ?? actual;
  // eslint-disable-next-line global-require
  const m = require('../mocks/maplibreMock');
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

const MAP_STUBS = {
  'client-only': { template: '<div><slot /></div>' },
  simplebar: { template: '<div><slot /></div>' },
};

const mapConfig = () => ({
  map_id: 'test',
  map_title: 'テスト',
  center: [130.7, 32.6],
  default_hash: '32.7,130.6-32.5,130.8',
  type: 'geojson',
  sources: [],
  layer_settings: {
    給水: { name: '給水所', color: '#285797', bg_color: '#A3BBDA' },
    避難所: { name: '避難所', color: '#276445', bg_color: '#A4C1B0' },
  },
});

const translate = (key) => (key === 'category.給水所' ? '給水ポイント' : key);

const marker = (lng, lat, name, category = '給水') => ({
  category,
  feature: {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { name, 'name:en': name + ' (en)' },
  },
});

// 熊本県宇城市付近を囲む矩形（inBounds は差の積の符号で判定する）
const bounds = {
  getNorthEast: () => ({ lng: 130.8, lat: 32.7 }),
  getSouthWest: () => ({ lng: 130.6, lat: 32.5 }),
  getNorthWest: () => ({ lng: 130.6, lat: 32.7 }),
  getSouthEast: () => ({ lng: 130.8, lat: 32.5 }),
};

const LAYERS = [
  {
    source: { id: 'a', title: '水', type: 'geojson', show: true, url: 'http://example.test/a' },
    markers: [
      marker(130.7, 32.6, '氷川町役場'),
      marker(130.68, 32.55, '宮原振興局'),
      marker(131.9, 33.9, '範囲外の地点'),
    ],
  },
  {
    source: { id: 'b', title: '避難', type: 'geojson', show: true, url: 'http://example.test/b' },
    markers: [marker(130.72, 32.58, '竜北中学校', '避難所')],
  },
];

const factory = async (data = {}) => {
  const wrapper = mount(PrintableMap, {
    propsData: { mapConfig: mapConfig() },
    stubs: MAP_STUBS,
    mocks: { $i18n: { locale: 'ja', t: (key) => key }, $t: (key) => key },
  });
  await wrapper.setData({ layers: LAYERS, checkedArea: ['水', '避難'], ...data });
  await wrapper.vm.$nextTick();
  return wrapper;
};

describe('PrintableMap の表示対象の絞り込み', () => {
  // 地図が出来ると load() が bounds を入れるので、明示的に null に戻して確認する
  test('bounds が無いときは全てのマーカーを対象にする', async () => {
    const wrapper = await factory();
    await wrapper.setData({ bounds: null });
    expect(wrapper.vm.inBoundsMarkers).toHaveLength(4);
  });

  test('bounds の外にあるマーカーを除外する', async () => {
    const wrapper = await factory({ bounds });
    const names = wrapper.vm.inBoundsMarkers.map((m) => m.feature.properties.name);
    expect(names).toEqual(['氷川町役場', '宮原振興局', '竜北中学校']);
  });

  test('チェックの外れたエリアのマーカーを除外する', async () => {
    const wrapper = await factory({ bounds, checkedArea: ['水'] });
    const names = wrapper.vm.inBoundsMarkers.map((m) => m.feature.properties.name);
    expect(names).toEqual(['氷川町役場', '宮原振興局']);
  });

  test('source.show が false のレイヤーを除外する', async () => {
    const layers = [{ ...LAYERS[0], source: { ...LAYERS[0].source, show: false } }, LAYERS[1]];
    const wrapper = await factory({ bounds, layers });
    const names = wrapper.vm.inBoundsMarkers.map((m) => m.feature.properties.name);
    expect(names).toEqual(['竜北中学校']);
  });
});

describe('PrintableMap のカテゴリ分類', () => {
  test('表示対象をカテゴリごとにまとめる', async () => {
    const wrapper = await factory({ bounds });
    const groups = wrapper.vm.displayMarkersGroupByCategory;
    expect(groups.map((g) => g.category)).toEqual(['給水', '避難所']);
    expect(groups[0].markers).toHaveLength(2);
    expect(groups[1].markers).toHaveLength(1);
  });

  // getMarkerCategoryText は category.<名前> の翻訳があればそれを使い、
  // 無ければカテゴリ名をそのまま返す。両方の分岐を確認する。
  test('翻訳があれば翻訳を、無ければカテゴリ名をそのまま返す', async () => {
    const wrapper = mount(PrintableMap, {
      propsData: { mapConfig: mapConfig() },
      stubs: MAP_STUBS,
      mocks: {
        // 実装が $i18n.t / $t のどちらを使っても同じ結果になるよう両方に入れる。
        // category.給水所 だけ翻訳がある状態を作る。
        $i18n: { locale: 'ja', t: translate },
        $t: translate,
      },
    });
    expect(wrapper.vm.getMarkerCategoryText('給水所', 'ja')).toBe('給水ポイント');
    expect(wrapper.vm.getMarkerCategoryText('翻訳のないカテゴリ', 'ja')).toBe('翻訳のないカテゴリ');
    // undefined は '未分類' として扱われる
    expect(wrapper.vm.getMarkerCategoryText(undefined, 'ja')).toBe('未分類');
  });

  test('ロケール別の名前があればそれを優先する', async () => {
    const wrapper = await factory();
    const props = { name: '氷川町役場', 'name:en': 'Hikawa Town Hall' };
    expect(wrapper.vm.getMarkerNameText(props, 'ja')).toBe('氷川町役場');
    expect(wrapper.vm.getMarkerNameText(props, 'en')).toBe('Hikawa Town Hall');
    expect(wrapper.vm.getMarkerNameText({ name: '名前だけ' }, 'en')).toBe('名前だけ');
  });
});

describe('PrintableMap の印刷される一覧', () => {
  test('カテゴリごとの節と件数が描画される', async () => {
    const wrapper = await factory({ bounds });
    const sections = wrapper.findAll('.list-section');
    expect(sections).toHaveLength(2);
    expect(wrapper.findAll('.list-items li')).toHaveLength(3);
  });

  test('表示対象が無いときは「該当なし」を出す', async () => {
    const wrapper = await factory({ bounds, checkedArea: [] });
    expect(wrapper.vm.inBoundsMarkers).toHaveLength(0);
    expect(wrapper.find('.list-section-none').exists()).toBe(true);
  });
});
