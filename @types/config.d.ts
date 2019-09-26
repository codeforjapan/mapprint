declare namespace MapPrint {
  /**
   * Config file of mapprint service
  */
  /**
   * site_title: ウェブサイトのタイトル
   * site_description: サイトの解説
   * layer_settings: レイヤーの設定情報
   */
  export interface Config
  {
    map_settings:MapSetting[],
  }
  /**
   * map_id: マップID（URLのパラメータになる)
   * map_title: 地図のタイトル
   * map_description: 地図の詳細
   * data_url: データのURL
   * type: "KML" or "umap"。データの形式（Google マイマップはKML、umap は .umap 形式のデータであること）
   * layer_settings: レイヤー（カテゴリ）の設定情報
   */
  export interface MapSetting
  {
    map_id:string,
    map_title:string,
    map_description:string,
    data_url:string,
    type:string,
    default_hash?:string,
    layer_settings:LayerSetting[]|undefined|null
  }
  /**
   * name: レイヤー名。この名前でマッチングを行う
   * color: 色文字列（css の形式）。デフォルトカラーを上書きする場合
   * bg_color: マーカーの数字の背景色
   * icon_class: Fontawesomeのアイコンclass
   * class: 追加するクラス名
   */
  export interface LayerSetting
  {
    name:string,
    color:string|undefined,
    bg_color:string|undefined,
    icon_class:string|undefined,
    class:string|undefined
  }

}
