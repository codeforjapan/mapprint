<template lang="pug">
  div

    #explain.not_print_area
      button#print 印刷する（A4タテ）
      p Google Chromeブラウザをお使いの方は上記( 印刷する（A4タテ）)のボタンから印刷してください。
      br
      .map_controls
        b 地図選択
        br
        label(for='color') カラー
        input#mono(name='mapStyle', type='radio', value='mono')
        label(for='mono') 白黒
      br
      button#close 閉じる
      .explain-container
        h2 このサイトについて
        p#map_description
        p
          | このサイトのソースコードはオープンに公開しております。開発にご協力いただける方は、
          a(href='https://github.com/codeforjapan/mapprint') Code for Japan の Github リポジトリ
          |       から、開発にご参加ください。JavaScript や Leaflet などの経験がある方、大歓迎です。
    section.sheet
      #header
        img#logo(src='images/logo.jpg')
        span#datetime_block
          | データ最終更新日：
          span#datetime
        #qrcodecontainer
      #content
        #page
          h1#map_title
          #date.print_area
          printable-map(:map_config='map_config', v-if="map_config")#map

            #legend.legend
          #list
        #footer.print_area
</template>

<script lang="ts">
import PrintableMap from '~/components/PrintableMap'
import '@/assets/sass/map.scss'
export default {
  components: {
    PrintableMap
  },
  data () {
    return {
      map_config: null
    }
  },
  mounted () {
    this.map_config = require('~/assets/config/' + ($nuxt.$route.params.map))

  }
}
</script>

<style>
  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
  }

  .links {
    padding-top: 15px;
  }
</style>
