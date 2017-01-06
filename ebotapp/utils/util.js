function formatTime(date, isHour) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  if(isHour){
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }else{
    return [year, month, day].map(formatNumber).join('-')
  }
  
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getHundredMillion(num, _units, numstr) {
    if(!_units){
        if (num >= 100000000) {
            return {
                num: (num / 100000000).toFixed(2),
                units: '亿'
            }
        } else {
            return {
                num: num / 10000 == 0 ? 0 : getFormattedNum((num / 10000).toFixed(1)),
                units: num / 10000 == 0 ? '' : '万'
            }
        }
    }else{
        return num / 10000 == 0 ? 0 : getFormattedNum((num / 10000).toFixed(1));
    }
}
/**
 * @param {Date}
 * @return {String} 格式化字符串
 */
function getDateStr (_date) {
    var _y = _date.getFullYear(),
        _m = _date.getMonth() + 1, //  好坑，从0开始
        _m = _m < 10 ? "0" + _m : _m,
        _d = _date.getDate(),
        _d = _d < 10 ? "0" + _d : _d,
        _s = _y + "-" + _m + "-" + _d;
    return _s;
}

/*获取选择日期距当前日期相差天数
    @_nowDate 必填 当前日期
    @_selectDate 必选 为选择日期
*/
function restrictSwitchToDate(_selectDate, _nowDate) {
    var nowDate = _nowDate ? new Date(_nowDate) - 1 + 1 : new Date() - 1 + 1;
    var selectDate = new Date(_selectDate) - 1 + 1;
    var _day = 1 * 24 * 60 * 60 * 1000;
    var _days;
    if (nowDate > selectDate) {
        _days = -Math.floor((nowDate - selectDate) / _day);
    } else if (nowDate < selectDate) {
        _days = Math.floor((selectDate - nowDate) / _day);
    } else {
        _days = 0;
    }
    return _days
}
// 返回前一天
function prevDay(date) {
    var mydate = new Date(date);
    var resultdate = new Date(mydate - 1 - 1 * 24 * 60 * 60 * 1000);
    return getDateStr(resultdate);
}

// 返回后一天
function nextDay(date) {
    var mydate = new Date(date);
    var resultdate = new Date(mydate - 1 + 1 * 24 * 60 * 60 * 1000);
    return getDateStr(resultdate);
}

// 返回以date的前后index天
function getIndexDaysStr(date, index) {
    var mydate = new Date(date);
    var resultdate = new Date(mydate - 1 + index * 24 * 60 * 60 * 1000);
    return getDateStr(resultdate);
}

// 判断两个日期是同一天
function isEqualDays(day1, day2) {
    var _day1 = new Date(day1);
    var _day2 = new Date(day2);
    var _y1 = _day1.getFullYear(),
        _m1 = _day1.getMonth(),
        _d1 = _day1.getDate(),
        _y2 = _day2.getFullYear(),
        _m2 = _day2.getMonth(),
        _d2 = _day2.getDate();
    if (_y1 == _y2 && _m1 == _m2 && _d1 == _d2) {
        return true;
    } else {
        return false;
    }
}

function getFormattedNum (num) {
    // make sure it is String
    return String(num).replace(/\B(?=(?:\d{3})+\b)/g, ',');
}

module.exports = {
  formatTime: formatTime,
  getHundredMillion: getHundredMillion,
  restrictSwitchToDate: restrictSwitchToDate,
  prevDay: prevDay,
  nextDay: nextDay,
  getIndexDaysStr: getIndexDaysStr,
  isEqualDays: isEqualDays,
  getFormattedNum: getFormattedNum
}
