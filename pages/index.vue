<template lang="pug">
  .layout-index
    #fb-root
    header
      h1.index-title
        img(src="~/assets/images/logo.png" width="895" height="160" alt="地図情報を印刷できる「紙マップ」")
    main.index-main
      ul.index-list.grid-center-equalHeight
        li.col-12_xs-6_lg-4(v-for='(map, index) in maps')
          .index-item
            .index-item-inner
              nuxt-link(:to='"map/" + map.map_id', v-bind:key='index')
                .index-link-inner
                  img(:src='"https://kamimap.com/images/" + (map.map_image ? map.map_image : "logo.png")' alt='')
                  .index-item-title
                    span
                      | {{map.map_title}}
                    i.index-arrow-icon.fas.fa-long-arrow-alt-right
            .index-item-sns
              div
                div(class="fb-share-button" :data-href='"https://kamimap.com/map/" + map.map_id' data-layout="button" data-size="small")
                  a(target="_blank" :href='"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkamimap.com%2Fmap%2F" + map.map_id + "%2F&amp;src=sdkpreparse"' class="fb-xfbml-parse-ignore") シェア
              div
                a(href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" :data-text='map.map_title + " - 地図情報を印刷できる「紙マップ」"' :data-url='"https://kamimap.com/map/" + map.map_id' data-show-count="false") Tweet
              div
                div(class="line-it-button" data-lang="ja" data-type="share-a" data-ver="3" :data-url='"https://kamimap.com/map/" + map.map_id' data-color="default" data-size="small" data-count="false" style="display: none;")
    footer.index-footer
      .sub-button(@click='isOpenExplain=!isOpenExplain')
        i.fas.fa-info-circle.fa-lg
        span
          | このサイトについて
      .sub-button
        i.fab.fa-github.fa-lg
        a(href="https://github.com/codeforjapan/mapprint") 開発参加者募集中
    modal(v-bind:isOpen='isOpenExplain' v-on:closeModal="closeModalMethod")
</template>

<script>
import mapList from '~/assets/config/list.json'
import Modal from '~/components/Modal'

const maps = []

mapList.forEach((name) => {
  maps.push(require('~/assets/config/' + name))
})

export default {
  components: {
    Modal
  },
  data () {
    return {
      maps,
      isOpenExplain: false,
    }
  },
  methods: {
    closeModalMethod () {
      this.isOpenExplain = false;
    }
  },
  head () {
    return {
      script: [
        { src: 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v4.0', async: true, defer: true, crossorigin: 'anonymous' },
        { src: 'https://platform.twitter.com/widgets.js', async: true },
        { src: 'https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js', async: true, defer: true }
      ]
    }
  }
}
</script>
