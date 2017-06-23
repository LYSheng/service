var isSubmit = false;
var ValidateModel = function () {
    var self = this;
    self.psd = ko.observable().extend({
    })
    //确认
    self.confirm = function () {
        if (!$.regRequired(this.psd(), "密码不能为空")) {
            return;
        }
        window.localStorage.setItem("psd", this.psd());
        var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
        //可以提交数据了.
        var nickName = window.localStorage.getItem("nickName") == null ? "" : window.localStorage.getItem("nickName");
        var params = { LoginName: nickName, PassWord: this.psd(), OpenId: openId, LoginSystem: 3 };
        if (isSubmit) {
            return;
        }
        isSubmit = true;
        apiRequest({
            method: "User/Login3_1",
            async: false,
            beforeSend: function () {
                //$(".subText").addClass("eventNone").css("background", "#ccc").text("登录中...");
            },
            data: params,
            success: function (obj) {
                window.location.href = "/account/UpdateMobilePhone?ReturnUrl=/userAbout";
                if (obj.data.isSkip) {
                    var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
                    var uid = obj.data.stdclass.list.userId;
                    
                } else {
                   
                }
                //$(".subText").removeClass("eventNone").css("background", "#dc6263").text("登录");
            },
            error: function (obj) {
                isSubmit = false;
                smGlobal.error(obj);
            }
        });
    };

};

$(function () {

    var model = new ValidateModel();
    ko.validation.group(model);
    ko.applyBindings(model);
    $("nav").hide();
})