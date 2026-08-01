export type FilterValue = string | number | boolean;

/**
 * sources[] の一つに書ける絞り込みの指定。
 *
 * require: この名前のプロパティを持たない地物は載せない
 * include: プロパティごとに、載せる値を並べる（並べた値以外は載せない）
 * exclude: プロパティごとに、載せない値を並べる
 */
export interface SourceFilter {
  require?: string[];
  include?: { [property: string]: FilterValue[] };
  exclude?: { [property: string]: FilterValue[] };
}

/**
 * 読み込んだ地物のうち、紙に刷るものだけを残す。
 *
 * 紙マップは第三者が集約したデータを読むことがあり、その中には
 * そのまま載せたくないものが混ざる。提供元のデータベースをほぼ複製した
 * 出典や、すでに閉まっている施設がそれにあたる。データを作り直してもらう
 * かわりに、何を載せないかを地図の設定側で宣言できるようにする。
 *
 * 紙は配ったあとで訂正できないので、判断がつかないときは載せない側に倒す。
 * exclude だけを書くと、提供元がフィールド名を変えたときに一致しなくなって
 * 黙って全件が通ってしまうため、require でそのフィールドの存在自体を
 * 条件にできるようにしてある。
 */
export function filterMarkers(markers: any[], filter?: SourceFilter | null): any[] {
  if (!filter) {
    return markers;
  }
  const required = filter.require || [];
  const include = filter.include || {};
  const exclude = filter.exclude || {};

  return markers.filter((marker) => {
    const properties = propertiesOf(marker);
    if (properties === null) {
      // プロパティが読めない地物は、載せる条件を確かめようがない
      return required.length === 0 && Object.keys(include).length === 0;
    }
    if (!required.every((name) => hasValue(properties[name]))) {
      return false;
    }
    if (!Object.keys(include).every((name) => matches(properties[name], include[name]))) {
      return false;
    }
    return !Object.keys(exclude).some((name) => matches(properties[name], exclude[name]));
  });
}

function propertiesOf(marker: any): { [key: string]: any } | null {
  if (marker && marker.feature && marker.feature.properties) {
    return marker.feature.properties;
  }
  // KML の Point 以外はこちらの形で入ってくる
  if (marker && marker.geojsondata && marker.geojsondata.properties) {
    return marker.geojsondata.properties;
  }
  return null;
}

// 空文字は「値が無い」として扱う。CSV 由来のデータでは欠損が空文字で来る
function hasValue(value: any): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

// 設定は JSON で書くので、true と "true"、1 と "1" を取り違えても
// 書いたとおりに一致させる
function matches(value: any, candidates: FilterValue[]): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  return candidates.some((candidate) => String(candidate) === String(value));
}
