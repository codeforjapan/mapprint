/// <reference path="../../@types/config.d.ts" />
import * as $ from 'jquery';
import PrintableMap, { IPrintableMap } from './mapHelper';
import myconfig = require("./config.json")

$(function(){
  let map: IPrintableMap;
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
      maplink.href = "map.html?id=" + map.map_id + "#" + hash;
      maplink.innerText = map.map_title;
      div.appendChild(maplink)
      $("#maplist").append(div);
    });
  }else{
    let mapid = new URLSearchParams(document.location.search).get("id")
    if (mapid == null){
      mapid = "chiba"
    }
    // map page
    let map_setting = config.map_settings.find((setting:MapPrint.MapSetting)=>{
      return setting.map_id == mapid
    })
    if (map_setting == undefined){
      $("#map_title").html("map IDが正しくありません。")
    }else{
      // map instance
      if ($('#map').length){
        $("#map_title").html(map_setting.map_title);
        $("#map_description").html(map_setting.map_description);
        map = new PrintableMap(window.location.hostname, "map");
        map.loadFile(map_setting.data_url);
      }
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

  $('input[name="mapStyle"]:radio').change( function() {
    const mapStyle:string = <string> $(this).val();
    map.changeStyle(mapStyle,window.location.hostname)
  });
});
