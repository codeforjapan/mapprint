<template>
  <div class="map-page">
    <header class="header">
      <div class="header-inner">
        <div class="back-to-home">
          <NuxtLink to="/">
            <i class="fas fa-arrow-left"></i> Back
          </NuxtLink>
        </div>
        <div class="logo">
          <NuxtLink to="/">
            <Logo :alt="$t('common.title')" size="small" />
          </NuxtLink>
        </div>
        <div class="header-actions">
          <div class="language-switcher">
            <i class="fas fa-language"></i>
            <select v-model="locale" @change="switchLanguage">
              <option v-for="localeOption in availableLocales" :key="localeOption.code" :value="localeOption.code">
                {{ localeOption.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="map-title">
        <h1>{{ mapTitle }}</h1>
        <div class="map-date">{{ $t('map.printed_at') }} {{ updatedDate }}</div>
      </div>
      <div class="qrcode print-only">
        <QRCodeVue3 :value="currentUrl" :width="80" :height="80" />
      </div>
    </header>

    <main class="main-content">
      <div class="map-container">
        <ClientOnly>
          <div v-if="loading" class="loading-indicator">
            <p>{{ $t('map.loading') || 'Loading map...' }}</p>
          </div>
          
          <div v-else-if="error" class="error-indicator">
            <p>{{ $t('map.error_loading') || 'Error loading map data.' }}</p>
            <button @click="loadMapData" class="retry-button">
              {{ $t('common.retry') || 'Retry' }}
            </button>
          </div>
          
          <PrintableMap 
            v-else-if="mapConfig && mapConfig.center" 
            :mapConfig="mapConfig" 
            @update:mapConfig="updateMapConfig"
            @bounds-changed="handleBoundsChanged"
            @setLayerSettings="setLayerSettings" 
          />
          
          <div v-else class="not-found-indicator">
            <p>{{ $t('map.not_found') || 'Map not found.' }}</p>
            <NuxtLink to="/" class="back-link">
              {{ $t('map.back_to_maps') || 'Back to Maps' }}
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-logo">
        <Logo :alt="$t('common.title')" />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { getNowYMD } from '~/lib/displayHelper';
import type { MapConfig } from '@/types';
import { QRCodeVue3 } from 'vue3-qrcode';

// i18n setup
const { locale, t, locales } = useI18n();
const switchLocalePath = useLocalePath();
const router = useRouter();
const route = useRoute();

// Map data
const mapId = computed(() => {
  const id = route.params.map as string;
  // Normalize the ID by removing .json extension if present
  return id.replace('.json', '');
});
const mapConfig = ref<MapConfig | null>(null);
const updatedDate = ref('');
const loading = ref(false);
const error = ref<Error | null>(null);
const currentUrl = ref('');

// Format date for current locale
const formatDate = (date: Date) => {
  return getNowYMD(date, locale.value);
};

// Get the map title based on locale
const mapTitle = computed(() => {
  if (!mapConfig.value) return '';
  return locale.value === 'ja' ? 
    mapConfig.value.map_title : 
    mapConfig.value.map_title_en;
});

// Computed values for available locales
const availableLocales = computed(() => {
  return (locales.value || [])
    .filter(l => l.code !== locale.value)
    .map(l => ({ code: l.code, name: l.name }));
});

// Function to switch language
const switchLanguage = () => {
  const path = switchLocalePath(locale.value);
  router.push(path);
};

// Handler for updating map configuration
const updateMapConfig = (newConfig: any) => {
  mapConfig.value = newConfig;
};

// Handler for bounds changed event
const handleBoundsChanged = () => {
  // Update QR code with current URL including map bounds
  if (process.client) {
    currentUrl.value = window.location.href;
  }
};

// Handler for setting layer settings
const setLayerSettings = (settings: {
  name: string;
  color?: string;
  bg_color?: string;
  icon_class?: string;
  class?: string;
}) => {
  if (!mapConfig.value || !mapConfig.value.layer_settings) {
    if (mapConfig.value) {
      mapConfig.value.layer_settings = {};
    } else {
      return; // Can't update settings if mapConfig is null
    }
  }
  
  mapConfig.value.layer_settings[settings.name] = {
    color: settings.color,
    bg_color: settings.bg_color,
    icon_class: settings.icon_class || 'fas fa-map-marker',
    class: settings.class || '',
    name: settings.name
  };
};

// Update meta tags
useHead(() => ({
  title: mapConfig.value ? 
    `${mapTitle.value} - ${t('common.site_name')}` : 
    t('common.site_name'),
  meta: [
    { name: 'description', content: mapConfig.value?.map_description || t('common.site_desc') },
    { 
      property: 'og:image', 
      content: `https://kamimap.com/images/${mapConfig.value?.map_image || 'logo.png'}`
    },
    { property: 'og:title', content: mapTitle.value }
  ]
}));

// Get map config composable
const { loadMapConfig, loadMapConfigsList, getMapById } = useMapConfig();

// Function to load map data
const loadMapData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // First try to get the map directly by ID
    const directMap = getMapById(mapId.value);
    
    if (directMap) {
      // We found a direct match
      mapConfig.value = {
        ...directMap,
        map_id: directMap.map_id || mapId.value,
        // Set default center if not provided
        center: directMap.center || [135.5, 34.7],
        // Ensure layer_settings exists
        layer_settings: directMap.layer_settings || {},
      };
    } else {
      // Fall back to searching through the list
      const configsList = await loadMapConfigsList();
      
      if (!configsList || configsList.length === 0) {
        console.error('No map configurations available');
        throw new Error('No map configurations found');
      }
      
      // Try to find a config file that matches the map ID
      let configFile = null;
      
      // First strategy: Direct match with filename (without extension)
      configFile = configsList.find(filename => 
        filename.replace('.json', '') === mapId.value
      );
      
      // Second strategy: Filename includes the map ID
      if (!configFile) {
        configFile = configsList.find(filename => 
          filename.toLowerCase().includes(mapId.value.toLowerCase())
        );
      }
      
      // Fallback: Use the first config file
      if (!configFile) {
        console.warn(`No config found matching ID: ${mapId.value}, using first available config`);
        configFile = configsList[0];
      }
      
      // Load the specific map configuration
      const config = await loadMapConfig(configFile);
      
      if (!config) {
        throw new Error(`Failed to load map configuration from ${configFile}`);
      }
      
      // Extend the config with additional properties
      mapConfig.value = {
        ...config,
        map_id: config.map_id || mapId.value,
        // Set default center if not provided
        center: config.center || [135.5, 34.7],
        // Ensure layer_settings exists
        layer_settings: config.layer_settings || {},
      };
    }
    
    // Set current date
    updatedDate.value = formatDate(new Date());
    
    // Force refresh of page title
    nextTick(() => {
      document.title = `${mapTitle.value} - ${t('common.site_name')}`;
    });
    
  } catch (err) {
    console.error('Error loading map data:', err);
    error.value = err as Error;
    mapConfig.value = null;
  } finally {
    loading.value = false;
  }
};

// Load map data on component mount
onMounted(() => {
  loadMapData();
  
  // Set initial URL for QR code
  if (process.client) {
    currentUrl.value = window.location.href;
  }
});
</script>

<style scoped>
/* Most styles moved to global SASS files */

.loading-indicator,
.error-indicator,
.not-found-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
  background-color: #f5f5f5;
}

.retry-button,
.back-link {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}

.retry-button:hover,
.back-link:hover {
  background-color: #3367d6;
}

.language-switcher select {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  margin-left: 5px;
  cursor: pointer;
}

.back-to-home a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.back-to-home i {
  margin-right: 0.5rem;
}
</style>