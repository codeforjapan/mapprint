[![CircleCI](https://circleci.com/gh/codeforjapan/mapprint/tree/master.svg?style=svg)](https://circleci.com/gh/codeforjapan/mapprint/tree/master)


千葉県サポート情報マップ印刷用
===

こちらの [千葉 ガソリン・給水・避難所・携帯充電・無料Wifiマップ ](https://www.google.com/maps/d/u/0/edit?mid=18v4csEC-qPW_aeXhEnuzgMfUAqWcbF5q&ll=35.67442129451118%2C140.02272653174055&z=10) を、印刷向けに最適化したサイトのソースコードです。

https://codeforjapan.github.io/mapprint/map.html

から実際のページを確認できます。

## おばあちゃんの手に届くまで
このプロジェクトで作られたデータは、さまざまな人々の手を経て、困っているおばあちゃんのところに届きます。

![kamimap_180713.png](source/images/kamimap_180713.png)


## Help Wanted!!

Issues にあるいろいろな修正にご協力いただけると嬉しいです。
詳しくは[こちら](./CONTRIBUTE.md)

## 開発環境の構築方法

### Requirement

- ruby >= 2.2.6
- bundler
- node.js >= 6.0.0
  - OSXでbundlerがうまく入らな無い方は[この辺](https://qiita.com/tokimari/items/feda1ed61f2d8b5b317c)を、node.jsが入らない方は[この辺](https://qiita.com/yn01/items/d1fa10dbe4850f7cd693)などをご参照ください


### 環境構築

```
git clone git@github.com:codeforjapan/mapprint.git
cd mapprint
npm install
bundle install --path=vendor/bundle
npm run lint
npm test
bundle exec middleman build
```

### 起動

```
bundle exec middleman server
```

http://localhost:4567 で見れるはず


### test

```
npm test
```

Chrome HeadLess がエラーになった場合、以下を試してみてください

```
 sudo wget -q -O - https://dl-ssl.google.com/linux/linux_signi
ng_key.pub | sudo apt-key add -     && sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'     && sudo apt-get update     && sudo apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst  libx11-xcb1      --no-install-recommends     && sudo rm -rf /var/lib/apt/lists/*
```
