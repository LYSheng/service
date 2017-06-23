var current_obj;
$(function () {
    inner_html();
})

function autoLogin(obj) {
    var openid = getCookie("OpenId") ? getCookie("OpenId") : "";
    apiRequest({
        method: 'User/Login3_1',
        async: false,
        data: { "OpenId": openid, "LoginSystem": 3 },
        success: function (list) {
            if (list.isBizSuccess && list.isSkip) {
                addCart(obj);
            } else if (list.count > 1) {
                window.location.href = "/account/login?isLogin=1";
                return;
            }
        },
        error: function (data) {
            window.location.href = "/account/login?isLogin=1";
            return;
        }
    });
}

$("#shop").on("click", ".goods_cart", function () {

    if (!getCookie(".ASPXAUTHH5")) {
        autoLogin(this);
        return;
    }
   
    addCart(this);
 
    
});

function addCart(obj) {
    var promotionid = $(obj).attr("data-promotionid");
    var proid = $(obj).attr("data-proid");
    current_obj = $(obj);
    //console.log(proid);
    //return;
    apiRequest({
        method: 'Activity/GetActivityProductDetails',
        async: false,
        data: { "ActivityId": promotionid },
        beforeSend: function () {
            $(".loading3").show();
        },
        success: function (list) {
            $(".loading3").hide();
            $(".fixedbg").hide();
            if (list.isBizSuccess) {
                if (list.data.promotionSkuInfos.length == 0) {
                    return;
                }
                var PromotionSkuList = [];
                $.each(list.data.promotionSkuInfos, function (i, v) {
                    var promotionObj = {};
                    promotionObj["SkuId"] = v.skuId;
                    promotionObj["PromotionId"] = promotionid;
                    PromotionSkuList.push(promotionObj);
                })
                var promObj = {};
                promObj["PromotionSkuList"] = PromotionSkuList;
                var combinedata = {
                    dataArray: promObj,
                    callBackFun: function (comObj) {
                        if (list.data.promotionSkuInfos.length == 1) {//只有一种sku
                            var obj = list.data.promotionSkuInfos[0];
                            add_shopping(promotionid, proid, obj.skuId, obj.limitedPurchasingQuantity, obj.inventoryAmount, list.data.saleAmount, obj.cartNum, comObj[0].combinedSalesCount, "default", obj.boughtNum);
                        } else {
                            $.each(comObj, function (i, v) {
                                list.data.promotionSkuInfos[i]["combinedSalesCount"] = v.combinedSalesCount;
                            })
                            //console.log(JSON.stringify(comObj));
                            //console.log(JSON.stringify(list.data));
                            //return;

                            show_pop(list.data);
                        }
                    }
                }
                combinedSales(combinedata);
            }
        },
        error: function (data) {
            $(".loading3").hide();
            $(".fixedbg").hide();
            smGlobal.error("添加购物车失败");
        }
    });
}

function combinedSales(argument) {

    apiRequest({
        method: 'PromotionDetail/GetPromotionDetailListBySku',
        async: false,
        data: argument.dataArray,
        success: function (list) {
            if (list.isBizSuccess) {
                argument.callBackFun.call(this, list.data);
            }
        },
        error: function (data) {
            error("添加购物车失败");
        }
    });
}
function add_shopping(promotionid, proid, skuid, limitBuyCount, proAmount, saleAmount, shoppingcartAmount, combinedSalesCount, isDefault, boughtNum) {//proAmount可销库存，limitBuyCount限购数量，saleAmount起售数量,shoppingcartAmount购物车中该商品数量,boughtNum已购买数量
    //console.log(combinedSalesCount);
    //return;
    var combinedSalesCount = combinedSalesCount ? combinedSalesCount : 1;
    if (isDefault == "default") {
        var buy_num = 1;
        var buy_count = 1;//加入到购物车的数量
        if (saleAmount * 1 < combinedSalesCount * 1) {
            saleAmount = combinedSalesCount;
        }
        if ((shoppingcartAmount * 1) % (combinedSalesCount * 1) != 0) {
            combinedSalesCount = combinedSalesCount - (shoppingcartAmount % combinedSalesCount) * 1;
        }
        if (shoppingcartAmount == 0) {
            if (combinedSalesCount < saleAmount) {
                buy_num = Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount;
                buy_count = Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount;
            }else  if (combinedSalesCount > limitBuyCount) {
                buy_num = parseInt(combinedSalesCount / limitBuyCount) * limitBuyCount;
                buy_count = Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount;
            }else if (saleAmount <= combinedSalesCount && combinedSalesCount <= limitBuyCount) {
                buy_num = Math.ceil(combinedSalesCount / saleAmount) * saleAmount;
                buy_count = Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount;
            }
        } else {
            buy_num = shoppingcartAmount * 1 + combinedSalesCount * 1;
            buy_count = combinedSalesCount * 1;
            
        }
    } else {
        var buy_num = parseInt(isDefault) + shoppingcartAmount * 1;
        var buy_count = parseInt(isDefault);
    }
    if (buy_num > (limitBuyCount*1 - boughtNum * 1) && limitBuyCount != 0) {
        $(".goods_pop .queding").text("确定").removeClass("poiEventsNone");
        var bountWord = '', shippingcartWord = '';
        if (boughtNum * 1 != 0) {
            bountWord = '当前已经购买了' + boughtNum + '件该商品，';
        }
        if (shoppingcartAmount * 1 != 0) {
            shippingcartWord = '购物车已存在' + shoppingcartAmount + "件该商品,";
        }
        smGlobal.heiAutoError("您" + bountWord + shippingcartWord + "当前加入购物车的数量" + buy_count + "件，已经超出该商品的限购数" + limitBuyCount, 4000);
        return;
    }
    if (buy_num > proAmount * 1) {
        smGlobal.error("购买数量不能超过该商品可销库存");
        $(".goods_pop .queding").text("确定").removeClass("poiEventsNone");
        return;
    }
    apiRequest({
        method: 'Activity/AddPromotionSkuToCart',
        async: false,
        data: {
            BuyerUserId: $("#user_id").val(),
            ProdcutId: proid,
            ActivityId: promotionid,
            SkuId: skuid,
            SkuAmount: buy_count,
            source: 1
        },
        success: function (list) {
            if (list.isBizSuccess) {
                smGlobal.error("添加购物车成功");
                $(".count_total").text(list.data);
                //if (version && parseFloat(version) >= 4) {
                //    device_2(list.data);
                //}
            } else {
                smGlobal.error("添加购物车失败");
            }
            $(".goods_pop .queding").text("确定").removeClass("poiEventsNone");
        },
        error: function (data) {
            smGlobal.error("添加购物车失败");
            $(".goods_pop .queding").text("确定").removeClass("poiEventsNone");
        }
    });
    $(".goods_pop").hide();
    $(".pop_mask").hide();
}
function show_pop(stdclass) {
    var obj = $(current_obj).parents(".categBox").find(".imgbox img");
    var name_obj = $(current_obj).parents(".desCategBox").find(".word-descriton a").text();
    load_data_callback(stdclass, obj, name_obj);
}
var load_data_callback = function (data, img_obj, name_obj) {
    var image_src = $(img_obj).attr("src");
    $(".goods_tu img").attr("src", image_src);
    var promotionSkuInfos = data.promotionSkuInfos;
    //var product_name=$(current_obj).parents(".new_load").find(".word-descriton a").text();
    var product_name = name_obj;
    var inventoryAmount = promotionSkuInfos[0].inventoryAmount;
    var saleAmount = data.saleAmount == 0 ? 1 : data.saleAmount;
    var combinedSalesCount = promotionSkuInfos[0].combinedSalesCount;
    var limitBuyCount = promotionSkuInfos[0].limitedPurchasingQuantity;
    var couNum = combinedSalesCount;
    $(".kc_count i").text(inventoryAmount);//库存数量
    $(".qs_count i").text(saleAmount);//起售数量
    $(".xg_count i").text(limitBuyCount);//限购数量
    $(".comb_count i").text(combinedSalesCount);//组合销售数量
    $(".g_sku i").text(product_name);//产品名称
    $(".g_danjia span").text(promotionSkuInfos[0].skuPrice);//产品价格
    var shoppingcartAmount = promotionSkuInfos[0].cartNum;
    if (saleAmount > combinedSalesCount + shoppingcartAmount * 1) {
        couNum = Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount;
    }
    $("#count_num").val(couNum);
    //if (shoppingcartAmount == 0) {
    //    $("#count_num").val(couNum);
    //} else {
    //    if (shoppingcartAmount != combinedSalesCount) {
    //        couNum = (Math.ceil(shoppingcartAmount / couNum)) * couNum - shoppingcartAmount;
    //    } else {
    //        couNum = (Math.ceil(shoppingcartAmount / couNum)) * couNum;
    //    }
    //    $("#count_num").val(couNum);
    //}
    //加载规格
    var html_str = '';

    for (var i = 0 ; i < promotionSkuInfos.length ; i++) {
        //if(data[i].proAmount != 0) {
        if (i == 0) {
            if (inventoryAmount == 0) {
                var amDesc = $('<div class="amDesc"></div>').html("该规格可销库存不足，请选择其它规格。");
                if (!$(".amDesc").length || $(".amDesc").length == 0) {
                    $(".queding").before(amDesc);
                }
                $(".queding").addClass("poiEventsNone");
            }
            html_str += '<li class="cur" data-boughtnum="' + promotionSkuInfos[i].boughtNum + '" data-shoppingcartamount="' + promotionSkuInfos[i].cartNum + '" data-combinedSalesCount="' + promotionSkuInfos[i].combinedSalesCount + '" data-limitbuycount="' + promotionSkuInfos[i].limitedPurchasingQuantity + '" data-proamount="' + promotionSkuInfos[i].inventoryAmount + '" data-saleamount="' + saleAmount + '" data-shoppingcartAmount="' + promotionSkuInfos[i].cartNum + '" data-skuId="' + promotionSkuInfos[i].skuId + '" data-specs="' + promotionSkuInfos[i].skuSpecs + '" data-salesprice="' + promotionSkuInfos[i].skuPrice + '">' + promotionSkuInfos[i].skuSpecs + '</li>';
            $(".g_sku span").text(promotionSkuInfos[i].skuSpecs);
        } else {
            html_str += '<li data-boughtnum="' + promotionSkuInfos[i].boughtNum + '" data-shoppingcartamount="' + promotionSkuInfos[i].cartNum + '" data-combinedSalesCount="' + promotionSkuInfos[i].combinedSalesCount + '" data-limitbuycount="' + promotionSkuInfos[i].limitedPurchasingQuantity + '" data-proamount="' + promotionSkuInfos[i].inventoryAmount + '" data-saleamount="' + saleAmount + '" data-shoppingcartAmount="' + promotionSkuInfos[i].cartNum + '" data-skuId="' + promotionSkuInfos[i].skuId + '" data-specs="' + promotionSkuInfos[i].skuSpecs + '" data-salesprice="' + promotionSkuInfos[i].skuPrice + '">' + promotionSkuInfos[i].skuSpecs + '</li>';
        }
        //}
    }
    $(".choose_ul").html(html_str);
    bind_dom();
    bind_pop();
    $(".goods_pop").show();
    $(".pop_mask").show();
    $(document.body).css("overflow", "hidden");
    var winHeight = $(window).height();
    if (winHeight < $(".goods_pop").height()) {
        $(".goods_pop").css({ "max-height": winHeight, "overflow-y": "auto" });
    } else {
        $(".goods_pop").css({ "overflow-y": "visible" });
    }
};
var bind_dom = function () {
    //遮罩层点击事件
    $(".pop_mask").add(".pop_close").bind("click", function () {
        $(".pop_mask").hide();
        $(".goods_pop").hide();
        $(document.body).css("overflow", "auto");
    });

};
var bind_pop = function () {
    $(".choose_ul li").bind("click", function () {
        $(".choose_ul li").removeClass("cur");
        $(this).addClass("cur");
        change_sku($(this));
    });
    $("#addnum").unbind("click").bind("click", function () {
        var kc_num = parseInt($(".kc_count i").text());//库存数量
        var qs_num = parseInt($(".qs_count i").text());//起售数量
        var xg_num = parseInt($(".xg_count i").text());//限购数量
        var comb_num = parseInt($(".comb_count i").text());//组合销售数
        var old_num = parseInt($("#count_num").val());//当前购买数量
        var saleWord = qs_num <= 1 ? '' : "起售量为" + qs_num;
        var limitword = xg_num == 0 ? '' : "限购量为" + xg_num;
        if (old_num + comb_num > xg_num && xg_num != 0) {
            //error("限购数量为" + xg_num + "个");
            if (comb_num > 1) {
                smGlobal.heiAutoError("该商品为组合销售，购买量必须是" + comb_num + "的倍数" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            } else {
                smGlobal.heiAutoError("该商品" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            }

            return;
        }
        $("#count_num").val(old_num + comb_num);
    });
    $("#minnum").unbind("click").bind("click", function () {
        var qs_num = parseInt($(".qs_count i").text());//起售数量
        var xg_num = parseInt($(".xg_count i").text());//限购数量
        var comb_num = parseInt($(".comb_count i").text());//组合销售数
        var old_num = parseInt($("#count_num").val());
        var saleWord = qs_num <= 1 ? '' : "起售量为" + qs_num;
        var limitword = xg_num == 0 ? '' : "限购量为" + xg_num;
        var coum = old_num * 1 - comb_num * 1;
        var shoppingcartamount = $(".choose_ul .cur").attr("data-shoppingcartamount");
        if (old_num - comb_num < qs_num) {
            if (comb_num > 1) {
                smGlobal.heiAutoError("该商品为组合销售，购买量必须是" + comb_num + "的倍数" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            } else {
                smGlobal.heiAutoError("该商品" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            }
            return;
        }
        $("#count_num").val(old_num - comb_num);
    });
    $("#count_num").off("blur").on("blur", function () {
        $(this).val(this.value.replace(/\D/g, ''));
        var kc_num = parseInt($(".kc_count i").text());//库存数量
        var least = parseInt($(".qs_count i").text());//起售数量
        var limit = parseInt($(".xg_count i").text());//限购数量
        var limitword = limit == 0 ? '' : "限购量为" + limit;
        var saleWord = least <= 1 ? '' : "起售量为" + least;
        var combinedSalesCount = parseInt($(".comb_count i").text());//组合销售数
        var curAoumt = parseInt($("#count_num").val()) ? parseInt($("#count_num").val()) : 0;
        var shoppingcartamount = parseInt($(".choose_ul .cur").attr("data-shoppingcartamount"));
        var couNum = combinedSalesCount;
        var coum = combinedSalesCount;
        var num = 1;
        if (least <= curAoumt && ((curAoumt <= limit && limit != 0) || (limit == 0))) {
            if (curAoumt % combinedSalesCount != 0) {
                if (curAoumt > combinedSalesCount) {
                    num = Math.ceil(curAoumt / combinedSalesCount) * combinedSalesCount;
                    if (num > limit && limit != 0) {
                        num = parseInt(curAoumt / combinedSalesCount) * combinedSalesCount;
                    }
                } else {
                    num = combinedSalesCount;
                    //if(curAoumt)
                }

                $(this).val(num);
                if (combinedSalesCount > 1) {
                    smGlobal.heiAutoError("该商品为组合销售，购买量必须是" + combinedSalesCount + "的倍数" + saleWord + limitword + "系统已调整为接近的购买数量", 3000);
                } else {
                    smGlobal.heiAutoError("该商品" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
                }
                return;
            } else {
                $(this).parent().next().html();
            }

        }
        if (curAoumt < least) {
            if (combinedSalesCount < least) {
                num = Math.ceil(least / combinedSalesCount) * combinedSalesCount;
            } else {
                num = combinedSalesCount;
            }
            $(this).val(num);
            if (combinedSalesCount > 1) {
                smGlobal.heiAutoError("该商品为组合销售，购买量必须是" + combinedSalesCount + "的倍数" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            } else {
                smGlobal.heiAutoError("该商品" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            }
            return;
        }
        if (curAoumt > limit && limit != 0) {
            if (combinedSalesCount < limit) {
                num = Math.ceil(limit / combinedSalesCount) * combinedSalesCount;
                if (num > limit && limit != 0) {
                    num = parseInt(limit / combinedSalesCount) * combinedSalesCount;
                }
            } else {
                num = combinedSalesCount;
            }
            $(this).val(num);
            if (combinedSalesCount > 1) {
                smGlobal.heiAutoError("该商品为组合销售，购买量必须是" + combinedSalesCount + "的倍数" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            } else {
                smGlobal.heiAutoError("该商品" + saleWord + limitword + "系统已帮您改为合适的购买数量", 3000);
            }
            return;
        }
    });
    //确定按钮
    $(".goods_pop .queding").unbind("click").bind("click", function () {
        $(this).text("加载中").addClass("poiEventsNone");
        var target_obj = $(".choose_ul .cur");
        var kc_num = $(".kc_count i").text();//库存数量
        var xg_num = $(".xg_count i").text();//限购数量
        var qs_num = $(".qs_count i").text();//起售数量
        var shoppingcartamount = $(target_obj).attr("data-shoppingcartamount");
        var boughtnum = $(target_obj).attr("data-boughtnum");
        var count_num = $("#count_num").val();
        if ((shoppingcartamount * 1 + count_num * 1) > xg_num * 1 && xg_num != 0) {
            $(this).text("确定").removeClass("poiEventsNone");
            var bountWord = '', shippingcartWord = '';
            if (boughtnum * 1 != 0) {
                bountWord = '当前已经购买了' + boughtnum + '件该商品，';
            }
            if (shoppingcartamount * 1 != 0) {
                shippingcartWord = '购物车已存在' + shoppingcartamount + "件该商品,";
            }
            smGlobal.heiAutoError("您" + bountWord + shippingcartWord + "当前加入购物车的数量" + count_num + "件，已经超出该商品的限购数" + xg_num, 4000);
            return;
        }
        if ((shoppingcartamount * 1 + count_num * 1) > kc_num * 1) {
            $(this).text("确定").removeClass("poiEventsNone");
            smGlobal.error("购买数量不能超过可销库存");
            return;
        }
        var buyCount = $("#count_num").val();
        var combinedCount = $(current_obj).attr("data-combinedsalescount");
        var data = {
            ProdcutId: $(current_obj).attr("data-proid"),
            ActivityId: $(current_obj).attr("data-promotionid"),
            SkuId: $(target_obj).attr("data-skuid"),
            SkuAmount: $("#count_num").val(),
            source: "C"
        }
        //ajax_data(options);
        add_shopping(data.ActivityId, data.ProdcutId, data.SkuId, xg_num, kc_num, qs_num, shoppingcartamount, combinedCount, buyCount, boughtnum);
        $(document.body).css("overflow", "auto");
    });
}
var inner_html = function () {
    var html_pop = '<div class="pop_mask"></div><section class="goods_pop"></section>';
    $("body").append(html_pop);
    var html_str1 = '<div class="pop_top clearfix posrelative">'
                    + '<span class="goods_tu fl">'
                        + '<img src="">'
                    + '</span>'
                    + '<div class="goods_detail">'
                        + '<p class="g_sku"><i class="tit mb2">--</i><span class="des">330ml*24箱</span></p>'
                        + '<p class="g_danjia">￥<span>--</span></p>'
                    + '</div>'
                    + '<span class="pop_close posabsolute"></span>'
                + '</div>';
    $(".goods_pop").append(html_str1);

    var html_str2 = '<div class="all_count clearfix">'
                    + '<span class="kc_count">库存数量：<i>--</i></span>'
                    + '<span class="qs_count">起售数量：<i>--</i></span>'
                    + '<span class="xg_count">限购数量：<i>--</i></span>'
                    + '<span class="comb_count">组合销售数：<i>--</i></span>'
                + '</div>'
                + '<div class="choose_sku">'
                    + '<p>规格选择</p>'
                    + '<ul class="choose_ul">'
                    + '</ul>'
                + '</div>';
    $(".goods_pop").append(html_str2);
    var html_str3 = '<div class="buy_count clearfix">'
                    + '<span class="fl buy_word">购买数量：</span>'
                    + '<div class="calculate fr">'
                        + '<span id="minnum" class="minnum fl"></span>'
                        + '<input id="count_num" type="text" class="count_num fl" data-price="10.5" data-least="3" data-limit="8" data-canpurchase="10" value="1">'
                        + '<span id="addnum" class="addnum fl"></span>'
                    + '</div>'
                + '</div>'
                + '<span class="queding">确定</span>';
    $(".goods_pop").append(html_str3);

};
var change_sku = function (obj) {
    var proAmount = $(obj).attr("data-proamount");
    var saleAmount = $(obj).attr("data-saleamount");
    var limitBuyCount = $(obj).attr("data-limitbuycount");
    var salesprice = $(obj).attr("data-salesprice");
    var combinedSalesCount = $(obj).attr("data-combinedsalescount");
    var shoppingcartamount = $(obj).attr("data-shoppingcartamount");
    var couNum = combinedSalesCount;
    $(".kc_count i").text(proAmount);
    $(".qs_count i").text(saleAmount);
    $(".xg_count i").text(limitBuyCount);
    $(".comb_count i").text(combinedSalesCount);
    $(".g_danjia span").text(salesprice);
    $(".g_sku span").text($(obj).text());
    if (saleAmount > (combinedSalesCount + shoppingcartamount * 1)) {
        couNum = parseInt(Math.ceil(saleAmount / combinedSalesCount) * combinedSalesCount - shoppingcartamount);
        couNum = couNum == 0 ? combinedSalesCount : couNum;
    }
    var amDesc = $('<div class="amDesc"></div>').html("该规格可销库存不足，请选择其它规格。");
    var shDesc = $('<div class="amDesc"></div>').html("您的购物车已经是最大购买量");
    if (couNum <= 0) {
        if (!$(".amDesc").length || $(".amDesc").length == 0) {
            $(".queding").before(shDesc);
        }
        $(".queding").addClass("poiEventsNone");
        couNum = combinedSalesCount;
    } else {
        if ($(".amDesc").length != 0) {
            $(".amDesc").remove();
        }
        $(".queding").removeClass("poiEventsNone");
    }
    if (proAmount == 0) {
        if (!$(".amDesc").length || $(".amDesc").length == 0) {
            $(".queding").before(amDesc);
        }
        $(".queding").addClass("poiEventsNone");
    } else {
        if (couNum > 0) {
            if ($(".amDesc").length != 0) {
                $(".amDesc").remove();
            }
            $(".queding").removeClass("poiEventsNone");
        }
    }
    if (shoppingcartamount == 0) {
        $("#count_num").val(couNum);
    } else {
        //couNum = (parseInt(shoppingcartamount / couNum) + 1) * couNum - shoppingcartamount;
        $("#count_num").val(couNum);
    }
};