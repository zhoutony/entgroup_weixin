//index.js
let utils = require('../../utils/util.js')
let model = require('../../utils/model.js');
let _ = require('../../utils/underscore.modified.js');
Page({
    data: {
        background: ['green', 'red', 'yellow'],
        indicatorDots: true,
        vertical: false,
        autoplay: true,
        interval: 3000,
        duration: 800,
        date: utils.formatTime( new Date ),
        movie_list: [],
        totalBoxOffice: 0,
        totalBoxOfficeUnits: '',
        comingMovieList: [],
        movielineAndCityClass: 'm-hide',
        boxofficeOptionClass: 'm-hide'
    },
    onLoad: function () {
        this._loadData();
        this.loadComingMovieListTop();
    },
    _loadData: function(){
        wx.showNavigationBarLoading();
        let that = this,
            toDay = this.data.date;
        this.pageIndex = 1;
        
        var param = {
            _IsChart: 0,
            _Order: 201,
            _OrderType: 'DESC',
            _PageIndex: this.pageIndex,
            _PageSize: 50,
            _Date: toDay,
            _DateSort: 'Day',
            _sDate: toDay,
            _eDate: toDay,
            _Line: '',
            _City: '',
            _CityLevel: '',
            _Index: ['101,102,201,225,606'],
            r: Math.random()
        };
        
        model.post("/Movie/GetIndex_List", param, function (result, msg) {
            wx.hideNavigationBarLoading();
            let movie_list = result.data2,
                movieListLen = movie_list.length,
                _totalBoxOffice = utils.getHundredMillion(result.data1[0].TotalBoxOffice),
                item, columnList;
            for(let i = 0; i < movieListLen; i++){
                item = movie_list[i];
                columnList = item.ColumnList ?  item.ColumnList.split('|') : [];
                item.movieName = columnList[2];
                item.movieTotalBoxOffices = utils.getHundredMillion(columnList[4]);
                // item.Attendance = item.Attendnce.toFixed(1);
                item.BoxOffice = utils.getHundredMillion(item.BoxOffice, '万');
                item._columnList = columnList;
                movie_list[i] = item;
            }
            that.setData({
                totalBoxOffice: _totalBoxOffice.num,
                totalBoxOfficeUnits: _totalBoxOffice.units,
                movie_list: movie_list
            })
        });
    },
    loadComingMovieListTop: function(){
        let that = this;  
        var param = {
            r: Math.random()
        };
        model.post("/Movie/ComingMovieListTop", param, function (result, msg) {
            that.setData({
                comingMovieList: result.data1
            })
        })
    },
    
    changeIndicatorDots: function (e) {
        this.setData({
            indicatorDots: !this.data.indicatorDots
        })
    },
    changeVertical: function (e) {
        this.setData({
            vertical: !this.data.vertical
        })
    },
    changeAutoplay: function (e) {
        this.setData({
            autoplay: !this.data.autoplay
        })
    },
    intervalChange: function (e) {
        this.setData({
            interval: e.detail.value
        })
    },
    durationChange: function (e) {
        this.setData({
            duration: e.detail.value
        })
    },
    //切换日期
    bindDateChange: function(e){
        this.setData({
            date:e.detail.value
        })
        this._loadData();
    },
    // 前一天
    tapPrevDay: function (e) {
        let day = utils.prevDay(this.data.date);
        this.setData({
            date: day
        })
        this._loadData();
    },
    // 后一天
    tapNextDay: function (e){
        let day = utils.nextDay(this.data.date);
        this.setData({
            date: day
        })
        this._loadData();
    },
    // 跳转到影片详情页
    gotomoviedetail: function(e){
        let el = e.currentTarget,
            movie_no = el.id;
        wx.navigateTo({
            url: '../moviedetail/moviedetail?movie_no=' + movie_no
        })
    },
    // 监听点击筛选按钮
    tapShowScreen: function(e) {
        this.setData({
            movielineAndCityClass: ''
        })
    },
    tapHideScreen: function(e) {
        this.setData({
            movielineAndCityClass: 'm-hide',
            boxofficeOptionClass: 'm-hide'
        })
    },
    // 监听点击更多指标按钮
    tapBoxofficeOptionShow: function(e) {
        this.setData({
            boxofficeOptionClass: ''
        })
    },
    tapBoxofficeOptionHide: function(e) {
        this.setData({
            boxofficeOptionClass: 'm-hide'
        })
    },
    // 监听下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.onLoad();
    },
    // 分享
    onShareAppMessage: function () {
        return {
            title: '艺恩电影智库',
            desc: '影片票房列表',
            path: '/pages/index/index?id=123'
        }
    }
})