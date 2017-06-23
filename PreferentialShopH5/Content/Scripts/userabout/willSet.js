/// <reference path="../base.js" />

var settingCount = smGlobal.getQueryString("settingCount");
var settlementStatus = smGlobal.getQueryString("settlementStatus");
var dataListModel;

var settingDataModel = function () {
    var self = this;
    self.settinglist = ko.observableArray([]);
}

var pageNo = 1;
var isLoaindOver =true;//是否加载完
$(function () {
    $(".headMoneyCount").text(settingCount);
    dataListModel = new settingDataModel();
    ko.applyBindings(dataListModel);
    getdataList(pageNo);
    //checkIsScrollBottom(pageNo,getdataList);

})

$(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    var scrollHeight = $(document).height();
    var windowHeight = $(this).height();
    if (scrollTop + windowHeight >= scrollHeight - 20 && isLoaindOver) {
            pageNo += 1;
            getdataList(pageNo);
    }
});


var getdataList = function (pageIndex) {
    settlementStatus = settlementStatus ? settlementStatus : 2;
    //console.log(SettlementStatus)
    smGlobal.loadingWithGif();
    isLoaindOver = false;
    apiRequest({
        method: "ReferrerSettlement/GetList",
        async: true,
        type: "POST",
        data: {
            PageSize: 6,
            SettlementStatus: settlementStatus,
            PageNo: pageIndex
        },
        success: function (data) {
           
            smGlobal.removeLoadingGif();
            if (data.isBizSuccess) {
                $(".willContentList").show();
                if (data.data && data.data.length == 0) {
                    if (pageNo == 1) {
                        smGlobal.nullInfo($(".willContentList"), "暂无数据");
                    } else {
                        isLoaindOver = false;
                        return;
                    }
                    return;
                }

                $.each(data.data, function (i, v) {
                    dataListModel.settinglist.push(v);
                })
                if (data.data.length < 6) {
                    isLoaindOver = false;
                    return;
                }
                isLoaindOver = true;
            }
        },
        error: function (data) {
            isLoaindOver = true;
            smGlobal.removeLoadingGif();
            smGlobal.error(data.bizErrorMsg);
           
        }
    });
}

