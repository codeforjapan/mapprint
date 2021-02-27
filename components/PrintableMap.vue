<template lang="pug">
  div
    client-only
      div(v-if='layers.length')
        .map-outer
          MglMap(:mapStyle.sync="mapStyle", :center='center', :zoom='15', @load="load", preserveDrawingBuffer=true, sourceId="basemap"
          )#map
            MglGeolocateControl
            template(v-for='layer in layers', v-if="checkedArea.includes(layer.source.title)")
              MglMarker(v-for="(marker, index) in layer.markers", :key="index", :coordinates="marker.feature.geometry.coordinates")
                template(slot="marker")
                  div.marker
                    span(:style="{background:map_config.layer_settings[marker.category].color}"
                        :class="{show: isDisplayAllCategory || activeCategory === marker.category}")
                      i(:class="[map_config.layer_settings[marker.category].icon_class, map_config.layer_settings[marker.category].class]" :style="{backgroundColor:map_config.layer_settings[marker.category].color}")
                      b.number(:style="{background:map_config.layer_settings[marker.category].bg_color}") {{inBoundsMarkers.indexOf(marker) +1}}
                MglPopup
                  div
                    div.popup-type
                      i(:class="[map_config.layer_settings[marker.category].icon_class, map_config.layer_settings[marker.category].class]" :style="{backgroundColor:map_config.layer_settings[marker.category].color}")
                      span.popup-poi-type
                        | {{getCategoryText(marker.category, $i18n.locale)}}
                    p(v-if="$i18n.locale === 'ja'")
                      | {{$i18n.t("PrintableMap.name")}} {{marker.feature.properties.name}}
                    p(v-else)
                      | {{$i18n.t("PrintableMap.name")}} {{marker.feature.properties["name:en"]}}
                    div.popup-detail-content
                      p(v-html="marker.feature.properties.description ? marker.feature.properties.description : ''")
        .legend-navi
          .area-select(:class='{open: isOpenAreaSelect}')
            .area-close(@click="isOpenAreaSelect=false")
              | {{$t("PrintableMap.close_area_select")}}
              i.fas.fa-arrow-down
            .area-list-outer(:class='{open: isOpenAreaSelect}')
              ul.area-list.grid
                li.area-item.col-12_xs-6(v-for='source in map_config.sources')
                  label.area-label
                    input.area-input(type='checkbox', :value='source.title', v-model='selectArea')
                    | {{source.title}}
                    span
                      | {{source.updated_at}}
                    a(v-if='source.link', :href='source.link', target='blank') [{{$t("PrintableMap.back_to_map")}}]
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
                img(:src='imageLegendMark[$i18n.locale]' width="60" height="60" :alt='$t("PrintableMap.legend")')
              .legend-list-outer
                simplebar(data-simplebar-auto-hide="false")
                  ul.legend-list
                    li.legend-item(v-for='(setting, name) in map_config.layer_settings' v-if="displayMarkersGroupByCategory.some((elm) => elm.name === name)")
                      span.legend-mark(:style="{backgroundColor:setting.color}" @click="selectCategory(name), isOpenList=name, isDisplayAllCategory=false" :class='{open: isDisplayAllCategory || activeCategory === name}')
                        i(:class="[setting.icon_class]")
              .legend-navi-icon(@click="selectCategory(''), isDisplayAllCategory=true, isOpenList=true" :class='{active: activeCategory}')
                .legend-navi-button
                  img.legend-navi-img(:src='imageActiveText[$i18n.locale]' width="40" height="40" :alt='$t("PrintableMap.show_all")')
          .list-outer(:class='{open: isOpenList}')
            section.list-section(v-for='group in displayMarkersGroupByCategory' :class='{show: isDisplayAllCategory || activeCategory === group.name}')
              h2.list-title(:style="{backgroundColor:map_config.layer_settings[group.category].color}")
                span.list-title-mark
                  i(:class="map_config.layer_settings[group.category].icon_class")
                span(v-if="$i18n.locale === 'ja'") {{group.name}}
                span(v-else) {{group.name_en}}
              ul.list-items.grid-noGutter
                li.col-12_xs-6(v-for="marker in group.markers")
                  span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
                  span.item-name(v-if="$i18n.locale === 'ja'") {{marker.feature.properties.name}}
                  span.item-name(v-else) {{marker.feature.properties["name:en"]}}
            .list-section-none(v-if="isDisplayAllCategory && displayMarkersGroupByCategory.length === 0")
              p
                | {{$t("PrintableMap.no_point_in_map")}}
        .legend-close.print-exclude(:class='{open: isOpenList}' @click="isOpenList=false")
          | {{$t("PrintableMap.close_list")}}
          i.fas.fa-arrow-down
</template>

<script>
import 'maplibre-gl/dist/maplibre-gl.css'
import 'simplebar/dist/simplebar.min.css'
import { getNowYMD } from '~/lib/displayHelper.ts'
import imageLegendMarkJa from '@/assets/images/fukidashi_obj_ja.svg'
import imageLegendMarkEn from '@/assets/images/fukidashi_obj_en.svg'
import imageActiveTextJa from '@/assets/images/active_txt_ja.svg'
import imageActiveTextEn from '@/assets/images/active_txt_en.svg'

const crc16 = require('js-crc').crc16
let helper
export default {
  props: ['map_config'],
  data () {
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
      mapStyle: {
        'version': 8,
        'sources': {
          'OSM': {
            'type': 'raster',
            'tiles': [this.$i18n.t("PrintableMap.map_url")],
            'tileSize': 256,
            'attribution': 'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>'
          }
        },
        'layers': [{
          'id': 'OSM',
          'type': 'raster',
          'source': 'OSM',
          'minzoom': 0,
          'maxzoom': 22
        }]
      },
      imageLegendMark: {
        ja: imageLegendMarkJa,
        en: imageLegendMarkEn
      },
      imageActiveText: {
        ja: imageActiveTextJa,
        en: imageActiveTextEn
      }
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
          if (helper.inBounds(marker.feature.geometry.coordinates, this.bounds)) {
            inBoundsMarkers.push(marker)
          }
        })
      })
      return inBoundsMarkers
    },
    displayMarkersGroupByCategory () {
      const resultGroupBy = this.inBoundsMarkers.reduce((groups, current) => {
        const config = this.map_config.layer_settings[current.category]
        let group = groups.find(g => g.name === current.category)
        if (!group) {
          group = {
            category: current.category,
            name: config.name,
            name_en: config.name_en,
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
    load (e) {
      // deserialie bounds from url
      const locationhash = window.location.hash.substr(1)
      let initbounds = helper.deserializeBounds(locationhash)
      this.map = e.map
      if (initbounds != undefined) {
        this.map.fitBounds(initbounds, { linear: false })
      } else {
        initbounds = helper.deserializeBounds(this.map_config.default_hash)
        if (initbounds != undefined) {
          this.map.fitBounds(initbounds, { linear: false })
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
    getCategoryText (category, locale) {
      if (locale === 'ja') {
        return this.map_config.layer_settings[category].name
      } else {
        return this.map_config.layer_settings[category].name_en
      }
    }
  }
}
</script>
