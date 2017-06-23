$(function () {
    smGlobal.headFixed("head", "content");
})
var smGlobal = (function () {
    var headFixed = function (obj1, obj2) {
        if (isWeiXin()) {
            $(".header ").hide();
        }
        var objHeight = $("." + obj1).height();
        $("." + obj2).css("paddingTop", objHeight);
    }
    /*判断是否是微信浏览器*/
    var isWeiXin = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }
    /*暂无数据自定义图标*/
    var nullInfo2 = function (con_obj, selector, message) {
        var content_info = '<div class="nodata_shop">' +
          '<p class="no-icon ' + selector + '"></p>' +
          '<p class="nodatatip">' + message + '</p>' +
          '</div>';
        con_obj.html(content_info);
    }
    /*暂无数据*/
    var nullInfo = function (con_obj, message) {
        var content_info = '<div class="nodata_shop">' +
       '<p class="no-icon wdgwc"></p>' +
       '<p class="nodatatip">' + message + '</p>' +
       '</div>';
        con_obj.html(content_info);
    }
    /*清除提示框*/
    var clearerror = function () {
        $('body').find('.onError').fadeOut(500);
    }
    /*错误提示框*/
    var error = function (errorval) {
        if (typeof errorval == "object") {
            if (errorval.readyState != undefined) {
                alert("网络异常,请刷新重试");
                return;
            }
            if (JSON && JSON.stringify) {
                errorval = JSON.stringify(errorval);
                alert(errorval);
                return;
            }
        }
        if ($(".onError").length > 0) {
            $(".onError").show().text(errorval)
        } else {
            $('body').append('<div class="onError">' + errorval + '</div>');
        }
        setTimeout(clearerror, 800);
    }
    var clearAuto = function () {
        $('body').find('.onErrorAuto').fadeOut();
    }
    /*错误提示框*/
    var heiAutoError = function (errorval, timeOut) {
        if (errorval && errorval.responseText) {
            $('body').html(errorval.responseText);
            timeOut = 500000;
        }
        if ($(".onErrorAuto").length > 0) {
            $(".onErrorAuto").show().text(errorval)
        } else {
            $('body').append('<div class="onErrorAuto">' + errorval + '</div>');
        }
        setTimeout(clearAuto, timeOut);
    }
    var loadding = function () {
        var load_info = '<div class="nodata">' +
            '<p class="no-icon wdgwc"></p>' +
            '<p class="nodatatip">' + '正在加载中' + '</p>' +
            '</div>';
        $("#load").append(load_info);
    }
    var loadding3 = function () {
        var loadingHtml = '<div isglobleLoad="true" class="loading3"></div>';
        $('body').append(loadingHtml);
    }
    var loadingShowBlock = function () {
        var loadingHtml = '<div isglobleLoad="true" class="loadingShowBlock"></div>';
        $('body').append(loadingHtml);
    }
    var loadingFixed = function () {
        var loadingHtml = '<div isglobleLoad="true" class="loadingFixed"></div>';
        $('body').append(loadingHtml);
    }
    var fixbg = function () {
        var loadingHtml = '<div isglobleLoad="true" class="fixbg"></div>';
        $('body').append(loadingHtml);
    }
    var loadingWithGif = function () {
        var loadImgHtml = '<div isglobleLoad="true" style="text-align:center;margin:0 auto;margin-top:3rem"><img src="/Content/Images/preloaderBg.png"/></div>';
        $('body').append(loadImgHtml);
    }
    var removeLoadingGif = function () {
        $("div[isglobleLoad]").remove();
    }

    var loadingHomeGif = function () {
        $("div[isglobleLoad]").show();
    }
    var hideHomeGif = function () {
        $("div[isglobleLoad]").hide();
    }
    var removeHomeGif = function () {
        $("div[isglobleLoad]").remove();
    }

    var getQueryString = function (key) {
        var reg = new RegExp("(^|\\?|&)"+ key +"=([^&]*)(\\s|&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var items = '';
        if (r != null) {
            try{
                items = decodeURIComponent(decodeURIComponent(r[2])).trim(); 
            }catch(e){
                try{
                    items = decodeURIComponent(r[2]).trim();
                }catch(e){
                    items = r[2].trim();
                }
            }
        }
        return items;
    }
    var dateSplit = function (str) {
        arry = [];
        var list = pointSplit(str);
        return list;
    }
    var arry = []
    var pointSplit = function (str) {
        str = str.toString();
        var arr = {};
        if (str.indexOf(".") != -1) {
            arry.push(str.split(".")[0]);
            str1 = str.split(".")[1];
            pointSplit(str1);
        } else {
            arry.push(str);
        }
        return arry;
    }

    var complete = function (XMLHttpRequest, textStatus) {
        $(".nodata").remove();
    }
    var empty = function (con_obj, message) {
        var content_info = '<div class="nodata">' +
          '<p class="no-icon wdgwc"></p>' +
          '<p class="nodatatip">' + message + '</p>' +
          '</div>';
        $(con_obj).html(content_info);
    }
    return {
        headFixed: headFixed,
        isWeiXin: isWeiXin,
        error: error,
        heiAutoError: heiAutoError,
        loadding: loadding,
        loadingWithGif: loadingWithGif,
        removeLoadingGif: removeLoadingGif,
        complete: complete,
        clearAuto: clearAuto,
        empty: empty,
        removeHomeGif: removeHomeGif,
        getQueryString: getQueryString,
        dateSplit: dateSplit,
        nullInfo: nullInfo,
        loadingHomeGif: loadingHomeGif,
        nullInfo2: nullInfo2,
        loadding3: loadding3,
        loadingFixed: loadingFixed,
        loadingShowBlock: loadingShowBlock,
        hideHomeGif:hideHomeGif,
        fixbg: fixbg
    };
})();

