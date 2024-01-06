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

  test('returns the formatted date in English when locale is set to "en"', () => {
    const mockDate = new Date('2022-01-05T12:34:56');
    const result = getNowYMD(mockDate, 'en');
    const expected = mockDate.toLocaleString('en-US');
    expect(result).toBe(expected);
  });
});