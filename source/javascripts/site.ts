import * as $ from 'jquery';
import PrintableMap from './mapHelper';

$(function(){
  if ($('#map')){
    let map = new PrintableMap("localhost:4567", "map");
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
});
