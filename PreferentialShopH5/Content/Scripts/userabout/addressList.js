$(function () {
    var storeMemberModel = function () {
        var self = this;
        self.smList = ko.observableArray([]);   // 会员信息
    }
    var page = {
        init: function () {
            smModel = new storeMemberModel();
            ko.applyBindings(smModel);
            //page.initAjax();
            $("").
        },
        hideList: function () {
            var _list = $(this).closest(".member-list");
            var _no = _list.data("no"), _size = _list.data("size"), _count = _list.data("count");
            if (_count <= 0) {
                return false;
            }
            if (_list.hasClass("hide")) {
                _list.removeClass("hide");
                if (_no == 1) {
                    page.nextApi(_list);
                }
            } else {
                _list.addClass("hide");
            }
        },
        initAjax: function () {
            apiRequest({
                method: "MyWallet/GetNewMembershipStatistics",
                async: true,
                data: {
                    StoreUserId: _storeId,
                    Year: _year,
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    console.log(obj);
                    if (obj.isBizSuccess) {
                        if (obj.data && obj.data.length > 0) {
                            for (var i = 0; i < obj.data.length; i++) {
                                obj.data[i].year = _year;
                                smModel.smList.push(obj.data[i]);
                            }
                            $(".member-title").on("click", page.hideList);
                            setTimeout(function () {
                                if (_year == (new Date).getFullYear()) {
                                    var _this = $(".storeMember .member-list").eq(0);
                                    page.nextApi(_this);
                                }
                                page.scrollfix();
                            }, 200)
                        } else {
                            smGlobal.nullInfo($("#proList"), "暂无数据");
                        }

                    }


                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });

        },
        nextApi: function (_this) {
            var _month = _this.data("month"), _no = _this.data("no"), _size = _this.data("size"), _count = _this.data("count");

            if (_count <= 0) {
                return false;
            }
            apiRequest({
                method: "MyWallet/GetNewMemberShipList",
                async: true,
                data: {
                    StoreUserId: _storeId,
                    Year: _year,
                    Month: _month,
                    PageNo: _no,
                    PageSize: _size
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    console.log(obj);
                    if (obj.isBizSuccess) {
                        var _html = '';
                        for (var i = 0; i < obj.data.length; i++) {
                            _html += '<li class="member-detail parbox">';
                            _html += '<p class="flex1">' + obj.data[i].payEndTime.substr(0, 4) + '/' + obj.data[i].payEndTime.substr(5, 2) + '/' + obj.data[i].payEndTime.substr(8, 2) + '</p>';
                            _html += '<p class="flex1">' + obj.data[i].userName + '</p><p class="flex1">' + obj.data[i].investmentAmount + '</p></li>';
                        }
                        _this.find("ul").append(_html);
                        if (obj.data.length < _size) {
                            $(_this).find(".member-more").removeClass("hide");
                        } else {
                            $(_this).find(".member-more").addClass("hide");
                        }
                        if (obj.isOverPag) {
                            _year = _year - 1;
                            $("#year").html(_year);
                            $(".members-btn").addClass("hide");
                            $(".members-btn a").off().on("click", page.initAjax);
                        } else {
                            $(".members-btn").removeClass("hide");
                        }

                        _this.removeClass("hide").data("no", _no * 1 + 1);
                        $(".member-title").off().on("click", page.hideList);
                        $(".member-more").off().on("click", page.moreData);
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        moreData: function () {
            var _list = $(this).closest(".member-list");
            page.nextApi(_list);
        },
        scrollfix: function () {
            var summaries = $(".member-title");
            summaries.each(function (i) {
                var summary = $(summaries[i]);
                var next = summaries[i + 1];
                summary.scrollFix({
                    distanceTop: 0,
                    endPos: next,
                    zIndex: 998
                });

            });
        }
    }
    page.init();
})