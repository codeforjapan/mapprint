/**
 * 災害ごとの地図設定（assets/config/*.json）へのアクセス。
 *
 * Nuxt 2 では `require('~/assets/config/' + name)` で動的に読み込んでいたが、
 * Vite では `require` が使えないため `import.meta.glob` で静的に集める。
 * 拡張子ありとなしの両方の名前で引けるようにして、呼び出し側の書き換えを最小にする。
 */
const modules = import.meta.glob('../assets/config/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>;

const byName: Record<string, any> = {};
for (const [path, config] of Object.entries(modules)) {
  const file = path.split('/').pop() as string;
  byName[file] = config;
  byName[file.replace(/\.json$/, '')] = config;
}

/** 'ファイル名.json' でも 'ファイル名' でも引ける */
export function getMapConfig(name: string): any {
  return byName[name];
}

export default getMapConfig;
