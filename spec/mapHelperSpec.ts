/// <reference path="./html2js.d.ts" />
/// <reference path="../node_modules/@types/jasmine-ajax/index.d.ts"/>
import * as mapHelper from '../source/javascripts/mapHelper';
import * as L from 'mapbox-gl';
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
  const kmlUrl = "./data/data.kml";
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
    //@todo fixme
    /*map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        before = before+1;
      }
    });
    map.addMarker(feature, category);*/
    let after = 0;
    map.map.eachLayer(function(layer:mapHelper.MyLayer){
      if (layer.getPopup() != undefined){
        after = after+1;
        expect(layer.category).toEqual(category);
      }
    });
    //expect(after - before).toBe(1);
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
    //@todo fix this
    /*map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        before = before+1;
      }
    });*/
    map.loadUmapJsonData(JSON.parse(json));
    let after = 0;
    /*
    map.map.eachLayer(function(layer:L.Layer){
      if (layer.getPopup() != undefined){
        after = after+1;
      }
    });
    expect(after - before).toBe(2);*/
  })
  describe('from umap file', function() {
    let umapdata:string;
    const testDate = new Date();
    beforeEach(function() {
      // read test data
      jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
      umapdata = readFixtures('data.umap')
      document.body.innerHTML = '<div id="map"/>';
      jasmine.Ajax.install();
    });
    afterEach(function(){
      jasmine.Ajax.uninstall();
    })
    it ("loads umapdata", function(done){
      let map = new PrintableMap("localhost:4567", "map");
      jasmine.Ajax.stubRequest(dataUrl).andReturn({
        status:200,
        contentType:"application/json",
        responseHeaders: {"date":testDate.toString(),
                          "content-type":"application/json"},
        responseText:umapdata
      })
      let mapSpy = spyOn(map, "addMarker");
      spyOn(map, 'fitBounds').and.callFake(()=>{
        // it should add 33 markers. Needed to check after adding all markers.
        expect(mapSpy.calls.count()).toBe(33);
        done();
      });
      map.loadFile(dataUrl);
    });
  });
  describe('from umap file', function() {
    let umapdata:string;
    let map:PrintableMap;
    beforeEach(function() {
      // read test data
      jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
      umapdata = readFixtures('data.umap')
      document.body.innerHTML = '<div id="map"/>';
      jasmine.Ajax.install();
    });
    afterEach(function(){
      jasmine.Ajax.uninstall();
    })
    it ("fits bounds to all loaded points ", function() {
      map = new PrintableMap("localhost:4567", "map");
      spyOn(map, "getLocationHash").and.returnValue("");
      //@todo fixme
      /*
      let geojson = L.GeoJSONSource(JSON.parse(umapdata).layers);
      let fitBoundsFunc = spyOn(map.map, "fitBounds").and.callThrough();
      map.loadUmapJsonData(JSON.parse(umapdata));
      map.fitBounds();
      expect(fitBoundsFunc).toHaveBeenCalledWith(geojson.getBounds());
      */
    });
    it ("sets initial bounds from URL parameters" , function() {
      map = new PrintableMap("localhost:4567", "map");
      spyOn(map, "getLocationHash").and.returnValue("27.27416111737468,126.79870605468751-25.975329851614575,128.97949218750003");
      //@todo fixme
      /*
      let geojson = L.geoJSON(JSON.parse(umapdata).layers);
      let fitBoundsFunc = spyOn(map.map, "fitBounds").and.callThrough();
      map.loadUmapJsonData(JSON.parse(umapdata));
      map.fitBounds();
      expect(fitBoundsFunc).toHaveBeenCalledWith(mapHelper.deserializeBounds("27.27416111737468,126.79870605468751-25.975329851614575,128.97949218750003"));
      */
    });
  });
  describe('from KML file', function() {
    let kmldata:string;
    let map:PrintableMap;
    let mapSpy;
    const testDate = new Date();
    beforeEach(function() {
      // read test data
      jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
      kmldata = readFixtures('data.kml')
      document.body.innerHTML = '<div id="map"/>';
      jasmine.Ajax.install();
    });
    afterEach(function(){
      jasmine.Ajax.uninstall();
    })
    it ("loads KML file", function(done){
      jasmine.Ajax.stubRequest(kmlUrl).andReturn({
        status:200,
        contentType:'text/xml;charset=UTF-8',
        responseHeaders: {"date":testDate.toString(), "content-type":'text/xml;charset=UTF-8'},
        responseText:kmldata
      })
      map = new PrintableMap("localhost:4567", "map");
      mapSpy = spyOn(map, "addMarker");
      spyOn(map, "fitBounds").and.callFake(() =>{
        // it should have 8 folders (categories)
        expect(mapSpy.calls.count()).toBe(8);
        done();
      });
      map.loadFile(kmlUrl);
    });
  });
});
describe('XML function ', () => {
  beforeEach(function() {
    document.body.innerHTML = '<div id="map"/>';
    // document.body.innerHTML = __html__["source/map.html.haml"] //@todo to be fixed. somehow this doesn’t work...
  });
  it ('build Category object from KML file', function(){
    let testdata = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>給水所/お風呂/洗濯/トイレ マップ</name>
  <description><![CDATA[断水に伴う応急給水拠点について<br>各市からの連絡で随時更新が発生します。ご了承ください。掲載情報と実際のタイムラグが発生した場合等もご理解いただけますと。<br>＊井戸情報も含め全ての情報は掲載出来ておりません。ご了承ください。<br><br>尾道周辺のお風呂情報も分かる範囲で載せております。<br><br>【尾道市】-------------------------<br>[尾道市役所の給水所情報] 給水について<br>7時00分～21時00分<br>https://www.city.onomichi.hiroshima.jp/soshiki/64/20391.html<br><br>[尾道市災害対応の情報一覧]<br>https://www.city.onomichi.hiroshima.jp/soshiki/8/20190.html<br><br>【東広島市】-------------------------<br>[東広島市の給水所情報]<br>http://www.city.higashihiroshima.lg.jp/soshiki/suido/1/1/17943.html<br><br>【東広島市から節水のお願い】<br>現在、入野地区で水が不足しています。<br>今後、水が出にくくなるかもしれません。<br>節水にご協力ください。よろしくお願いします。<br><br><br>【三原市】-------------------------<br>【三原市の給水所情報】<br>http://www.city.mihara.hiroshima.jp/soshiki/49/kyusui.html]]></description>
  <Style id="icon-1899-DB4436-normal">
    <IconStyle>
      <color>ff3644db</color>
      <scale>1</scale>
      <Icon>
        <href>http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png</href>
      </Icon>
      <hotSpot x="32" xunits="pixels" y="64" yunits="insetPixels"/>
    </IconStyle>
    <LabelStyle>
      <scale>0</scale>
    </LabelStyle>
  </Style>
  <Style id="icon-1899-DB4436-highlight">
    <IconStyle>
      <color>ff3644db</color>
      <scale>1</scale>
      <Icon>
        <href>http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png</href>
      </Icon>
      <hotSpot x="32" xunits="pixels" y="64" yunits="insetPixels"/>
    </IconStyle>
    <LabelStyle>
      <scale>1</scale>
    </LabelStyle>
  </Style>
  <StyleMap id="icon-1899-DB4436">
    <Pair>
      <key>normal</key>
      <styleUrl>#icon-1899-DB4436-normal</styleUrl>
    </Pair>
    <Pair>
      <key>highlight</key>
      <styleUrl>#icon-1899-DB4436-highlight</styleUrl>
    </Pair>
  </StyleMap>
  <Folder>
    <name>お風呂</name>
    <Placemark>
      <name>風呂｜天然温泉 尾道みなと館（6:00-9:30、12:00-24:00）</name>
      <description><![CDATA[日帰り温泉の営業<br>http://onomichi-minatokan.com/index.html<br>連絡先：0848-20-8222<br><br>営業時間：6:00~9:30、12:00~24:00 (受付は23:00まで)<br><br>タオルをお持ちください。 施設には駐車場はありません。 おむつの取れていない乳幼児のご利 用はお断りすることがあります。]]></description>
      <styleUrl>#icon-1899-DB4436</styleUrl>
      <Point>
        <coordinates>
          133.2038963,34.4109999,0
        </coordinates>
      </Point>
    </Placemark>
  </Folder>
</Document>
</kml>
`
    var data = new DOMParser().parseFromString(testdata, 'text/xml');
    let map = new PrintableMap("localhost:4567", "map");
    let folders = data.getElementsByTagName('Folder');
    let category:mapHelper.Category = {name:"お風呂", color:"ff3644db", iconUrl:"http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png" }
    expect(mapHelper.readCategoryOfFolder(folders[0], data)).toEqual(category);
  });
});
describe('Map controller ', () => {
  describe('to check event ', function() {
    let umapdata:string;
    let map:PrintableMap;
    let mapSpy:jasmine.Spy;
    const testDate = new Date();
    beforeEach(function() {
      // read test data
      jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
      umapdata = readFixtures('data.umap')
      document.body.innerHTML = '<div id="map"/>';
    });
    it ("get targets in specified bounds", function(done) {
      var listener:mapHelper.IPrintableMapListener = {
        POIFiltered(targets) {
          expect(targets.length).toBe(7);
          done();
        }
      }
      map = new PrintableMap("localhost:4567", "map", listener);
      map.loadUmapJsonData(JSON.parse(umapdata));
      // This bounds contains 8 POIs.
      map.map.fitBounds(mapHelper.deserializeBounds("26.67781931519818,127.9319886425601-26.515420330689124,128.20458690916166"));
    });
  });
})
