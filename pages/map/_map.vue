<template lang="pug">
div.layout-map
  div.layout-map-inner.grid-noGutter
    aside.print-exclude.col-12_md-3_xl-6
      .aside-inner
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
    main.main.col-12_md-9_xl-6
      .main-sheet
        header.header
          .to-top
            nuxt-link(to='/')
              i.far.fa-arrow-alt-circle-left.fa-2x
          .banner
            .logo.print-exclude
              img(src="~/assets/images/logo.png" width="895" height="160" alt="地図情報を印刷できる「紙マップ」")
            .sub-outer.print-exclude
              .sub-button(@click='isOpenExplain=!isOpenExplain')
                i.fas.fa-info-circle.fa-lg
                span
                  | このサイトについて
              .sub-button.github-link
                i.fab.fa-github.fa-lg
                a(href="https://github.com/codeforjapan/mapprint") 開発参加者募集中
            .title-outer
              h1.title(v-if="map_config") {{map_config.map_title}}
              .datetime
                | 印刷日： {{updated_at}}
          .qrcode
            vue-qrcode(v-bind:value='fullURL' tag="img")
        printable-map(:map_config='map_config', v-if="map_config", @bounds-changed="updateQRCode")
        footer.footer
          .footer-logo
            img(src="~/assets/images/logo.png" width="895" height="160" alt="地図情報を印刷できる「紙マップ」")
  modal(v-bind:isOpen='isOpenExplain' v-on:closeModal="closeModalMethod")
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode'
import PrintableMap from '~/components/PrintableMap'
import { getNowYMD } from '~/lib/displayHelper.ts'
import Modal from '~/components/Modal'
if (process.client) {
  require('viewport-units-buggyfill').init();
}
export default {
  components: {
    PrintableMap, VueQrcode, Modal
  },
  data () {
    return {
      map_config: require('~/assets/config/' + (this.$nuxt.$route.params.map)),
      isOpenExplain: false,
      fullURL: null,
      updated_at: null
    }
  },
  methods: {
    updateQRCode() {
      this.fullURL = location.href;
    },
    closeModalMethod () {
      this.isOpenExplain = false;
    }
  },
  mounted () {
    this.fullURL = location.href;
    this.updated_at = getNowYMD(new Date());
  },
  head () {
    return {
      title: this.map_config.map_title,
      meta: [
        { hid: 'description', name: 'description', content: this.map_config.map_description },
        { hid: 'og:image', property: 'og:image', content: 'https://codeforjapan.github.io/mapprint/images/' + (this.map_config.map_image ? this.map_config.map_image : 'logo.png')}
      ]
    }
  }
}
</script>
