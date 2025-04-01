/**
 * This plugin helps with i18n route handling
 */
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

    // Return for type completion
    return {
      provide: {
        i18nRouter: {
          currentLocale: () => locale.value
        }
      }
    }
  }
})