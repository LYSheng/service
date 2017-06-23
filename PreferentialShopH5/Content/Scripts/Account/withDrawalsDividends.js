/// <reference path="../base.js" />
var sesStorage = window.sessionStorage;
var reset;

var _isPaymentPassword = sesStorage.getItem("isPaymentPassword") ? _isPaymentPassword = sesStorage.getItem("isPaymentPassword") : '';
console.log(_isPaymentPassword);
//_isPaymentPassword = true;
if (_isPaymentPassword == "true") {
    $("#_payPwd").addClass("show");
}

var resetModel = function () {
    var self = this;
    self.withdrawalsCard = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.withdrawalsAmount = ko.observable();
    self.withdrawalsPwd = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.bankCardId = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.bankCardNum = ko.observable().extend({
        required: { params: true, message: "" },
    });
    self.withCardList = function () {
        window.location.replace("/userAbout/withCardList?choice=1");
    };
    self.confirm = function () {
        if (_isPaymentPassword == "true") {
            $("#_payPwd").addClass("show");
            return false;
        }
        if (this.bankCardNum() == "" || this.bankCardNum() == null || this.bankCardId() == "" || this.bankCardId() == null) {
            smGlobal.error("提现银行卡不能为空");
            return false;
        }
        if (this.withdrawalsAmount() == "" || this.withdrawalsAmount() == null) {
            smGlobal.error("提现金额不能为空");
            return false;
        } else {
            if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(this.withdrawalsAmount())) {
                smGlobal.error("提现金额格式错误");
                return false;
            }
        }
        if (this.withdrawalsPwd() == "" || this.withdrawalsPwd() == null) {
            smGlobal.error("支付密码不能为空");
            return false;
        }
        //可以提交数据了.{"isSuccess":true}
        var params = {
            "BankCardNum": this.bankCardNum(),
            "BankCardId": this.bankCardId(),
            "WithdrawalsAmount": this.withdrawalsAmount(),
            "UserPassword": this.withdrawalsPwd(),
            "AccountType": 100,
        }
        $(".adraddBtn").addClass("poiEventsNone");
        apiRequest({
            method: "UserAccount/ApplyWithdrawalsCommission",
            async: false,
            data: params,
            success: function (obj) {
                $(".adraddBtn").removeClass("poiEventsNone");
                if (obj.isBizSuccess) {
                    //smGlobal.heiAutoError("申请提现成功！", 1500);
                    //setTimeout(function () { window.history.go(-1); }, 1500);
                    var bankSelect = sesStorage.getItem("bankSelect");
                    bankSelect = JSON.parse(bankSelect);
                    location.replace("/userAbout/withDrawalsSuccess?bankCardNum=" + params.BankCardNum + "&withdrawalsAmount=" + params.WithdrawalsAmount + "&cardName=" + bankSelect.cardName + "&form=Dividends");
                }
            },
            error: function (obj) {
                $(".adraddBtn").removeClass("poiEventsNone");
                smGlobal.heiAutoError(obj, 2500);
            }
        });
    }

}

$(function () {
    reset = new resetModel();
    ko.applyBindings(reset);

    var sestorage = window.sessionStorage;
    var bankSelect = sestorage.getItem("bankSelect");
    bankSelect = JSON.parse(bankSelect);
    if (bankSelect) {
        reset.withdrawalsCard(bankSelect.cardName + "  尾号" + bankSelect.cardNum);
        reset.bankCardId(bankSelect.bankCardId);
        reset.bankCardNum(bankSelect.bankCardNum);
        //$("#cardDetail").val(bankSelect.cardName + "&&尾号" + bankSelect.cardNum);

    }
})
$(".cardActionDel").click(function () {
    var id = $(this).attr("data-id");
    //console.log(id);
    //return;
    apiRequest({
        method: "UserBankCard/DelMyBankCard",
        async: false,
        data: { "BankCardId": id },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.heiAutoError("删除成功！", 1500);
                sesStorage.setItem("refreshFlag", true);
                setTimeout(function () { window.history.go(-1); }, 1000);
            }
        },
        error: function (obj) {
            smGlobal.heiAutoError(obj, 2500);
        }
    });
})
$(".chooseB").click(function () {
    var param = {
        cardNum: $(this).data("cardnum"),
        cardName: $(this).data("cardname"),
        bankCardNum: $(this).data("cardnum"),
        bankCardId: $(this).data("bankid")
    }
    sesStorage.setItem("bankSelect", JSON.stringify(param));
    window.history.go(-1);
})

$("#payPwdCancle").on("click", function () {
    $("#_payPwd").removeClass("show");
})
