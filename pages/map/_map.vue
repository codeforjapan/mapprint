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
              | {{$t('map.desc_1')}}
          .aside-item3
            div.aside-item-illust1
              img(src="~/assets/images/illust_1.png" width="360" height="450" alt="")
          .aside-item4
            p
              | {{$t('map.desc_2')}}
              br
              | {{$t('map.desc_3')}}
          .aside-item5
            p
              | {{$t('map.desc_4')}}
              br
              | {{$t('map.desc_5')}}
          .aside-item6
            div.aside-item-illust2
              img(src="~/assets/images/illust_2.png" width="640" height="435" alt="")
          .aside-item7
            p
              | {{$t('map.desc_6')}}
              br
              | {{$t('map.desc_7')}}
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
                  | {{$t('common.about')}}
              .sub-button.github-link
                i.fab.fa-github.fa-lg
                a(href="https://github.com/codeforjapan/mapprint") {{ $t('common.contribute') }}
              .sub-button(v-for="locale in $i18n.locales")
                nuxt-link(
                  :key="locale.code"
                  :to="switchLocalePath(locale.code)"
                )
                  span {{ locale.name }}
            .title-outer
              h1.title(v-if="mapConfig && $i18n.locale === 'ja'")
                | {{mapConfig.map_title}}
              h1.title(v-else)
                | {{mapConfig.map_title_en}}
              .datetime
                | {{$t('map.printed_at')}} {{updatedAt}}
          .qrcode
            vue-qrcode(v-bind:value='fullURL' tag="img")
        printable-map(:mapConfig='mapConfig', v-if="mapConfig", @bounds-changed="updateQRCode")
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
  require('viewport-units-buggyfill').init()
}

export default {
  components: {
    PrintableMap, VueQrcode, Modal
  },
  asyncData ({ app }) {
    const updatedAt = getNowYMD(new Date(), app.i18n.locale)
    return { updatedAt }
  },
  data () {
    return {
      mapConfig: require('~/assets/config/' + (this.$nuxt.$route.params.map)),
      isOpenExplain: false,
      fullURL: null,
      updatedAt: null
    }
  },
  head () {
    return {
      title: this.mapConfig.map_title,
      meta: [
        { hid: 'description', name: 'description', content: this.mapConfig.map_description },
        { hid: 'og:image', property: 'og:image', content: 'https://kamimap.com/images/' + (this.mapConfig.map_image ? this.mapConfig.map_image : 'logo.png') },
        { hid: 'og:description', name: 'og:description', content: this.mapConfig.map_description },
        { hid: 'og:title', name: 'og:title', content: this.mapConfig.map_title + ' - 紙マップ' }
      ]
    }
  },
  mounted () {
    this.fullURL = location.href
  },
  methods: {
    updateQRCode () {
      this.fullURL = location.href
    },
    closeModalMethod () {
      this.isOpenExplain = false
    }
  }
}
</script>
