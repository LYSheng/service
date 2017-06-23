/// <reference path="../../Scripts/jquery-2.1.1.js" />

var dataListModel;
var broaCastDataModel = function () {
    var self = this;
    self.list = ko.observableArray([]);
}

$(function () {
    loadBroaCastData();
    dataListModel = new broaCastDataModel();
    ko.applyBindings(dataListModel);
    addTitleOrHiddenTab();
})

var addTitleOrHiddenTab = function () {
    $("header .header").append("<center><span style='color:#fff;font-size:18px; '>公告信息</span></center>");
}

var loadBroaCastData = function () {
    apiRequest({
        method: "NoticeInfo/GetList",
        async: true,
        type: "POST",
        data:{
            From:"C"
        },
        success: function (data) {
            console.log(data);
            if (data.isBizSuccess) {
                dataListModel.list(data.data);
            }

        },
        error: function (data) {
            console.log(data);
        }
    });
}