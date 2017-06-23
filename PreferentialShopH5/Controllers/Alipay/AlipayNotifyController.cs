//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Text;
//using System.Threading;
//using System.Web;
//using System.Web.Mvc;
//using System.Xml;
//using Common;
//using IContract.Order;
//using Model;
//using Model.Order;
//using Phone.Alipay.Com;
//using Service.Order;

//namespace H5.Controllers.Alipay
//{
//    /// <summary>
//    /// 支付宝回调
//    /// </summary>
//    public class AlipayNotifyController : Controller
//    {
//        /// <summary>
//        /// 实例支付方式
//        /// </summary>
//        private readonly IOrderContract order = new OrderService();
//        //
//        // GET: /AlipayNotify/

//        [ValidateInput(false)]
//        [HttpPost]
//        public void NotifyUrl()
//        {
//            var strLog = new StringBuilder();
//            strLog.Append("<br />" + "===========================================开始执行异步请求============================================<br />");
//            strLog.Append("执行时间：" + DateTime.Now + "<br />");
//            Dictionary<string, string> sPara = GetRequestPost();
//            //判断是否有带返回参数
//            if (sPara.Count > 0)
//            {
//                var xmlDoc = new XmlDocument();
//                xmlDoc.LoadXml(sPara["notify_data"]);
//                //商户订单号
//                var selectSingleNode = xmlDoc.SelectSingleNode("/notify/out_trade_no");
//                if (selectSingleNode != null)
//                {
//                    //商户订单号
//                    var returnOutTradeNo = selectSingleNode.InnerText;
//                    var outTradeNoArray = returnOutTradeNo.Split(new[] { string.Format(GlobalData.OrderNoFormat, "", "") }, 
//                        StringSplitOptions.RemoveEmptyEntries);
//                    //判断订单号
//                    if (outTradeNoArray.Length == 2)
//                    {
//                        var userId = outTradeNoArray[0];
//                        var orderId = outTradeNoArray[1];
//                        //获取订单实体
//                        var orderPayTaskModel = order.OrderPayTask(orderId.TryLong(), userId.TryLong());
//                        if (orderPayTaskModel.IsSuccess)
//                        {
//                            #region 支付宝验证加密

//                            //支付信息实体
//                            var config = new PhoneAlipayConfig
//                                {
//                                    Partner = orderPayTaskModel.Data.PartnerId, //"2088311280901164",
//                                    InputCharset = "utf-8",
//                                    Key = orderPayTaskModel.Data.PartnerCode, //"bvgnyllwci114d7mxx3sapney5ap4pyn",
//                                    SignType = "MD5",
//                                    SellerEmail = orderPayTaskModel.Data.AlipayAccount //"wangxinyi@tonglukuaijian.com"
//                                };
//                            var aliNotify = new PhoneAlipayNotify(config);
//                            var verifyResult = aliNotify.VerifyNotify(sPara, Request.Form["sign"]); //验证成功

//                            #endregion

//                            #region 验证verifyResult结果

//                            if (verifyResult)
//                            {
//                                //解密（如果是RSA签名需要解密，如果是MD5签名则下面一行清注释掉）
//                                //sPara = aliNotify.Decrypt(sPara);
//                                //XML解析notify_data数据
//                                try
//                                {
//                                    #region 解析远程XML节点值

//                                    //支付宝交易号
//                                    var tradeNoNode = xmlDoc.SelectSingleNode("/notify/trade_no");
//                                    var tradeNo = "";
//                                    if (tradeNoNode != null)
//                                    {
//                                        tradeNo = tradeNoNode.InnerText;
//                                    }
//                                    //交易总价
//                                    var totalFee = "";
//                                    var totalFeeNode = xmlDoc.SelectSingleNode("/notify/total_fee");
//                                    if (totalFeeNode != null)
//                                    {
//                                        totalFee = totalFeeNode.InnerText;
//                                    }
//                                    //在支付宝中交易的账号
//                                    var alipayAccount = "";
//                                    var alipayAccountNode = xmlDoc.SelectSingleNode("/notify/buyer_email");
//                                    if (alipayAccountNode != null)
//                                    {
//                                        alipayAccount = alipayAccountNode.InnerText;
//                                    }

//                                    #endregion

//                                    //交易状态
//                                    var xmlNode = xmlDoc.SelectSingleNode("/notify/trade_status");
//                                    if (xmlNode != null)
//                                    {
//                                        var tradeStatus = xmlNode.InnerText;
//                                        strLog.Append("当前tradeStatus状态：" + tradeStatus + "<br />");
//                                        switch (tradeStatus)
//                                        {
//                                            #region TRADE_SUCCESS
//                                            case "TRADE_SUCCESS":
//                                                if (Request.Url != null)
//                                                {
//                                                    try
//                                                    {
//                                                        var orderPaidTaskModel = new OrderPaidTaskModel
//                                                            {
//                                                                OrderId = orderId.TryLong(),
//                                                                PayPrice = totalFee.TryDecimal(),
//                                                                PayNo = tradeNo,
//                                                                PayResult =
//                                                                    HttpUtility.UrlDecode(Request.Params.ToString()),
//                                                                UserId = userId.TryLong()
//                                                            };
//                                                        var result = order.OrderPaidTask(orderPaidTaskModel);
//                                                        strLog.Append("异步执行操作日志是否成功：" + result.IsSuccess + "<br />");
                                                        
//                                                        Response.Write(result.IsSuccess ? "success" : "fail");
//                                                    }
//                                                    catch (Exception ex)
//                                                    {
//                                                        strLog.Append("执行API错误：" + ex.Message + "<br />");
//                                                    }
//                                                    finally
//                                                    {
//                                                        Response.Write("fail");
//                                                    }
//                                                }
//                                                else
//                                                {
//                                                    strLog.Append("执行Request.Url错误 <br />");
//                                                    Response.Write("fail");
//                                                }
//                                                break;
//                                            #endregion
//                                            #region TRADE_FINISHED
                                           
//                                            case "TRADE_FINISHED":
//                                                if (Request.Url != null)
//                                                {
//                                                    try
//                                                    {
//                                                        var orderPaidTaskModel = new OrderPaidTaskModel
//                                                            {
//                                                                OrderId = orderId.TryLong(),
//                                                                PayPrice = totalFee.TryDecimal(),
//                                                                PayNo = tradeNo,
//                                                                PayResult = HttpUtility.UrlDecode(Request.Params.ToString()),
//                                                                UserId = userId.TryLong()
//                                                            };
//                                                        var result = order.OrderPaidTask(orderPaidTaskModel);
//                                                        strLog.Append("异步执行操作日志是否成功：" + result.IsSuccess + "<br />");

//                                                        Response.Write(result.IsSuccess ? "success" : "fail");
//                                                    }
//                                                    catch (Exception ex)
//                                                    {
//                                                        strLog.Append("执行API错误：" + ex.Message + "<br />");
//                                                    }
//                                                    finally
//                                                    {
//                                                        Response.Write("fail");
//                                                    }
//                                                }
//                                                else
//                                                {
//                                                    strLog.Append("执行Request.Url错误 <br />");
//                                                    Response.Write("fail");
//                                                }
//                                                break;
//                                            #endregion
//                                            default:
//                                                Response.Write(tradeStatus);
//                                                break;
//                                        }
//                                    }
//                                }
//                                catch (Exception exc)
//                                {
//                                    strLog.Append("解析支付宝返回的异常信息：" + exc + "<br />");
//                                    Response.Write(exc.ToString());
//                                }
//                            }
//                            //验证失败
//                            else
//                            {
//                                strLog.Append("支付宝验证失败 verifyResult：false <br />");
//                                Response.Write("fail");
//                            }

//                            #endregion
//                        }
//                        else
//                        {
//                            strLog.Append("执行OrderPayTask接口错误：" + orderPayTaskModel.ErrMsg + "<br /> OrderId:" + orderId + " UserId:" + userId);
//                            Response.Write("fail");
//                        }
//                    }
//                    else
//                    {
//                        strLog.Append("返回订单号returnOutTradeNo错误：" + outTradeNoArray + "<br />");
//                        Response.Write("fail");
//                    }
//                }
//                else
//                {
//                    strLog.Append("接受支付宝远程订单号有误：<br />");
//                    Response.Write("fail");
//                }
//            }
//            else
//            {
//                strLog.Append("支付宝无通知参数" + "<br />");
//                Response.Write("无通知参数");
//            }
//            if (Request.Url != null) ExecuteWriteLog(strLog.ToString(), Request.Url.Host);
//        }
//        /// <summary>
//        /// 获取支付宝POST过来通知消息，并以“参数名=参数值”的形式组成数组
//        /// </summary>
//        /// <returns>request回来的信息组成的数组</returns>
//        private Dictionary<string, string> GetRequestPost()
//        {
//            int i;
//            var sArray = new Dictionary<string, string>();
//            //Load Form variables into NameValueCollection variable.
//            var coll = Request.Form;
//            // Get names of all forms into a string array.
//            String[] requestItem = coll.AllKeys;
//            for (i = 0; i < requestItem.Length; i++)
//            {
//                sArray.Add(requestItem[i], Request.Form[requestItem[i]]);
//            }
//            return sArray;
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
//                        var k = fArray[0].Substring(num).TryInt(0) + 1;
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
//    }
//}
