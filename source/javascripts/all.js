
var L = require('leaflet');
var $ = require('jquery');
var tj = require('./togeojson');
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

    var map = L.map('map').setView([41.3921, 2.1705], 13);
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>',
          maxZoom: 18
        }
    ).addTo( map );
    $('#close').on('click', function(){
        $('#explain').hide()
    });

    $.ajax('./images/water-supply.kml').done(function (data) {
        console.log(data)
        var geojsondata = tj.kml(data);
        console.log(geojsondata)

        var geojson = L.geoJson(geojsondata, {
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
                            console.log(layer.feature.properties);
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
