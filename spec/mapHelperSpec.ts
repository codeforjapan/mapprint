/// <reference path="./html2js.d.ts" />
/// <reference path="../node_modules/@types/jasmine-ajax/index.d.ts"/>
import * as mapHelper from '../source/javascripts/mapHelper';
import * as L from 'leaflet';
import * as $ from 'jquery';
import PrintableMap from '../source/javascripts/mapHelper';
import * as geoJson from 'geojson';

const SITE_URL = 'codeforjapan.github.io';
const MIERUNE_KEY = 'KNmswjVYR187ACBqbsZc5fEIBM_DC2TXwMST0tVMe4AiYCt274X0VqAy5pf-ebvl8CtjAtBx15r1YyAiXURC';

describe('tileServerAttribution', () => {
  it('returns openstreetmap license for testing environment', function() {
    expect(mapHelper.tileServerAttribution('localhost:4567')).toBe('Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>');
  });
  it('returns MIERUNE license for production environment', function() {
    expect(mapHelper.tileServerAttribution(SITE_URL)).toBe("Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL.");
  });
});

describe('tileServerUrl', () => {
  it ('returns openstreetmap tile url', function () {
    expect(mapHelper.tileServerUrl('color', 'localhost:4567')).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
  it ('returns MIERUNE tile url(bright)', function () {
    const styleCode = 'bright';
    expect(mapHelper.tileServerUrl('color', SITE_URL)).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
  it ('returns MIERUNE tile url(mono)', function () {
    const styleCode = 'gray';
    expect(mapHelper.tileServerUrl('mono', SITE_URL)).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
  it ('returns MIERUNE tile url(other)', function () {
    const styleCode = 'normal';
    expect(mapHelper.tileServerUrl('other', SITE_URL)).toBe('https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=' + MIERUNE_KEY);
  });
})

describe('Map contractor', () => {
  beforeEach(function() {
    document.body.innerHTML = '<div id="map"/>';
  });
  it ('throw error when no divid', function(){
    expect(function(){new PrintableMap('localhost:4567', 'mapid');}).toThrowError('Map container not found.');
  });
})

describe('Load map', () => {
  const dataUrl = "./data/data.umap";
  beforeEach(function() {
    document.body.innerHTML = '<div id="map"/>';
    // document.body.innerHTML = __html__["source/map.html.haml"] //@todo to be fixed. somehow this doesn’t work...
  });
  it ('initialize properties', function(){
    let map = new PrintableMap('localhost:4567', 'map');
    expect(map.host).toBe('localhost:4567');
    expect(map.divid).toBe('map');
  })
  it ('load map class using OpenStreetMap', function() {
    let map = new PrintableMap("localhost:4567", "map");
    expect($("#map").hasClass("leaflet-container")).toBe(true);
    expect($("#map").text()).toMatch(/.*OpenStreetMap.*/);
  });
  it ('load map class using Mierune Map', function() {
    let map = new PrintableMap(SITE_URL, "map");
    console.log($("#map").text())
    expect($("#map").hasClass("leaflet-container")).toBe(true);
    expect($("#map").text()).toMatch(/.*MIERUNE.*/);
  });
  it ('add Marker', function() {
    let map = new PrintableMap("localhost:4567", "map");
    let feature:geoJson.Feature = {
      "type": "Feature",
      "properties": {
        "name": "おんなの駅なかゆくい市場"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          127.794567,
          26.436041
        ]
      }
    };
    let category:mapHelper.Category = {
      "name": "キャンプ場",
      "id": 895288,
      "color": "DarkGreen",
      "iconUrl": "/uploads/pictogram/campsite-24-white.png"
    }
    let before = 0;
    map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        before = before+1;
      }
    });
    map.addMarker(feature, category);
    let after = 0;
    map.map.eachLayer(function(layer:mapHelper.MyLayer){
      if (layer.getPopup() != undefined){
        after = after+1;
        expect(layer.category).toEqual(category);
      }
    });
    expect(after - before).toBe(1);
  })
  it ("load Jsondata", function(){
    let map = new PrintableMap("localhost:4567", "map");
    const json = `
    {
    "layers": [
      {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "name": "おんなの駅なかゆくい市場"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [
                127.794567,
                26.436041
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "name": "道の駅いとまん"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [
                127.661541,
                26.138343
              ]
            }
          }],
        "_umap_options": {
          "displayOnLoad": true,
          "browsable": true,
          "remoteData": {},
          "name": "道の駅",
          "id": 895298,
          "color": "Chocolate",
          "iconUrl": "/uploads/pictogram/parking-garage-24_1.png"
        }
      }]
    }`
    let before = 0;
    map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        before = before+1;
      }
    });
    map.loadUmapJsonData(json);
    let after = 0;
    map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        after = after+1;
      }
    });
    expect(after - before).toBe(2);
  })
  describe('load file', function() {
    let umapdata:string;
    let map:PrintableMap;
    let mapSpy;
    const testDate = new Date();
    beforeEach(function() {
      // read test data
      jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
      umapdata = readFixtures('data.umap')
      document.body.innerHTML = '<div id="map"/>';
      jasmine.Ajax.install();
      map = new PrintableMap("localhost:4567", "map");
    });
    afterEach(function(){
      jasmine.Ajax.uninstall();
    })
    it ("load umapfile", function(){
      jasmine.Ajax.stubRequest(dataUrl).andReturn({
        status:200,
        contentType:"application/octet-stream",
        responseHeaders: {"date":testDate.toString()},
        responseText:umapdata
      })
      mapSpy = spyOn(map, "addMarker");
      let fitBoundsFunc = spyOn(map.map, "fitBounds");
      spyOn(map, "showLegend").and.callThrough().and.callFake(() =>{
        // it should add 39 markers. Needed to check after adding all markers.
        expect(mapSpy.calls.count()).toBe(39);
        expect($("#map .legend-type").length).toBe(3);
        expect(fitBoundsFunc).toHaveBeenCalled();
      });
      map.loadFile(dataUrl);
    });
    it ("fit bounds", function() {
      let geojson = L.geoJSON(JSON.parse(umapdata).layers);
      let fitBoundsFunc = spyOn(map.map, "fitBounds").and.callThrough();
      map.loadUmapJsonData(umapdata);
      map.fitBounds();
      expect(fitBoundsFunc).toHaveBeenCalledWith(geojson.getBounds());
    });
    it ("set initial bounds of URL parameters" , function() {
      spyOn(map, "getLocationHash").and.returnValue("27.27416111737468,126.79870605468751-25.975329851614575,128.97949218750003");
      let geojson = L.geoJSON(JSON.parse(umapdata).layers);
      let fitBoundsFunc = spyOn(map.map, "fitBounds").and.callThrough();
      map.loadUmapJsonData(umapdata);
      map.fitBounds();
      expect(fitBoundsFunc).toHaveBeenCalledWith(mapHelper.deserializeBounds("27.27416111737468,126.79870605468751-25.975329851614575,128.97949218750003"));
    });
    it ("move map to get targets", function() {
      map.loadUmapJsonData(umapdata);
      map.fitBounds();
      map.map.panInsideBounds(mapHelper.deserializeBounds("27.27416111737468,126.79870605468751-25.975329851614575,128.97949218750003"));
      expect(map.targets.length).toBe(6);
    });
  });
})
