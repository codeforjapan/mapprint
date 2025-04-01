import { defineNuxtPlugin } from '#app'
import SimpleBar from 'simplebar-vue'
import 'simplebar/dist/simplebar.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('SimpleBar', SimpleBar)
})