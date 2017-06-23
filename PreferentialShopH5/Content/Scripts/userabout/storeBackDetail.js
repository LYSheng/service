
var type = smGlobal.getQueryString("type");
var _url;
if (type == "member") {
    _url = "MyWallet/GetNewMembershipStatistics";
    document.title = "门店新增会员总计";
    $("#salesTitle").html("新增会员数<span>（人次）</span>");
} else if (type == "charge") {
    _url = "MyWallet/GetInvestmentStatistics";
    document.title = "门店充值总计";
    $("#salesTitle").html("充值额<span>（元）</span>");
} else if (type == "sales") {
    _url = "MyWallet/GetSaleStatistics";
    document.title = "门店销售额总计";
    $("#salesTitle").html("实际销售额<span>(元)</span>");
} else {
    _url = "MyWallet/GetWithdrewDividendsDetail";
    document.title = "已结算详情";
    $("#salesTitle").html("已结算金额<span>(金币)</span>");
}
var date = new Date;
var _year = date.getFullYear();
$(function () {
    var storeSalseModel = function () {
        var self = this;
        //self.projectShortName = ko.observable();
        self.salesList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            ssModel = new storeSalseModel();
            ko.applyBindings(ssModel);
            page.initPage();
            //分页
        },
        scrollFun: function () {
            if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 30) {

                // ajax方法
                var pageIntFlag = getCookie("pageIntFlag");
                if (pageIntFlag != "true") {
                    setCookie("pageIntFlag", true, "", "/", 30);
                    _pageNo++;
                    page.initPage();
                }

            }
        },
        initPage: function () {
            apiRequest({
                method: _url,
                data: { Year: _year },
                async: true,
                beforeSend: function () {
                    if ($(".loadingFixed").length <= 0) {
                        smGlobal.loadingFixed();
                        $(".loadingFixed").show();
                    }
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    if (obj.isBizSuccess) {
                        if (obj.data && obj.data.length > 0) {
                            console.log(obj.data);
                            for (var i = 0; i < obj.data.length; i++) {
                                if (type == "member") {
                                    obj.data[i].amount = obj.data[i].count;
                                } else {
                                    obj.data[i].amount = obj.data[i].amount.toFixed(2);
                                }
                                obj.data[i].year = _year;
                                ssModel.salesList.push(obj.data[i]);
                            }
                            $(".storeSales").show();
                            if (obj.isOverPag) {
                                _year = _year - 1;
                                $("#year").html(_year);
                                $(".members-btn").addClass("hide");
                                $(".members-btn a").off().on("click", page.initPage);
                            } else {
                                $(".members-btn").removeClass("hide");
                            }
                            
                        } else {
                            if (_year == (new Date).getFullYear()) {
                                $(".storeSales").hide();
                                smGlobal.nullInfo($("#proList"), "暂无数据");
                            }
                        }

                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        }
    }
    page.init();
})