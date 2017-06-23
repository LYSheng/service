/// <reference path="exif.js" />
/// <reference path="binaryajax.js" />
/// <reference path="megapix-image.js" />

//$(document).bind("ajaxSend", function () {
//    $("#loading").show();
//}).bind("ajaxComplete", function () {
//    $("#loading").hide();
//});

function ajaxRequest(type, url, data, beforeSend, dataType, globalType) { // Ajax helper
    var options = {
        dataType: dataType || "json",
        contentType: "application/json",
        beforeSend: beforeSend || '',
        cache: false,
        type: type,
        data: data ? data.toJson() : null,
        global: globalType ? globalType : false
    };
    return $.ajax(url, options);
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
    //ajax 消息错误处理
    error: function (msg) {
        if (msg == "MustLogin") {
            alert("请先登录");
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
            width: 500,
            height: 500,
            //上传前
            beforeUpload: false,
            //回调方法
            callback: function (path) {
                alert(path);
            }
        };
        var opts = $.extend(defaults, options);
        alert(0);
        this.change(function () {
            if (opts.beforeUpload && typeof opts.beforeUpload == "function") {
                if (!opts.beforeUpload())
                    return false;
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
                var mpImg = new MegaPixImage(file);
                reader.onload = function (e) {

                    var imgData = e.target.result;
                    var image = new Image();
                    var exif;

                    //画缩略图
                    var canvas = $("<canvas id=\"myCanvas\" style=\"display: none;\">您的浏览器不支持canvas</canvas>").appendTo("body").get(0);
                    var context = canvas.getContext('2d');
                    image.onload = function () {
                        var orientation = exif.Orientation;
                        //渲染
                        mpImg.render(canvas, { maxWidth: opts.width, maxHeight: opts.height, orientation: orientation });
                        var data = canvas.toDataURL();
                        //ajax 提交表单
                        $.ajax({
                            url: "/Handler/UploadHandler.ashx",
                            async: false,
                            type: "post",
                            data: { data: data.substring(22), name: fileName },
                            dataType: "json",
                            success: function (result) {
                                if (result.isSuccess) {
                                    if (opts.callback) {
                                        opts.callback(result.data);
                                    }
                                }
                            }
                        });
                    };
                    // data-url 转换为二进制数据
                    var base64 = imgData.replace(/^.*?,/, '');
                    var binary = atob(base64);
                    var binaryData = new BinaryFile(binary);
                    //获取exif信息
                    exif = EXIF.readFromBinaryFile(binaryData);
                    image.src = imgData;
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

//IOS调用此方法，隐藏nav 部分页面特例需要隐藏head
function HideFromIOS() {
    $("nav").hide();
    var str = "Activity/Coupon";
    var curUlr = location.href;
    if (curUlr.indexOf(str) > -1)
        $(".head").hide();
}

String.prototype.format = function (args) {
    var result = this;
    var _arguments = arguments;
    (arguments.length > 0) && function () {
        (_arguments.length == 1 && typeof (args) == "object") ? function () {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }() : function () {
            for (var i = 0; i < _arguments.length; i++) {
                if (_arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, _arguments[i]);
                }
            }
        }();
    }();
    return result;
}