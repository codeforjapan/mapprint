import fs from 'node:fs';
import path from 'node:path';

// gridlex は $gl-mq-list を書いた順にメディアクエリを出力する。
// $gl-mq-width が min-width なので、昇順でなければ広い画面で狭い方の指定が後勝ちしてしまう。
// 降順だと col-12_xs-6_lg-4 が PC で 3 列ではなく 2 列になる。
// Nuxt 2 のビルドはメディアクエリを昇順にまとめ直していたため症状が出ず、
// Vite ではソース順のまま出るので露見した。ビルドツールに依存しないよう順序を固定する。

const files = [
  'assets/sass/_variables.scss',
  'assets/sass/vendor/gridlex/_gridlex-vars.scss',
];

const read = (f: string) => fs.readFileSync(path.resolve(process.cwd(), f), 'utf8');

const parseList = (src: string) => {
  const body = /\$gl-mq-list:\s*\(([^)]*)\)/.exec(src)?.[1];
  if (!body) throw new Error('$gl-mq-list が見つからない');
  return [...body.matchAll(/([a-z]+)\s*:\s*([\d.]+)em/g)].map(([, name, em]) => ({
    name,
    em: Number(em),
  }));
};

describe('gridlex のブレークポイント', () => {
  test.each(files)('%s の $gl-mq-width は min-width である', (f) => {
    expect(/\$gl-mq-width:\s*'min-width'/.test(read(f))).toBe(true);
  });

  test.each(files)('%s の $gl-mq-list は昇順である', (f) => {
    const list = parseList(read(f));
    expect(list.length).toBeGreaterThan(1);
    expect(list.map((b) => b.em)).toEqual([...list.map((b) => b.em)].sort((a, b) => a - b));
  });

  test('2つのファイルで同じブレークポイントを定義している', () => {
    const [a, b] = files.map((f) => parseList(read(f)));
    expect(a).toEqual(b);
  });
});
