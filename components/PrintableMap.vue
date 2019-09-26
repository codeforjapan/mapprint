<template lang="pug">
  client-only
    div
      div
        label.header-label(v-for='source in map_config.sources')
          input.header-input(type='checkbox', v-model='source.show')
          | {{source.title}}
      div.header-datetime
        | データ最終更新日： {{updated_at}}
      MglMap(access-token='pk.eyJ1IjoibWlra2FtZSIsImEiOiJjamtpNnczNTQxMXJuM3FtbHl1a3dyMmgxIn0.d4Xr7p5rC24rYg4pFVWwqg', map-style='mapbox://styles/mapbox/streets-v11', :center="center", zoom="15", @load="load", preserveDrawingBuffer='true')#map
        MglGeolocateControl
        template(v-for='layer in layers', v-if="layer.source.show")
          MglMarker(v-for="(marker, index) in layer.markers", v-bind:key="index", :coordinates="marker.feature.geometry.coordinates")
            template(slot="marker")
              div.marker
                span(:style="{background:marker.category.color}")
                  i(:class="[marker.category.iconClass, marker.category.class]", :style="{backgroundColor:marker.category.color}")
                  b.number(:style="{background:marker.category.bgColor}") {{inBoundsMarkers.indexOf(marker) +1}}
            MglPopup
              div.legend-type
                i(:class="[marker.category.iconClass, marker.category.class]", :style="{backgroundColor:marker.category.color}")
                .poi-type {{marker.category.name}}
                p
                  | 名称: {{marker.feature.properties.name}}
                  | {{marker.feature.properties.description ? marker.feature.properties.description : ""}}
      div
        section(v-for='group in displayMarkersGroupByCategory', :id="'section-'+group.prop.class")
          h2.list-title
            span.list-title-mark(:style="{backgroundColor:group.prop.color}")
              i(:class="[group.prop.iconClass]")
            span {{group.prop.name}}
          ul.list-items.grid-noGutter
            li.col-12_xs-6(v-for="marker in group.markers")
              span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
              span.item-name {{marker.feature.properties.name}}
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'
import MapHelper from '~/lib/MapHelper.ts'
import { getNowYMD } from '~/lib/displayHelper.ts'

const helper = new MapHelper
export default {
  props: ['map_config'],
  computed: {
    center () {
      return this.map_config.center
    },
    inBoundsMarkers () {
      const inBoundsMarkers = []
      this.layers.map((layer) => {
        if (!layer.source.show) {
          return
        }
        layer.markers.map((marker) => {
          if (!this.bounds) {
            return
          }
          if (helper.inBounds(marker.feature.geometry.coordinates, this.bounds)) {
            inBoundsMarkers.push(marker)
          }
        })
      })
      return inBoundsMarkers
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
      updated_at: null
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
  mounted () {
    this.map_config.sources.forEach((source) => {
      this.updated_at = getNowYMD(new Date())
      $nuxt.$axios.get(source.url).then((response) => {
        this.layers.push({
          source,
          markers: helper.parse(source.type, response.data, this.map_config.layer_settings)
        })
      })
    })
  }
}
</script>
