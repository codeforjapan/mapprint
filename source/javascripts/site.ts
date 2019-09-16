import * as $ from 'jquery';
import PrintableMap, { IPrintableMap } from './mapHelper';


$(function(){
  let map: IPrintableMap;
  if ($('#map')){
    map = new PrintableMap(window.location.hostname, "map");
    map.loadFile('./images/chiba.kml');
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
