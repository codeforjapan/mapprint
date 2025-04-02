<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isOpen', 'closeModal']);
const route = useRoute();
const { t, locale } = useI18n();

const mapConfig = ref(null);

onMounted(() => {
  // In Nuxt 3, dynamic imports are used instead of require
  if (route.params.map) {
    // Using dynamic import for the config
    import(`~/assets/config/${route.params.map}.json`)
      .then((module) => {
        mapConfig.value = module.default;
      })
      .catch((error) => {
        console.error('Failed to load map config:', error);
      });
  }
});

const handleClick = () => {
  emit('update:isOpen', false);
  emit('closeModal');
};
</script>

<template>
  <div>
    <div class="modal" :class="{ open: isOpen }">
      <p v-if="mapConfig">
        <span v-if="locale === 'ja' || !mapConfig.map_description_en">{{ mapConfig.map_description }}</span>
        <span v-else>{{ mapConfig.map_description_en }}</span>
      </p>
      <p>
        <!-- Remove this v-if conditional branching and just use the i18n tag when the translation is complete. -->
        <span v-if="locale === 'ja' || locale === 'en'">
          <i18n-t keypath="about.desc">
            <template #githubRepo>
              <a href="https://github.com/codeforjapan/mapprint">{{ t('about.github_repository') }}</a>
            </template>
          </i18n-t>
        </span>
        <span v-else>
          This site is open source. If you want to contribute to this project, please visit the
          <a href="https://github.com/codeforjapan/mapprint">Code for Japan's Github repository</a>.
          Everyone is welcome, and we especially invite those with JavaScript or Leaflet experience to join us.
        </span>
      </p>
      <div>
        <span class="modal-close" @click="handleClick">
          × close
        </span>
      </div>
    </div>
    <div class="modal-background" @click="handleClick" :class="{ open: isOpen }"></div>
  </div>
</template>

<style>
/* Add your styles here if needed */
</style>