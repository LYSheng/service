$(document).ready(function () {
    activityCardListGet();
});

//获得活动卡片信息
var activityCardListGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/UserCardDetailListGet",
        data: { UserId: userId, PromotionId: promotionId },
        success: function (obj) {
            $(".z_act_card_list").empty();
            for (var i in obj.models) {
                if (obj.models[i].cardCount > 0) {
                    var innerHtml = '<li class="z_act_card_li">' +
                                '<div style="margin-top:5px" class="noon_sty"><span style="font-size:20px;font-weight:bold">' + obj.models[i].cardName + '</span><span style="line-height: 25px;">' + obj.models[i].cardCount + '张</span></div>' +
                                '<div><div style="line-height:30px;font-size:16px" class="bless">' + obj.models[i].cardDesc + '</div><div style="margin-top:6px" class="send" data-id=' + obj.models[i].cardId + '>赠送</div></div>' +
                                '</li>';
                    $(".z_act_card_list").append(innerHtml);
                }
                resize();
            }
            $(".send").click(function () {
                cardId = $(this).attr('data-id');
                var linkUrl = WXMVCUrl + '/Share/Arrive?ReferrerUserId=' + userId + '&ReturnUrl='
                    + encodeURIComponent('/MidAutumnFestivalActivity/?CardId=' + cardId + '&PromotionId=' + promotionId + '&FromUserId=' + userId);
                if (cardId > 0) {
                    wx.onMenuShareAppMessage({
                        title: "你的好友给你送中秋大礼哦！",
                        desc: "集卡可换取现金和中秋大礼包，一起参与吧！", // 分享描述
                        link: linkUrl,
                        imgUrl: WXMVCUrl + "/Content/MidAutumnFestivalActivity/src/full.png",
                        success: function (res) {
                            sendCard();
                        },
                        cancel: function (res) {
                            cardId = 0;
                        },
                        fail: function (res) {
                            cardId = 0;
                        }
                    });
                }
                $(".modal3").fadeIn();
                $(".share").fadeIn();
            });
        }
    });
}

//点击赠送卡片


//赠送卡片
var sendCard = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/CardGive",
        data: { UserId: userId, CardId: cardId },
        success: function (obj) {
            capacity('赠送成功');
            activityCardListGet();
        }
    });
}

