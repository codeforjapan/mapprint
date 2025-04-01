declare module '@mapbox/togeojson' {
  import * as geoJson from 'geojson';
  
  export function kml(doc: Document | Element, options?: { styles?: boolean }): geoJson.FeatureCollection | geoJson.Feature;
}