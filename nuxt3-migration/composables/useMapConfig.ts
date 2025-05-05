import { ref } from 'vue';
import type { MapConfig } from '@/types';

// Import list.json which defines all available config files
import list from '@/assets/config/list.json';

// Dynamic import function for Vite/Webpack
// This creates a dynamic import context for all JSON files in the config directory
const configImports = import.meta.glob('@/assets/config/*.json', { eager: true });

// Create a map of all available config files
const configFiles: Record<string, MapConfig> = {};

// Populate configFiles object by parsing the import paths
Object.entries(configImports).forEach(([path, module]) => {
  // Extract filename from path (e.g. '/assets/config/2024-noto-earthquake.json' -> '2024-noto-earthquake.json')
  const filename = path.split('/').pop() || '';
  
  // Skip list.json since it's not a map config
  if (filename === 'list.json') return;
  
  // Add to our configs map
  configFiles[filename] = module.default || module as unknown as MapConfig;
});

export const useMapConfig = () => {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const mapConfigsList = ref<string[]>(list);
  const mapConfigs = ref<MapConfig[]>([]);

  /**
   * Load the list of available map configurations
   */
  const loadMapConfigsList = async (): Promise<string[]> => {
    loading.value = true;
    error.value = null;
    
    try {
      // Using statically imported list
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
  const loadMapConfig = async (filename: string): Promise<MapConfig | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      // Get config directly from imported data
      const config = configFiles[filename];
      
      if (!config) {
        throw new Error(`Config file not found: ${filename}`);
      }
      
      return config;
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
  const loadAllMapConfigs = async (): Promise<MapConfig[]> => {
    const configsList = await loadMapConfigsList();
    
    if (configsList.length === 0) {
      return [];
    }
    
    try {
      // Convert list of filenames to actual config objects
      const results = configsList
        .map(filename => configFiles[filename])
        .filter(Boolean);
      
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
   * Get a specific map by its ID (without extension)
   */
  const getMapById = (id: string): MapConfig | undefined => {
    // First try with .json extension
    const configWithExt = configFiles[`${id}.json`];
    if (configWithExt) return configWithExt;
    
    // Then try to find by name match in filenames
    const matchingFile = Object.keys(configFiles).find(filename => 
      filename.replace('.json', '') === id
    );
    
    if (matchingFile) return configFiles[matchingFile];
    
    // Finally look through the actual config content for map_id
    return Object.values(configFiles).find(config => config.map_id === id);
  };

  /**
   * Get map title based on current locale
   */
  const getLocalizedTitle = (map: MapConfig | null | undefined, locale: string): string => {
    if (!map) return '';
    return locale === 'ja' ? map.map_title : (map.map_title_en || map.map_title);
  };

  /**
   * Get map description based on current locale
   */
  const getLocalizedDescription = (map: MapConfig | null | undefined, locale: string): string => {
    if (!map) return '';
    return locale === 'ja' ? 
      (map.map_description || '') : 
      (map.map_description_en || map.map_description || '');
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