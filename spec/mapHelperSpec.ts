import mapHelper = require('../source/javascripts/mapHelper');

const SITE_URL = 'codeforjapan.github.io';
const MIERUNE_KEY = 'KNmswjVYR187ACBqbsZc5fEIBM_DC2TXwMST0tVMe4AiYCt274X0VqAy5pf-ebvl8CtjAtBx15r1YyAiXURC';

describe('tileServerAttribution', () => {
  it('returns openstreetmap license for testing environment', function() {
    expect(mapHelper.tileServerAttribution('localhost:4567')).toBe('Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>');
  });
  it('returns MIERUNE license for production environment', function() {
    expect(mapHelper.tileServerAttribution(SITE_URL)).toBe("Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL.");
  });
});

describe('tileServerUrl', () => {
  it ('returns openstreetmap tile url', function () {
    expect(mapHelper.tileServerUrl('localhost:4567', 'color')).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
  it ('returns MIERUNE tile url(bright)', function () {
    const styleCode = 'bright';
    expect(mapHelper.tileServerUrl(SITE_URL, 'color')).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
  it ('returns MIERUNE tile url(mono)', function () {
    const styleCode = 'gray';
    expect(mapHelper.tileServerUrl(SITE_URL, 'mono')).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
  it ('returns MIERUNE tile url(other)', function () {
    const styleCode = 'normal';
    expect(mapHelper.tileServerUrl(SITE_URL, 'other')).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
})

