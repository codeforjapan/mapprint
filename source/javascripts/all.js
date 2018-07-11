
var L = require('leaflet');
var $ = require('jquery');
var tj = require('./togeojson');
var numberIcon = require('./leaflet_awesome_number_markers');

var getNowYMD = function(dt){
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth()+1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = y + "年" + m + "月" + d + "日";
    return result;
  };
  
$(function(){
    // 今日の表示
    $('#today').html(getNowYMD(new Date()));
    // MIERUNEMAPのAPIキーはローカル環境では表示されないのでご注意(https://codeforjapan.github.io/mapprint/　でのみ表示される）
    // サーバ上の場合のみMIERUNE地図を使う
    var tileserver = ( location.href == 'codeforjapan.github.io' ) ?
    'https://tile.cdn.mierune.co.jp/styles/normal/{z}/{x}/{y}.png?key=0Y_ktb4DaMAm1ULxQudU4cFMQ5zx_Q1-PGF7DXf07WLwf5F2OpY6cr8OvJSqmQbIwTl61KCMi5Uc-GwruiSicdPyutwtvyZ_wuCEHO3GoQgrMd4k' :
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attribution = ( location.href == 'codeforjapan.github.io' ) ?
    "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL." :
    'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>';

    var map = L.map('map').setView([41.3921, 2.1705], 13);
    L.tileLayer(
        tileserver, {
          attribution: attribution,
          maxZoom: 18
        }
    ).addTo( map );

    $('#date').text(() => {
      const d = new Date()
      return `このマップは ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes()} に印刷しました。`;
    });

    // 説明の表示/非表示
    $('#close').on('click', function(){
        $('.explain-container').toggle()
        if ($('#close').text() == '閉じる') {
          $('#close').text('開く')
        } else {
          $('#close').text('閉じる')
        }
    });

    $.ajax('./images/water-supply.kml').done(function (data, textStatus, jqXHR) {
        var date = getNowYMD(new Date(jqXHR.getResponseHeader('date')));
        console.log(date);
        $('#datetime').html(date.toString());
        console.log(data);
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
                            var marker = 'blue';
                            if (name.match(/^風呂/)) {
                                marker = 'red';
                            } else if (name.match(/^シャワー/) ) {
                                marker = 'orange';
                            } else if (name.match(/^洗濯/)) {
                                marker = 'green';
                            } else if (name.match(/^井戸/)) {
                                marker = 'purple';
                            } else if (name.match(/^プール/)) {
                                marker = 'darkpuple';
                            }
                            layer.setIcon(new L.AwesomeNumberMarkers({
                                number: index + 1,
                                markerColor: marker
                            }));
                            //$('#list').append('<tr><td class="id">' + (index + 1) + '</td><td class="value">' + name + '</td><td class="description">' + description + '</td></tr>')
                            index += 1;
                        }
                    }
				    //that._list.appendChild( that._createItem(layer) );
        });
        $('#list').append('</table>');
    });
});
