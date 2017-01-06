/**
 * Created by cdmatom on 2017/1/1.
 */
var base = "https://mobileapi.entgroup.cn";//  https://mobileapi.bivan.cn
module.exports = {
    isOk: function (res) {
        // return (res.statusCode === 200 || res.statusCode === "200") &&
        //     res.errMsg == "request:ok";
        return true;
    },
    getMsg: function (res) {
        return {statusCode: res.statusCode, errMsg: res.errMsg};
    },
    request: function (options) {
        var that = this,
            url = base + options.url,
            method = options.method ? options.method : "post";

        var param = {
            url: url,
            method: method,
            data: options.data,
            success: function (res) {
                if (that.isOk(res)) {
                    var data = res.data;
                    var msg = that.getMsg(res);

                    if (options.success) options.success(data, msg);
                }
                else {
                    console.log("request:error");
                }
            },
            fail: function (res) {
                console.log("res" + res);
            },
            complete: function (res) {
                console.log("request:complete::" + res);
            }
        }
        wx.request(param);
    },
    post: function (url, data, success, fail, complete) {
        var that = this,
            url = base + url,
            method = "post";

        var param = {
            url: url,
            method: method,
            data: data,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (that.isOk(res)) {
                    var data = res.data;
                    var msg = that.getMsg(res);

                    if (success)success(data, msg);
                }
                else {
                    console.log("request:error");
                }
            },
            fail: function (res) {
                console.log("request:fail" + res);
            },
            complete: function (res) {
                // console.log("request:complete" + JSON.stringify(res));
            }
        }
        wx.request(param);
    }
}