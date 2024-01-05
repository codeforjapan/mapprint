[Vue コンポーネントを jest でテストできるようにする](https://github.com/codeforjapan/mapprint/issues/319)

## 要望の概要 | What

Vue に対してのテストコード環境を構築する。
個別のテスト作成は別 issue で取り組む。

## なぜやるのか | Why

本リポジトリは１～２年おきに発生する大規模な災害時に活用されている。
災害発生の頻度と利用しているライブラリのバージョンサイクルのズレが発生し、まず最初にバージョンアップなどを行う必要がでてくる。そういった際にテストコードがあることでデグレードのリスクを抑えて複数人によるコントリビューションができる環境を準備したい。

## どうやるのか | How

### テストライブラリ

Vue2 と Vue3 ではテストライブラリのバージョンが異なる。Vue2 に合わせる。
テスト用にインストールしたライブラリは以下。

```
    "@babel/core": "^7.23.7",
    "@babel/plugin-syntax-dynamic-import": "^7.8.3",
    "@babel/plugin-transform-async-to-generator": "^7.23.3",
    "@babel/plugin-transform-runtime": "^7.23.7",
    "@babel/preset-env": "^7.23.7",
    "@babel/preset-typescript": "^7.23.3",
    "@nuxt/test-utils": "^3.9.0",
    "@types/jest": "^29.5.11",
    "@vue/compiler-dom": "^3.4.5",
    "@vue/server-renderer": "^3.4.5",
    "@vue/server-test-utils": "1",
    "@vue/test-utils": "1",
    "@vue/vue2-jest": "28",
    "babel-core": "^7.0.0-bridge.0",
    "babel-jest": "^29.7.0",
    "babel-preset-vue": "^2.0.2",
    "jest": "^29.7.0",
    "jest-dom": "^4.0.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-serializer-vue": "^3.1.0",
    "jsdom": "^23.0.1",
    "jsdom-global": "^3.0.2",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
```

#### 注意点１

vue2-jest@28 を指定すること。transform の記載方法がバージョンによって異なる。

https://github.com/vuejs/vue-jest

#### 注意点２

以下２つは合わせること
@vue/test-utils@1
@vue/server-test-utils@1

https://github.com/vuejs/vue-test-utils/

### 設定ファイル郡

- jest.config.js ： Vue2 で jest を動かすための設定を書いています。
  - 例）test/lib/displayHelper.spec.js
- .babelrc ： jest 実行時にバベルで ECMAScript から CommonJS に変換しています。
  - 例）test/components/Logo.vue.spec.js

### テスト実施方法

テストコマンドを実行してください。

```
$ yarn test

yarn run v1.22.17
$ jest
 PASS  test/components/Logo.vue.spec.js
 PASS  test/lib/displayHelper.spec.js

Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        5.031 s
Ran all test suites.
Done in 6.35s.
```

### サンプルテストコード

- js/ts ファイル　：　 jest のみ利用。関数に対してテストコードを書きます。
- vue ファイル　：　@vue/test-utils を利用。Vue がレンダリングする仮想 DOM （\*1）に対してテストコードを書きます。

（\*1）jest.config.js にて「testEnvironment: 'jsdom'」を指定して仮想 DOM を jest から扱えるようにしています。
