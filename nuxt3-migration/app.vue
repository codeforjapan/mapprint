<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Add debug information in development mode -->
    <div v-if="isDev" class="debug-info">
      <pre>Current route: {{ route.path }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is the main application component for Nuxt 3
// It serves as the root component that wraps around all pages
const route = useRoute()
const isDev = process.env.NODE_ENV !== 'production'
</script>

<style>
/* Global styles can be added here */
.debug-info {
  position: fixed;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px;
  font-size: 12px;
  z-index: 9999;
  display: none; /* Hidden by default */
}

/* Show debug info only in development mode */
.dev-mode .debug-info {
  display: block;
}
</style>