var _storeId = smGlobal.getQueryString("storeuserid");
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
                method: "MyWallet/GetSaleStatistics",
                //data: { investmentInfoId: _investmentInfoId },
                data: { StoreUserId: _storeId,Year:_year },
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