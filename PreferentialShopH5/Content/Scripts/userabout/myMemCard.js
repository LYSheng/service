//var projectId = smGlobal.getQueryString("projectId"), projectName = smGlobal.getQueryString("projectName");
var _pageSize = 10, _pageNo = 1;
$(function () {
    var myMemCardModel = function () {
        var self = this;
        //self.projectShortName = ko.observable();
        //self.cardList = ko.observableArray([]);
        self.totalAlld = ko.observable();
    }
    var page = {
        init: function () {
            myMemCard = new myMemCardModel();
            ko.applyBindings(myMemCard);
            page.initPage();
            //查看详情
            $(".memList").on("click", page.memDetail);
        },
        memDetail:function(){
            var _infoid = $(this).data("infoid");
            window.location.href = "/userabout/myMemCardDetail";
        },
        initPage: function () {
            apiRequest({
                method: "Investment/GetYesMembershipCard",
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
                        if (obj.data.list.length > 0) {
                            console.log(obj)
                            //for (var i = 0; i < obj.data.list.length; i++) {
                            //    myMemCard.cardList.push(obj.data.list[i]);
                            //}
                            $("#memInfo").show();
                            //$(".memList").off().on("click", page.memDetail);
                            console.log(obj.data.totalAlld[0].totalBalanceAmount)
                            myMemCard.totalAlld(obj.data.totalAlld[0].totalBalanceAmount);
                        } else {
                            $("#sNodata").show();
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