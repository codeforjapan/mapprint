[![CircleCI](https://circleci.com/gh/codeforjapan/mapprint/tree/master.svg?style=svg)](https://circleci.com/gh/codeforjapan/mapprint/tree/master)

紙マップ
===
![kamimap](static/images/logo.png)

Google マイマップ や、umap の情報を取り込んで、印刷向けに最適化して表示できるサイトのソースコードです。

https://codeforjapan.github.io/mapprint/

から実際のページを確認できます。
災害時に、近くのサポート情報を印刷した地図を避難所や市役所で配布するような用途で使われています。

## おばあちゃんの手に届くまで
このサイトの特徴は、紙でマップが配布できることです。
このプロジェクトで作られたデータは、さまざまな人々の手を経て、困っているおばあちゃんのところにまで届きます。

![kamimap_180713.png](docs/kamimap_180713.png)

## LICENSE/ライセンス

本ソフトウェアは、MITライセンスの元提供されています。詳しくは docs/LICENSE.txt を確認してください。  
This software is released under the MIT License, see docs/LICENSE.txt.

## Help Wanted!!

Issues にあるいろいろな修正にご協力いただけると嬉しいです。
詳しくは[こちら](./docs/CONTRIBUTING.md)を御覧ください。

## 開発環境の構築方法

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```
