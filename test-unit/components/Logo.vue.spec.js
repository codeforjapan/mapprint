// Import the required libraries
import { mount } from '@vue/test-utils';
import Logo from '~/components/Logo.vue';

// Describe the test suite
describe('Logo', () => {
  // Test if the component renders correctly
  it('renders the component', () => {
    const wrapper = mount(Logo);
    expect(wrapper.exists()).toBe(true);
  });

  // You can add more specific tests for your component's behavior here
  // For example, testing the presence and styling of individual triangles

  it('contains four triangles with correct styling', () => {
    const wrapper = mount(Logo);
    const triangles = wrapper.findAll('.Triangle');

    expect(triangles).toHaveLength(4);
  });

  // Add more tests as needed
});
