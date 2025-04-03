<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import * as MapLibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'simplebar/dist/simplebar.min.css';
import SimpleBar from 'simplebar-vue';
import ky from 'ky';
import { crc16 } from 'js-crc';
import MapHelper from '@/lib/MapHelper';
import { getNowYMD } from '@/lib/displayHelper';

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
const mapLoading = ref<boolean>(true); // Track map loading state
const mapMarkers = ref<{marker: MapLibre.Marker, category: string, element: HTMLElement}[]>([]); // Store markers for reactive updates

// Get the appropriate SVG based on locale
const localeForSvg = computed(() => locale.value === 'ja' ? 'ja' : 'en');
// Use runtime config for assets in Nuxt 3
const legendMark = computed(() => `/images/fukidashi_obj_${localeForSvg.value}.svg`);
const legendActive = computed(() => `/images/active_txt_${localeForSvg.value}.svg`);

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

// This function is no longer needed as it's replaced by initializeMap
// Keeping as a reference for now, but not using it

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
  
  // Open the list when a category is selected
  isOpenList.value = true;
  
  // Update marker visibility based on selected category
  updateMarkerVisibility();
};

// Update marker visibility when category changes
const updateMarkerVisibility = () => {
  mapMarkers.value.forEach(({ marker, category, element }) => {
    const span = element.querySelector('span');
    
    if (span) {
      if (isDisplayAllCategory.value || activeCategory.value === category) {
        span.classList.add('show');
      } else {
        span.classList.remove('show');
      }
    }
  });
};

// Helper function to add a marker to the map
const addMarkerToMap = (marker: any, index: number) => {
  try {
    if (!map.value || !marker.feature.geometry || marker.feature.geometry.type !== 'Point') {
      return;
    }
    
    // Ensure coordinates are valid
    const coordinates = marker.feature.geometry.coordinates;
    if (!coordinates || coordinates.length < 2) {
      console.error('Invalid coordinates for marker:', marker);
      return;
    }
    
    // Create marker element with number
    const el = document.createElement('div');
    el.className = 'marker';
    
    // Set marker's color based on category
    const bgColor = props.mapConfig.layer_settings?.[marker.category]?.bg_color || '#808080';
    const color = props.mapConfig.layer_settings?.[marker.category]?.color || 
                  marker.feature.properties?.['marker-color'] || 
                  'red';
    const iconClass = props.mapConfig.layer_settings?.[marker.category]?.icon_class || '';
    
    // Create marker content with icon and number
    el.innerHTML = `
      <span style="background-color: ${color}" 
            class="${isDisplayAllCategory.value || activeCategory.value === marker.category ? 'show' : ''}">
        <i class="${iconClass}" style="background-color: ${color}; display: ${iconClass ? 'inline' : 'none'}"></i>
        <b class="number" style="background: ${bgColor}">${index + 1}</b>
      </span>
    `;
    
    // Create popup content
    const popupContent = document.createElement('div');
    const markerName = marker.feature.properties ? getMarkerNameText(marker.feature.properties, locale.value) : '';
    const description = marker.feature.properties?.description || '';
    
    popupContent.innerHTML = `
      <div>
        <div class="popup-type">
          <i class="${props.mapConfig.layer_settings?.[marker.category]?.icon_class || ''}" 
             style="background-color: ${props.mapConfig.layer_settings?.[marker.category]?.color || 'red'}"></i>
          <span class="popup-poi-type">
            ${getMarkerCategoryText(props.mapConfig.layer_settings?.[marker.category]?.name || marker.category, locale.value)}
          </span>
        </div>
        <p>${t('PrintableMap.name')} ${markerName}</p>
        <div class="popup-detail-content">
          <p>${description}</p>
        </div>
      </div>
    `;
    
    // Create popup
    const popup = new MapLibre.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: true
    }).setDOMContent(popupContent);
    
    // Add marker to map with popup
    const mapMarker = new MapLibre.Marker({
      element: el,
      anchor: 'top-left' // Match the anchor setting from Nuxt 2 version
    })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map.value);
    
    // Store reference to the marker and its category for reactive updates
    mapMarkers.value.push({
      marker: mapMarker,
      category: marker.category,
      element: el
    });
    
    return mapMarker;
  } catch (error) {
    console.error('Error adding marker to map:', error);
    return null;
  }
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

// Watch for changes to isDisplayAllCategory and activeCategory
watch([isDisplayAllCategory, activeCategory], () => {
  updateMarkerVisibility();
});

// Watch for changes to checkedArea (selected layers)
watch(checkedArea, () => {
  updateVisibleMarkers();
});

// Update marker visibility based on selected layers
const updateVisibleMarkers = () => {
  // If map is not initialized, do nothing
  if (!map.value) return;
  
  // First remove all markers from map
  mapMarkers.value.forEach(({ marker }) => {
    marker.remove();
  });
  
  // Clear markers array
  mapMarkers.value = [];
  
  // Re-add markers that should be visible
  const visibleMarkers = inBoundsMarkers.value;
  visibleMarkers.forEach((marker, index) => {
    addMarkerToMap(marker, index);
  });
};

// Method to initialize map
const initializeMap = async () => {
  try {
    console.log('Initializing map with center:', props.mapConfig.center);
    
    // Wait for DOM to be ready
    await nextTick();
    
    // Get the map container element
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    console.log('Creating MapLibre map instance');
    
    // Create the map instance
    const mapInstance = new MapLibre.Map({
      container: 'map',
      style: mapStyle.value,
      center: props.mapConfig.center || [135.5, 34.7], // Default center if not provided
      zoom: props.mapConfig.initial_zoom || 15
    });
    
    // Save the map instance
    map.value = mapInstance;
    
    console.log('Map instance created');
    
    // Setup event handlers once the map is loaded
    mapInstance.on('load', () => {
      console.log('Map loaded event fired');
      
      // Update loading state
      mapLoading.value = false;
      
      // Add navigation control
      mapInstance.addControl(new MapLibre.NavigationControl());
      
      // Add geolocation control
      mapInstance.addControl(
        new MapLibre.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserLocation: true
        }),
        'top-right'
      );
      
      // Check for hash in URL
      const locationhash = window.location.hash.substr(1);
      let initbounds = helper.deserializeBounds(locationhash);
      
      if (initbounds !== undefined) {
        console.log('Fitting to bounds from URL hash');
        mapInstance.fitBounds(initbounds, { linear: false });
      } else if (props.mapConfig.default_hash) {
        console.log('Fitting to default bounds from config');
        initbounds = helper.deserializeBounds(props.mapConfig.default_hash);
        if (initbounds !== undefined) {
          mapInstance.fitBounds(initbounds, { linear: false });
        }
      }
      
      // Set up the moveend event to update bounds
      mapInstance.on('moveend', () => {
        etmitBounds();
        // Update markers when the map bounds change
        updateVisibleMarkers();
      });
      
      // Initial bounds calculation
      bounds.value = mapInstance.getBounds();
      setHash(bounds.value);
      emit("bounds-changed");
      
      console.log('Map initialization complete');
    });
    
    // Handle errors
    mapInstance.on('error', (e) => {
      console.error('MapLibre error:', e);
    });
    
    return mapInstance;
  } catch (error) {
    console.error('Error initializing map:', error);
    throw error;
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    console.log('PrintableMap component mounted');
    
    // Initialize the map
    try {
      await initializeMap();
      console.log('Map initialized successfully');
    } catch (mapError) {
      console.error('Failed to initialize map:', mapError);
      // We'll still try to proceed, even if map initialization failed
    }
    
    // Wait for map to fully initialize
    await nextTick();
    
    console.log('Map initialized, processing data sources');
    
    // Initialize data
    const area: string[] = [];
    const categories: Record<string, boolean> = {};
    
    if (!props.mapConfig.sources || props.mapConfig.sources.length === 0) {
      console.warn('No sources defined in map config');
      // Don't return early - still keep the map displaying
      // We just won't have any markers to show
    }
    
    // Process each data source
    for (const source of props.mapConfig.sources) {
      try {
        console.log(`Processing source: ${source.id}`);
        
        if (source.show) {
          area.push(source.title);
        }
        
        checkedArea.value = area;
        updated_at.value = getNowYMD(new Date());
        
        console.log(`Fetching data from: ${source.url}`);
        const data = await ky.get(source.url).text();
        console.log(`Data fetched, parsing as ${source.type}`);
        
        const [markers, source_updated_at] = helper.parse(
          source.type,
          data,
          props.mapConfig.layer_settings || {},
          source.updated_search_key
        );
        
        console.log(`Parsed ${markers.length} markers`);
        
        // First register all categories from the markers
        markers.forEach((marker: any) => {
          categories[marker.category] = true;
        });
        
        // Then add all markers
        markers.forEach((marker: any, index: number) => {
          try {
            if (map.value && map.value.loaded) {
              addMarkerToMap(marker, index);
            }
          } catch (markerError) {
            console.error('Error processing marker:', markerError);
          }
        });
        
        source.updated_at = source_updated_at;
        
        // Set layer settings for categories
        Object.keys(categories).forEach((category) => {
          if (!props.mapConfig.layer_settings || !props.mapConfig.layer_settings[category]) {
            let color = "#";
            color += ((parseInt(crc16(category.substring(0, 1)), 16) % 32) + 64).toString(16);
            color += ((parseInt(crc16(category.substring(1, 2)), 16) % 32) + 64).toString(16);
            color += ((parseInt(crc16(category.substring(2, 3)), 16) % 32) + 64).toString(16);
            
            let bg_color = "#";
            bg_color += ((parseInt(crc16(category.substring(0, 1)), 16) % 32) + 128).toString(16);
            bg_color += ((parseInt(crc16(category.substring(1, 2)), 16) % 32) + 128).toString(16);
            bg_color += ((parseInt(crc16(category.substring(2, 3)), 16) % 32) + 128).toString(16);
            
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
  } catch (error) {
    console.error('Error in PrintableMap onMounted:', error);
  }
});
</script>

<template>
  <div>
    <ClientOnly>
      <div>
        <div class="map-outer">
          <div id="map" ref="map_obj" class="map-container">
            <!-- Map will be initialized in onMounted -->
          </div>
          
          <!-- Loading indicator -->
          <div v-if="mapLoading" class="map-loading">
            <div class="loading-spinner"></div>
            <p>{{ t('PrintableMap.loading') || 'Loading map...' }}</p>
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
              <!-- List is always visible now -->
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
            <h3 class="list-header">{{ t('PrintableMap.poi_list') || 'Points of Interest in this area' }}</h3>
            <section
              class="list-section"
              v-for="group in displayMarkersGroupByCategory"
              :key="group.category"
              :class="{
                show: true
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

        <!-- List is always visible now, no need for close button -->
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

/* Loading indicator */
.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  position: relative;
}

.marker span.show {
  transform: scale(1.2);
}

.marker:hover span {
  transform: scale(1.2);
}

.marker span i {
  font-size: 12px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.marker span .number {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 18px;
  height: 18px;
  font-size: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Popup Styles */
.maplibregl-popup-content {
  padding: 10px;
  border-radius: 4px;
  max-width: 250px;
}

.popup-type {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.popup-type i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
  font-size: 10px;
}

.popup-poi-type {
  font-weight: bold;
}

.popup-detail-content {
  font-size: 13px;
  margin-top: 8px;
  max-height: 150px;
  overflow-y: auto;
}

/* Legend Styles */
.legend-navi {
  position: relative;
  z-index: 10;
  width: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0.5rem;
}

.legend-navi-inner {
  display: flex;
  align-items: center;
}

.legend-navi-icon {
  flex: 0 0 3.5em;
  padding: 0.3em;
  opacity: 0.5;
  cursor: auto;
}

.legend-navi-icon.active {
  opacity: 1;
  cursor: pointer;
}

.legend-navi-button {
  width: 2.75rem;
  height: 2.75rem;
  line-height: 2.75rem;
  text-align: center;
  border-radius: 5px;
  box-shadow: 2px 2px 4px #ccc;
}

.legend-navi-img {
  padding: 3px;
  vertical-align: middle;
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
  flex: 1 1 auto;
}

.legend-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0.3em;
  margin: 0.5em 0;
  list-style: none;
}

.legend-item {
  margin-right: 0.5em;
  flex: 0 0 auto;
}

.legend-mark {
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  line-height: 2.75rem;
  text-align: center;
  border-radius: 50%;
  box-shadow: 2px 2px 2px rgba(128, 128, 128, 0.5);
  cursor: pointer;
}

.legend-mark:not(.open) {
  opacity: 0.5;
}

.legend-mark.open {
  opacity: 1;
}

.legend-mark i {
  color: white;
  font-size: 1.25em;
  vertical-align: middle;
}

/* Button Styles */
.print-button {
  cursor: pointer;
  width: 2.75rem;
  height: 2.75rem;
  line-height: 2.75rem;
  text-align: center;
  border-radius: 5px;
  box-shadow: 2px 2px 4px #ccc;
  background-color: #f8f8f8;
  transition: background-color 0.2s ease;
}

.print-button:hover, .list-button:hover {
  background-color: #eee;
}

.ml-2 {
  margin-left: 0.5rem;
}

.list-button {
  cursor: pointer;
  width: 2.75rem;
  height: 2.75rem;
  line-height: 2.75rem;
  text-align: center;
  border-radius: 5px;
  box-shadow: 2px 2px 4px #ccc;
  background-color: #f8f8f8;
  transition: background-color 0.2s ease;
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
  max-height: none;
  overflow: visible;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0.5rem;
}

/* For backwards compatibility, keep the .open class */
.list-outer.open {
  max-height: none;
  overflow-y: visible;
  margin-top: 1rem;
}

.list-section {
  margin-bottom: 1rem;
  display: block; /* Show all sections by default */
}

/* For backwards compatibility */
.list-section.show {
  display: block;
}

.list-header {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
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
  display: none;
  position: absolute;
  z-index: 15;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 0.8rem;
  text-align: right;
  padding: 0.5em;
  cursor: pointer;
}

.legend-close.open {
  display: block;
}

@media (min-width: 768px) {
  .legend-close, .legend-close.open {
    display: none;
  }
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
    overflow: visible !important;
    margin-top: 1rem !important;
  }
  
  .list-section {
    display: block !important;
    page-break-inside: avoid;
  }
  
  /* Make all sections visible in print mode */
  .list-section.show {
    display: block !important;
  }
}
</style>