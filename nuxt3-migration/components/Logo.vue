<script setup lang="ts">
defineProps({
  alt: {
    type: String,
    default: 'Logo'
  },
  size: {
    type: String,
    default: 'small' // 'small' or 'large'
  }
});
</script>

<template>
  <img 
    src="@/assets/images/logo.png" 
    :alt="alt" 
    :class="{ 'logo-small': size === 'small', 'logo-large': size === 'large' }"
  >
</template>

<style scoped>
img {
  max-width: 100%;
}

.logo-small {
  height: 32px;
}

.logo-large {
  width: 895px;
  height: 160px;
}
</style>