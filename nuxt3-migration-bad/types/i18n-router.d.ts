// Type definitions for i18n-router plugin
import { ComputedRef, Ref } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $i18nRouter: {
      currentLocale: () => string;
      localePath: (path: string, localeCode?: string) => string;
      switchLocalePath: (localeCode: string) => string;
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $i18nRouter: {
      currentLocale: () => string;
      localePath: (path: string, localeCode?: string) => string;
      switchLocalePath: (localeCode: string) => string;
    }
  }
}

export {}