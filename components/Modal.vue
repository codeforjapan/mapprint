<!-- eslint-disable vue/multi-word-component-names -->
<template lang="pug">
div
  .modal(v-bind:class='{open: isOpen}')
    p(v-if="mapConfig")
      span(v-if="locale === 'ja' || !mapConfig.map_description_en") {{mapConfig.map_description}}
      span(v-else) {{mapConfig.map_description_en}}
    p
      //- Remove this v-if conditional branching and just use the i18n tag when the translation is complete.
      span(v-if="locale === 'ja' || locale === 'en'")
        i18n(path="about.desc")
          template(#githubRepo)
            a(href="https://github.com/codeforjapan/mapprint") {{$t('about.github_repository')}}
      span(v-else) 
        | This site is open source. If you want to contribute to this project, please visit the
        a(href="https://github.com/codeforjapan/mapprint") Code for Japan's Github repository
        | . Everyone is welcome, and we especially invite those with JavaScript or Leaflet experience to join us.
    div
      span.modal-close(@click='handleClick')
        | × close
  .modal-background(@click='handleClick' :class='{open: isOpen}')
</template>

<script lang="js">
import { getMapConfig } from '~/lib/mapConfigs'

export default {
  // vue-i18n 9 以降 locale と locales は ref なので、
  // テンプレートやスクリプトから直接使えない。setup で unwrap して公開する。
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // vue-i18n 9 以降 $i18n.locale は ref なのでテンプレートから直接使えない。
    // ref でも素の値でも動くように unwrap した computed を用意する。
    locale () {
      const l = this.$i18n.locale
      return l && typeof l === 'object' && 'value' in l ? l.value : l
    },
    mapConfig () {
      const id = this.$route?.params?.map
      return id ? getMapConfig(id) : ''
    }
  },
  methods: {
    handleClick () {
      this.$emit('update:isOpen', false)
      this.$emit('closeModal')
    }
  }
}
</script>
