var _investmentInfoId = smGlobal.getQueryString("investmentInfoId");

$(function () {
    var memberInvestmentListModel = function () {
        var self = this;
        //self.projectShortName = ko.observable();
        self.memberInvestmentList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            memberInvestment = new memberInvestmentListModel();
            ko.applyBindings(memberInvestment);
            page.initPage();
        },
        initPage: function () {
            apiRequest({
                method: "MyWallet/GetThisMonthDividendsToOrderInvestment",
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
                        if (obj.data.length > 0) {
                            console.log(obj.data)
                            for (var i = 0; i < obj.data.length; i++) {
                                memberInvestment.memberInvestmentList.push(obj.data[i]);
                            }
                        } else {
                            smGlobal.nullInfo($("#proList "), "暂无预计佣金", ".wdgwc");
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