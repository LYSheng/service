//var _investmentInfoId = smGlobal.getQueryString("investmentInfoId");
var _pageSize = 15, _pageNo = 1;
$(function () {
    var dividendListModel = function () {
        var self = this;
        //self.projectShortName = ko.observable();
        self.dividendList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            dividendListM = new dividendListModel();
            ko.applyBindings(dividendListM);
            page.initPage();
            //分页
            $(window).scroll(page.scrollFun);
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
                method: "MyWallet/FGetAccountDetailsListToDividendsGetList",
                //data: { investmentInfoId: _investmentInfoId },
                data: { pageNo: _pageNo, pageSize: _pageSize },
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
                            console.log(obj.data)
                            if (obj.data && obj.data.length == 0) {
                                setCookie("pageIntFlag", true, "", "/", 30);
                                if (_pageNo == 1) {
                                    $("#proList").show();
                                    smGlobal.nullInfo2($("#proList"), "wdgwc", "暂无数据");
                                } else {
                                    //smGlobal.error("没有更多的数据");
                                }
                                return;
                            }
                            for (var i = 0; i < obj.data.length; i++) {
                                dividendListM.dividendList.push(obj.data[i]);
                            }
                            if (obj.data.length < _pageSize) {
                                if (_pageNo != 1) {
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
    }
    page.init();
})