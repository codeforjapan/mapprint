import { defineNuxtPlugin } from '#app'
import maplibregl from 'maplibre-gl'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('maplibre', maplibregl)
})