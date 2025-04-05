import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';

// Mock the composables
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports');
  return {
    ...actual,
    useI18n: () => ({
      locale: 'en',
      locales: [
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' },
        { code: 'es', name: 'Español' }
      ]
    }),
    useSwitchLocalePath: () => (locale) => `/mock-path/${locale}`
  };
});

// Create a mock for window.location
const mockLocation = {
  href: 'mock-url'
};
Object.defineProperty(window, 'location', { 
  value: mockLocation,
  writable: true 
});

// Mock the process.client
vi.stubGlobal('process', { client: true });

describe('LanguageSwitcher component', () => {
  it('should render correctly', () => {
    const wrapper = shallowMount(LanguageSwitcher, {
      global: {
        stubs: ['NuxtLink']
      }
    });
    
    expect(wrapper.find('.language-switcher').exists()).toBe(true);
  });
});