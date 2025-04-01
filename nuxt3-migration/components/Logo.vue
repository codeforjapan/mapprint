<template>
  <div class="logo">
    <img src="~/assets/images/logo.png" :alt="alt" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  alt: {
    type: String,
    default: 'Logo'
  }
});
</script>

<style scoped>
.logo {
  display: inline-block;
  max-width: 100%;
}

.logo img {
  max-width: 100%;
  height: auto;
}
</style>