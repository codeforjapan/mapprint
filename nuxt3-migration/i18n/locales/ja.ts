export default defineI18nLocale(async () => ({
  common: {
    title: "カミマップ",
    site_name: "カミマップ - 紙でマップ",
    site_desc: "地図情報を印刷できる「紙マップ」",
    about: "このサイトについて",
    contribute: "貢献する",
    share: "共有",
    language: "言語",
    printed_at: "印刷日時:",
    back_to_home: "ホームに戻る",
    loading: "読み込み中...",
    error_loading_maps: "マップの読み込みエラー",
    retry: "再試行",
    no_maps_available: "利用可能なマップがありません"
  },
  map: {
    desc_1: "スマホの電池は地震の時に貴重です。紙の地図を持っておきましょう。",
    desc_2: "このサイトのマップは印刷して使うためのものです。",
    desc_3: "紙に印刷したマップは、スマホの充電がなくなっても使えます。",
    desc_4: "このマップを印刷して避難や支援に役立ててください。",
    desc_5: "右上の「印刷」ボタンを押すと、印刷用ページが表示されます。",
    desc_6: "地図上で縮尺や表示エリアを調整したあとに印刷すると、見やすい地図が印刷できます。",
    desc_7: "タブレットやスマホで見ている人は、画面をスクロールすると地図エリアの下に詳細な情報一覧が表示されます。",
    loading: "マップを読み込んでいます...",
    error_loading: "マップデータの読み込みエラー",
    not_found: "マップが見つかりません",
    back_to_maps: "マップ一覧に戻る",
    printed_at: "印刷日時:"
  },
  PrintableMap: {
    name: "名称:",
    legend: "凡例",
    show_all: "すべて表示",
    print: "印刷",
    back_to_map: "地図に戻る",
    close_area_select: "エリア選択を閉じる",
    close_list: "一覧を閉じる",
    no_point_in_map: "この地図の範囲内には地点情報がありません。"
  }

}))