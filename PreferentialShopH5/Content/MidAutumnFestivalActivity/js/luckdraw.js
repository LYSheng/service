var recordId = 0;

$(document).ready(function () {
    recordGet();
});

//加载活动信息
var recordGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/LuckDrawRecordGet",
        data: { UserId: userId, PromotionId: promotionId },
        success: function (obj) {
            $(".z_act_card_list").empty();
            for (var i in obj.models) {
                if (obj.models[i].winType == 2) {
                    var innerHtml = '<li class="z_act_card_li" onclick="ReceiveClick(this, 2, ' + obj.models[i].beforeMoney + ', ' + obj.models[i].discountMoney + ', \'' + obj.models[i].productName + '\', null, ' + obj.models[i].recordId + ')">' +
                                    '<div><span>抽中</span><span>' + obj.models[i].createTime + '</span></div>' +
                                    '<div><div>价值' + obj.models[i].beforeMoney + '元的猫市中秋大礼包,现在支付只需' + obj.models[i].discountMoney + '元</div><div class="status">' + obj.models[i].receiveStatusName + '</div></div>' +
                                    '</li>';
                    $(".z_act_card_list").append(innerHtml);
                }
                else {
                    var innerHtml = '<li class="z_act_card_li" onclick="ReceiveClick(this, 1, null, null, null, ' + obj.models[i].bonus + ', ' + obj.models[i].recordId + ')">' +
                                    '<div><span>抽中</span><span>09/07 12:31:28</span></div>' +
                                    '<div><div>' + obj.models[i].bonus + '元中秋现金奖</div><div class="status">' + obj.models[i].receiveStatusName + '</div></div>' +
                                    '</li>';
                    $(".z_act_card_list").append(innerHtml);
                }
            }
        }
    });
}
var statusdom = null;
//点击领取奖品
var ReceiveClick = function (dom, type, beforeMoney, discountMoney, productName, bouns, Id) {
    statusdom = dom;
    if ($(".status", dom).text() == '已领取') {
        location.href = '/mall/getShoppingCart';
        //capacity('已经领取过了');
        return false;
    }

    if (type == 2) {
        $(".z_act_index_model4").show();
        $(".s_beforeMoney").text(beforeMoney);
        //$(".s_productName").text(productName);
        $(".s_discountMoney").text(discountMoney);
    }
    else if (type == 1) {
        $(".z_act_index_model3").show();
        $(".s_bouns").text(bouns + '元');
    }

    recordId = Id;

    $(".modal").show();
}

//领取礼包
var receiveProduct = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/ReceiveGiftProduct",
        data: { UserId: userId, PromotionId: promotionId, RecordId: recordId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                $(".status", statusdom).text('已领取');
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
        data: { PromotionId: promotionId, RecordId: recordId, OpenId: openId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                $(".status", statusdom).text('已领取');
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