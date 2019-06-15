/*jshint esversion: 6 */
declare function require(path: string): any;


var L = require ('leaflet');
var $ = require('jquery');
var tj = require('@mapbox/togeojson');
var QRCode = require('qrcode')

require('./leaflet_awesome_number_markers').default();
var displayHelper = require('./displayHelper');
var _ = require('lodash');

import Marker from 'leaflet';

// アイコンの設定 https://codeforjapan.github.io/mapprint/stylesheets/leaflet_awesome_number_markers.css 内の色を使う。
// 凡例はCSS3の色を指定しないと、色が出てこない https://www.w3.org/TR/2018/REC-css-color-3-20180619/#svg-color
interface Legend {
  color: string;
  name: string;
}
var legends: Legend[] = [];

var icons = [
    'ohuro',
    'toile',
    'sentaku',
    'kyusui'
];

function showLegend(map) {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend');

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < legends.length; i++) {
          div.innerHTML +=
          '<div class="legend-type">' +
            '<i style="background:' + legends[i].color + '"></i><div class=poi-type> ' + legends[i].name + '</div></br>' +
          '</div>';
        }
        return div;
    };
    legend.addTo(map);
}

function tileServerUrl(mapStyle){
  // 地図の色はnormal,grey, mono, bright, blueが選択できる。
  // 印刷時の視認性の高さからカラーはbright、白黒にはgrayを使用する。
  var styleCode;
  if(mapStyle === 'color'){
    styleCode = 'bright';
  } else if(mapStyle === 'mono'){
    styleCode = 'gray';
  } else {
    styleCode = 'normal';
  }
  // MIERUNEMAPのAPIキーはローカル環境では表示されないのでご注意(https://codeforjapan.github.io/以下でのみ表示される）
  // サーバ上の場合のみMIERUNE地図を使う
  return ( location.host === 'codeforjapan.github.io' ) ?
  'https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=KNmswjVYR187ACBqbsZc5fEIBM_DC2TXwMST0tVMe4AiYCt274X0VqAy5pf-ebvl8CtjAtBx15r1YyAiXURC' :
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}

function tileServerAttribution(){
  return ( location.host === 'codeforjapan.github.io' ) ?
  "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL." :
  'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>';

}

$(function(){
    function addMarker(feature, category, map){
      var geojson = L.geoJson(feature, {
        onEachFeature: function (feature, layer) {
          var field = '名称: '+feature.properties.name+ '<br>'+
          '詳細: '+feature.properties.description;
          layer.category = category;
          layer.bindPopup(field);
        }
      }).addTo(map);
      try {
        var bounds = deserializeBounds(window.location.hash.substr(1));
        map.fitBounds(bounds);
      } catch(e) {
          map.fitBounds(geojson.getBounds());
      }
      if (!_.find(legends,function(legend)  {
        return legend.name == category.name;
      })){
        legends.push({name:category.name, color:category.color});
      }
    }
    function loadJsonData(orgdata, map){
      var data = JSON.parse(orgdata);
      _.forEach(data.layers, (layer)=> {
        var category = layer._umap_options
        _.forEach(layer.features, (feature) => {
          addMarker(feature, category, map);
        });
      });
    }
    function loadKMLData(data, map){
      var folders = data.getElementsByTagName('Folder');
      if (folders.length == 0) {
        folders = data.getElementsByTagName('Document');
      }
      _.forEach(folders, (folder) => {
          var category = folder.childNodes[1].firstChild;
          var geojsondata = tj.kml(folder);
          addMarker(geojsondata, category, map);
      });
    }
    function serializeLatLng(latLng) {
        return '' + latLng.lat + ',' + latLng.lng;
    }
    function serializeBounds(bounds) {
        return serializeLatLng(bounds.getNorthWest()) + '-' +
            serializeLatLng(bounds.getSouthEast());
    }
    function deserializeLatLng(s) {
        return L.latLng(s.split(',', 2).map(function(d) {return +d;}));
    }
    function deserializeBounds(s) {
        return L.latLngBounds(s.split('-', 2).map(function(d) {return deserializeLatLng(d);}));
    }
    function addQRCodeLayer() {
        $('#qrcodecontainer')
            .append('<canvas id="qrcode"></canvas>');
    }
    function renewQRCode() {
        if($('#qrcode')[0] == undefined) return;
        var canvas = document.getElementById('qrcode');

        QRCode.toCanvas(canvas, window.location.href, function (error) {
        if (error) console.error(error);
        })
    }
    function initMap() {
      var map = L.map('map').setView([41.3921, 2.1705], 13);
      var tileLayer = L.tileLayer(
          tileServerUrl($('input[name=mapStyle]:checked').val()), {
            attribution: tileServerAttribution(),
            maxZoom: 18
          }
      );
      tileLayer.addTo( map );
      if($('#qrcodecontainer')[0]) {
        addQRCodeLayer();
      }
      $('#date').text(() => {
        const d = new Date();
        return displayHelper.getPrintDate(d);
      });
      $('#footer').append(
          'この地図は、https://codeforjapan.github.io/mapprint/ を印刷したものです。'
          + '<br>'
          + '最新の情報はウェブサイトからお確かめください。'
      );

      $('#print').on('click', () => {
        window.print();
      });

      // 背景地図の切り替え
      $('input[name="mapStyle"]:radio').change( function() {
        tileLayer.setUrl(tileServerUrl($(this).val()));
      })

      // 説明の表示/非表示
      $('#close').on('click', function(){
          $('.explain-container').toggle()
          if ($('#close').text() === '閉じる') {
            $('#close').text('開く')
          } else {
            $('#close').text('閉じる')
          }
      });

      $.ajax('./images/data.umap').done(function (data, textStatus, jqXHR) {
          // データの最終更新日を表示（ローカルでは常に現在時刻となる）
          var date = displayHelper.getNowYMD(new Date(jqXHR.getResponseHeader('date')));
          console.log(date);
          $('#datetime').html(date.toString());
          if (data.contentType == 'text/xml'){
            loadKMLData(data, map);
          }else{ // it must be json data
            loadJsonData(data, map);
          }
          showLegend(map);
        });
      map.on("moveend", function () {
          var bounds = map.getBounds();
          var s = serializeBounds(bounds);
          var path = location.pathname;
          window.history.pushState('', '', path + '#' + s);
          renewQRCode();
          $('#list').html('<table>');
          var targets:Marker[] = [];
          this.eachLayer(function(layer:any) {
              if(layer instanceof L.Marker) {
                  if( map.getBounds().contains(layer.getLatLng()) ) {
                      if (_.isUndefined(layer.feature)) {
                          return false;
                      } else {
                          var name = layer.feature.properties.name;
                          if (!_.isUndefined(name)) {
                              targets.push(layer);
                          }
                      }
                  }
              }
            //that._list.appendChild( that._createItem(layer) );
          });
          var res = targets.sort(function(a,b){
              var _a = a.feature.properties.name;
              var _b = b.feature.properties.name;
              var _a2 = a.category.name;
              var _b2 = b.category.name;
              if(_a2 > _b2){
                  return -1;
              }else if(_a2 < _b2){
                  return 1;
              }
              return 0;
          });
          // display them
          var lastCategory = "";
          var categoryIndex = 0;
          res.forEach(function(layer,index){
              // get name
              var name = layer.feature.properties.name;
              // get category and marker type
              var category = layer.category;
              var marker = category.color;
              if (category.name !== lastCategory){
                  // display categories
                  $('#list table').append('<tr><td colspan="4" class="category_separator">' + category.name + '</td></tr>');
                  lastCategory = category.name;
                  $('#list table').append('<tr>');
                  categoryIndex = index;
              } else {
                  if ((index - categoryIndex) % 2 === 0){
                      $('#list table').append('<tr>');
                  }
              }
              $('#list table tr:last').append('<td class="id">' + (index + 1) + '</td><td class="value">'  + name + '</td>');
              // add markers to map
              layer.setIcon(new L.AwesomeNumberMarkers({
                  number: index + 1,
                  markerColor: category.color.toLowerCase()
              }));
          });
      });
    }
    initMap();
});
