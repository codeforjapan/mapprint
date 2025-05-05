import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Logo from '../../components/Logo.vue';

describe('Logo', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(Logo, {
      props: {
        alt: 'Test Logo',
        size: 'small'
      }
    });
    
    // Check if component is mounted and has the right structure
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('alt')).toBe('Test Logo');
    expect(wrapper.find('img').classes()).toContain('logo-small');
    
    // Test with different size
    const largeWrapper = shallowMount(Logo, {
      props: {
        alt: 'Large Logo',
        size: 'large'
      }
    });
    expect(largeWrapper.find('img').classes()).toContain('logo-large');
  });
});