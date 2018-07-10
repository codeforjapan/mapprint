var L = require('leaflet');
var $ = require('jQuery');

$(function(){
    console.log('hoge');
    console.log($("#map"))
    var map = L.map('map').setView([41.3921, 2.1705], 13);
});