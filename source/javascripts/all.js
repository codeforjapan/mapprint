
var L = require('leaflet');
var $ = require('jquery');
var numberIcon = require('./leaflet_awesome_number_markers');

$(function(){
    var myIcon = L.icon({
        iconUrl: 'my-icon.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowUrl: 'my-icon-shadow.png',
        shadowSize: [68, 95],
        shadowAnchor: [22, 94]
    });
# MIERUNEMAPのAPIキーはローカル環境では表示されないのでご注意(https://codeforjapan.github.io/mapprint/　でのみ表示される）
    var map = L.map('map').setView([41.3921, 2.1705], 13);
    L.tileLayer(
        'https://tile.cdn.mierune.co.jp/styles/normal/{z}/{x}/{y}.png?key=0Y_ktb4DaMAm1ULxQudU4cFMQ5zx_Q1-PGF7DXf07WLwf5F2OpY6cr8OvJSqmQbIwTl61KCMi5Uc-GwruiSicdPyutwtvyZ_wuCEHO3GoQgrMd4k', {
          attribution: "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL.",
          maxZoom: 18
        }
    ).addTo( map );
    $('#close').on('click', function(){
        $('#explain').hide()
    });

    $.getJSON('./images/water-supply.geojson', function (data) {
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
    map.on("moveend", function () {
        $('#list').html('<table>');
        var index = 0;
        console.log(map.getCenter().toString());
        this.eachLayer(function(layer) {
			if(layer instanceof L.Marker)
                if( map.getBounds().contains(layer.getLatLng()) )
                    if (layer.feature === undefined) {
                        return false;
                    }else {
                        var name = layer.feature.properties.name;
                        var description = layer.feature.properties.description;
                        if (name !== undefined) {
                            if (index % 2 == 0){
                                $('#list').append('<tr>');
                            }
                            $('#list').append('<td class="id">' + (index + 1) + '</td><td class="value">' + name + '</td>')
                            if (index % 2 == 1){
                                $('#list').append('</tr>');
                            }
                            layer.setIcon(new L.AwesomeNumberMarkers({
                                number: index + 1, 
                                markerColor: "blue"}));
                            //$('#list').append('<tr><td class="id">' + (index + 1) + '</td><td class="value">' + name + '</td><td class="description">' + description + '</td></tr>')
                            index += 1;
                        }
                    }
				    //that._list.appendChild( that._createItem(layer) );
        });
        $('#list').append('</table>');
    });      
});
