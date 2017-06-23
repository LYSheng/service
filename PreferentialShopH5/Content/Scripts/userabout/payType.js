/// <reference path="../base.js" />
var chargeCount = parseFloat(smGlobal.getQueryString("realPayMoney"));
var orderId = smGlobal.getQueryString("orderId");
var orderCode = smGlobal.getQueryString("orderCode");
$(function () {

    if (!isNaN(chargeCount)) {
        $(".payHeadTile span").text("￥" + chargeCount.toFixed(2));
    }
    regClickForCell();
    //WXPayInit
})

var regClickForCell = function () {
    $(".payTypeSection div").bind("click", function () {
        var wechatUrl = $(".wechatUrl").text();
        var userid = $(".userid").text();
        if ($(this).hasClass("alipay")) {
            window.location.href = wechatUrl + "Alipay/SubmitAlipay?orderId=" + orderCode + "&userId=" + userid + "&dataTime=" + $("#dataTime").val() + "&sign=" + $("#payToSign").val();
        } else {
            //ios专用
            if (typeof showPayStyle == "function") {
                //showPayStyle("@ViewBag.OrderID", "@ViewBag.UserID", "@ViewBag.DateTime", "@ViewBag.Sign", "@ViewBag.PayToType", "@ViewBag.OrderCode");
                showPayStyle(orderId, userid, $("#dataTime").val(), $("#payToSign").val(), 30,orderCode);
                return;
            }
            //安卓专用
            try {
                if (typeof mobile.showPayStyle == "function") {
                    mobile.showPayStyle(orderId, userid, $("#dataTime").val(), $("#payToSign").val(), 30,orderCode);
                    return;
                }
            } catch (e) {

            }
            window.location.href = wechatUrl + "WXPayInit/JsApi?orderId=" + orderCode + "&wxXSuserId=" + userid;
        }
    });
}

