
function chooseArea() {
    var option = {
        data: { PId: 1 },
        callFun: function (data) {
            Combiner(data, 'queryCity');
            $(".layermcont1").addClass("on");
        }
    }
    areaGain(option);
}
function areaGain(option) {
    apiRequest({
        method: 'Basic/AreaGets',
        async: false,
        data: option.data,
        success: function (obj) {
            if (obj.isBizSuccess) {
                option.callFun(obj.data);
            }

        },
        error: function (obj) {
            smGlobal.error(obj);
        }
    });
}
function queryCity(a) {
    var option = {
        data: { PId: $(a).data("areaid") },
        callFun: function (data) {
            $(".popback").click();
            Combiner(data, 'queryArea');
            $(".layermcont1").addClass("on");
            address.splice(0, address.length);
            address.push($(a).text());
            addressIds.splice(0, addressIds.length);
            addressIds.push($(a).data("areaid"));
        }
    }
    areaGain(option);
}
function queryArea(a) {
    var option = {
        data: { PId: $(a).data("areaid") },
        callFun: function (data) {
            $(".popback").click();
            Combiner(data, 'layerClose');
            $(".layermcont1").addClass("on");
            address.push($(a).text());
            addressIds.push($(a).data("areaid"));
        }
    }
    areaGain(option);
}
function layerClose(a) {
    address.push($(a).text());
    addressIds.push($(a).data("areaid"));
    var addHtml = '';
    $.each(address, function (i, v) {
        addHtml += v;
    })
    $(".popback").click();
    $("#area").html(addHtml).removeClass("areaHui");
    $("#area").attr({ "data-provinceid": addressIds[0], "data-cityid": addressIds[1], "data-areaid": addressIds[2] });
    try {
        if (zeroConfirmModel) {
            zeroConfirmModel.experienceEnter.Province(addressIds[0]);
            zeroConfirmModel.experienceEnter.City(addressIds[1]);
            zeroConfirmModel.experienceEnter.Area(addressIds[2]);
        }
    }
    catch (e)
    {
        console.log("呵呵")
    }
    
}
//字符串拼接
function Combiner(p, func) {
    if ($(".layermcont1").length <= 0) {
        var html = '<div class="layermcont1"><div class="outer"><dl>';
        var content = '';
        $(p).each(function () {
            content += '<dd class="ardllist ac" onclick="' + func + '(this)" data-areaId="' + this.areaId + '">' + this.areaName + '</dd>';
        });
        html += content;
        html += '</dl></div></div>';
        $(document.body).append(html);
        var $window_w = $(window).width();
        var $window_h = $(window).height();
        var $custom_w = $(".layermcont1").width();
        var $custom_h = $(".layermcont1").height();
        var $scroll_height = document.body.scrollTop;
        $(".layermcont1").css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
    } else {
        var content = '';
        $(p).each(function () {
            content += '<dd class="ardllist ac" onclick="' + func + '(this)" data-areaId="' + this.areaId + '">' + this.areaName + '</dd>';
        });
        $(".outer dl").html(content);
    }
    $(".popback").show();
}
//展现地区
$(".popback").click(function () {
    $(".layermcont1").removeClass("on");
    $(this).hide();
})