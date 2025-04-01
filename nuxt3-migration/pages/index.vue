<template lang="pug">
.layout-index
  #fb-root
  header
    h1.index-title
      NuxtLink(to='/')
        img(src="~/assets/images/logo.png" width="895" height="160" :alt='t("common.title")')
  main.index-main
    ul.index-list.grid-center-equalHeight
      li.col-12_xs-6_lg-4(v-for='(map, index) in maps')
        .index-item
          .index-item-inner
            NuxtLink(:to="localePath('/map/' + map.map_id)" :key='index')
              .index-link-inner
                img(:src='"https://kamimap.com/images/" + (map.map_image ? map.map_image : "logo.png")' alt='')
                .index-item-title(v-if="locale === 'ja'")
                  span
                    | {{map.map_title}}
                .index-item-title(v-else)
                  span
                    | {{map.map_title_en}}
                  i.index-arrow-icon.fas.fa-long-arrow-alt-right
          .index-item-sns
            div
              div(class="fb-share-button" :data-href='"https://kamimap.com/map/" + map.map_id' data-layout="button" data-size="small")
                a(target="_blank" :href='"https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkamimap.com%2Fmap%2F" + map.map_id + "%2F&amp;src=sdkpreparse"' class="fb-xfbml-parse-ignore") {{t('common.share')}}
            div
              a(href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" :data-text='map.map_title + " - 地図情報を印刷できる「紙マップ」"' :data-url='"https://kamimap.com/map/" + map.map_id' data-show-count="false") Tweet
            div
              div(class="line-it-button" data-lang="ja" data-type="share-a" data-ver="3" :data-url='"https://kamimap.com/map/" + map.map_id' data-color="default" data-size="small" data-count="false" style="display: none;")
  footer.index-footer
    .sub-button(@click='isOpenExplain = !isOpenExplain')
      i.fas.fa-info-circle.fa-lg
      span
        | {{t('common.about')}}
    .sub-button
      i.fab.fa-github.fa-lg
      a(href="https://github.com/codeforjapan/mapprint") {{t('common.contribute')}}
  footer.index-footer
    .sub-button
      i.fas.fa-language.fa-lg
      select(@change="onLocaleChange($event)")
        option.language(disabled selected)
          | Language: {{currentLocaleName}}
        option(v-for="loc in availableLocales" :value="loc.code" :key="loc.code")
          | {{ loc.name }}
  Modal(v-model:isOpen='isOpenExplain' @closeModal="closeModalMethod")
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// Components
import Modal from '~/components/Modal.vue'

// Use composables
const { t, locale } = useI18n()
const router = useRouter()

// State
const isOpenExplain = ref(false)
const maps = ref([]) // This will be populated from your API or static files

// In Nuxt 3, we'll use async loading for the maps
// You may want to use useFetch or useAsyncData
// For now, we'll leave this as a placeholder
onMounted(async () => {
  try {
    // Example of how you might load config files in Nuxt 3
    // const mapList = await import('~/assets/config/list.json')
    // for (const name of mapList.default) {
    //   maps.value.push(await import(`~/assets/config/${name}`))
    // }
    
    // Placeholder data
    maps.value = [
      {
        map_id: 'example',
        map_title: '例マップ',
        map_title_en: 'Example Map',
        map_image: 'logo.png'
      }
    ]
  } catch (error) {
    console.error('Failed to load maps', error)
  }
})

// Computed properties
const availableLocales = computed(() => {
  // This will depend on your i18n configuration
  return [
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' }
  ]
})

const currentLocaleName = computed(() => {
  const found = availableLocales.value.find(l => l.code === locale.value)
  return found ? found.name : 'Unknown'
})

// Methods
const closeModalMethod = () => {
  isOpenExplain.value = false
}

const onLocaleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const newLocale = select.value
  // Change the locale
  locale.value = newLocale
  // You might also want to update the route to reflect the new locale
  // This depends on your i18n routing strategy
}

// SEO setup with useHead
useHead({
  title: computed(() => t('common.site_name')),
  meta: [
    { 
      name: 'description', 
      content: computed(() => t('common.site_desc')) 
    },
    { 
      property: 'og:site_name', 
      content: computed(() => t('common.site_name'))
    },
    { 
      property: 'og:title', 
      content: computed(() => t('common.site_name')) 
    },
    { 
      property: 'og:description', 
      content: computed(() => t('common.site_desc')) 
    },
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
</style>