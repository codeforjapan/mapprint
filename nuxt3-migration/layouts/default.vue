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

@media print {
  body {
    background-color: #fff;
    font-size: 14px;
  }
  
  .layout-container {
    margin: 0 auto;
    padding: 0;
    width: 100%;
  }
  
  /* Hide elements not needed in print */
  button, .print-exclude {
    display: none !important;
  }
}
</style>