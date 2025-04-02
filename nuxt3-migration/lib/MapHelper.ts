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
    switch (type) {
      case "kml":
        var parser = new DOMParser();
        var dom = parser.parseFromString(data, 'text/xml');
        return this.loadKMLData(dom, layer_setting, updated_search_key);
      case "umal":
        this.loadUmapJsonData(data);
        break;
      case "geojson":
        const json = JSON.parse(data);
        return this.loadGeoJSONData(json);
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
    let folders: HTMLCollectionOf<Element> = data.getElementsByTagName('Folder');
    if (folders.length == 0) {
      folders = data.getElementsByTagName('Document');
    }
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
      let category = readCategoryOfFolder(folder, data);

      if (tj.kml(folder).type == "FeatureCollection") {
        let geojsondata: geoJson.FeatureCollection = tj.kml(folder, { styles: true });
        if (geojsondata.features.length > 0) {
          const result = geojsondata.features.map((feature: geoJson.Feature) => {
            if (feature.geometry.type == "Point") {
              feature.properties['marker-color'] = category.color;
              markers.push({ feature, category: category.name });
            }
          });
          return result;
        }
      } else {
        let geojsondata: geoJson.Feature = tj.kml(folder, { styles: true });
        geojsondata.properties['marker-color'] = category.color;
        markers.push({ feature: geojsondata, category: category.name });
      }
    });
    return [markers, updated_at];
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
  let name;
  let color: string = "red";
  let iconUrl;
  try {
    name = folder.getElementsByTagName("name")[0].textContent!;
    let styleUrl: string = folder.getElementsByTagName("styleUrl")[0].textContent!;
    if (styleUrl) {
      let styles: NodeListOf<Element> = document.querySelectorAll(styleUrl + " Pair")!;
      if (styles.length > 0) {
        Array.prototype.forEach.call(styles, (elem) => {
          let key = elem.querySelector("key");
          if (key && key.textContent == "normal") {
            let styleUrl = elem.querySelector("styleUrl").textContent;
            let style = document.querySelector(styleUrl);
            try {
              const c: String = style.querySelector("IconStyle color").textContent;
              const a = parseInt('0x' + c.substring(0, 2)) / 255
              const b = parseInt('0x' + c.substring(2, 4))
              const g = parseInt('0x' + c.substring(4, 6))
              const r = parseInt('0x' + c.substring(6, 8))
              color = `rgba(${r},${g},${b},${a})`
            } catch (e) {
              color = DEFAULT_ICON_COLOR;
            }
          }
        });
      }
    }
  } catch (e) {
    console.log("#category read error");
    console.log(e);
    console.log(folder);
  }
  return { name: name, color: color, iconUrl: iconUrl };
}