<template lang="pug">
div
  .modal(v-bind:class='{open: isOpen}')
    p(v-if="map_config") {{map_config.map_description}}
    p
      | このサイトのソースコードはオープンに公開しております。開発にご協力いただける方は、
      a(href="https://github.com/codeforjapan/mapprint") Code for Japan の Github リポジトリ
      | から、開発にご参加ください。JavaScript や Leaflet などの経験がある方、大歓迎です。
    div
      span.modal-close(@click='handleClick')
        | × close
  .modal-background(@click='handleClick' :class='{open: isOpen}')
</template>

<script lang="js">
export default {
  props: ['isOpen'],
  data () {
    return {
      map_config: this.$nuxt.$route.params.map ? require('~/assets/config/' + (this.$nuxt.$route.params.map)) : ''
    }
  },
  methods: {
    handleClick () {
      this.isOpen = false
      this.$emit('closeModal')
    }
  }
}
</script>
