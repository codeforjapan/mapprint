// Simplebar plugin for Nuxt 3
import { defineNuxtPlugin } from 'nuxt/app'
import SimpleBar from 'simplebar-vue'
import 'simplebar/dist/simplebar.min.css'

export default defineNuxtPlugin((nuxtApp: any) => {
  // Register SimpleBar component globally
  nuxtApp.vueApp.component('SimpleBar', SimpleBar)
})