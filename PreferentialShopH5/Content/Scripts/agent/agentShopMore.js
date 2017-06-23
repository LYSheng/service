var projectId = smGlobal.getQueryString("projectId"),providerUserId = smGlobal.getQueryString("providerUserId"),projectShortName = smGlobal.getQueryString("projectName");
document.title=projectShortName+"相关商品";
$(function () {
    var pullLoadingModel = function () {
        var self = this;
        self.skuList = ko.observableArray([]);
        // self.cateList = ko.observableArray([]);
    }
    var page = {
        init: function () {
            //获取招商项目详情
            
            agentModel = new pullLoadingModel();
            ko.applyBindings(agentModel);
            page.initData();
        },
        initData:function(){
            var post_data = {
                "projectId": projectId,
                "providerUserId":providerUserId       //商户id
            };
            apiRequest({
                method: "AgencyPolicy/GetSkuListFromUser",
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
                        var ii = 0;
                        if(obj.data.length>0){
                            for (var i = 0; i < obj.data.length; i++) {
                                if (ii < obj.data.length) {
                                    agentModel.skuList.push(obj.data[i]);
                                    ii++;
                                }
                                else
                                    break;
                            }
                        }else{
                            $(".nodata").show();
                        }
                        
                    }
                },
                error: function (obj) {
                    smGlobal.removeHomeGif();
                    smGlobal.error(obj);
                }
            });
        }
    }
    page.init();
})