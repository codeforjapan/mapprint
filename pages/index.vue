<template lang="pug">
.layout-index
  #fb-root
  header
    h1.index-title
      nuxt-link(to='/')
        img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
  main.index-main
    ul.index-list.grid-center-equalHeight
      li.col-12_xs-6_lg-4(v-for='(map, index) in maps')
        .index-item
          .index-item-inner
            nuxt-link(:to="localePath('/map/' + map.map_id)", v-bind:key='index')
              .index-link-inner
                img(:src='"https://kamimap.com/images/" + (map.map_image ? map.map_image : "logo.png")' alt='')
                .index-item-title(v-if="locale === 'ja'")
                  span
                    | {{map.map_title}}
                .index-item-title(v-else)
                  span
                    | {{map.map_title_en}}
                  i.index-arrow-icon.fas.fa-long-arrow-alt-right
          .index-item-sns
            div
              div(class="fb-share-button" :data-href='"https://kamimap.com/map/" + map.map_id' data-layout="button" data-size="small")
                a(target="_blank" :href='"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkamimap.com%2Fmap%2F" + map.map_id + "%2F&amp;src=sdkpreparse"' class="fb-xfbml-parse-ignore") {{$t('common.share')}}
            div
              a(href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" :data-text='map.map_title + " - 地図情報を印刷できる「紙マップ」"' :data-url='"https://kamimap.com/map/" + map.map_id' data-show-count="false") Tweet
            div
              div(class="line-it-button" data-lang="ja" data-type="share-a" data-ver="3" :data-url='"https://kamimap.com/map/" + map.map_id' data-color="default" data-size="small" data-count="false" style="display: none;")
  footer.index-footer
    .sub-button(@click='isOpenExplain=!isOpenExplain')
      i.fas.fa-info-circle.fa-lg
      span
        | {{$t('common.about')}}
    .sub-button
      i.fab.fa-github.fa-lg
      a(href="https://github.com/codeforjapan/mapprint") {{$t('common.contribute')}}
  footer.index-footer
    .sub-button
      i.fas.fa-language.fa-lg
      select(onChange="location.href=value;")
        option.language(disabled selected)
          | Language: {{locales.filter((i) => { return i.code === locale })[0].name}}
        option(v-for="locale in locales" :value="switchLocalePath(locale.code)")
          | {{ locale.name }}
  modal(v-bind:isOpen='isOpenExplain' v-on:closeModal="closeModalMethod")
</template>

<script lang="ts">
import mapList from "~/assets/config/list.json";
import Modal from "~/components/Modal.vue";
import { getMapConfig } from "~/lib/mapConfigs";
import { getSiteMeta } from "~/lib/siteMeta";

const maps = mapList.map((name) => getMapConfig(name));

export default defineNuxtComponent({
  components: {
    Modal,
  },
  // @nuxtjs/i18n v9 以降 localePath は composable なので、
  // Options API のテンプレートから使えるよう setup で公開する
  // vue-i18n 9 以降 locale と locales は ref なので、
  // テンプレートやスクリプトから直接使えない。setup で unwrap して公開する。
  setup() {
    const { locale, t } = useI18n();

    // head() は defineNuxtComponent では setup 経由で処理され、その時点では
    // computed も setup の戻り値も this から参照できない。useHead に移す。
    // 移さないと this.locale が undefined になって常に default 分岐に落ち、
    // 日本語でもタイトルが "KamiMap" になってしまう。
    useHead(() => {
      const { siteName, siteDesc } = getSiteMeta(locale.value, t);
      return {
        title: siteName,
        meta: [
          { name: "description", content: siteDesc },
          { property: "og:site_name", content: siteName },
          { property: "og:title", content: siteName },
          { property: "og:description", content: siteDesc },
        ],
        script: [
          {
            src: "https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v4.0",
            async: true,
            defer: true,
            crossorigin: "anonymous",
          },
          { src: "https://platform.twitter.com/widgets.js", async: true },
          {
            src: "https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js",
            async: true,
            defer: true,
          },
        ],
      };
    });

    return { localePath: useLocalePath(), switchLocalePath: useSwitchLocalePath() };
  },
  computed: {
    // vue-i18n 9 以降 $i18n.locale は ref なのでテンプレートから直接使えない。
    // ref でも素の値でも動くように unwrap した computed を用意する。
    locale() {
      const l = this.$i18n.locale;
      return l && typeof l === "object" && "value" in l ? l.value : l;
    },
    locales() {
      const l = this.$i18n.locales;
      return l && typeof l === "object" && "value" in l ? l.value : l;
    },
  },
  data() {
    return {
      maps,
      isOpenExplain: false,
    };
  },
  methods: {
    closeModalMethod() {
      this.isOpenExplain = false;
    },
  },
});
</script>
