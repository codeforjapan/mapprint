<template lang="pug">
div
  .modal(v-bind:class='{open: isOpen}')
    p(v-if="mapConfig")
      span(v-if="$i18n.locale === 'ja' || !mapConfig.map_description_en") {{mapConfig.map_description}}
      span(v-else) {{mapConfig.map_description_en}}
    p(v-if="about")
      span
        | {{about.desc_1}}
        a(href="https://github.com/codeforjapan/mapprint") {{about.desc_2}}
        | {{about.desc_3}}
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
    // Languages other than Japanese are automatically changed to English.
    // Once you support all the languages, please just put "let about = this.$t('about')" here.
    let about;
    switch (this.$i18n.locale) {
        case "ja":
          about = this.$t('about')
          break;
        default:
          about = {
            "desc_1": "This site is open source. If you want to contribute to this project, please visit the ",
            "desc_2": "Code for Japan's Github repository",
            "desc_3": ". Everyone is welcome, and we especially invite those with JavaScript or Leaflet experience to join us."
          };
          break;
      }
    return {
      mapConfig: this.$nuxt.$route.params.map ? require('~/assets/config/' + (this.$nuxt.$route.params.map)) : '',
      about,
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
