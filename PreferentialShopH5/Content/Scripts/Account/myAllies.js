var myAllies;
var myCurAlies = [];
var post_data = {
    pageSize: 20,
    pageNo: 1
};
$(function () {
    myAllies = new myAlliesModel();
    ko.applyBindings(myAllies);
    alliesList();
    $(".searcAlies").bind("input", function () {
        myAllies.alliesList([]);
        var str = $(".searcAlies").val();
        $.each(myCurAlies, function (i, v) {
            if (str == "" || v.userName.indexOf(str) > -1) {
                myAllies.alliesList.push(v);
            }

        });
    });
});
var myAlliesModel = function () {
    var self = this;
    self.alliesList = ko.observableArray([]);

}

function alliesList() {
    var level = $("#level").val();
    if (!level && level != "") {
        smGlobal.error("获取不到您的盟友类型");
        return;
    }
    post_data["Level"] = level;
    if ($(".loading3").length <= 0) {
        smGlobal.loadingFixed();
        $(".loadingFixed").show();
    }
    apiRequest({
        method: "User/GetMyAlliesFromLevel",
        async: true,
        data: post_data,
        success: function (obj) {
            smGlobal.removeHomeGif();
            $("#proList").show();
            if (obj.isBizSuccess) {
                if (obj.data && obj.data.length == 0) {
                    setCookie("pageIntFlag", true, "", "/", 30);
                    if (post_data.pageNo == 1) {
                        smGlobal.nullInfo2($("#proList"), "wddz", "您的盟友还没有哦!");
                    } else {
                        //smGlobal.error("没有更多的数据");
                    }
                    return;
                }
                //console.log(obj);
                var datas = obj.data;
                $.each(obj.data, function (i, v) {
                    myAllies.alliesList.push(v);
                    myCurAlies.push(v);
                })
                if (obj.data.length < post_data.pageSize) {
                    //smGlobal.error("没有更多的数据");
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
            post_data.pageNo++;
            alliesList();
        }

    }
});

