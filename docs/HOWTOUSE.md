# 紙マップに新しい地域を追加する場合の手順

- `./assets/config/` に `new-map.json` という名前のファイルを追加します
  - `new-map`の部分がURLになるので、適切な名前にしましょう
- `./assets/config/list.json`に `new-map.json` を追加します

## configファイルの形式
- `./assets/config/map-sample.json` に、サンプルのjsonがあります

```json
{
  # 地図のIDです。jsonファイルと共通にしておいたほうがよいです
  "map_id":"new-map",
  # 地図のタイトルです
  "map_title":"新しい地図",
  # 地図のタイトルの英語版です
  "map_title_en":"New Map",
  # 地図の説明です
  "map_description":"新しく地図を追加します",
  # 地図の説明の英語版です
  "map_description_en":"Add new map",
  # トップページで表示される地図の画像です
  # 指定しない場合はデフォルト画像が使われます
  "map_image": null,
  # 地図に表示する情報源です
  "sources": [
    {
      # 情報源のIDです
      "id" : "test_kml",
      # 情報源のURLです
      # 外部サイトを指定することもできます
      "url" : "/data/test.kml",
      # 情報源の種類です
      # KMLとGeoJSONに対応しています
      "type" : "kml",
      # 情報源のタイトルです
      "title" : "Test用KML",
      # 情報源のタイトルの英語版です
      "title_en" : "KML for test",
      # 地図上に表示するかどうかのフラグです
      "show" : true
    },
    # sourceは複数指定することもできます
    {
      "id" : "test_geojson",
      "url" : "/data/test.geojson",
      "type" : "geojson",
      "title" : "Test用GeoJSON",
      "title_en" : "GeoJSON for test",
      "show" : true
    }
  ],
  # 地図ページを開いたときのデフォルトの描画範囲です
  "default_hash": "35.034970230243786,139.83536606997205-34.998870264553034,139.90144296563784",
  # 地図ページを開いたときのデフォルトの中心座標です
  "center" : [139.83536606997205, 35.034970230243786],
  # カテゴリの設定です
  "layer_settings": {
    # カテゴリ名は日本語をキーとしています
    "避難所": {
      # カテゴリ名です
      "name": "避難所",
      # カテゴリ名の英語版です
      "name_en": "Shelter",
      # そのカテゴリの表示に使われる色です
      "color": "#276445",
      # そのカテゴリのマーカーで使われる色です
      "bg_color": "#A4C1B0",
      # そのカテゴリアイコンです
      # fontawesomeのアイコンが指定できます
      "icon_class": "fas fa-street-view",
      # そのカテゴリのクラス名です
      "class": "layer_temporary_houses"
    },
    # カテゴリは複数指定することもできます
    "給水所": {
      "name": "給水所",
      "name_en": "Water Supply Office",
      "color": "#285797",
      "bg_color": "#A3BBDA",
      "icon_class": "fas fa-tint",
      "class": "layer_water"
    },
  }
}
```

# mapprintをForkして、独自のプロジェクトをGithub Pagesへリリースする方法
- GitHub上で自分あるいは任意のorganizationへForkする
- Forkしたリポジトリを `git clone` する
- `git checkout -b forked-release` で `forked-release` というブランチを作る
- `forked-release` に対して、独自に行いたい変更を行う
  - 上記の「紙マップに新しい地図を追加する手順」に従って新しい地図を追加するなど
- `forked-release` で、 `.gitignore` から `dist` を消す
- `forked-release` で、 `nuxt.config.js` の `router { base: '/' }` を `router { base: '/mapprint/' }` に書き換える
- `yarn run generate` で `dist` を生成する
- `git subtree push --prefix dist/ origin forked-pages` で `forked-pages` というブランチを作る
- GithubのリポジトリのページのSettingsタブから、GitHub Pagesとして公開するページとして `forked-pages` ブランチのrootを選択する