import * as L from 'leaflet';
import * as $ from 'jquery';
export interface IPrintableMap {
  map:L.Map;
}

export default class PrintableMap implements IPrintableMap{
  map:L.Map;
  constructor (public host:string, public divid :string){
    this.map = L.map(divid).setView([41.3921, 2.1705], 13);
    var tileLayer = L.tileLayer(
      tileServerUrl(host, $('input[name=mapStyle]:checked').val()), {
        attribution: tileServerAttribution(host),
        maxZoom: 18
      }
    );
    tileLayer.addTo( this.map );
  }
}

export function tileServerAttribution(host:string):string{
  return ( host === 'codeforjapan.github.io' ) ?
  "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL." :
  'Map data © <a href="http://openstreetmap.org/">OpenStreetMap</a>';
}

export function tileServerUrl(mapStyle:string, host:string):string{
  // 地図の色はnormal,grey, mono, bright, blueが選択できる。
  // 印刷時の視認性の高さからカラーはbright、白黒にはgrayを使用する。
  var styleCode;
  if(mapStyle === 'color'){
    styleCode = 'bright';
  } else if(mapStyle === 'mono'){
    styleCode = 'gray';
  } else {
    styleCode = 'normal';
  }
  // MIERUNEMAPのAPIキーはローカル環境では表示されないのでご注意(https://codeforjapan.github.io/以下でのみ表示される）
  // サーバ上の場合のみMIERUNE地図を使う
  return ( host === 'codeforjapan.github.io' ) ?
  'https://tile.cdn.mierune.co.jp/styles/' + styleCode + '/{z}/{x}/{y}.png?key=KNmswjVYR187ACBqbsZc5fEIBM_DC2TXwMST0tVMe4AiYCt274X0VqAy5pf-ebvl8CtjAtBx15r1YyAiXURC' :
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}
