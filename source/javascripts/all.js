var L = require('leaflet');
var $ = require('jQuery');

$(function(){
    var map = L.map('map').setView([41.3921, 2.1705], 13);
    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>',
          maxZoom: 18
        }
    ).addTo( map );

    $.getJSON('/images/water-supply.geojson', function (data) {
        var geojson = L.geoJson(data, {
          onEachFeature: function (feature, layer) {
            var field = '名称: '+feature.properties.name+ '<br>'+
            '詳細: '+feature.properties.description;
    
            layer.bindPopup(field);
          }
        });
        geojson.addTo(map);
        map.fitBounds(geojson.getBounds());
      });
});