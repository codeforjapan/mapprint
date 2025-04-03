import { ref } from 'vue';
import type { MapConfig } from '@/types';

// Import list.json which defines all available config files
import list from '../assets/config/list.json';

// Dynamic import function for Vite/Webpack
// This creates a dynamic import context for all JSON files in the config directory
// Use relative path to avoid issues with path resolution
const configImports = import.meta.glob('../assets/config/*.json', { eager: true });

// Log the imported files to help debugging
console.log('Config imports:', Object.keys(configImports));

// Create a map of all available config files
const configFiles: Record<string, MapConfig> = {};

// Populate configFiles object by parsing the import paths
Object.entries(configImports).forEach(([path, module]) => {
  // Extract filename from path (e.g. '/assets/config/2024-noto-earthquake.json' -> '2024-noto-earthquake.json')
  const filename = path.split('/').pop() || '';
  
  console.log(`Processing config file: ${filename}, from path: ${path}`);
  
  // Skip list.json since it's not a map config
  if (filename === 'list.json') {
    console.log('Skipping list.json');
    return;
  }
  
  // Add to our configs map with normalized map_id (without .json extension)
  const config = module.default || module as unknown as MapConfig;
  
  // Log config content for debugging
  console.log(`Config data for ${filename}:`, config);
  
  // Ensure map_id doesn't have .json extension (could have been set in the file)
  if (config.map_id) {
    console.log(`Original map_id: ${config.map_id}`);
    config.map_id = config.map_id.replace('.json', '');
  } else {
    // If map_id wasn't in the file, use the filename without extension
    config.map_id = filename.replace('.json', '');
    console.log(`Assigned map_id from filename: ${config.map_id}`);
  }
  
  configFiles[filename] = config;
  console.log(`Added config for ${filename} with map_id: ${config.map_id}`);
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
    console.log('Loading all map configs...');
    const configsList = await loadMapConfigsList();
    
    console.log(`Found ${configsList.length} config files in list:`, configsList);
    
    if (configsList.length === 0) {
      console.warn('No map configs found in list');
      return [];
    }
    
    try {
      // Convert list of filenames to actual config objects
      const results = configsList
        .map(filename => {
          const config = configFiles[filename];
          if (!config) {
            console.warn(`Config file not found for filename: ${filename}`);
          }
          return config;
        })
        .filter(Boolean);
      
      console.log(`Successfully loaded ${results.length} map configs`);
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
   * Get a specific map by its ID (with or without extension)
   */
  const getMapById = (id: string): MapConfig | undefined => {
    if (!id) {
      console.error('getMapById called with empty or undefined id');
      return undefined;
    }
    
    console.log(`Getting map by ID: ${id}`);
    console.log(`Available config files: ${Object.keys(configFiles).join(', ')}`);
    
    // Normalize the id by removing .json extension if present
    const normalizedId = id.replace('.json', '');
    console.log(`Normalized ID: ${normalizedId}`);
    
    // First try with .json extension in the filename
    const configWithExt = configFiles[`${normalizedId}.json`];
    if (configWithExt) {
      console.log(`Found config by exact filename match: ${normalizedId}.json`);
      return configWithExt;
    }
    
    // Then try to find by name match in filenames
    const matchingFile = Object.keys(configFiles).find(filename => 
      filename.replace('.json', '') === normalizedId
    );
    
    if (matchingFile) {
      console.log(`Found config by normalized filename match: ${matchingFile}`);
      return configFiles[matchingFile];
    }
    
    // Finally look through the actual config content for map_id
    const configByMapId = Object.values(configFiles).find(config => 
      config.map_id === normalizedId
    );
    
    if (configByMapId) {
      console.log(`Found config by map_id match: ${normalizedId}`);
      return configByMapId;
    }
    
    console.warn(`No map found with ID: ${id} (normalized: ${normalizedId})`);
    return undefined;
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