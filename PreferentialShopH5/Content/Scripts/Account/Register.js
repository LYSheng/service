/// <reference path="../base.js" />

var num = 60;


if ($("#shareid").val()) {
    setCookie("referrerUserId", $("#shareid").val(), "", "/", 30);
}
//else {
//    setCookie("referrerUserId", null, "", "/", 30);
//}
var RejisterModel = function () {
    var self = this;
    self.userlist = ko.observableArray([]);
    self.nickName = ko.observable().extend({
        //minLength: { params: 2, message: "昵称最小长度为2个字符！" },
        //maxLength: { params: 10, message: "昵称最大长度为10个字符！" },
        required: { params: true, message: "*" }
    });

    self.phone = ko.observable().extend({
        required: { params: true, message: "*" },
        //phoneUS: {
        //    params: true,
        //    message: "手机格式不合法"
        //}

    });

    self.captcha = ko.observable("").extend({
        required: { params: true, message: "*" }
    });

    self.psd = ko.observable().extend({

        required: { params: true, message: "*" }
    });

    self.hasSend = ko.observable(false);
    self.pwdtypChange = function () {
        if ($(".feature").hasClass("on")) {
            $(".feature").removeClass("on");
            $("#passWord").attr("type", "password");
        } else {
            $(".feature").addClass("on");
            $("#passWord").attr("type", "text");

        }
    };
    self.showTime = ko.observable();
    self.doInterval = function () {
        if (num > 0) {
            num = num - 1;
            //self.showTime("重新发送(" + num + ")秒");
            $(".getCode").text(num + "秒重新发送").addClass("poiEventsNone");
            setTimeout(function () { self.doInterval() }, 1000);
        }
        else {
            $(".getCode").text("获取验证码").removeClass("poiEventsNone");
            num = 60;
        }
    };

    //注册
    self.rejister = function () {
        if (this.phone() == "" || this.phone() == null) {
            smGlobal.error("请输入手机号");
            return false;
        }
        else {
            if (this.phone().length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
        }

        if (this.captcha().trim() == "") {
            smGlobal.error("输入验证码");
            return false;
        }
        getUserListByPhone(this.captcha());
        return;
    };
    //获取验证码
    self.getCaptcha = function () {
        var $this = this;
        if (this.phone() == "" || this.phone() == null) {
            smGlobal.error("请输入手机号");
            return false;
        }
        else {
            if (this.phone().length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
        }
        var params = { Phone: this.phone() }
        //console.log(params);
        //return;
        apiRequest({
            method: "User/SendBindCode",
            async: false,
            data: params,
            success: function (obj) {
                if (obj.data.isSend) {
                    //captcha = obj.data.captcha;
                    $this.doInterval();
                }
            },
            error: function (obj) {
                smGlobal.heiAutoError(obj, 2500);
            }
        });
    };
};
function getUserListByPhone(validateCode) {
    var isUpdateBind = smGlobal.getQueryString("isUpdateBind");
    var cardId = smGlobal.getQueryString("cardId");
    var shopId = smGlobal.getQueryString("shopId");
    var getshopcart = smGlobal.getQueryString("getshopcart");
    var promotionid = smGlobal.getQueryString("promotionid");
    window.localStorage.setItem("userName", $("#userName").val());
    isUpdateBind = isUpdateBind == null ? "" : isUpdateBind;
    console.log(isUpdateBind.length)
    if (isUpdateBind.length > 0) {
        apiRequest({
            method: "User/AuthSendBindCode",
            data: { Phone: $("#userName").val(), Captcha: validateCode },
            success: function (obj) {
                if (obj.isBizSuccess) {
                    if (cardId*1>0) {
                        window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&cardId=" + cardId + "&shopId=" + shopId;
                        return false;
                    }
                    if (getshopcart*1 > 0) {
                        window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&getshopcart=" + getshopcart;
                        return false;
                    }
                    if (promotionid*1 > 0) {
                        window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&promotionid=" + promotionid;
                        return false;
                    }

                    window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&ReturnUrl=/userAbout";
                    
                    return;
                }

            },
            error: function (obj) {
                smGlobal.error(obj);
            }
        });
        
    } else {
        apiRequest({
            method: "User/GetUserListByPhone",
            data: { PhoneNum: $("#userName").val(), Captcha: validateCode },
            success: function (obj) {
                if (obj.isBizSuccess) {
                    if (obj.data.length > 1) {
                        $(".shawdowCell").show();
                        $(".userList").show();
                        vm.userlist(obj.data);
                    } else if (obj.data.length == 1) {
                        autoLogin(obj.data[0].userId, validateCode, obj.data[0].userName);

                    }
                    else {
                        window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&ReturnUrl=/userAbout";
                    }
                }

            },
            error: function (obj) {
                smGlobal.error(obj);

            }
        });
    }
   
}

function autoLogin(userid, validateCode, userName) {
    var openid = getCookie("OpenId") ? getCookie("OpenId") : "";
    apiRequest({
        method: 'User/Login3_1',
        async: false,
        data: { "OpenId": openid, "UserId": userid, "PhoneNum": $("#userName").val(), "Captcha": validateCode, "LoginName": userName },
        success: function (list) {
            $.ajax({
                type: 'post',
                url: '/Account/SuccessLogin',
                data: {},
                dataType: 'json',
                success: function (data) {
                    if (data.state == 1) {
                        window.location.href = data.url;
                    }
                },
                error: function (xhr) {
                    console.log('ajax 请求失败', xhr.status, xhr.statusText);
                }
            });
        },
        error: function (data) {
            smGlobal.error(obj);
        }
    });
}

function selectedUser(obj) {
    $(".shawdowCell").hide();
    $(".userList").hide();
    var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
    var uid = $(obj).attr("userId");
    //可以提交数据了.
    var params = { "OpenId": openId, "UserId": uid, "PhoneNum": $("#userName").val(), "Captcha": $("#passWord").val(), "LoginName": $(obj).text() };

    //return;
    apiRequest({
        method: "User/Login3_1",
        async: false,
        data: params,
        success: function (obj) {
            $.ajax({
                type: 'post',
                url: '/Account/SuccessLogin',
                data: {},
                dataType: 'json',
                success: function (data) {
                    if (data.state == 1) {
                        window.location.href = data.url;
                    }
                },
                error: function (xhr) {
                    console.log('ajax 请求失败', xhr.status, xhr.statusText);
                }
            });
        },
        error: function (obj) {
            smGlobal.error(obj);
        }
    });
}
var vm = new RejisterModel();
vm.errors = ko.validation.group(vm);
ko.applyBindings(vm);
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}