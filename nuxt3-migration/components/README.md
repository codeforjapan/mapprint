# Components

This directory contains Vue components migrated from Nuxt 2 to Nuxt 3.

## Migrated Components

- **Logo.vue**: Simple logo component updated to use Composition API and script setup
- **Modal.vue**: Modal component updated to use Composition API, proper TypeScript types, and new Nuxt 3 imports
- **PrintableMap.vue**: Complex map component migrated to use Composition API, Vue 3 reactivity, and TypeScript types

## Implementation Notes

### General Changes

- Converted from Options API to Composition API with `<script setup>` syntax
- Added TypeScript type annotations
- Replaced `this.$nuxt.$route` with the Nuxt 3 `useRoute()` composable
- Replaced `this.$i18n` with the `useI18n()` composable
- Updated event emission patterns to use `defineEmits()`
- Updated prop definitions to use `defineProps()`
- Changed `require()` statements to ES module imports

### MapLibre Integration

The `PrintableMap.vue` component requires additional work to fully implement the MapLibre map functionality in Nuxt 3. The current implementation includes:

- Core data structures and reactivity
- Component methods for map interaction
- Templates for UI elements

However, the actual map initialization and marker rendering needs to be completed once a proper MapLibre integration plugin is set up for Nuxt 3.

## To-Do

- Complete the MapLibre-GL initialization in `PrintableMap.vue`
- Add appropriate CSS styles to match the original styling
- Set up proper asset loading for SVG and other resources
- Implement proper i18n integration across components