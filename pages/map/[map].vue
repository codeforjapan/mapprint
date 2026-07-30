<template lang="pug">
div.layout-map
  div.layout-map-inner.grid-noGutter
    aside.print-exclude.col-12_md-3_xl-6
      .aside-inner
        .aside-grid
          .aside-item1
            h2.aside-title-sp
              nuxt-link(to='/')
                img(src="~/assets/images/sp_logo.png" width="607" height="452" :alt='$t("common.title")')
            h2.aside-title-pc
              nuxt-link(to='/')
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
              nuxt-link(to='/')
                img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
            .sub-outer.print-exclude
              .sub-button(@click='isOpenExplain=!isOpenExplain')
                i.fas.fa-info-circle.fa-lg
                span
                  | {{$t('common.about')}}
              .sub-button.github-link
                i.fab.fa-github.fa-lg
                a(href="https://github.com/codeforjapan/mapprint") {{ $t('common.contribute') }}
              .sub-button.share-button
                i.fas.fa-share-nodes.fa-lg
                a.share-link(
                  v-for="link in shareLinks"
                  :key="link.id"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="$t('common.share') + ' (' + link.label + ')'"
                )
                  i.fa-lg(:class="link.iconClass")
              .sub-button
                i.fas.fa-language.fa-lg
                select(onChange="location.href=value;")
                  option.language(disabled selected)
                    | Language: {{locales.filter((i) => { return i.code === locale })[0].name}}
                  option(v-for="locale in locales" :value="switchLocalePath(locale.code)")
                    | {{ locale.name }}
            .title-outer
              h1.title(v-if="mapConfig && locale === 'ja'")
                | {{mapConfig.map_title}}
              h1.title(v-else)
                | {{mapConfig.map_title_en}}
              .datetime
                | {{$t('map.printed_at')}} {{updated_at}}
          .qrcode
            vue-qrcode(v-bind:value='fullURL' tag="img")
        printable-map(:mapConfig='mapConfig', v-if="mapConfig", @bounds-changed="updateQRCode")
        footer.footer
          .footer-logo
            img(src="~/assets/images/logo.png" width="895" height="160" :alt='$t("common.title")')
  modal(v-bind:isOpen='isOpenExplain' v-on:closeModal="closeModalMethod")
</template>

<script lang="js">
import VueQrcode from '@chenfengyuan/vue-qrcode'
import PrintableMap from '~/components/PrintableMap'
import { getNowYMD } from '~/lib/displayHelper.ts'
import Modal from '~/components/Modal'
import { buildShareLinks, buildShareUrl } from '~/lib/shareHelper'
import { getMapConfig } from '~/lib/mapConfigs'

export default defineNuxtComponent({
  components: {
    PrintableMap, VueQrcode, Modal
  },
  // @nuxtjs/i18n v9 以降 switchLocalePath は composable なので、
  // Options API のテンプレートから使えるよう setup で公開する
  // vue-i18n 9 以降 locale と locales は ref なので、
  // テンプレートやスクリプトから直接使えない。setup で unwrap して公開する。
  setup () {
    const { locale, locales, t } = useI18n()
    // data() から this.$route を参照すると Nuxt 3 以降は解決できないため、
    // ルートパラメータは setup の useRoute() から取る
    const route = useRoute()
    const mapConfig = ref(getMapConfig(route.params.map))

    // head() は defineNuxtComponent では setup 経由で処理され、その時点では
    // setup の戻り値を this から参照できない。useHead に移す。
    useHead(() => {
      const c = mapConfig.value
      const image = c.map_image ? c.map_image : 'logo.png'
      const title = locale.value === 'ja' ? c.map_title : c.map_title_en
      const description = locale.value === 'ja' ? c.map_description : c.map_description_en
      return {
        title: title + ' - ' + t('common.site_name'),
        meta: [
          { name: 'description', content: description },
          { property: 'og:image', content: 'https://kamimap.com/images/' + image },
          { name: 'og:description', content: description },
          { name: 'og:title', content: title + t('common.site_name') }
        ]
      }
    })

    return { switchLocalePath: useSwitchLocalePath(), mapConfig }
  },
  asyncData () {
    const { $i18n } = useNuxtApp()
    const updated_at = getNowYMD(new Date(), $i18n.locale.value)
    return { updated_at }
  },
  data () {
    return {
      // locale は computed で $i18n から導出するため data には持たない
      isOpenExplain: false,
      fullURL: null,
      updated_at: null
    }
  },
  computed: {
    // vue-i18n 9 以降 $i18n.locale は ref なのでテンプレートから直接使えない。
    // ref でも素の値でも動くように unwrap した computed を用意する。
    locale () {
      const l = this.$i18n.locale
      return l && typeof l === 'object' && 'value' in l ? l.value : l
    },
    locales () {
      const l = this.$i18n.locales
      return l && typeof l === 'object' && 'value' in l ? l.value : l
    },
    shareUrl () {
      // fullURL は mounted 後にしか入らないので、静的生成時は表示中のルートから組み立てる
      return buildShareUrl(this.fullURL, this.$route.path)
    },
    shareText () {
      const title = this.locale === 'ja' ? this.mapConfig.map_title : this.mapConfig.map_title_en
      return title + ' - ' + this.$t('common.site_desc')
    },
    shareLinks () {
      return buildShareLinks(this.shareUrl, this.shareText)
    }
  },
  async mounted () {
    // viewport-units-buggyfill は import 時点で window を参照するため
    // SSR では読み込めない。クライアントで動的に読む。
    const { default: viewportUnitsBuggyfill } = await import('viewport-units-buggyfill')
    viewportUnitsBuggyfill.init()
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
})
</script>
