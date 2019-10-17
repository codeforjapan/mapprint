<template lang="pug">
  .page
    header.header
      h1.logo
        img(src="~/assets/images/logo.png" alt="紙マップ")
    .container
      ul
        li(v-for='(map, index) in maps')
          nuxt-link(:to='"map/"+map.map_id', v-bind:key='index') {{map.map_title}}
</template>

<script>
import mapList from '~/assets/config/list.json'
console.log(mapList)
const maps = []

mapList.forEach((name) => {
  maps.push(require('~/assets/config/' + name))
})

export default {
  data () {
    return {
      maps
    }
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
