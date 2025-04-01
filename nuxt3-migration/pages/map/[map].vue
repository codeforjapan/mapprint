<template lang="pug">
.layout-map
  #fb-root
  header.print-header
    h1.map-title
      NuxtLink(:to="locale === 'ja' ? '/' : '/' + locale")
        img.map-title-logo(src="~/assets/images/logo_l.png", width="140", height="36", :alt='t("common.title")')
      span(v-if="locale === 'ja' || !mapConfig.map_title_en") {{mapConfig.map_title}}
      span(v-else) {{mapConfig.map_title_en}}
    .qrcode-section
      span.qrcode-section-text {{t('Map.qrcode')}}
      vue-qrcode(class="qrcode-section-code" :value="currentURL" :options="{ width: 80 }" tag="svg")
  main.map-main
    PrintableMap(:mapConfig.sync="mapConfig" @setLayerSettings="updateLayerSettings")
    .print-date.print-only
      | {{printDate}}
  footer.map-footer
    .map-footer-button(@click='isOpenExplain = !isOpenExplain')
      i.fas.fa-info-circle.fa-lg
      span {{t('common.about')}}
    .map-footer-button
      i.fab.fa-github.fa-lg
      a(href="https://github.com/codeforjapan/mapprint", target="_blank", rel="noopener") {{t('common.contribute')}}
  Modal(v-model:isOpen='isOpenExplain' @closeModal="closeModalMethod")
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { getNowYMD } from '~/lib/displayHelper'
import type { MapPrint } from '~/types'

// Components
import Modal from '~/components/Modal.vue'
import PrintableMap from '~/components/PrintableMap.vue'

// Use composables
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

// State
const isOpenExplain = ref(false)
const mapConfig = ref({
  map_title: 'Loading...',
  map_title_en: '',
  sources: [],
  layer_settings: {},
  center: [0, 0],
  default_hash: ''
})

// Computed properties
const currentURL = computed(() => {
  // Get the current full URL
  return window.location.href
})

const printDate = computed(() => {
  return `このマップは ${getNowYMD(new Date())} に印刷しました。`
})

// Methods
const closeModalMethod = () => {
  isOpenExplain.value = false
}

const updateLayerSettings = (settings: any) => {
  const { name, color, bg_color, icon_class } = settings
  mapConfig.value.layer_settings[name] = {
    color,
    bg_color,
    icon_class: icon_class || ''
  }
}

// Load map configuration
onMounted(async () => {
  if (!route.params.map) {
    console.error('No map ID provided')
    router.push('/')
    return
  }

  try {
    // In a real app, you would load this from an API or dynamic import
    // For this example, we'll use placeholder data
    // const config = await import(`~/assets/config/${route.params.map}.json`)
    // mapConfig.value = config.default

    // Placeholder data
    mapConfig.value = {
      map_title: 'Example Map',
      map_title_en: 'Example Map',
      sources: [
        {
          title: 'Example Source',
          show: true,
          url: 'example.json',
          type: 'geojson',
          updated_at: '2023-01-01'
        }
      ],
      layer_settings: {},
      center: [139.7670, 35.6814], // Tokyo
      default_hash: ''
    }
  } catch (error) {
    console.error('Error loading map configuration', error)
  }
})

// SEO setup with useHead
useHead({
  title: computed(() => {
    return mapConfig.value.map_title || t('common.site_name')
  }),
  meta: [
    {
      name: 'description',
      content: computed(() => {
        return mapConfig.value.map_description || t('common.site_desc')
      })
    },
    {
      property: 'og:title',
      content: computed(() => {
        return mapConfig.value.map_title || t('common.site_name')
      })
    },
    {
      property: 'og:description',
      content: computed(() => {
        return mapConfig.value.map_description || t('common.site_desc')
      })
    },
    {
      property: 'og:image',
      content: computed(() => {
        return `https://kamimap.com/images/ogp_${route.params.map}.png`
      })
    }
  ],
  script: [
    {
      src: "https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v4.0",
      async: true,
      defer: true,
      crossorigin: "anonymous",
    },
    { src: "https://platform.twitter.com/widgets.js", async: true },
    {
      src: "https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js",
      async: true,
      defer: true,
    },
  ],
})
</script>

<style lang="scss">
/* Add your styles here */

/* Print-specific styles */
@media print {
  .print-only {
    display: block;
  }
  
  .print-header {
    position: relative;
    break-inside: avoid;
  }

  .map-footer {
    display: none;
  }
}
</style>