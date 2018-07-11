
module.exports = {
  getNowYMD: function(dt){
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth()+1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var hh = ("00" + dt.getHours()).slice(-2);
    var mm =  ("00" + dt.getMinutes()).slice(-2);
    var result = y + "年" + m + "月" + d + "日" + hh + "時" + mm + "分";
    return result;
  },

  getPrintDate: function(dt){
    return `このマップは ${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日 ${dt.getHours()}:${dt.getMinutes()} に印刷しました。`;
  }
}
