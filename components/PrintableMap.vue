<template lang="pug">
  client-only
    div
      div
        label.header-label(v-for='source in map_config.sources')
          input.header-input(type='checkbox', v-model='source.show')
          | {{source.title}}
      .header-datetime
        | データ最終更新日： {{updated_at}}
      .map-outer
        MglMap(:mapStyle.sync="mapStyle", :center='center', :zoom='15', @load="load", preserveDrawingBuffer=true, sourceId="basemap"
        )#map
          MglGeolocateControl
          .legend(v-bind:class='{open: isOpenLegend}')
            .legend-inner
              .legend-type(v-for='setting in map_config.layer_settings')
                i(:class="[setting.icon_class]", :style="{backgroundColor:setting.color}")
                span.poi-type
                  | {{setting.name}}
              .legend-trigger(v-on:click='isOpenLegend=!isOpenLegend' v-bind:class='{close: !isOpenLegend}')
                .legend-trigger-icon(v-if='!isOpenLegend')
                  i.fas.fa-caret-left
                  span
                    | 凡例
                .legend-trigger-icon(v-else)
                  i.fas.fa-caret-right
                  span
                    | とじる
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
                  span.poi-type
                    | {{marker.category.name}}
                  p
                    | 名称: {{marker.feature.properties.name}}
                    | {{marker.feature.properties.description ? marker.feature.properties.description : ""}}
      div
        section(v-for='group in displayMarkersGroupByCategory')
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

import { getNowYMD } from '~/lib/displayHelper.ts'

let helper;
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
      updated_at: null,
      isOpenLegend: false,
      previous_hash: "",
      mapStyle: {
        "version": 8,
        "sources": {
          "OSM": {
            "type": "raster",
            "tiles": ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            "tileSize": 256,
            "attribution": 'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>'
          }
        },
        "layers": [{
          "id": "OSM",
          "type": "raster",
          "source": "OSM",
          "minzoom": 0,
          "maxzoom": 22
        }]
      }
    }
  },
  methods: {
    load (e) {
      // deserialie bounds from url
      var locationhash = window.location.hash.substr(1);
      var initbounds = helper.deserializeBounds(locationhash);
      this.map = e.map
      if (initbounds != undefined){
        this.map.fitBounds(initbounds, {linear:false});
      }
      this.map.on('moveend', this.etmitBounds)
      this.etmitBounds()
    },
    etmitBounds () {
      this.bounds = this.map.getBounds()
      this.setHash(this.bounds)
      this.$emit('bounds-changed')
    },
    setHash(bounds){
      var s = helper.serializeBounds(bounds);
      let path = location.pathname;
      if (s != this.previous_hash) {
        window.history.pushState('', '', path + '#' + s);
      }
      this.previous_hash = s;
    }
  },
  mounted () {
    const MapHelper = require('~/lib/MapHelper.ts').default

    helper = new MapHelper()
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
