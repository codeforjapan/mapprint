<template lang="pug">
  client-only
    div
      MglMap(access-token='pk.eyJ1IjoibWlra2FtZSIsImEiOiJjamtpNnczNTQxMXJuM3FtbHl1a3dyMmgxIn0.d4Xr7p5rC24rYg4pFVWwqg', map-style='mapbox://styles/mapbox/streets-v11', :center="center", zoom="15", @load="load")
        MglGeolocateControl
        template(v-for='layer in layers')
          MglMarker(v-for="marker in layer.markers", :coordinates="marker.feature.geometry.coordinates")
            template(slot="marker")
              div.marker
                span(:style="{background:marker.category.color}")
                  i(:class="[marker.category.iconClass, marker.category.class]", :style="{background:marker.category.color}")
                  b.number(:style="{background:marker.category.color}") {{inBoundsMarkers.indexOf(marker) +1}}
            MglPopup
              div.legend-type
                i(:class="[marker.category.iconClass, marker.category.class]", :style="{background:marker.category.color}")
                .poi-type {{marker.category.name}}
                p
                  h3 名称: {{marker.feature.properties.name}}
                  | {{marker.feature.properties.description ? marker.feature.properties.description : ""}}
      #list
        section(v-for='group in displayMarkersGroupByCategory', :id="'section-'+group.prop.class")
          h2.list-title {{group.prop.name}}
          ul(v-for="marker in group.markers")
            li
              .item-number {{inBoundsMarkers.indexOf(marker) +1}}
              .item-name {{marker.feature.properties.name}}
</template>

<script>
import '~/assets/sass/map.scss'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapHelper from '~/lib/MapHelper.ts'
const helper = new MapHelper
export default {
  props: ['map_config'],
  computed: {
    center () {
      return this.map_config.center
    },
    displayMarkersGroupByCategory () {
      const resultGroupBy = this.inBoundsMarkers.reduce((groups, current) => {
        let group = groups.find((g) => g.name === current.category.name)
        if (!group) {
          group = {
            name: current.category.name,
            prop: current.category,
            markers: []
          }
          groups.push(group)
        }
        group.markers.push(current)
        return groups
      },
      []
      )

      return resultGroupBy
    }
  },
  data () {
    return {
      layers: [],
      map: null,
      bounds: null,
      inBoundsMarkers:[]
    }
  },
  methods: {
    load (e) {
      this.map = e.map
      this.map.on('moveend', this.etmitBounds)
      this.etmitBounds()
    },
    etmitBounds () {
      this.bounds = this.map.getBounds()
    }
  },
  watch: {
    bounds () {
      this.inBoundsMarkers.splice(0, this.inBoundsMarkers.length)
      this.layers.map((layer) => {
        layer.markers.map((marker) => {
          if (helper.inBounds(marker.feature.geometry.coordinates, this.bounds)) {
            this.inBoundsMarkers.push(marker)
          }
        })
      })
    }
  },
  mounted () {
    this.map_config.sources.forEach((source) => {
      $nuxt.$axios.$get(source.url).then((data) => {
        this.layers.push({
          source,
          markers: helper.parse(source.type, data, this.map_config.layer_settings)
        })
      })
    })
  }
}
</script>
