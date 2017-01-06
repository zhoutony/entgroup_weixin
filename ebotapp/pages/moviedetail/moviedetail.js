var utils = require('../../utils/util.js')
var model = require('../../utils/model.js');
var _ = require('../../utils/underscore.modified.js');
Page({
  data: {
    movieHeaderBaseInfo: {},
    comingClassName: 'm-hide',
    releaseClassName: 'm-hide',
    boxOfficePointClassName: 'm-hide',
    date: utils.formatTime( new Date ),
    lineLists: [],
    hiddenLoading: true
  },
  onLoad: function (e) {
    // var entid = e.entid;
    this.getMovieHeaderBaseInfo(e.entid);
    // this.getCinameLine(e.entid);
  },
  // 获取影片信息
  getMovieHeaderBaseInfo: function(entid){
        this.setData({
            hiddenLoading: false
        })
      var that = this;  
      var param = {
          entIDs: entid
      };
      model.post("/Shared/_GetMovieHeaderBaseInfo", param, function (result, msg) {
        var data = result.data1[0],
            data1 = result.data2[0],
            comingClassName = 'm-hide',
            releaseClassName = 'm-hide',
            boxOfficePointClassName = 'm-hide';

        data.ReleaseDays < 0 ? boxOfficePointClassName = '' : (data.BoxOfficePoint ? releaseClassName = '' : comingClassName = '');

        data._BoxOfficeToTal = utils.getHundredMillion(data.BoxOfficeToTal);
        data._BoxOfficePoint = utils.getHundredMillion(data.BoxOfficePoint);
        data._BoxOfficeFirstDay = utils.getHundredMillion(data.BoxOfficeFirstDay);
        data._BoxOfficeFirstWeek = utils.getHundredMillion(data.BoxOfficeFirstWeek);
        data._BoxOfficeWeekEnd = utils.getHundredMillion(data.BoxOfficeWeekEnd);
        

        data.Event = data1.Event ? utils.getFormattedNum(data1.Event) : '-';
        data.PlaneNews = data.PlaneNews ? utils.getFormattedNum(data1.PlaneNews) : '-';
        data.MoviePhoto = data1.MoviePhoto ? utils.getFormattedNum(data1.MoviePhoto) : '-';
        data.MateriaVideo = data1.MateriaVideo ? utils.getFormattedNum(data1.MateriaVideo) : '-';
        data.Weibo = data1.Weibo ? utils.getFormattedNum(data1.Weibo) : '-';
        data.WeiXinNews = data1.WeiXinNews ? utils.getFormattedNum(data1.WeiXinNews) : '-';

        that.setData({
            movieHeaderBaseInfo: data,
            comingClassName: comingClassName,
            releaseClassName: releaseClassName,
            boxOfficePointClassName: boxOfficePointClassName
        })
        that.getCinameLine(data.DBOMovieID);
        
      })
  },

  getCinameLine: function(DBOMovieID){
    var that = this,
        param = {
            _Line: '',
            _MovieID: DBOMovieID,
            _Order: 201,
            _OrderType: 'DESC',
            _PageIndex: 1,
            _PageSize: 50,
            _Date: this.data.date,
            _DateSort: 'Day',
            _sDate: this.data.date,
            _eDate: this.data.date,
            _City: '',
            _CityLevel: '',
            _Index: '101,102,201,221,224,604',
            r: Math.random()
        };
        
        model.post("/Movie/GetLine_List", param, function (result, msg) {
          var lineLists = result,
            data2 = lineLists.data2,
            data2Len = data2.length,
            item;
          lineLists.data1[0].SumBoxOffice = utils.getHundredMillion (lineLists.data1[0].SumBoxOffice, '万');
          lineLists.data1[0].BoxPercent = lineLists.data1[0].BoxPercent ? lineLists.data1[0].BoxPercent : '-';

          for(var i = 0; i < data2Len; i++){
            item = data2[i];
            item.BoxOffice = utils.getHundredMillion (item.BoxOffice, '万');
            item.BoxPercent = item.BoxPercent ? item.BoxPercent : '-';
            data2[i] = item;
          }
          lineLists.data2 = data2;
          that.setData({
            lineLists: lineLists,
            hiddenLoading: true
          })
        });
  }

})