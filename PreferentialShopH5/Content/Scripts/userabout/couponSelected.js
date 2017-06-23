var couponModel;
var sesStorge = window.sessionStorage;
var myCouponModel = function () {
    var self = this;
    self.canUseCoupon = ko.observableArray([]);
}

$(function () {
    couponModel = new myCouponModel();
    ko.applyBindings(couponModel);
    getMyCoupon();
})
var getMyCoupon = function () {
    var listObj = {};
    var index = parseInt($("#index").val());
    var orderModel = JSON.parse(sesStorge.getItem("orderList"));
    var coupLst;
    if (index >= 0) {
        coupLst = orderModel.list[index].coupObj;
    } else {
        coupLst = orderModel.globalCoupon;
    }
    if (coupLst.length == 0) {
        $(".myYouhui").html('<img style="width:80%; margin-left:10%;margin-top:25%" src="/content/images/myCoupon.png" />');
    } else {
        $.each(coupLst, function (i, v) {
            for (var obj in v) {
                if (obj == "validBeginTime" || obj == "validEndTime") {
                    if (v[obj].indexOf("-") != -1) {
                        v[obj] = v[obj].replace(/\-/g, "/");
                    }
                    listObj[obj] = new Date(v[obj]).Format("yyyy.MM.dd");
                } else {
                    listObj[obj] = v[obj];
                }
            }
            couponModel.canUseCoupon.push(listObj);
        })
        $(".couponCon").show();
    }
    smGlobal.removeLoadingGif();

}
//$(".getYouhui").on("click", ".claim", function () {
//    receiveCoupon($(this));
//})
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
$(".myYouhui").on("click", ".selCoupon", function () {

    var ind = $(".selCoupon").index(this);
    $(".selCoupon").not(this).children(".selRadio").removeClass("on");
    $(".selCoupon").eq(ind).children(".selRadio").addClass("on");
    var useCoupon = {};
    useCoupon["deductAmount"] = $(".selCoupon").eq(ind).children(".selRadio").attr("data-deductamount");
    useCoupon["realityDeductAmount"] = $(".selCoupon").eq(ind).children(".selRadio").attr("data-realitydeductamount");
    useCoupon["fullAmount"] = $(".selCoupon").eq(ind).children(".selRadio").attr("data-fullamount");
    useCoupon["myCouponId"] = $(".selCoupon").eq(ind).children(".selRadio").attr("data-mycouponid");

    var selIndex = parseInt($("#index").val());
    var orderModel = JSON.parse(sesStorge.getItem("orderList"));
    if (selIndex >= 0) {
        var couponList = [];
        couponList.push(useCoupon);
        orderModel.list[selIndex].packageCoupon = couponList;
    } else {
        for (var i = 0; i < orderModel.list.length; i++) {
            orderModel.list[i].packageCoupon = null;
        }
        initOrderModel(orderModel);
        orderModel.useGlobalCoupon = useCoupon;
        var sumRealityDeductAmount = 0;
        var maxUseCoupon = null;
        for (var i = 0; i < orderModel.list.length; i++) {
            var pOrder = orderModel.list[i];
            tempUseCoupon = {};
            tempUseCoupon["deductAmount"] = (useCoupon.realityDeductAmount * (pOrder.totalPrice - pOrder.expressPrice) / (orderModel.total - orderModel.transExpenses)).toFixed(2);

            tempUseCoupon["realityDeductAmount"] = tempUseCoupon["deductAmount"];
            sumRealityDeductAmount += parseFloat(tempUseCoupon["realityDeductAmount"]);
            tempUseCoupon["fullAmount"] = 0;
            tempUseCoupon["myCouponId"] = useCoupon.myCouponId;
            if (maxUseCoupon == null || parseFloat(maxUseCoupon.realityDeductAmount) < parseFloat(tempUseCoupon.realityDeductAmount)) {
                maxUseCoupon = tempUseCoupon;
            }
            var couponList = [];
            couponList.push(tempUseCoupon);
            pOrder.packageCoupon = couponList;
        }
        maxUseCoupon.realityDeductAmount = (parseFloat(maxUseCoupon.realityDeductAmount) + parseFloat(useCoupon.realityDeductAmount) - sumRealityDeductAmount).toFixed(2);
        maxUseCoupon.deductAmount = maxUseCoupon.realityDeductAmount;
    }
    initOrderModel(orderModel);
    sesStorge.setItem("orderList", JSON.stringify(orderModel));
    sesStorge.setItem("quan", "1");
    setTimeout(function () { self.location=document.referrer; }, 100);
})
function initOrderModel(orderModel) {
    var selIndex = parseInt($("#index").val());
    for (var index = 0; index < orderModel.list.length; index++) {
        if (selIndex >= 0 && index != selIndex) {
            continue;
        }
        var useCoupon = { realityDeductAmount: 0 };

        if (orderModel.list[index].packageCoupon && orderModel.list[index].packageCoupon[0]) {
            useCoupon = orderModel.list[index].packageCoupon[0];
        }
        var isImmediately = $("#isImmediately").val();

        if (isImmediately) {
            var minProductFee = orderModel.list[index].data[0].minProductFee;
            var expFee = orderModel.list[index].data[0].shippingFee;
            var totalPrice = 0;
            if (orderModel.computationRule == 0) {//非计件运费
                if (minProductFee > 0) {
                    $.each(orderModel.list[index].data, function (i, v) {
                        totalPrice += v.amount * 1 * v.salesPrice;
                    })
                    if (minProductFee > (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"]))) {
                        orderModel.list[index].expressPrice = parseFloat(expFee).toFixed(2);
                    } else {
                        orderModel.list[index].expressPrice = 0;
                    }
                    orderModel.list[index].totalPrice = (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"])) >= 0 ? parseFloat(parseFloat(totalPrice) + parseFloat(orderModel.list[index].expressPrice) - parseFloat(useCoupon["realityDeductAmount"])).toFixed(2) : parseFloat(orderModel.list[index].expressPrice).toFixed(2);
                } else {
                    var totalPrice = 0;
                    $.each(orderModel.list[index].data, function (i, v) {
                        totalPrice += v.amount * 1 * v.salesPrice;
                    })
                    orderModel.list[index].totalPrice = (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"])) >= 0 ? parseFloat(parseFloat(totalPrice) + parseFloat(orderModel.list[index].expressPrice) - parseFloat(useCoupon["realityDeductAmount"])).toFixed(2) : parseFloat(orderModel.list[index].expressPrice).toFixed(2);
                }
            } else if (orderModel.computationRule == 1) {//计件运费
                var totalPrice = 0;
                $.each(orderModel.list[index].data, function (i, v) {
                    totalPrice += v.amount * 1 * v.salesPrice;
                })
                if (orderModel.list[0].data[0].amount >= minProductFee && minProductFee != 0) {
                    orderModel.list[index].expressPrice = parseFloat(0).toFixed(2);
                }
                orderModel.list[index].totalPrice = (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"])) >= 0 ?
                    parseFloat(parseFloat(totalPrice) + parseFloat(orderModel.list[index].expressPrice) - parseFloat(useCoupon["realityDeductAmount"])).toFixed(2) :
                    parseFloat(orderModel.list[index].expressPrice).toFixed(2);

            }
            var transExpenses = 0;
            $.each(orderModel.list, function (i, v) {
                transExpenses += parseFloat(v.expressPrice);
            })
            var orderToatl = 0;
            $.each(orderModel.list, function (i, v) {
                orderToatl += parseFloat(v.totalPrice);
            })
            orderModel.total = parseFloat(orderToatl).toFixed(2);
            orderModel.transExpenses = parseFloat(transExpenses).toFixed(2);


        } else {

            var expDesc = orderModel.list[index].expDesc;
            var beforePostFee = 0;
            var afterPostFee = 0;
            if (expDesc.indexOf("订单满") != -1) {
                var totalPrice = 0;
                expFullDesc = expDesc.split("元，订单满")[1];
                expFeeDesc = expDesc.split("元，订单满")[0];
                var expFull = parseFloat(expFullDesc.replace("元包邮", ""));
                var expFee = parseFloat(expFeeDesc.replace("运费:", ""));
                beforePostFee = parseFloat(orderModel.list[index].expressPrice);
                $.each(orderModel.list[index].data, function (i, v) {
                    totalPrice += v.amount * 1 * v.salesPrice;
                })
                if (expFull > (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"]))) {
                    //orderModel.list[index].expressPrice = parseFloat(orderModel.list[index].expressPrice).toFixed(2);
                    orderModel.list[index].expressPrice = parseFloat(parseFloat(expFee) + parseFloat(orderModel.list[index].zeroPostFee) + parseFloat(orderModel.list[index].computPostFee)).toFixed(2);
                    afterPostFee = expFee;
                } else {
                    orderModel.list[index].expressPrice = parseFloat(parseFloat(orderModel.list[index].zeroPostFee) + parseFloat(orderModel.list[index].computPostFee)).toFixed(2);
                    afterPostFee = parseFloat(orderModel.list[index].zeroPostFee).toFixed(2);
                }
                orderModel.list[index].totalPrice = (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"])) >= 0
                    ? (parseFloat(totalPrice) + parseFloat(orderModel.list[index].expressPrice) - parseFloat(useCoupon["realityDeductAmount"]))
                    : parseFloat(orderModel.list[index].expressPrice).toFixed(2);
            } else {
                var totalPrice = 0;
                $.each(orderModel.list[index].data, function (i, v) {
                    totalPrice += v.amount * 1 * v.salesPrice;
                })
                orderModel.list[index].totalPrice = (parseFloat(totalPrice) - parseFloat(useCoupon["realityDeductAmount"])) >= 0
                    ? (parseFloat(totalPrice) + parseFloat(orderModel.list[index].expressPrice) - parseFloat(useCoupon["realityDeductAmount"]))
                    : parseFloat(orderModel.list[index].expressPrice).toFixed(2);
            }
            var transExpenses = 0;
            $.each(orderModel.list, function (i, v) {
                transExpenses += parseFloat(v.expressPrice);
            })
            var orderToatl = 0;
            $.each(orderModel.list, function (i, v) {
                orderToatl += parseFloat(v.totalPrice);
            })
            orderModel.total = parseFloat(orderToatl).toFixed(2);
            orderModel.transExpenses = parseFloat(transExpenses).toFixed(2);

        }
    }
}