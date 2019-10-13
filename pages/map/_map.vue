<template lang="pug">
div.layout-container-inner.grid
  aside#explain.not_print_area.col-12_md-3
    h2.explain-title-pc
     | このサイトについて
    div.explain-title-sp(v-on:click='isOpenExplain=!isOpenExplain')
     | このサイトについて
    div.explain(v-bind:class='{open: isOpenExplain}')
      p(v-if="map_config") {{map_config.map_description}}
      p
        | このサイトのソースコードはオープンに公開しております。開発にご協力いただける方は、
        a(href="https://github.com/codeforjapan/mapprint") Code for Japan の Github リポジトリ
        | から、開発にご参加ください。JavaScript や Leaflet などの経験がある方、大歓迎です。
  main.sheet.col-12_md-9
    header.header
      div.qrcode
        vue-qrcode(v-bind:value='fullURL' tag="img")
      div.banner
        div.logo
          img(src="~/assets/images/logo_l.png")
        h1.title(v-if="map_config") {{map_config.map_title}}
    #content
      #page
        #date.print_area
        printable-map(:map_config='map_config', v-if="map_config", @bounds-changed="updateQRCode")
      #footer.print_area
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
        { hid: 'description', name: 'description', content: this.map_config.map_title },
        { hid: 'og:image', property: 'og:image', content: '/mapprint/images/' + (this.map_config.map_image ? this.map_config.map_image : 'logo.png')}
      ]
    }
  }
}
</script>
