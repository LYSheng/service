ajaxGet();
function ajaxGet() {
    apiRequest({
        method: "UserSpread/Get",
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
                console.log(obj)
                $("#friendsTotal").html(obj.data.friendsTotal);
                $("#rechargePassengers").html(obj.data.rechargePassengers);

                var _html = '';


                for (var i = 0; i < obj.data.userSpreads.length; i++) {
                    _html += '<dl class="parbox allist"><dd class="ablumHead">';
                    _html += '<img src="../Content/images/ablumAllies0' + (i + 1) + '.png" /></dd>';
                    _html += '<dt class="flex1 pl30 fs14">';
                    if (obj.data.userSpreads[i].total > 0) {
                        _html += '<a href="./alliesList?level=' + obj.data.userSpreads[i].investmentAmount + '&name=' + obj.data.userSpreads[i].liveName + '">';
                    } else {
                        _html += '<a href="javascript:void(0)">';
                    }

                    _html += '<ul class="alliesGrade"><li class="pb3">' + obj.data.userSpreads[i].liveName + '</li><li class="count">' + obj.data.userSpreads[i].total + '人</li></ul>'
                    _html += "</a></dt></dl>";
                }

                $("#alliesCon").html(_html);


            }
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });
}