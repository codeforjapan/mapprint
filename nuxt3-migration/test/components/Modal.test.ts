import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Modal from '../../components/Modal.vue';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      map: 'test-map'
    }
  })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en'
  })
}));

// Mock dynamic import
vi.mock('../../assets/config/test-map.json', () => ({
  default: {
    map_description: 'Test map description',
    map_description_en: 'English test map description'
  }
}), { virtual: true });

describe('Modal', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  it('renders properly when closed', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: false
      }
    });
    
    // Check component exists and has modal elements
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.modal').exists()).toBe(true);
    expect(wrapper.find('.modal-background').exists()).toBe(true);
    
    // Check that modal doesn't have open class
    expect(wrapper.find('.modal').classes()).not.toContain('open');
    expect(wrapper.find('.modal-background').classes()).not.toContain('open');
  });
  
  it('renders properly when open', () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true
      }
    });
    
    // Check that modal has open class
    expect(wrapper.find('.modal').classes()).toContain('open');
    expect(wrapper.find('.modal-background').classes()).toContain('open');
  });
  
  it('emits events when clicking close button', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true
      }
    });
    
    // Click the close button
    await wrapper.find('.modal-close').trigger('click');
    
    // Check that events are emitted
    expect(wrapper.emitted()).toHaveProperty('update:isOpen');
    expect(wrapper.emitted()).toHaveProperty('closeModal');
    
    // Check the value of update:isOpen
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
  });
  
  it('emits events when clicking the background', async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true
      }
    });
    
    // Click the background
    await wrapper.find('.modal-background').trigger('click');
    
    // Check that events are emitted
    expect(wrapper.emitted()).toHaveProperty('update:isOpen');
    expect(wrapper.emitted()).toHaveProperty('closeModal');
    
    // Check the value of update:isOpen
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
  });
  
  it('displays localized content based on locale', async () => {
    // Test with English locale
    vi.mock('vue-i18n', () => ({
      useI18n: () => ({
        t: (key: string) => key,
        locale: 'en'
      })
    }));
    
    const wrapper = mount(Modal, {
      props: {
        isOpen: true
      }
    });
    
    // Wait for any async operations
    await wrapper.vm.$nextTick();
    
    // Set mapConfig manually for testing
    wrapper.vm.mapConfig = {
      map_description: 'Japanese description',
      map_description_en: 'English description'
    };
    
    await wrapper.vm.$nextTick();
    
    // Since locale is 'en' and there's an English description, it should show the English one
    const spans = wrapper.findAll('span');
    const descriptionSpan = Array.from(spans).find(span => 
      span.text().includes('English description')
    );
    
    expect(descriptionSpan).toBeDefined();
  });
});