export function getNowYMD(dt:Date, locale?:string):string{
  const y = dt.getFullYear();
  const m = ("00" + (dt.getMonth()+1)).slice(-2);
  const d = ("00" + dt.getDate()).slice(-2);
  const hh = ("00" + dt.getHours()).slice(-2);
  const mm =  ("00" + dt.getMinutes()).slice(-2);
  let result = y + "年" + m + "月" + d + "日" + hh + "時" + mm + "分";
  if (locale === 'en') {
    result = dt.toLocaleString('en-US');
  }
  return result;
}

export function getPrintDate(dt:Date):string{
  return `このマップは ${this.getNowYMD(dt)} に印刷しました。`;
}
