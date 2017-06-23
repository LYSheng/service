// var filechooser = document.getElementById("choose");
//    用于压缩图片的canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
//    瓦片canvas
var tCanvas = document.createElement("canvas");
var tctx = tCanvas.getContext("2d");
var maxsize = 100 * 1024;

function getPhoto(uploadImgFile, trigger) {
    var uploadImgFile = $("#uploadFile");
    //上传图片
    uploadImgFile.on("change", function (evt) {
        // 如果浏览器不支持FileReader，则不处理
        if (!window.FileReader) return;
        var files = evt.target.files;
        //循环每个文件
        for (var i = 0, f; f = files[i]; i++) {
            //if (!f.type.match('image.*')) {
            //    continue;
            //}
            var orientation;
            $("#picLoading").show().html("证照上传中...");
            //EXIF js 可以读取图片的元信息 https://github.com/exif-js/exif-js
            EXIF.getData(files[0], function () {
                orientation = EXIF.getTag(this, 'Orientation');
            });
            var reader = new FileReader();
            reader.onload = (function (theFile) {
                return function (e) {
                    // console.log(e)
                    // console.log(orientation);
                    var _name = theFile.name;
                    var _base = e.target.result;    //data:image/jpeg;base64,
                    var img = new Image();
                    img.src = _base;

                    if (e.total < maxsize) {
                        upAjax(_base.substring(23), _name);
                        return false;
                    }
                    // if(orientation == 3 || orientation ==6 || orientation==8){
                    //     getImgData(_base,orientation,function(data){
                    //         //这里可以使用校正后的图片data了
                    //         upAjax(data.substring(23),_name);
                    //     });
                    //     return false;
                    // }
                    if (img.complete) {
                        callback();
                    } else {
                        img.onload = callback;
                    }

                    function callback() {
                        // var _base = compress(img);
                        // upAjax(_base.substring(23),_name);
                        // img = null;

                        getImgData(_base, orientation, function (data) {
                            //这里可以使用校正后的图片data了
                            upAjax(data.substring(23), _name);
                        });
                        return false;
                    }
                    //console.log(_base);
                };
            })(f);
            reader.readAsDataURL(f);
        }
    });

}

function beforePhoto() {
    $("#picLoading").show().html("证照上传中...");
}

function upAjax(base, name) {
    $("#picLoading").show().html("证照上传中...");
    $.ajax({
        url: "/Account/imgUpload",
        async: false,
        type: "post",
        data: { data: base, name: name },//data.substring(22)
        dataType: "json",
        success: function (result) {
            var $base = "data:image/jpeg;base64," + base;
            uploadImgUrl = result.data;
            $("#uploadSrc").attr("src", result.data).addClass("imgShow");
            $("#upTxt").hide();
            setTimeout(function () {
                $("#picLoading").hide();
            }, 300)
        },
        error: function (data) {
            //smGlobal.error(data);
            $("#picLoading").hide().html("上传失败");
        }
    });
}

function compress(img) {
    var initSize = img.src.length;
    var width = img.width;
    var height = img.height;

    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    var ratio;
    if ((ratio = width * height / 4000000) > 1) {
        ratio = Math.sqrt(ratio);
        width /= ratio;
        height /= ratio;
    } else {
        ratio = 1;
    }

    canvas.width = width;
    canvas.height = height;
    //铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //如果图片像素大于100万则使用瓦片绘制
    var count;
    if ((count = width * height / 1000000) > 1) {
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
        //            计算每块瓦片的宽和高
        var nw = ~~(width / count);
        var nh = ~~(height / count);
        tCanvas.width = nw;
        tCanvas.height = nh;
        for (var i = 0; i < count; i++) {
            for (var j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }
    //进行最小压缩
    var ndata = canvas.toDataURL('image/jpeg', 0.5);
    console.log('压缩前：' + initSize);
    console.log('压缩后：' + ndata.length);
    console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
    return ndata;
}


// @param {string} img 图片的base64
// @param {int} dir exif获取的方向信息
// @param {function} next 回调方法，返回校正方向后的base64
function getImgData(img, dir, next) {
    var image = new Image();
    image.onload = function () {
        var degree = 0, drawWidth, drawHeight, width, height;
        drawWidth = this.naturalWidth;
        drawHeight = this.naturalHeight;
        //以下改变一下图片大小
        var maxSide = Math.max(drawWidth, drawHeight);
        if (maxSide > 1024) {
            var minSide = Math.min(drawWidth, drawHeight);
            minSide = minSide / maxSide * 1024;
            maxSide = 1024;
            if (drawWidth > drawHeight) {
                drawWidth = maxSide;
                drawHeight = minSide;
            } else {
                drawWidth = minSide;
                drawHeight = maxSide;
            }
        }
        var canvas = document.createElement('canvas');
        canvas.width = width = drawWidth;
        canvas.height = height = drawHeight;
        var context = canvas.getContext('2d');
        //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
        switch (dir) {
            //iphone横屏拍摄，此时home键在左侧
            case 3:
                degree = 180;
                drawWidth = -width;
                drawHeight = -height;
                break;
                //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
            case 6:
                canvas.width = height;
                canvas.height = width;
                degree = 90;
                drawWidth = width;
                drawHeight = -height;
                break;
                //iphone竖屏拍摄，此时home键在上方
            case 8:
                canvas.width = height;
                canvas.height = width;
                degree = 270;
                drawWidth = -width;
                drawHeight = height;
                break;
        }
        //使用canvas旋转校正
        context.rotate(degree * Math.PI / 180);
        context.drawImage(this, 0, 0, drawWidth, drawHeight);
        //返回校正图片
        next(canvas.toDataURL("image/jpeg", .8));
    }
    image.src = img;
}


getPhoto();