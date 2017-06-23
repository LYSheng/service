

//$(document).bind("ajaxSend", function () {
//    $("#loading").show();
//}).bind("ajaxComplete", function () {
//    $("#loading").hide();
//});
//判断是否点击过
function hasClicked(d) {
    if ($(d).hasClass("clickFlag")) {
        //smGlobal.error("请不要重复点击退出");
        return true;
    }
    $(d).addClass("clickFlag");
    return false;
}
var platinumBag = function (WXShare) {
    var isShareLoadOk = false;
    wx.config({
        debug: false,
        appId: WXShare.Wxappid,
        timestamp: WXShare.Timestamp,
        nonceStr: WXShare.Noncestr,
        signature: WXShare.Signature,
        jsApiList: [
      'checkJsApi',
    'onMenuShareTimeline',
    'onMenuShareAppMessage'
        ]
    });
    var dom = $("<div></div>").addClass("giftDialogue");
    var inDialogue = $("<div></div>").addClass("inDialogue");
    var _html = '';
    _html += "<img src='../content/images/gift01.png?v=0.1' class='fl full-width' />";
    _html += "<img src='../content/images/gift02.png?v=0.1' class='fl full-width ' />";
    _html += "<a href='javascript:void(0)' class='goMyCoupon closeDia'></a>";
    _html += "<a href='javascript:void(0)' class='goShare closeDia'></a>";
    _html += " <img src='../content/images/gift03.png' class='fl closeDia' id='closeDia' />";

    inDialogue.append(_html);
    dom.append(inDialogue)
    $('body').append(dom);
    $(".closeDia").click(function () {
        //document.cookie = "IsHasCoupons=;expires=" + (new Date(0)).toGMTString();
        setCookie("IsHasCoupons", null, "", "/", 30);

        if ($(this).hasClass("goShare")) {
            var linkUrl = WXShare.WXMVCUrl + "/Share/Arrive?ReferrerUserId=" + WXShare.CurrentUserId,
                shareDesc = '新人狂送礼！注册即送购物礼包，实时关注Malls五洲精选，超低折扣、会员特惠，更多惊喜活动等着您！',
                shareImg = WXShare.WXMVCUrl + '/Content/images/share_new_01.jpg',
                shareTitle = '新人见面礼，购物礼金塞腰包！';
            wx.onMenuShareAppMessage({
                title: '新人见面礼，购物礼金塞腰包！',
                desc: '新人狂送礼！注册即送购物礼包，实时关注Malls五洲精选，超低折扣、会员特惠，更多惊喜活动等着您！', // 分享描述
                link: WXShare.WXMVCUrl + "/Share/Arrive?ReferrerUserId=" + WXShare.CurrentUserId,
                imgUrl: WXShare.WXMVCUrl + '/Content/images/share_new_01.jpg',
                trigger: function (res) {
                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回

                },
                success: function (res) {
                    $("body .layer").remove();
                },
                cancel: function (res) {
                    $("body .layer").remove();
                },
                fail: function (res) {
                    alert(JSON.stringify(res));
                }
            });
            wx.onMenuShareTimeline({
                title: '新人狂送礼！注册即送购物礼包，实时关注Malls五洲精选，超低折扣、会员特惠，更多惊喜活动等着您！',
                desc: '测试描述', // 朋友圈不支持
                link: WXShare.WXMVCUrl + "/Share/Arrive?ReferrerUserId=" + WXShare.CurrentUserId,
                imgUrl: WXShare.WXMVCUrl + '/Content/images/share_new_01.jpg',
                trigger: function (res) {
                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回

                },
                success: function (res) {
                    $("body .layer").remove();
                },
                cancel: function (res) {
                    $("body .layer").remove();
                },
                fail: function (res) {
                    alert(JSON.stringify(res));
                }
            });
            isShareLoadOk = true;
            if (!isShareLoadOk) {
                alert('请等待页面加载完成');
                return;
            }
            //移动端专用
            setTimeout(function () {
                try {
                    if (typeof mobile.appShareClickDo == "function") {
                        mobile.appShareClickDo(linkUrl, shareDesc, shareImg, shareTitle);
                        return;
                    }
                } catch (e) {

                }
                if (typeof appShareClickDo == "function") {
                    appShareClickDo(linkUrl, shareDesc, shareImg, shareTitle);
                    return;
                }
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.shareName) {
                    window.webkit.messageHandlers.shareName.postMessage([linkUrl, shareDesc, shareImg, shareTitle]);
                    return;
                }


                $("body").append("<div id='divShareLayer' class='layer' style='z-index:10002;height:100%;width:100%;top:0px;position:fixed;background:rgba(0, 0, 0,0.60);text-align:right'> <img id='sharefriend' style='width:80%;' src='/Content/images/share.png'  /><div>")
                setTimeout(function () {
                    $(".layer").off().on("click", function () {
                        $(this).remove();
                    })
                }, 0);


            }, 0);
            //alert(提示分享)
        } else {
            $(".giftDialogue").remove();
            if ($(this).hasClass("goMyCoupon")) {
                window.location.href = "/userAbout/myCoupon?showTab=my"
            }
        }
    })
}
function ajaxRequest(type, url, data, dataType, globalType, beforesend, complete) {
    var options = {
        dataType: dataType || "json",
        contentType: "application/json",
        cache: false,
        type: type,
        beforeSend: beforesend ? beforesend : null,
        complete: complete,
        data: data ? ko.toJSON(data) : null,
        global: globalType ? globalType : false
    };

    //var token = $("#token").val();
    //if (token) {
    //    options.headers = {
    //        'RequestToken': token
    //    };
    //}
    return $.ajax(url, options);
}

function apiRequest(options) {
    var defaults =
    {
        method: "",
        data: {},
        async: false,
        beforeSend: null,
        success: false,
        getBizErrorMsg: true
    };
    var opts = $.extend(defaults, options);
    //Api 参数
    var apiParams = {};
    $.extend(apiParams, opts.data);
    //仿跨站点攻击
    var requestVerificationToken = $(":hidden[name='__RequestVerificationToken']").val();
    $.ajax({
        url: "/Api?now=" + new Date(),
        data: { "method": opts.method, "json": JSON.stringify(apiParams), "__RequestVerificationToken": requestVerificationToken },
        cache: false,
        dataType: "json",
        async: opts.async,
        beforeSend: opts.beforeSend,
        type: "POST",
        success: function (result) {
            if (result.isBizSuccess) {
                if (typeof opts.success == "function") {
                    opts.success(result);
                }
            } else {
                if (opts.getBizErrorMsg) {
                    if (typeof opts.error == "function") {
                        opts.error(result.bizErrorMsg);
                    }
                } else {
                    opts.error(result);
                }
            }

        },
        error: opts.error
    });
}



//validation config
ko.validation.configure({
    decorateElement: false,
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null,
    errorClass: 'error_tips'
});

//Ajax config
$.ajaxSetup({
    cache: false,
    data: { _ajax: true }
});
//set effect
$(function () {
    //后退
    $(".btnPrev").click(function () {
        window.history.go(-1);
    })
    //返回
    $("#btnBack").click(function () {
        history.back();
    });
    //切换 开关
    $("#btnAgree").toggle(function () {
        $(this).removeClass().addClass("off fle").find("em").removeClass().addClass("off_btn");
    }, function () {
        $(this).removeClass().addClass("on fle").find("em").removeClass().addClass("on_btn");
    });
    //导航
    $(".nav li").click(function () {
        var type = $(this).find("em").attr("class");
        switch (type) {
            case "home":
                location.href = "/Home/Index";
                break;
            case "interactive":
                location.href = "/Topic/Index";
                break;
            case "buy_car":
                location.href = "/Cart/Index";
                break;
            case "my":
                location.href = "/User/Index";
                break;
        }
    });

    //返回顶部元素，当大于2个屏幕时显示
    var winHeight = $(document).height();
    $(".back_top").hide();
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 2 * winHeight) {
            $(".back_top").fadeIn(100);
        } else {
            $(".back_top").fadeOut(200);
        };
    });
    $(".back_top").click(function () {
        $('body,html').animate({ scrollTop: 0 }, 1000);
        return false;
    });
});

/*  扩展方法  */
$.extend({
    // 获取url中的参数
    queryString: function (key) {
        var url = window.location;
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
        var r = url.search.substr(1).match(reg);
        if (r != null) return (r[2]); return null;
    },
    //格式化数字为货币类型，保留n小数
    fmoney: function fmoney(s, n) {
        n = n > 0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        return t.split("").reverse().join("") + "." + r;
    },
    //表单必填项
    regRequired: function (n, t) {
        if (!! !n) return smGlobal.error(t),
        !1;
        var r = /^\s+|\s+$/g,
        i;
        return i = n,
        typeof n == "string" && (i = n.replace(r, "")),
        (i + "").length > 0 ? !0 : (smGlobal.error(t), !1)
    },
    //ajax 消息错误处理
    error: function (msg) {
        if (msg == "MustLogin") {
            //alert("请先登录");
            location.href = "/Account/Login";
        }
        console.log(msg);
    },
    //固定两位小数
    fixed2Scale: function (val) {
        return (Math.round(val * 100) / 100).toFixed(2);
    },
    //会员卡ID 不够10位补零
    fillZero: function (val, n) {
        var len = val.toString().length;
        while (len < n) {
            val = "0" + val;
            len++;
        }
        return val;
    }
});


/*  扩展插件  */
jQuery.fn.extend({
    //上传文件
    upload: function (options) {
        var defaults = {
            width: 100,
            height: 100,
            //上传前
            beforeUpload: false,
            errorPause: false,
            //回调方法
            callback: function (path) {
                alert(path);
            }
        };
        var opts = $.extend(defaults, options);
        this.change(function () {
            var curObj = this;
            if (opts.beforeUpload && typeof opts.beforeUpload == "function") {
                opts.beforeUpload();
            }

            var dir;
            //EXIF js 可以读取图片的元信息 
            if (this.files[0] && this.files[0] != "") {
                EXIF.getData(this.files[0], function () {
                    dir = EXIF.getTag(this, 'Orientation');
                });
            } else {
                if (opts.errorPause && typeof opts.errorPause == "function") {
                    opts.errorPause();
                }
                return;
            }
            var width = opts.width, height = opts.height;
            if (typeof FileReader == 'undefined') {
                alert('您的浏览器不支持Html5');
            } else {
                //读取文件
                var file = this.files[0];
                var fileName = file.name;
                var reader = new FileReader();
                if (file.type && !file.type.match(/image.*/)) {
                    alert("请选择图片类型:" + file.type);
                    return false;
                }
                //压缩图片大小
                //var mpImg = new MegaPixImage(file);
                reader.onload = function (e) {

                    var imgData = e.target.result;
                    var image = new Image();
                    var canvas = document.createElement('canvas');
                    var img = image;

                    img.onload = function () {

                        if (img.height > opts.height) {//按最大高度等比缩放

                            img.width *= opts.height / img.height;

                            img.height = opts.height;

                        }
                        var ctx = canvas.getContext("2d");

                        var degree = 0, drawWidth, drawHeight;
                        drawWidth = img.width;
                        drawHeight = img.height;
                        canvas.width = img.width;
                        canvas.height = img.height;
                        //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
                        switch (dir) {
                            //iphone横屏拍摄，此时home键在左侧
                            case 3:
                                degree = 180;
                                drawWidth = -img.width;
                                drawHeight = -img.height;
                                break;
                                //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                            case 6:
                                if (img.width > opts.width) {//按最大高度等比缩放

                                    img.height *= opts.width / img.width;

                                    img.width = opts.width;

                                }
                                canvas.width = img.height;
                                canvas.height = img.width;
                                degree = 90;
                                drawWidth = img.width;
                                drawHeight = -img.height;
                                break;
                                //iphone竖屏拍摄，此时home键在上方
                            case 8:
                                if (img.width > opts.width) {//按最大高度等比缩放

                                    img.height *= opts.width / img.width;

                                    img.width = opts.width;

                                }
                                canvas.width = img.height;
                                canvas.height = img.width;
                                degree = 270;
                                drawWidth = -img.width;
                                drawHeight = img.height;
                                break;
                        }
                        //使用canvas旋转校正
                        ctx.rotate(degree * Math.PI / 180);
                        ////////////////////////////
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // canvas清屏                      
                        //重置canvans宽高
                        ctx.drawImage(img, 0, 0, drawWidth, drawHeight); // 将图像绘制到canvas上 
                        var fileType = file.type == "image/png" ? "image/png" : "image/jpeg";
                        //必须等压缩完才读取canvas值，否则canvas内容是黑帆布

                        $.ajax({
                            url: "/Account/imgUpload",
                            async: false,
                            type: "post",
                            data: { data: canvas.toDataURL(fileType).substr(imgData.indexOf(";base64,") + 8), name: fileName },//data.substring(22)
                            dataType: "json",
                            success: function (result) {
                                if (opts.callback) {
                                    result.curObj = curObj;
                                    opts.callback(result);
                                }
                                setTimeout(function () {
                                    if (opts.errorPause && typeof opts.errorPause == "function") {
                                        opts.errorPause();
                                    }
                                }, 500)
                            },
                            error: function (data) {
                                setTimeout(function () {
                                    if (opts.errorPause && typeof opts.errorPause == "function") {
                                        opts.errorPause();
                                    }
                                }, 500)
                                console.log(data)
                            }
                        });

                    };

                    // 记住必须先绑定事件，才能设置src属性，否则img没内容可以画到canvas

                    img.src = imgData;

                    //var exif;
                    //画缩略图
                    //var canvas = $("<canvas id=\"myCanvas\" style=\"display: none;\">您的浏览器不支持canvas</canvas>").appendTo("body").get(0);
                    //var context = canvas.getContext('2d');
                    //image.onload = function () {
                    //var orientation = exif.Orientation;
                    ////渲染
                    //mpImg.render(canvas, { maxWidth: opts.width, maxHeight: opts.height, orientation: orientation });
                    //var data = canvas.toDataURL();                 
                    //ajax 提交表单

                    // };
                    // data-url 转换为二进制数据
                    //var base64 = imgData.replace(/^.*?,/, '');
                    //var binary = atob(base64);
                    //var binaryData = new BinaryFile(binary);
                    ////获取exif信息
                    //exif = EXIF.readFromBinaryFile(binaryData);
                    //image.src = imgData;
                };
                reader.readAsDataURL(file);
            }
        });
    },
    pager: function (options) {
        var defaults = {
            page: 1, //当前页
            pageSize: 4, //每页显示条数
            //上拉回掉方法,要返回true和false来更新当前页
            upCallback: function () {
                return false;
            },
            //下拉回掉方法
            downCallback: function () {
                return false;
            },
        };
        var opts = $.extend(defaults, options);
        var y = 0;
        var isBottom = false; //是否到底部
        $(this).addClass("scroll-pager");
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
        var scroller = new IScroll('.scroll-pager', {
            scrollY: true,
            scrollX: false
        });
        scroller.on('scrollStart', function () {
            y = this.y;
        });
        scroller.on('scrollEnd', function () {
            if (this.y == y) { //顶部或底部
                if (this.y < 0) {
                    if (opts.upCallback && typeof opts.upCallback == "function") {
                        var index = opts.page + 1;
                        if (!isBottom) {
                            isBottom = !opts.upCallback(index, opts.pageSize);
                            if (!isBottom) {
                                opts.page = index;
                                scroller.refresh();
                            }
                        }
                    }
                } else {
                    if (opts.downCallback && typeof opts.downCallback == "function") {
                        opts.downCallback();
                        scroller.refresh();
                        isBottom = false;
                    }
                }
            }
        });
    }
});

$(function () {
    jQuery.extend({
        getParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }
    });
    $(".accInput").focus(function () {
        if ($(this).siblings(".iconClear")) {
            $(this).siblings(".iconClear").show();
        }
    }).keyup(function () {
        if ($(this).siblings(".iconClear")) {
            $(this).siblings(".iconClear").show();
        }
    }).blur(function () {
        var curObj = $(this);
        setTimeout(function () {
            if (curObj.siblings(".iconClear")) {
                curObj.siblings(".iconClear").css("display", "none");
            }
        }, 200)
    })
    $(".iconClear").on("click", function () {
        // alert($(this).siblings(".accInput"))
        $(this).siblings(".accInput").val("").focus();
    })
});

//检验输入数字
function checkStartNum(obj) {
    //先把非数字的都替换掉，除了数字和小数点
    obj.value = obj.value.replace(/[^\d.]/g, "");
    //必须保证第一个为数字而不是小数点
    obj.value = obj.value.replace(/^\./g, "");
    //出去前面都是0  如：00001
    obj.value = obj.value.replace(/^0{1,}/g, "");
    //保证只有出现一个小数点
    obj.value = obj.value.replace(/\.{1,}/g, ".");
    //保证小数点只出现一次
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    if (obj.value == '') {
        obj.value = "0";
    }
}

