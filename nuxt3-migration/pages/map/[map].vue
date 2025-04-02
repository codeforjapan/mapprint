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
            <Logo :alt="$t('common.title')" />
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
    </header>

    <main class="main-content">
      <div class="map-container">
        <ClientOnly>
          <PrintableMap 
            v-if="mapConfig && mapConfig.center" 
            :mapConfig="mapConfig" 
            @update:mapConfig="updateMapConfig"
            @bounds-changed="handleBoundsChanged"
            @setLayerSettings="setLayerSettings" 
          />
          <div v-else class="loading-indicator">
            <p>{{ $t('map.loading') || 'Loading map...' }}</p>
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
import { ref, computed, onMounted } from 'vue';
import { getNowYMD } from '~/lib/displayHelper';

// i18n setup
const { locale, t, locales } = useI18n();
const switchLocalePath = useLocalePath();
const router = useRouter();
const route = useRoute();

// Map data
const mapId = computed(() => route.params.map as string);
const mapConfig = ref<any>(null);
const updatedDate = ref('');

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
  // Update any UI elements that depend on the map bounds
};

// Handler for setting layer settings
const setLayerSettings = (settings: any) => {
  if (!mapConfig.value.layer_settings) {
    mapConfig.value.layer_settings = {};
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

// Load map data
onMounted(async () => {
  try {
    // In a real application, we'd fetch this from an API or data file
    // For now, we'll create mock data
    mapConfig.value = {
      map_id: mapId.value,
      map_title: 'サンプルマップ',
      map_title_en: 'Sample Map',
      map_description: 'サンプルマップの説明',
      map_description_en: 'Sample map description',
      map_image: 'logo.png',
      center: [135.5, 34.7],
      default_hash: '34.7,135.5-34.8,135.6',
      layer_settings: {},
      sources: [
        {
          title: 'Sample Data',
          url: '/data/sample.geojson',
          type: 'geojson',
          show: true
        }
      ]
    };
    
    // Set current date
    updatedDate.value = formatDate(new Date());
  } catch (error) {
    console.error('Error loading map data:', error);
  }
});
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-title {
  text-align: center;
  margin: 1rem 0;
}

.map-date {
  font-size: 0.8rem;
  color: #666;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.map-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 500px;
  position: relative;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  background-color: #f5f5f5;
}

.footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #eee;
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

@media print {
  .back-to-home,
  .header-actions {
    display: none;
  }
}
</style>