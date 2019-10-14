<template lang="pug">
  client-only
    div(v-if='layers.length')
      div
        label.header-label(v-for='source in map_config.sources')
          input.header-input(type='checkbox', v-model='source.show')
          | {{source.title}}
          span.source_updated
          | {{source.updated_at}}
          a(v-if='source.link', :href='source.link', target='blank') 元の地図へ
      .header-datetime
        | 印刷日： {{updated_at}}
      .map-outer
        MglMap(:mapStyle.sync="mapStyle", :center='center', :zoom='15', @load="load", preserveDrawingBuffer=true, sourceId="basemap"
        )#map
          MglGeolocateControl
          .legend(v-bind:class='{open: isOpenLegend}')
            .legend-inner
              .legend-type(v-for='(setting, name) in map_config.layer_settings')
                i(:class="[setting.icon_class]", :style="{backgroundColor:setting.color}")
                span.poi-type
                  | {{name}}
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
                  span(:style="{background:map_config.layer_settings[marker.category].color}")
                    i(:class="[map_config.layer_settings[marker.category].icon_class, map_config.layer_settings[marker.category].class]", :style="{backgroundColor:map_config.layer_settings[marker.category].color}")
                    b.number(:style="{background:map_config.layer_settings[marker.category].bg_color}") {{inBoundsMarkers.indexOf(marker) +1}}
              MglPopup
                div
                  div.legend-type
                    i(:class="[map_config.layer_settings[marker.category].icon_class, map_config.layer_settings[marker.category].class]", :style="{backgroundColor:map_config.layer_settings[marker.category].color}")
                    span.poi-type
                      | {{marker.category}}
                  p
                    | 名称: {{marker.feature.properties.name}}
                  div.legend-detail-content
                    p(v-html="marker.feature.properties.description ? marker.feature.properties.description : ''")
      div
        section(v-for='group in displayMarkersGroupByCategory')
          h2.list-title
            span.list-title-mark(:style="{backgroundColor:map_config.layer_settings[group.name].color}")
              i(:class="map_config.layer_settings[group.name].icon_class")
            span {{group.name}}
          ul.list-items.grid-noGutter
            li.col-12_xs-6(v-for="marker in group.markers")
              span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
              span.item-name {{marker.feature.properties.name}}
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'

import { getNowYMD } from '~/lib/displayHelper.ts'

const crc16 = require('js-crc').crc16;
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

        let group = groups.find((g) => g.name === current.category)
        if (!group) {
          group = {
            name: current.category,
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
      }else{
        initbounds = helper.deserializeBounds(this.map_config.default_hash);
        if (initbounds != undefined){
          this.map.fitBounds(initbounds, {linear:false});
        }
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
    },
  },
  mounted () {
    const MapHelper = require('~/lib/MapHelper.ts').default
    const ky = require('ky').default
    helper = new MapHelper()
    const categories = {};
    const self = this
    this.map_config.sources.forEach((source) => {
      (async () => {
        self.updated_at = getNowYMD(new Date())
        const data = await ky.get(source.url).text()
        const [markers, updated_at] = helper.parse(source.type, data, self.map_config.layer_settings,source.updated_search_key)
        markers.map((marker) => {
          categories[marker.category] = true;
        })
        source.updated_at = updated_at;
        Object.keys(categories).map((category) => {
          const categoryExists = self.map_config.layer_settings[category]

          if (!categoryExists) {
            let color = '#'
            color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 64).toString(16)
            color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 64).toString(16)
            color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 64).toString(16)

            let bg_color = '#'
            bg_color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 128).toString(16)
            bg_color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 128).toString(16)
            bg_color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 128).toString(16)
            self.map_config.layer_settings[category] = {
              name: category,
              color,
              bg_color

            }
          }
        })
        self.layers.push({
          source,
          markers
        })
      })()
    })
  }
}
</script>
