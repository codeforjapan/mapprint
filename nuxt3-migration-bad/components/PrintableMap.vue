<template lang="pug">
div
  client-only
    div(v-if='layers.length')
      .map-outer
        div#map(ref="mapContainer")
        .legend-navi
          .area-select(:class='{open: isOpenAreaSelect}')
            .area-close(@click="isOpenAreaSelect=false")
              | {{t("PrintableMap.close_area_select")}}
              i.fas.fa-arrow-down
            .area-list-outer(:class='{open: isOpenAreaSelect}')
              ul.area-list.grid
                li.area-item.col-12_xs-6(v-for='source in mapConfig.sources')
                  label.area-label
                    input.area-input(
                      type='checkbox'
                      :value='source.title'
                      v-model='checkedArea'
                    )
                    | {{source.title}}
                    span
                      | {{source.updated_at}}
                    a(
                      v-if='source.link'
                      :href='source.link'
                      target='blank'
                    ) [{{t("PrintableMap.back_to_map")}}]
          .navigation
            .navigation-area.print-exclude
              .legend-navi-icon.active
                .legend-navi-button.print-button(@click="clickPrintButton()")
                  span.fa.fa-print(:alt='t("PrintableMap.print")')
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
                  :alt='t("PrintableMap.legend")'
                )
              .legend-list-outer
                SimpleBar(data-simplebar-auto-hide="false")
                  ul.legend-list
                    li.legend-item(
                      v-for='(setting, category) in mapConfig.layer_settings'
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
                    :alt='t("PrintableMap.show_all")'
                  )
          .list-outer(:class='{open: isOpenList}')
            section.list-section(
              v-for='group in displayMarkersGroupByCategory'
              :class='{show: isDisplayAllCategory || activeCategory === getMarkerCategoryText(group.category, locale)}'
            )
              h2.list-title(
                :style="{backgroundColor:mapConfig.layer_settings[group.category]?.color||group.markers[0]?.feature?.properties['marker-color']||'darkgreen'}"
              ) 
                span.list-title-mark
                  i(
                    :class="mapConfig.layer_settings[group.category]?.icon_class"
                  )
                span {{getMarkerCategoryText(mapConfig.layer_settings[group.category]?.name||group.category, locale)}}
              ul.list-items.grid-noGutter
                li.col-12_xs-6(v-for="marker in group.markers")
                  span.item-number {{inBoundsMarkers.indexOf(marker) +1}}
                  span.item-name {{getMarkerNameText(marker.feature.properties, locale)}}
            .list-section-none(
              v-if="isDisplayAllCategory && displayMarkersGroupByCategory.length === 0"
            )
              p
                | {{t("PrintableMap.no_point_in_map")}}
        .legend-close.print-exclude(
          :class='{open: isOpenList}'
          @click="isOpenList=false"
        )
          | {{t("PrintableMap.close_list")}}
          i.fas.fa-arrow-down
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getNowYMD } from '~/lib/displayHelper'
import MapHelper from '~/lib/MapHelper'
import { crc16 } from 'js-crc'
import ky from 'ky'
import SimpleBar from 'simplebar-vue'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'simplebar/dist/simplebar.min.css'

// Define props and emits
const props = defineProps<{
  mapConfig: MapPrint.MapConfig
}>()

const emit = defineEmits(['update:mapConfig', 'setLayerSettings', 'bounds-changed'])

// Use composables
const { t, locale } = useI18n()
// In Nuxt 3, we need to import useNuxtApp from nuxt/app
import { useNuxtApp } from 'nuxt/app'
const nuxtApp = useNuxtApp()
// Using any type to bypass type checking for now
const $maplibre = nuxtApp.$maplibre as any

// Template refs
const mapContainer = ref<HTMLElement | null>(null)

// State
const helper = new MapHelper()
const map = ref<any>(null)
const layers = ref<any[]>([])
const bounds = ref<any>(null)
const updated_at = ref<string | null>(null)
const previous_hash = ref<string>('')
const activeCategory = ref<string>('')
const checkedArea = ref<string[]>([])
const isOpenAreaSelect = ref<boolean>(false)
const isOpenList = ref<boolean>(false)
const isDisplayAllCategory = ref<boolean>(true)
const mapStyle = ref<string>('https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json')

// Compute locale-specific assets
const currentLocale = computed(() => locale.value === 'ja' ? 'ja' : 'en')
const legendMark = computed(() => `assets/images/fukidashi_obj_${currentLocale.value}.svg`)
const legendActive = computed(() => `assets/images/active_txt_${currentLocale.value}.svg`)

// Computed properties
const inBoundsMarkers = computed(() => {
  return layers.value
    .filter(l => l.source.show && checkedArea.value.includes(l.source.title))
    .map(l => l.markers).flat()
    .filter((marker: any) => {
      if (!bounds.value) return true;
      return helper.inBounds(marker.feature.geometry.coordinates, bounds.value);
    });
})

const displayMarkersGroupByCategory = computed(() => {
  const resultGroupBy = inBoundsMarkers.value.reduce((groups: any[], current: any) => {
    let group = groups.find((g) => g.category === current.category);
    if (!group) {
      group = {
        category: current.category,
        prop: current.category,
        markers: [],
      };
      groups.push(group);
    }
    group.markers.push(current);
    return groups;
  }, []);
  return resultGroupBy;
})

// Watch for changes in mapConfig
watch(() => props.mapConfig, (newConfig) => {
  // React to config changes if needed
}, { deep: true })

// Methods
const initializeMap = () => {
  if (!mapContainer.value) return;

  // Create a new map instance
  map.value = new $maplibre.Map({
    container: mapContainer.value,
    style: mapStyle.value,
    center: props.mapConfig.center,
    zoom: 15,
    preserveDrawingBuffer: true
  });

  // Add controls and event listeners
  map.value.on('load', () => {
    // Initialize map-related features after it loads
    const locationhash = window.location.hash.substr(1);
    let initbounds = helper.deserializeBounds(locationhash);

    if (initbounds !== undefined) {
      map.value.fitBounds(initbounds, { linear: false });
    } else {
      initbounds = helper.deserializeBounds(props.mapConfig.default_hash);
      if (initbounds !== undefined) {
        map.value.fitBounds(initbounds, { linear: false });
      }
    }

    map.value.on('moveend', emitBounds);
    emitBounds();
    map.value.addControl(new $maplibre.NavigationControl());
    map.value.addControl(new $maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Load markers
    loadMarkers();
  });
}

const loadMarkers = async () => {
  const area: string[] = [];
  const categories: Record<string, boolean> = {};

  for (const source of props.mapConfig.sources) {
    try {
      if (source.show) {
        area.push(source.title);
      }
      
      checkedArea.value = area;
      updated_at.value = getNowYMD(new Date());
      
      const data = await ky.get(source.url).text();
      // Convert the search key to proper type and handle undefined
      const searchKey = source.updated_search_key 
        ? { 
            type: source.updated_search_key as string, 
            pattern: '', 
            index: 0, 
            field: '' 
          } as import('~/lib/MapHelper').UpdatedSearchKey 
        : undefined;
        
      const [markers, updated_timestamp] = helper.parse(
        source.type,
        data,
        props.mapConfig.layer_settings,
        searchKey
      );
      
      markers.forEach((marker: any) => {
        categories[marker.category] = true;
      });
      
      source.updated_at = updated_timestamp;
      
      // Add markers to map
      layers.value.push({
        source,
        markers,
      });
    } catch (error) {
      console.error(`Error loading source: ${source.url}`, error);
    }
  }

  // Create layer settings for categories that don't have them
  Object.keys(categories).forEach((category) => {
    const categoryExists = props.mapConfig.layer_settings[category];
    
    if (!categoryExists) {
      let color = "#";
      color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 64).toString(16);
      color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 64).toString(16);
      color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 64).toString(16);

      let bg_color = "#";
      bg_color += ((parseInt(crc16(category.substr(0)), 16) % 32) + 128).toString(16);
      bg_color += ((parseInt(crc16(category.substr(1)), 16) % 32) + 128).toString(16);
      bg_color += ((parseInt(crc16(category.substr(2)), 16) % 32) + 128).toString(16);
      
      emit('setLayerSettings', {
        name: category,
        color,
        bg_color,
      });
    }
  });
}

const emitBounds = () => {
  if (!map.value) return;
  bounds.value = map.value.getBounds();
  setHash(bounds.value);
  emit('bounds-changed');
}

const setHash = (bounds: any) => {
  const s = helper.serializeBounds(bounds);
  const path = location.pathname;
  if (s !== previous_hash.value) {
    window.history.pushState("", "", path + "#" + s);
  }
  previous_hash.value = s;
}

const selectCategory = (category: string) => {
  activeCategory.value = category;
}

const clickPrintButton = () => {
  window.print();
}

const getMarkerCategoryText = (category: string | undefined, locale: string) => {
  if (category === undefined) {
    category = "未分類";
  }
  const key = "category." + category;
  const categoryText = t(key);
  if (categoryText !== key) {
    return categoryText;
  } else {
    return category;
  }
}

const getMarkerNameText = (markerProperties: any, locale: string) => {
  let name = markerProperties.name;
  if (markerProperties.hasOwnProperty("name:" + locale)) {
    name = markerProperties["name:" + locale];
  }
  return name;
}

// Lifecycle hooks
onMounted(() => {
  initializeMap();
})
</script>

<style lang="scss">
/* Map styles */
#map {
  height: 100%;
  width: 100%;
}

.map-outer {
  position: relative;
  width: 100%;
  height: 80vh;
}

.marker {
  width: 30px;
  height: 30px;
  cursor: pointer;
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.7;
    
    &.show {
      opacity: 1;
    }
  }
  
  .number {
    font-weight: bold;
    font-size: 12px;
  }
}

.legend-navi {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 100;
}

/* Print specific styles */
@media print {
  .print-exclude {
    display: none !important;
  }
}
</style>