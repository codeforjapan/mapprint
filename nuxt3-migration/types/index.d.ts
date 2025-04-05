import maplibregl from 'maplibre-gl'

declare module '#app' {
  interface NuxtApp {
    $maplibre: typeof maplibregl
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $maplibre: typeof maplibregl
  }
}

// Map Configuration
export interface MapConfig {
  map_title: string;
  map_title_en: string;
  map_description?: string;
  map_description_en?: string;
  map_id?: string;
  map_image?: string;
  center: [number, number]; // [longitude, latitude]
  initial_zoom?: number;
  max_zoom?: number;
  min_zoom?: number;
  layer_settings?: Record<string, LayerSetting>;
  sources?: Array<MapSource>;
  layers?: Array<MapLayer>;
  custom_layers?: Array<CustomLayer>;
}

// Layer setting
export interface LayerSetting {
  name: string;
  color?: string;
  bg_color?: string;
  icon_class?: string;
  class?: string;
}

// Map Source definition
export interface MapSource {
  id: string;
  type: 'geojson' | 'vector' | 'raster';
  url?: string;
  data?: any;
  tiles?: string[];
  maxzoom?: number;
  minzoom?: number;
  attribution?: string;
}

// Map Layer definition
export interface MapLayer {
  id: string;
  type: 'circle' | 'line' | 'fill' | 'symbol' | 'raster' | 'fill-extrusion' | 'heatmap' | 'hillshade' | 'background';
  source: string;
  source_layer?: string;
  layout?: any;
  paint?: any;
  filter?: any[];
  minzoom?: number;
  maxzoom?: number;
}

// Custom Layer (direct GeoJSON integration)
export interface CustomLayer {
  id: string;
  title: string;
  title_en?: string;
  geojson_url: string;
  filter_key?: string;
  filter_values?: string[];
  category_field?: string;
  color?: string;
  icon?: string;
  icon_size?: number;
  popup_template?: Record<string, string>;
}

// GeoJSON Feature with additional properties
export interface ExtendedFeature extends GeoJSON.Feature {
  properties: {
    name?: string;
    description?: string;
    category?: string;
    address?: string;
    [key: string]: any;
  };
}

// Marker with category information
export interface CategoryMarker {
  feature: ExtendedFeature;
  category: string;
}