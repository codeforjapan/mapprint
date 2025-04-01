import { ref, computed } from 'vue';

export const useMapConfig = () => {
  // This would normally load from an API or config files
  const mapConfigs = ref([
    {
      map_id: 'sample-map',
      map_title: 'サンプルマップ',
      map_title_en: 'Sample Map',
      map_image: 'logo.png',
      map_description: 'サンプルマップの説明',
      map_description_en: 'Sample map description'
    }
  ]);

  // Get a specific map by ID
  const getMapById = (id: string) => {
    return mapConfigs.value.find(map => map.map_id === id);
  };

  // Get map title based on current locale
  const getLocalizedTitle = (map: any, locale: string) => {
    return locale === 'ja' ? map.map_title : map.map_title_en;
  };

  // Get map description based on current locale
  const getLocalizedDescription = (map: any, locale: string) => {
    return locale === 'ja' ? map.map_description : map.map_description_en;
  };

  return {
    mapConfigs,
    getMapById,
    getLocalizedTitle,
    getLocalizedDescription
  };
};