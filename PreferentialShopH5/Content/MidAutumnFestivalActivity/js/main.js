var activityInfo = null;
var luckDrawCount = null;
var recordId = 0;

$(document).ready(function () {
    activityInfoGet();
    activityLuckDrawCountGet();
    activityCardListGet();

    //活动规则
    $(".z_act_index_rule").click(function () {
        location.href = "/MidAutumnFestivalActivity/Rule";
    });

    // 关闭摇奖
    $(".modal").click(function () {
        $(".get_card").fadeOut();
        $(".modal").hide();
    });
    // 抽奖
    $("#start_chou").click(function () {
        $(".mack_sure").fadeIn();
        $(".modal").show();
    });
    // 关闭抽奖
    $(".modal,.cancel").click(function () {
        $(".z_act_index_model3").fadeOut();
        $(".z_act_index_model4").fadeOut();
        $(".modal").hide();
        $(".mack_sure").hide();
    });

    // 确认抽奖
    $("#select_sure").click(function () {
        apiRequest({
            method: "MidAutumnFestivalActivity/LuckDraw",
            async: false,
            data: { UserId: userId, PromotionId: activityInfo.promotionId },
            success: function (obj) {
                if (obj.result == 1) {
                    $(".z_act_index_model3").fadeIn();
                    $(".s_bouns").text(obj.bonus + '元');
                    recordId = obj.recordId;
                } else if (obj.result == 2) {
                    $(".z_act_index_model4").fadeIn();
                    $(".s_beforeMoney").text(obj.beforeMoney);
                    //$(".s_productName").text(obj.productName);
                    $(".s_discountMoney").text(obj.discountMoney);
                    recordId = obj.recordId;
                } else if (obj.result == 3) {
                    cardClick();
                }
                //重新加载卡片
                activityCardListGet();
                $(".modal").show();
                //只允许抽奖一次
                //$("#start_chou").hide();
            }
        });
    });

    //开始摇奖
    $("#start_yao").click(function () {
        $("#start_yao").addClass("shake");
        apiRequest({
            method: "MidAutumnFestivalActivity/DrawLottery",
            async: false,
            data: { UserId: userId, PromotionId: activityInfo.promotionId },
            success: function (obj) {
                setTimeout(function () {
                    $("#start_yao").removeClass("shake");
                }, 1500);
                if (obj.errMsg == null || obj.errMsg == '') {
                    $(".s_getcard").text(obj.model.cardName);
                    $(".img_getcard")[0].src = obj.model.cardBgSrc;
                    $(".get_card").fadeIn(); $(".modal").show();
                    setTimeout(function () {
                        $(".get_card").fadeOut();
                        $(".modal").hide();
                        //重新加载卡片信息
                        activityCardListGet();
                    }, 5000);
                }
                else {
                    capacity(obj.errMsg);
                }
            }
        });
    });

    //中奖纪录
    $(".s_luckdrawrecord").click(function () {
        location.href = '/MidAutumnFestivalActivity/LuckDrawRecord?promotionId=' + activityInfo.promotionId;
    });

    //领取赠送卡片
    if (cardId != null && cardId != undefined) {
        apiRequest({
            method: "MidAutumnFestivalActivity/CardAccept",
            data: { UserId: userId, PromotionId: activityInfo.promotionId, GiveUserId: fromUserId, CardId: cardId },
            success: function (obj) {
                if (obj.errMsg == undefined || obj.errMsg == '') {
                    activityCardListGet();
                    capacity('已领取卡片');
                }
            }
        });
    }
});

//加载活动信息
var activityInfoGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/ActivityInfoGet",
        async: false,
        data: {},
        success: function (obj) {
            activityInfo = obj.model;
            $(".head_tit_center").text(obj.model.promotionName);
            $(".img_bg")[0].src = obj.model.src;
        }
    });
}

//加载活动剩余抽奖次数
var activityLuckDrawCountGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/SurplusLuckDrawCountGet",
        async: false,
        data: { UserId: userId, PromotionId: activityInfo.promotionId },
        success: function (obj) {
            luckDrawCount = obj.count;
        }
    });
}

//获得活动卡片信息
var activityCardListGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/UserCardDetailListGet",
        data: { UserId: userId, PromotionId: activityInfo.promotionId },
        success: function (obj) {
            if (obj.isComplete) {
                $("#start_yao").hide();
                $("#start_chou").show();
                $(".s_luckdrawrecord").show();
                //canShake = 0;
            }
            else if (obj.isLuckDrawed) {
                $("#start_yao").show();
                $("#start_chou").hide();
                $(".s_luckdrawrecord").show();
                //canShake = 0;
            }
            $(".s_cardCount").text(obj.models.length);
            $(".z_act_index_bottom").empty();
            for (var i in obj.models) {
                if (obj.models[i].cardCount > 0)
                    $(".z_act_index_bottom").append('<div><img onclick="cardClick()" src="' + obj.models[i].cardSrc + '" /> <span>x' + obj.models[i].cardCount + '</span><div class="z_index_bottom_card">' + obj.models[i].cardName + '</div></div>');
                else
                    $(".z_act_index_bottom").append('<div><img onclick="cardClick()" src="' + obj.models[i].cardSrc + '" /><div class="z_index_bottom_card">' + obj.models[i].cardName + '</div></div>');
            }
        }
    });
}

//卡片点击
var cardClick = function () {
    location.href = '/MidAutumnFestivalActivity/CardDetail?promotionId=' + activityInfo.promotionId;
}

//领取礼包
var receiveProduct = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/ReceiveGiftProduct",
        data: { UserId: userId, PromotionId: activityInfo.promotionId, RecordId: recordId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                location.href = '/mall/getShoppingCart';
            }
        }
    });
}


//领取奖金
var receiveBouns = function () {
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
        method: "MidAutumnFestivalActivity/ReceiveBouns",
        data: { PromotionId: activityInfo.promotionId, RecordId: recordId, OpenId: openId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                capacity('奖金已经发放成功，请注意查收');
            }
            else {
                capacity(obj.errMsg);
            }
            $(".modal").hide();
            $(".z_act_index_model3").hide();
            recordGet();
        }
    });
}