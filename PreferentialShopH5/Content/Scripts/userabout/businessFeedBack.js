var isShowSummary = smGlobal.getQueryString("isShowSummary");
var isShowList = smGlobal.getQueryString("isShowList");
var isInvestment = smGlobal.getQueryString("isInvestment");
var isFinance = smGlobal.getQueryString("isFinance");
$(function () {
    var businessFeedBackModel = function () {
        var self = this;
        self.storeCount = ko.observable(); //店铺数量
        self.canDividends = ko.observable(); //应返回馈
        self.dividendsToInvestmentSum = ko.observable(); //待结算
        self.withdrewDividends = ko.observable(); //累计回馈
        self.bFBList = ko.observableArray([]);   // 门店数据
        self.dividendsSum = ko.observable();  //本月待结算
        self.feedBackSum = ko.observable(); //店铺累积回馈
        
        self.investmentAmountMonth = ko.observable(); //本月充值额
        self.investmentAmountSum = ko.observable(); //累计充值额
        self.newAddUserMonth = ko.observable(); //本月新增会员
        self.newAddUserSum = ko.observable(); //累计新增会员
        self.salesAmountMonth = ko.observable(); //本月销售额
        self.salesAmountSum = ko.observable(); //累计销售额
    }
    var page = {
        init: function () {
            bfbModel = new businessFeedBackModel();
            ko.applyBindings(bfbModel);
            page.initPage();
        },
        initPage: function () {
            
            apiRequest({
                method: "MyWallet/BusinessFeedback",
                async: true,
                beforeSend: function () {
                    if ($(".loadingFixed").length <= 0) {
                        smGlobal.loadingFixed();
                        $(".loadingFixed").show();
                    }
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    console.log(obj);
                    if (obj.isBizSuccess) {
                        //bfbModel.storeCount(obj.data.storeCount);
                        bfbModel.canDividends(obj.data.userBusiness.canDividends.toFixed(2));
                        bfbModel.dividendsToInvestmentSum(obj.data.userBusiness.dividendsToInvestmentSum.toFixed(2));
                        bfbModel.withdrewDividends(obj.data.userBusiness.withdrewDividends.toFixed(2));
                        var _dividendsSum = 0, _feedBackSum = 0, _storeCount = 0;
                        var _investmentAmountMonth = 0; //本月充值额
                        var _investmentAmountSum = 0;//累计充值额
                        var _newAddUserMonth = 0; //本月新增会员
                        var _newAddUserSum = 0;//累计新增会员
                        var _salesAmountMonth = 0; //本月销售额
                        var _salesAmountSum = 0;//累计销售额
                            for (var i = 0; i < obj.data.storeBusiness.length; i++) {
                                if (!obj.data.storeBusiness[i].isTransfer) {
                                    _dividendsSum = obj.data.storeBusiness[i].dividendsToInvestmentSum + _dividendsSum;
                                    _investmentAmountMonth = obj.data.storeBusiness[i].investmentAmount + _investmentAmountMonth;
                                    _investmentAmountSum = obj.data.storeBusiness[i].accumulatedInvestmentAmount + _investmentAmountSum;
                                    _newAddUserMonth = obj.data.storeBusiness[i].newAddUser + _newAddUserMonth;
                                    _newAddUserSum = obj.data.storeBusiness[i].userCount + _newAddUserSum;
                                    _salesAmountMonth = obj.data.storeBusiness[i].salesAmount + _salesAmountMonth;
                                    _salesAmountSum = obj.data.storeBusiness[i].accumulatedSalesAmount + _salesAmountSum;
                                    _storeCount = _storeCount + 1;
                                }
                                _feedBackSum = obj.data.storeBusiness[i].withdrewDividends + _feedBackSum;
                                bfbModel.bFBList.push(obj.data.storeBusiness[i]);
                            }
                            bfbModel.dividendsSum(_dividendsSum.toFixed(2));
                            bfbModel.feedBackSum(_feedBackSum.toFixed(2));
                            bfbModel.storeCount(_storeCount);

                            bfbModel.investmentAmountMonth(_investmentAmountMonth.toFixed(2));
                            bfbModel.investmentAmountSum(_investmentAmountSum.toFixed(2));
                            bfbModel.newAddUserMonth(_newAddUserMonth);
                            bfbModel.newAddUserSum(_newAddUserSum);
                            bfbModel.salesAmountMonth(_salesAmountMonth.toFixed(2));
                            bfbModel.salesAmountSum(_salesAmountSum.toFixed(2));
                            
                            if (obj.data.storeCount == 0 || isShowSummary == "False") {
                                $(".store-all").hide();
                            } else {
                                if (isFinance == "False") {
                                    $(".other-one").removeClass("other-one");
                                    $(".other-list").hide();
                                }else{
                                    $(".other-one").removeClass("other-one");
                                    $(".other-list").removeClass("other-list");
                                }
                                $(".store-all").show();
                            }
                            if (isInvestment == "False") {
                                $("#memberShow").hide();
                            } else {
                                $("#memberShow").show();
                            }
                            $("#storeList .list").show();
                            $(".toMembers").off().on("click", page.toMembers); //点击进入新增会员详情
                            $(".toRecharges").off().on("click", page.toRecharges);  //点击查看充值详情
                            $(".toSales").off().on("click", page.toSales);  //点击查看销售详情
                            $(".toBacks").off().on("click", page.toBacks);  // 点击查看已结算详情
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        toMembers: function () {
            var _storeId = $(this).closest(".list-detail").data("id");
            if (_storeId == -1) {
                window.location.href = "/userAbout/storeBack?type=member";
                return false;
            }
            window.location.href = "/userAbout/storeMembers?storeuserid=" + _storeId;
        },
        toRecharges: function () {
            var _storeId = $(this).closest(".list-detail").data("id");
            if (_storeId == -1) {
                window.location.href = "/userAbout/storeBack?type=charge";
                return false;
            }
            window.location.href = "/userAbout/storeRecharge?storeuserid=" + _storeId;
        },
        toSales: function () {
            var _storeId = $(this).closest(".list-detail").data("id");
            if (_storeId == -1) {
                window.location.href = "/userAbout/storeBack?type=sales";
                return false;
            }
            window.location.href = "/userAbout/storeSales?storeuserid=" + _storeId;
        },
        toBacks:function(){
            window.location.href = "/userAbout/storeBack" ;
        }
    }
    page.init();
})