import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Modal from '../../components/Modal.vue';

// Skip testing the dynamic import for now
vi.mock('~/assets/config/test-map.json', () => ({
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
  
  it('renders properly with props', () => {
    const wrapper = shallowMount(Modal, {
      props: {
        isOpen: false
      }
    });
    
    // Check component exists
    expect(wrapper.exists()).toBe(true);
    
    // Check modal class is based on isOpen prop
    expect(wrapper.find('.modal').attributes('class')).not.toContain('open');
  });
  
  it('emits events when clicking close button', async () => {
    const wrapper = shallowMount(Modal, {
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
});