# Migration Guide: Nuxt 2 to Nuxt 3

This document outlines the major changes and migration steps taken to upgrade the MapPrint application from Nuxt 2 (Vue 2) to Nuxt 3 (Vue 3).

## Major Changes

### Project Structure

- Directory structure follows Nuxt 3 conventions
- `static/` directory is now `public/`
- Auto-imports for composables and components
- TypeScript by default

### Vue 2 to Vue 3

- Options API → Composition API (using `<script setup>`)
- Global Vue instance methods → Nuxt plugins and composables
- Multiple root nodes now allowed in templates
- Lifecycle hooks renamed (eg. `beforeDestroy` → `beforeUnmount`)

### Nuxt Specific Changes

- `nuxt.config.js` → `nuxt.config.ts` with new configuration format
- `asyncData` and `fetch` → `useAsyncData` and `useFetch`
- `<nuxt />` → `<slot />`
- `<nuxt-link>` → `<NuxtLink>`
- `this.$nuxt` → various composables

### i18n Changes

- `nuxt-i18n` → `@nuxtjs/i18n` with Vue 3 compatibility
- `this.$i18n` → `useI18n()` composable
- Vue I18n configuration updated for Vue 3

### Other Package Updates

- Upgraded MapLibre GL to latest version
- Updated Vue QR code for Vue 3
- Switched to Vitest for testing
- TypeScript configuration upgraded

## Migration Steps

1. **Setup Nuxt 3 Project**: Created new Nuxt 3 project with TypeScript
2. **Component Migration**: 
   - Converted Options API to Composition API
   - Updated template syntax
   - Removed global Vue properties
3. **Plugin Adaptation**:
   - Converted to Nuxt 3 plugin format
   - Used `defineNuxtPlugin` and `provide/inject` pattern
4. **TypeScript Improvements**:
   - Added proper typing for components and APIs
   - Created interfaces for configurations and state
5. **State Management**:
   - Created composables to manage shared state
   - Replaced global events with Vue 3 patterns

## Breaking Changes

1. Internet Explorer is no longer supported
2. Some browser APIs may require polyfills
3. Component slots need to be updated for Vue 3
4. Lifecycle hooks require refactoring

## Testing and Validation

After migrating, ensure to:

1. Test all components and interactions
2. Verify map functionality works as expected
3. Test i18n across all supported languages
4. Verify printing functionality

## Known Issues

- Some third-party libraries may need updates or replacements
- CSS and styling improvements needed for modern browsers

## References

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [MapLibre GL Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)