
var model;
var dropload;
var myScroll;
var pageIndex = 1;
var isLoaindOver = true;
var OderCode = 0;//0发起订单 1支持订单
function checkIsScrollBottom() {
    //$(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    var scrollHeight = $(document).height();
    var windowHeight = $(this).height();
    if (scrollTop + windowHeight >= scrollHeight - 150) {
        return true;
    } else {
        return false;
    }
    //});
}

function loaded() {
    myScroll = new IScroll('#wrapper', {
        scrollbars: true,
        mouseWheel: true,
        interactiveScrollbars: true,
        shrinkScrollbars: 'scale',
        fadeScrollbars: true
    });
    myScroll.on('scrollEnd', function () {
        myScroll.scrollToElement(document.querySelector('#scroller li:nth-child(5)'))
        console.log("scrollEnd");
    });
}

//document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
$(".wrapper").on("click", ".todetail", function () {
    var crowdfundingOrderId = $(this).attr("data-id");
    window.location.href = "/CustPlanning/CrowFundingDetail?crowdfundingOrderId=" + crowdfundingOrderId;
})
var crowdFundingModel = function () {
    var self = this;
    self.list = ko.observableArray([]);
    self.getOrder = function (code, obj) {
        pageIndex = 1;
        dropload.unlock();
        if (code == "0") {//发起订单
            OderCode = 0;
            $(".crowd_tab span:first-child").addClass("tab_selected");
            $(".crowd_tab span:last-child").removeClass("tab_selected");

        } else {
            OderCode = 1;
            //支持订单
            $(".crowd_tab span:last-child").addClass("tab_selected");
            $(".crowd_tab span:first-child").removeClass("tab_selected");
        }
        loadData();

    }
}

$(function () {
    //loaded();
    model = new crowdFundingModel();
    ko.applyBindings(model);



    loadData();
})

function loadData(me) {
    //console.log(me);
    isLoaindOver = false;
    apiRequest({
        data: { OderType: OderCode, PageNo: pageIndex, PageSize: 6 },
        method: "CrowdfundingOrder/GetCrowdfundingOrderList",
        success: function (obj) {
            $(".wrapper").show();
            smGlobal.removeHomeGif();
            isLoaindOver = true;
            if (obj.isBizSuccess) {
                if (me != undefined) {
                    me.resetload();
                }

                if (pageIndex > 1) {
                    if (obj.data.length < 6) {
                        //pageIndex--;
                        //smGlobal.error("加载完成,没有更多数据！");
                        dropload.lock();
                    }
                    for (var i = 0; i < obj.data.length; i++) {
                        model.list.push(obj.data[i]);
                    }

                } else {
                    model.list(obj.data);
                    if (obj.data.length < 6) {
                        //pageIndex--;
                        //smGlobal.error("加载完成,没有更多数据！");
                        dropload.lock();
                    }
                    if ($(".nodata_shop").length > 0) {
                        $(".nodata_shop").remove();
                    }
                }
                if (obj.data.length == 0 && pageIndex == 1) {
                    smGlobal.nullInfo($(".wrapper"), "暂无数据");
                }
                dropload.resetload()
                console.log(obj);
            }
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            $(".wrapper").show()
            smGlobal.error(obj);
            isLoaindOver = true;
            if (me != undefined) {
                me.resetload();
            }
        }
    });
}


dropload = $('.wrapper').dropload({
    domUp: {
        domClass: 'dropload-up',
        domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
        domUpdate: '<div class="dropload-update">↑释放更新</div>',
        domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
    },
    domDown: {
        domClass: 'dropload-down',
        domRefresh: '<div class="dropload-refresh">↑上拉加载更多</div>',
        domUpdate: '<div class="dropload-update">↓释放加载</div>',
        domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
    },
    loadUpFn: function (me) {
        setTimeout(function () {
            me.resetload();
        }, 1000);

    },
    loadDownFn: function (me) {
        if (checkIsScrollBottom()) {
            pageIndex++;
            loadData(me);
        }
        setTimeout(function () {
            me.resetload();
        }, 3000);
    }
});
