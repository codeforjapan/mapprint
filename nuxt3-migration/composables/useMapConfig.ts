import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { MapPrint } from '~/types'

export const useMapConfig = (initialConfig?: MapPrint.MapConfig) => {
  const mapConfig: Ref<MapPrint.MapConfig> = ref(initialConfig || {
    map_title: '',
    map_title_en: '',
    sources: [],
    layer_settings: {},
    center: [0, 0],
    default_hash: ''
  })

  const updateLayerSettings = (name: string, color: string, bg_color: string, icon_class?: string) => {
    mapConfig.value.layer_settings[name] = {
      name,
      color,
      bg_color,
      icon_class
    }
  }

  const checkedSources = computed(() => {
    return mapConfig.value.sources.filter(source => source.show)
  })

  const loadMapConfig = async (mapId: string) => {
    try {
      // In a real implementation, you would load the config dynamically
      // For this example, we're simulating it
      console.log(`Loading map config for: ${mapId}`)
      
      // This would be replaced with actual data loading
      // const response = await fetch(`/api/map-config/${mapId}`)
      // mapConfig.value = await response.json()
      
      // For demonstration, we're returning a placeholder
      return true
    } catch (error) {
      console.error('Failed to load map config', error)
      return false
    }
  }

  return {
    mapConfig,
    updateLayerSettings,
    checkedSources,
    loadMapConfig
  }
}