<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as MapLibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'simplebar/dist/simplebar.min.css';
import SimpleBar from 'simplebar-vue';
import ky from 'ky';
import { crc16 } from 'js-crc';
import MapHelper from '../lib/MapHelper';
import { getNowYMD } from '../lib/displayHelper';

// Props
const props = defineProps({
  mapConfig: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:mapConfig', 'bounds-changed', 'setLayerSettings']);

// I18n
const { t, locale } = useI18n();

// State
const layers = ref<any[]>([]);
const map = ref<any>(null);
const bounds = ref<MapLibre.LngLatBounds | null>(null);
const updated_at = ref<string | null>(null);
const previous_hash = ref<string>('');
const activeCategory = ref<string>('');
const checkedArea = ref<string[]>([]);
const isOpenAreaSelect = ref<boolean>(false);
const isOpenList = ref<boolean>(false);
const isDisplayAllCategory = ref<boolean>(true);
const mapStyle = ref<string>('https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json');

// Get the appropriate SVG based on locale
const localeForSvg = computed(() => locale.value === 'ja' ? 'ja' : 'en');
const legendMark = computed(() => `/assets/images/fukidashi_obj_${localeForSvg.value}.svg`);
const legendActive = computed(() => `/assets/images/active_txt_${localeForSvg.value}.svg`);

// Create helper
const helper = new MapHelper();

// Computed
const center = computed(() => props.mapConfig.center);

const inBoundsMarkers = computed(() => {
  return layers.value
    .filter(l => l.source.show && checkedArea.value.includes(l.source.title))
    .map(l => l.markers).flat()
    .filter((marker) => {
      if (!bounds.value) return true;
      return helper.inBounds(marker.feature.geometry.coordinates, bounds.value);
    });
});

const displayMarkersGroupByCategory = computed(() => {
  const resultGroupBy = inBoundsMarkers.value.reduce((groups, current) => {
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
});

const selectArea = computed({
  get() {
    return checkedArea.value;
  },
  set(value) {
    checkedArea.value = value;
  },
});

// Methods
const setLayerSettings = (name: string, color: string, bg_color: string, icon_class?: string) => {
  const newConfig = { ...props.mapConfig };
  newConfig.layer_settings[name] = {
    color,
    bg_color
  };
  if (icon_class) {
    newConfig.layer_settings[name].icon_class = icon_class;
  }
  emit('update:mapConfig', newConfig);
  return newConfig;
};

const load = () => {
  const locationhash = window.location.hash.substr(1);
  let initbounds = helper.deserializeBounds(locationhash);
  
  map.value = map.value.map;
  
  if (initbounds !== undefined) {
    map.value.fitBounds(initbounds, { linear: false });
  } else {
    initbounds = helper.deserializeBounds(props.mapConfig.default_hash);
    if (initbounds !== undefined) {
      map.value.fitBounds(initbounds, { linear: false });
    }
  }
  
  map.value.on("moveend", etmitBounds);
  etmitBounds();
  map.value.addControl(new MapLibre.NavigationControl());
};

const etmitBounds = () => {
  bounds.value = map.value.getBounds();
  setHash(bounds.value);
  emit("bounds-changed");
};

const setHash = (newBounds: MapLibre.LngLatBounds) => {
  const s = helper.serializeBounds(newBounds);
  const path = location.pathname;
  if (s !== previous_hash.value) {
    window.history.pushState("", "", path + "#" + s);
  }
  previous_hash.value = s;
};

const selectCategory = (category: string) => {
  activeCategory.value = category;
};

const clickPrintButton = () => {
  window.print();
};

const getMarkerCategoryText = (category?: string, currentLocale?: string) => {
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
};

const getMarkerNameText = (markerProperties: any, currentLocale?: string) => {
  let name = markerProperties.name;
  const localeProp = "name:" + (currentLocale || locale.value);
  if (markerProperties[localeProp]) {
    name = markerProperties[localeProp];
  }
  return name;
};

// Method to initialize map
const initializeMap = async () => {
  try {
    // Get the map container element
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Create the map instance
    const mapInstance = new MapLibre.Map({
      container: 'map',
      style: mapStyle.value,
      center: props.mapConfig.center || [135.5, 34.7],
      zoom: 15
    });

    // Save the map instance
    map.value = mapInstance;

    // Add navigation control
    mapInstance.addControl(new MapLibre.NavigationControl());

    // Setup event handlers once the map is loaded
    mapInstance.on('load', () => {
      // Check for hash in URL
      const locationhash = window.location.hash.substr(1);
      let initbounds = helper.deserializeBounds(locationhash);
      
      if (initbounds !== undefined) {
        mapInstance.fitBounds(initbounds, { linear: false });
      } else if (props.mapConfig.default_hash) {
        initbounds = helper.deserializeBounds(props.mapConfig.default_hash);
        if (initbounds !== undefined) {
          mapInstance.fitBounds(initbounds, { linear: false });
        }
      }

      // Set up the moveend event to update bounds
      mapInstance.on('moveend', etmitBounds);
      
      // Initial bounds calculation
      etmitBounds();
    });
  } catch (error) {
    console.error('Error initializing map:', error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize the map
  await initializeMap();
  
  // Initialize data
  const area: string[] = [];
  const categories: Record<string, boolean> = {};
  
  if (!props.mapConfig.sources || props.mapConfig.sources.length === 0) {
    return;
  }
  
  // Process each data source
  for (const source of props.mapConfig.sources) {
    try {
      if (source.show) {
        area.push(source.title);
      }
      
      checkedArea.value = area;
      updated_at.value = getNowYMD(new Date());
      
      const data = await ky.get(source.url).text();
      const [markers, source_updated_at] = helper.parse(
        source.type,
        data,
        props.mapConfig.layer_settings || {},
        source.updated_search_key
      );
      
      markers.forEach((marker: any) => {
        categories[marker.category] = true;
        
        // Create a marker element and add it to the map
        if (map.value && marker.feature.geometry.type === 'Point') {
          const coordinates = marker.feature.geometry.coordinates;
          
          const el = document.createElement('div');
          el.className = 'marker';
          el.innerHTML = `<span style="background-color: ${
            props.mapConfig.layer_settings?.[marker.category]?.color || 
            marker.feature.properties['marker-color'] || 
            'red'
          }"></span>`;
          
          // Add marker to map
          new MapLibre.Marker(el)
            .setLngLat(coordinates)
            .addTo(map.value);
        }
      });
      
      source.updated_at = source_updated_at;
      
      // Set layer settings for categories
      Object.keys(categories).forEach((category) => {
        if (!props.mapConfig.layer_settings || !props.mapConfig.layer_settings[category]) {
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
      
      // Add to layers
      layers.value.push({
        source,
        markers,
      });
    } catch (error) {
      console.error(`Error processing source '${source.title}':`, error);
    }
  }
});
</script>

<template>
  <div>
    <ClientOnly>
      <div v-if="layers.length || true">
        <div class="map-outer">
          <div id="map" ref="map_obj" class="map-container">
            <!-- Map will be initialized in onMounted -->
          </div>
        </div>

        <div class="legend-navi">
          <div class="area-select" :class="{ open: isOpenAreaSelect }">
            <div class="area-close" @click="isOpenAreaSelect = false">
              {{ t("PrintableMap.close_area_select") }}
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="area-list-outer" :class="{ open: isOpenAreaSelect }">
              <ul class="area-list grid">
                <li class="area-item col-12_xs-6" v-for="source in mapConfig.sources" :key="source.title">
                  <label class="area-label">
                    <input
                      class="area-input"
                      type="checkbox"
                      :value="source.title"
                      v-model="selectArea"
                    />
                    {{ source.title }}
                    <span>{{ source.updated_at }}</span>
                    <a
                      v-if="source.link"
                      :href="source.link"
                      target="blank"
                    >[{{ t("PrintableMap.back_to_map") }}]</a>
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <div class="navigation">
            <div class="navigation-area print-exclude">
              <div class="legend-navi-icon active">
                <div class="legend-navi-button print-button" @click="clickPrintButton()">
                  <span class="fa fa-print" :alt="t('PrintableMap.print')"></span>
                </div>
              </div>
            </div>
            <div class="navigation-area">
              <div class="area-select-button" @click="isOpenAreaSelect = !isOpenAreaSelect">
                <div class="area-array-outer">
                  <i class="fas fa-check-square"></i>
                  <div class="area-array">
                    {{ checkedArea.join(", ") }}
                  </div>
                </div>
                <div class="area-select-button-icon print-exclude">
                  <i class="fas fa-arrow-up"></i>
                </div>
              </div>
            </div>
            <div class="navigation-legend legend-navi-inner print-exclude">
              <div class="legend-navi-icon">
                <img
                  :src="legendMark"
                  width="60"
                  height="60"
                  :alt="t('PrintableMap.legend')"
                />
              </div>
              <div class="legend-list-outer">
                <SimpleBar data-simplebar-auto-hide="false">
                  <ul class="legend-list">
                    <li
                      class="legend-item"
                      v-for="(setting, category) in mapConfig.layer_settings"
                      v-if="displayMarkersGroupByCategory.some((elm) => elm.category === category)"
                      :key="category"
                    >
                      <span
                        class="legend-mark"
                        :style="{ backgroundColor: setting.color }"
                        @click="
                          selectCategory(category);
                          isOpenList = category;
                          isDisplayAllCategory = false;
                        "
                        :class="{ open: isDisplayAllCategory || activeCategory === category }"
                      >
                        <i :class="[setting.icon_class]"></i>
                      </span>
                    </li>
                  </ul>
                </SimpleBar>
              </div>
              <div
                class="legend-navi-icon"
                @click="
                  selectCategory('');
                  isDisplayAllCategory = true;
                  isOpenList = true;
                "
                :class="{ active: activeCategory }"
              >
                <div class="legend-navi-button">
                  <img
                    class="legend-navi-img"
                    :src="legendActive"
                    width="40"
                    height="40"
                    :alt="t('PrintableMap.show_all')"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="list-outer" :class="{ open: isOpenList }">
            <section
              class="list-section"
              v-for="group in displayMarkersGroupByCategory"
              :key="group.category"
              :class="{
                show:
                  isDisplayAllCategory ||
                  activeCategory === getMarkerCategoryText(group.category, locale),
              }"
            >
              <h2
                class="list-title"
                :style="{
                  backgroundColor:
                    mapConfig.layer_settings[group.category]?.color ||
                    group.markers[0]?.feature?.properties['marker-color'] ||
                    'darkgreen',
                }"
              >
                <span class="list-title-mark">
                  <i :class="mapConfig.layer_settings[group.category]?.icon_class"></i>
                </span>
                <span>{{
                  getMarkerCategoryText(
                    mapConfig.layer_settings[group.category]?.name || group.category,
                    locale
                  )
                }}</span>
              </h2>
              <ul class="list-items grid-noGutter">
                <li class="col-12_xs-6" v-for="marker in group.markers" :key="marker.feature.id">
                  <span class="item-number">{{ inBoundsMarkers.indexOf(marker) + 1 }}</span>
                  <span class="item-name">{{
                    getMarkerNameText(marker.feature.properties, locale)
                  }}</span>
                </li>
              </ul>
            </section>
            <div
              class="list-section-none"
              v-if="isDisplayAllCategory && displayMarkersGroupByCategory.length === 0"
            >
              <p>{{ t("PrintableMap.no_point_in_map") }}</p>
            </div>
          </div>
        </div>

        <div
          class="legend-close print-exclude"
          :class="{ open: isOpenList }"
          @click="isOpenList = false"
        >
          {{ t("PrintableMap.close_list") }}
          <i class="fas fa-arrow-down"></i>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style>
/* Map Styles */
.map-container {
  width: 100%;
  height: 500px;
  position: relative;
}

.map-outer {
  position: relative;
  margin-bottom: 1rem;
}

/* Marker Styles */
.marker {
  display: block;
  cursor: pointer;
}

.marker span {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  transition: all 0.2s ease;
}

.marker:hover span {
  transform: scale(1.2);
}

/* Legend Styles */
.legend-navi {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0.5rem;
}

.navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.navigation-area {
  display: flex;
  align-items: center;
}

.area-select {
  background-color: #f8f8f8;
  border-radius: 4px;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.area-select.open {
  max-height: 500px;
  margin-bottom: 1rem;
}

.area-close {
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #eee;
}

.area-list-outer {
  padding: 1rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.area-list-outer.open {
  max-height: 300px;
  overflow-y: auto;
}

.area-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.area-item {
  margin-bottom: 0.5rem;
}

.area-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.area-input {
  margin-right: 0.5rem;
}

/* Legend List Styles */
.legend-list-outer {
  max-height: 200px;
  overflow-y: auto;
  margin: 0 1rem;
}

.legend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}

.legend-item {
  margin: 0.25rem;
}

.legend-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.legend-mark.open {
  transform: scale(1.2);
}

.legend-mark i {
  color: white;
  font-size: 0.8rem;
}

/* Button Styles */
.print-button {
  cursor: pointer;
  padding: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.print-button:hover {
  background-color: #eee;
}

.area-select-button {
  cursor: pointer;
  padding: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.area-array-outer {
  display: flex;
  align-items: center;
}

.area-array {
  margin-left: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* List Styles */
.list-outer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.list-outer.open {
  max-height: 500px;
  overflow-y: auto;
  margin-top: 1rem;
}

.list-section {
  margin-bottom: 1rem;
  display: none;
}

.list-section.show {
  display: block;
}

.list-title {
  background-color: #333;
  color: white;
  padding: 0.5rem;
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.list-title-mark {
  margin-right: 0.5rem;
}

.list-items {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  background-color: #f8f8f8;
}

.list-items li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.item-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: #333;
  color: white;
  text-align: center;
  line-height: 24px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.legend-close {
  text-align: center;
  padding: 0.5rem;
  background-color: #f8f8f8;
  cursor: pointer;
  margin-top: 0.5rem;
  display: none;
}

.legend-close.open {
  display: block;
}

/* Print Styles */
@media print {
  .print-exclude {
    display: none !important;
  }
  
  .map-container {
    height: 70vh;
    page-break-after: always;
  }
  
  .list-outer {
    max-height: none !important;
    display: block !important;
  }
  
  .list-section {
    display: block !important;
    page-break-inside: avoid;
  }
}
</style>