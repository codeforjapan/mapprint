import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrintableMap from '~/components/PrintableMap.vue';

// 印刷される一覧の番号は layers を順に辿って振られる。
// layers が取得の完了順に並ぶと、同じ地点に開くたび違う番号が付き、
// 刷り直した紙どうしが食い違う。ここでは完了順をわざと逆にして、
// それでも layers が mapConfig.sources の順序になることを固定する。
vi.mock('ky', () => {
  const ticks = (count) => {
    let promise = Promise.resolve();
    for (let i = 0; i < count; i += 1) {
      promise = promise.then();
    }
    return promise;
  };
  const geojson = (name) =>
    JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name, category: '給水' },
          geometry: { type: 'Point', coordinates: [130.7, 32.6] },
        },
      ],
    });
  const empty = JSON.stringify({ type: 'FeatureCollection', features: [] });
  return {
    default: {
      get: (url) => ({
        text: async () => {
          const slow = url.indexOf('slow') >= 0;
          // 先に書いてあるソースをあとから返す
          await ticks(slow ? 8 : 1);
          global.__kyCompletionOrder.push(slow ? 'slow' : 'fast');
          if (url.indexOf('empty') >= 0) {
            return empty;
          }
          return geojson(slow ? '遅い方の地点' : '速い方の地点');
        },
      }),
    },
  };
});

// この spec は地図に関心がないが、layers が埋まると initMap が走るので、
// モックしないと jsdom で WebGL 初期化が失敗して未処理のリジェクトになる。
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

const MAP_STUBS = {
  'client-only': { template: '<div><slot /></div>' },
  simplebar: { template: '<div><slot /></div>' },
};

const source = (id, title, show = true) => ({
  id,
  title,
  type: 'geojson',
  show,
  url: 'http://example.test/' + id,
});

const mapConfig = (sources) => ({
  map_id: 'test',
  map_title: 'テスト',
  center: [130.7, 32.6],
  default_hash: '32.7,130.6-32.5,130.8',
  type: 'geojson',
  sources,
  layer_settings: {
    給水: { name: '給水所', color: '#285797', bg_color: '#A3BBDA' },
  },
});

const flush = async (count) => {
  for (let i = 0; i < count; i += 1) {
    await Promise.resolve();
  }
};

const factory = (sources) =>
  mount(PrintableMap, {
    props: { mapConfig: mapConfig(sources) },
    global: {
      stubs: MAP_STUBS,
      mocks: { $i18n: { locale: 'ja', t: (key) => key }, $t: (key) => key },
    },
  });

beforeEach(() => {
  global.__kyCompletionOrder = [];
});

describe('PrintableMap のレイヤーの並び順', () => {
  test('取得が逆順に終わっても layers は sources の順序になる', async () => {
    const wrapper = factory([source('slow', '遅いソース'), source('fast', '速いソース')]);
    await flush(40);

    // 前提として、完了順は逆になっている
    expect(global.__kyCompletionOrder).toEqual(['fast', 'slow']);

    expect(wrapper.vm.layers.map((layer) => layer.source.id)).toEqual(['slow', 'fast']);
    expect(wrapper.vm.layers.map((layer) => layer.markers.length)).toEqual([1, 1]);
  });

  test('一覧の番号が sources の順序で振られる', async () => {
    const wrapper = factory([source('slow', '遅いソース'), source('fast', '速いソース')]);
    await flush(40);
    // 地図が出来ると load() が bounds を入れるので、明示的に null に戻して確認する
    await wrapper.setData({ bounds: null });

    const names = wrapper.vm.inBoundsMarkers.map((marker) => marker.feature.properties.name);
    expect(names).toEqual(['遅い方の地点', '速い方の地点']);
  });

  test('先に取れたソースを待たせない', async () => {
    const wrapper = factory([source('slow', '遅いソース'), source('fast', '速いソース')]);
    await flush(6);

    // 速い方だけが入っていて、遅い方の位置は空のまま確保されている
    expect(global.__kyCompletionOrder).toEqual(['fast']);
    expect(wrapper.vm.layers.map((layer) => layer.source.id)).toEqual(['slow', 'fast']);
    expect(wrapper.vm.layers.map((layer) => layer.markers.length)).toEqual([0, 1]);
  });

  // checkedArea は修正前から sources の順序だった（push が最初の await より前に
  // 走るため）。ここは不具合の再現ではなく、構築の位置を mounted の頭へ移した
  // 整理で中身が変わっていないことを固定するためのもの。
  test('チェック済みエリアも sources の順序で、show が false のものは入らない', async () => {
    const wrapper = factory([
      source('slow', '遅いソース'),
      source('hidden', '出さないソース', false),
      source('fast', '速いソース'),
    ]);
    await flush(40);

    expect(wrapper.vm.checkedArea).toEqual(['遅いソース', '速いソース']);
  });
});

// 位置の確保で layers.length が最初から真になるため、素通しだと読み込み中に
// 「この地図には該当する地点がありません」が出てしまう（レビュー指摘）。
// 空表示は全ソースの取得が終わるまで出さないことを固定する。
describe('PrintableMap の読み込み中の空表示', () => {
  test('読み込み中は「該当する地点がありません」を出さない', async () => {
    const wrapper = factory([source('slow', '遅いソース'), source('fast', '速いソース')]);
    await wrapper.vm.$nextTick();

    // layers は位置確保で埋まっているが、遅いソースの取得は終わっていない
    expect(wrapper.vm.layers).toHaveLength(2);
    expect(wrapper.vm.allSourcesLoaded).toBe(false);
    expect(wrapper.find('.list-section-none').exists()).toBe(false);

    await flush(40);
    await wrapper.vm.$nextTick();

    // 全部終わって地点があるので、空表示は出ないまま
    expect(wrapper.vm.allSourcesLoaded).toBe(true);
    expect(wrapper.find('.list-section-none').exists()).toBe(false);
  });

  test('全ソースの取得が終わって地点が無いときだけ出す', async () => {
    const wrapper = factory([source('empty-a', '空ソースA'), source('empty-slow', '空ソースB')]);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.list-section-none').exists()).toBe(false);

    await flush(40);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.allSourcesLoaded).toBe(true);
    expect(wrapper.find('.list-section-none').exists()).toBe(true);
  });
});
