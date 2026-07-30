import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import Modal from '~/components/Modal.vue';
import ja from '~/locales/ja.json';
import en from '~/locales/en.json';
import ko from '~/locales/ko.json';

// 「このサイトについて」の本文は about.desc の中に {githubRepo} という差し込み位置を持つ。
// リンクを本文の途中に置くため、翻訳文を単純な補間ではなくスロット付きで描画している。
// これが解決できないと本文が丸ごと消えるが、例外は出ないので気づけない。
// 実際に vue-i18n を入れて、翻訳文とリンクの両方が出ることを固定する。

const mountModal = (locale) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    messages: { ja, en, ko },
  });
  return mount(Modal, {
    props: { isOpen: true },
    global: { plugins: [i18n] },
  });
};

describe('Modal の「このサイトについて」', () => {
  test('ja で翻訳された本文が描画される', () => {
    const text = mountModal('ja').text();
    expect(text).toContain('このサイトのソースコードはオープンに公開しております');
    expect(text).toContain('大歓迎です');
  });

  test('en で翻訳された本文が描画される', () => {
    const text = mountModal('en').text();
    expect(text).toContain('This site is open source');
  });

  test('本文の中に Github リポジトリへのリンクが入る', () => {
    const wrapper = mountModal('ja');
    const link = wrapper.find('a[href="https://github.com/codeforjapan/mapprint"]');
    expect(link.exists()).toBe(true);
    // createI18n は渡した messages を in-place でコンパイル済み AST に置き換えるため、
    // ja.about.github_repository を参照しても文字列ではなくなっている。期待値は直接書く。
    expect(link.text()).toBe('Code for Japan の Github リポジトリ');
  });

  // 翻訳が揃っていないロケールは英語の固定文にフォールバックする。
  // ここが空になると、日本語圏以外の利用者に説明が何も出なくなる。
  test('翻訳のないロケールでは英語の固定文が出る', () => {
    const text = mountModal('zh').text();
    expect(text).toContain('This site is open source');
  });

  test('閉じるボタンを押すと closeModal を emit する', async () => {
    const wrapper = mountModal('ja');
    await wrapper.find('.modal-close').trigger('click');
    expect(wrapper.emitted('closeModal')).toHaveLength(1);
  });
});
