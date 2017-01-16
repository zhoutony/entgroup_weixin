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
        index_page_android: '',
        setSelectIndexGetLists: [],
        setSelectIndexGetListOption: [],
        itemClassName: '',
        weekData: ''
    },
    onLoad: function () {
        var that = this;
        this.pageIndex = 1;
        this.movieList = [];
        this.setSelectIndex = [];
        this.setSelectIndexTemporary = [];
        this.isNavigateTo = true;
        // wx.setStorage({
        //     key: "selectIndexGetLists",
        //     data: ['201', '202', '606']
        // })
        wx.getStorage({
            key: 'selectIndexGetLists',
            complete: function(res){
                if(res.data){
                    that.setSelectIndex = res.data;
                }else{
                    that.setSelectIndex = ['201', '202', '606'];
                }
                that.setSelectIndexTemporary = that.setSelectIndex.join().split(',');
                that._loadData();
                that.loadComingMovieListTop();
                wx.getSystemInfo({
                    success: function(res) {
                        if(res.platform == 'android'){
                            that.setData({
                                index_page_android: 'index_page_android'
                            })
                        }
                    }
                })
            }
        })

                    
    },
    ///Shared/_SelectIndex_GetList
    loadSelectIndexGetList: function(){
        var that = this,
            len = that.setSelectIndex.length,
            itemClassName = '';
        if(len == 1){
            itemClassName = 'width100';
        }else if(len == 2){
            itemClassName = 'width50';
        }
        var param = {
            _PageUrl: '/Movie/Index',
            _PageType:'Day'
        };
        model.post("/Shared/_SelectIndex_GetList", param, function (result, msg) {
            try{
                var selectIndexGetLists = that.selectIndexMethod(result, that.setSelectIndex);
                that.setData({
                    setSelectIndexGetLists: selectIndexGetLists,
                    setSelectIndexGetListOption: selectIndexGetLists,
                    movie_list: that.movieList,
                    hiddenLoading: true,
                    itemClassName: itemClassName
                })
            }catch(err){
                console.log(err)
            }
        })

    },
    _loadData: function(){
        this.setData({
            hiddenLoading: false
        })
        var that = this,
            _day = this.data.date,
            toDay = utils.formatTime( new Date );
        
        var param = {
            _IsChart: 0,
            _Order: 201,
            _OrderType: 'DESC',
            _PageIndex: this.pageIndex,
            _PageSize: 50,
            _Date: _day,
            _DateSort: 'Day',
            _sDate: _day,
            _eDate: _day,
            _Line: '',
            _City: '',
            _CityLevel: '',
            _Index: '101,102,' + this.setSelectIndex.join(','), //101,102,201,202,221,222,225,251,606
            r: Math.random()
        };
        
        model.post("/Movie/GetIndex_List", param, function (result, msg) {
            wx.hideNavigationBarLoading();
            try{
                var movie_list = result.data2,
                    movieListLen = movie_list.length,
                    _totalBoxOffice = utils.getHundredMillion(result.data1[0].TotalBoxOffice),
                    item, columnList;
                that.pageIndex += 1;
                that.totalPage = result.data3[0].TotalPage;
                for(var i = 0; i < movieListLen; i++){
                    item = movie_list[i];
                    columnList = item.ColumnList ?  item.ColumnList.split('|') : [];
                    item.ReleaseDate = utils.getIndexDaysStr(_day, -(columnList[3]));
                    item.movieName = columnList[2];
                    item.movieTotalBoxOffices = utils.getHundredMillion(columnList[4]);
                    item.BoxOffice = item.BoxOffice ? utils.getHundredMillion(item.BoxOffice, '万') : '-';
                    item.ShowCount = item.ShowCount ? utils.getFormattedNum(item.ShowCount) : '-';
                    item.AudienceCount = item.AudienceCount ? utils.getFormattedNum(item.AudienceCount) : '-';
                    item.OfferSeat = item.OfferSeat ? utils.getFormattedNum(item.OfferSeat) : '-';
                    item.SumBoxOffice = item.SumBoxOffice ? utils.getHundredMillion(item.SumBoxOffice, '万') : '-';
                    item.BoxPercent = item.BoxPercent ? item.BoxPercent.toFixed(1) + '%' : '-';
                    item.ShowPercent = item.ShowPercent ? item.ShowPercent.toFixed(1) + '%' : '-';
                    item.OfferSeatPercent = item.OfferSeatPercent ? item.OfferSeatPercent.toFixed(1) + '%' : '-';
                    item.AvgBoxOffice = item.AvgBoxOffice ? item.AvgBoxOffice : '-';
                    item.LineBoxPercent = item.LineBoxPercent ? item.LineBoxPercent.toFixed(1) + '%' : '-';
                    item.OnLineBoxPercent = item.OnLineBoxPercent ? item.OnLineBoxPercent.toFixed(1) + '%' : '-';
                    item.AvgShowPeople = item.AvgShowPeople ? item.AvgShowPeople : '-';
                    item.Attendance = item.Attendance ? item.Attendance.toFixed(1) + '%' : '-';
                    item._columnList = columnList;
                    movie_list[i] = item;
                }
                that.movieList = that.movieList.concat( movie_list );
                that.setData({
                    weekData: that.getDayData(toDay, _day),
                    totalBoxOffice: _totalBoxOffice.num,
                    totalBoxOfficeUnits: _totalBoxOffice.units
                })
                that.loadSelectIndexGetList();
            }catch(err){
                console.log(err);
            }
        });
    },
    loadComingMovieListTop: function(){
        var that = this;  
        var param = {
            r: Math.random()
        };
        model.post("/Movie/ComingMovieListTop", param, function (result, msg) {
            try{
                that.setData({
                    comingMovieList: result.data1
                })
            }catch(err){
                console.log(err)
            }
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
            entid = el.id,
            that = this;
        if(this.isNavigateTo){
            this.isNavigateTo = false;
            wx.navigateTo({
                url: '../moviedetail/moviedetail?entid=' + entid,
                complete: function(){
                    setTimeout(function(){
                        that.isNavigateTo = true;
                    }, 2000);
                }
            })
        }
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
    
    // 监听下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.onLoad();
    },
    // // 监听滚动到底部
    // lower: function(e){
    //     if(this.pageIndex <= this.totalPage){
    //         this.pageIndex += 1;
    //         this._loadData();
    //     }
    // },
    // 监听点击更多指标按钮
    radioChange: function(e){
        var selected = e.target.dataset.selected,
            indexid = e.target.dataset.indexid,
            _index;
        if(selected == 'true'){
            _index = this.setSelectIndexTemporary.indexOf(indexid);
            this.setSelectIndexTemporary.splice(_index,1);
        }else if(selected == 'false'){
            this.setSelectIndexTemporary.push(indexid); //.sort()
        }

        var selectIndexGetLists = this.selectIndexMethod(this.data.setSelectIndexGetLists, this.setSelectIndexTemporary);
        this.setData({
            setSelectIndexGetListOption: selectIndexGetLists
        })
    },
    // 监听点击更多指标按钮 显示/关闭
    tapBoxofficeOptionShow: function(e) {
        this.setData({
            boxofficeOptionClass: ''
        })
    },
    tapBoxofficeOptionHide: function(e) {
        this.setData({
            boxofficeOptionClass: 'm-hide'
        })
        this.setSelectIndexTemporary = this.setSelectIndex.join().split(',');
        var selectIndexGetLists = this.selectIndexMethod(this.data.setSelectIndexGetLists, this.setSelectIndex);
        this.setData({
            setSelectIndexGetListOption: selectIndexGetLists
        })
    },
    // 监听点击更多指标按钮 确定
    tapBoxofficeOptionConfirm: function(e){
        var len = this.setSelectIndexTemporary.length;
        if(len <= 0){
            wx.showToast({
                title: '至少选择一项指标',
                duration: 5000
            })

            setTimeout(function(){
                wx.hideToast()
            },2000)
            return;
        }

        this.setSelectIndex = this.setSelectIndexTemporary.join().split(',');
        var selectIndexGetLists = this.selectIndexMethod(this.data.setSelectIndexGetLists, this.setSelectIndex);
        this.setData({
            // setSelectIndexGetLists: selectIndexGetLists,
            boxofficeOptionClass: 'm-hide'
        })
        wx.setStorage({
            key: "selectIndexGetLists",
            data: this.setSelectIndex
        })
        this.onLoad();
        
    },
    // 分享
    onShareAppMessage: function () {
        return {
            title: '艺恩电影智库',
            desc: '影片票房列表',
            path: '/pages/index/index?id=123'
        }
    },

    selectIndexMethod: function(SelectIndexs, setSelectIndex){
        var len = SelectIndexs.length,
            selectLen = setSelectIndex.length,
            selectIndexId, item, index,
            that = this,
            movieList = this.movieList,
            movieListLen = movieList.length;
        this.selectIndexNames = {};
        for(var i = 0; i < len; i++){
            item = SelectIndexs[i];
            SelectIndexs[i].selected = false;
            for(var j = 0; j < selectLen; j++){
                selectIndexId = setSelectIndex[j];
                if(item.IndexID == selectIndexId){
                    SelectIndexs[i].selected = true;
                    this.selectIndexNames['is'+item.IndexName] = true;
                }
            }
        }
        for(var k = 0; k < movieListLen; k++){
            _.map(that.selectIndexNames, function(val, key){ 
                movieList[k][key] = val;
            });
        }
        that.movieList = movieList;
        // that.setData({
        //     movie_list: movieList
        // })
        return SelectIndexs;
    },

    getDayData: function(today, _dateStr) {
        var _date = new Date(today),
            _date1 = new Date(_dateStr),
            _dataNum = _date * 1,
            _dataNum1 = _date1 * 1;
        if(_dataNum1 > _dataNum){
            return utils._getDay(_dateStr) + '预售';
        }else if(_dataNum1 == _dataNum){
            return '今日票房';
        }else{
            return utils._getDay(_dateStr);
        }
    }
})