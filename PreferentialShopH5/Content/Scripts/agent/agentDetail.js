var projectId = smGlobal.getQueryString("projectId"),projectName,projectShortName,providerUserId = smGlobal.getQueryString("providerUserId");
$(function () {
    var pullLoadingModel = function () {
        var self = this;
        self.projectShortName = ko.observable();
        self.proWeishanDaiLiDec = ko.observable();
        self.projectLogo = ko.observable();
        self.proDaiLiDec = ko.observable();
        self.proDaiLiImg = ko.observable();
        self.agentIntrDetail = ko.observable();
        self.skuList = ko.observableArray([]);
        // self.cateList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            //获取招商项目详情
            
            agentModel = new pullLoadingModel();
            ko.applyBindings(agentModel);
            page.initData();
            //申请代理
            $("#agentApply").on("click",page.agentApply);
            //查看更多
            $("#shopMore").on("click",page.shopMore);
            //分享
            // $("#onMenuShareTimeline").on("click",page.onMenuShareTimeline);
        },
        shopMore:function(){
            window.location.href = "/agent/agentShopMore?projectId="+projectId+"&providerUserId="+providerUserId+"&projectName="+projectShortName;
        },
        onMenuShareTimeline: function () {
            if (!getCookie(".ASPXAUTHH5")) {
                page.autoLogin(this);
                return;
            }
            var des = $("#longName").val();
            var imgUrl = $("#productImgSrc").val();
            var title = '【猫市】' + $("#longName").val();
            //移动端专用

            if (!isShareLoadOk) {
                alert('请等待页面加载完成');
                return;
            }
            var shareImg = 'share.png';
            $("body").append("<div class='layer' name='shareLayer' style='z-index:1001;height:100%;width:100%;top:0px;position:fixed;background:rgba(0, 0, 0,0.70);text-align:right'> <img id='sharefriend' style='width:80%;' src='/Content/images/" + shareImg + "'  /><div>")
            $(".layer").on("click",function(){
                $(this).remove();
            })
        },
        initData:function(){
            var _width = $("body").width();
            var post_data = {
                "projectId": projectId,
                "providerUserId":providerUserId,
                "width":_width
            };
            apiRequest({
                method: "AgencyPolicy/GetProjectDetail",
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
                        console.log(obj.data);
                        // agentIntrDetail
                        var project = obj.data.project;
                        agentModel.projectShortName(project.projectName);
                        projectShortName = project.projectShortName;
                        projectName = project.projectName;
                        agentModel.proWeishanDaiLiDec(project.projectJD);
                        agentModel.projectLogo(project.projectLogo);
                        agentModel.proDaiLiDec(project.proDaiLiDec);
                        console.log(project.agentIntrDetail);
                        console.log(obj.data.hadApplyProject);
                        if(obj.data.hadApplyProject == false){
                            $("#agentApply").html("申请代理");
                        }else{
                            $("#agentApply").html("查看申请");
                        }
                        if(!project.agentIntrDetail)
                        {
                            project.agentIntrDetail = "";
                        }
                        agentModel.agentIntrDetail(project.agentIntrDetail);
                        // var _width = $("body").width();
                        // $(".bfvideo").attr("width","100%");
                        // $(".bfvideo").attr("height",_width/(64/36));
                        if(obj.data.skuList.length>0){
                            var ii = 0;
                            for (var i = 0; i < obj.data.skuList.length; i++) {
                                if (ii < obj.data.skuList.length) {
                                    agentModel.skuList.push(obj.data.skuList[i]);
                                    ii++;
                                }
                                else
                                    break;
                            }
                        }
                        $(".scrollLoading").scrollLoading();
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        },
        agentApply:function(){
            if (!getCookie(".ASPXAUTHH5")) {
                page.autoLogin(this);
                return;
            }
            window.location.href = "/agent/agentApply?projectId="+projectId+"&projectName="+encodeURI(projectName);
        },
        autoLogin: function () {
            var openid = getCookie("OpenId") ? getCookie("OpenId") : "";
            var projectId = 0;
            if (parseInt(projectId) > 0) {
                projectId = parseInt(projectId);
            } else {
                projectId = smGlobal.getQueryString("projectId");
            }
            apiRequest({
                method: 'User/Login3_1',
                async: false,
                data: { "OpenId": openid, "LoginSystem": 3 },
                success: function (list) {
                    if (list.isBizSuccess && list.isSkip) {

                    } else if (list.count > 1) {
                        window.location.href = "/account/login?isLogin=1&ReturnUrl=" + "/agent/agentDetail?projectId="+projectId;
                        return;
                    }
                },
                error: function (data) {
                    window.location.href = "/account/login?isLogin=1&ReturnUrl=" + "/agent/agentDetail?projectId="+projectId;
                    return;
                }
            });
        },
    }
    page.init();
})