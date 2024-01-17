<!-- eslint-disable vue/multi-word-component-names -->
<template lang="pug">
div
  .modal(v-bind:class='{open: isOpen}')
    p(v-if="mapConfig")
      span(v-if="$i18n.locale === 'ja' || !mapConfig.map_description_en") {{mapConfig.map_description}}
      span(v-else) {{mapConfig.map_description_en}}
    p
      //- Remove this v-if conditional branching and just use the i18n tag when the translation is complete.
      span(v-if="$i18n.locale === 'ja' || $i18n.locale === 'en'")
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
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mapConfig: this.$nuxt.$route.params.map ? require('~/assets/config/' + (this.$nuxt.$route.params.map)) : '',
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
