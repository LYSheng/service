var productName = smGlobal.getQueryString("productName");
$("#searchRemove").hide();
if(productName){
    $("#searchTxt").val(productName);
    $(".searchHeader").removeClass("none");
    $("#searchBtn").addClass("search").html("确定");
    $("#searchRemove").show();
}

var $preloader = $(".infinite-scroll-preloader");
var $proList = $("#proList");
var $pageNo = 1;
var orderModel;
var orderCancelobj;
var orderQrsh;
var sesStorage = window.sessionStorage;
var orderLoadingModel = function () {
    var self = this;
    self.orderList = ko.observableArray([]);
}
$(document).ready(function () {
    orderModel = new orderLoadingModel();
    ko.applyBindings(orderModel);
    // var orderStatusFlag = parseInt(sesStorage.getItem("orderStatusFlag"));
    // var redirect = 0;
    // if (orderStatusFlag && orderStatusFlag != '' || orderStatusFlag == 0) {
    //     redirect = parseInt(orderStatusFlag);
    // } else {
    //     redirect = $("#redirect").val() ? parseInt($("#redirect").val()) : 0;
    // }
    // if (redirect > $("#stuTab li").length) redirect = 0;

    var state = parseInt(sesStorage.getItem("orderState")) ? (sesStorage.getItem("orderState")) : 0;
    var index = $("#stuTab li").eq(state).data("status");
    $("#stuTab li").removeClass("on").eq(state).addClass("on");
    ploading(index);

});
// 
// 搜索框相关事件
$("#searchTxt").on("focus",function(){
    var txt = $.trim($(this).val());
    $(".searchHeader").removeClass("none");
})
// $("#searchTxt").on("blur",function(){
//     var _this = $(this);
//     var txt = $.trim(_this.val());
//     if(!txt){
//         _this.val("");
//         $(".searchHeader").addClass("none");
//         $("#searchBtn").removeClass("search").html("取消");
//         searchFun();
//     }
//     return false;
// })
$("#searchTxt").on("input",function(){
    var _this = $(this);
    var txt = $.trim(_this.val());
    if(!txt){
        _this.val("");
        $("#searchRemove").hide();
        $("#searchBtn").removeClass("search").html("取消");
    }else{
        $("#searchBtn").addClass("search").html("确定");
        $("#searchRemove").show();
    }
})
$("#searchBtn").on("click",function(){
    if($(this).hasClass("search")){
        searchFun();
    }else{
        $(".searchHeader").addClass("none");
        searchFun();
    }
})

$("#searchRemove").on("click",function(){
    $(this).hide();
    $("#searchBtn").removeClass("search").html("取消");
    $("#searchTxt").val("").focus();
})

function searchFun(){
    orderModel.orderList([]);
    $pageNo = 1;
    if ($(".nodata_shop").length > 0) {
        $(".nodata_shop").remove();
    }
    if ($(".infinite-scroll-preloader").length == 0){
        $(".wareObj").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
    }
    var redirect = parseInt(sesStorage.getItem("orderState")) ? parseInt(sesStorage.getItem("orderState")) : 0;
    var index = $("#stuTab li").eq(redirect).data("status");
    $("#stuTab li").removeClass("on").eq(redirect).addClass("on");
    
    ploading(index);
}

//$(".wareList").scroll(function () {
//    var curScrollTop = $(this).scrollTop();
//    var curObjHeight = $(this).outerHeight();
//    var paddingTop = parseInt($(this).css("padding-top").replace("px", ''));
//    var proHeight = $proList.height();
//    var loadHeight = $preloader.outerHeight();
//    var sclHeight = proHeight - curObjHeight + loadHeight + paddingTop;//满足翻页的条件

//    var orderFlag = getCookie("orderFlag");
//    if (!$preloader) error("没有更多的数据");
//    if (sclHeight <= curScrollTop && orderFlag != "false") {
//        ploading($(".parbox li.on").data("status"));
//    }
//})
$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
        var orderFlag = getCookie("orderFlag");
        if (orderFlag != "false") {
            ploading($(".parbox li.on").data("status"));
        }
    }
});
$("#stuTab li").click(function () {
    orderModel.orderList([]);
    var stuTabFlag = getCookie("stuTabFlag");
    if (stuTabFlag == "false") {
        smGlobal.error("您操作过于频繁，请稍后再试");
        return;
    }
    setCookie("stuTabFlag", false, "", "/", 30);
    var $orderPackageStatus = $(this).data("status");
    var flag = 0;
    switch (parseInt($orderPackageStatus)) {
        case 0:
            flag = 0;
            break;
        case 10:
            flag = 1;
            break;
        case 20:
            flag = 2;
            break;
        case 40:
            flag = 3;
            break;
        case 45:
            flag = 4;
            break;
        case -5:
            flag = 5;
            break;
        default:
            break;
    }
    sesStorage.setItem("orderState",flag)
    $("#stuTab li").removeClass("on");
    $(this).addClass("on");
    $pageNo = 1;
    if ($(".nodata_shop").length > 0) {
        $(".nodata_shop").remove();
    }
    if ($(".infinite-scroll-preloader").length == 0){
        $(".wareObj").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
    }
    ploading($orderPackageStatus);
})
var ploading = function ($orderPackageStatus) {

    var $option = {};
    var $data = {};
    var $orderPackageStatus = $orderPackageStatus;
    $data['ProductName'] = $("#searchTxt").val();
    $data['FromWhere'] = "R";
    $data['OrderStatus'] = $orderPackageStatus;
    $data['PageNo'] = $pageNo;
    $data['PageSize'] = 6;
    $option["method"] = "Order/GetPackageOrderList";
    if ($data['OrderStatus'] == 10) {
        $option["method"] = "Order/GetWaitPayOrderList";
    } else if ($data['OrderStatus'] == 0) {
        $option["method"] = "Order/GetAllOrderList";
    }
    $option["data"] = $data;
    //console.log($option);
    //return;
    proDataGet($option);
}
//初始化加载
var proDataGet = function (option) {
    setCookie("orderFlag", false, "", "/", 30);
    apiRequest({
        method: option.method,
        async: true,
        data: option.data,
        success: function (obj) {
            $("#proList").show();
            if (obj.data && obj.data.length == 0) {
                setCookie("orderFlag", false, "", "/", 30);
                setCookie("stuTabFlag", true, "", "/", 30);
                if ($pageNo == 1) {
                    smGlobal.nullInfo($("#proList"), "暂无数据");
                    //$(".infinite-scroll-preloader").remove();
                } else {
                    //smGlobal.error("没有更多的数据");
                }
                $(".infinite-scroll-preloader").remove();
                return;
            } else {
                if ($pageNo == 1 && $(".nodata").length > 0) {
                    $(".nodata").remove();
                }
            }
            $.each(obj.data, function (i, v) {
                /*debugger;*/
                switch (v.orderState) {
                    case 10:
                        v["orderStateName"] = "待付款";
                        break;
                    case 15:
                        v["orderStateName"] = "支付中";
                        break;
                    case 20:
                        v["orderStateName"] = "已付款";
                        break;
                    case 25:
                        v["orderStateName"] = "已赊付";
                        break;
                    case 30:
                        v["orderStateName"] = "已领取";
                        break;
                    case 35:
                        v["orderStateName"] = "部分发货";
                        break;
                    case 38:
                        v["orderStateName"] = "配货中";
                        break;
                    case 40:
                        v["orderStateName"] = "待收货";
                        break;
                    case 41:
                        v["orderStateName"] = "待自提";
                        break;
                    case 44:
                        v["orderStateName"] = "已收货";
                        break;
                    case 45:
                        v["orderStateName"] = "待评价";
                        break;
                    case 50:
                        v["orderStateName"] = "交易完成";
                        break;
                    case -2:
                        v["orderStateName"] = "管理员作废";
                        break;
                    case -3:
                        v["orderStateName"] = "用户作废";
                        break;
                    case -4:
                        v["orderStateName"] = "系统作废";
                        break;
                    case -5:
                        v["orderStateName"] = "已退款";
                        break;
                    default:
                        v["orderStateName"] = "其他";
                        break;
                }
                //$.each(v["data"], function (j, v1) {
                //    v1["isPickedUp"] = v["isPickedUp"]
                //});
                orderModel.orderList.push(v);
            });
            setCookie("orderFlag", true, "", "/", 30);
            setCookie("stuTabFlag", true, "", "/", 30);
            $pageNo++;
            if (obj.data.length < 6) {
                $(".infinite-scroll-preloader").remove();
                setCookie("orderFlag", false, "", "/", 30);
                setCookie("stuTabFlag", true, "", "/", 30);
            } else {
                //if ($(".infinite-scroll-preloader").length == 0)
                //    $(".wareObj").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
            }
            //smGlobal.error("加载完毕");
        },
        error: function (obj) {
            $("#proList").show();
            setCookie("orderFlag", true, "", "/", 30);
            setCookie("stuTabFlag", true, "", "/", 30);
            smGlobal.error(obj);
        }
    });
}
$(".wareObj").on("click", ".orderPay", function () {
    var orderid = $(this).data("orderid");
    var price = $(this).data("price");
    window.location.href = PGIUrl + "Payment/Pay?orderId=" + orderid + "&userId=" + $("#uid").val() + "&dataTime=" + $("#dataTime").val() + "&sign=" + $("#payToSign").val() + "&FromPlatform=PreferentialShopH5"
})
/*取消订单*/
$(".wareObj").on("click", ".orderCancel", function () {
    var index = $(".adrdel").index(this);
    var $window_w = $(window).width();
    var $window_h = $(window).height();
    var $custom_w = $(".custom").width();
    var $custom_h = $(".custom").height();
    var $scroll_height = document.body.scrollTop;
    $(".custom").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    $(".popback").show();
    $(".custom").show();
    orderCancelobj = $(this);
})
$(".adrqx").click(function () {
    $(".popback").hide();
    $(".custom").hide();
});
$(".adrqd").click(function () {
    var orderId = $(orderCancelobj).data("orderid");
    apiRequest({
        method: 'Order/DxlqCancelOrder',
        async: false,
        data: { OrderId: orderId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("订单取消成功！",2000);
                //window.location.reload();
                $("#stuTab li.on").click();
                
            }
            $(".popback").hide();
            $(".custom").hide();
        },
        error: function (obj) {
            $(".popback").hide();
            $(".custom").hide();
            smGlobal.error(obj);
        }
    });
});
/*确认收货*/
$(".wareObj").on("click", ".orderQrsh", function () {
    var $window_w = $(window).width();
    var $window_h = $(window).height();
    var $custom_w = $(".custom1").width();
    var $custom_h = $(".custom1").height();
    var $scroll_height = document.body.scrollTop;
    $(".custom1").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    $(".popback").show();
    $(".custom1").show();
    orderQrsh = $(this);
})
/*确认收货*/
$(".wareObj").on("click", ".orderExtend", function () {
    var $window_w = $(window).width();
    var $window_h = $(window).height();
    var $custom_w = $(".custom1").width();
    var $custom_h = $(".custom1").height();
    var $scroll_height = document.body.scrollTop;
    $(".custom1").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    $(".popback").show();
    $(".custom2").show();
    //orderQrsh = $(this);
})

$(".qrshqx").click(function () {
    $(".popback").hide();
    $(".custom1").hide();
});
$(".qrshqd").click(function () {
    var orderId = $(orderQrsh).data("orderid");
    var originalId = $(orderQrsh).data("originalid");
    apiRequest({
        method: 'OrderPackage/UserRecived',
        async: false,
        data: { OrderPackageId: orderId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("确认收货成功！");
                window.location.href = "./promotionAddEva?orderId=" + originalId + "&orderPackageId=" + orderId;
            }
            $(".popback").hide();
            $(".custom").hide();
        },
        error: function (obj) {
            $(".popback").hide();
            $(".custom").hide();
            smGlobal.error(obj);
        }
    });
});