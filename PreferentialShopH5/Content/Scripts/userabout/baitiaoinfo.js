var baitiaoModel = function () {
    var self = this;
    self.auditContent = ko.observable();
    self.identityCardUserName = ko.observable();
    self.identityCardCode = ko.observable();
    self.bankCardNum = ko.observable();
    self.iouMobilePhone = ko.observable();
    self.iouMobilePhonePwd = ko.observable();
    self.frontSideSrc = ko.observable();
    self.backSideSrc = ko.observable();
    self.halfBodySrc = ko.observable();
    // self.cateList = ko.observableArray([]);
}
$("#bohui").html("您的猫白条信息已提交，请耐心等待审核").show();
btm = new baitiaoModel();
ko.applyBindings(btm);

ajaxGet();
function ajaxGet() {
    apiRequest({
        method: "UserIou/Get",
        async: true,
        beforeSend: function () {
            if ($(".loadingFixed").length <= 0) {
                smGlobal.loadingFixed();
                $(".loadingFixed").show();
            }
        },
        success: function (obj) {
            smGlobal.removeHomeGif();

            if (obj.isBizSuccess) {
                console.log(obj);
                btm.auditContent(obj.data.auditContent);
                btm.identityCardUserName(obj.data.identityCardUserName);
                btm.identityCardCode(obj.data.identityCardCode);
                btm.bankCardNum(obj.data.bankCardNum);
                btm.iouMobilePhone(obj.data.iouMobilePhone);
                btm.iouMobilePhonePwd(obj.data.iouMobilePhonePwd);
                
                for (var i = 0; i <3; i++) {
                    var _obj = $(".contents-upload li").eq(i);
                    console.log(_obj)
                    if(i == 0){
                        _obj.css({ "background-image": "url(" + obj.data.frontSideSrc + ")"});
                    }else if(i==1){
                        _obj.css({ "background-image": "url(" + obj.data.backSideSrc + ")"});
                    }else{
                        _obj.css({ "background-image": "url(" + obj.data.halfBodySrc + ")"});
                    }
                    
                }
            }
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });
}