<template>
  <div class="layout-container">
    <slot />
  </div>
</template>

<style>
body {
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.layout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Print styles moved to _print.scss */
</style>