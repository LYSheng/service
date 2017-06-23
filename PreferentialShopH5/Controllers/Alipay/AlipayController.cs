//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Security.Cryptography;
//using System.Text;
//using System.Threading;
//using System.Web;
//using System.Web.Mvc;
//using Common;
//using IContract.Order;
//using Model;
//using Model.Order;
//using Phone.Alipay.Com;
//using Service.Order;
//using Tonglu.Common.Utilities;
//using JsonHelper = Tonglu.Json.JsonHelper;
//using ObjectExtension = Tonglu.Common.Extensions.ObjectExtension;

//namespace H5.Controllers.Alipay
//{
//    /// <summary>
//    /// 支付宝支付
//    /// </summary>
//    public class AlipayController : Controller//AuthorizeController
//    {
//        /// <summary>
//        /// 实例支付方式
//        /// </summary>
//        private readonly IOrderContract order = new OrderService();
//        //
//        // GET: /Alipay/
//        private string alipaySource = "H5";

//        /// <summary>
//        /// 提交支付方式
//        /// </summary>
//        /// <param name="orderId">订单编号</param>
//        /// <param name="source">来源  H5 IOS  Android</param>
//        /// <param name="userId">用户ID</param>
//        /// <param name="dataTime">发起时间</param>
//        /// <param name="sign">ios加密后的Sign</param>
//        public void SubmitAlipay(string orderId, string source, long? userId, string dataTime, string sign)
//        {
//            if (string.IsNullOrEmpty(orderId))
//            {
//                Response.Write("订单号非法支付");
//                return;
//            }
//            alipaySource = source;
//            switch (alipaySource.ToLower())
//            {
//                case "h5":
//                    //id = Base64helper.DecodingForString(id);
//                    var json = WebHelper4H5.GetAuthData();
//                    if (string.IsNullOrEmpty(json))
//                    {
//                        Response.Redirect("/Account/Login");
//                    }
//                    var currentUser = JsonHelper.ParseJSON<CurrentUser>(json);
//                    userId = currentUser.UserId;
//                    break;
//                case "ios":
//                    ExecuteWriteLog("IOS数据：orderId =>" + orderId + "; source =>" + source + "; userId =>" + userId
//                + "; dataTime =>" + dataTime + "; sign =>" + sign + "<br />", "IOS");
//                    //根据接收的参数进行MD5加密
//                    var currentSign = PaySign(userId + dataTime, "TLOTO", "utf-8");
//                    if (currentSign != sign)
//                    {
//                        Response.Write("sign不匹配:H5的Sign=>" + currentSign + "; IOS的Sign=>" + sign);
//                        ExecuteWriteLog("sign不匹配:H5的Sign=>" + currentSign + "; IOS的Sign=>" + sign, "IOS");
//                        return;
//                    }
//                    break;
//                case "android":
//                    //根据接收的参数进行MD5加密
//                    var currentSign2 = PaySign(userId + dataTime, "TLOTO", "utf-8");
//                    if (currentSign2 != sign)
//                    {
//                        Response.Write("sign不匹配:H5的Sign=>" + currentSign2 + "; Android的Sign=>" + sign);
//                        ExecuteWriteLog("sign不匹配:H5的Sign=>" + currentSign2 + "; Android的Sign=>" + sign, "IOS");
//                        return;
//                    }
//                    break;
//            }

//            var orderPayTaskModel = order.OrderPayTask(ObjectExtension.TryLong(orderId), ObjectExtension.TryLong(userId));
//            if (orderPayTaskModel.IsSuccess)
//            {
//                //支付宝
//                if (orderPayTaskModel.Data.PaymentId == 1)
//                {
//                    CreateDirectPay(orderPayTaskModel.Data, userId);
//                }
//                //微信
//                else if (orderPayTaskModel.Data.PaymentId == 2)
//                {
                    
//                }
//            }
//            else
//            {
//                Response.Write(orderPayTaskModel.ErrMsg);
//            }
//        }

//        /// <summary>
//        /// 即时到帐
//        /// </summary>
//        /// <param name="orderPayTaskModel">支付方式实体</param>
//        /// <param name="userId">用户ID</param>
//        private void CreateDirectPay(OrderPayTaskModel orderPayTaskModel, long? userId)
//        {
//            var tempNowUrl = GetNowUrl();
//            if (tempNowUrl == "")
//            {
//                return;
//            }
//            var orderNumber = string.Format(GlobalData.OrderNoFormat, userId, orderPayTaskModel.OrderId);
//            //tempNowUrl = "wx_qa.xchong.net";
//            var strLog = new StringBuilder();
//            strLog.Append("<br />" + "===============================================支付宝即时到帐 => 提交之前支付信息=====================================" + "<br />");
//            strLog.Append("支付订单号：" + orderNumber + "<br />" + "支付类型：" + orderPayTaskModel.PayName + "<br />" + "支付金额：" + orderPayTaskModel.PayPrice + "<br />");
//            strLog.Append("<br />GetNowUrl：" + GetNowUrl());
//            #region 参数配置
//            //支付宝网关地址  调用授权接口alipay.wap.trade.create.direct获取授权码token
//            const string gatewayNew = "http://wappaygw.alipay.com/service/rest.htm?";
//            //返回格式
//            const string format = "xml";
//            //返回格式
//            const string v = "2.0";
//            //请求号 须保证每次请求都是唯一
//            var reqId = DateTime.Now.ToString("yyyyMMddHHmmssffffff");
//            //服务器异步通知页面路径 需http://格式的完整路径，不允许加?id=123这类自定义参数
//            var notifyUrl = "http://" + tempNowUrl + "/AlipayNotify/NotifyUrl";
//            //var notifyUrl = "http://www.xchong.net/PhoneAlipay/NotifyUrl";
//            strLog.Append("<br />notifyUrl：" + notifyUrl);
//            //页面跳转同步通知页面路径 需http://格式的完整路径，不允许加?id=123这类自定义参数

//            var callBackUrl = "http://" + tempNowUrl + "/Alipay/ExecuteReturnH5Url";
//            switch (alipaySource.ToLower())
//            {
//                case "ios":
//                    callBackUrl = "http://" + tempNowUrl + "/Alipay/ExecuteReturnIosUrl";
//                    break;
//                case "h5":
//                    callBackUrl = "http://" + tempNowUrl + "/Alipay/ExecuteReturnH5Url";
//                    break;
//                case "android":
//                    callBackUrl = "http://" + tempNowUrl + "/Alipay/ExecuteReturnAndroidUrl";
//                    break;
//            }
//            strLog.Append("<br />callBackUrl：" + callBackUrl);
//            //操作中断返回地址 用户付款中途退出返回商户的地址。需http://格式的完整路径，不允许加?id=123这类自定义参数
//            var merchant_url = "http://" + tempNowUrl;
//            //订单名称
//            const string subject = "手机订单支付";
//            //支付宝信息 对应的值可以从数据库获取
//            var config = new PhoneAlipayConfig
//            {
//                Partner = orderPayTaskModel.PartnerId,
//                InputCharset = "utf-8",
//                Key = orderPayTaskModel.PartnerCode,
//                SignType = "MD5",
//                SellerEmail = orderPayTaskModel.AlipayAccount
//            };
//            #endregion

//            //请求业务参数详细
//            var reqDataToken = "<direct_trade_create_req><notify_url>" + notifyUrl + "</notify_url><call_back_url>"
//                + callBackUrl + "</call_back_url><seller_account_name>" + config.SellerEmail + "</seller_account_name><out_trade_no>"
//                + orderNumber + "</out_trade_no><subject>" + subject + "</subject><total_fee>" + orderPayTaskModel.PayPrice + "</total_fee><merchant_url>"
//                + merchant_url + "</merchant_url></direct_trade_create_req>";

//            //把请求参数打包成数组
//            var sParaTempToken = new Dictionary<string, string>
//                {
//                    {"partner", config.Partner},
//                    {"_input_charset", config.InputCharset.ToLower()},
//                    {"sec_id", config.SignType.ToUpper()},
//                    {"service", "alipay.wap.trade.create.direct"},
//                    {"format", format},
//                    {"v", v},
//                    {"req_id", reqId},
//                    {"req_data", reqDataToken}
//                };

//            //建立请求
//            string sHtmlTextToken = new PhoneAlipaySubmit(config).BuildRequest(gatewayNew, sParaTempToken);
//            //URLDECODE返回的信息
//            Encoding code = Encoding.GetEncoding(config.InputCharset);
//            sHtmlTextToken = HttpUtility.UrlDecode(sHtmlTextToken, code);

//            //解析远程模拟提交后返回的信息
//            Dictionary<string, string> dicHtmlTextToken = new PhoneAlipaySubmit(config).ParseResponse(sHtmlTextToken);

//            //获取token 根据授权码token调用交易接口alipay.wap.auth.authAndExecute
//            string requestToken = dicHtmlTextToken["request_token"];
//            //业务详细
//            string reqData = "<auth_and_execute_req><request_token>" + requestToken + "</request_token></auth_and_execute_req>";
//            //把请求参数打包成数组
//            var sParaTemp = new Dictionary<string, string>
//                {
//                    {"partner", config.Partner},
//                    {"_input_charset", config.InputCharset.ToLower()},
//                    {"sec_id", config.SignType.ToUpper()},
//                    {"service", "alipay.wap.auth.authAndExecute"},
//                    {"format", format},
//                    {"v", v},
//                    {"req_data", reqData}
//                };

//            //建立请求
//            var sHtmlText = new PhoneAlipaySubmit(config).BuildRequest(gatewayNew, sParaTemp, "get", "确认");
//            ExecuteWriteLog(strLog.ToString(), tempNowUrl);
//            Response.Write(sHtmlText);
//        }
        
//        /// <summary>
//        /// 支付成功 返回时H5执行动作
//        /// </summary>
//        public void ExecuteReturnH5Url()
//        {
//            //var strLog = new StringBuilder();
//            //var tempNowUrl = GetNowUrl() + "---ExecuteReturnUrl";
//            //strLog.Append("out_trade_no:" + Request["out_trade_no"]);
//            var returnOutTradeNo = Request["out_trade_no"];
//            var outTradeNoArray = returnOutTradeNo.Split(new[] { string.Format(GlobalData.OrderNoFormat, "", "") }, StringSplitOptions.RemoveEmptyEntries);
//            var orderId = outTradeNoArray[1];
//            //strLog.Append("orderId:" + outTradeNoArray[1]);
//            //ExecuteWriteLog(strLog.ToString(), tempNowUrl);
//            Response.Redirect("/User/OrderDetail/" + orderId);
//        }
//        /// <summary>
//        /// 支付成功 返回时执行Android动作
//        /// </summary>
//        public ActionResult ExecuteReturnAndroidUrl()
//        {
//            var returnOutTradeNo = Request["out_trade_no"];
//            if (returnOutTradeNo != null)
//            {
//                var outTradeNoArray = returnOutTradeNo.Split(new[] {string.Format(GlobalData.OrderNoFormat, "", "")}, StringSplitOptions.RemoveEmptyEntries);
//                if (outTradeNoArray.Length == 2)
//                {
//                    var orderId = outTradeNoArray[1];
//                    ViewBag.orderId = orderId;
//                }
//            }
//            return View();
//        }
//        /// <summary>
//        /// 支付成功 返回时执行Ios动作
//        /// </summary>
//        public ActionResult ExecuteReturnIosUrl()
//        {
//            var returnOutTradeNo = Request["out_trade_no"];
//            if (returnOutTradeNo != null)
//            {
//                var outTradeNoArray = returnOutTradeNo.Split(new[] { string.Format(GlobalData.OrderNoFormat, "", "") }, StringSplitOptions.RemoveEmptyEntries);
//                if (outTradeNoArray.Length == 2)
//                {
//                    var orderId = outTradeNoArray[1];
//                    ViewBag.orderId = orderId;
//                }
//            }
//            return View();
//        }
//        #region 线程写入文件

//        /// <summary>
//        /// 执行线程 挂起，然后回收
//        /// </summary>
//        /// <param name="msg">要写入的信息</param>
//        /// <param name="filePath">文件路径 (当前网站域名)</param>
//        private void ExecuteWriteLog(string msg, string filePath)
//        {
//            //以后有需要可以直接开启，暂时避免文件夹太多了
//            filePath = "";
//            ThreadPool.QueueUserWorkItem(x =>
//            {
//                var dirPath = Server.MapPath("~/NotifyUrl_Log/AlipayNotifyUrl_Log/" + filePath + "/"
//                                                  + DateTime.Now.Year + "年" + DateTime.Now.Month + "月/" +
//                                                  DateTime.Now.Day + "日");
//                if (!Directory.Exists(dirPath))
//                {
//                    Directory.CreateDirectory(dirPath);
//                }
//                var fileArray = Directory.GetFiles(dirPath);
//                var path = dirPath + "/AlipayNotifyUrl_Log_0.htm";
//                if (fileArray.Length != 0)
//                {
//                    foreach (var item in fileArray)
//                    {
//                        var file = new FileInfo(item);
//                        //如果当前文件大于5M了 新建一个文件 5242880
//                        if (file.Length <= 5242880) continue;
//                        var fArray = item.Split(new[] { ".htm" }, StringSplitOptions.RemoveEmptyEntries);
//                        var num = fArray[0].Length - 1;
//                        var k = ObjectExtension.TryInt(fArray[0].Substring(num), 0) + 1;
//                        path = dirPath + "/AlipayNotifyUrl_Log_" + k + ".htm";
//                    }
//                }
//                var sw = new StreamWriter(path, true, Encoding.Default);
//                try
//                {
//                    sw.WriteLineAsync(msg);
//                }
//                catch
//                {
//                    sw.Close();
//                    sw.Dispose();
//                }
//                finally
//                {
//                    sw.Close();
//                    sw.Dispose();
//                }
//            });
//        }

//        #endregion

//        /// <summary>
//        /// 获取当前主域名 如：http://www.xxx.com 或者 http://xxx.xxx.com.cn
//        /// </summary>
//        /// <returns></returns>
//        private string GetNowUrl()
//        {
//            //var model = LayOutBiz.Instance.GetDrpSiteUrl();
//            if (Request.Url != null)
//            {
//                var requestUrl = Request.Url.Host.ToLower();
//                //var tempUrl = model.DrpSiteUrl;
//                //if (requestUrl != "www.xchong.net" && requestUrl != "xchong.net" && requestUrl != "xchong.875.cn" && requestUrl != "test1xiaochong.xchong.net")
//                //{
//                //    return "";
//                //}
//                requestUrl = requestUrl.Replace("http://", "");
//                return requestUrl;
//            }
//            return "";
//        }

//        /// <summary>
//        /// 签名字符串
//        /// </summary>
//        /// <param name="prestr">需要签名的字符串</param>
//        /// <param name="key">密钥</param>
//        /// <param name="inputCharset">编码格式</param>
//        /// <returns>签名结果</returns>
//        public static string PaySign(string prestr, string key, string inputCharset)
//        {
//            var sb = new StringBuilder(32);
//            prestr = prestr + key;
//            MD5 md5 = new MD5CryptoServiceProvider();
//            var t = md5.ComputeHash(Encoding.GetEncoding(inputCharset).GetBytes(prestr));
//            for (var i = 0; i < t.Length; i++)
//            {
//                sb.Append(t[i].ToString("x").PadLeft(2, '0'));
//            }
//            return sb.ToString();
//        }
//    }
//}
