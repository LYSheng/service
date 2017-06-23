using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Service.Site;
using Service;
using Common;
using Model;
using Senparc.Weixin.MP.AdvancedAPIs;
using System.Threading;
using System.Configuration;
namespace H5.Controllers
{
    public class ShareController : BaseController
    {
        public string RequestKey { get { return RequestModel.GetRequestModel().RequestKey; } }
        public ActionResult AutoLogin()
        {
            string returnUrl = "";
            try
            {
                HttpCookie cookieIsAutoLogined = Request.Cookies.Get("IsAutoLogined");
                if (cookieIsAutoLogined == null)
                {
                    cookieIsAutoLogined = new HttpCookie("IsAutoLogined", "1");
                    cookieIsAutoLogined.Expires = DateTime.Now.AddMinutes(15);
                    Response.Cookies.Add(cookieIsAutoLogined);
                }
                return AutoLoginTemp(out returnUrl);
            }
            catch (Exception ex)
            {
                DBLog.Error("AutoLoginError", "", FrontSDK.Utils.ExceptionTool.ToString(ex));
                return Redirect(returnUrl);
            }
        }
        private void SetReferrerUserId()
        {
            try
            {
                if (!string.IsNullOrEmpty(Request["ReferrerUserId"]))
                {
                    var cookieReferrerUserId = Request.Cookies.Get("referrerUserId");
                    if (cookieReferrerUserId == null)
                    {
                        cookieReferrerUserId = new HttpCookie("referrerUserId", Request["ReferrerUserId"]);
                    }
                    cookieReferrerUserId.Value = Request["ReferrerUserId"];
                    cookieReferrerUserId.Expires = DateTime.Now.AddDays(30);
                    Response.Cookies.Add(cookieReferrerUserId);
                }
                var cookieServiceStoreUserId = Request.Cookies.Get("serviceStoreUserId");
                if (CurrentUser.Instance.UserId <= 0 && !string.IsNullOrEmpty(Request["serviceStoreUserId"]))
                {
                    cookieServiceStoreUserId = new HttpCookie("serviceStoreUserId", Request["serviceStoreUserId"]);
                    cookieServiceStoreUserId.Expires = DateTime.Now.AddDays(30);
                    Response.Cookies.Add(cookieServiceStoreUserId);
                }
                else
                {
                    var serviceStoreUserId = Request["serviceStoreUserId"];
                    if (string.IsNullOrEmpty(serviceStoreUserId) && cookieServiceStoreUserId != null)
                    {
                        serviceStoreUserId = cookieServiceStoreUserId.Value;
                    }
                    var res = ApiHelper.Request("MyWallet/GetMySelServiceStore", new
                    {
                        RequestKey = RequestKey,
                        ServiceStoreUserId = serviceStoreUserId,
                        IsShare = true
                    });
                    if (res["isBizSuccess"] == true)
                    {
                        long selServiceStoreUserId = 0;

                        long.TryParse(res["data"]["serviceStoreUserId"], out selServiceStoreUserId);
                        DBLog.Process("GetServiceStoreUserId", "", selServiceStoreUserId.ToString(), CurrentUser.Instance.UserId.ToString());
                        if (selServiceStoreUserId > 0)
                        {
                            cookieServiceStoreUserId = new HttpCookie("serviceStoreUserId", selServiceStoreUserId.ToString());
                            cookieServiceStoreUserId.Expires = DateTime.Now.AddDays(30);
                            Response.Cookies.Add(cookieServiceStoreUserId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DBLog.Error("SetReferrerUserIdError", "", Utils.ToString(ex));
            }
        }
        public ActionResult AutoLoginTemp(out string returnUrl)
        {
            returnUrl = Request["ReturnUrl"];
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = "/Home/Index";
            }
            SetReferrerUserId();

            if (!WebHelper.IsWeiXin(Request))
            {
                return Redirect(returnUrl);
            }
            if (CurrentUser.Instance.UserId > 0 && Request.Cookies.Get("OpenId") != null)
            {
                return Redirect(returnUrl);
            }
            string nowUrl = WebConfig.WXMVCUrl + "/Share/AutoLogin?ReturnUrl=" + HttpUtility.UrlEncode(returnUrl);
            var _WeChatAuthorizeUrl = ConfigurationManager.AppSettings["WeChatAuthorizeUrl"];
            if (!string.IsNullOrEmpty(_WeChatAuthorizeUrl))
            {
                nowUrl = _WeChatAuthorizeUrl + HttpUtility.UrlEncode(nowUrl);
            }


            string openId = "";

            string code = Request.QueryString["code"];
            if (string.IsNullOrEmpty(code))
            {
                return Redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wxService.wxappid + "&redirect_uri=" +
                    HttpUtility.UrlEncode(nowUrl) + "&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect");
            }
            OAuthAccessTokenResult oauthdata = null;
            try
            {
                oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
            }
            catch (Exception ex)
            {
                DBLog.Error("GetIsSubscribeOAuthAccessTokenResultError", "", Utils.ToString(ex));
                Thread.Sleep(1000);
                oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
            }
            if (oauthdata.errcode != 0)
            {
                DBLog.Error("GetIsSubscribeAauthdataError", "", oauthdata.errmsg);
                return Redirect(returnUrl);
            }

            openId = oauthdata.openid;
            HttpCookie cookieOpenId = Request.Cookies.Get("OpenId");
            if (cookieOpenId == null)
            {
                cookieOpenId = new HttpCookie("OpenId", openId);
            }
            cookieOpenId.Value = openId;
            cookieOpenId.Expires = DateTime.Now.AddDays(30);
            Response.Cookies.Add(cookieOpenId);
            string errCode;
            if (!LoginByOpenId(oauthdata, out errCode))
            {
                DBLog.Process("NotLoginByOpenId", "", errCode);
            }
            HttpCookie cookieIsAutoLogined = Request.Cookies.Get("IsAutoLogined");
            if (cookieIsAutoLogined == null)
            {
                cookieIsAutoLogined = new HttpCookie("IsAutoLogined", "1");
            }
            cookieIsAutoLogined.Value = openId;
            cookieIsAutoLogined.Expires = DateTime.Now.AddMinutes(15);
            Response.Cookies.Add(cookieIsAutoLogined);
            SetReferrerUserId();
            return Redirect(returnUrl);

        }
        public ActionResult GetIsSubscribe()
        {
            string returnUrl = Request["ReturnUrl"];
            string nowUrl = WebConfig.WXMVCUrl + "/Share/GetIsSubscribe?ReturnUrl=" + HttpUtility.UrlEncode(returnUrl);
            var _WeChatAuthorizeUrl = ConfigurationManager.AppSettings["WeChatAuthorizeUrl"];
            if (!string.IsNullOrEmpty(_WeChatAuthorizeUrl))
            {
                nowUrl = _WeChatAuthorizeUrl + HttpUtility.UrlEncode(nowUrl);
            }
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = "/Home/Index";
            }
            HttpCookie cookieOpenId = Request.Cookies.Get("OpenId");
            string openId = "";
            if (cookieOpenId != null)
            {
                openId = cookieOpenId.Value;
            }
            else
            {
                string code = Request.QueryString["code"];
                if (string.IsNullOrEmpty(code))
                {
                    return Redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wxService.wxappid + "&redirect_uri=" +
                        HttpUtility.UrlEncode(nowUrl) + "&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect");
                }
                OAuthAccessTokenResult oauthdata = null;
                try
                {
                    oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
                }
                catch (Exception ex)
                {
                    DBLog.Error("GetIsSubscribeOAuthAccessTokenResultError", "", Utils.ToString(ex));
                    Thread.Sleep(1000);
                    oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
                }
                if (oauthdata.errcode != 0)
                {
                    DBLog.Error("GetIsSubscribeAauthdataError", "", oauthdata.errmsg);
                    return Content("错误：" + oauthdata.errmsg);
                }
                openId = oauthdata.openid;
                cookieOpenId = new HttpCookie("OpenId", openId);
                cookieOpenId.Expires = DateTime.Now.AddDays(30);
                Response.Cookies.Add(cookieOpenId);
            }
            string accessToken = wxService.getAccessToken();
            var userInfo = Senparc.Weixin.MP.AdvancedAPIs.User.Info(accessToken, openId);

            ApiHelper.Request("WeChat/SetWechatSubscribe", new
            {
                openId = openId,
                isSubscribe = userInfo.subscribe != 0
            });
            return Redirect(returnUrl);
        }

        public ActionResult Arrive()
        {
            string returnUrl = "";
            try
            {
                return ArriveTemp(out returnUrl);
            }
            catch (Exception ex)
            {
                DBLog.Error("ArriveError", "", FrontSDK.Utils.ExceptionTool.ToString(ex));
                return Redirect(returnUrl);

            }
        }
        private ActionResult ArriveTemp(out string returnUrl)
        {
            SetReferrerUserId();
            DBLog.Process("ShareUrl", "", Request.Url.AbsoluteUri);
            returnUrl = Request["ReturnUrl"];
            string nowUrl = WebConfig.WXMVCUrl + "/Share/Arrive?ReferrerUserId=" + Request["ReferrerUserId"] + "&ReturnUrl=" + HttpUtility.UrlEncode(returnUrl);
            var _WeChatAuthorizeUrl = ConfigurationManager.AppSettings["WeChatAuthorizeUrl"];
            if (!string.IsNullOrEmpty(_WeChatAuthorizeUrl))
            {
                nowUrl = _WeChatAuthorizeUrl + HttpUtility.UrlEncode(nowUrl);
            }

            if (!WebHelper.IsWeiXin(Request))
            {
                if (string.IsNullOrEmpty(returnUrl))
                {
                    returnUrl = "/Account/newregister?ReturnUrl=/Account/AppDownload";
                }
                return Redirect(returnUrl);
            }
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = "/Home/Index";
            }


            if (CurrentUser != null && CurrentUser.UserId > 0 && Request.Cookies.Get("OpenId") != null)
            {
                return Redirect(returnUrl);
            }
            HttpCookie cookieOpenId = Request.Cookies.Get("OpenId");
            string code = Request.QueryString["code"];
            if (string.IsNullOrEmpty(code))
            {
                return Redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wxService.wxappid + "&redirect_uri=" + HttpUtility.UrlEncode(nowUrl +
                    "&IsSnsapi_userinfoed=" + Request["IsSnsapi_userinfoed"]) + "&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect");
            }
            OAuthAccessTokenResult oauthdata = null;
            try
            {
                oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
            }
            catch (Exception ex)
            {
                DBLog.Error("ArriveOAuthAccessTokenResultError", "", Utils.ToString(ex));
                Thread.Sleep(1000);
                oauthdata = Senparc.Weixin.HttpUtility.Get.GetJson<Senparc.Weixin.MP.AdvancedAPIs.OAuthAccessTokenResult>(string.Format(@"https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code", wxService.wxappid, wxService.wxsecre, code));
            }
            if (oauthdata.errcode != 0)
            {
                DBLog.Error("ArriveAauthdataError", "", oauthdata.errmsg);
                return Redirect(returnUrl);
            }
            if (cookieOpenId == null)
            {
                cookieOpenId = new HttpCookie("OpenId", oauthdata.openid);
            }
            cookieOpenId.Value = oauthdata.openid;
            cookieOpenId.Expires = DateTime.Now.AddDays(30);
            Response.Cookies.Add(cookieOpenId);
            if (CurrentUser != null && CurrentUser.UserId > 0)
            {
                return Redirect(returnUrl);
            }
            string errCode;
            if (LoginByOpenId(oauthdata, out errCode) || errCode == "HasAccount2OpenId")
            {
                SetReferrerUserId();
                return Redirect(returnUrl);
            }

            OAuthUserInfo oauthUserInfo = null;
            try
            {
                oauthUserInfo = Senparc.Weixin.HttpUtility.Get.GetJson<OAuthUserInfo>(string.Format(
    @"https://api.weixin.qq.com/sns/userinfo?access_token={0}&openid={1}&lang=zh_CN", oauthdata.access_token, oauthdata.openid));

            }
            catch (Exception ex)
            {
                //如果报错证明没有授权,则调整到授权界面
            }
            if (oauthUserInfo == null || string.IsNullOrEmpty(oauthUserInfo.nickname))
            {
                if (Request["IsSnsapi_userinfoed"] != "1")
                {
                    return Redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wxService.wxappid + "&redirect_uri=" + HttpUtility.UrlEncode(nowUrl +
                     "&IsSnsapi_userinfoed=1") + "&response_type=code&scope=snsapi_userinfo&state=snsapi_userinfo#wechat_redirect");
                }
            }
            string nickName = "";
            string cityName = "";
            string photo = "";

            if (oauthUserInfo != null)
            {
                nickName = oauthUserInfo.nickname;
                cityName = oauthUserInfo.city;
                photo = oauthUserInfo.headimgurl;
            }
            var res = ApiHelper.Request("User/Register3_1", new
            {
                RequestKey = RequestKey,
                OpenId = oauthdata.openid,
                Channel = FrontSDK.Enum.EnumChannel.H5,
                RegisterPlatform = 1000,
                NickName = nickName,
                CityName = cityName,
                Photo = photo,
                ReferrerUserId = Request["ReferrerUserId"],

            });
            if (res["isBizSuccess"] == true)
            {
                HttpCookie IsHasCoupons = new HttpCookie("IsHasCoupons");
                IsHasCoupons.Value = res["data"]["stdclass"]["list"]["isHasCoupons"];
                IsHasCoupons.Expires = DateTime.Now.AddDays(30);
                Response.Cookies.Add(IsHasCoupons);
                if (LoginByOpenId(oauthdata, out errCode))
                {
                    // return Redirect(returnUrl);
                }
                //  return Redirect(returnUrl);
            }
            if (res["errCode"] == "HasAccount2OpenId")
            {
                // return Redirect(returnUrl);
            }
            SetReferrerUserId();
            return Redirect(returnUrl);
        }


        private bool LoginByOpenId(OAuthAccessTokenResult oauthdata, out string errCode)
        {
            errCode = "";
            var userInfo = ApiHelper.Request("User/Login3_1", new
            {
                RequestKey = RequestKey,
                OpenId = oauthdata.openid,
                LoginSystem = 3
            });
            if (userInfo["isBizSuccess"] == true)
            {
                long userid = userInfo["data"]["stdclass"]["list"]["userId"];
                WebHelper4H5.SetAuthCookie(userid.ToString(), DateTime.Now.AddDays(30), false, new CurrentUser
                {
                    UserId = userid,
                    NickName = userInfo["data"]["stdclass"]["list"]["nickName"],
                    Phone = userInfo["data"]["stdclass"]["list"]["phone"],
                    UserPic = userInfo["data"]["stdclass"]["list"]["userPic"],
                    //ImgUrl = userInfo["data"]["stdclass"]["list"]["imgurl"]
                }.ToJSON(), userInfo["data"]["stdclass"]["list"]["userSign"]);
                return true;
            }
            errCode = userInfo["errCode"];
            return false;
        }

        public ActionResult AppAutoLogin(long? userId, string userSign, string returnUrl)
        {
            if (userId > 0 && CurrentUser.Instance.UserId != userId)
            {
                var userInfo = ApiHelper.Request("User/Login3_1", new
                {
                    RequestKey = RequestKey,
                    UserId = userId,
                    LoginUserSign = userSign,
                    LoginSystem = 3
                });
                DBLog.Process("AppAutoLogin", userId.GetValueOrDefault().ToString(), Request.UserAgent);
                if (userInfo["isBizSuccess"] == true)
                {
                    long userid = userInfo["data"]["stdclass"]["list"]["userId"];
                    WebHelper4H5.SetAuthCookie(userid.ToString(), DateTime.Now.AddDays(30), false, new CurrentUser
                    {
                        UserId = userid,
                        NickName = userInfo["data"]["stdclass"]["list"]["nickName"],
                        Phone = userInfo["data"]["stdclass"]["list"]["phone"],
                        UserPic = userInfo["data"]["stdclass"]["list"]["userPic"],
                        //ImgUrl = userInfo["data"]["stdclass"]["list"]["imgurl"]
                    }.ToJSON(), userInfo["data"]["stdclass"]["list"]["userSign"]);
                }
                else
                {
                    DBLog.Error("AppAutoLoginError", userId.GetValueOrDefault().ToString(), JsonHelper.ToJSON(userInfo));
                }
            }
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = "/";
            }
            return Redirect(returnUrl);
        }

    }
}