<template lang="pug">
  div
    client-only
      div(v-if='layers.length')
        .map-outer
          MglMap(:mapStyle.sync="mapStyle"
            :center='center', :zoom='15', @load="load"
            preserveDrawingBuffer=true
            sourceId="basemap", ref="map_obj"
          )#map
            MglGeolocateControl
            template(
              v-for='(layer, indexOfLayer) in layers'
              v-if="checkedArea.includes(layer.source.title)"
            )
        .legend-navi
          .area-select(:class='{open: isOpenAreaSelect}')
            .area-close(@click="isOpenAreaSelect=false")
              | {{$t("PrintableMap.close_area_select")}}
              i.fas.fa-arrow-down
            .area-list-outer(:class='{open: isOpenAreaSelect}')
              ul.area-list.grid
                li.area-item.col-12_xs-6(v-for='source in map_config.sources')
                  label.area-label
                    input.area-input(
                      type='checkbox'
                      :value='source.title'
                      v-model='selectArea'
                    )
                    | {{source.title}}
                    span
                      | {{source.updated_at}}
                    a(
                      v-if='source.link'
                      :href='source.link'
                      target='blank'
                    ) [{{$t("PrintableMap.back_to_map")}}]
          .navigation
            .navigation-area.print-exclude
              .legend-navi-icon.active
                .legend-navi-button.print-button(@click="clickPrintButton()")
                  span.fa.fa-print(:alt='$t("PrintableMap.print")')
            .navigation-area
              .area-select-button(@click="isOpenAreaSelect=!isOpenAreaSelect")
                .area-array-outer
                  i.fas.fa-check-square
                  .area-array
                    | {{checkedArea.join(', ')}}
                .area-select-button-icon.print-exclude
                  i.fas.fa-arrow-up
            .navigation-legend.legend-navi-inner.print-exclude
              .legend-navi-icon
                img(
                  :src='legendMark'
                  width="60" height="60"
                  :alt='$t("PrintableMap.legend")'
                )
              .legend-list-outer
                simplebar(data-simplebar-auto-hide="false")
                  ul.legend-list
                    li.legend-item(
                      v-for='(setting, category) in map_config.layer_settings'
                      v-if="displayMarkersGroupByCategory.some((elm) => elm.category === category)"
                    )
                      span.legend-mark(
                        :style="{backgroundColor:setting.color}"
                        @click="selectCategory(category), isOpenList=category, isDisplayAllCategory=false"
                        :class='{open: isDisplayAllCategory || activeCategory === category}'
                      )
                        i(:class="[setting.icon_class]")
              .legend-navi-icon(
                @click="selectCategory(''), isDisplayAllCategory=true, isOpenList=true"
                :class='{active: activeCategory}'
              )
                .legend-navi-button
                  img.legend-navi-img(
                    :src='legendActive'
                    width="40" height="40"
                    :alt='$t("PrintableMap.show_all")'
                  )
          .list-outer(:class='{open: isOpenList}')
            section.list-section(
              v-for='group in displayMarkersGroupByCategory'
              :class='{show: isDisplayAllCategory || activeCategory === getMarkerCategoryText(group.category, $i18n.locale)}'
            )
              h2.list-title(
                :style="{backgroundColor:map_config.layer_settings[group.category].color}"
              )
                span.list-title-mark
                  i(
                    :class="map_config.layer_settings[group.category].icon_class"
                  )
                span {{getMarkerCategoryText(group.category, $i18n.locale)}}
              ul.list-items.grid-noGutter
                li.col-12_xs-6(v-for="marker in group.markers")
                  span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
                  span.item-name {{getMarkerNameText(marker.feature.properties, $i18n.locale)}}
            .list-section-none(
              v-if="isDisplayAllCategory && displayMarkersGroupByCategory.length === 0"
            )
              p
                | {{$t("PrintableMap.no_point_in_map")}}
        .legend-close.print-exclude(
          :class='{open: isOpenList}'
          @click="isOpenList=false"
        )
          | {{$t("PrintableMap.close_list")}}
          i.fas.fa-arrow-down
</template>

<script>
import 'maplibre-gl/dist/maplibre-gl.css'
import 'simplebar/dist/simplebar.min.css'
import MapLibre from 'maplibre-gl'
import { getNowYMD } from '~/lib/displayHelper.ts'
import '@turf/helpers'
import { featureCollection } from '@turf/helpers'

const crc16 = require('js-crc').crc16
let helper
export default {
  props: ['map_config'],
  data () {
    // 日本語と英語以外の画像素材ファイルはないので英語を優先する
    let locale = 'en'
    if (this.$i18n.locale === 'ja') {
      locale = 'ja'
    }
    return {
      layers: [],
      map: null,
      bounds: null,
      updated_at: null,
      previous_hash: '',
      activeCategory: '',
      checkedArea: [],
      isOpenAreaSelect: false,
      isOpenList: false,
      isDisplayAllCategory: true,
      mapStyle: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
      legendMark: require(`@/assets/images/fukidashi_obj_${locale}.svg`),
      legendActive: require(`@/assets/images/active_txt_${locale}.svg`)
    }
  },
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
          if (this.bounds.contains(MapLibre.LngLat.convert(marker.feature.geometry.coordinates))) {
            inBoundsMarkers.push(marker)
          }
        })
      })
      return inBoundsMarkers
    },
    displayMarkersGroupByCategory () {
      const resultGroupBy = this.inBoundsMarkers.reduce((groups, current) => {
        let group = groups.find(g => g.category === current.category)
        if (!group) {
          group = {
            category: current.category,
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
    },
    selectArea: {
      get () {
        return this.checkedArea
      },
      set (value) {
        this.checkedArea = value
      }
    }
  },
  mounted () {
    const MapHelper = require('~/lib/MapHelper.ts').default
    const ky = require('ky').default
    helper = new MapHelper()
    const area = []
    const categories = {}
    const self = this
    this.map_config.sources.forEach((source) => {
      (async () => {
        if (source.show) { area.push(source.title) }
        self.checkedArea = area
        self.updated_at = getNowYMD(new Date())
        const data = await ky.get(source.url).text()
        const [markers, updated_at] = helper.parse(source.type, data, self.map_config.layer_settings, source.updated_search_key)
        markers.map((marker) => {
          categories[marker.category] = true
          //console.log(marker.feature.properties)
          marker.feature.properties['category'] = marker.category
        })
        source.updated_at = updated_at
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
  },
  methods: {
    load () {
      // deserialie bounds from url
      const locationhash = window.location.hash.substr(1)
      let initbounds = helper.deserializeBounds(locationhash)
      this.map = this.$refs.map_obj
      if (initbounds != undefined) {
        this.map.map.fitBounds(initbounds, { linear: false })
      } else {
        initbounds = helper.deserializeBounds(this.map_config.default_hash)
        if (initbounds != undefined) {
          this.map.map.fitBounds(initbounds, { linear: false })
        }
      }
      const self = this
      // const images = {}
      Object.keys(this.map_config.layer_settings).map((category) => {
        const current_category = self.map_config.layer_settings[category]
        const size = 40
        const image = {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),
          onAdd: function(map) {
            const canvas = document.createElement('canvas')
            canvas.width = this.width
            canvas.height = this.height
            this.context = canvas.getContext('2d')
            this.map = map
          },

          render: function() {
            const context = this.context
            const radius = (size / 2) * 0.3
            const outerRadius = (size / 2) * 0.7 + radius
            context.clearRect(0, 0, this.width, this.height)
            context.beginPath()
            context.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
            )
            context.fillStyle = 'rbga(5, 5, 5, 1)'
            context.fill()
            // draw inner circle
            context.beginPath()
            context.arc(
              this.width / 2,
              this.height / 2,
              radius,
              0,
              Math.PI * 2
            )
            context.fillStyle = current_category['bg_color']
            context.strokeStyle = current_category['color']
            context.fill()
            context.stroke()
            this.data = context.getImageData(
              0,
              0,
              this.width,
              this.height,
            ).data
            this.map.triggerRepaint()
            return true
          }
        }
        self.map.map.addImage(category, image)
      })
      let markers = this.layers.map(l => l['markers']).flat()
      // KML hack
      markers = markers.map(m => m["feature"])

      const geojson = featureCollection(markers)

      this.map.map.addSource('markers', {
        type: 'geojson',
        data: geojson
      })
      Object.keys(this.map_config.layer_settings).map((category) => {
        const current_category = self.map_config.layer_settings[category]
        self.map.map.addLayer({
          'id': category,
          'type': 'symbol',
          'source': 'markers',
          'layout': {
            'icon-image': category,
            'icon-allow-overlap': true,
          },
          'filter': ['==', 'category', category]
        })
      })
      console.log(this.map.map)
      this.map.map.on('moveend', this.emitBounds)
      this.emitBounds()
      this.map.map.addControl(new MapLibre.NavigationControl())
    },
    emitBounds () {
      this.bounds = this.map.map.getBounds()
      this.setHash(this.bounds)
      this.$emit('bounds-changed')
    },
    setHash (bounds) {
      const s = helper.serializeBounds(bounds)
      const path = location.pathname
      if (s != this.previous_hash) {
        window.history.pushState('', '', path + '#' + s)
      }
      this.previous_hash = s
    },
    selectCategory (category) {
      this.activeCategory = category
    },
    clickPrintButton () {
      window.print()
    },
    getMarkerCategoryText (category, locale) {
      if (category === undefined) {
        category = "未分類"
      }
      const key = 'category.' + category
      const categoryText = this.$i18n.t(key)
      if (categoryText !== key) {
        return categoryText
      } else {
        return category
      }
    },
    getMarkerNameText (markerProperties, locale) {
      let name = markerProperties.name
      if (markerProperties.hasOwnProperty("name:" + locale)) {
        name = markerProperties["name:" + locale]
      }
      return name
    }
  }
}
</script>
