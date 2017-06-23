var isSubmit = false;
var LoginModel = {
    isShow: ko.observable(true),
    nickNameList: ko.observableArray([]),
    userName: ko.observable().extend({
        required: { params: true, message: "*" }
    }),
    password: ko.observable().extend({
        required: {
            params: true,
            message: "*",
        }
    }),
    jumpoperate: function () {
        var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
        var uid = this.userId;
        //可以提交数据了.
        var params = { UserId: this.userId, PassWord: LoginModel.password(), OpenId: openId, LoginSystem: 3 };
        if (isSubmit) {
            return;
        }
        isSubmit = true;
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
                        isSubmit = false;
                        console.log('ajax 请求失败', xhr.status, xhr.statusText);
                    }
                });
            },
            error: function (obj) {
                isSubmit = false;
                console.log(obj)
                smGlobal.error(obj);
            }
        });

        //alert();
    },
    //盒子定位
    boxPosition: function (obj) {
        var objHeight = obj.width();
        obj.css({ "top": "50%", "margin-top": -objHeight / 2 })
    },
    //登录
    login: function () {
        if (!$.regRequired(this.userName(), "用户名不能为空")) {
            return false;
        }
        if (!$.regRequired(this.password(), "密码不能为空")) {
            return false;
        }
        if (LoginModel.errors().length == 0) {
            var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
            //可以提交数据了.
            var params = { LoginName: this.userName(), PassWord: this.password(), OpenId: openId, LoginSystem: 3 };
            //console.log(params);
            //return;
            if (isSubmit) {
                return;
            }
            isSubmit = true;
            apiRequest({
                method: "ServiceUser/Login",
                async: false,
                beforeSend: function () {
                    $(".subText").addClass("eventNone").css("background", "#ccc").text("登录中...");
                },
                data: params,
                success: function (obj) {
                    window.localStorage.setItem("userName", LoginModel.userName());
                    if (obj.data.isSkip) {
                        //console.log(obj.data)
                        //console.log(obj.data.stdclass.list.userId);
                        //return;
                        var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
                        var uid = obj.data.stdclass.list.userId;
                        //可以提交数据了.

                        //$.ajax({
                        //    type: 'post',
                        //    url: '/Account/SuccessLogin',
                        //    data: {},
                        //    dataType: 'json',
                        //    success: function (data) {
                        //        if (data.state == 1) {
                        //            //window.location.href = data.url;
                        //            location.replace(data.url);
                        //        }
                        //    },
                        //    error: function (xhr) {
                        //        isSubmit = false;
                        //        console.log('ajax 请求失败', xhr.status, xhr.statusText);
                        //    }
                        //});
                    } else {
                        isSubmit = false;
                        LoginModel.isShow(obj.data.isSkip);
                        LoginModel.nickNameList(obj.data.listuserResultSimp);
                        LoginModel.boxPosition($(".nickSelect"));
                    }
                    $(".subText").removeClass("eventNone").css("background", "#dc6263").text("登录");
                },
                error: function (obj) {
                    $(".subText").removeClass("eventNone").css("background", "#dc6263").text("登录");
                    smGlobal.error(obj);
                    isSubmit = false;
                }
            });


        }
    },
    showLayer: ko.observable(false),

    btShowLayer: function () {
        this.showLayer(true);
    },
    btCancelLayer: function () {
        this.showLayer(false);
    }
};
LoginModel.errors = ko.validation.group(LoginModel);

$(function () {
    ko.applyBindings(LoginModel);

    $("#userName").on("input", function () {
        if ($(this).val() == "") {
            window.localStorage.removeItem("userName");
            window.localStorage.removeItem("password");
        }

    })

    var userName = window.localStorage.getItem("userName");
    if (userName != null) {
        LoginModel.userName(userName);
    }
   

})
