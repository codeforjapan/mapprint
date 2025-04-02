import { describe, it, expect, vi } from 'vitest';
import MapHelper from '../lib/MapHelper';
import { LngLatBounds, LngLat } from 'maplibre-gl';

describe('MapHelper', () => {
  // Simple test to verify setup
  it('should create an instance', () => {
    const helper = new MapHelper();
    expect(helper).toBeDefined();
  });

  // Test GeoJSON parsing
  describe('GeoJSON parsing', () => {
    const helper = new MapHelper();
    
    it('should parse GeoJSON data correctly', () => {
      const geoJson = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": "Test Point",
              "category": "Test Category"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [135.5, 34.7]
            }
          }
        ]
      };
      
      const [markers, updated_at] = helper.loadGeoJSONData(geoJson);
      
      expect(markers.length).toBe(1);
      expect(markers[0].category).toBe("Test Category");
      expect(markers[0].feature.geometry.coordinates).toEqual([135.5, 34.7]);
      expect(markers[0].feature.properties.name).toBe("Test Point");
      expect(updated_at).toBeTruthy();
    });
    
    it('should use default category for GeoJSON without category', () => {
      const geoJson = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": "Test Point"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [135.5, 34.7]
            }
          }
        ]
      };
      
      const [markers, _] = helper.loadGeoJSONData(geoJson);
      
      expect(markers.length).toBe(1);
      expect(markers[0].category).toBe("未分類");
    });
  });
  
  // Test bounding box operations
  describe('bounds operations', () => {
    const helper = new MapHelper();
    
    it('should serialize and deserialize LngLat coordinates', () => {
      const lngLat = new LngLat(135.5, 34.7);
      const serialized = helper.serializeLatLng(lngLat);
      
      // Format is "lat,lng" in MapHelper
      expect(serialized).toContain('34.7');
      expect(serialized).toContain('135.5');
      expect(serialized).toContain(',');
      
      const deserialized = helper.deserializeLatLng(serialized);
      expect(deserialized.lng).toBeCloseTo(lngLat.lng);
      expect(deserialized.lat).toBeCloseTo(lngLat.lat);
    });
    
    it('should serialize and deserialize bounds', () => {
      // Create bounds with SW and NE corners
      const sw = new LngLat(135.0, 34.0);
      const ne = new LngLat(136.0, 35.0);
      const bounds = new LngLatBounds(sw, ne);
      
      const serialized = helper.serializeBounds(bounds);
      
      // Check that serialization works (exact format may vary)
      expect(serialized).toContain(',');
      expect(serialized).toContain('-');
      
      const deserialized = helper.deserializeBounds(serialized);
      expect(deserialized).toBeDefined();
      
      // Just verify the bounds were deserialized into a valid object
      // and it has the correct methods
      expect(typeof deserialized?.getSouth).toBe('function');
      expect(typeof deserialized?.getNorth).toBe('function');
      expect(typeof deserialized?.getWest).toBe('function');
      expect(typeof deserialized?.getEast).toBe('function');
      
      // Verify it contains points that should be inside
      const testPoint = [135.5, 34.5];
      expect(helper.inBounds(testPoint, deserialized!)).toBe(true);
    });
    
    it('should check if a point is in bounds', () => {
      // Create bounds with SW and NE corners
      const sw = new LngLat(135.0, 34.0);
      const ne = new LngLat(136.0, 35.0);
      const bounds = new LngLatBounds(sw, ne);
      
      // Point inside bounds
      expect(helper.inBounds([135.5, 34.5], bounds)).toBe(true);
      
      // Points outside bounds
      expect(helper.inBounds([134.5, 34.5], bounds)).toBe(false); // west
      expect(helper.inBounds([136.5, 34.5], bounds)).toBe(false); // east
      expect(helper.inBounds([135.5, 33.5], bounds)).toBe(false); // south
      expect(helper.inBounds([135.5, 35.5], bounds)).toBe(false); // north
    });
  });
});