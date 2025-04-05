<template>
  <div class="language-switcher sub-button">
    <i class="fas fa-language fa-lg"></i>
    <select @change="handleLanguageChange">
      <option value="" disabled selected>
        Language: {{ locales.find(l => l.code === locale)?.name }}
      </option>
      <option v-for="localeOption in locales" :key="localeOption.code" :value="localeOption.code">
        {{ localeOption.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
// i18n setup
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

// Function to handle language change
const handleLanguageChange = (event: Event) => {
  if (!process.client) return;
  
  const select = event.target as HTMLSelectElement;
  const newLocale = select.value;
  
  // Only proceed with navigation if we actually want to change languages
  if (newLocale && newLocale !== locale.value) {
    // Get the path for the selected language using switchLocalePath
    const path = switchLocalePath(newLocale);
    
    if (path) {
      // Navigate to the new path
      window.location.href = path;
    }
  }
};
</script>

<style scoped>
.language-switcher {
  margin: 0 10px;
}

.language-switcher select {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 15px;
  font-size: 1em;
  width: auto;
}

@media print {
  .language-switcher {
    display: none;
  }
}
</style>