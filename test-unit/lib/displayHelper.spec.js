import { getNowYMD } from '~/lib/displayHelper';

describe('getNowYMD', () => {
  test('returns the formatted date in Japanese by default', () => {
    const mockDate = new Date('2022-01-05T12:34:56');
    const result = getNowYMD(mockDate, 'ja');
    expect(result).toBe('2022年01月05日12時34分');
  });

  test('returns the formatted date in English when locale is set to "en"', () => {
    const mockDate = new Date('2022-01-05T12:34:56');
    const result = getNowYMD(mockDate, 'en');
    const expected = mockDate.toLocaleString('en-US');
    expect(result).toBe(expected);
  });
});