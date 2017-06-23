using Common;
using Common.Tencent;
using Service;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace H5.Controllers
{
    public class WeChatResultController : Controller
    {
        [HttpGet]
        public string Index(string signature, string timestamp, string nonce, string echostr)
        {
            DBLog.Process("WeChatResult开始请求", "", "111");

            return echostr;
        }
        [HttpPost]
        public string Index(string msg_signature, string timestamp, string nonce)
        {
            var weChatSet = new WeChatSet();
            weChatSet.AppID = System.Configuration.ConfigurationManager.AppSettings["wxappid"];
            weChatSet.EncodingAESKey = System.Configuration.ConfigurationManager.AppSettings["wxEncodingAESKey"];
            weChatSet.Token = System.Configuration.ConfigurationManager.AppSettings["wxToken"]; ;
            Dictionary<string, WeChatSet> dic = new Dictionary<string, WeChatSet>();
            dic.Add(System.Configuration.ConfigurationManager.AppSettings["wxappName"], weChatSet);
            var xmlTool = new WeChatXmlTool(dic, msg_signature, timestamp, nonce);
            using (Stream stream = System.Web.HttpContext.Current.Request.InputStream)
            {
                Byte[] postBytes = new Byte[stream.Length];
                stream.Read(postBytes, 0, (Int32)stream.Length);
                var postString = Encoding.UTF8.GetString(postBytes);
                xmlTool.LoadXml(postString);
            }

            try
            {
                var msgType = xmlTool["MsgType"];


                if (msgType == "event")
                {
                    var openId = xmlTool["FromUserName"];
                    if (xmlTool["Event"] == "subscribe")
                    {
                        try
                        {
                            ApiHelper.Request("WeChat/SetWechatSubscribe", new
                                           {
                                               openId = openId,
                                               isSubscribe = true
                                           });
                        }
                        catch (Exception ex)
                        {
                            DBLog.Error("微信SetWechatSubscribe错误", "", Utils.ToString(ex));
                        }
                        return xmlTool.ContentResult(@"欢迎关注猫市商城微信公众号
            
1、<a href =""https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7bc02d72ed9eac47&redirect_uri=https://shop.591malls.com/&response_type=code&scope=snsapi_base&state=s#wechat_redirect"">进入猫市商城</a>
            
2、<a href =""https://shop.591malls.com/Share/AutoLogin?ReturnUrl=/UserAbout/myCoupon"">领取新人大礼包</a>

3、<a href =""http://igushi-sh.com/"">领取打车红包</a>

4、<a href =""http://a.app.qq.com/o/simple.jsp?pkgname=com.malls.oto.tob&g_f=991653"">下载生意助手</a>");

                    }
                    else if (xmlTool["Event"] == "unsubscribe")
                    {
                        try
                        {
                            ApiHelper.Request("WeChat/SetWechatSubscribe", new
                                          {
                                              openId = openId,
                                              isSubscribe = false
                                          });
                        }
                        catch (Exception ex)
                        {
                            DBLog.Error("微信SetWechatSubscribe错误", "", Utils.ToString(ex));
                        }
                    }
                }
                else if (msgType == "text")
                {
                    var content = xmlTool["Content"];
                    //  var content = VerifyCode;
                    if (content.ToUpper().Trim().StartsWith("BD"))
                    {
                        var res = ApiHelper.Request("BookingDrawActivity/GetBookingDrawJoinByVerifyCode", new
                        {
                            VerifyCode = content
                        });
                        if (!res["isBizSuccess"])
                        {
                            return xmlTool.ContentResult(res["bizErrorMsg"]);
                        }
                        string resItems = "";
                        if (res["data"]["joinStatus"] == 20)
                        {
                            return xmlTool.ContentResult("你已经领取过了");
                        }
                        if (res["data"]["joinStatus"] != 10)
                        {
                            return xmlTool.ContentResult("领取状态不正确");
                        }
                        foreach (var item in res["data"]["joinItems"])
                        {
                            if (!string.IsNullOrEmpty(resItems))
                            {
                                resItems += " 和 ";
                            }
                            resItems += "“" + item["couponTitle"] + "”";
                        }
                        if (string.IsNullOrEmpty(resItems))
                        {
                            return xmlTool.ContentResult("很遗憾你没有中奖");
                        }
                        return xmlTool.ContentResult(
       string.Format(@"恭喜您获得{0}

<a href =""{1}/Share/Arrive?ReferrerUserId=0&ReturnUrl=/Activity/ReceiveBookingDraw?VerifyCode={2}"">点击即可领取</a>",
      resItems, System.Configuration.ConfigurationManager.AppSettings["WXMVCUrl"], content)
       );

                    }

                }
                return null;
            }
            catch (Exception ex)
            {
                DBLog.Error("微信请求错误", "", Utils.ToString(ex));
                return null;
            }
        }

    }
}