var model;
var userid = 0;
//var productModel = function () {
//    var self = this;
//    self.actId = ko.observable();
//    self.productId = ko.observable();
//    self.productName = ko.observable();
//    self.productImgUrl = ko.observable();
//    self.praiseCount = ko.observable();
//    self.stockCount = ko.observable();
//    self.startSellCount = ko.observable();
//    self.oldPrice = ko.observable();
//    self.newPrice = ko.observable();
//    self.hasPraise = ko.observable();
//};
//var productImageUrlsModel = function () {
//    var self = this;
//    self.list = ko.observableArray([]);
//}
$(function () {

    //model = new productImageUrlsModel();
    //$(detailObj).each(function (i, item) {
    //    if (item.praiseCount > 99)
    //        item.praiseCount = "99+";
    //    else
    //        item.praiseCount = item.praiseCount + "";
    //    item.skuPriceRange = "￥" + $.fmoney(item.skuPriceRange);
    //    item.productPrice = "￥" + $.fmoney(item.productPrice);
    //});
    //model.list = ko.observableArray(productImageUrls);
    //ko.applyBindings(model);
    ko.applyBindings(detailObj);
});

//var myScroll;
//function loaded() {
//    myScroll = new IScroll('#wrapper', {
//        snap: true,
//        momentum: false,
//        scrollX: true, scrollY: false,
//        preventDefault: false,
//        click: true,
//    });
//    myScroll.on('scrollEnd', function () {
//        var bb = this.x;
//        $("#indicator li").each(function (index) {
//            if (bb == $(this).text()) {
//                $(this).addClass("slide_on");
//            }
//            else {
//                $(this).removeClass("slide_on");
//            }
//        });
//    });
//}

//赞
$('.zan').on('click', function (e) {
    if (!getCookie(".ASPXAUTHH5")) {
        window.location.href = "/Account/login"
    }
    var $this = $(this);
    var hasOn = $(this).children('.home_heart').hasClass("home_heart_on");
    var praiseAction = '';
    if (hasOn) {
        praiseAction = 'cancel';
    } else {
        praiseAction = 'add';
    }
    var activityId = $("#activityId").val();

    var praiseCount = $(this).children('.praiseCount').text() * 1;
    $.ajax({
        type: 'post',
        url: '/product/ProductPraise',
        data: { activityId: activityId, praiseAction: praiseAction },
        dataType: 'json',
        success: function (data) {
            if (data.data) {
                if (hasOn) {
                    $this.children('.home_heart').removeClass("home_heart_on");
                    praiseCount--;
                    $this.children('.praiseCount').text(praiseCount);
                } else {
                    $this.children('.home_heart').addClass("home_heart_on");
                    praiseCount++;
                    $this.children('.praiseCount').text(praiseCount);
                }

            }
        },
        error: function (xhr) {
            console.log('ajax 请求失败', xhr.status, xhr.statusText);
        }
    });

    //e.stopPropagation();
});

//document.addEventListener('DOMContentLoaded', loaded, false);