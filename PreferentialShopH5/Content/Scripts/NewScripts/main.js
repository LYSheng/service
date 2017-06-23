var baseUrl = window.location.protocol + '//' + window.location.host;
$(function () {
    $(".skips").click(function() {
        var linkUrl = $(this).attr('data-src');
        UrltoStorage();
        window.location.href = linkUrl;
        return false;
    });

    $(".back").click(function () {
        window.history.back();
        return;
        if ($(this).attr('backurl') != undefined && $(this).attr('backurl') != null && $(this).attr('backurl') != '') {
            window.location.href = $(this).attr('backurl');
        } else {
            arr = localStorage.historyURL;
            arr = eval(arr);
            backurl = arr.pop();
            arr = JSON.stringify(arr);
            localStorage.historyURL = arr;
            if (backurl == '' || backurl == null || backurl == undefined) {
                backurl = baseUrl + '/home/index';
            }
            window.location.href = backurl;
        }
    });

});


function UrltoStorage() {
    var url = window.document.location.href.toString();
    var u = url.split("?");
    var url_main = u[0].split("/");
    var method = url_main.pop();
    var controller = url_main.pop();
    if ((controller == 'home' && method == 'index') || (controller == 'home' && method == 'find') || (controller == 'userAbout' && method == 'index')) {
        //如果当前页面为首页则清除localstorage.historyURL
        localStorage.removeItem('historyURL');
        arr = new Array();
        arr.push(url);
        arr = JSON.stringify(arr);
        localStorage.historyURL = arr;
    } else {
        arr = localStorage.historyURL;
        if (arr == undefined || arr == null || arr == '') {
            arr = new Array();
        } else {
            arr = eval(arr);
        }
        //比较最后一条是否相同（待改进，可以通过控制器方法名判断）
        lasturl = arr.pop();
        if (url == lasturl) {
            arr.push(lasturl);
        } else {
            arr.push(lasturl);
            arr.push(url);
        }
        arr = JSON.stringify(arr);
        localStorage.historyURL = arr;
    }
}

//返回URL控制器名
function UrlC(content) {
    if (content) {
        u = content.split("?");
        url_main = u[0].split("/");
        url_main.pop();
        controller = url_main.pop();
        return controller;
    }
}
//返回URL方法名
function UrlM(content) {
    if (content) {
        u = content.split("?");
        url_main = u[0].split("/");
        method = url_main.pop();
        return method;
    }
}

//加载首页时重置localStorage.historyURL;
var url = window.document.location.href.toString();
var method = UrlM(url);
var controller = UrlC(url);
if ((controller == 'home' && method == 'index') || (controller == 'home' && method == 'find') || (controller == 'userAbout' && method == 'index')) {
    //如果当前页面为首页则清除localstorage.historyURL
    localStorage.removeItem('historyURL');
    arr = new Array();
    arr.push(url);
    arr = JSON.stringify(arr);
    localStorage.historyURL = arr;
} else {
    arr = localStorage.historyURL;
    if (arr == undefined || arr == null || arr == '') {
        arr = new Array();
    } else {
        arr = eval(arr);
        //比较最后一条是否与当前页面相同，如相同则去除
        lasturl = arr.pop();
        if ((UrlC(lasturl) != UrlC(url)) || (UrlM(lasturl) != UrlM(url))) {
            arr.push(lasturl);
        }
        arr = JSON.stringify(arr);
        localStorage.historyURL = arr;
    }
}

var $_GET = (function () {
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if (typeof (u[1]) == "string") {
        u = u[1].split("&");
        var get = {};
        for (var i in u) {
            var j = u[i].split("=");
            get[j[0]] = j[1];
        }
        return get;
    } else {
        return {};
    }
})();

//将获取到的  /Date(1451114192000+0800)/ 格式的时间转化成时间戳
DoTime = function (Dtime) {
    var NewTime = new Date();
    if (Dtime) {
        if (Dtime.indexOf('D') < 0) {
            return formatDate(NewTime, new Date(Dtime));
        } else {
            var PublishTime = parseInt(Dtime.substr(6, 13));
            var PublishTime = new Date(PublishTime);
            return formatDate(NewTime, PublishTime);
        }
    }
}

//通用时间处理
function formatDate(NewTime, PublishTime) {
    var result = '';
    var date = '';
    var time = '';
    var Pmonth = PublishTime.getMonth();          //发布时的日
    var Pdate = PublishTime.getDate();            //发布时的日
    var Ndate = NewTime.getDate();                //现在日
    var Ddata = Ndate - Pdate;                      //相差天数
    var Pmonth = PublishTime.getMonth() + 1;         //发布的月份
    var Nmonth = NewTime.getMonth() + 1;            //现在月份
    var Dmonth = Nmonth - Pmonth;                   //相差月份
    var Nhours = NewTime.getHours();                 //现在的时
    var Phours = PublishTime.getHours();             //发布的时
    var Dhours = Nhours - Phours;                   //相差天数
    var Nminutes = NewTime.getMinutes();
    var Pminutes = PublishTime.getMinutes();
    var Dminutes = Nminutes - Pminutes;
    var time_distance = NewTime - PublishTime;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var weekC = time_distance / (7 * day);
    var dayC = time_distance / day;
    var hourC = time_distance / hour;
    var minC = time_distance / minute;
    var sec = time_distance / 1000;

    if (Dmonth >= 1) {
        date = Pmonth + "-" + Pdate;
    } else {
        if (Ddata > 2) {
            if (Pdate < 10) {
                Pdate = "0" + Pdate;
            }
            date = Pmonth + "-" + Pdate;            //当返回的天数差值大于2天时  返回 月：日

        } else if (Ddata == 2) {
            date = '前天';                      //当返回的天数差值等于2天时  返回 前天  

        } else if (Ddata == 1) {
            date = '昨天'; //当返回的天数差值等于1天时  返回 昨天 

        } else {
            date = '今天';
        }
    }

    if (Phours < 10) {
        Phours = "0" + Phours;
    }
    if (Pminutes < 10) {
        Pminutes = "0" + Pminutes;
    }
    time = Phours + ':' + Pminutes;
    result = date + "," + time;
    return result;
}