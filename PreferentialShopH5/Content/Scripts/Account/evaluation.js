//评价效果
$(".star i").on("click", function () {
    $(this).parent().find("i").removeClass("star-on");
    for (var i = 0; i <= $(this).index() ; i++) {
        $(this).parent().find("i").eq(i).addClass("star-on");
    }
    //if ($(this).parent().parent().hasClass('sp')) {

    //    var $content = '';
    //    if ($(this).parent().find(".star-on").size() == 5) {
    //        $content = '很好！';
    //    }
    //    $(this).parents('.sp_evaluation').find('.pj-textarea').val($content);
    //}
});

//提交ajax
$(".submit").on("click", function () {

    var $OrderId = $("#orderId").val();
    var $orderPackageId = $("#orderPackageId").val();
    var $realLevel = $(".rl").find(".star-on").size();
    var $ExpressEvalLevel = $(".wl").find(".star-on").size();
    var $ServiceEvalLevel = $(".fw").find(".star-on").size();
    //验证
    $realLevel = $realLevel == 0 ? 5 : $realLevel;
    $ExpressEvalLevel = $ExpressEvalLevel == 0 ? 5 : $ExpressEvalLevel;
    $ServiceEvalLevel = $ServiceEvalLevel == 0 ? 5 : $ServiceEvalLevel;
    //循环评价数据
    var $prodcutEvaluations = [];
    $(".sp_evaluation").each(function () {
        var praisePic = $(this).find(".praisePic").children("li");
        var picSrc = [];
        $.each(praisePic, function (i, v) {
            picSrc.push($(v).find("img").attr("src"));
        })
        $prodcutEvaluations.push(
            {
                "SkuId": $(this).find(".SkuId").val(),
                "ProductId": $(this).find(".ProductId").val(),
                "ProductEvalLevel": $(this).find(".star-on").size() == 0 ? 5 : $(this).find(".star-on").size(),
                "ProductEvalContent": $(this).find(".pj-textarea").val().length > 0 ? $(this).find(".pj-textarea").val() : "很好！",
                "EvalPics": picSrc
            }
        );
    })

    var orderinfo = {
        "OrderId": $OrderId,
        "OrderPackageId": $orderPackageId,
        "ProductDescriptConsistentLevel": $realLevel,
        "ExpressEvalLevel": $ExpressEvalLevel,
        "ExpressEvalContent": "",
        "ServiceEvalLevel": $ServiceEvalLevel,
        "ServiceEvalContent": "",
        "ProdcutEvaluations": $prodcutEvaluations
    };
    //console.log(orderinfo);
    //return;
    $(".submit").addClass("poiEventsNone");
    apiRequest({
        method: "Goods/UserEvaluation",
        async: true,
        data: orderinfo,
        success: function (obj) {
            smGlobal.error("评价成功！");
            //$(".submit").removeClass("submit_success");
            setTimeout(function () {
                setCookie("refreshFlag", true, "", "/", 30);
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.commentSuccess) {

                    window.webkit.messageHandlers.commentSuccess.postMessage($OrderId)
                    return;
                }
                //window.history.go(-1);
                self.location = document.referrer;
            }, 1000)

        },
        error: function (obj) {
            $(".submit").removeClass("poiEventsNone");
            smGlobal.heiAutoError(obj, 2500);
        }
    });
});

$(".praiseUpload").upload({
    beforeUpload: function () {
        if ($("div.loadingShowBlock[isglobleLoad]").size() <= 0) {
            smGlobal.loadingShowBlock();
            smGlobal.fixbg();
        }
    },
    errorPause: function () {
        if ($("div.loadingShowBlock[isglobleLoad]").size() > 0) {
            smGlobal.removeLoadingGif();
        }
    },
    width: 800,
    height: 800,
    callback: function (data) {
        //$(".myhdpic").attr("src", path + '?quality=l');
        if (data.isSuccess) {
            var index = $(".praiseUpload").index(data.curObj);
            if ($(".praisePic").eq(index).children("li").length < 3) {
                $(".praisePic").eq(index).append($("<li></li>").addClass("posrelative fl mr4").append("<img src='" + data.data + "' class='praise'/>").append("<i class='photo_cross'></i>"));
                if ($(".praisePic").eq(index).children("li").length >= 3) {
                    $(".spanIcon").eq(index).addClass('noUpload');
                    $(".spanIcon").eq(index).find("input.praisePicFile").hide();
                }
            } else {
                smGlobal.heiAutoError('最多只能上传三张图片', 2000);
            }
        } else {
            smGlobal.heiAutoError(data.errMsg, 2000);
        }
        setTimeout(function () { $('.praise').Touch(); }, 500)
    }
});

$(".praisePic").on("click", '.photo_cross', function () {
    var index = $(".praisePic").index(this.parentElement.parentElement);
    var parObj = $(this).parent("li");
    parObj.remove();
    if ($(".praisePic").eq(index).children("li").length > 1) {
        $(".spanIcon").eq(index).removeClass("noUpload");
        $(".spanIcon").eq(index).find("input.praisePicFile").show();
    }
})
