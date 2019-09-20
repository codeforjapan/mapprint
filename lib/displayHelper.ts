export function getNowYMD(dt:Date):string{
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var hh = ("00" + dt.getHours()).slice(-2);
  var mm =  ("00" + dt.getMinutes()).slice(-2);
  var result = y + "年" + m + "月" + d + "日" + hh + "時" + mm + "分";
  return result;
}

export function getPrintDate(dt:Date):string{
  return `このマップは ${this.getNowYMD(dt)} に印刷しました。`;
}
