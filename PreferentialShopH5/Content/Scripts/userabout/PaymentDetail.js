var model;
var UserId = getQueryString("UserId");
var AccountType = getQueryString("AccountType");
var ProjectIds = getQueryString("ProjectIds");
var paymentDetailModel = function () {
    var self = this;
    self.countTotal = ko.observableArray([]);
    self.paymentList = ko.observableArray([]);
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
//tab切换
$("#date").on("click", "i", function (e) {
    e.preventDefault();
    var d =new Date();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var className = $(this).attr("data-event");
    var date = $(this).attr("data-date");
    var sibingDate = '';
    var newArry = [], newOwn = [];
    $("#date i").addClass("pointEvNone");
    switch (className) {
        case "pullLeft":
            sibingDate = $(".pullRight").data("date");
            var own = smGlobal.dateSplit(date);        
            var sibling = smGlobal.dateSplit(sibingDate);
            newOwn = dateCount(own, "pre");
            $(this).attr("data-date", newOwn[0] + "." + newOwn[1]);
            if (parseInt(own[1]) == 12) {
                $(".pullRight").attr("data-date", parseInt(own[0])+1 + "."  + 1);
            } else {
                $(".pullRight").attr("data-date", own[0] + "." + (parseInt(own[1]) + 1));
            }
            break;
        case "pullRight":
            sibingDate = $(".pullLeft").data("date");
            var own = smGlobal.dateSplit(date);
            if ((parseInt(date.split(".")[1]) < month && parseInt(date.split(".")[0]) > year) || (parseInt(date.split(".")[1]) > month && parseInt(date.split(".")[0]) == year)) {
                smGlobal.error("当前月份为截止月");
                $("#date i").removeClass("pointEvNone");
                return;
            }
            var sibling = smGlobal.dateSplit(sibingDate);
            newOwn = dateCount(own, "next");
            $(this).attr("data-date", newOwn[0] + "." + newOwn[1]);
            if (parseInt(own[1]) == 1) {
                $(".pullLeft").attr("data-date", (parseInt(own[0]) - 1) + "." + 12);
            } else {
                $(".pullLeft").attr("data-date", own[0] + "." + (parseInt(own[1]) - 1));
            }
            break;
        default:
            console.log("报错啦！")
            break;
    }
    $(".curDtae").text(own[0] + "年" + own[1] + "月");
    model.countTotal([]);
    model.paymentList([]);

    var date = own[0] + "-" + own[1] + "-01";
    //console.log(date);
    ajax(UserId, AccountType, date);
});
var dateCount = function (arr,value) {
    var arrayJudge = arr instanceof Array;
    var newArry = [];
    if (arrayJudge) {
        if (value == "pre") {
            if (parseInt(arr[1]) == 1) {
                newArry.push(parseInt(arr[0]) - 1);
                newArry.push(12);
            }else {
                newArry.push(parseInt(arr[0]));
                newArry.push(parseInt(arr[1])-1);
            }
        }else if (value == "next") {
            if (parseInt(arr[1]) == 12) { 
                newArry.push(parseInt(arr[0]) + 1);
                newArry.push(1);
            }else{
                newArry.push(parseInt(arr[0]));
                newArry.push(parseInt(arr[1])+1);
            }
        }
        return newArry;
    } else {
        return [0,0];
    }

}
$(function () {
    model = new paymentDetailModel();
    ko.applyBindings(model);
    ajax(UserId, AccountType);
})
var ajax = function (UserId, AccountType, DateTime) {
    if (UserId == '' || AccountType == '') {
        smGlobal.error("参数错误");
        return;
    }
    var arr = {
        data: {
            "UserId": UserId,//134600
            "AccountType": AccountType,//0
            "DateTimes": DateTime,
            "ProjectIds": ProjectIds
        },
        beforesend: smGlobal.loadding(".paymentList", "loading1"),
        complete: smGlobal.complete,
        dataType: "json",
        globalType: false
    };

    apiRequest({
        method: 'ErPao/ErPaoGetShouzhiDetail',
        async: true,
        type: "POST",
        data: arr.data,
        success: function (data) {
            smGlobal.complete(".loading1");
            $("#date i").removeClass("pointEvNone");
            if (data.isBizSuccess) {
                if (data.data.list.length > 0) {
                    smGlobal.complete(".loading1");
                    var arr1 = {};
                    arr1["totalIncome"] = data.data.sumShouRu;
                    arr1["totalOutcome"] = data.data.sumZhizhu;
                    model.paymentList(data.data.list);
                    model.countTotal.push(arr1);
                    //var arry = data.data.list;
                } else {
                    smGlobal.empty(".paymentList", "暂无数据");
                }
            } else {
                smGlobal.empty(".paymentList", data.bizErrorMsg);
            }
        },
        error: function (data) {
            $("#date i").removeClass("pointEvNone");
            smGlobal.complete(".loading1");
            console.log(data);
            //smGlobal.error(data);
        }
    });
    //ajaxrequest(arr.type, arr.url, arr.data, arr.datatype, arr.globaltype, arr.beforesend, arr.complete).done(function (data) {
    //    smglobal.complete(".loading1");
    //    $("#date i").removeclass("pointevnone");
    //    //console.log(data);
    //    //return;
    //    if (!data.errmsg) {
    //        if (data.list.length > 0) {
    //            smglobal.complete(".loading1");
    //            var arr1 = {};
    //            arr1["totalincome"] = data.sumshouru;
    //            arr1["totaloutcome"] = data.sumzhizhu;
    //            model.paymentlist(data.list);
    //            model.counttotal.push(arr1);
    //            var arry = data.data;
    //        } else {
    //            smglobal.empty(".paymentlist", "暂无数据");
    //        }
    //    } else {
    //        smglobal.empty(".paymentlist", data.errmsg);
    //    }
    //}).fail(function (data) {
    //    $("#date i").removeclass("pointevnone");
    //    smglobal.complete(".loading1");
    //    console.log(data);
    //    smglobal.error(data.responsetext);
    //});
}