import { ref, computed } from 'vue';
import { useAsyncData } from '#app';

export const useMapConfig = () => {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const mapConfigsList = ref<string[]>([]);
  const mapConfigs = ref<any[]>([]);

  /**
   * Load the list of available map configurations
   */
  const loadMapConfigsList = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // We use Nuxt's built-in $fetch which handles SSR properly
      const { data, error: fetchError } = await useAsyncData(
        'configList',
        () => $fetch('/config/list.json')
      );
      
      if (fetchError.value) {
        throw fetchError.value;
      }
      
      mapConfigsList.value = data.value || [];
      return mapConfigsList.value;
    } catch (err) {
      console.error('Error loading map configs list:', err);
      error.value = err as Error;
      mapConfigsList.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load a specific map configuration by filename
   */
  const loadMapConfig = async (filename: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // We use Nuxt's built-in $fetch which handles SSR properly
      const { data, error: fetchError } = await useAsyncData(
        `config-${filename}`,
        () => $fetch(`/config/${filename}`)
      );
      
      if (fetchError.value) {
        throw fetchError.value;
      }
      
      return data.value;
    } catch (err) {
      console.error(`Error loading map config ${filename}:`, err);
      error.value = err as Error;
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load all available map configurations
   */
  const loadAllMapConfigs = async () => {
    const configsList = await loadMapConfigsList();
    
    if (configsList.length === 0) {
      return [];
    }
    
    try {
      // Process each config file sequentially to avoid timeout issues
      const results = [];
      
      for (const filename of configsList) {
        const config = await loadMapConfig(filename);
        if (config) {
          results.push(config);
        }
      }
      
      mapConfigs.value = results;
      return results;
    } catch (err) {
      console.error('Error loading all map configs:', err);
      error.value = err as Error;
      mapConfigs.value = [];
      return [];
    }
  };

  /**
   * Get a specific map by its ID
   */
  const getMapById = (id: string) => {
    return mapConfigs.value.find(map => map.map_id === id);
  };

  /**
   * Get map title based on current locale
   */
  const getLocalizedTitle = (map: any, locale: string) => {
    if (!map) return '';
    return locale === 'ja' ? map.map_title : (map.map_title_en || map.map_title);
  };

  /**
   * Get map description based on current locale
   */
  const getLocalizedDescription = (map: any, locale: string) => {
    if (!map) return '';
    return locale === 'ja' ? 
      map.map_description : 
      (map.map_description_en || map.map_description);
  };

  return {
    loading,
    error,
    mapConfigsList,
    mapConfigs,
    loadMapConfigsList,
    loadMapConfig,
    loadAllMapConfigs,
    getMapById,
    getLocalizedTitle,
    getLocalizedDescription
  };
};