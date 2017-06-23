var address = [];
var addressIds = [];
var bankCardId = $("#bankCardId").val();
var sesStorage = window.sessionStorage;
var isSubmit = false;
var _choice = smGlobal.getQueryString("choice");
var confirm = function () {
    var bankId = $("#bankId").data("id");
    var userName = $("#userName").val();
    var idCardNo = $("#IdCardNo").val();
    var bankCardNum = $("#bankCardNum").val();
    var provinceId = $("#area").attr("data-provinceid");
    var cityId = $("#area").attr("data-cityid");
    var areaid = $("#area").attr("data-areaid");
    var bankBranchName = $("#bankBranchName").val();
    if (!userName || userName == "") {
        smGlobal.error("持卡人不能为空");
        return false;
    }
    if (!bankCardNum && bankCardNum == "") {
        smGlobal.error("卡号不能为空");
        return false;
    }
    //else {
    //    if (!/^([0-9]){16,19}$/.test(bankCardNum)) {
    //        smGlobal.error("请输入16-19位卡号！");
    //        return false;
    //    }
    //}
    if (!bankId || bankId == "") {
        smGlobal.error("开户行不能为空");
        return false;
    }
    
    if ((!provinceId || provinceId == '') && (!cityId || cityId == '') && (!areaid || areaid == '')) {
        smGlobal.error("开户行所在地不能为空");
        return false;
    }
    if (!bankBranchName || bankBranchName == "") {
        smGlobal.error("所属支行不能为空");
        return false;
    }

    var params = {
        "BankId": bankId,
        "UserName": userName,
        "IdCardNo": idCardNo,
        "BankCardNum": bankCardNum,
        "Province": provinceId,
        "City": cityId,
        "Area": areaid,
        "Type": 0,
        "BankBranchName": bankBranchName
    }
    //console.log(params);
    //return;
    $(".adraddBtn").addClass("poiEventsNone");
    if (isSubmit) {
        return;
    }
    isSubmit = true;
    apiRequest({
        method: "UserBankCard/AddMyBankCard",
        async: false,
        data: params,
        success: function (obj) {
            if (obj.isBizSuccess) {
                isSubmit = true;
                smGlobal.heiAutoError("银行卡信息保存成功！", 1500);
                sesStorage.setItem("refreshFlag", true);
                if (_choice == 1) {
                    setTimeout(function () { window.location.replace("/userAbout/withCardList?choice="+_choice); }, 1500);
                } else {
                    setTimeout(function () { window.location.replace("/userAbout/withCardList"); }, 1500);
                }
                
            }
            $(".adraddBtn").removeClass("poiEventsNone");
        },
        error: function (obj) {
            $(".adraddBtn").removeClass("poiEventsNone");
            smGlobal.heiAutoError(obj, 2500);
            isSubmit = false;
        }
    });
}



$("#setDefault").click(function () {
    if (isSubmit) {
        return;
    }
    isSubmit = true;
    apiRequest({
        method: "UserBankCard/SetDefault",
        async: false,
        data: { "BankCardId": bankCardId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.heiAutoError("默认银行卡设置成功！", 1500);
                sesStorage.setItem("refreshFlag", true);
                setTimeout(function () { window.history.go(-1); }, 1000);
            }
        },
        error: function (obj) {
            smGlobal.heiAutoError(obj, 2500);
            isSubmit = false;
        }
    });
})

$("#delBank").click(function () {
    if (isSubmit) {
        return;
    }
    isSubmit = true;
    var index = $(".adrdel").index(this);
    var $window_w = $(window).width();
    var $window_h = $(window).height();
    var $custom_w = $(".custom").width();
    var $custom_h = $(".custom").height();
    var $scroll_height = document.body.scrollTop;
    $(".custom").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    $(".popback").show();
    $(".custom").show();
})
$(".adrqx").click(function () {
    $(".popback").hide();
    $(".custom").hide();
    isSubmit = false;
});
$(".adrqd").click(function () {
    apiRequest({
        method: 'UserBankCard/DelMyBankCard',
        async: false,
        data: { "BankCardId": bankCardId },
        success: function (obj) {
            if (obj.isBizSuccess) {
                smGlobal.heiAutoError("银行卡信息删除成功！", 1500);
                sesStorage.setItem("refreshFlag", true);
                setTimeout(function () { window.history.go(-1); }, 1000);
                
            }
            $(".popback").hide();
            $(".custom").hide();
        },
        error: function (obj) {
            $(".popback").hide();
            $(".custom").hide();
            smGlobal.error(obj);
            isSubmit = false;
        }
    });
});
$(".bankSel").on("change",function () {
    var bankId = $(".bankSel").val();
    var bankName = $(".bankSel").find("option:selected").text();
    if (bankName != "请选择开户行") {
        $("#bankId").removeClass("ca9");
    } else {
        $("#bankId").addClass("ca9");
    }
    $("#bankId").text(bankName).data("id", bankId);
})