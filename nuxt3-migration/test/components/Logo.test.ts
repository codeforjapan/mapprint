import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Logo from '../../components/Logo.vue';

describe('Logo', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(Logo);
    
    // Check if component is mounted and has the right structure
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.VueToNuxtLogo').exists()).toBe(true);
    expect(wrapper.findAll('.Triangle').length).toBe(4);
    
    // Check for specific triangles
    expect(wrapper.find('.Triangle--one').exists()).toBe(true);
    expect(wrapper.find('.Triangle--two').exists()).toBe(true);
    expect(wrapper.find('.Triangle--three').exists()).toBe(true);
    expect(wrapper.find('.Triangle--four').exists()).toBe(true);
  });
});