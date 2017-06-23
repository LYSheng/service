/// <reference path="../../../Scripts/Plugin/iScroll/upScoll.js" />
/// <reference path="../base.js" />
/// <reference path="../../../Scripts/jquery-ui-1.8.24.js" />
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
    self.nowMemberBuy = ko.observableArray([]); //本周会员专享
    self.nextMemberBuy = ko.observableArray([]);//下周会员专享
    self.hPromotionList = ko.observableArray([]);//首页配置分类展示
    self.boutique = ko.observableArray([]);//精品推荐
    self.snapUplength = ko.observable();
}
$(function () {
    $("body").on("click", '#divShareLayer', function () { $('#divShareLayer').remove() })
    //smGlobal.loadingHomeGif();
    locationID = getCookie("locationID") ? getCookie("locationID") : 1;
    model = new homeDataModel();
    ko.applyBindings(model);
    var ii = 0;
    var ipL = new iplocation();
    //ipL.setDefaultCity();
    ipL.init(homeDataGet, true);

    $("#broadCastScrollul").scrollQ({
        line: $("#broadCastScrollul li").length,
        scrollNum: 1,
        scrollTime: 2000
    });

    $(".searchArea .searchBotton").focus(function () {
        window.location.href = "/home/search";
    });
    $(".locSure").click(function () {
        var fld = $(this).hasClass("quxiao");
        var curcityid = $(this).attr("data-curcityid");
        var locationcityname = $(this).attr("data-locationcityname");
        $(document.body).css({ "overflow-y": "auto", "position": "static" });
        $(".custom").hide();
        $(".pop_mask").hide();
        if (!fld) {
            setCookie("locationCityName", locationcityname, "", "/", 30);
            setCookie("locationID", curcityid, "", "/", 30);
            $(".locaarea .location_city").text(locationcityname).attr("data-id", curcityid);
            window.location.reload();
        }
        sessionStorage.setItem("locationFlag", true);
    });
    $('.homeImgs').delegate(".productPraise,.praiseCount", "click", function () {
        ProductPraise(this);
    });

    //$('.loadMore').click(function () {
    //   model.homeImgs(model.allHomeImgs());
    //});
    $(window).scroll(function () {
        if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
            if (model.homeImgs().length != model.allHomeImgs().length) {
                model.homeImgs(model.allHomeImgs());
            }
        }
    });


    $('.homeImgs').delegate(".new_share", "click", function () {

        if (!getCookie(".ASPXAUTHH5")) {
            autoLogin(this);
            return;
        }
        if (!isShareLoadOk) {
            smGlobal.error("等待加载完成！");
            return;
        }



        var shareTitle = $(this).attr("shareTitle");

        var shareDesc = $(this).attr("shareDesc");
        var shareImg = $(this).attr("shareImg");
        var linkUrl = WXMVCUrl + '/Share/Arrive?ReferrerUserId=' + CurrentUserId + "&ReturnUrl=/userAbout/myCoupon";

        wx.onMenuShareAppMessage({
            title: "【Malls·五洲精选】" + hareTitle,
            desc: shareDesc.replace(/\n/g, "").replace(/\r/g, ""), // 分享描述
            link: linkUrl,
            imgUrl: shareImg,
            trigger: function (res) {
                // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
            },
            success: function (res) {
                //   alert('已分享');
            },
            cancel: function (res) {
                //alert('已取消');
            },
            fail: function (res) {
                alert(JSON.stringify(res));
            }
        });
        wx.onMenuShareTimeline({
            title: "【Malls·五洲精选】" + shareTitle + "-" + shareDesc.replace(/\n/g, "").replace(/\r/g, ""),
            desc: '', // 朋友圈不支持
            link: linkUrl,
            imgUrl: shareImgc,
            trigger: function (res) {
                // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
            },
            success: function (res) {
                // alert('已分享');
            },
            cancel: function (res) {
                // alert('已取消');
            },
            fail: function (res) {
                alert(JSON.stringify(res));
            }
        });
        $("body").append("<div id='divShareLayer' class='layer' style='z-index:999;height:100%;width:100%;top:0px;position:fixed;background:rgba(0, 0, 0,0.70);text-align:right'> <img id='sharefriend' style='width:80%;' src='/Content/images/share.png'  /><div>")
    });
});

var homeDataGet = function (type) {
    $("#location .location_city").text(getCookie("locCurCityName", true) + getCookie("locCurDistrict", true)).attr("data-id", getCookie("locCurCityID"));
    if (type != "first" && type != "has" && type) {
        return;
    }
    $("#sliders").html
    var areaId = 1;
    var locationID = getCookie("locationID") ? getCookie("locationID") : 1;
    var cityName = getCookie("locationCityName");
    $(".locaarea .location_city").text(cityName).attr("data-id", locationID);
    smGlobal.removeHomeGif();
    homeDataShow();
    return;
    //alert(locationID)

    apiRequest({
        method: "Home/GetHomeData",
        async: false,
        data: { "AreaId": locationID },
        success: function (obj) {

            $(".homecontentList").show();
            smGlobal.removeHomeGif();
            model.list(obj.data.modules);

            model.allHomeImgs(obj.data.homeImgs);

            //console.log(obj.data.hasLocalBarbecues);
            //判断是否显示当地特色
            //obj.data.hasLocalBarbecues = true;
            if (obj.data.hasLocalBarbecues) {
                $("#native").show();
            } else {
                $("#native").hide();
            }
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
            if (params.length > 1) {
                params = [].concat(params[0]);
            }

            var tomorrowBuyings = obj.data.tomorrowBuyings;
            if (tomorrowBuyings.length > 1) {
                tomorrowBuyings = [].concat(tomorrowBuyings[0]);
            }

            for (var i = 0; i < params.length; i++) {
                var arguments = {};
                arguments["picUrl"] = params[i]["src"];
                arguments["endTime"] = params[i]["endTime"];
                arguments["startTime"] = params[i]["startTime"];
                arguments["isOver"] = params[i]["isOver"];
                arguments["status"] = params[i]["status"];
                //if (arguments["isOver"] == 0 && arguments["status"] == 1) {
                //    var sStartTime = arguments["startTime"];
                //    var nDate = new Date();
                //    if (sStartTime.indexOf("-") != -1) {
                //        sStartTime = sStartTime.replace(/\-/g, "/");
                //    }
                //    sStartTime = new Date(sStartTime);
                //    if (sStartTime - nDate>0) {
                //        arguments["link"] = "javascript:alert('活动还未开始，敬请期待！')";
                //    }else{
                arguments["link"] = '/product/detail?activityId=' + params[i]["promotionId"];
                //    }
                //} else {
                //    arguments["link"] = "javascript:alert('活动抢购已结束，敬请期待下次抢购！')";
                //}

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
            //for (var i = 0; i < obj.data.nowMemberBuy.length; i++) {
            //    model.nowMemberBuy.push(obj.data.nowMemberBuy[i]);
            //}
            //for (var i = 0; i < obj.data.nextMemberBuy.length; i++) {
            //    model.nextMemberBuy.push(obj.data.nextMemberBuy[i]);
            //}
            model.nowMemberBuy(obj.data.nowMemberBuy);
            model.nextMemberBuy(obj.data.nextMemberBuy);
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


//首页分页
var _pageIndex = 0; _pageSize = 0;//初始化分页参数
var _pageIndex2 = 0; _pageSize2 = 4;//初始化分页参数
var _flag = false;
$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 20) {
        // ajax方法
        var pageIntFlag = getCookie("pageIntFlag");
        if (pageIntFlag != "true") {
            setCookie("pageIntFlag", true, "", "/", 30);
            //_pageSize = _pageSize + 4;
            //console.log(_pageSize);
            if (_flag) {
                _pageIndex2++;
                homeBetterShow();
            } else {
                _pageSize += 2;
                if (_pageSize >= HomePromotionList.length) {
                    _pageSize = HomePromotionList.length;
                    _flag = true;
                }
                setTimeout(function () {
                    homeDataShow();
                }, 100)

            }


        }

    }
});
//首页分类推荐
var homeDataShow = function () {
    if (!HomePromotionList) {
        return false;
    }
    for (_pageIndex; _pageIndex < _pageSize ; _pageIndex++) {
        var _this = HomePromotionList[_pageIndex];
        if (_this.moduleBanner.indexOf("http") < 0) {
            _this.moduleBanner = imgHost + _this.moduleBanner;
        }
        for (var i = 0; i < _this.promotions.length; i++) {
            var _thisTwo = _this.promotions[i];
            if (_thisTwo.src.indexOf("http") < 0) {
                _thisTwo.src = imgHost + _thisTwo.src;
            }
        }
        model.hPromotionList.push(_this);
    }
    $("#listOther li").off().on("click", homeDetail);
    $("#listOther .todaynew_head,#listOther .goods_picture").off().on("click", homeClassfy);
    $(".scrollLoading").scrollLoading();
    setCookie("pageIntFlag", false, "", "/", 30);

}
var homeDetail = function () {
    var _id = $(this).data("id");

    if ($(this).hasClass("moreGoods")) {
        var _moduleType = $(this).data("moduletype");
        var _matchValue = $(this).data("matchvalue");
        if (_moduleType == 1) {
            window.location.href = "/Classify/themePromoList?ModuleType=" + _moduleType + "&MatchValue=" + _matchValue;
        } else if (_moduleType == 2 || _moduleType == 3 || _moduleType == 4) {
            window.location.href = "/Classify/themePromoList?catId=" + _matchValue;
        } else {
            window.location.href = "/Classify/themePromoList";
        }
    } else {
        window.location.href = "/product/detail?activityId=" + _id;
    }
}
var homeClassfy = function () {
    var _moduleType = $(this).data("moduletype");
    var _matchValue = $(this).data("matchvalue");
    var _opentype = $(this).data("opentype");
    var _openpar = $(this).data("openpar");
    if (_opentype == "url") {
        window.location.href = _openpar;
    } else if (_opentype == "mall") {
        window.location.href = "/Classify/themePromoList?" + _openpar;
    } else if (_moduleType == 1) {
        window.location.href = "/Classify/themePromoList?ModuleType=" + _moduleType + "&MatchValue=" + _matchValue;
    } else if (_moduleType == 2 || _moduleType == 3 || _moduleType == 4) {
        window.location.href = "/Classify/themePromoList?catId=" + _matchValue;
    } else {
        window.location.href = "/Classify/themePromoList";
    }
    //window.location.href = "/Classify/themePromoList@(item["moduleType"] == 1 ? string.Empty : (item["moduleType"] == 2 || item["moduleType"] == 3 || item["moduleType"] == 4) ? "?catId=" + @item["matchValue"] : string.Empty)';
}
//首页精品推荐
var homeBetterShow = function () {
    if (!Boutique) {
        $(".infinite-scroll-preloader").remove();
        return false;
    }
    apiRequest({
        method: "Promotion/QueryPromotion",
        async: true,
        data: {
            "From": "C",
            "AreaId": locationID,
            "ModuleType": Boutique.moduleType,
            "MatchValue": Boutique.matchValue,
            "PageSize": _pageSize2,
            "PageNo": _pageIndex2,
        },
        beforeSend: function () {
            if ($(".loading3").length <= 0) {
                smGlobal.loadding3();
                $(".loading3").show();
            }
        },
        success: function (obj) {
            smGlobal.removeHomeGif();
            $("#proList").show();
            if (obj.isBizSuccess) {
                //return false;
                if (obj.data.length <= 0 && _pageIndex2 == 1) {
                    $(".infinite-scroll-preloader").remove();
                    return false;
                }
                for (var i = 0; i < obj.data.length ; i++) {

                    model.boutique.push(obj.data[i]);
                }
                $("#listBetter").show();
                $("#listBetter li").off().on("click", homeDetail);
                $(".scrollLoading").scrollLoading();

                if (obj.data.length < _pageSize2) {
                    setCookie("pageIntFlag", true, "", "/", 30);
                    $(".infinite-scroll-preloader").remove();
                } else {
                    setCookie("pageIntFlag", false, "", "/", 30);
                }
            }

        },
        error: function (obj) {
            smGlobal.removeHomeGif();
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
function ProductPraise(objNote) {
    if (!getCookie(".ASPXAUTHH5")) {
        autoLogin(this);
        return;
    }
    var $this = $(objNote).parent().children('.productPraise');

    var promotionNote = $this.parent(".promotion");

    var dataIndex = promotionNote.attr('dataIndex');
    var homeImg = model.homeImgs()[dataIndex];
    var promotionId = homeImg.promotionId;


    var hasOn = homeImg.hasPraise;
    var praiseAction = '';
    if (hasOn) {
        praiseAction = 'cancel';
    } else {
        praiseAction = 'add';
    }
    $.ajax({
        type: 'post',
        url: '/product/ProductPraise',
        data: { activityId: promotionId, praiseAction: praiseAction },
        dataType: 'json',
        success: function (data) {
            homeImg.hasPraise = !homeImg.hasPraise;
            if (data.data) {
                if (hasOn) {
                    $this.removeClass("hasPraise");
                    homeImg.praiseCount--;

                    promotionNote.children('.praiseCount').text(showCount(homeImg.praiseCount));
                } else {
                    $this.addClass("hasPraise");
                    homeImg.praiseCount++;
                    promotionNote.children('.praiseCount').text(showCount(homeImg.praiseCount));
                }
            }
        },
        error: function (xhr) {
            console.log('ajax 请求失败', xhr.status, xhr.statusText);
        }
    });
}
function showCount(c) {
    return c > 999 ? '999+' : c;
}
$(".skillTitle li").click(function () {
    tabsIndex = $(".skillTitle li").index(this);
    //console.log(interval);
    //clearInterval(interval);
    //clearInterval(_intervalID);
    $(this).addClass("cur").siblings().removeClass("cur");
    $("#sliders").html("");
    switch (tabsIndex) {
        case 0:
            $(".today").show();
            $(".tomorr").hide();
            break;
        case 1:
            $(".today").hide();
            $(".tomorr").show();
            break;
        default:
            $(".today").show();
            $(".tomorr").hide();
            break;
    }

})

