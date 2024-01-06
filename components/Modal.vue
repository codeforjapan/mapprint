<template lang="pug">
div
  .modal(v-bind:class='{open: isOpen}')
    p(v-if="mapConfig")
     span(v-if="$i18n.locale === 'ja'") {{mapConfig.map_description}}
     span(v-else) {{mapConfig.map_description_en}}
    p
      span(v-if="$i18n.locale === 'ja'")
        | このサイトのソースコードはオープンに公開しております。開発にご協力いただける方は、
        a(href="https://github.com/codeforjapan/mapprint") Code for Japan の Github リポジトリ
        | から、開発にご参加ください。JavaScript や Leaflet などの経験がある方、大歓迎です。
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
  export default {
    props: {
      isOpen: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        mapConfig: this.$nuxt.$route.params.map ? require('~/assets/config/' + (this.$nuxt.$route.params.map)) : ''
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
