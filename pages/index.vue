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
                .index-item-title(v-if="$i18n.locale === 'ja'")
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
          | Language: {{$i18n.locales.filter((i) => { return i.code === $i18n.locale })[0].name}}
        option(v-for="locale in $i18n.locales" :value="switchLocalePath(locale.code)")
          | {{ locale.name }}
  modal(v-bind:isOpen='isOpenExplain' v-on:closeModal="closeModalMethod")
</template>

<script lang="ts">
import mapList from "~/assets/config/list.json";
import Modal from "~/components/Modal.vue";

const maps = [];

mapList.forEach((name) => {
  maps.push(require("~/assets/config/" + name));
});

export default {
  components: {
    Modal,
  },
  data() {
    return {
      maps,
      isOpenExplain: false,
    };
  },
  head() {
    let siteName, siteDesc;
    switch (this.$i18n.locale) {
      case "ja":
      case "en":
      case "kr":
        siteName = this.$i18n.t("common.site_name");
        siteDesc = this.$i18n.t("common.site_desc");
        break;
      default:
        siteName = "KamiMap";
        siteDesc = "Paper Map for printable map information";
        break;
    }
    return {
      title: siteName,
      meta: [
        { hid: "description", name: "description", content: siteDesc },
        { hid: "og:site_name", property: "og:site_name", content: siteName },
        { hid: "og:title", property: "og:title", content: siteName },
        { hid: "og:description", property: "og:description", content: siteDesc },
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
  },
  methods: {
    closeModalMethod() {
      this.isOpenExplain = false;
    },
  },
};
</script>

