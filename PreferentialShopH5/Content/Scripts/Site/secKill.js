
var userid = 0;
var model;
var tabsIndex = 0;
var homeDataModel = function () {
    var self = this;
    self.list = ko.observableArray([]);
    self.homeImgs = ko.observableArray([]);
    self.allHomeImgs = ko.observableArray([]);
    self.todayBuyings = ko.observableArray([]);
    self.tomorrowBuyings = ko.observableArray([]);
    self.snapUplength = ko.observable();
}
$(function () {
    locationID = getCookie("locationID") ? getCookie("locationID") : 1;
    model = new homeDataModel();
    ko.applyBindings(model);
    var ii = 0;
    var ipL = new iplocation();
    //ipL.setDefaultCity();
    ipL.init(homeDataGet);
});

var homeDataGet = function (type) {
    $("#location .location_city").text(getCookie("locCurCityName",true) + getCookie("locCurDistrict", true)).attr("data-id", getCookie("locCurCityID"));
    if (type != "first" && type != "has" && type) {
        return;
    }
    var areaId = 1;
    var locationID = getCookie("locationID") ? getCookie("locationID") : 1;
    var cityName = getCookie("locationCityName");
    $(".locaarea .location_city").text(cityName).attr("data-id", locationID);
    //alert(locationID)
    $("#sliders").html("");
    apiRequest({
        method: "Home/GetHomeData",
        async: false,
        data: { "AreaId": locationID },
        success: function (obj) {

            //console.log(list);
            $(".homecontentList").show();
            smGlobal.removeHomeGif();
            model.list(obj.data.modules);

            model.allHomeImgs(obj.data.homeImgs);
            //todayBuyings
            //tomorrowBuyings
            if (obj.data.homeImgs.length > 5) {
                var tempArr = [];
                tempArr = tempArr.concat(obj.data.homeImgs);
                model.homeImgs(tempArr.splice(0, 5));
            } else {
                model.homeImgs(obj.data.homeImgs);

            }
            var data = [], tomData = [];
            var params = obj.data.todayBuyings;
            var tomorrowBuyings = obj.data.tomorrowBuyings;

            for (var i = 0; i < params.length; i++) {
                var arguments = {};
                arguments["picUrl"] = params[i]["src"];
                arguments["endTime"] = params[i]["endTime"];
                arguments["startTime"] = params[i]["startTime"];
                arguments["isOver"] = params[i]["isOver"];
                arguments["status"] = params[i]["status"];

                arguments["link"] = '/product/detail?activityId=' + params[i]["promotionId"];
                data.push(arguments)
            }
            for (var i = 0; i < tomorrowBuyings.length; i++) {
                var tomoArguments = {};
                tomoArguments["picUrl"] = tomorrowBuyings[i]["src"];
                tomoArguments["endTime"] = tomorrowBuyings[i]["endTime"];
                tomoArguments["startTime"] = tomorrowBuyings[i]["startTime"];
                tomoArguments["isOver"] = tomorrowBuyings[i]["isOver"];
                tomoArguments["status"] = tomorrowBuyings[i]["status"];
                //tomoArguments["link"] = "javascript:alert('活动还未开始，敬请期待！')";
                tomoArguments["link"] = '/product/detail?activityId=' + tomorrowBuyings[i]["promotionId"];
                tomData.push(tomoArguments)
            }
            model.todayBuyings(data);
            model.snapUplength(model.todayBuyings().length)
            model.tomorrowBuyings(tomData);
            $("#sliders").xrSlider({ data: data });
            //$("#tomSliders").xrSlider({ data: tomData });
            ratio(7 / 5, ".imgbox");
            checkGoodsCount();
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            $(".homecontentList").show();
            smGlobal.error(obj);
        }
    });
}


var checkGoodsCount = function () {
    var promotionsDiv = $('div[data-bind="foreach:promotions"]');
    promotionsDiv.each(function (index, ele) {
        if ($(ele).children().length % 2 != 0) {
            $(ele).append(getDefaultImgHtml($($(ele).children()[0]).css("height")));
        }
    });
}

function getDefaultImgHtml(height) {
    var styleArr = height.split('p');
    var newHeight = parseFloat(styleArr[0]) - 5;
    newHeight += "px";
    var htmlStr = '<div class="categBox box fl pb2">';
    htmlStr += '<div class="fl full-width imgbox" style="margin-bottom:0.6rem;height:' + newHeight + '"><a href=javascript:void(0)><img class="fl" src="/Content/Images/indexdefaultImgIco.png"></a></div>';
    htmlStr += '</div>';
    return htmlStr;
}

var ratio = function (ratioNum, obj) {
    var objWidth = $(obj).width();
    var ratioHeight = objWidth / ratioNum * 1;
    $(obj).css("height", ratioHeight);
}
function formatTime(second) {
    return [parseInt(second / 60 / 60), second / 60 % 60, second % 60].join(":")
    .replace(/\b(\d)\b/g, "0$1");
}
function autoLogin(obj) {
    var openid = getCookie("OpenId") ? getCookie("OpenId") : "";
    apiRequest({
        method: 'User/Login3_1',
        async: false,
        data: { "OpenId": openid, "LoginSystem": 3 },
        success: function (list) {
            if (list.isBizSuccess && list.isSkip) {

            } else if (list.count > 1) {
                window.location.href = "/account/login?isLogin=1";
                return;
            }
        },
        error: function (data) {
            window.location.href = "/account/login?isLogin=1";
            return;
        }
    });
}

$(".skillTitle li").click(function () {
    tabsIndex = $(".skillTitle li").index(this);
    //console.log(interval);
    clearInterval(interval);
    clearInterval(_intervalID);
    $(this).addClass("cur").siblings().removeClass("cur");
    $("#sliders").html("");
    switch (tabsIndex) {
        case 0:
            model.snapUplength(model.todayBuyings().length)
            $("#sliders").xrSlider({ data: model.todayBuyings() });
            break;
        case 1:
            model.snapUplength(model.tomorrowBuyings().length)
            $("#sliders").xrSlider({ data: model.tomorrowBuyings() });
            break;
        default:
            model.snapUplength(model.todayBuyings().length)
            $("#sliders").xrSlider({ data: model.todayBuyings() });
            break;
    }

})