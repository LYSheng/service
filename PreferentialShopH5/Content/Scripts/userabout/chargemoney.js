/// <reference path="../base.js" />



$(function () {
    $(".info-cardNum span").text(getQueryString("cartNo"));
    clickChargeMoneySpan();
    confirmChargeMoney();
})

var clickChargeMoneySpan = function () {
    $(".selectedmoneyArea span").bind("click", function () {
        
        if (!$(this).hasClass("selectedborder")) {
            $(this).addClass("selectedborder");
            $(this).siblings("span").removeClass("selectedborder").removeAttr("style");
            $(this).parent().siblings().find("span").removeClass("selectedborder").removeAttr("style");
        }
        $(".chargeCount").text("￥" + parseInt($(this).text().split('元')[0]).toFixed(2));
        $(".lastchargeCount").text("￥" + parseInt($(this).text().split('元')[0]).toFixed(2));
    });
}

var confirmChargeMoney = function () {
    $(".confirm-btn").bind("click", function () {
        if ($(".chargeCount").text().length < 1 || $(".lastchargeCount").text().length<1) {
            smGlobal.error("请选择金额");
            return;
        }
        var chargeCount= $(".chargeCount").text().split("￥")[1];
        var lastchargeCount = $(".lastchargeCount").text().split("￥")[1];
        //window.location.href = "/userabout/GetPayType?chargeCount="+chargeCount;
        //return;
        smGlobal.loadingWithGif();
        apiRequest({
            method: 'ErPao/ErPaoCartChongzhi',
            async: true,
            data: {
                AccountType: 2,
                ChongzhiMoney: chargeCount,
                RealPayMoney: lastchargeCount,
                CartId: getQueryString("Id"),
                UserName: $(".accountName span").text()
            },
            success: function (data) {
                smGlobal.removeLoadingGif();
                if (data.isBizSuccess) {
                    var OrderId = data.data.orderId;
                    var OrderCode = data.data.orderCode;
                    var realPayMoney = data.data.realPayMoney;
                    window.location.href = "/userabout/GetPayType?realPayMoney=" + realPayMoney + "&orderId=" + OrderId + "&orderCode="+OrderCode;

                } else {
                    smGlobal.error(data.bizErrorMsg);
                }
            },
            error: function (data) {
                smGlobal.error(data.bizErrorMsg);
                smGlobal.removeLoadingGif();
            }
        });

    })
}

function setOtherMoneyCount() {
    var val = $(".input-otherMoney").val();
    var num = parseFloat(val);
    if(val==""){
        smGlobal.error("请输入其他金额");
        return;
    } else if (num<=0) {
        smGlobal.error("请输入其他金额");
        return;
    } else {
        $(".chargeCount").text("￥"+num.toFixed(2));
        $(".lastchargeCount").text("￥"+num.toFixed(2));
    }
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}