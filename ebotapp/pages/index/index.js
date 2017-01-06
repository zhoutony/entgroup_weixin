//index.js
var utils = require('../../utils/util.js')
var model = require('../../utils/model.js');
var _ = require('../../utils/underscore.modified.js');
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
        boxofficeOptionClass: 'm-hide',
        hiddenLoading: true,
        isScrollY: true,
        index_page_android: ''
    },
    onLoad: function () {
        var that = this;
        this.pageIndex = 1;
        this.movieList = [];
        this._loadData();
        this.loadComingMovieListTop();
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
    _loadData: function(){
        this.setData({
            hiddenLoading: false
        })
        var that = this,
            toDay = this.data.date;
        
        
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
            _Index: '101,102,201,202,221,222,225,251,606', //101,102,201,202,221,222,225,251,606
            r: Math.random()
        };
        
        model.post("/Movie/GetIndex_List", param, function (result, msg) {
            wx.hideNavigationBarLoading();
            var movie_list = result.data2,
                movieListLen = movie_list.length,
                _totalBoxOffice = utils.getHundredMillion(result.data1[0].TotalBoxOffice),
                item, columnList;
            that.pageIndex += 1;
            that.totalPage = result.data3[0].TotalPage;
            for(var i = 0; i < movieListLen; i++){
                item = movie_list[i];
                columnList = item.ColumnList ?  item.ColumnList.split('|') : [];
                item.movieName = columnList[2];
                item.movieTotalBoxOffices = utils.getHundredMillion(columnList[4]);
                item.ShowCount = item.ShowCount ? utils.getFormattedNum(item.ShowCount) : '-';
                item.Attendance = item.Attendance ? item.Attendance.toFixed(1) + '%' : '-';
                item.BoxPercent = item.BoxPercent ? item.BoxPercent.toFixed(1) + '%' : '-';
                item.ShowPercent = item.ShowPercent ? item.ShowPercent.toFixed(1) + '%' : '-';
                item.OfferSeatPercent = item.OfferSeatPercent ? item.OfferSeatPercent.toFixed(1) + '%' : '-';
                item.AvgBoxOffice = item.AvgBoxOffice ? item.AvgBoxOffice : '-';
                item.BoxOffice = utils.getHundredMillion(item.BoxOffice, '万');
                item._columnList = columnList;
                movie_list[i] = item;
            }
            that.movieList = that.movieList.concat( movie_list );
            that.setData({
                totalBoxOffice: _totalBoxOffice.num,
                totalBoxOfficeUnits: _totalBoxOffice.units,
                movie_list: that.movieList,
                hiddenLoading: true
            })
        });
    },
    loadComingMovieListTop: function(){
        var that = this;  
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
        this.pageIndex = 1;
        this.movieList = [];
        this._loadData();
    },
    // 前一天
    tapPrevDay: function (e) {
        var day = utils.prevDay(this.data.date);
        this.setData({
            date: day
        })
        this.pageIndex = 1;
        this.movieList = [];
        this._loadData();
    },
    // 后一天
    tapNextDay: function (e){
        var day = utils.nextDay(this.data.date);
        this.setData({
            date: day
        })
        this.pageIndex = 1;
        this.movieList = [];
        this._loadData();
    },
    // 跳转到影片详情页
    gotomoviedetail: function(e){
        var el = e.currentTarget,
            entid = el.id;
        wx.navigateTo({
            url: '../moviedetail/moviedetail?entid=' + entid
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
    // 监听滚动到底部
    lower: function(e){
        if(this.pageIndex <= this.totalPage){
            this._loadData();
        }
    },
    // 筛选指标
    radioChange: function(e){
        console.log(e)
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