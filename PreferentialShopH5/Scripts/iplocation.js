var sessionStorage = window.sessionStorage;
var iplocation = function () {
    var cityListContioner;
    var orderbyLocation;
    var self = this;
    var lnglatXY = [];
    self.toGpslocation = function () {
        self.setDefaultCity();
        if (window.navigator.geolocation) {            
            var options = {
                enableHighAccuracy: false
            };
            window.navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        }
    }
    self.init = function (func, isMustGps) {
        var cityName = getCookie("locationCityName");
        var cityId = getCookie("locationID");
        if (cityId) {
            setCookie("locationCityName", cityName, "", "/", 30);
            setCookie("locationID", cityId, "", "/", 30);
            if (func) {
                func("has");
            }
            func = null;
        }

        self.execFunc = func;
        if (!self.execFunc) {
            self.execFunc = function () { }
        }
        if (!cityId || isMustGps || cityId == 1) {           
            self.toGpslocation();
        }
    }

    self.setDefaultCity = function () {
        var cityId = getCookie("locationID");
        if (!cityId || cityId == 1) {
            self.areaChoose();
            //setCookie("locationCityName", "全国", "", "/", 30);
            //setCookie("locationID", 1, "", "/", 30);
        }

    }
    self.areaChoose = function () {
        if ($('#gpsLocation').length > 0) {
            return;
        }
        //alert(2)
        self.buildFrame();
        var option = {
            url: '/home/GetAllCitiesOrderByFirstLetter',
            data: {},
            callback: self.handleData,
        };
        self.ajaxData(option);
    }
    self.buildFrame = function () {
        var html = '<div class="gpsLocation" id="gpsLocation">' +
                        '<section class="areaSection">' +
                            // '<header class="areaHeader">' +
                            //    '<input type="text" id="comSearchInput" placeholder="请输入城市名">' +
                            //'</header>' +
                            '<div class="deliveryAction fs14  box"><span class="red">请选择您的收货城市！</span><br/>如所在地为县级市，请选择所属的地级城市</div>' +
                        '</section>' +
                        '<div id="gpsWrapper">' +
                             '<div id="locScroller"></div>' +
                        '</div>' +
                        '<div id="orderbyLocation"></div>' +
                        '<div class="loading3"></div>' +
                    '</div>';
        $(document.body).append(html);
        cityListContioner = $("#locScroller");
        orderbyLocation = $("#orderbyLocation");
    }
    //公共ajax
    self.ajaxData = function (option) {
        $.ajax({
            url: option.url,
            type: "POST",
            dataType: 'json',
            data: option.data,
            beforeSend: function () {
                $(".loading3").show();
            },
            success: function (data) {
                if (data.IsSuccess) {
                    option.callback(data);
                }
            },
            error: function () {
                null_info(cityListContioner, "暂无数据");
                $(".loading3").hide();
            }
        })
    }
    self.handleData = function (data) {
        if (data.IsSuccess) {
            var html = "", leterHtml = '';
            html += '<ul class="city_ul">';
            var all_data = data.Data;
            $.each(all_data, function (index, el) {
                html += '<ul class="city_ul">';
                html += '<li class="first" id="area' + all_data[index].Letter + '">' + all_data[index].Letter + '</li>';
                $.each(all_data[index].Cities, function (i, el) {
                    var one_obj = all_data[index].Cities[i];
                    html += '<li data-id="' + one_obj.CityId + '">' + one_obj.CityName + '</li>';
                });
                html += '</ul>';
                leterHtml += '<a class="flex1 ac disblock" data-area="' + el.Letter + '" href="#area' + el.Letter + '">' + el.Letter + '</a>';
            });
            $(cityListContioner).append(html);
            self.bindCityObj(data);//绑定城市列表的点击事件
            //find_cityid(data);//通过当前定位城市名称查找城市ID    待定
            orderbyLocation.html(leterHtml);
            //列表上方选择当前定位城市
        } else {
            null_info(cityListContioner, "暂无数据");
        }
        $(".loading3").hide();
    }
    self.bindCityObj = function (data) {
        var city_arr = $(cityListContioner).find("ul li:not(.first)");
        $.each(city_arr, function (index, el) {
            $(this).unbind("click").bind("click", function () {
                //$(select_obj).text($(this).text());
                var txt = $(this).text();
                var id = $(this).attr("data-id");
                setCookie("locationCityName", txt, "", "/", 30);
                setCookie("locationID", id, "", "/", 30);
                if ($(".new_city .location_city")) {
                    $(".new_city .location_city").text(txt).attr("data-id", id)
                }
                self.execFunc("first");
                $("#gpsLocation").remove();
                location.href = '/Home/Index?v=' + (new Date().getTime());
            });
        });


    }
    var handleSuccess = function (position) {        
        // 获取到当前位置经纬度  本例中是chrome浏览器取到的是google地图中的经纬度
        var lng = position.coords.longitude;
        var lat = position.coords.latitude;
        lnglatXY = [lng, lat];
        // lnglatXY = [118.731694,35.003552];//江苏南京市建邺区经纬度
        regeocoder();
    }
    var handleError = function (error) {
        //lnglatXY = [118.731694, 32.003552];//江苏南京市建邺区经纬度
        //regeocoder();
        //return;
        switch (error.code) {
            case error.TIMEOUT:
                console.log(" 连接超时，请重试 ");
                break;
            case error.PERMISSION_DENIED:
                console.log(" 您拒绝了使用位置共享服务，定位已取消 ");
                // self.areaChoose();
                break;
            case error.POSITION_UNAVAILABLE:
                // self.areaChoose();
                console.log(" 亲爱的火星网友，非常抱歉，我们暂时无法为您所在的星球提供位置服务 ");
                break;
        }
        self.setDefaultCity();
        //self.execFunc("error");
    }
    var regeocoder = function () {  //逆地理编码
        $.ajax({
            type: 'get',
            url: 'https://restapi.amap.com/v3/geocode/regeo?key=551e75d207d9ae01c0aa1a0e0fff655a&location=' + lnglatXY[0] + ',' + lnglatXY[1] + '&poitype=&radius=1&extensions=all&batch=false&roadlevel=1',
            success: function (data) {
                geocoder_CallBack(data);
            },
            error: function (xhr) {
                console.log('ajax 请求失败', xhr.status, xhr.statusText);
                self.setDefaultCity();
                //self.execFunc("error");
            }
        });
    }
    var geocoder_CallBack = function (data) {
        //var address = data.regeocode.formattedAddress;
        var addressComponent = data.regeocode.addressComponent; //返回地址描述
        //console.log(data.regeocode.addressComponent);
        var curCity = addressComponent.city == '' ? addressComponent.province : addressComponent.city;
        var curDistrict = addressComponent.district;
        //  alert(curCity);
        var cityName = getCookie("locationCityName");
        //var cityId = getCookie("locationID");
        var locCurCityName = getCookie("locCurCityName",true);
        var locCurCityID = getCookie("locCurCityID");
        //alert(1);
        if (!curCity || curCity.length == 0) {
            self.setDefaultCity();
            //self.execFunc("error");
            return;
        }
        //alert(curCity);
        //alert(locCurCityName)
        if (curCity != locCurCityName) {
            //alert(3)
            var data = {
                "cityinfo": curCity,
                "callbackFun": function (cityId) {
                    if (getCookie("locationID")) {
                        var custom = $(".custom");
                        if (custom.length > 0) {
                            setCookie("locCurCityName", curCity, "", "/", 30);
                            setCookie("locCurCityID", cityId, "", "/", 30);
                            setCookie("locCurDistrict", curDistrict, "", "/", 30);
                            var pop_mask = $(".pop_mask");
                            var $window_w = $(window).width();
                            var $window_h = $(window).height();
                            var $custom_w = $(".custom").width();
                            var $custom_h = $(".custom").height();
                            $(custom).css({ "top": ($window_h - $custom_h) / 2, "left": ($window_w - $custom_w) / 2 });
                            $(pop_mask).show();
                            $(document.body).css({ "overflow-y": "hidden" });
                            $(".locSure").attr({ "data-locationCityName": curCity + curDistrict, "data-curCityId": cityId });
                            $(custom).show().find(".cityLocationTip").html('系统定位您现在在' + curCity + curDistrict + '，是否切换到' + curCity + curDistrict + '？');
                            self.execFunc("second");
                            window.location.reload();
                        }
                    } else {
                        setCookie("locationCityName", curCity + curDistrict, "", "/", 30);
                        setCookie("locationID", cityId, "", "/", 30);
                        setCookie("locCurCityName", curCity, "", "/", 30);
                        setCookie("locCurDistrict", curDistrict, "", "/", 30);
                        setCookie("locCurCityID", cityId, "", "/", 30);
                        $("#gpsLocation").remove();
                        self.execFunc('first');
                        window.location.reload();
                    }

                }
            };
            areaGet(data)
        } else {
            if (locCurCityID == getCookie("locationID")) {
                setCookie("locationCityName", curCity + curDistrict, "", "/", 30);
            }
            setCookie("locCurDistrict", curDistrict, "", "/", 30);
        }
    }
    return self;
};



//根据城市名称获取城市id
function areaGet(obj) {
    var areaId = 1;
    apiRequest({
        method: "ActionInfo/GetActionDeteilList",
        async: false,
        data: { "AreaName": obj.cityinfo },
        success: function (list) {
            obj.callbackFun.call(this, list.data[0].areaId);
        },
        error: function () {
            smGlobal.error("获取当前城市错误！");
            obj.callbackFun.call(this, areaId);
        }
    });
}
