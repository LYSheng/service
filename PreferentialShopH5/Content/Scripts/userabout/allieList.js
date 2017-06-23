
var sessinStorge = window.sessionStorage;
var _userName = '';
var _investmentAmount = smGlobal.getQueryString("level");
var _name = smGlobal.getQueryString("name");
var _pageSize = 10, _pageNo = 1;
$("title").html(_name);
$("#searchTxt").attr('placeholder', '搜索您的' + _name);
$(function () {
    var allieList = function () {
        var self = this;
        self.getLists = ko.observableArray([]);
        // self.buyUserName = ko.observable('');

    }

    var page = {
        init: function () {
            el = new allieList();
            ko.applyBindings(el);
            //获取数据
            page.getList();

            //分页
            $(window).scroll(page.scrollFun);
            //点击展示详情
            $(".showDetail").off().on("click", page.showDetail);
            // 搜索框相关事件
            $("#searchTxt").on("focus", page.searchFocus);
            $("#searchTxt").on("input", page.searchInput);
            $("#searchRemove").on("click", page.searchRemove);
            $("#searchBtn").on("click", page.searchClick);
        },
        searchClick: function () {
            if ($(this).hasClass("search")) {
                _userName = $.trim($("#searchTxt").val());
                $("#proList").hide();
                el.getLists([]);
                _pageNo = 1;
                page.getList();
            }
        },
        searchRemove: function () {
            $(this).hide();
            $("#searchBtn").removeClass("search").html("取消");
            $("#searchTxt").val("").focus();
        },
        searchInput: function () {
            var _this = $(this);
            var txt = $.trim(_this.val());
            if (!txt) {
                _this.val("");
                $("#searchRemove").hide();
                $("#searchBtn").removeClass("search").html("取消");
            } else {
                $("#searchBtn").addClass("search").html("确定");
                $("#searchRemove").show();
            }
        },
        searchFocus: function () {
            var txt = $.trim($(this).val());
            $(".searchHeader").removeClass("none");
        },
        getList: function () {
            if ($(".loading3").length <= 0) {
                smGlobal.loadingFixed();
                $(".loadingFixed").show();
            }
            console.log(_userName)
            apiRequest({
                method: "UserSpread/GetList",
                async: true,
                data: {
                    userName: _userName,
                    investmentAmount: _investmentAmount,
                    PageSize: _pageSize,
                    PageNo: _pageNo
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    console.log(obj);

                    if (obj.isBizSuccess) {
                        if (obj.data && obj.data.length == 0) {
                            setCookie("pageIntFlag", true, "", "/", 30);
                            if (_pageNo == 1) {
                                $("#proList").show();
                                smGlobal.nullInfo2($("#proList"), "wdgwc", "暂无相关好友");
                            } else {
                                //smGlobal.error("没有更多的数据");
                            }
                            return;
                        }
                        //console.log(obj);
                        var datas = obj.data;
                        //alert(obj.data.length);
                        $.each(obj.data, function (i, v) {
                            el.getLists.push(v);
                        })
                        if (obj.data.length < _pageSize) {
                            if (_pageNo != 1) {
                                //smGlobal.error("没有更多的数据");
                            }
                            setCookie("pageIntFlag", true, "", "/", 30);
                        } else {
                            setCookie("pageIntFlag", false, "", "/", 30);
                        }
                    }
                    $(".showDetail").off().on("click", page.showDetail);
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        scrollFun: function () {
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
        showDetail: function () {
            var _num = $(this).data("num");
            var _off = $(this).nextAll(".fDetail");
            if (_num > 0) {
                if (_off.hasClass("usnone")) {
                    _off.removeClass("usnone");
                    $(this).find(".span-arrow").removeClass("off");
                } else {
                    _off.addClass("usnone");
                    $(this).find(".span-arrow").addClass("off");
                }
            } else {
                return false;
            }
        }
    }
    page.init();
})