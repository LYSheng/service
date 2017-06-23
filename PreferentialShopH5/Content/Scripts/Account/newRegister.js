/// <reference path="../base.js" />

var num = 60;
var reg = /^\d{11}\b/;
var isSubmit = false;
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
            $("#password").attr("type", "password");
        } else {
            $(".feature").addClass("on");
            $("#password").attr("type", "text");

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
            if (!reg.test(this.phone())) {
                smGlobal.error("手机号码不合法！");
                return false;
            }
            if (this.phone().length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
        }

        //为昵称赋值避免拿不到用户昵称
        
        //var re = new RegExp("^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{2,20}$");//英文和数字的组合
        var re = new RegExp("^[\D]{1}([\u4e00-\u9fa5_A-Za-z0-9]){1,15}$");
        //alert($("#nickName").val())
        //
        //if ($("#nickName").val() == "" || $("#nickName").val() == null) {
        //    smGlobal.heiAutoError("请输入用户名", 2500);
        //    return false;
        //}


        if (!/^[\D]{1}([\u4e00-\u9fa5_A-Za-z0-9]){1,15}$/.test($("#nickName").val()) || $("#nickName").val() == "undefined") {
            smGlobal.heiAutoError("请输入2-16位用户名且第一位不能为数字", 2500);
            return false;
        }

        if ($("#password").val() == "" || $("#password").val() == null) {
            smGlobal.error("请输入密码");
            return false;
        } else {
            if (!/^([\u4e00-\u9fa5_A-Za-z0-9]){6,12}$/.test($("#password").val())) {
                smGlobal.heiAutoError("请输入6-12位密码,仅可为数字或字母",2500);
                return false;
            }
        }

        if (this.captcha().trim() == "") {
            smGlobal.error("输入验证码");
            return false;
        }
        getUserListByPhone(this.captcha());

        

    };

    //获取验证码
    self.getCaptcha = function () {
        var $this = this;
        if (this.phone() == "" || this.phone() == null) {
            smGlobal.error("请输入手机号");
            return false;
        }
        else {
            if (!reg.test(this.phone())) {
                smGlobal.error("手机号码不合法！");
                return false;
            }
            if (this.phone().length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
        }
        var params = { Phone: this.phone() }
        //console.log(params);
        //return;
        apiRequest({
            method: "User/SendCode",
            async: false,
            data: params,
            success: function (obj) {
                if (obj.data.isSend) {
                    //captcha = obj.data.captcha;
                    $this.doInterval();
                }
            },
            error: function (obj) {
                if (obj.bizErrorMsg) {
                    smGlobal.heiAutoError(obj.bizErrorMsg, 2500);
                }else{
                    smGlobal.heiAutoError(obj, 2500);
                }
                
            }
        });
    };

};
function register() {
    var shareid = (getCookie("referrerUserId") == "null" ? null : getCookie("referrerUserId"));
    //可以提交数据了.{"isSuccess":true}
    var params = {
        Phone: $("#userName").val(),
        PassWord: $("#password").val(),
        NickName: $("#nickName").val(),
        Channel: 30,
        Captcha: $("#validateCode").val(),
        RegisterPlatform: 1000,
        ReferrerUserId: shareid,
        SceneId: ''
    }
    console.log(params);
    //return;
    apiRequest({
        method: "User/Register3_1",
        async: false,
        data: params,
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.error("注册成功！");
                window.location.href = getUrlParam("ReturnUrl");
            }

        },
        error: function (obj) {
            smGlobal.heiAutoError(obj, 2500);
            isSubmit = false;
        }
    });
}

function getUserListByPhone(validateCode) {
    var isUpdateBind = smGlobal.getQueryString("isUpdateBind");
    window.localStorage.setItem("userName", $("#userName").val());
    isUpdateBind = isUpdateBind == null ? "" : isUpdateBind;
    if (isSubmit) {
        return;
    }
    isSubmit = true;
    if (isUpdateBind.length > 0) {
        window.location.href = "/account/setpsd?isUpdateBind=" + isUpdateBind + "&validateCode=" + validateCode + "&phone=" + $("#userName").val() + "&ReturnUrl=/userAbout";
        return;
    }
    requestUserNameWithValidateCode(validateCode);
   
}

function requestUserNameWithValidateCode(validateCode) {
    $(".regesterName").text($("#nickName").val());
    apiRequest({
        method: "User/GetUserListByPhone",
        data: { PhoneNum: $("#userName").val(), Captcha: validateCode, CaptchaType: "Register", Password: $("#password").val() },
        success: function (obj) {
            if (obj.isBizSuccess) {
                console.log(obj);
                if (obj.data.length > 0) {
                    smGlobal.error("您的手机号已经注册");
                    isSubmit = false;
                }  
                else {
                    register();
                }
            }

        },
        error: function (obj) {
            smGlobal.error(obj);
            isSubmit = false;
        }
    });
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
                        //window.location.href = data.url;
                        location.replace(data.url);
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
    $(".fullbg_register").show();
    if ($(obj).attr("register")!=undefined) {
        register();
        return;
    }
    var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
    var uid = $(obj).attr("userId");
    //可以提交数据了.
    var params = { "OpenId": openId, "UserId": uid, "PhoneNum": $("#userName").val(), "Captcha": $("#validateCode").val(), "LoginName": $(obj).text() };

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
                        //window.location.href = data.url;
                        location.replace(data.url);
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
$("#password").val("");