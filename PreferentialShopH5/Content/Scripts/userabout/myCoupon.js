var couponModel;
var pageNum = 0;
var thisIndex = $("#showTab").val() == "my" ? 1 : 0;
var thisLi = $(".youhuiTab  div").eq(thisIndex);
var pageIndex = thisLi.data("pageindex");
var param = {
    PageSize: 10,
    PageNo: pageIndex
}
var clickFlag1 = false, clickFlag2 = false;
$(".youhuiTab div").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    thisLi = $(this);
    
    thisIndex = $(this).index(), pullup_num = $(this).data("pullup_num"), pageIndex = $(this).data("pageindex");
    
    param.PageNo = pageIndex;
    $(".coupBody").eq(thisIndex).show().siblings().hide();
    
    switch (thisIndex) {
        case 0:
            if (!clickFlag1) {
                smGlobal.loadingHomeGif();
                //$(".getYouhui").html('');
                //couponModel.getWaitReceive([]);
                getWaitReceive();
                clickFlag1 = true;
                break;
            }
        case 1:
            if (!clickFlag2) {
                smGlobal.loadingHomeGif();
                //couponModel.getMyCoupon([]);
                //$(".myYouhui").html('');
                getMyCoupon();
                clickFlag2 = true;
                break;
            }
            
    }
    
    
});
//$(".coupshareIcon").off().on("click", function ()

function coupClick(obj) {
    if (!getCookie(".ASPXAUTHH5")) {
        autoLogin(this);
        return;
    }
    var shareTitle = $(obj).attr("shareTitle");
    var shareDesc = $(obj).attr("shareDesc");
    var shareImg = $(obj).attr("shareImg");
    var linkUrl = WXMVCUrl + '/Share/Arrive?ReferrerUserId=' + CurrentUserId + "&ReturnUrl=/userAbout/myCoupon";
    wx.onMenuShareAppMessage({
        title: "【Malls·五洲精选】" + shareTitle,
        desc: shareDesc.replace(/\n/g, "").replace(/\r/g, ""), // 分享描述
        link: linkUrl,
        imgUrl: shareImg,
        trigger: function (res) {
            // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
        },
        success: function (res) {
            //   alert('已分享');
        },
        cancel: function (res) {
            //alert('已取消');
        },
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
    wx.onMenuShareTimeline({
        title: "【Malls·五洲精选】" + shareTitle + "-" + shareDesc.replace(/\n/g, "").replace(/\r/g, ""),
        desc: '', // 朋友圈不支持
        link: linkUrl,
        imgUrl: shareImg,
        trigger: function (res) {
            // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
        },
        success: function (res) {
            // alert('已分享');
        },
        cancel: function (res) {
            // alert('已取消');
        },
        fail: function (res) {
            alert(JSON.stringify(res));
        }
    });
    
    //移动端专用
    setTimeout(function () {
        try {
            if (typeof mobile.appShareClickDo == "function") {
                mobile.appShareClickDo(linkUrl, shareDesc, shareImg, shareTitle);
                return;
            }
        } catch (e) {

        }
        if (typeof appShareClickDo == "function") {
            appShareClickDo(linkUrl, shareDesc, shareImg, shareTitle);
            return;
        }
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.shareName) {
                window.webkit.messageHandlers.shareName.postMessage([linkUrl, shareDesc, shareImg, shareTitle]);
                return;
            }
                $("body").append("<div id='divShareLayer' class='layer' style='z-index:1000;height:100%;width:100%;top:0px;position:fixed;background:rgba(0, 0, 0,0.60);text-align:right'> <img id='sharefriend' style='width:80%;' src='/Content/images/share.png'  /><div>")
                setTimeout(function () {
                    $(".layer").off().on("click", function () {
                        $(this).remove();
                    })
                }, 0);

        
    }, 0);
    
}
var myCouponModel = function () {
    var self = this;
    self.getWaitReceive = ko.observableArray([]);
    self.getMyCoupon = ko.observableArray([]);

}
$(function () {
    couponModel = new myCouponModel();
    ko.applyBindings(couponModel);

    var showTab = $("#showTab").val();
    if (showTab == "my") {
        $(".youhuiTab div").eq(1).click();
    } else {
        getWaitReceive();
    }
})
var getWaitReceive = function () {
    var listObj = {};
    apiRequest({
        method: 'Coupon/GetWaitReceive',
        data: param,
        async: true,
        success: function (data) {
            smGlobal.hideHomeGif();
            if (data.isBizSuccess) {

                if (data.data.length == 0) {
                    if (param.PageNo == 1) { $(".getYouhui").html('<img style="width:50%; margin-left:25%;margin-top:35%" src="/content/images/myCoupon01.png" />'); }
                    else { $(".getYouhui .noMoreData").show(); }
                    thisLi.data("nodata", true);
                    return;
                }
                if (data.data.length < param.PageSize) {
                    $(".getYouhui .noMoreData").show();
                    thisLi.data("nodata", true);
                }
                if (data.data.length > 0) {
                    $.each(data.data, function (i, v) {
                        for (var obj in v) {
                            if (obj == "validBeginTime" || obj == "validEndTime") {
                                if (v[obj].indexOf("-") != -1) {
                                    v[obj] = v[obj].replace(/\-/g, "/");
                                }
                                listObj[obj] = new Date(v[obj]).Format("yyyy-MM-dd");
                            } else {
                                listObj[obj] = v[obj];
                            }
                        }
                        couponModel.getWaitReceive.push(listObj);
                    })
                    $(".couponCon").show();
                }
                param.PageNo++;
                thisLi.data('pageindex', param.PageNo);
            } else {
                smGlobal.error(data.bizErrorMsg);
            }
        },
        error: function (data) {
            smGlobal.error(data);
            smGlobal.hideHomeGif();
        }
    });
}
var getMyCoupon = function () {
    var listObj = {};
    apiRequest({
        method: 'Coupon/GetMyCoupon',
        data: param,
        async: true,
        success: function (data) {
            smGlobal.hideHomeGif();
            if (data.isBizSuccess) {
                console.log(data.data.length)
                console.log(param.PageSize)
                if (data.data.length == 0) {
                    if (param.PageNo == 1) $(".myYouhui").html('<img style="width:50%; margin-left:25%;margin-top:35%" src="/content/images/myCoupon02.png" />');
                    else $(".myYouhui .noMoreData").show();
                    thisLi.data("nodata", true);
                    return;
                }
                if (data.data.length < param.PageSize) {
                     $(".myYouhui .noMoreData").show();
                    thisLi.data("nodata",true);
                }
                if (data.data.length > 0) {
                    $.each(data.data, function (i, v) {
                        for (var obj in v) {
                            if (obj == "validBeginTime" || obj == "validEndTime") {
                                if (v[obj].indexOf("-") != -1) {
                                    v[obj] = v[obj].replace(/\-/g, "/");
                                }
                                listObj[obj] = new Date(v[obj]).Format("yyyy-MM-dd");
                            } else {
                                listObj[obj] = v[obj];
                            }
                        }
                        couponModel.getMyCoupon.push(listObj);
                    })
                }
                param.PageNo++;
                thisLi.data('pageindex', param.PageNo);
            } else {
                smGlobal.error(data.bizErrorMsg);
            }
        },
        error: function (data) {
            smGlobal.error(data);
            smGlobal.hideHomeGif();
        }
    });
}
$(".getYouhui").on("click", ".actionSpan", function () {
    receiveCoupon($(this));
})
$(".myYouhui").on("click", ".actionSpan", function () {
    //console.log($(this).attr("data-title"));
    //return;
    var couponStatus = parseInt($(this).attr("data-couponstatus"));
    if (couponStatus != 1000 && couponStatus != 3000) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.useCoupons) {
            window.webkit.messageHandlers.useCoupons.postMessage([$(this).attr("data-proid"), $(this).attr("data-providerid")]);
            return;
        }
        window.location.href = "/Classify/themePromoList?ProductId=" + $(this).attr("data-proid") + "&providerUserId=" + $(this).attr("data-providerid") + "&isShareProduct=1&hideCat=1&title=%25e4%25bc%2598%25e6%2583%25a0%25e5%2595%2586%25e5%2593%2581";
    }
})
var receiveCoupon = function ($obj) {
    var coupid = $obj.attr("data-coupid");
    //alert(coupid);
    //return;
    //{"data":{"myCouponId":2,"isAllReceive":true},"errCode":null,"errMsg":null,"bizErrorMsg":null,"isBizSuccess":true}
    smGlobal.loadingHomeGif();
    apiRequest({
        method: 'Coupon/Receive',
        async: true,
        data: { CouponActivityId: coupid },
        success: function (data) {
            smGlobal.hideHomeGif();
            if (data.isBizSuccess) {
                showPassDialog();
            } else {
                smGlobal.error(data.bizErrorMsg);
            }
        },
        error: function (data) {
            smGlobal.error(data);
            smGlobal.hideHomeGif();
        }
    });

}
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    //alert(this)
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var showPassDialog = function () {
    if ($(".passwdDialog").length > 0) {
        $(".passwdDialog").show();
        $(".fixbg").show();
    } else {
        var passwdDialog = $("<div></div>").addClass("passwdDialog box");
        passwdDialog.append('<h2 class="dialogTitle pl40 pr30 fs14">领取成功！您可到“我的优惠券”中查询或者使用</h2>');
        var diaInpt = $('<p class="btnBody"><span class="diaReset disblock ac fs12 fl" onclick="goMyCoupon()">查看我的优惠券</span><span class="diaInsure ac fs12 disblock fl" onclick="clearDialog()">查看其他优惠券</span></p>');
        var fixedbg = '<div class="fixbg"></div>';
        passwdDialog.append(diaInpt);
        $('body').append(passwdDialog).append(fixedbg);
    }
}
var clearDialog = function () {
    if ($(".passwdDialog").length > 0) {
        $(".passwdDialog").remove();
        $(".fixbg").remove();
    }
    $(".youhuiTab").children("div").eq(0).click();
    //window.location.reload(true);
}
var goMyCoupon = function () {
    if ($(".passwdDialog").length > 0) {
        $(".passwdDialog").remove();
        $(".fixbg").remove();
    }
    couponModel.getMyCoupon([]);
    clickFlag2 = false;
    thisLi = $(".youhuiTab").children("div").eq(1);
    thisLi.data("pageindex",1);
    thisLi.data("nodata", false);
    thisLi.click();

}
$(window).scroll(function () {
    //当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
        pullup_num = thisLi.data("pullup_num");
        pageIndex = thisLi.data("pageindex");
        var nodata = thisLi.data("nodata");
        console.log(nodata);
        if (thisIndex == 0 && !nodata) {
            smGlobal.loadingHomeGif();
            getWaitReceive();
        } else if (thisIndex == 1 && !nodata) {
            smGlobal.loadingHomeGif();
            console.log(0);
            getMyCoupon();
        }
    }
});
