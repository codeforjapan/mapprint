// Maplibre plugin for Nuxt 3
import { defineNuxtPlugin } from '#app'
import MapLibre from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Make MapLibre available in the app
  nuxtApp.provide('maplibre', MapLibre)
  
  // Create component initializer for map components
  // Will be used in the PrintableMap component
  return {
    provide: {
      maplibre: MapLibre
    }
  }
})