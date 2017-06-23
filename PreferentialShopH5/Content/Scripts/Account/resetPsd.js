/// <reference path="../base.js" />

var reset;
var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
var resetModel = function () {
    var self = this;
    self.psd = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.rePsd = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.confirm = function () {
        if ($(".psd1").val() != $(".psd2").val()) {
            smGlobal.error("密码输入不一致");
            return;
        }
        if ($(".psd1").val().length<6 ||$(".psd2").val()<6) {
            smGlobal.error("密码至少输入6位");
            return;
        }
        var shareid = (getCookie("referrerUserId") == "null" ? null : getCookie("referrerUserId"));
        //可以提交数据了.{"isSuccess":true}
        var params = {
            Phone: smGlobal.getQueryString("phone"),
            PassWord: this.psd(),
            NickName: "u" + getRandomName(),
            Channel: 30,
            Captcha: smGlobal.getQueryString("validateCode"),
            RegisterPlatform: 1000,
            OpenId:openId,
            ReferrerUserId: shareid,

            SceneId: ''
        }
        //console.log(params);
        //return;
        var isUpdateBind = smGlobal.getQueryString("isUpdateBind");
        var method = "User/Register3_1";
        if(isUpdateBind!=""){
            method = "User/UpdateWxUserInfo";
        }
        apiRequest({
            method:method,
            async: false,
            data: params,
            success: function (obj) {
                setCookie("referrerUserId","", "", "/",-1);
                if (obj.isBizSuccess) {
                    smGlobal.error("绑定成功！", 1000);
                    var openId = getCookie("OpenId") ? getCookie("OpenId") : "";
                    var uid = obj.data.userId;
                    var paramsLogin = { UserId: uid, PassWord: params.PassWord, OpenId: openId, LoginSystem: 3 };
                    setTimeout(function () {
                        apiRequest({
                            method: "User/Login3_1",
                            async: false,
                            data: params,
                            success: function (obj) {
                                var cardId = smGlobal.getQueryString("cardId");
                                var shopId = smGlobal.getQueryString("shopId");
                                var getshopcart = smGlobal.getQueryString("getshopcart");
                                var promotionid = smGlobal.getQueryString("promotionid");
                                if (cardId) {
                                    window.location.replace("/userAbout/checkstand?cardId=" + cardId + "&shopId=" + shopId);
                                }else if (getshopcart) {
                                    window.location.replace("/mall/getShoppingCart");
                                }else if (promotionid) {
                                    window.location.replace("/product/detail?activityId=" + promotionid);
                                } else {
                                    window.location.replace(smGlobal.getQueryString("ReturnUrl"));
                                }
                                
                            },
                            error: function (obj) {
                                smGlobal.error(obj);
                            }
                        });

                    }, 1000);
                }

            },
            error: function (obj) {
                smGlobal.heiAutoError(obj, 2500);
            }
        });
    }

}

function deleteCookie(name) {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = name + "=; expire=" + date.toGMTString() + "; path=/;domain=.abc.com";
};

function getRandomName() {
    var result = "";
    for (var i = 0; i < 8;i++){
        result+=Math.ceil(Math.random() * 10);
    }
    return result;
}

$(function () {
    reset = new resetModel();
    ko.applyBindings(reset);
})