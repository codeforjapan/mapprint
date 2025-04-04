<template>
  <div class="layout-map">
    <div class="layout-map-inner grid-noGutter">
      <main class="main col-12_md-6_xl-6">
        <div class="main-sheet">
          <header class="header">
            <div class="to-top">
              <NuxtLink to="/">
                <i class="far fa-arrow-alt-circle-left fa-2x"></i>
              </NuxtLink>
            </div>
            <div class="banner">
              <div class="logo print-exclude">
                <NuxtLink to="/">
                  <Logo :alt="$t('common.title')" />
                </NuxtLink>
              </div>
              <div class="sub-outer print-exclude">
                <div class="sub-button" @click="isOpenExplain = !isOpenExplain">
                  <i class="fas fa-info-circle fa-lg"></i>
                  <span>{{ $t('common.about') }}</span>
                </div>
                <div class="sub-button github-link">
                  <i class="fab fa-github fa-lg"></i>
                  <a href="https://github.com/codeforjapan/mapprint">{{ $t('common.contribute') }}</a>
                </div>
                <div class="sub-button">
                  <i class="fas fa-language fa-lg"></i>
                  <select v-model="locale" @change="switchLanguage">
                    <option disabled selected>
                      Language: {{ locales.find(l => l.code === locale)?.name }}
                    </option>
                    <option v-for="localeOption in availableLocales" :key="localeOption.code" :value="localeOption.code">
                      {{ localeOption.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="title-outer">
                <h1 class="title" v-if="mapConfig && locale === 'ja' && mapConfig.map_title">
                  {{ mapConfig.map_title }}
                </h1>
                <h1 class="title" v-else-if="mapConfig && mapConfig.map_title_en">
                  {{ mapConfig.map_title_en }}
                </h1>
                <h1 class="title" v-else>
                  {{ $t('common.site_name') }}
                </h1>
                <div class="datetime">
                  {{ $t('map.printed_at') }} {{ updatedDate }}
                </div>
              </div>
            </div>
            <div class="qrcode print-only">
              <!-- QR code canvas will be drawn here by script -->
              <div id="qrcode-container"></div>
            </div>
          </header>

          <div class="map-container">
            <ClientOnly>
              <div v-if="loading" class="loading-indicator">
                <p>{{ $t('map.loading') || 'Loading map...' }}</p>
              </div>
              
              <div v-else-if="error" class="error-indicator">
                <p>{{ $t('map.error_loading') || 'Error loading map data.' }}</p>
                <button @click="loadMapData" class="retry-button print-exclude">
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
                <NuxtLink to="/" class="back-link print-exclude">
                  {{ $t('map.back_to_maps') || 'Back to Maps' }}
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>
          
          <footer class="footer">
            <div class="footer-logo">
              <Logo :alt="$t('common.title')" />
            </div>
          </footer>
        </div>
      </main>

      <aside class="print-exclude col-12_md-6_xl-6">
        <div class="aside-inner">
          <div class="aside-grid">
            <div class="aside-item1">
              <h2 class="aside-title-sp">
                <NuxtLink to="/">
                  <img src="/images/sp_logo.png" width="607" height="452" :alt="$t('common.title')" />
                </NuxtLink>
              </h2>
              <h2 class="aside-title-pc">
                <NuxtLink to="/">
                  <Logo :alt="$t('common.title')" />
                </NuxtLink>
              </h2>
            </div>
            <div class="aside-item2">
              <p>{{ $t('map.desc_1') }}</p>
            </div>
            <div class="aside-item3">
              <div class="aside-item-illust1">
                <img src="/images/illust_1.png" width="360" height="450" alt="" />
              </div>
            </div>
            <div class="aside-item4">
              <p>
                {{ $t('map.desc_2') }}
                <br />
                {{ $t('map.desc_3') }}
              </p>
            </div>
            <div class="aside-item5">
              <p>
                {{ $t('map.desc_4') }}
                <br />
                {{ $t('map.desc_5') }}
              </p>
            </div>
            <div class="aside-item6">
              <div class="aside-item-illust2">
                <img src="/images/illust_2.png" width="640" height="435" alt="" />
              </div>
            </div>
            <div class="aside-item7">
              <p>
                {{ $t('map.desc_6') }}
                <br />
                {{ $t('map.desc_7') }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
    
    <Modal :isOpen="isOpenExplain" @closeModal="closeModalMethod" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUpdated, nextTick } from 'vue';
import { getNowYMD } from '~/lib/displayHelper';
import type { MapConfig } from '@/types';
import QRCode from 'qrcode';

// i18n setup
const { locale, t, locales } = useI18n();
const switchLocalePath = useLocalePath();
const router = useRouter();
const route = useRoute();

// Map data
const mapId = computed(() => route.params.map as string);
const mapConfig = ref<MapConfig | null>(null);
const updatedDate = ref('');
const loading = ref(false);
const error = ref<Error | null>(null);
const currentUrl = ref(''); // For QR code
const isOpenExplain = ref(false); // Modal state

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
  // Update the QR code when map bounds change
  generateQRCode();
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

// Generate QR Code with current URL
const generateQRCode = () => {
  if (process.client && document) {
    // Use the current URL
    currentUrl.value = window.location.href;
    
    // Get the QR code container
    const container = document.getElementById('qrcode-container');
    if (container) {
      // Clear any existing QR code
      container.innerHTML = '';
      
      // Generate the QR code and append to container
      QRCode.toCanvas(container, currentUrl.value, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000',
          light: '#fff'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      });
    }
  }
};

// Close modal method
const closeModalMethod = () => {
  isOpenExplain.value = false;
};

// Load map data on component mount
onMounted(() => {
  loadMapData();
  // Generate QR code after component is mounted
  nextTick(() => {
    generateQRCode();
  });
});

// Update QR code when component is updated
onUpdated(() => {
  // Generate QR code after component is updated
  nextTick(() => {
    generateQRCode();
  });
});
</script>

<style scoped>
/* Only QR code related styles kept in component */
.qrcode.print-only {
  display: none;
}

@media print {
  .qrcode.print-only {
    display: block;
    margin: 1rem 0;
    text-align: center;
  }
  
  #qrcode-container {
    display: inline-block;
  }
}

/* Loading/Error/Not-found states */
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
</style>