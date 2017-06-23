var num = 60;
var _phone = smGlobal.getQueryString("phone");
//$("#userName").val(_phone);
var isSubmit = false;
var forgetPwdModel = function () {
    var self = this;
    self.isShow = ko.observable(true);
    self.isFirstStep = ko.observable(true);
    self.nickNameList = ko.observableArray([]);
    self.nickName = ko.observable().extend({
        //minLength: { params: 2, message: "昵称最小长度为2个字符！" },
        //maxLength: { params: 10, message: "昵称最大长度为10个字符！" },
        required: { params: true, message: "*" }
    });

    self.phone = ko.observable(_phone).extend({
        required: { params: true, message: "*" },
        //phoneUS: {
        //    params: true,
        //    message: "手机格式不合法"
        //}

    });
    self.boxPosition = function (obj) {
        var objHeight = obj.width();
        obj.css({ "top": "50%", "margin-top": -objHeight / 2 })
    };
    self.captcha = ko.observable("").extend({
        required: { params: true, message: "*" }
    });

    self.password = ko.observable().extend({

        required: { params: true, message: "*" }
    });
    self.confirmPwd = ko.observable().extend({

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
    self.forPwdNextJump = function () {
        var $this = this;
        var params = {
            Phone: self.phone(),
            Code: self.captcha().trim(),
            NickName: this.nickName
        }
        //console.log(params);
        //return;
        if (isSubmit) {
            return;
        }
        isSubmit = true;
        apiRequest({
            method: "User/CheckForgetPwdCode3_1",
            async: false,
            data: params,
            success: function (obj) {
                isSubmit = false;
                self.isShow(true);
                if (obj.data.isSkip) {
                    self.nickName($this.nickName);
                    self.isFirstStep(false);
                }
                console.log(obj);
            },
            error: function (obj) {
                isSubmit = false;
                self.isShow(true);
                smGlobal.heiAutoError(obj, 2500);
            }
        });

    }
    self.forPwdNext = function () {
        var $this = this;
        if ($this.phone() == "" || $this.phone() == null) {
            smGlobal.error("请输入手机号");
            return false;
        }
        else {
            if ($this.phone().length != 11) {
                smGlobal.error("手机号码长度不合法！");
                return false;
            }
        }
        if ($this.captcha().trim() == "") {
            smGlobal.error("输入验证码");
            return false;
        }
        var params = {
            Phone: $this.phone(),
            Code: $this.captcha().trim()
        }
        if (!$this.isShow()) {
            params["NickName"] = $this.nickName;
        }
        //console.log(params);
        //return;
        if (isSubmit) {
            return;
        }
        isSubmit = true;
        apiRequest({
            method: "User/CheckForgetPwdCode3_1",
            async: false,
            data: params,
            success: function (obj) {
                isSubmit = false;
                if (obj.data.isSkip) {
                    if (typeof obj.data.nickName != "undefined") {
                        self.nickName(obj.data.nickName);
                    }
                    self.isFirstStep(false);
                } else {
                    $this.isShow(obj.data.isSkip);
                    $this.nickNameList(obj.data.listuserResultSimp);
                    $this.boxPosition($(".nickSelect"));
                }
                console.log(obj);
            },
            error: function (obj) {
                isSubmit = false;
                smGlobal.heiAutoError(obj, 2500);
            }
        });

    }
    //修改密码
    self.retrievePwd = function () {
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
        if (this.password() == "" || this.password() == null) {
            smGlobal.error("请输入密码");
            return false;
        } else {
            if (!/^([\u4e00-\u9fa5_A-Za-z0-9]){6,12}$/.test(self.password())) {
                smGlobal.error("请输入6-12位密码！");
                return false;
            }
        }
        if (this.confirmPwd() == "" || this.confirmPwd() == null) {
            smGlobal.error("请输入确认密码");
            return false;
        } else {
            if (this.confirmPwd() != this.password()) {
                smGlobal.heiAutoError("密码与确认密码不一致，请重新输入",2000);
                return false;
            }
        }
        //可以提交数据了.{"isSuccess":true}
        var params = {
            Phone: self.phone(),
            PassWord: this.password(),
            NickName: this.nickName(),
            Code: self.captcha().trim()
        }
        var _passWord = this.password();
        if (isSubmit) {
            return;
        }
        isSubmit = true;
        apiRequest({
            method: "User/RetrievePwd3_1",
            async: false,
            data: params,
            success: function (obj) {
                if (obj.isBizSuccess) {
                    smGlobal.error("密码修改成功~", 1000);
                    var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
                    var uid = obj.attachedData.userId;
                    //可以提交数据了.
                    var params = { UserId: uid, PassWord: _passWord, OpenId: openId, LoginSystem: 3 };
                    setTimeout(function () {
                        apiRequest({
                            method: "User/Login3_1",
                            async: false,
                            data: params,
                            success: function (obj) {
                                window.location.href = "/userAbout/index";
                            },
                            error: function (obj) {
                                smGlobal.error(obj);
                            }
                        });
                        
                    }, 1000);
                }
            },
            error: function (obj) {
                isSubmit = false;
                smGlobal.heiAutoError(obj, 2500);
            }
        });

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
            method: "User/ForgetPwdCode",
            async: false,
            data: params,
            success: function (obj) {
                if (obj.data.isSend) {
                    $this.doInterval();
                }
                console.log(obj);
            },
            error: function (obj) {
                smGlobal.heiAutoError(obj, 2500);
            }
        });
    };

};
var vm = new forgetPwdModel();
vm.errors = ko.validation.group(vm);
ko.applyBindings(vm);