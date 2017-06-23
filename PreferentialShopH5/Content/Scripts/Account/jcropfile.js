
//$("#file1").on('change', function () {
//    ajaxFileUpload();
//});
var addressIds = [];
var address = [];
var delete_obj;//当前删除订单对象
var imgHost = '';
var sesStorge = window.sessionStorage;
var isSubmit = false;
$(function () {
    $("input:file").upload({
        beforeUpload: function () {
            //$.Loading();
            return true;
        },
        callback: function (path) {
            $(".myhdpic").attr("src", path + '?quality=l');
            //console.log(path);
            //return;
            //服务器换头像请求方法在后面
            apiRequest({
                method: 'User/UpdateUserPic',
                async: false,
                data: { "UserPic": path },
                success: function (obj) {
                    if (obj.isBizSuccess) {
                        smGlobal.error("用户头像保存成功！");
                    }
                },
                error: function (obj) {
                    smGlobal.error(obj);
                }
            });
        }
    });
});
$(".usermimg").click(function () {
    window.location.href = "ClipImg";
});
$(".nickAction").click(function () {
    var nickName = $("#nickName").val().trim();
    if (nickName == '') {
        smGlobal.error("昵称不能为空！");
        return;
    }
    var options = {
        url: 'User/UpdateUserInfo',
        data: { NickName: nickName }
    };
    apiRequest({
        method: options.url,
        async: false,
        data: options.data,
        success: function (obj) {
            if (obj.data) {
                smGlobal.error("用户昵称保存成功！");
                var sestorage = window.sessionStorage;
                sestorage.setItem("refreshFlag", true);
                setTimeout(function () { history.go(-1) }, 1500);
            }
        },
        error: function (obj) {
            smGlobal.error(obj);
        }
    });
})
$(".setDefaultAdr").click(function () {
    var adrId = $(this).data("adrid");
    var $this = $(this);
    var $defaultAdr = $(".setDefaultAdr");
    apiRequest({
        method: 'UserAddress/SetDefault',
        async: false,
        data: { "UserAddressId": adrId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("默认收货地址设置成功！");
                $defaultAdr.children("i").removeClass("onn");
                $this.children("i").addClass("onn");
            }
        },
        error: function (obj) {
            smGlobal.error(obj);
        }
    });
})
$("#toggleDefault").click(function () {
    $(this).toggleClass("onn");
});

$(".adraddBtn").click(function () {
    var $this = $(this);
    $this.addClass("poiEventsNone");
    var receiveName = $("#receiveName").val();
    var phone = $("#phone").val();
    var area = $("#area");
    var areaDetail = $("#areaDetail").val();
    var userName = $("#userName").val();
    var userAddressId = $("#userAddressId").val();
    var IsDefault = $("#toggleDefault").hasClass("onn") ? 1 : 0;
    var tipText = "添加";
    if (receiveName == "") {
        smGlobal.error("收货人不能为空", 2);
        $this.removeClass("poiEventsNone");
        return;
    }
    if (phone == "") {
        smGlobal.error("手机号码不能空", 2);
        $this.removeClass("poiEventsNone");
        return;
    } else {
        if (phone.length != 11) {
            smGlobal.error("手机号码长度不合法", 2);
            $this.removeClass("poiEventsNone");
            return;
        }
    }
    if (area.attr("data-provinceid") == "" || area.attr("data-cityid") == "" || area.attr("data-areaid") == "") {
        smGlobal.error("请选择所属区域", 2);
        $this.removeClass("poiEventsNone");
        return;
    }
    if (areaDetail == "") {
        smGlobal.error("收货地址不能为空", 2);
        $this.removeClass("poiEventsNone");
        return;
    }
    //if (addressIds[0] == '' || addressIds[1] == '' || addressIds[2] == '') {
    //    smGlobal.error("请选择省市区");
    //    $this.removeClass("poiEventsNone");
    //    return;
    //}
    var data = {
        Name: receiveName, Phone: phone, Postcode: "", UserAddressId: 0,
        Province: area.attr("data-provinceid"), City: area.attr("data-cityid"), Area: area.attr("data-areaid"),
        Address: areaDetail, IsDefault: IsDefault, AddressType: 1
    }
    if (userAddressId) {
        data.UserAddressId = userAddressId;
        tipText = '修改';
    }
    if (isSubmit) {
        return false;
    }
    isSubmit = true;
    apiRequest({
        method: 'UserAddress/UpdateOrAdd',
        async: false,
        data: data,
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("收货地址" + tipText + "成功！");
                $this.removeClass("poiEventsNone");
                setTimeout(function () {
                    setCookie("refreshFlag", true, "", "/", 30);
                    //window.history.go(-1);
                    //location.href = '/userAbout/addressList?actionType=' + $("#actionType").val();
                    var actionType = $("#actionType").val();
                    if (actionType) {
                        var addressObj = {};
                        addressObj["userAddressId"] = obj.data ? obj.data : userAddressId;
                        addressObj["province"] = area.attr("data-provinceid");
                        addressObj["city"] = area.attr("data-cityid");
                        addressObj["area"] = area.attr("data-areaid");
                        addressObj["name"] = receiveName;
                        addressObj["phone"] = phone;
                        addressObj["address"] = areaDetail;
                        addressObj["provinceName"] = area.attr("data-provincename");
                        addressObj["cityName"] = area.attr("data-cityname");
                        addressObj["areaName"] = area.attr("data-areaname");
                        sesStorge.setItem("addressObj", JSON.stringify(addressObj));
                        if (actionType == 1) {
                            location.href = '/userAbout/orderConfirmImmediate';
                        } else if (actionType == 2) {
                            location.href = '/userAbout/orderConfirm';
                        } else if (actionType == 3) {
                            location.href = '/userAbout/bargainOrderImmediate';
                        }
                        //window.history.go(-1);
                    } else {
                        //location.href = '/userAbout';
                        self.location = document.referrer;
                    }

                }, 500);
            } else {
                isSubmit = false;
            }
        },
        error: function (obj) {
            $this.removeClass("poiEventsNone");
            smGlobal.error(obj);
            isSubmit = false;
        }
    });
})
$(".adrdel").click(function () {
    var addressId = $(this).data("adrid");
    var index = $(".adrdel").index(this);
    var $window_w = $(window).width();
    var $window_h = $(window).height();
    var $custom_w = $(".custom").width();
    var $custom_h = $(".custom").height();
    var $scroll_height = document.body.scrollTop;
    $(".custom").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    $(".popback").show();
    $(".custom").show();
    delete_obj = $(this);
})
$(".adrqx").click(function () {
    $(".popback").hide();
    $(".custom").hide();
});
$(".adrqd").click(function () {
    var addressId = $(delete_obj).data("adrid");
    var index = $(".adrdel").index(delete_obj);
    if (isSubmit) {
        return false;
    }
    isSubmit = true;
    apiRequest({
        method: 'UserAddress/Delete',
        async: false,
        data: { UserAddressId: addressId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("收货地址删除成功！");
                $(".adrcomlist").eq(index).remove();
                isSubmit = false;
            }
            $(".popback").hide();
            $(".custom").hide();
        },
        error: function (obj) {
            $(".popback").hide();
            $(".custom").hide();
            smGlobal.error(obj);
            isSubmit = false;
        }
    });
});
$(".adrBody").children(":not('p')").click(function () {
    var addressObj = {};
    var actionType = $("#actionType").val();
    if (actionType) {
        $parObj = $(this).parent();
        addressObj["userAddressId"] = $parObj.data("adrid");
        addressObj["province"] = $parObj.data("province");
        addressObj["city"] = $parObj.data("city");
        addressObj["area"] = $parObj.data("area");
        addressObj["name"] = $parObj.find("i#name").text();
        addressObj["phone"] = $parObj.find("span#phone").text();
        addressObj["address"] = $parObj.find("#address").text();
        addressObj["provinceName"] = $parObj.find("#provinceName").text();
        addressObj["cityName"] = $parObj.find("#cityName").text();
        addressObj["areaName"] = $parObj.find("#areaName").text();
        sesStorge.setItem("addressObj", JSON.stringify(addressObj));
        //window.history.go(-1);
        if (actionType == 1) {
            location.href = '/userAbout/orderConfirmImmediate';
        } else if (actionType == 2) {
            location.href = '/userAbout/orderConfirm';
        } else if (actionType == 3) {
            location.href = '/userAbout/bargainOrderImmediate';
        }
    }
})