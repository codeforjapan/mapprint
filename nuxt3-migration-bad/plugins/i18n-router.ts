/**
 * This plugin helps with i18n route handling
 */
import { defineNuxtPlugin } from 'nuxt/app'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineNuxtPlugin({
  name: 'i18n-router',
  enforce: 'pre', // Run before other plugins
  async setup(nuxtApp) {
    // Get the router instance
    const router = useRouter()
    const route = useRoute()
    const { locale } = useI18n()

    // Log the current route for debugging
    console.log('i18n-router plugin running:', { 
      path: route.path,
      locale: locale.value,
      fullPath: route.fullPath
    })

    // Provide localePath function
    const localePath = (path: string, localeCode?: string) => {
      const targetLocale = localeCode || locale.value
      
      // If default locale (ja), return path without prefix
      if (targetLocale === 'ja') {
        return path.startsWith('/') ? path : `/${path}`
      }
      
      // For other locales, add prefix
      const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path
      return `/${targetLocale}/${pathWithoutLeadingSlash}`
    }

    // Provide switchLocalePath function
    const switchLocalePath = (localeCode: string) => {
      // Get current route path without locale prefix
      let currentPath = route.path
      const currentLocale = locale.value
      
      // Remove current locale prefix if it exists
      if (currentLocale !== 'ja' && currentPath.startsWith(`/${currentLocale}/`)) {
        currentPath = currentPath.substring(currentLocale.length + 1)
      }
      
      // Return path with new locale
      return localePath(currentPath, localeCode)
    }

    // Return for type completion
    return {
      provide: {
        i18nRouter: {
          currentLocale: () => locale.value,
          localePath,
          switchLocalePath
        }
      }
    }
  }
})