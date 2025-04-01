/// <reference path="../@types/config.d.ts" />
/// <reference path="./i18n-router.d.ts" />

// Re-export the MapPrint namespace for global use
import type { MapPrint } from '../@types/config.d.ts';
export type { MapPrint };

// Declare global namespace to ensure it's available across the app
declare global {
  namespace MapPrint {
    export interface Config {
      map_settings: MapSetting[];
    }
    
    export interface MapSetting {
      map_id: string;
      map_title: string;
      map_description: string;
      data_url: string;
      type: string;
      default_hash?: string;
      layer_settings: LayerSetting[] | undefined | null;
    }
    
    export interface LayerSetting {
      name: string;
      color: string | undefined;
      bg_color: string | undefined;
      icon_class: string | undefined;
      class: string | undefined;
    }
    
    export interface MapConfig {
      map_title: string;
      map_title_en?: string;
      map_description?: string;
      sources: MapSource[];
      layer_settings: Record<string, any>;
      center: [number, number];
      default_hash: string;
    }
    
    export interface MapSource {
      title: string;
      show: boolean;
      url: string;
      type: string;
      updated_at?: string;
      updated_search_key?: string;
      link?: string;
    }
  }
}