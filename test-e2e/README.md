[E2E テストコード環境を構築する](https://github.com/codeforjapan/mapprint/issues/449)

## 要望の概要 | What

E2E テストコード環境を構築する

## なぜやるのか | Why

コードの品質維持のため。

#319 で Jest 環境は作ったが Vue のテストにはモック化などの整備が不十分である。
画面数も少ないため E2E テストコード環境を入れる。

## どうやるのか | How

Playwright を導入する。

その後、個別のテストコードを実装する

### テスト実行
` yarn test:e2e `

※Windows の方はコマンドプロンプトから実行してください

### [WIP] WSL 向けの環境構築手順

- Playwright は WSL ではすぐに動かないため以下の対応をお願いします。

- 1. Error: browserType.launch: Executable doesn't exist at /home/user/.cache/
ms-playwright/chromium-1091/chrome-linux/chrome
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     yarn playwright install                                             ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
  3 |
  4 | test('URL Check', async () => {
> 5 |   const browser = await chromium.launch({ headless: false });
    |                                  ^
  6 |   const context = await browser.newContext();
  7 |   const page = await context.newPage();
  8 |


- 2. Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Please install them with the following command:      ║
║                                                      ║
║     sudo yarn playwright install-deps                ║
║                                                      ║
║ Alternatively, use apt:                              ║
║     sudo apt-get install libnss3\                    ║
║         libnspr4\                                    ║
║         libatk1.0-0\                                 ║
║         libatk-bridge2.0-0\                          ║
║         libcups2\                                    ║
║         libxkbcommon0\                               ║
║         libatspi2.0-0\                               ║
║         libxcomposite1\                              ║
║         libxdamage1\                                 ║
║         libxfixes3\                                  ║
║         libxrandr2\                                  ║
║         libgbm1\                                     ║
║         libpango-1.0-0\                              ║
║         libcairo2\                                   ║
║         libasound2                                   ║
║                                                      ║
║ <3 Playwright Team                                   ║
╚══════════════════════════════════════════════════════╝

- 3. Error: browserType.launch: Target page, context or browser has been closed
[WIP] WSL で動かす方法は未解決です。
