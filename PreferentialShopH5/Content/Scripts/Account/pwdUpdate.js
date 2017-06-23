/// <reference path="../base.js" />

var reset;
var resetModel = function () {
    var self = this;
    self.pwd = ko.observable().extend({
        //required: { params: true, message: "*" },
    });
    self.newPwd = ko.observable().extend({
       // required: { params: true, message: "*" },
    });
    self.confirmPwd = ko.observable().extend({
      //  required: { params: true, message: "*" },
    });
    self.confirm = function () {
        if (this.pwd() == "" || this.pwd() == null) {
            smGlobal.error("原密码不能为空");
            return false;
        }
        if (this.newPwd() == "" || this.newPwd() == null) {
            smGlobal.error("新密码不能为空");
            return false;
        } else {
            if (!/^([\u4e00-\u9fa5_A-Za-z0-9]){6,12}$/.test(this.newPwd())) {
                smGlobal.error("请输入6-12位新密码！");
                return false;
            }
        }
        if (this.confirmPwd() == "" || this.confirmPwd() == null) {
            smGlobal.error("确认密码不能为空");
            return false;
        }
        if (this.newPwd() != this.confirmPwd()) {
            smGlobal.error("密码输入不一致");
            return;
        }
        //可以提交数据了.{"isSuccess":true}
        var params = {
            "NewPwd": this.newPwd(),
            "OldPwd": this.pwd()
        }
        //console.log(params);
        //return;
        apiRequest({
            method: "User/UpdatePwd",
            async: false,
            data: params,
            success: function (obj) {
                if (obj.isBizSuccess) {
                    smGlobal.heiAutoError("密码修改成功！", 1500);
                    //setTimeout(function () { window.history.go(-1); }, 1500);
                    setTimeout(function () { window.location.href = "/Account/LogOff?ReturnUrl=/account/login" }, 1500);
                }
            },
            error: function (obj) {
                smGlobal.heiAutoError(obj, 2500);
            }
        });
    }

}

$(function () {
    reset = new resetModel();
    ko.applyBindings(reset);
})