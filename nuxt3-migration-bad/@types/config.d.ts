declare namespace MapPrint {
  interface LayerSetting {
    name: string;
    color: string;
    bg_color: string;
    icon_class?: string;
    class?: string;
  }

  interface Source {
    title: string;
    show: boolean;
    url: string;
    type: string;
    updated_at?: string;
    updated_search_key?: {
      type: string;
      pattern: string;
      index: number;
      field: string;
    };
    link?: string;
  }

  interface MapConfig {
    map_title: string;
    map_title_en?: string;
    map_description?: string;
    map_description_en?: string;
    map_image?: string;
    sources: Source[];
    layer_settings: Record<string, LayerSetting>;
    center: [number, number];
    default_hash: string;
  }
}

export = MapPrint;