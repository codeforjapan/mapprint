import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PrintableMap from '../../components/PrintableMap.vue';
import MapHelper from '../../lib/MapHelper';
import * as MapLibre from 'maplibre-gl';

// Mock i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' }
  })
}));

// Mock ky
vi.mock('ky', () => ({
  default: {
    get: vi.fn().mockReturnValue({
      text: () => Promise.resolve('{"type":"FeatureCollection","features":[]}')
    })
  }
}));

// Create a mock map config
const mockMapConfig = {
  center: [139.767, 35.681],
  default_hash: '35.6815,139.7673-35.6833,139.7715',
  layer_settings: {
    'Test Category': {
      color: '#ff0000',
      bg_color: '#ffcccc',
      icon_class: 'fas fa-star'
    }
  },
  sources: [
    {
      title: 'Test Source',
      url: 'https://example.com/test-source.geojson',
      type: 'geojson',
      show: true
    }
  ]
};

describe('PrintableMap', () => {
  // Mock window.location and history methods
  const originalLocation = window.location;
  const originalHistory = window.history;

  beforeEach(() => {
    // Mock window.location
    delete window.location;
    window.location = { 
      ...originalLocation,
      hash: '',
      pathname: '/test'
    };

    // Mock window history
    delete window.history;
    window.history = {
      ...originalHistory,
      pushState: vi.fn()
    };
  });

  it('should render with proper props', async () => {
    // We're using mount instead of shallowMount because we need to test deeper interactions
    const wrapper = mount(PrintableMap, {
      props: {
        mapConfig: mockMapConfig
      },
      global: {
        stubs: {
          'ClientOnly': {
            template: '<slot />'
          },
          'SimpleBar': true
        }
      }
    });
    
    // Check if component is mounted
    expect(wrapper.exists()).toBe(true);
    
    // Wait for any async operations
    await wrapper.vm.$nextTick();
    
    // Check that the center is computed correctly
    expect(wrapper.vm.center).toEqual(mockMapConfig.center);
  });

  it('should correctly filter markers in bounds', async () => {
    // Mock the MapHelper.inBounds method
    const inBoundsSpy = vi.spyOn(MapHelper.prototype, 'inBounds');
    inBoundsSpy.mockImplementation(() => true);

    // Create a component instance with layers data
    const wrapper = mount(PrintableMap, {
      props: {
        mapConfig: mockMapConfig
      },
      global: {
        stubs: {
          'ClientOnly': {
            template: '<slot />'
          },
          'SimpleBar': true
        }
      }
    });

    // Manually set some test data
    wrapper.vm.layers = [
      {
        source: { show: true, title: 'Test Source' },
        markers: [
          { 
            category: 'Test Category',
            feature: { 
              geometry: { 
                type: 'Point', 
                coordinates: [139.767, 35.681] 
              },
              properties: { name: 'Test Point' }
            }
          }
        ]
      }
    ];
    
    wrapper.vm.checkedArea = ['Test Source'];
    wrapper.vm.bounds = new MapLibre.LngLatBounds([139.7, 35.6], [139.8, 35.7]);
    
    // Force a re-render
    await wrapper.vm.$nextTick();
    
    // Verify that inBoundsMarkers includes our test marker
    expect(wrapper.vm.inBoundsMarkers.length).toBe(1);
    expect(inBoundsSpy).toHaveBeenCalled();
  });

  it('should correctly categorize markers', async () => {
    const wrapper = mount(PrintableMap, {
      props: {
        mapConfig: mockMapConfig
      },
      global: {
        stubs: {
          'ClientOnly': {
            template: '<slot />'
          },
          'SimpleBar': true
        }
      }
    });

    // Set up test data with multiple categories
    wrapper.vm.layers = [
      {
        source: { show: true, title: 'Test Source' },
        markers: [
          { 
            category: 'Category A',
            feature: { 
              geometry: { type: 'Point', coordinates: [139.767, 35.681] },
              properties: { name: 'Point A' }
            }
          },
          { 
            category: 'Category B',
            feature: { 
              geometry: { type: 'Point', coordinates: [139.768, 35.682] },
              properties: { name: 'Point B' }
            }
          },
          { 
            category: 'Category A',
            feature: { 
              geometry: { type: 'Point', coordinates: [139.769, 35.683] },
              properties: { name: 'Point C' }
            }
          }
        ]
      }
    ];
    
    wrapper.vm.checkedArea = ['Test Source'];
    wrapper.vm.bounds = new MapLibre.LngLatBounds([139.7, 35.6], [139.8, 35.7]);
    
    // Mock the inBounds method to return true for all markers
    vi.spyOn(MapHelper.prototype, 'inBounds').mockImplementation(() => true);
    
    // Force a re-render
    await wrapper.vm.$nextTick();
    
    // Check that displayMarkersGroupByCategory correctly groups by category
    const groups = wrapper.vm.displayMarkersGroupByCategory;
    expect(groups.length).toBe(2);
    
    // Find groups by category
    const categoryAGroup = groups.find(g => g.category === 'Category A');
    const categoryBGroup = groups.find(g => g.category === 'Category B');
    
    // Verify group counts
    expect(categoryAGroup?.markers.length).toBe(2);
    expect(categoryBGroup?.markers.length).toBe(1);
  });

  it('should handle marker category text correctly', () => {
    const wrapper = mount(PrintableMap, {
      props: {
        mapConfig: mockMapConfig
      },
      global: {
        stubs: {
          'ClientOnly': {
            template: '<slot />'
          },
          'SimpleBar': true
        }
      }
    });
    
    // Test default fallback
    expect(wrapper.vm.getMarkerCategoryText(undefined, 'en')).toBe('未分類');
    
    // Test valid category
    expect(wrapper.vm.getMarkerCategoryText('Test Category', 'en')).toBe('category.Test Category');
  });

  it('should handle marker name text with localization', () => {
    const wrapper = mount(PrintableMap, {
      props: {
        mapConfig: mockMapConfig
      },
      global: {
        stubs: {
          'ClientOnly': {
            template: '<slot />'
          },
          'SimpleBar': true
        }
      }
    });
    
    // Test standard name
    expect(wrapper.vm.getMarkerNameText({ name: 'Default Name' }, 'en')).toBe('Default Name');
    
    // Test localized name
    expect(wrapper.vm.getMarkerNameText({ 
      name: 'Default Name',
      'name:en': 'English Name' 
    }, 'en')).toBe('English Name');
    
    // Test different locale
    expect(wrapper.vm.getMarkerNameText({ 
      name: 'Default Name',
      'name:ja': '日本語の名前' 
    }, 'ja')).toBe('日本語の名前');
  });
});