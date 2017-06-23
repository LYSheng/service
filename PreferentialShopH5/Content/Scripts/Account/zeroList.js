var userid = getCookie("UserId") ? getCookie("UserId") : 0;
var zeroList;
var catId;
var crowdfunding = 3;
var zeroListModel = function () {
    var self = this;
    self.crowdfundingList = ko.observableArray([]);
    self.enterStatus = ko.observable();
    self.pageSize = 10;
    self.pageIndex = ko.observable();
}
$(function () {
    InitData();
    crowdfundingOrderList();
});
function InitData() {
    zeroList = new zeroListModel();
    zeroList.enterStatus(10);
    zeroList.pageIndex(1);
    ko.applyBindings(zeroList);
}
var crowdfundingOrderList = function () {
    var isShareProduct = $("#isShareProduct").val();
    apiRequest({
        method: "ExperienceEnter/GetList",
        async: true,
        data: { EnterStatus: zeroList.enterStatus(), pageSize: zeroList.pageSize, pageNo: zeroList.pageIndex()},
        beforeSend: function () {
            if ($(".loadingFixed").length <= 0) {
                smGlobal.loadingFixed();
                $(".loadingFixed").show();
            }
        },
        success: function (obj) {
            smGlobal.removeHomeGif();
            $("#proOrder").show();
            if (obj.isBizSuccess) {
                if (obj.data && obj.data.length == 0) {
                    setCookie("pageIntFlag", true, "", "/", 30);
                    if (zeroList.pageIndex() == 1) {
                        smGlobal.nullInfo($("#proOrder"), "暂无数据");
                        $(".infinite-scroll-preloader").remove();
                    } else {
                        $(".infinite-scroll-preloader").remove();
                    }
                    return;
                }
                //console.log(obj);
                var datas = obj.data;
                var ii = 0;
                for (var i = 0; i < datas.length; i++) {
                    if (ii < zeroList.pageSize) {
                        zeroList.crowdfundingList.push(datas[i]);
                        ii++;
                    }
                    else
                        break;
                }
            }
            if (obj.data.length < zeroList.pageSize) {
                $(".infinite-scroll-preloader").remove();
                setCookie("pageIntFlag", true, "", "/", 30);
                return;
            } else {
                if ($(".infinite-scroll-preloader").length == 0)
                    $("#shop").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>');
                setCookie("pageIntFlag", false, "", "/", 30);
            }
            //pageIndex++;
            //smGlobal.error("加载完毕");
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });
}
var $preloader = $(".infinite-scroll-preloader");
$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
        var pageIntFlag = getCookie("pageIntFlag");
        if (pageIntFlag != "true") {
            setCookie("pageIntFlag", true, "", "/", 30);
            zeroList.pageIndex(zeroList.pageIndex()+1);
            crowdfundingOrderList();
        }
    }
});
$(".tabs").click(function (event) {
    $("#proOrder").html("");
    zeroList.pageIndex(1);
    $(this).addClass('active').siblings().removeClass('active');
    var index = $(".tabs").index(this);
    switch(index){
        case 0:
            zeroList.enterStatus(10);
            break;
        case 1:
            zeroList.enterStatus(20);
            break;
        case 2:
            zeroList.enterStatus(-10);
            break;
    }
    crowdfundingOrderList();
});