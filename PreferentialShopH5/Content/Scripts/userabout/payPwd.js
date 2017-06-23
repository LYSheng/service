var _type = smGlobal.getQueryString("type");
var _tel = smGlobal.getQueryString("tel") ? smGlobal.getQueryString("tel") : "";
var _code = smGlobal.getQueryString("code") ? smGlobal.getQueryString("code") : "";
var _backUrl = smGlobal.getQueryString("backurl") ? smGlobal.getQueryString("backurl") : "";
var num = 60;
var _phone = window.localStorage.getItem("Phone");
if(!_phone){
    $("#inputSpan").addClass(".red").html("未绑定");
    $(".phoneCall").show();
}else{
    $("#inputSpan").html(_phone);
    $(".phoneCall").hide();
}
var reg = /^\d{6}\b/;
var sesStorage = window.sessionStorage;
$(function () {
    
    var page = {
        init: function () {
            //设置支付密码
            $("#btnClick").on("click", page.setPayPwd);
            //获取验证码
            $("#upCode").on("click", page.upCode);
        },
        upCode: function () {
            if (!_phone) {
                smGlobal.error("请先绑定手机号");
                return false;
            }
            apiRequest({
                method: "User/PaymentSendCode",
                async: false,
                data: { Phone: _phone },
                success: function (obj) {
                    if (obj.data.isSend) {
                        page.doInterval();
                        smGlobal.heiAutoError("验证码已发送");
                    }
                    console.log(obj);
                },
                error: function (obj) {
                    smGlobal.heiAutoError(obj, 2500);
                }
            });
        },
        doInterval: function () {
            if (num > 0) {
                num = num - 1;
                //self.showTime("重新发送(" + num + ")秒");
                $("#upCode").text(num + "秒重新发送").addClass("poiEventsNone");
                setTimeout(function () { page.doInterval() }, 1000);
            }
            else {
                $("#upCode").text("获取验证码").removeClass("poiEventsNone");
                num = 60;
            }
        },
        setPayPwd: function () {
            
            if (!_phone) {
                smGlobal.error("请先绑定手机号");
                return false;
            }
            var _code = $.trim($("#code").val());
            var _setNewPwd = $.trim($("#newPwd").val());
            console.log(_setNewPwd)
            var _setNewPwd1 = $.trim($("#newPwd1").val());
            if (!_code) {
                smGlobal.error("请输入手机收到的验证码");
                return false;
            }
            if (!_setNewPwd) {
                smGlobal.error("请输入支付密码");
                return false;
            }
            if (!reg.test(_setNewPwd)) {
                smGlobal.error("请输入6位数字密码");
                return false;
            }
            if (!_setNewPwd1) {
                smGlobal.error("请再次输入支付密码");
                return false;
            }
            if (_setNewPwd1 != _setNewPwd) {
                smGlobal.error("输入密码不一致，请重新输入");
                $("#setNewPwd1").val();
                return false;
            }
            var _url, params;
            _url = "User/UserPaymentPassword";
            params = { phone: _phone, captcha: _code, paymentPassword: _setNewPwd, password: _setNewPwd1 };
            apiRequest({
                method: _url,
                async: true,
                data: params,
                beforeSend: function () {
                    if ($(".loadingFixed").length <= 0) {
                        smGlobal.loadingFixed();
                        $(".loadingFixed").show();
                    }
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();

                    if (obj.isBizSuccess) {
                        smGlobal.error("支付密码设置成功");
                        sesStorage.setItem("isPaymentPassword", "false");
                        setTimeout(function () {
                            //window.location.href = history.go(-1);
                            self.location = document.referrer;
                        }, 1000);
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