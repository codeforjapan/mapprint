import { getMapConfig } from '~/lib/mapConfigs';
import list from '~/assets/config/list.json';

// Nuxt 2 の require('~/assets/config/' + name) を import.meta.glob に置き換えたため、
// glob のパスが合っているかを固定する。ここが壊れると地図ページが 500 になる。
describe('getMapConfig', () => {
  test('list.json に載っている全ての災害設定を拡張子ありで引ける', () => {
    list.forEach((name) => {
      const config = getMapConfig(name);
      expect(config, name).toBeDefined();
      expect(config.map_id).toBeTruthy();
    });
  });

  test('拡張子なしの名前でも引ける（ルートパラメータはこの形）', () => {
    list.forEach((name) => {
      const id = name.replace('.json', '');
      expect(getMapConfig(id), id).toBeDefined();
    });
  });

  test('list.json の名前と設定内の map_id が一致する', () => {
    list.forEach((name) => {
      const id = name.replace('.json', '');
      expect(getMapConfig(id).map_id).toBe(id);
    });
  });

  test('存在しない名前には undefined を返す', () => {
    expect(getMapConfig('no-such-disaster')).toBeUndefined();
  });
});
