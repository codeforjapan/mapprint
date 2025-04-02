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

// Lifecycle hooks
onMounted(() => {
  const area: string[] = [];
  const categories: Record<string, boolean> = {};
  
  props.mapConfig.sources.forEach((source: any) => {
    (async () => {
      if (source.show) {
        area.push(source.title);
      }
      
      checkedArea.value = area;
      updated_at.value = getNowYMD(new Date());
      
      const data = await ky.get(source.url).text();
      const [markers, source_updated_at] = helper.parse(
        source.type,
        data,
        props.mapConfig.layer_settings,
        source.updated_search_key
      );
      
      markers.forEach((marker: any) => {
        categories[marker.category] = true;
      });
      
      source.updated_at = source_updated_at;
      
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
      
      layers.value.push({
        source,
        markers,
      });
    })();
  });
});
</script>

<template>
  <div>
    <ClientOnly>
      <div v-if="layers.length">
        <div class="map-outer">
          <!-- Replace MglMap with appropriate Nuxt 3 MapLibre component -->
          <div id="map" ref="map_obj" class="map-container">
            <!-- Map will be initialized here -->
          </div>

          <!-- Markers can be added using the MapLibre API -->
          <div v-for="(marker, index) in inBoundsMarkers" :key="index" class="marker-container">
            <!-- Marker elements will be created in JavaScript -->
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
/* Styles need to be added separately as they would be quite extensive */
</style>