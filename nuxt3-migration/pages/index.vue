<template>
  <div class="container">
    <header>
      <h1 class="title">
        <NuxtLink to="/">
          <img src="~/assets/images/logo.png" width="895" height="160" :alt="$t('common.title')" />
        </NuxtLink>
      </h1>
    </header>
    
    <main class="main">
      <div class="maps">
        <div v-if="loading" class="loading-state">
          <p>{{ $t('common.loading') || 'Loading maps...' }}</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <p>{{ $t('common.error_loading_maps') || 'Error loading maps.' }}</p>
          <button @click="loadAllMapConfigs" class="retry-button">
            {{ $t('common.retry') || 'Retry' }}
          </button>
        </div>
        
        <div v-else-if="maps.length === 0" class="empty-state">
          <p>{{ $t('common.no_maps_available') || 'No maps available.' }}</p>
        </div>
        
        <div v-else class="map-grid">
          <div v-for="(map, index) in maps" :key="index" class="map-item">
            <NuxtLink :to="`/map/${map.map_id}`" class="map-link">
              <div class="map-image">
                <img :src="`/images/${map.map_image || 'logo.png'}`" alt="" />
              </div>
              <div class="map-title">
                {{ getLocalizedTitle(map, locale) }}
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <div class="footer-item">
        <i class="fas fa-info-circle"></i>
        <span>{{ $t('common.about') }}</span>
      </div>
      <div class="footer-item">
        <i class="fas fa-github"></i>
        <a href="https://github.com/codeforjapan/mapprint">{{ $t('common.contribute') }}</a>
      </div>
      <!-- Language switcher -->
      <div class="footer-item language-switcher">
        <i class="fas fa-language"></i>
        <select v-model="locale" @change="switchLanguage">
          <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
            {{ locale.name }}
          </option>
        </select>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { MapConfig } from '@/types';

// i18n setup
const { locale, t, locales } = useI18n();
const switchLocalePath = useLocalePath();
const router = useRouter();

// Computed values for available locales
const availableLocales = computed(() => {
  return (locales.value || [])
    .filter(l => l.code !== locale.value)
    .map(l => ({ code: l.code, name: l.name }));
});

// Function to switch language
const switchLanguage = () => {
  // Get the path for the new locale
  const path = switchLocalePath(locale.value);
  // Navigate to the new path
  router.push(path);
};

// Use our composable to get map configuration data
const { loadAllMapConfigs, getLocalizedTitle } = useMapConfig();

// Reactive state
const loading = ref(false);
const error = ref<Error | null>(null);
const maps = ref<MapConfig[]>([]);

// Load map configurations on component mount
onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const configs = await loadAllMapConfigs();
    maps.value = configs;
    error.value = null;
  } catch (err) {
    console.error('Failed to load map configurations:', err);
    error.value = err as Error;
  } finally {
    loading.value = false;
  }
});

// Page title and meta setup
useHead({
  title: t('common.site_name'),
  meta: [
    { name: 'description', content: t('common.site_desc') }
  ]
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.map-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.map-item:hover {
  transform: translateY(-5px);
}

.map-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.map-image {
  height: 180px;
  overflow: hidden;
}

.map-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-title {
  padding: 1rem;
  font-weight: bold;
  text-align: center;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
}

.footer-item {
  margin: 0 1rem;
  display: flex;
  align-items: center;
}

.footer-item i {
  margin-right: 0.5rem;
}

.footer-item a {
  color: inherit;
  text-decoration: none;
}

.footer-item a:hover {
  text-decoration: underline;
}

.language-switcher select {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  margin-left: 5px;
  cursor: pointer;
}

.language-switcher select:focus {
  outline: none;
  border-color: #aaa;
}

/* Loading, error, and empty states */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #3367d6;
}
</style>