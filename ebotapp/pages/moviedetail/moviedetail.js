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
    timeLists: [],
    movieEventList: [],
    hiddenLoading: true,
    index_page_android: '',
    movietimeclass: 'current',
    movielineclass: '',
    movieFormItemClass: 'm-hide',
    seblistClass: ''
  },
  onLoad: function (e) {
    // var entid = e.entid;
    this.getMovieHeaderBaseInfo(e.entid);
    // this.getCinameLine(e.entid);
    wx.getSystemInfo({
        success: function(res) {
            if(res.platform == 'android'){
                that.setData({
                    index_page_android: 'index_page_android'
                })
            }
        }
    })
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

        data.ReleaseDays > 0 ? releaseClassName = '' : (data.BoxOfficePoint ? boxOfficePointClassName = '' : comingClassName = '');

        data._BoxOfficeToTal = utils.getHundredMillion(data.BoxOfficeToTal);
        data._BoxOfficePoint = utils.getHundredMillion(data.BoxOfficePoint);
        data._BoxOfficeFirstDay = utils.getHundredMillion(data.BoxOfficeFirstDay);
        data._BoxOfficeFirstWeek = utils.getHundredMillion(data.BoxOfficeFirstWeek);
        data._BoxOfficeWeekEnd = utils.getHundredMillion(data.BoxOfficeWeekEnd);
        

        data.Event = data1.Event ? utils.getFormattedNum(data1.Event) : '-';
        data.PlaneNews = data1.PlaneNews ? utils.getFormattedNum(data1.PlaneNews) : '-';
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
        // that.getCinameLine(data.DBOMovieID);
        that.dBOMovieID = data.DBOMovieID;
        that.EFMTMovieID = data.EFMTMovieID;
        that.ReleaseDate = data.ReleaseDate;
        that.getTimeIntervalList(data.DBOMovieID);
        that.getMovieEventList(data.EFMTMovieID);
      })
  },

    // 院线
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
            try{
                var lineLists = result,
                    data2 = lineLists.data2,
                    data2Len = data2.length,
                    item;
                lineLists.data1[0].SumBoxOffice = utils.getHundredMillion (lineLists.data1[0].SumBoxOffice, '万');
                lineLists.data1[0].BoxPercent = lineLists.data1[0].BoxPercent ? lineLists.data1[0].BoxPercent.toFixed(1) + '%' : '-';

                for(var i = 0; i < data2Len; i++){
                    item = data2[i];
                    item.BoxOffice = utils.getHundredMillion (item.BoxOffice, '万');
                    item.BoxPercent = item.BoxPercent ? item.BoxPercent.toFixed(1) + '%' : '-';
                    data2[i] = item;
                }
                lineLists.data2 = data2;
                that.setData({
                    lineLists: lineLists
                })
            }catch(err){
                console.log(err)
            }
            that.setData({
                hiddenLoading: true
            })
        });
    },

    // 时段
    getTimeIntervalList: function(DBOMovieID){
        var that = this,
            sDate = utils.prevDay(this.ReleaseDate),
            eDate = utils.getIndexDaysStr(this.ReleaseDate, 7),
        param = {
            _MovieID: DBOMovieID,
            _Order: 102,
            _OrderType: 'DESC',
            _Date: sDate + ',' + eDate,
            _DateSort: 'Self',
            _sDate: sDate,
            _eDate: eDate,
            _Line: '',
            _City: '',
            _CityLevel: '',
            _Index: '102,201,221,222,604',
            r: Math.random()
        };
        
        model.post("/Movie/GetTimeInterval_List", param, function (result, msg) {
         try{   
            var lists = result,
                data2 = lists.data2,
                data2Len = data2.length,
                item;
            lists.data1[0].SumBoxOffice = lists.data1[0].SumBoxOffice ? utils.getHundredMillion (lists.data1[0].SumBoxOffice, '万') : '-';
            lists.data1[0].ShowPercent = lists.data1[0].ShowPercent ? lists.data1[0].ShowPercent.toFixed(1) + '%' : '-';
            lists.data1[0].BoxPercent = lists.data1[0].BoxPercent ? lists.data1[0].BoxPercent.toFixed(1) + '%' : '-';

            for(var i = 0; i < data2Len; i++){
                item = data2[i];
                item.BoxOffice = utils.getHundredMillion (item.BoxOffice, '万');
                item.ShowPercent = item.ShowPercent ? item.ShowPercent.toFixed(1) + '%' : '-';
                item.BoxPercent = item.BoxPercent ? item.BoxPercent.toFixed(1) + '%' : '-';
                item.columnList = item.ColumnList ?  item.ColumnList.split('|') : [];
                item.isAppointment = new Date(item.columnList[0] + ' 00:00:00') * 1 > new Date(that.data.date + ' 00:00:00') * 1 ? true : false;
                data2[i] = item;
            }
            lists.data2 = data2;
            that.setData({
                timeLists: lists,
                hiddenLoading: true
            })
         }catch(err){
             console.log(err)
         }
        });
    },

    // /Movie/GetMarketing_EventList
    getMovieEventList: function(EFMTMovieID){
        var that = this,
        param = {
            _MovieID: EFMTMovieID,
            r: Math.random()
        };
        
        model.post("/Movie/GetMarketing_EventList", param, function (result, msg) {
            try{
                var lists = result;
                // var lists = 
                lists.data1Len = lists.data1.length;
                lists.data2Len = lists.data2.length;
                var item;
                for(var i = 0; i < lists.data1Len; i++){
                    item = lists.data1[i];
                    if(item.ReleaseDays >=1){
                        item._ReleaseDays = '上映日';
                    }else{
                        item._ReleaseDays = '前' + Math.abs(item.ReleaseDays) + '天';
                    }
                }
                that.setData({
                    movieEventList: lists,
                    hiddenLoading: true
                })
            }catch (err){
                console.log(err)
            }
        });
    },

    // 点击标签
    changeItem: function(e){
        var el = e.target,
            current = el.dataset.current;
        if(current == 0){
            this.getTimeIntervalList(this.dBOMovieID)
            this.getMovieEventList(this.EFMTMovieID);
            this.setData({
                movietimeclass: 'current',
                movielineclass: '',
                movieFormItemClass: 'm-hide',
                seblistClass: '',
                hiddenLoading: false
            })
        }else if(current == 1){
            
            this.getCinameLine(this.dBOMovieID);
            this.setData({
                movietimeclass: '',
                movielineclass: 'current',
                movieFormItemClass: '',
                seblistClass: 'm-hide',
                hiddenLoading: false
            })
        }
    }

})