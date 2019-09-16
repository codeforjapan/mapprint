/// <reference path="../../@types/config.d.ts" />
import * as $ from 'jquery';
import PrintableMap from './mapHelper';
import myconfig = require("./config.json")
$(function(){
  const config:MapPrint.Config = myconfig;
  if ($('#maplist').length){
    // index page
    myconfig.map_settings.forEach((map:MapPrint.MapSetting) => {
      let div:HTMLDivElement = document.createElement('div');
      div.className = "maplink"
      let maplink:HTMLAnchorElement = document.createElement('a');
      let hash = "";
      if (map.default_hash){
        hash = map.default_hash;
      }
      maplink.href = "map.html#" + hash;
      maplink.innerText = map.map_title;
      div.appendChild(maplink)
      $("#maplist").append(div);
    });
  }else{
    // map page
    if ($('#map').length){
      let map = new PrintableMap("localhost:4567", "map");
      map.loadFile('./images/chiba.kml');
    }
  }
  $('#print').on('click', () => {
    window.print();
  });

  $('#close').on('click', function(){
    $('.explain-container').toggle()
    if ($('#close').text() === '閉じる') {
      $('#close').text('開く')
    } else {
      $('#close').text('閉じる')
    }
  });
});
