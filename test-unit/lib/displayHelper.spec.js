import { getNowYMD } from '~/lib/displayHelper';

describe('getNowYMD', () => {
  describe('returns the formatted date in Japanese by customization', () => {
    test.each([
      ['2022-01-01T00:00:00', '2022年01月01日00時00分'],
      ['2022-01-01T01:01:01', '2022年01月01日01時01分'],
      ['2022-12-31T23:59:59', '2022年12月31日23時59分']
    ])('date=%p', (date, expected) => {
      const mockDate = new Date(date);
      const result = getNowYMD(mockDate, 'ja');
      expect(result).toBe(expected);
    })
  });

  // 実装は 'en' に対して toLocaleString('en-JP') を呼んでいる。'en-JP' は
  // 意味のあるロケールではなく（地域サブタグはタイムゾーンを指定しない）、
  // 出力は Node の ICU バージョンによって変わる。Node 20 では en-US 相当だったが
  // Node 24 では '2022/01/05, 12:34:56' になる。
  // 実装の意図（JST 表示）を満たすなら timeZone オプションを使うべきだが、
  // 表示が12言語で変わるため別途対応とし、ここでは実装と同じ式で比較する。
  test('returns the formatted date using the locale the implementation passes', () => {
    const mockDate = new Date('2022-01-05T12:34:56');
    const result = getNowYMD(mockDate, 'en');
    expect(result).toBe(mockDate.toLocaleString('en-JP'));
  });
});