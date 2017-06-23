var activityInfo = null;

$(document).ready(function () {
    activityInfoGet();
    $(".z_rule_close").click(function () {
        location.href = "/MidAutumnFestivalActivity";
    });
});

//加载活动信息
var activityInfoGet = function () {
    apiRequest({
        method: "MidAutumnFestivalActivity/ActivityInfoGet",
        async: false,
        data: {},
        success: function (obj) {

            activityInfo = obj.model;
            $(".rule_bg")[0].src = obj.model.src;
            $(".s_beginTime").text(obj.model.beginTime);
            $(".s_endTime").text(obj.model.endTime);
            $(".s_eachlimit").text(obj.model.eachLimit);
            $(".s_cardcount").text(obj.model.cardCount);
            $(".s_beforeMoney").text(obj.model.beforeMoney);
            $(".s_discountMoney").text(obj.model.discountMoney);
            $(".s_bouns").text(obj.model.bonus);
        }
    });
}