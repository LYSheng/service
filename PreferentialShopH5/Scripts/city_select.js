var null_info = function (con_obj, message) {
    var content_info = '<div class="nodata">' +
      '<p class="no-icon wdgwc"></p>' +
      '<p class="nodatatip">' + message + '</p>' +
      '</div>';
    con_obj.html(content_info);
}
var null_info2 = function (con_obj, selector, message) {
    var content_info = '<div class="nodata">' +
      '<p class="no-icon ' + selector + '"></p>' +
      '<p class="nodatatip">' + message + '</p>' +
      '</div>';
    con_obj.html(content_info);
}

$(".locaarea").on("click", ".location_city,.location_city_xia", function () {
    $("#search_input").val("");
    $(".block").toggleClass("disblock");
    if ($(".block").hasClass("disblock")) {
        $(document.body).css({ "overflow-y": "hidden", "position": "fixed" });
        $(".locaarea").addClass("pf");
    } else {
        $(document.body).css({ "overflow-y": "auto", "position": "static" });
        $(".locaarea").removeClass("pf");
    }
});




(function () {
    var myScroll,
	    pullDownEl, pullDownOffset,
	    pullUpEl, pullUpOffset,
	    generatedCount = 0;
    var pullup_num = 0;
    var select_obj = $(".locaarea .location_city");//当前城市元素
    var orderbyLetter = $("#orderbyLetter");//获取城市首字母列表
    var select_obj1 = $("#location .location_city");//列表中当前元素
    var search_input = $("#search_input");//搜索框元素
    var city_list_contioner = $("#scroller");//城市列表容器
    var fuzzy_query_url = "/home/GetCitiesByKeywords?";//模糊查询接口地址
    var width_val = 540;//模糊查询下拉宽度
    var back_options;//点击返回时需要传递给APP端的参数
    var city_list_url = "/home/GetAllCitiesOrderByFirstLetter";//获取城市列表接口
    var letter_array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var page_flag = 0;
    var page_num = 1;//每次加载1个字母的城市
    var init = function () {
        //ip_location(select_obj, select_obj1);
        get_city_list();
        bind_search();
    },


	//绑定模糊查询
	bind_search = function () {
	    $(search_input).bigAutocomplete({
	        url: fuzzy_query_url,
	        callback: function (data) {
	            $(select_obj).text(data.CityName);
	            if ($(".block").hasClass("disblock")) {
	                $(".block").removeClass("disblock");
	                $(document.body).css({ "overflow-y": "auto", "position": "static" });
	                $(".locaarea").removeClass("pf");
	            }
	            $(select_obj).attr("data-id", data.CityId);
	            var cateid = $(".categoryList li.active").attr("data-cateid");
	            var cityid = $(select_obj).attr("data-id");
	            model.list([]);
	            // homeDataGet();
	            setCookie("locationCityName", data.CityName, "", "/", 30);
	            setCookie("locationID", cityid, "", "/", 30);
	            window.location.reload();
	            return false;
	            // ajax(cateid, cityid)
	            apiRequest({
	                method: "Home/GetHomeData",
	                async: false,
	                data: { "AreaId": cityid },
	                success: function (obj) {
	                    //console.log(list);
	                    if (obj.data.hasLocalBarbecues) {
	                        $("#native").show();
	                    } else {
	                        $("#native").hide();
	                    }
	                    model.list(obj.data.modules);
	                    ratio(7 / 5, ".imgbox");
	                    checkGoodsCount();
	                },
	                error: function (obj) {
	                    smGlobal.error(obj);
	                }
	            });

	        }

	    });
	},
	//初始化获取城市列表
	get_city_list = function () {
	    var option = {
	        url: '/home/GetAllCitiesOrderByFirstLetter',
	        data: {},
	        callback: handle_data,
	    };
	    ajax_data(option);
	},
	//公共ajax
	ajax_data = function (option) {
	    $.ajax({
	        url: option.url,
	        type: "POST",
	        dataType: 'json',
	        data: option.data,
	        beforeSend: function () {
	            //$(document.body).append("<div class='loading3'></div>");
	            $(".loading3").show();
	        },
	        success: function (data) {
	            if (data.IsSuccess) {
	                console.log(data)
	                option.callback(data);
	            }
	        },
	        error: function () {
	            null_info(city_list_contioner, "暂无数据");
	            $(".loading3").hide();
	        }
	    })
	},
	//加载城市列表数据
	handle_data = function (data) {
	    if (data.IsSuccess) {

	        var html = "", leterHtml = '';
	        html += '<ul class="city_ul">';
	        var all_data = data.Data;
	        $.each(all_data, function (index, el) {
	            html += '<ul class="city_ul">';
	            html += '<li class="first" id=' + all_data[index].Letter + '>' + all_data[index].Letter + '</li>';
	            $.each(all_data[index].Cities, function (i, el) {
	                var one_obj = all_data[index].Cities[i];
	                html += '<li data-id="' + one_obj.CityId + '">' + one_obj.CityName + '</li>';
	            });
	            html += '</ul>';
	            leterHtml += '<a class="flex1 ac disblock" data-area="' + el.Letter + '" href="#' + el.Letter + '">' + el.Letter + '</a>';
	        });
	        $(city_list_contioner).append(html);
	        bind_city_obj(data);
	        find_cityid(data);
	        orderbyLetter.html(leterHtml);
	        if ($(".block").hasClass("disblock")) {
	            $(".block").removeClass("disblock");
	        }
	        //列表上方选择当前定位城市
	        $("#location .location_city").on("click", function () {	            
	            var txt = $(this).text();
	            $(".location_city").text(txt);
	            $(".location_city").attr("data-id", $(this).attr("data-id"));
	            setCookie("locationCityName", txt, "", "/", 30);
	            setCookie("locationID", $(this).attr("data-id"), "", "/", 30);
	            if ($(".block").hasClass("disblock")) {
	                $(".block").removeClass("disblock");
	            }
	            $(document.body).css({ "overflow-y": "auto", "position": "static" });
	            $(".locaarea").removeClass("pf");   
	            window.location.reload();	         
	        })


	    } else {
	        null_info(city_list_contioner, "暂无数据");
	    }
	    $(".loading3").hide();


	},
	//绑定城市列表的点击事件
	bind_city_obj = function (data) {
	    var city_arr = $(city_list_contioner).find("ul li:not(.first)");
	    $.each(city_arr, function (index, el) {
	        $(this).unbind("click").bind("click", function () {	            
	            $(select_obj).text($(this).text());
	            $(select_obj).attr("data-id", $(this).attr("data-id"));
	            var localStorage = window.localStorage;
	            localStorage.removeItem("locationFlag");
	            //传给app端的参数
	            if ($(".block").hasClass("disblock")) {
	                $(".block").removeClass("disblock");
	            }
	            $(document.body).css({ "overflow-y": "auto", "position": "static" });
	            $(".locaarea").removeClass("pf");
	            setCookie("locationCityName", $(this).text(), "", "/", 30);
	            setCookie("locationID", $(this).attr("data-id"), "", "/", 30);    
	            window.location.reload();
	            //ajax(cateid, cityid)
	            //apiRequest({
	            //    method: "Home/GetHomeData",
	            //    async: false,
	            //    data: { "AreaId": cityid },
	            //    success: function (obj) {
	            //        //console.log(list);
	            //        model.list(obj.data.modules);
	            //        ratio(7 / 5, ".imgbox");
	            //        checkGoodsCount();
	            //    },
	            //    error: function (obj) {
	            //        smGlobal.error(obj);
	            //    }
	            //});
	            //console.log(str_val)
	            //device_1(str_val);
	        });
	    });

	    find_cityid(data);
	},
	//通过当前定位城市名称查找城市ID
	find_cityid = function (data) {
	    var city_name = $(select_obj1).text();
	    var all_data = data.Data;
	    var city_id = "";
	    $.each(all_data, function (index, el) {
	        $.each(all_data[index].Cities, function (i, el) {
	            var one_obj = all_data[index].Cities[i];
	            if ((one_obj.CityName).indexOf(city_name) > -1) {
	                city_id = one_obj.CityId;
	            }
	        });
	    });
	    $(select_obj).attr("data-id", city_id);
	}
    //判断ios和android设备的方法
    device_1 = function (data_str) {
    }


    window.city_select = {
        init: init,
        //device : device_1
    }
})();
city_select.init();


