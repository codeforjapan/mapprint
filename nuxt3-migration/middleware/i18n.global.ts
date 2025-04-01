export default defineNuxtRouteMiddleware((to, from) => {
  console.log('Global i18n middleware running:', { to: to.path, from: from?.path })
  // No redirection needed as everything should be handled by the i18n module
})