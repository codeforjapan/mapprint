import { describe, it, expect } from 'vitest';
import listJson from '../assets/config/list.json';
import { useMapConfig } from '../composables/useMapConfig';

describe('Config files', () => {
  it('can import list.json', () => {
    expect(listJson).toBeDefined();
    expect(Array.isArray(listJson)).toBe(true);
    expect(listJson.length).toBeGreaterThan(0);
  });

  it('can access configs through the useMapConfig composable', async () => {
    const { loadMapConfig, getMapById } = useMapConfig();
    
    // Try to load a few config files
    const notoConfig = await loadMapConfig('2024-noto-earthquake.json');
    const typhoonConfig = await loadMapConfig('2019-typhoon-19.json');
    
    // Check that they loaded correctly
    expect(notoConfig).toBeDefined();
    expect(typhoonConfig).toBeDefined();
    
    if (notoConfig && typhoonConfig) {
      expect(notoConfig.map_title).toBeDefined();
      expect(typhoonConfig.map_title).toBeDefined();
      
      // Check by ID
      const notoById = getMapById('2024-noto-earthquake');
      expect(notoById).toBeDefined();
      expect(notoById?.map_title).toEqual(notoConfig.map_title);
    }
  });

  it('checks that each config file in list.json has required properties', async () => {
    const { loadMapConfig } = useMapConfig();
    
    for (const filename of listJson) {
      const config = await loadMapConfig(filename);
      expect(config).toBeDefined();
      
      if (config) {
        // Check required properties
        expect(config.map_title).toBeDefined();
        expect(config.map_title_en).toBeDefined();
        expect(config.center).toBeDefined();
        expect(Array.isArray(config.center)).toBe(true);
        expect(config.center.length).toBe(2);
      }
    }
  });
});