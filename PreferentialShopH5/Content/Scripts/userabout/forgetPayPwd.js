var num = 60;
$(function () {

    var page = {
        init: function () {
            //获取验证码
            $("#upCode").on("click", page.upCode);
            //点击下一步
            $("#btnClick").on("click", page.nextBtn);
        },
        upCode: function () {
            var _tel = $.trim($("#tel").val());
            if (!_tel) {
                smGlobal.error("请输入手机号");
                return false;
            }
            if (_tel.length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
            apiRequest({
                method: "User/ForgetPwdCode",
                async: false,
                data: { Phone: _tel },
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
        doInterval:function(){
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
        nextBtn: function () {
            var _tel = $.trim($("#tel").val());
            var _code = $.trim($("#code").val());
            if (!_tel) {
                smGlobal.error("请输入手机号");
                return false;
            }
            if (_tel.length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
            if (!_code) {
                smGlobal.error("请输入手机收到的验证码");
                return false;
            }
            apiRequest({
                method: "User/CheckForgetPwdCode3_1",
                async: false,
                data: {Phone:_tel,Code:_code},
                success: function (obj) {
                    if (obj.isBizSuccess) {
                        window.location.href = "/userAbout/payPwd?type=1&tel="+_tel+"&code="+_code;
                    }
                    console.log(obj);
                },
                error: function (obj) {
                    smGlobal.heiAutoError(obj, 2500);
                }
            });
        }
    }
    page.init();
})