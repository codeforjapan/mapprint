import * as MapLibre from 'maplibre-gl';
import * as geoJson from 'geojson';
import * as tj from '@mapbox/togeojson';

export interface Category {
  displayOnLoad?: boolean,
  browsable?: boolean,
  remoteData?: {},
  name: string,
  id?: number,
  color?: string,
  bgColor?: string,
  iconUrl?: string,
  iconClass?: string,
  class?: string
}

export interface Marker {
  feature: any;
  category: string;
}

export interface UpdatedSearchKey {
  type: string,
  pattern: string,
  index: number,
  field: string
}

export interface IPrintableMap {
  updated: Date;
  markers: Array<Marker>;
}

export interface IPrintableMapListener {
  POIFiltered(targets: MapLibre.Marker[]): void;
}

export interface Legend {
  color: string;
  name: string;
  class: string;
  iconClass: string;
}

export const DEFAULT_ICON_COLOR: string = "lightgreen";

/**
 * main class of PrintableMap
 */
export default class MapHelper implements IPrintableMap {
  updated: Date;
  markers: Marker[];

  /**
   * constructor
   * @param host host string of application, like codeforjapan.github.io
   * @param divid div id of a map container.
   * @param listener listener class which receives an event after POI is filtered by moving a map.
   */

  public parse(type: string, data: any, layer_setting: any, updated_search_key?: UpdatedSearchKey): [Array<any>, string] {
    try {
      console.log(`Parsing data as ${type}`, typeof data);
      
      switch (type) {
        case "kml":
          var parser = new DOMParser();
          var dom = parser.parseFromString(data, 'text/xml');
          if (dom.documentElement.nodeName === "parsererror") {
            console.error("KML parse error:", dom.documentElement.textContent);
            throw new Error("Error parsing KML data");
          }
          return this.loadKMLData(dom, layer_setting, updated_search_key);
          
        case "umal":
          const umapData = typeof data === 'string' ? JSON.parse(data) : data;
          this.loadUmapJsonData(umapData);
          break;
          
        case "geojson":
          const json = typeof data === 'string' ? JSON.parse(data) : data;
          return this.loadGeoJSONData(json);
      }
    } catch (error) {
      console.error(`Error parsing ${type} data:`, error);
    }
    
    return [[], ''];
  }

  /**
   * Insert Markers from FeatureCollections
   * @param features FeatureCollection data
   * @param category Category
   */
  addFeatureCollection(features: geoJson.FeatureCollection, category: Category): void {
    features.features.forEach((feature: geoJson.Feature) => {
      if (feature.geometry.type == "Point") {
        //this.addMarker(feature, category);
      }
    });
  }


  /**
   * load Json String based on umap file
   * @param umapJsonData umap style geojson string
   */
  loadUmapJsonData(data: any): void {
    // let data = JSON.parse(jsonstring)
    data.layers.forEach((layer) => {
      let category: Category = layer._umap_options;
      layer.features.forEach((feature) => {
        // this.addMarker(feature, category);
      });
    });
  }

  loadGeoJSONData(data: any): [any, string] {
    let updated_at = new Date().toLocaleString();
    let markers = [];
    data["features"].forEach((feature) => {
      let category = "未分類"
      if (feature.properties["category"]) {
        category = feature.properties["category"];
      }
      markers.push({ feature, category });
    });
    return [markers, updated_at];
  }

  loadKMLData(data: Document, layer_setting: any, updated_search_key?: UpdatedSearchKey): [any, string] {
    console.log("Processing KML data");
    
    try {
      let folders: HTMLCollectionOf<Element> = data.getElementsByTagName('Folder');
      if (folders.length == 0) {
        console.log("No Folder elements found, looking for Document elements");
        folders = data.getElementsByTagName('Document');
      }
      
      console.log(`Found ${folders.length} folders/documents in KML`);
      
      let updated_at = "";
      if (updated_search_key != undefined) {
        if (updated_search_key.type == "regexp") {
          const targetElm = data.getElementsByTagName(updated_search_key.field);
          if (targetElm.length > 0) {
            const text = targetElm[0].innerHTML;
            const regExp = new RegExp(updated_search_key.pattern, "iu");
            const result = regExp.exec(text);
            if (result != null && result.length > 1) {
              updated_at = "(" + result[updated_search_key.index] + ")";
            }
          }
        }
      }
      
      let markers = [];
      Array.prototype.forEach.call(folders, (folder) => {
        try {
          let category = readCategoryOfFolder(folder, data);
          console.log(`Processing folder with category: ${category.name}`);
          
          let geojsonObj;
          try {
            geojsonObj = tj.kml(folder, { styles: true });
          } catch (error) {
            console.error("Error converting KML folder to GeoJSON:", error);
            return; // Skip this folder
          }
          
          if (geojsonObj.type == "FeatureCollection") {
            let geojsondata = geojsonObj as geoJson.FeatureCollection;
            
            console.log(`FeatureCollection with ${geojsondata.features?.length || 0} features`);
            
            if (geojsondata.features && geojsondata.features.length > 0) {
              geojsondata.features.forEach((feature: geoJson.Feature) => {
                if (feature.geometry && feature.geometry.type == "Point") {
                  feature.properties = feature.properties || {};
                  feature.properties['marker-color'] = category.color;
                  markers.push({ feature, category: category.name });
                }
              });
            }
          } else {
            let geojsondata = geojsonObj as geoJson.Feature;
            if (geojsondata.geometry && geojsondata.geometry.type) {
              geojsondata.properties = geojsondata.properties || {};
              geojsondata.properties['marker-color'] = category.color;
              markers.push({ feature: geojsondata, category: category.name });
            }
          }
        } catch (error) {
          console.error("Error processing KML folder:", error);
        }
      });
      
      console.log(`Processed KML data: found ${markers.length} markers`);
      return [markers, updated_at];
    } catch (error) {
      console.error("Error in loadKMLData:", error);
      return [[], ""];
    }
  }

  inBounds(point: any, bounds: MapLibre.LngLatBounds) {
    var lng = (point[0] - bounds.getNorthEast().lng) * (point[0] - bounds.getSouthWest().lng) < 0;
    var lat = (point[1] - bounds.getNorthEast().lat) * (point[1] - bounds.getSouthWest().lat) < 0;
    return lng && lat;
  }

  convertCategoryStyle(category: Category, layer_settings: any): Category {
    if (layer_settings == undefined) {
      return category;
    }
    layer_settings.forEach((setting: any) => {
      // if the category name is found, update with layer setting
      if (setting.name == category.name) {
        category.color = setting.color;
        category.bgColor = setting.bg_color;
        category.iconClass = setting.icon_class;
        category.class = setting.class;
        return category;
      }
    });
    return category;
  }

  serializeLatLng(latLng: MapLibre.LngLat): string {
    return '' + latLng.lat + ',' + latLng.lng;
  }

  serializeBounds(bounds: MapLibre.LngLatBounds): string {
    return this.serializeLatLng(bounds.getNorthWest()) + '-' +
      this.serializeLatLng(bounds.getSouthEast());
  }

  public deserializeLatLng(s: string): MapLibre.LngLat {
    let [slat, slng] = s.split(',', 2);
    let lng = parseFloat(slng);
    let lat = parseFloat(slat);
    return new MapLibre.LngLat(lng, lat);
  }

  public deserializeBounds(s: string): MapLibre.LngLatBounds | undefined {
    try {
      let _this = this;
      return new MapLibre.LngLatBounds(s.split('-', 2).map(function (d) { return _this.deserializeLatLng(d); }));
    } catch (e) {
      return undefined;
    }
  }
}

/**
 * return Category object
 * @param folder
 * @param document
 */

export function readCategoryOfFolder(folder: Element, document: Document): Category {
  let name = "未分類"; // Default category name
  let color: string = "red"; // Default color
  let iconUrl;
  
  try {
    // Try to get name from the folder
    const nameElements = folder.getElementsByTagName("name");
    if (nameElements.length > 0 && nameElements[0].textContent) {
      name = nameElements[0].textContent;
    }
    
    // Try to get style information
    const styleUrlElements = folder.getElementsByTagName("styleUrl");
    if (styleUrlElements.length > 0 && styleUrlElements[0].textContent) {
      let styleUrl: string = styleUrlElements[0].textContent;
      
      if (styleUrl) {
        // Handle style URLs with or without # prefix
        if (styleUrl.startsWith('#')) {
          styleUrl = styleUrl; // Keep as is
        } else {
          styleUrl = '#' + styleUrl;
        }
        
        let styles: NodeListOf<Element>;
        try {
          styles = document.querySelectorAll(styleUrl + " Pair");
        } catch (e) {
          console.warn("Error selecting style pairs:", e);
          styles = new NodeList();
        }
        
        if (styles.length > 0) {
          Array.prototype.forEach.call(styles, (elem) => {
            try {
              let key = elem.querySelector("key");
              if (key && key.textContent == "normal") {
                let styleUrlElem = elem.querySelector("styleUrl");
                if (styleUrlElem && styleUrlElem.textContent) {
                  let styleUrlValue = styleUrlElem.textContent;
                  // Handle style URLs with or without # prefix
                  if (styleUrlValue.startsWith('#')) {
                    styleUrlValue = styleUrlValue; // Keep as is
                  } else {
                    styleUrlValue = '#' + styleUrlValue;
                  }
                  
                  let style;
                  try {
                    style = document.querySelector(styleUrlValue);
                  } catch (e) {
                    console.warn("Error selecting style:", e);
                  }
                  
                  if (style) {
                    try {
                      const iconStyleColorElem = style.querySelector("IconStyle color");
                      if (iconStyleColorElem && iconStyleColorElem.textContent) {
                        const c: string = iconStyleColorElem.textContent;
                        if (c && c.length >= 8) {
                          try {
                            const a = parseInt('0x' + c.substring(0, 2)) / 255;
                            const b = parseInt('0x' + c.substring(2, 4));
                            const g = parseInt('0x' + c.substring(4, 6));
                            const r = parseInt('0x' + c.substring(6, 8));
                            
                            // Make sure we have valid values
                            if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
                              color = `rgba(${r},${g},${b},${a})`;
                            } else {
                              throw new Error("Invalid color components");
                            }
                          } catch (e) {
                            console.warn("Error parsing color values:", e);
                            color = DEFAULT_ICON_COLOR;
                          }
                        } else {
                          color = DEFAULT_ICON_COLOR;
                        }
                      }
                    } catch (e) {
                      color = DEFAULT_ICON_COLOR;
                    }
                  }
                }
              }
            } catch (e) {
              console.warn("Error processing style element:", e);
            }
          });
        }
      }
    }
  } catch (e) {
    console.error("Category read error:", e);
    console.info("Problem folder:", folder);
  }
  
  console.log(`Folder category: ${name}, color: ${color}`);
  return { name: name, color: color, iconUrl: iconUrl };
}