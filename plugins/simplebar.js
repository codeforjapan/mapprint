import simplebar from 'simplebar-vue'

export default defineNuxtPlugin((nuxtApp) => {
  // eslint-disable-next-line vue/multi-word-component-names
  nuxtApp.vueApp.component('Simplebar', simplebar)
})
