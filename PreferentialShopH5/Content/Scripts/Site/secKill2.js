var userid = getCookie("UserId") ? getCookie("UserId") : 0;
var locationID = getCookie("locationID") ? getCookie("locationID") : 1;
var locationCityName = getCookie("locationCityName") ? getCookie("locationCityName") : "全国";
var pullup_num = 0;
var swiper;
var classicModel;
var conScroll;
var pullLoadingModel = function () {
    var self = this;
    self.proList = ko.observableArray([]);

}

$(function () {
    classicModel = new pullLoadingModel();
    ko.applyBindings(classicModel);
    ajax_data(false, "", "all");
});
$(".popmask").css("top", ($(".themeHeader").height()));
$(".more_choose").click(function () {
    $(".cidmore").toggle();
    $(".popmask").toggle();
});

function ajax_data(cid_flag, obj, type) {
    var obj = $(".classifyList").children("li.on");
    var url_str = "";
    var post_data = {};
    url_str = "Promotion/QueryPromotion";
    post_data = {
        "AreaId": getCookie("locationID") ? getCookie("locationID") : 1,
        "PageSize": 6,
        "PageNo": pullup_num + 1,
        "ModuleType": -4,
        "From": "C",
    };

    apiRequest({
        method: "Promotion/QueryPromotion",
        async: false,
        data: post_data,
        success: function (obj) {
            $("#proList").show();
            smGlobal.removeHomeGif();
            if (obj.isBizSuccess) {
                if (obj.data && obj.data.length == 0) {
                    setCookie("turnFlag", false, "", "/", 30);
                    setCookie("pageIntFlag", true, "", "/", 30);
                    if (pullup_num == 0) {
                        smGlobal.nullInfo($("#proList"), "暂无数据");
                        $(".infinite-scroll-preloader").remove();
                    } else {
                        $(".infinite-scroll-preloader").remove();
                        //smGlobal.error("没有更多的数据");
                    }
                    return;
                }
                var datas = obj.data;
                var ii = 0;
                for (var i = 0; i < datas.length; i++) {
                    if (ii < 6) {
                        classicModel.proList.push(datas[i]);
                        ii++;
                    }
                    else
                        break;
                }

            }
            if (obj.data.length < 6) {
                $(".infinite-scroll-preloader").remove();
                setCookie("turnFlag", false, "", "/", 30);
                setCookie("pageIntFlag", true, "", "/", 30);
                smGlobal.error("数据加载完毕");
            } else {
                if ($(".infinite-scroll-preloader").length == 0) {
                    $(".secKillCon").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
                }
                setCookie("turnFlag", false, "", "/", 30);
                setCookie("pageIntFlag", false, "", "/", 30);
            }
            //smGlobal.error("加载完毕");
            skuCount();
        },
        error: function (obj) {
            $("#proList").show();
            setCookie("turnFlag", false, "", "/", 30);
            setCookie("pageIntFlag", false, "", "/", 30);
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });

}

var $preloader = $(".infinite-scroll-preloader");
var $proList = $("#proList");
//$(".secKillCon").scroll(function () {
//    var curScrollTop = $(this).scrollTop();
//    var curObjHeight = $(this).outerHeight();
//    var paddingTop = parseInt($(this).css("padding-top").replace("px", ''));
//    var proHeight = $proList.height();
//    var loadHeight = $preloader.outerHeight();
//    var sclHeight = proHeight - curObjHeight + loadHeight + paddingTop;//满足翻页的条件
//    var pageIntFlag = getCookie("pageIntFlag");
//    if (!$preloader) error("没有更多的数据");
//    if (sclHeight <= curScrollTop && pageIntFlag != "true") {
//        setCookie("pageIntFlag", true, "", "/", 30);
//        pullup_num++;
//        ajax_data(false, '', "all");
//    }
//})

$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
        var pageIntFlag = getCookie("pageIntFlag");
        if (pageIntFlag != "true") {
            setCookie("pageIntFlag", true, "", "/", 30);
            pullup_num++;
            ajax_data(false, '', "all");
        }
    }
});

var skuCount = function () {
    $.each($("#proList").children(".clasicList"), function (i, v) {
        var skillTime = $(v).find(".word-descriton").attr("data-counttime");
        //console.log(skillTime);
        var countObj = $(v).find('.countdown');
        if (countObj.length > 0) {
            countObj.downCount({
                date: skillTime,
                offset: +8
            }, function () {
                $(v).find('.countdown').text('促销已经结束！');
            });
        }
    })
}