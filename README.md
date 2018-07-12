給水所/お風呂/洗濯（ランドリー）マップ 印刷向け
===

こちらの [給水所/お風呂/洗濯（ランドリー）マップ ](https://www.google.com/maps/d/u/0/viewer?mid=17BQwZDvJhDQ9OKZfakI-2PsyIaGdDtRx&ll=34.395888541511006%2C132.9701334&z=11
) を、印刷向けに最適化したサイトのソースコードです。

https://codeforjapan.github.io/mapprint/

から実際のページを確認できます。



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
bundle exec middleman build
```

### 起動

```
bundle exec middleman server
```
http://localhost:4567 で見れるはず


### deploy
```
bundle exec middleman deploy
```

(このリポジトリへの push 権限が必要。
github pages で作られているので、gh-pages ブランチが更新されます。)



### test
```
npm test
```
