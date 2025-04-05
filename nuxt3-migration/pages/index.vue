<template>
  <div class="container">
    <header>
      <h1 class="title">
        <NuxtLink to="/">
          <Logo :alt="$t('common.title')" size="large" />
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
import { onMounted, ref, computed } from 'vue';
import Logo from '~/components/Logo.vue';
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