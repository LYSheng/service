(function($){
	var bigAutocomplete = new function(){
		this.currentInputText = null;//Ŀǰ��ù�������򣨽��һ��ҳ�����������Զ���ȫ���ܣ�
		this.functionalKeyArray = [9,20,13,16,17,18,91,92,93,45,36,33,34,35,37,39,112,113,114,115,116,117,118,119,120,121,122,123,144,19,145,40,38,27];//�����Ϲ��ܼ���ֵ����
		this.holdText = null;//�������ԭʼ���������
		
		//��ʼ�������Զ���ȫdiv������documentע��mousedown�������div��������div
		this.init = function(){
			$(".areaHeader").append("<div id='bigAutocompleteContent' class='bigautocomplete-layout'></div>");
			$(document).bind('mousedown',function(event){
				var $target = $(event.target);
				if ((!($target.parents().andSelf().is('#bigAutocompleteContent'))) && (!$target.is(bigAutocomplete.currentInputText))) {
				   bigAutocomplete.hideAutocomplete();
				}
				// if ((!($target.parents().andSelf().is('.block')))){
				//    $(".block").css("display", "none");
				//}
			})
			
			//�����ͣʱѡ�е�ǰ��
			$("#bigAutocompleteContent").delegate("tr", "mouseover", function() {
				$("#bigAutocompleteContent tr").removeClass("ct");
				$(this).addClass("ct");
			}).delegate("tr", "mouseout", function() {
				$("#bigAutocompleteContent tr").removeClass("ct");
			});		
			
			
			//����ѡ���к�ѡ�����������õ�������У���ִ��callback����
			$("#bigAutocompleteContent").delegate("tr", "click", function() {
				bigAutocomplete.currentInputText.val( $(this).find("div:last").html());
				var callback_ = bigAutocomplete.currentInputText.data("config").callback;
				if($("#bigAutocompleteContent").css("display") != "none" && callback_ && $.isFunction(callback_)){
				    callback_($(this).data("jsonData")); 
				}
				
				bigAutocomplete.hideAutocomplete(); 
			})		 
		}
		
		this.autocomplete = function(param){
			
			if($("body").length > 0 && $("#bigAutocompleteContent").length <= 0){
				bigAutocomplete.init();//��ʼ����Ϣ
			}			
			
			var $this = $(this);//Ϊ���Զ���ȫ���ܵ������jquery����
			
			var $bigAutocompleteContent = $("#bigAutocompleteContent");
			
			this.config = {
			               //width:������Ŀ�ȣ�Ĭ��ʹ���������
			               width:$this.outerWidth() - 2,
			               //url����ʽurl:""����ajax��̨��ȡ���ݣ����ص����ݸ�ʽΪdata����һ��
			               url:null,
			               /*data����ʽ{data:[{title:null,result:{}},{title:null,result:{}}]}
			               url��data����ֻ��һ����Ч��data����*/
			               data:null,
			               //callback��ѡ���к󰴻س��򵥻�ʱ�ص��ĺ���
			               callback:null};
			$.extend(this.config,param);
			
			$this.data("config",this.config);
		
			var bind_name="input";//������Ҫ�󶨵��¼�����
		    if(navigator.userAgent.indexOf("MSIE")!=-1) bind_name="propertychange";//�ж��Ƿ�ΪIE�ں� IE�ں˵��¼�����Ҫ��Ϊpropertychange
			//�����keyup�¼�
			//$this.keyup(function(event) {
			$("input").bind(bind_name,function(){
				
				var k = event.keyCode;
				var ctrl = event.ctrlKey;
				var isFunctionalKey = false;//���µļ��Ƿ��ǹ��ܼ�
				for(var i=0;i<bigAutocomplete.functionalKeyArray.length;i++){
					if(k == bigAutocomplete.functionalKeyArray[i]){
						isFunctionalKey = true;
						break;
					}
				}
				//k��ֵ���ǹ��ܼ�����ctrl+c��ctrl+xʱ�Ŵ����Զ���ȫ����
				if(!isFunctionalKey && (!ctrl || (ctrl && k == 67) || (ctrl && k == 88)) ){
					var config = $this.data("config");
					
					var offset = $this.offset();
					// $bigAutocompleteContent.width(config.width);
					var h = $this.outerHeight();
					var parPtop = $this.parent().css("padding-top").replace("px",'');
					console.log(parPtop);
					$bigAutocompleteContent.css({ "top": h + parPtop, "left": offset.left });
					
					var data = config.data;
					var url = config.url;
					var keyword_ = $.trim($this.val());
					if(keyword_ == null || keyword_ == ""){
						bigAutocomplete.hideAutocomplete();
						return;
					}					
					if(data != null && $.isArray(data) ){
						var data_ = new Array();
						for(var i=0;i<data.length;i++){
							if(data[i].city_name.indexOf(keyword_) > -1){
								data_.push(data[i]);
							}
						}
						
						makeContAndShow(data_);
					}else if(url != null && url != ""){//ajax��������
						/*$.post(url,{keyword:keyword_},function(result){
							if(result.status==200){
								makeContAndShow(result.data);
							}else{
								
							}
							
						},"json")*/
						//alert("����ajax");
						$.ajax({
							url : url,
							type : "post",
							data : {
							    CityName: keyword_
							},
							dataType: "json",
							success: function (data) {
							    if (data.IsSuccess) {
							        makeContAndShow(data.Data);
								}else{
									
								}
							},
							error : function(){
								
							}
						});
					}
                bigAutocomplete.holdText = $this.val();
				}
				//�س���
				if(k == 13){
					var callback_ = $this.data("config").callback;
					if($bigAutocompleteContent.css("display") != "none"){
						if(callback_ && $.isFunction(callback_)){
						    callback_($bigAutocompleteContent.find(".ct").data("jsonData"));
						}
						$bigAutocompleteContent.hide();						
					}
				}
				
			});	
			
					
			//��װ������html���ݲ���ʾ
			function makeContAndShow(data_){
				if(data_ == null || data_.length <=0 ){
					return;
				}
				var cont = "<table><tbody>";
				for(var i=0;i<data_.length;i++){
					cont += "<tr><td><div>" + data_[i].CityName + "</div></td></tr>"
				}
               
				cont += "</tbody></table>";
               
				$bigAutocompleteContent.html(cont);
				$bigAutocompleteContent.show();
				
				//ÿ��tr�����ݣ����ظ��ص�����
				$bigAutocompleteContent.find("tr").each(function(index){
					$(this).data("jsonData",data_[index]);
				})
				
			}			
			
			//�����focus�¼�
			$this.focus(function(){
				bigAutocomplete.currentInputText = $this;
			});
			
		}
		//����������
		this.hideAutocomplete = function(){
			var $bigAutocompleteContent = $("#bigAutocompleteContent");
			if($bigAutocompleteContent.css("display") != "none"){
				$bigAutocompleteContent.find("tr").removeClass("ct");
				$bigAutocompleteContent.hide();
			}			
		} 
	};
	$.fn.bigAutocomplete = bigAutocomplete.autocomplete;
	
})(jQuery)