var preLottery;
var settlementstatus = $("#settlementstatus").val()
var post_data = {
    PageSize: 10,
    PageNo: 1,
    SettlementStatus: settlementstatus
};
$(function () {
    preLottery = new myLotteryModel();
    preLottery.totalCount = ko.observable(preLottery.totalCount);
    preLottery.totalCommission = ko.observable(preLottery.totalCommission);
    ko.applyBindings(preLottery);
    settlementGetList();
});
var myLotteryModel = function () {
    var self = this;
    self.getList = ko.observableArray([]);
    self.buyUserName = ko.observable('');
    self.payBeginTime = ko.observable('');
    self.payEndTime = ko.observable('');
    self.orderStatusName = ko.observable('');
    self.optReset = function () {
        self.buyUserName("");
        self.payBeginTime("");
        self.payEndTime("");
        self.orderStatusName("");
        $(".orderStatus i").removeClass("active");
        if (settlementstatus == 5) {
            post_data["PayBeginTime"] = self.payBeginTime();
            post_data["PayEndTime"] = self.payEndTime();
        } else {
            post_data["ReciveBeginTime"] = self.payBeginTime();
            post_data["ReciveEndTime"] = self.payEndTime();
        }
        post_data["BuyUserName"] = self.buyUserName();
        post_data["OrderPackageStatus"] = '';
        $("#proList").html("");
        preLottery.getList([]);
        settlementGetList();
    }
    self.optConfirm = function () {
        if (self.payBeginTime() && self.payBeginTime() != "" && self.payEndTime() && self.payEndTime() != "") { 
            if (!self.dateCompare(self.payBeginTime(), self.payEndTime())) {
                smGlobal.error("开始时间不能大于结束时间！");
                return;
            }
        }
        post_data["PageNo"] = 1;
        post_data["BuyUserName"] = self.buyUserName();
        if (settlementstatus == 5) {
            post_data["PayBeginTime"] = self.payBeginTime();
            post_data["PayEndTime"] = self.payEndTime();
        } else {
            post_data["ReciveBeginTime"] = self.payBeginTime();
            post_data["ReciveEndTime"] = self.payEndTime();
        }
        var status = '';
        if ($(".orderStatus i.active").length > 0) {
            $.each($(".orderStatus i.active"), function (i, v) {
                if (i == 0) {
                    status += $(v).data("status");
                    self.orderStatusName($(v).text())
                } else {
                    status += "," + $(v).data("status");
                    self.orderStatusName(self.orderStatusName()+"," + $(v).text())
                }

            })
        } else {
            status = $(".orderStatus i.active").data("status");
            self.orderStatusName('');
        }
        post_data["OrderPackageStatus"] = status;
        $("#preFilter").click();
        //alert(post_data["BuyUserName"]);
        //alert(post_data["PayBeginTime"]);
        $("#proList").html("");
        preLottery.getList([]);
        settlementGetList();
    }
    self.fixbgAction = function () {
        $("#preFilter").click();
    }
    self.dateCompare = function (beginDate, endDate) {
        var d1 = new Date(beginDate.replace(/\-/g, "\/")); 
        var d2 = new Date(endDate.replace(/\-/g, "\/")); 
        if(d1 > d2)  return false; 
        else return true;
    }
}
$(".orderStatus").on("click", "i", function () {
    $(this).toggleClass("active");
})
$("#preFilter").click(function () {
    $(".optionChoose").slideToggle();
    var count = parseInt($(this).data("count"));
    if (count % 2 == 0) {
        $(this).parent().addClass("posFixed").css({ "top": 0, "left": 0, "right": 0 });
        $(".fixbg").show();
    } else {
        $(this).parent().removeClass("posFixed");
        $(".fixbg").hide();
    }
    count++;
    $(this).data("count", count);
})

function settlementGetList() {
    if ($(".loading3").length <= 0) {
        smGlobal.loadingFixed();
        $(".loadingFixed").show();
    }
    apiRequest({
        method: "ReferrerSettlement/GetList",
        async: true,
        data: post_data,
        success: function (obj) {
            smGlobal.removeHomeGif();
            $(".proList").show();
            if (obj.isBizSuccess) {
                preLottery.totalCount(obj.totalCount);
                preLottery.totalCommission(obj.attachedData.totalCommission);
                if (obj.data && obj.data.length == 0) {
                    setCookie("pageIntFlag", true, "", "/", 30);
                    if (post_data.PageNo == 1) {
                        smGlobal.nullInfo2($("#proList"), "wdgwc", "暂无数据");
                    } else {
                        //smGlobal.error("没有更多的数据");
                    }
                    return;
                }
                //console.log(obj);
                var datas = obj.data;
                //alert(obj.data.length);
                $.each(obj.data, function (i, v) {
                    preLottery.getList.push(v);
                })
                if (obj.data.length < post_data.PageSize) {
                    if (post_data.PageNo != 1) {
                        //smGlobal.error("没有更多的数据");
                    }
                    setCookie("pageIntFlag", true, "", "/", 30);
                } else {
                    setCookie("pageIntFlag", false, "", "/", 30);
                }
            }
            
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });

}

$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
        // ajax方法
        var pageIntFlag = getCookie("pageIntFlag");
        if (pageIntFlag != "true") {
            setCookie("pageIntFlag", true, "", "/", 30);
            post_data.PageNo++;
            settlementGetList();
        }

    }
});

