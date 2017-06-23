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
    ploading(0);

});
$(".historyList").scroll(function () {
    var curScrollTop = $(this).scrollTop();
    var curObjHeight = $(this).outerHeight();
    var paddingTop = parseInt($(this).css("padding-top").replace("px", ''));
    var proHeight = $proList.height();
    var loadHeight = $preloader.outerHeight();
    var sclHeight = proHeight - curObjHeight + loadHeight + paddingTop;//满足翻页的条件

    var orderFlag = getCookie("orderFlag");
    if (!$preloader) error("没有更多的数据");
    if (sclHeight <= curScrollTop && orderFlag != "false") {
        ploading(0);
    }
})
var ploading = function ($orderPackageStatus) {
    var $option = {};
    var $data = {};
    var $orderPackageStatus = $orderPackageStatus;
    $data['UserId'] = $("#userId").val();
    $data['StarSize'] = $pageNo;
    $data['PageSize'] = 10;
    //$data["UserId"] = 576,
    $option["method"] = "Order/GetHistoryList";
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
        beforeSend: function () {
            if ($(".loading3").length <= 0) {
                smGlobal.loadding3();
                $(".loading3").show();
            }
        },
        success: function (obj) {
            smGlobal.removeHomeGif();
            $("#proList").show();
            if (obj.data && obj.data.length == 0) {
                setCookie("orderFlag", false, "", "/", 30);
                if ($pageNo == 1) {
                    smGlobal.nullInfo($("#proList"), "暂无数据");
                    $(".infinite-scroll-preloader").remove();
                } else {
                    //smGlobal.error("没有更多的数据");
                }
                return;
            } else {
                if ($pageNo == 1 && $(".nodata").length > 0) {
                    $(".nodata").remove();
                }
            }
            $.each(obj.data, function (i, v) {
                orderModel.orderList.push(v);
            });
            setCookie("orderFlag", true, "", "/", 30);
            $pageNo++;
            if (obj.data.length < 10) {
                $(".infinite-scroll-preloader").remove();
                setCookie("orderFlag", false, "", "/", 30);
                smGlobal.error("没有更多的数据！");
            } else {
                if ($(".infinite-scroll-preloader").length == 0)
                    $(".wareList").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
                //smGlobal.error("加载完毕");
            }

        },
        error: function (obj) {
            $("#proList").show();
            smGlobal.removeHomeGif();
            setCookie("orderFlag", true, "", "/", 30);
            smGlobal.error(obj);
        }
    });
}