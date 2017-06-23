
var sessinStorge = window.sessionStorage;
var beginTime = '',endTime='';
var _investmentInfoId = smGlobal.getQueryString("investmentInfoId");
var _isYetDividends = smGlobal.getQueryString("isYetDividends");
var _earningsType = smGlobal.getQueryString("EarningsType");

var _pageSize = 5,_pageNo = 1;

$(function () {
	var earningList = function () {
	    var self = this;
	    self.getLists = ko.observableArray([]);
	    // self.buyUserName = ko.observable('');
	}

    var page = {
        init: function () {
        	el = new earningList();
        	ko.applyBindings(el);
        	//获取数据
        	page.getList();
        	//筛选按钮点击
        	$(".head_tit_right").on("click",page.filtrateShow);
        	//筛选确定按钮
			$("#btnSuccess").on("click",page.successClick);	
        	//筛选重置按钮
        	$("#btnReset").on("click",page.resetClick);
        	//筛选点击其他空白区域
        	$("#mask").on("click",page.removePop);
        	//分页
        	$(window).scroll(page.scrollFun);
        },
        getList:function(){
        	if ($(".loading3").length <= 0) {
		        smGlobal.loadingFixed();
		        $(".loadingFixed").show();
        	}
		    apiRequest({
		        method: "MyWallet/FGetEarningsDetailsGetList",
		        async: true,
		        data: {
		        	investmentInfoId:_investmentInfoId,
		        	isYetDividends: _isYetDividends,
		        	earningsType:_earningsType,
		        	startTime:beginTime,
		        	endTime:endTime,
		        	PageSize:_pageSize,
					PageNo:_pageNo
		        },
		        success: function (obj) {
		            smGlobal.removeHomeGif();
		            $("#proList").show();
		            if (obj.isBizSuccess) {
		                if (obj.data && obj.data.length == 0) {
		                    setCookie("pageIntFlag", true, "", "/", 30);
		                    if (_pageNo == 1) {
		                        smGlobal.nullInfo2($("#proList"), "wdgwc", "暂无经营回馈记录");
		                        $("#showData").show();
		                    } else {
		                        //smGlobal.error("没有更多的数据");
		                    }
		                    return;
		                }
		                var datas = obj.data;
		                $("#proList").hide();
		                for (var i = 0; i < obj.data.length; i++) {

		                    //if (obj.data[i].dividendsTypeName == "充值全国佣金") {
		                    //    obj.data[i].type = 1;
		                    //} else if (obj.data[i].dividendsTypeName == "充值门店佣金") {
		                    //    obj.data[i].type = 2;
		                    //} else if (obj.data[i].dividendsTypeName == "门店佣金" || obj.data[i].dividendsTypeName == "门店员工提成" || obj.data[i].dividendsTypeName == "门店房租" || obj.data[i].dividendsTypeName == "门店运营工资") {
		                    //    obj.data[i].type = 3;
		                    //} else if (obj.data[i].dividendsTypeName == "运营商佣金") {
		                    //    obj.data[i].type = 4;
		                    //} else if (obj.data[i].dividendsTypeName == "入口佣金") {
		                    //    obj.data[i].type = 5;
		                    //} else if (obj.data[i].dividendsTypeName == "店主佣金") {
		                    //    obj.data[i].type = 6;
		                    //} else if (obj.data[i].dividendsTypeName == "年化结算缺额") {
		                    //    obj.data[i].type = 7;
		                    //} else if (obj.data[i].dividendsTypeName == "到期结算缺额") {
		                    //    obj.data[i].type = 8;
		                    //} else if (obj.data[i].dividendsTypeName == "店主推荐人佣金") {
		                    //    obj.data[i].type = 9;
		                    //}

		                    if (obj.data[i].dividendsType == 610) {
		                        obj.data[i].type = 1;
		                    } else if (obj.data[i].dividendsType == 620) {
		                        obj.data[i].type = 2;
		                    } else if (obj.data[i].dividendsType == 525 || obj.data[i].dividendsType == 522 || obj.data[i].dividendsType == 520 || obj.data[i].dividendsType == 570) {
		                        obj.data[i].type = 3;
		                    } else if (obj.data[i].dividendsType == 510) {
		                        obj.data[i].type = 4;
		                    } else if (obj.data[i].dividendsType == 550) {
		                        obj.data[i].type = 5;
		                    } else if (obj.data[i].dividendsType == 560) {
		                        obj.data[i].type = 6;
		                    } else if (obj.data[i].dividendsType == 565) {
		                        obj.data[i].type = 7;
		                    } else if (obj.data[i].dividendsType == 568) {
		                        obj.data[i].type = 8;
		                    }

		                    if (obj.data[i].type == 6 || obj.data[i].type == 7 || obj.data[i].type == 8) {
		                        obj.data[i].num = 0
		                        if (obj.data[i].isReissued == true) {
                                    obj.data[i].num = 1
		                        } else if (obj.data[i].isReissued == false) {
		                            obj.data[i].num = 2
		                        }
		                    }
		                    console.log(obj.data)
		                    el.getLists.push(obj.data[i]);
                            
		                }
		                //$.each(obj.data, function (i, v) {
                            
		                //	el.getLists.push(v);
		                //})
		                if (obj.data.length < _pageSize) {
		                    if (_pageNo != 1) {
		                        //smGlobal.error("没有更多的数据");
		                    }
		                    setCookie("pageIntFlag", true, "", "/", 30);
		                } else {
		                    setCookie("pageIntFlag", false, "", "/", 30);
		                }
		                $("#showData").show();
		            }
		            
		        },
		        error: function (obj) {
		            smGlobal.removeHomeGif();
		            smGlobal.error(obj);
		        }
		    });
        },
        scrollFun:function(){
        	//当内容滚动到底部时加载新的内容 100当距离最底部100个像素时开始加载.  
		    if ($(this).scrollTop() + $(window).height() >= $(document).height() && $(this).scrollTop() > 100) {
		        // ajax方法
		        var pageIntFlag = getCookie("pageIntFlag");
		        if (pageIntFlag != "true") {
		            setCookie("pageIntFlag", true, "", "/", 30);
		            _pageNo++;
		            page.getList();
		        }

		    }
        },
        removePop:function(){
        	$('.stayout_filtrate').fadeOut();
        	$('#mask').fadeOut();
        },
        successClick:function(){
        	beginTime = $("#beginTime").val();
        	endTime = $("#endTime").val();
        	_pageNo = 1;
        	console.log(endTime)
        	el.getLists([]);
        	page.getList();
        	page.removePop();
        },
        resetClick:function(){
        	$("#beginTime").val("");
        	$("#endTime").val("");
        	beginTime = "";
        	endTime = "";
        	_pageNo = 1;
        	el.getLists([]);
        	page.getList();
        	page.removePop();
        },
        filtrateShow:function(){
        	$('.stayout_filtrate').fadeIn();
	        $('#mask').fadeIn();
        }
    }
    page.init();
})