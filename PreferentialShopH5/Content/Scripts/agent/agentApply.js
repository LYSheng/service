var projectId = smGlobal.getQueryString("projectId"),projectName = smGlobal.getQueryString("projectName");
console.log(projectName);
var cityid =[];
$(function () {
    var pullLoadingModel = function () {
        var self = this;
        self.projectShortName = ko.observable();
        self.proWeishanDaiLiDec = ko.observable();
        self.projectLogo = ko.observable();
        self.proDaiLiDec = ko.observable();
        self.proDaiLiImg = ko.observable();
        // self.cateList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            //呼出区域选择
            $("#choiceArea").on("click",page.choiceArea);
            //区域选择取消
            $("#areaCancle").on("click",page.areaCancle);
            //区域选择确认
            $("#areaSave").on("click",page.areaSave);
            //收缩展开城市列表
            $(".area-detail").on("click",page.openCity);
            //城市选择
            $(".area-choice-icon").on("click",page.choiceIcon);
            //调取省市信息
            // page.initProvince();
            //获取当前用户是不是已经申请当前项目
            page.initPage();
            //提交申请
            $("#applyBtn").on("click",page.applyClick);
            //弹窗确认
            $("#saveBtn").on("click",page.saveBtn);
        },
        applyClick:function(){
            var realName = $("#name").val();
            var contactMobile = $("#tel").val();
            var areaIds = cityid;
            var comment = $("#message").val();
            if(realName == ""){
                smGlobal.error("请输入您的真实姓名");
                return false;
            }
            if(contactMobile == ""){
                smGlobal.error("请输入您的联系电话");
                return false;
            }
            if(!contactMobile.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/)){
                smGlobal.error("请输入正确的联系电话");
                return false;
            }
            if(areaIds.length <=0){
                smGlobal.error("请选择您要代理的区域");
                return false;
            }
            var post_data = {
                "projectId": projectId,
                "realName":realName,
                "contactMobile":contactMobile,
                "areaIds":areaIds,
                "comment":comment,
                "applyPlatType":"猫市H5"
            };


            apiRequest({
                method: "ProjectAgent/Apply",
                async: true,
                data: post_data,
                beforeSend: function () {
                    if ($(".loadingFixed").length <= 0) {
                        smGlobal.loadingFixed();
                        $(".loadingFixed").show();
                    }
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    if (obj.isBizSuccess) {
                        $("#_alert").addClass("show");
                        $("#applyBtn").addClass("disabled").html("您已提交过代理申请");;
                        $("#name").attr("readOnly","readOnly");
                        $("#tel").attr("readOnly","readOnly");
                        $("#choiceArea").addClass("disabled");
                        $("#message").attr("readOnly","readOnly");
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        initPage:function(){
            $("#projectName").html(projectName);
            var post_data = {
                "projectId": projectId
            };
            apiRequest({
                method: "ProjectAgent/GetApplyInfo",
                async: true,
                data: post_data,
                beforeSend: function () {
                    if ($(".loadingFixed").length <= 0) {
                        smGlobal.loadingFixed();
                        $(".loadingFixed").show();
                    }
                },
                success: function (obj) {
                    smGlobal.removeHomeGif();
                    if (obj.isBizSuccess) {
                        if(obj.data){
                            $("#applyBtn").addClass("disabled").html("您已提交过代理申请");
                            $("#name").val(obj.data.realName).attr("readOnly","readOnly");
                            $("#tel").val(obj.data.contactMobile).attr("readOnly","readOnly");
                            $("#choiceArea").addClass("disabled");
                            $("#message").val(obj.data.comment).attr("readOnly","readOnly");
                            page.choiceAreaHtml(obj.data.areaNames);
                        }else{
                            $("#applyBtn").removeClass("disabled");
                        }
                        
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        choiceArea:function(){
            if($(this).hasClass("disabled")){
                return false;
            }
            $("#areas").addClass("show");
            document.title="选择区域"; 
        },
        areaCancle:function(){
            var obj = $("#choiceArea");
            var _html = obj.html();
            obj.html(_html);
            $("#areas").removeClass("show");
            document.title="申请代理";
        },
        areaSave:function(){
            cityid =[];
            var obj = $("#choiceArea");
            var _html = "";
            var _length = $("#areaList .area-detail").length;
            
            if($("#all").hasClass("open")){
                _html+="全国";
                cityid.push(1);
            }else{
                for(var i = 0;i<$("#areaList .area-detail.province").length;i++){
                    var _obj = $("#areaList .area-detail.province").eq(i);
                    if(_obj.find(".area-choice-icon").hasClass("open")){
                        _html += _obj.data('name')+',';
                        var _id = _obj.data('id');
                        cityid.push(_id);
                    }else{
                        var _City = _obj.closest(".area-province").find(".area-city .area-detail");
                        for(var j = 0;j<_City.length;j++){
                            var _objCity = _City.eq(j);
                            if(_objCity.find(".area-choice-icon").hasClass("open")){
                                _html += _objCity.data('name')+',';
                                var _id = _objCity.data('id');
                                cityid.push(_id);
                            }
                        }
                    }
                }
                _html = _html.substr(0,_html.length-1)
            }
            
            if(_html == ""){_html ="请选择您希望代理的区域";}
            page.choiceAreaHtml(_html);
            page.areaCancle();
        },
        choiceAreaHtml:function(txt){
            var obj = $("#choiceArea");
            if (txt !="请选择您希望代理的区域") {
                obj.addClass("on");
            }else{
                obj.removeClass("on");
            }
            $("#choiceArea").html("").html(txt);
        },
        openCity:function(){
            var obj = $(this);
            var i = obj.find("i");
            if (i.hasClass("open")) {
                i.removeClass("open");
                obj.next().hide();
            }else{
                i.addClass("open");
                obj.next().show();
            }
        },
        choiceIcon:function(){
            var obj = $(this),_thisparent = obj.closest(".area-detail"),_thisDparent=obj.closest(".area-province");
            var _thisparentPren = _thisDparent.find(".area-detail.province");
            var _cityLength = _thisDparent.find(".area-city .area-detail").length;
            var _cityList = _thisDparent.find(".area-city");
            var _provinceLength = $("#areaList").find(".area-detail.province").length;
            var all = $("#all");
            if(_thisparent.hasClass("all")){
                if(obj.hasClass("open")){
                    $(".area-choice-icon").removeClass("open");
                }else{
                    $(".area-choice-icon").addClass("open");
                }
            }else if(_thisparent.hasClass("province")){
                if(obj.hasClass("open")){
                    _thisDparent.find(".area-choice-icon").removeClass("open");
                    all.removeClass("open");
                }else{
                    _thisDparent.find(".area-choice-icon").addClass("open");
                    for(var i = 0;i<_provinceLength;i++){
                        if($("#areaList").find(".area-detail.province").eq(i).find(".area-choice-icon").hasClass("open")){
                            if(i==(_provinceLength-1)){
                                
                                all.addClass("open");
                            }
                        }else{
                            return false;
                        }
                        
                    }
                }
            }else{
                if(obj.hasClass("open")){
                    obj.removeClass("open");
                    _thisparentPren.find(".area-choice-icon").removeClass("open");
                    all.removeClass("open");
                }else{
                    obj.addClass("open");
                    for(var j = 0;j<_cityLength;j++){
                        if(!_cityList.find(".area-detail").eq(j).find(".area-choice-icon").hasClass("open")){
                            return false;
                        }else{
                            if(j==(_cityLength-1)){
                                _thisparentPren.find(".area-choice-icon").addClass("open");
                                for(var i = 1;i<_provinceLength;i++){
                                    if(!$("#areaList").find(".area-detail").eq(i).find(".area-choice-icon").hasClass("open")){
                                        return false;
                                    }
                                    if(i==(_provinceLength-1)){
                                        all.addClass("open");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        },
        initProvince:function(){
            apiRequest({
                method: "H5Home/GetAllCitiesToJs",
                async: true,
                beforeSend: function () {

                },
                success: function (list) {
                    if (list.isBizSuccess) {
                        //smGlobal.heiAutoError(obj, 2500);
                        var obj = list.data;
                        var _html ='';
                        for (var i=0;i<obj.length;i++) {
                            _html +='<div class="area-province mt4"><div class="area-detail" data-id="'+obj[i].id+'" data-name="'+obj[i].name+'"><i class="area-arrow-icon"></i><p class="flex1">'+obj[i].name+'</p><a href="javascript:void(0)" class="area-choice-icon"></a></div>';
                            if(obj[i].child.length>1){
                                _html +='<div class="area-city">';
                                for (var j = 0; j<obj[i].child.length; j++) {
                                    _html +='<div class="area-detail" data-id="'+obj[i].child[j].id+'" data-name="'+obj[i].child[j].name+'"><p class="flex1">'+obj[i].child[j].name+'</p><a href="javascript:void(0)" class="area-choice-icon"></a></div>'
                                }
                                _html+='</div>';
                            }
                            _html +='</div>';
                        }
                        $("#areaList").html(_html);
                    }
                },
                error: function (obj) {
                    smGlobal.heiAutoError(obj, 2500);
                }
            });
        }
    }
    page.init();
})