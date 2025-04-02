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

export {}