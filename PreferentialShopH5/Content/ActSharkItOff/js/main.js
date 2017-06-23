var activityInfo;

$(function () {
    activityInfoGet();
    todayGoodsGet();
    ActSharkItOffRecordGet();
})

//获得活动信息
var activityInfoGet = function (){
    apiRequest({
        method: "ActSharkItOff/ActivityInfoGet",
        data: { PromotionId: activityId },
        success: function (obj) {
            activityInfo = obj;
            if (obj.model.eachLimit < 0) {
                $(".s_eachLimit").text('摇的次数不限');
            } else {
                $(".s_eachLimit").text('每天可以摇'+obj.model.eachLimit+'次');
            }
        }
    });
}

//获得今日商品
var todayGoodsGet = function () {
    apiRequest({
        method: "ActSharkItOff/ActSharkToDayGoodsListGet",
        data: { PromotionId: activityId },
        success: function (obj) {
            $(".z_price_ul").empty();
            for (var i in obj.models) {
                var html = '';
                if (obj.models[i].type == 300) {
                    html = '<li>'+
                    '<img src="/Content/ActSharkItOff/src/hongbao.png" />' +
                    '<p>'+obj.models[i].name+'</p>'+
                    '</li>';
                    $(".z_price_ul").append(html);
                } else {
                    html = '<li>' +
                    '<img src="'+obj.models[i].src+'" />' +
                    '<p>' + obj.models[i].name + '</p>' +
                    '</li>';
                    $(".z_price_ul").append(html);
                }
            }
            $(".z_price_ul").css("max-height", hei / 2 + "px")
            $(".z_price_ul li").find('img').height($(".z_price_bottom").width() * 0.315);
        }
    });
}

//获得最近抽奖记录
var ActSharkItOffRecordGet = function () {
    apiRequest({
        method: "ActSharkItOff/ActSharkItOffRecordGet",
        data: { PromotionId: activityId },
        success: function (obj) {
            $(".slides").empty();
            for (var i in obj.models) {
                $(".slides").append('<li>恭喜' + obj.models[i].userName + '获得了' + obj.models[i].name + '</li>');
            }
            $(".flexslider").show();
        }
    });
}

    //用户摇奖
    var ActSharkItOff = function () {
        apiRequest({
            method: "ActSharkItOff/ActSharkItOff",
            data: { UserId:userId, PromotionId: activityId },
            async: false,
            success: function (obj) {
                if (obj.errMsg != undefined && obj.errMsg != null) {
                    $(".z_act_little").fadeIn();
                    $(".modal3").fadeIn();
                } else if (obj.model == null)
                {
                    $(".z_act_none").fadeIn();
                    $(".modal3").fadeIn();
                } else if (obj.model.type == 100)
                {
                    $(".s_ProductName").text(obj.model.name);
                    $(".s_ProductSrc").css('background', 'url('+obj.model.src+') center center / 100% no-repeat');
                    $(".modal3").fadeIn();
                    $(".z_act_prize").fadeIn();
                    $("#mack_sure").attr('onclick', 'ReceivePrize(' + obj.model.mapId + ')');
                } else if (obj.model.type == 200)
                {
                    $(".s_ProductName").text("优惠券"+obj.model.name);
                    $(".s_ProductSrc").css('background', "url('/Content/ActSharkItOff/src/youhuiquan.png') center center / 100% no-repeat");
                    $(".modal3").fadeIn();
                    $(".z_act_prize").fadeIn();
                    $("#mack_sure").attr('onclick', 'ReceivePrize(' + obj.model.mapId + ')');
                } else if (obj.model.type == 300)
                {
                    $(".s_ProductName").text(obj.model.name);
                    $(".s_ProductSrc").css('background', "url('/Content/ActSharkItOff/src/hongbao.png') center center / 100% no-repeat");
                    $(".modal3").fadeIn();
                    $(".z_act_prize").fadeIn();
                    $("#mack_sure").attr('onclick', 'ReceivePrize(' + obj.model.mapId + ')');
                }
                enabled = true;
            }
        });
    }

    //领取奖品
    var ReceivePrize = function (mapId) {
        var openId = '';
        try {
            openId = getCookie("OpenId") ? getCookie("OpenId") : "";
        } catch (e) {
            capacity('请使用微信登录！');
            return;
        }
        if (!openId) {
            capacity('请使用微信登录！');
            return;
        }
        apiRequest({
            method: "ActSharkItOff/ReceivePrize",
            async: false,
            data: { UserId: userId, MapId: mapId, PromotionId: activityId, OpenId: openId },
            success: function (obj) {
                if (obj.errMsg != undefined && obj.errMsg != null) {
                    $(".modal3").click();
                    capacity(obj.errMsg);
                } else if (obj.type == 100)
                {
                    location.href = '/mall/getShoppingCart';
                } else {
                    $(".modal3").click();
                    capacity('领取成功');
                }
            }
        });
    }