<template lang="pug">
  client-only
    div
      MglMap(access-token='pk.eyJ1IjoibWlra2FtZSIsImEiOiJjamtpNnczNTQxMXJuM3FtbHl1a3dyMmgxIn0.d4Xr7p5rC24rYg4pFVWwqg', map-style='mapbox://styles/mapbox/streets-v11', :center="center", zoom="15")
        MglGeolocateControl
        template(v-for='layer in layers')
          MglMarker(v-for="marker in layer.markers", :coordinates="marker.feature.geometry.coordinates")
            templat(v-slot:marker)
              | icon here
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'
import MapHelper from '~/lib/MapHelper.ts'
const helper = new MapHelper;
export default {
  props: ['map_config'],
  computed: {
    center () {
      return this.map_config.center
    }
  },
  data () {
    return {
      layers: []
    }
  },
  mounted () {
    this.map_config.sources.forEach((source) => {
      $nuxt.$axios.$get(source.url).then((data) => {

        this.layers.push({
          source,
          markers : helper.parse(source.type, data)
        })

      })
    })

  }
}
</script>
