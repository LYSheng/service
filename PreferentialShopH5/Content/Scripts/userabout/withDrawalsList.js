var withdrawalsCommission;
var post_data = {
    PageSize: 10,
    PageNo: 1,
    Status: 20
};
$(function () {
    post_data.accountType = $('#accountType').val();
    withdrawalsCommission = new commissionListModel();
    ko.applyBindings(withdrawalsCommission);
    commissionList();
});
var commissionListModel = function () {
    var self = this;
    self.getList = ko.observableArray([]);
}
function commissionList() {
    if ($(".loading3").length <= 0) {
        smGlobal.loadingFixed();
        $(".loadingFixed").show();
    }
    apiRequest({
        method: "UserAccount/GetWithdrawalsCommissionList",
        async: true,
        data: post_data,
        success: function (obj) {
            console.log(obj)
            smGlobal.removeHomeGif();
            $(".proList").show();
            if (obj.isBizSuccess) {
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
                    withdrawalsCommission.getList.push(v);
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
            commissionList();
        }

    }
});

