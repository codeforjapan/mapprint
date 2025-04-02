<script setup lang="ts">
defineProps({
  alt: {
    type: String,
    default: 'Logo'
  }
});
</script>

<template>
  <img src="/images/logo.png" :alt="alt">
</template>

<style scoped>
img {
  max-width: 100%;
}
</style>