export function getNowYMD(dt:Date, locale?:string):string{
  // 日付表現は各言語に沿うが表示時間は日本時間（JST）
  switch (locale) {
    case 'ja':
      const y = dt.getFullYear();
      const m = ("00" + (dt.getMonth()+1)).slice(-2);
      const d = ("00" + dt.getDate()).slice(-2);
      const hh = ("00" + dt.getHours()).slice(-2);
      const mm = ("00" + dt.getMinutes()).slice(-2);
      const result = y + "年" + m + "月" + d + "日" + hh + "時" + mm + "分";
      return result
    case 'en':
      return dt.toLocaleString('en-JP');
    case 'es':
      return dt.toLocaleString('es-JP');
    case 'hi':
      return dt.toLocaleString('hi-JP');
    case 'ko':
      return dt.toLocaleString('ko-JP');
    case 'my':
      return dt.toLocaleString('my-JP');
    case 'ne':
      return dt.toLocaleString('ne-JP');
    case 'pt':
      return dt.toLocaleString('pt-JP');
    case 'si':
      return dt.toLocaleString('si-JP');
    case 'th':
      return dt.toLocaleString('th-JP');
    case 'tw':
      return dt.toLocaleString('tw-JP');
    case 'vn':
      return dt.toLocaleString('vn-JP');
    case 'zh':
      return dt.toLocaleString('zh-JP');
    default:
      return dt.toLocaleString('ja-JP');
  }
}
