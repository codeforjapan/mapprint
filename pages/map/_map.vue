<template lang="pug">
div.layout-map
  div.layout-map-inner.grid-noGutter
    aside.print-exclude.col-12_md-3_xl-6
      .aside-inner
        .aside-grid
          .aside-item1
            h2.aside-title-sp
              img(src="~/assets/images/sp_logo.png" width="607" height="452" :alt='$t("common.title")')
            h2.aside-title-pc
              img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
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
              img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
            .sub-outer.print-exclude
              .sub-button(@click='isOpenExplain=!isOpenExplain')
                i.fas.fa-info-circle.fa-lg
                span
                  | {{$t('common.about')}}
              .sub-button.github-link
                i.fab.fa-github.fa-lg
                a(href="https://github.com/codeforjapan/mapprint") {{ $t('common.contribute') }}
              .sub-button
                i.fas.fa-language.fa-lg
                select(onChange="location.href=value;")
                  option.language(disabled selected)
                    | Language: {{$i18n.locales.filter((i) => { return i.code === $i18n.locale })[0].name}}
                  option(v-for="locale in $i18n.locales" :value="switchLocalePath(locale.code)")
                    | {{ locale.name }}
            .title-outer
              h1.title(v-if="map_config && $i18n.locale === 'ja'")
                | {{map_config.map_title}}
              h1.title(v-else)
                | {{map_config.map_title_en}}
              .datetime
                | {{$t('map.printed_at')}} {{updated_at}}
          .qrcode
            vue-qrcode(v-bind:value='fullURL' tag="img")
        printable-map(:map_config='map_config', v-if="map_config", @bounds-changed="updateQRCode")
        footer.footer
          .footer-logo
            img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
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
    const locale = app.i18n.locale
    const updated_at = getNowYMD(new Date(), locale)
    return { updated_at }
  },
  data () {
    return {
      map_config: require('~/assets/config/' + (this.$nuxt.$route.params.map)),
      locale: null,
      isOpenExplain: false,
      fullURL: null,
      updated_at: null
    }
  },
  head () {
    let title, description
    const image = this.map_config.map_image ? this.map_config.map_image : 'logo.png'
    switch (this.$i18n.locale) {
      case 'ja':
      case 'en':
        title = this.map_config.map_title_en
        description = this.map_config.map_description_en
        break
      default:
        title = this.map_config.map_title_en
        description = this.map_config.map_description_en
        break
    }
    return {
      title: title + ' - ' + this.$i18n.t('common.site_name'),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:image', property: 'og:image', content: 'https://kamimap.com/images/' + image },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'og:title', name: 'og:title', content: title + this.$i18n.t('common.site_name') }
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
