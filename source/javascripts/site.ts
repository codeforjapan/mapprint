import * as $ from 'jquery';
import PrintableMap from './mapHelper';

$(function(){
  if ($('#map')){
    let map = new PrintableMap("localhost:4567", "map");
    map.loadFile('./images/data.umap');
  }
});
