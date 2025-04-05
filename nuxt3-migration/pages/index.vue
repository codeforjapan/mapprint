<template>
  <div class="layout-index">
    <div id="fb-root"></div>
    <!-- Debug element to show current breakpoint -->
    <ClientOnly>
      <div class="debug-grid"></div>
    </ClientOnly>
    <header>
      <h1 class="index-title">
        <NuxtLink to="/">
          <Logo :alt="$t('common.title')" size="large" />
        </NuxtLink>
      </h1>
    </header>
    
    <main class="index-main">
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
      
      <div v-else class="index-grid grid-noGutter grid-equalHeight">
        <div v-for="(map, index) in maps" :key="index" class="col-12_xs-6_lg-4" :id="`map-item-${index}`">
          <div class="index-item">
            <div class="index-item-inner">
              <NuxtLink :to="`/map/${map.map_id}`" :key="index">
                <div class="index-link-inner">
                  <img :src="`/images/${map.map_image || 'logo.png'}`" alt="" />
                  <div class="index-item-title">
                    <span>{{ getLocalizedTitle(map, locale) }}</span>
                    <i class="index-arrow-icon fas fa-long-arrow-alt-right"></i>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Style inspector for debugging -->
      <ClientOnly>
        <div v-if="maps.length > 0" class="style-inspector">
          <div class="style-info">
            <h4>Style Inspector</h4>
            <div v-if="computedStyles">
              <p>flex-basis: {{ computedStyles.flexBasis }}</p>
              <p>max-width: {{ computedStyles.maxWidth }}</p>
              <p>selector: {{ computedStyles.selector }}</p>
            </div>
            <button @click="inspectStyles">Inspect Item 0</button>
          </div>
        </div>
      </ClientOnly>
    </main>
    
    <footer class="index-footer">
      <div class="sub-button" @click="isOpenExplain = !isOpenExplain">
        <i class="fas fa-info-circle fa-lg"></i>
        <span>{{ $t('common.about') }}</span>
      </div>
      <div class="sub-button">
        <i class="fab fa-github fa-lg"></i>
        <a href="https://github.com/codeforjapan/mapprint">{{ $t('common.contribute') }}</a>
      </div>
    </footer>
    
    <footer class="index-footer">
      <div class="sub-button">
        <i class="fas fa-language fa-lg"></i>
        <select @change="$event => handleLanguageChange($event.target.value)">
          <option disabled selected>
            Language: {{ locales.find(l => l.code === locale)?.name }}
          </option>
          <option v-for="localeOption in locales" :key="localeOption.code" :value="localeOption.code">
            {{ localeOption.name }}
          </option>
        </select>
      </div>
    </footer>
    
    <Modal :isOpen="isOpenExplain" @closeModal="closeModalMethod" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Logo from '~/components/Logo.vue';
import Modal from '~/components/Modal.vue';
import type { MapConfig } from '@/types';

// i18n setup
const { locale, t, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath(); // Use the correct function for language switching

// Reactive state
const loading = ref(false);
const error = ref<Error | null>(null);
const maps = ref<MapConfig[]>([]);
const isOpenExplain = ref(false);

// Use our composable to get map configuration data
const { loadAllMapConfigs, getLocalizedTitle } = useMapConfig();

// Function to handle language change
const handleLanguageChange = (newLocale: string) => {
  if (!process.client || newLocale === locale.value) return;
  
  // Get the path for the selected language using switchLocalePath
  const path = switchLocalePath(newLocale);
  
  if (path) {
    // Navigate to the new path
    window.location.href = path;
  }
};

// Method to close modal
const closeModalMethod = () => {
  isOpenExplain.value = false;
};

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

// Add style inspector logic
const computedStyles = ref<{flexBasis: string, maxWidth: string, selector: string} | null>(null);

// Function to inspect computed styles of an element
const inspectStyles = () => {
  // In Nuxt 3, we should use the appropriate way to check for client-side
  if (typeof window === 'undefined') return;
  
  // Get the first map item
  const element = document.getElementById('map-item-0');
  
  if (element) {
    // Get computed styles
    const styles = window.getComputedStyle(element);
    
    // Extract the values we're interested in
    computedStyles.value = {
      flexBasis: styles.flexBasis,
      maxWidth: styles.maxWidth,
      selector: getAppliedSelector(element)
    };
  }
};

// Helper to find which selector was used to apply flex-basis
const getAppliedSelector = (element: HTMLElement) => {
  if (!element || typeof window === 'undefined') return 'Not found';
  
  // Try to detect what selector is being applied
  let result = [];
  
  // Check if element matches different possible selectors
  if (window.matchMedia('(min-width: 93em)').matches) {
    result.push('XL breakpoint active');
  }
  
  if (window.matchMedia('(min-width: 75em)').matches) {
    result.push('LG breakpoint active');
  }
  
  if (element.matches('.col-12_xs-6_lg-4')) {
    result.push('Has class col-12_xs-6_lg-4');
  }
  
  return result.join(', ');
};

// Page title and meta setup
useHead({
  title: t('common.site_name'),
  meta: [
    { name: 'description', content: t('common.site_desc') }
  ],
  script: [
    // Load social media scripts
    {
      src: "https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v4.0",
      async: true,
      defer: true,
      crossorigin: "anonymous",
    },
    { src: "https://platform.twitter.com/widgets.js", async: true },
    {
      src: "https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js",
      async: true,
      defer: true,
    },
  ],
});
</script>