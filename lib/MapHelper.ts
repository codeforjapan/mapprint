/// <reference path="../node_modules/@types/geojson/index.d.ts" />
/// <reference path="../node_modules/@types/leaflet/index.d.ts" />
/// <reference path="../@types/config.d.ts" />

import * as MapboxGL from 'mapbox-gl';
import * as geoJson from 'geojson';
import * as L from 'leaflet';
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

}

export interface IPrintableMap {
  updated: Date;
  markers: Array<Marker>;
}

export interface IPrintableMapListener {
  POIFiltered(targets: MapboxGL.Marker[]): void;
}

export interface Legend {
  color: string;
  name: string;
  class: string;
  iconClass: string;
}

/**
 * extend L.Layer to store category data
 */
export interface MyLayer extends L.Layer {
  category: Category;
}

export var DEFAULT_ICON_COLOR: string = "lightgreen";
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

  public parse (type: string, data: any, layer_setting: any): Array<any> {
    switch (type) {
      case "kml":
        var parser = new DOMParser();
        var dom = parser.parseFromString(data, 'text/xml');
        return this.loadKMLData(dom, layer_setting);
        break;
      case "umal":
        this.loadUmapJsonData(data);
        break;
    }
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

  loadKMLData(data: Document, layer_setting:any): any {
    let that = this;
    let folders: HTMLCollectionOf<Element> = data.getElementsByTagName('Folder');
    if (folders.length == 0) {
      folders = data.getElementsByTagName('Document');
    }
    let markers = [];
    Array.prototype.forEach.call(folders, (folder) => {
      let category: Category = readCategoryOfFolder(folder, data);
      // convret category style if layer_settings option is set
      if (layer_setting) {
        category = this.convertCategoryStyle(category, layer_setting);
      }
      if (tj.kml(folder).type == "FeatureCollection") {
        let geojsondata: geoJson.FeatureCollection = tj.kml(folder, {styles: true});
        if (geojsondata.features.length > 0) {
          that.addFeatureCollection(geojsondata, category);
          const result =  geojsondata.features.map((feature: geoJson.Feature) => {
            if (feature.geometry.type == "Point") {
              markers.push({feature, category});
            }
          });
          return result;
        }
      } else {
        let geojsondata: geoJson.Feature = tj.kml(folder, {styles: true});
        markers.push({geojsondata, category});
      }
    });
    return markers;
  }

  inBounds(point: MapboxGL.LngLatBounds.getNorthEast, bounds: MapboxGL.LngLatBounds) {
    var lng = (point[0] - bounds.getNorthEast().lng) * (point[0] - bounds.getSouthWest().lng) < 0;
    var lat = (point[1] - bounds.getNorthEast().lat) * (point[1] - bounds.getSouthWest().lat) < 0;
    return lng && lat;
  }

  convertCategoryStyle(category: Category, layer_settings): Category {
    if (layer_settings == undefined) {
      return category;
    }
    layer_settings.forEach((setting: MapPrint.LayerSetting) => {
      // if the category name is found, update with layer setting
      if (setting.name == category.name) {
        category.color = setting.color;
        category.bgColor = setting.bg_color;
        category.iconClass = setting.icon_class;
        category.class = setting.class;
        // category.iconClass = setting.icon_class;
        return category;
      }
    });
    return category;
  }

  tileServerAttribution(host: string): string {
    return (host === 'codeforjapan.github.io') ?
      "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL." :
      'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>';
  }

  getStyle(mapStyle: string, host: string): MapboxGL.Style {
    return {
      "version": 8,
      "sources": {
        "OSM": {
          "type": "raster",
          "tiles": this.tileServerUrl(mapStyle, host),
          "tileSize": 256,
          "attribution": this.tileServerAttribution(host)
        }
      },
      "layers": [{
        "id": "OSM",
        "type": "raster",
        "source": "OSM",
        "minzoom": 0,
        "maxzoom": 22
      }]
    }
  }

  tileServerUrl(mapStyle: string, host: string): Array<string> {

    return ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'];
  }
  serializeLatLng(latLng) {
    return '' + latLng.lat + ',' + latLng.lng;
  }
  serializeBounds(bounds) {
    return this.serializeLatLng(bounds.getNorthWest()) + '-' +
        this.serializeLatLng(bounds.getSouthEast());
  }
  public deserializeLatLng(s:string) {
    let [slat, slng] = s.split(',', 2);
    let lng = parseFloat(slng);
    let lat = parseFloat(slat);
    return new MapboxGL.LngLat(lng,lat);
  }
  public deserializeBounds(s) {
    try{
      return new MapboxGL.LngLatBounds(s.split('-', 2).map(function(d) {return this.deserializeLatLng(d);}));
    }catch(e){
      return undefined;
    }
  }
}


/**
 * return Category object
 * @param folder
 * @param document
 */

export function readCategoryOfFolder(folder:Element, document:Document):Category{
  let catname:string = folder.getElementsByTagName("name")[0].textContent!;
  let color:string = "red";
  let iconUrl;
  console.log(folder);
  try {
    let styleUrl:string = folder.getElementsByTagName("styleUrl")[0].textContent!;
    if (styleUrl){
      let styles:NodeListOf<Element> = document.querySelectorAll(styleUrl + " Pair")!;
      if (styles.length > 0) {
        Array.prototype.forEach.call( styles, (elem) => {
          let key = elem.querySelector("key");
          if (key && key.textContent == "normal"){
            let styleUrl = elem.querySelector("styleUrl").textContent;
            let style = document.querySelector(styleUrl);
            try{
              color = "#" + style.querySelector("IconStyle color").textContent.substr(0,6); // dirty fix
            }catch(e){
              color = DEFAULT_ICON_COLOR;
            }
            // iconUrl = style.querySelector("IconStyle Icon href").textContent;
          }
        });
      }
    }
  }catch(e){
    console.log("#category read error");
    console.log(e);
    console.log(folder);
  }
  return {name:catname, color:color, iconUrl: iconUrl};

}

