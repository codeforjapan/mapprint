<template lang="pug">
  .layout-index
    header
      h1.index-title
        img(src="~/assets/images/logo.png" width="895" height="160" alt="地図情報を印刷できる「紙マップ」")
    main.index-main
      ul.index-list.grid-center-equalHeight
        li.col-12_md-4(v-for='(map, index) in maps')
          .index-item
            nuxt-link(:to='"map/" + map.map_id', v-bind:key='index')
              .index-item-inner
                img(:src='"https://codeforjapan.github.io/mapprint/images/" + (map.map_image ? map.map_image : "logo.png")' alt='')
                .index-item-title
                  span
                    | {{map.map_title}}
                  i.index-arrow-icon.fas.fa-long-arrow-alt-right
    footer.index-footer
      .sub-button(@click='isOpenExplain=!isOpenExplain')
        i.sub-icon.fas.fa-info-circle
        span
          | このサイトについて
      .sub-button
        i.sub-icon.fab.fa-github
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
}
</script>
