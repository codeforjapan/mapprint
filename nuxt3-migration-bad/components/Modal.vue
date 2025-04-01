<template lang="pug">
div
  .modal(:class='{open: isOpen}')
    p(v-if="mapConfig")
      span(v-if="locale === 'ja' || !mapConfig.map_description_en") {{mapConfig.map_description}}
      span(v-else) {{mapConfig.map_description_en}}
    p
      //- Remove this v-if conditional branching and just use the i18n tag when the translation is complete.
      span(v-if="locale === 'ja' || locale === 'en'")
        i18n(path="about.desc")
          template(#githubRepo)
            a(href="https://github.com/codeforjapan/mapprint") {{t('about.github_repository')}}
      span(v-else) 
        | This site is open source. If you want to contribute to this project, please visit the
        a(href="https://github.com/codeforjapan/mapprint") Code for Japan's Github repository
        | . Everyone is welcome, and we especially invite those with JavaScript or Leaflet experience to join us.
    div
      span.modal-close(@click='handleClick')
        | × close
  .modal-background(@click='handleClick' :class='{open: isOpen}')
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

// Define props and emits
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:isOpen', 'closeModal'])

// Get current route and i18n
const route = useRoute()
const { locale, t } = useI18n()

// In Nuxt 3, we use dynamic imports instead of require
const mapConfig = computed(() => {
  if (!route.params.map) return null
  
  // This would need to be adjusted for your actual data loading approach
  // For example, you might want to use useFetch or useAsyncData
  try {
    // To be implemented: Dynamic importing of config files
    return { 
      map_description: 'Map description', 
      map_description_en: 'Map description in English' 
    }
  } catch (e) {
    console.error('Failed to load map config', e)
    return null
  }
})

// Methods
const handleClick = () => {
  emit('update:isOpen', false)
  emit('closeModal')
}
</script>

<style lang="scss">
// Add your styles here if needed
</style>