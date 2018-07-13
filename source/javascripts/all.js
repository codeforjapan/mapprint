var L = require('leaflet');
var $ = require('jquery');
var tj = require('@mapbox/togeojson');
require('./leaflet_awesome_number_markers').default();
var displayHelper = require('./displayHelper');
var _ = require('lodash');

// アイコンの設定 https://codeforjapan.github.io/mapprint/stylesheets/leaflet_awesome_number_markers.css 内の色を使う。
// 凡例はCSS3の色を指定しないと、色が出てこない https://www.w3.org/TR/2018/REC-css-color-3-20180619/#svg-color
var colors = [
    {name: 'その他', color: 'black'},
    {name: 'プール', color: 'lightgreen'},
    {name: '井戸', color: 'purple'},
    {name: '水道水', color: 'cadetblue'},
    {name: '洗濯', color: 'green'},
    {name: '風呂', color: 'red'},
    {name: 'シャワー', color: 'orange'},
    {name: '給水', color: 'green'},
    {name: 'トイレ', color: 'lightblue'},
];

function showLegend(map) {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend');

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < colors.length; i++) {
            div.innerHTML +=
            '<div class="legend-type">' +
              '<i style="background:' + colors[i].color + '"></i><div class=poi-type> ' + colors[i].name + '</div></br>' +
            '</div>';
        }
        return div;
    };
    legend.addTo(map);
};
$(function(){
    // MIERUNEMAPのAPIキーはローカル環境では表示されないのでご注意(https://codeforjapan.github.io/mapprint/　でのみ表示される）
    // サーバ上の場合のみMIERUNE地図を使う
    var tileserver = ( location.host == 'codeforjapan.github.io' ) ?
    'https://tile.cdn.mierune.co.jp/styles/normal/{z}/{x}/{y}.png?key=0Y_ktb4DaMAm1ULxQudU4cFMQ5zx_Q1-PGF7DXf07WLwf5F2OpY6cr8OvJSqmQbIwTl61KCMi5Uc-GwruiSicdPyutwtvyZ_wuCEHO3GoQgrMd4k' :
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attribution = ( location.host == 'codeforjapan.github.io' ) ?
    "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL." :
    'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>';

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

    var map = L.map('map').setView([41.3921, 2.1705], 13);
    L.tileLayer(
        tileserver, {
          attribution: attribution,
          maxZoom: 18
        }
    ).addTo( map );

    $('#date').text(() => {
      const d = new Date();
      return displayHelper.getPrintDate(d);
    });
    $('#footer').append(
        'この地図は、https://codeforjapan.github.io/mapprint/ を印刷したものです。'
        + '<br>'
        + '最新の情報はウェブサイトからお確かめください。'
    );

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
        // データの最終更新日を表示（ローカルでは常に現在時刻となる）
        var date = displayHelper.getNowYMD(new Date(jqXHR.getResponseHeader('date')));
        console.log(date);
        $('#datetime').html(date.toString());
        var geojsondata = tj.kml(data);

        var geojson = L.geoJson(geojsondata, {
          onEachFeature: function (feature, layer) {
            var field = '名称: '+feature.properties.name+ '<br>'+
            '詳細: '+feature.properties.description;

            layer.bindPopup(field);
          }
        });
        geojson.addTo(map);
        try {
          var bounds = deserializeBounds(window.location.hash.substr(1));
          map.fitBounds(bounds);
        } catch(e) {
          map.fitBounds(geojson.getBounds());
        };
        showLegend(map);
      });
    map.on("moveend", function () {
        var bounds = map.getBounds();
        var s = serializeBounds(bounds);
        var path = location.pathname;
        window.history.pushState('', '', path + '#' + s);

        $('#list').html('<table>');
        var index = 0;
        var targets = [];
        this.eachLayer(function(layer) {
            if(layer instanceof L.Marker)
                if( map.getBounds().contains(layer.getLatLng()) )
                    if (_.isUndefined(layer.feature)) {
                        return false;
                    } else {
                        var name = layer.feature.properties.name;
                        if (!_.isUndefined(name)) {
                            targets.push(layer);
                        }
                    }
                    //that._list.appendChild( that._createItem(layer) );
        });
        var matchtexts = _.map(colors, (c) => {
            return c.name;
        });
        var res = targets.sort(function(a,b){
            var _a = a.feature.properties.name;
            var _b = b.feature.properties.name;
            var _a2 = matchtexts.indexOf(_a.split('｜')[0]);
            var _b2 = matchtexts.indexOf(_b.split('｜')[0]);
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
            var category = name.split('｜')[0];
            if (matchtexts.indexOf(category) == -1)
                category = 'その他';

            var c = _.find(colors, {'name': name.split('｜')[0]});
            if (_.isUndefined(c)) {
                c = _.find(colors, {'name': 'その他'})
            }
            var marker = c.color;

            if (category != lastCategory){
                // display categories
                $('#list table').append('<tr><th colspan="2" class="category_separator"></th></tr>');
                lastCategory = category;
                $('#list table').append('<tr>');
                categoryIndex = index;
            } else {
                if ((index - categoryIndex) % 2 == 0){
                    $('#list table').append('<tr>');
                }
            }
            $('#list table tr:last').append('<td class="id">' + (index + 1) + '</td><td class="value">' + name + '</td>');
            // add markers to map
            layer.setIcon(new L.AwesomeNumberMarkers({
                number: index + 1,
                markerColor: marker
            }));
            //$('#list').append('<tr><td class="id">' + (index + 1) + '</td><td class="value">' + name + '</td><td class="description">' + description + '</td></tr>')
        });
    });
});
