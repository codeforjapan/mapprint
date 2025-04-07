import { describe, it, expect, vi, beforeAll } from 'vitest';
import MapHelper, { readCategoryOfFolder } from '../lib/MapHelper';
import fs from 'fs';
import path from 'path';

describe('KML Parser', () => {
  let kmlText: string;
  
  // Read the KML file for testing
  beforeAll(() => {
    // Use a mock KML string for testing purposes
    kmlText = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test KML</name>
    <Style id="icon-1234-red-labelson-nodesc">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1</scale>
        <Icon>
          <href>https://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <StyleMap id="icon-1234-red-labelson-nodesc-normal">
      <Pair>
        <key>normal</key>
        <styleUrl>#icon-1234-red-labelson-nodesc</styleUrl>
      </Pair>
    </StyleMap>
    <Folder>
      <name>Test Category</name>
      <styleUrl>#icon-1234-red-labelson-nodesc-normal</styleUrl>
      <Placemark>
        <name>Test Point</name>
        <description>This is a test point</description>
        <Point>
          <coordinates>135.5,34.7,0</coordinates>
        </Point>
      </Placemark>
    </Folder>
  </Document>
</kml>`;
  });
  
  describe('readCategoryOfFolder', () => {
    it('should extract the category name from a folder', () => {
      // Parse the KML to a DOM
      const parser = new DOMParser();
      const dom = parser.parseFromString(kmlText, 'text/xml');
      
      // Find the folder element
      const folder = dom.getElementsByTagName('Folder')[0];
      
      // Extract the category
      const category = readCategoryOfFolder(folder, dom);
      
      expect(category.name).toBe('Test Category');
    });
    
    it('should handle folders without styles gracefully', () => {
      // Create a simplified folder without styles
      const folderXml = `<Folder><name>Simple Folder</name></Folder>`;
      const parser = new DOMParser();
      const dom = parser.parseFromString(folderXml, 'text/xml');
      const folder = dom.getElementsByTagName('Folder')[0];
      
      // Test with an empty document as parent
      const emptyDoc = parser.parseFromString('<kml></kml>', 'text/xml');
      
      const category = readCategoryOfFolder(folder, emptyDoc);
      
      expect(category.name).toBe('Simple Folder');
      // Default color should be used
      expect(category.color).toBe('red');
    });
  });
  
  describe('loadKMLData', () => {
    it('should parse KML data into markers', () => {
      const helper = new MapHelper();
      const parser = new DOMParser();
      const dom = parser.parseFromString(kmlText, 'text/xml');
      
      const [markers, updated_at] = helper.loadKMLData(dom, {});
      
      expect(markers.length).toBeGreaterThan(0);
      expect(markers[0].category).toBe('Test Category');
      expect(markers[0].feature.geometry.type).toBe('Point');
      expect(markers[0].feature.properties.name).toBe('Test Point');
      expect(markers[0].feature.properties.description).toBe('This is a test point');
    });
    
    it('should extract coordinate data correctly', () => {
      const helper = new MapHelper();
      const parser = new DOMParser();
      const dom = parser.parseFromString(kmlText, 'text/xml');
      
      const [markers, updated_at] = helper.loadKMLData(dom, {});
      
      const coordinates = markers[0].feature.geometry.coordinates;
      expect(coordinates[0]).toBeCloseTo(135.5);
      expect(coordinates[1]).toBeCloseTo(34.7);
    });
    
    it('should apply color information from styles', () => {
      const helper = new MapHelper();
      const parser = new DOMParser();
      const dom = parser.parseFromString(kmlText, 'text/xml');
      
      const [markers, updated_at] = helper.loadKMLData(dom, {});
      
      // Color should be extracted from the KML style
      expect(markers[0].feature.properties['marker-color']).toBeTruthy();
    });
    
    it('should handle KML with missing or empty folders', () => {
      const helper = new MapHelper();
      const emptyKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Empty KML</name>
  </Document>
</kml>`;
      
      const parser = new DOMParser();
      const dom = parser.parseFromString(emptyKml, 'text/xml');
      
      const [markers, updated_at] = helper.loadKMLData(dom, {});
      
      // Should return an empty array without errors
      expect(markers).toEqual([]);
    });
  });
  
  describe('parse method with KML', () => {
    it('should handle KML data through the parse method', () => {
      const helper = new MapHelper();
      
      const [markers, updated_at] = helper.parse('kml', kmlText, {});
      
      expect(markers.length).toBeGreaterThan(0);
      expect(markers[0].category).toBe('Test Category');
    });
    
    it('should handle invalid KML data gracefully', () => {
      const helper = new MapHelper();
      const invalidKml = `<?xml version="1.0" encoding="UTF-8"?><not-valid-kml></not-valid-kml>`;
      
      const [markers, updated_at] = helper.parse('kml', invalidKml, {});
      
      // Should return an empty array for invalid KML
      expect(markers).toEqual([]);
    });
  });
});