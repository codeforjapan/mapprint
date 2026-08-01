import { filterMarkers } from '~/lib/sourceFilter';

const marker = (properties) => ({
  feature: { type: 'Feature', properties, geometry: { type: 'Point', coordinates: [130.6, 32.5] } },
  category: properties.category || '未分類',
});

const markers = [
  marker({ name: '氷川町給水所', category: '給水', source: '八代市公式X', status: 'open' }),
  marker({ name: '春竹小学校', category: '避難所', source: '熊本県 防災情報くまもと', status: 'open' }),
  marker({ name: '閉鎖された銭湯', category: '入浴・シャワー', source: 'RKK熊本放送', status: 'closed' }),
  marker({ name: '市役所窓口', category: '行政手続き', source: '熊本市防災情報ポータル', status: 'open' }),
];

const names = (list) => list.map((m) => m.feature.properties.name);

describe('filterMarkers', () => {
  test('returns every marker when no filter is configured', () => {
    expect(filterMarkers(markers)).toHaveLength(4);
    expect(filterMarkers(markers, null)).toHaveLength(4);
  });

  test('drops the sources listed in exclude', () => {
    const filtered = filterMarkers(markers, {
      exclude: { source: ['熊本県 防災情報くまもと', '熊本市防災情報ポータル'] },
    });
    expect(names(filtered)).toEqual(['氷川町給水所', '閉鎖された銭湯']);
  });

  test('keeps only the values listed in include', () => {
    const filtered = filterMarkers(markers, { include: { status: ['open'] } });
    expect(names(filtered)).toEqual(['氷川町給水所', '春竹小学校', '市役所窓口']);
  });

  test('applies include and exclude together', () => {
    const filtered = filterMarkers(markers, {
      include: { status: ['open'] },
      exclude: { source: ['熊本県 防災情報くまもと', '熊本市防災情報ポータル'] },
    });
    expect(names(filtered)).toEqual(['氷川町給水所']);
  });

  test('drops markers that lack a required property', () => {
    const withoutSource = markers.concat(marker({ name: '出典不明', category: '給水' }));
    const filtered = filterMarkers(withoutSource, { require: ['source'] });
    expect(names(filtered)).not.toContain('出典不明');
    expect(filtered).toHaveLength(4);
  });

  test('treats an empty string as a missing value', () => {
    const blank = [marker({ name: '出典が空', category: '給水', source: '  ' })];
    expect(filterMarkers(blank, { require: ['source'] })).toHaveLength(0);
  });

  test('does not silently pass everything when the excluded property disappears', () => {
    // 提供元がフィールド名を変えた場合。exclude だけだと全件通ってしまう
    const renamed = [marker({ name: '出典キーが変わった', category: '給水', src: '熊本市防災情報ポータル' })];
    expect(filterMarkers(renamed, { exclude: { source: ['熊本市防災情報ポータル'] } })).toHaveLength(1);
    expect(
      filterMarkers(renamed, {
        require: ['source'],
        exclude: { source: ['熊本市防災情報ポータル'] },
      })
    ).toHaveLength(0);
  });

  test('matches values written with a different JSON type', () => {
    const mixed = [
      marker({ name: '公式', category: '給水', official: true }),
      marker({ name: '非公式', category: '給水', official: false }),
    ];
    expect(names(filterMarkers(mixed, { include: { official: ['true'] } }))).toEqual(['公式']);
    expect(names(filterMarkers(mixed, { include: { official: [true] } }))).toEqual(['公式']);
  });

  test('keeps markers without properties unless a positive condition is set', () => {
    const shapes = [{ geojsondata: {}, category: '通行可能道路' }];
    expect(filterMarkers(shapes, { exclude: { source: ['熊本市防災情報ポータル'] } })).toHaveLength(1);
    expect(filterMarkers(shapes, { require: ['source'] })).toHaveLength(0);
    expect(filterMarkers(shapes, { include: { status: ['open'] } })).toHaveLength(0);
  });

  test('drops values outside the include list even when they are new', () => {
    // 本番 config と同形。提供元が新しい status 値を足しても素通りしない
    const production = {
      require: ['reuse'],
      include: { reuse: ['open'], status: ['open', 'limited'] },
    };
    const data = [
      marker({ name: '営業中GS', category: 'ガソリンスタンド', reuse: 'open', status: 'open' }),
      marker({ name: '時間限定給水', category: '給水', reuse: 'open', status: 'limited' }),
      marker({ name: '状況不明GS', category: 'ガソリンスタンド', reuse: 'open', status: 'unknown' }),
      marker({ name: 'ポータル由来', category: '避難所', reuse: 'inquiry_required', status: 'open' }),
      marker({ name: 'reuse無し', category: '給水', status: 'open' }),
    ];
    expect(names(filterMarkers(data, production))).toEqual(['営業中GS', '時間限定給水']);
  });

  test('does not modify the given array', () => {
    const original = markers.slice();
    filterMarkers(markers, { include: { status: ['open'] } });
    expect(markers).toEqual(original);
  });
});
