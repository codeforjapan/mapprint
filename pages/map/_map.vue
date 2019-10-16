<template lang="pug">
div.layout-container-inner.grid
  aside.print-exclude.col-12_md-3_xl-6
    .aside-grid
      .aside-item1
        h2.aside-title-sp
          img(src="~/assets/images/sp_logo.png" width="607" height="452" alt="地図情報を印刷できる「紙マップ」")
        h2.aside-title-pc
          img(src="~/assets/images/logo.png" width="895" height="160" alt="地図情報を印刷できる「紙マップ」")
      .aside-item2
        p
          | さまざまな人の手によって収集された地図情報
      .aside-item3
        div.aside-item-illust1
          img(src="~/assets/images/illust_1.png" width="360" height="450" alt="")
      .aside-item4
        p
          | 必要な地域に調整すると
          br
          | 印刷に最適化されたマップ情報が表示されます
      .aside-item5
        p
          | その時々に応じた情報を選択してください
          br
          | 印刷用紙にちょうどよくおさまります
      .aside-item6
        div.aside-item-illust2
          img(src="~/assets/images/illust_2.png" width="640" height="435" alt="")
      .aside-item7
        p
          | 印刷して情報を必要としているひとに
          br
          | ぜひ届けてあげてください！
    div.explain-title-sp(v-on:click='isOpenExplain=!isOpenExplain')
      | このサイトについて
    div.explain(v-bind:class='{open: isOpenExplain}')
      p(v-if="map_config") {{map_config.map_description}}
      p
        | このサイトのソースコードはオープンに公開しております。開発にご協力いただける方は、
        a(href="https://github.com/codeforjapan/mapprint") Code for Japan の Github リポジトリ
        | から、開発にご参加ください。JavaScript や Leaflet などの経験がある方、大歓迎です。
  main.main-sheet.col-12_md-9_xl-6
    header.header
      .qrcode
        vue-qrcode(v-bind:value='fullURL' tag="img")
      .banner
        div.logo
          img(src="~/assets/images/logo_l.png" alt="")
        h1.title(v-if="map_config") {{map_config.map_title}}
    div
      printable-map(:map_config='map_config', v-if="map_config", @bounds-changed="updateQRCode")
</template>

<script>
import PrintableMap from '~/components/PrintableMap'
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
  components: {
    PrintableMap, VueQrcode
  },
  data () {
    return {
      map_config: require('~/assets/config/' + (this.$nuxt.$route.params.map)),
      isOpenExplain: false,
      fullURL: null
    }
  },
  methods: {
    updateQRCode() {
      this.fullURL = location.href;
    }
  },
  mounted () {

    this.fullURL = location.href;
  },
  head () {
    return {
      title: this.map_config.map_title,
      script: [
        { src: 'https://kit.fontawesome.com/9b0eb4b9b8.js', crossorigin:"anonymous", "data-n-head":false }
      ],
      meta: [
        { hid: 'description', name: 'description', content: this.map_config.map_description },
        { hid: 'og:image', property: 'og:image', content: 'https://codeforjapan.github.io/mapprint/images/' + (this.map_config.map_image ? this.map_config.map_image : 'logo.png')}
      ]
    }
  }
}
</script>
