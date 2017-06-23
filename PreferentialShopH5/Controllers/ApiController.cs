using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Common;
using Model;
using System.Web.Script.Serialization;
using Service.Site;
using System.Web.Security;

namespace H5.Controllers
{
    public class ApiController : BaseController
    {
        static List<string> lstApi = new List<string>() 
        { 
            "Home/GetHomeData", 
            "ActionInfo/GetActionDeteilList", 
            "product/ProductPraise",
            "Home/GetHomeNotice",
            "User/Login3_1",
            "Promotion/QueryPromotion", 
            "Cart/RemoveCart", 
            "User/UpdateUserInfo",
            "UserAddress/SetDefault",
            "Activity/GetActivityProductDetails",
            "Activity/AddPromotionSkuToCart",
            "UserAddress/UpdateOrAdd",
            "UserAddress/Delete", 
            "Basic/AreaGets", 
            "ServiceUser/Login" 
        };

        static Dictionary<string, string> userIdNameDt = new Dictionary<string, string>() { 
            { "Home/GetHomeData", "UserId" },
            { "Activity/AddPromotionSkuToCart", "BuyerUserId" },
            { "Coupon/GetWaitReceive", "currentUserId" },
            { "Coupon/GetMyCoupon", "currentUserId" },
            { "Coupon/GetCanUseCoupon", "currentUserId" }
        };

        static Dictionary<string, Action<dynamic, dynamic>> actions = new Dictionary<string, Action<dynamic, dynamic>>(){
           {"ServiceUser/Login",(o,p)=>{
            if (p["data"]!=null)
            {
                var userId = p["data"]["userId"];
                if (userId>0)
                { 
                    
                    WebHelper4H5.SetAuthCookie(userId.ToString(), DateTime.Now.AddDays(30), false, new CurrentUser
                    {
                        UserId = userId,
                        NickName = p["data"]["nickName"],
                        Phone = p["data"]["phone"],
                        UserPic = p["data"]["userPic"],
                        UerIdentityList = p["data"]["uerIdentityList"]
                    }.ToJSON(), p["data"]["userSign"]);    
                }
            }
        }}
        };
        /// <summary>
        /// api请求
        /// </summary>
        /// <param name="method">方法</param>
        /// <param name="json">参数</param>
        /// <returns></returns>
        [ValidateInput(false)]
        public ActionResult Index(string method, string json)
        {
            if (!lstApi.Contains(method))
            {
                return Content(new { IsBizSuccess = false, BizErrorMsg = "没有该api" }.ToJSON(), "application/json");
            }
            var dateStamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            string sign = SecurityHelper.Sign(GlobalData.ApiVersion, GlobalData.ApiKey, dateStamp,
                GlobalData.ApiSecret);
            string userName = "";
            long adminId = 0;
            string userIdValue = "0";
            string userIdName = "UserId";
            if (userIdNameDt.ContainsKey(method)) userIdName = userIdNameDt[method];
            if (User.Identity.IsAuthenticated)
                userIdValue = User.Identity.Name;
            else
                userIdName = "Test";
            if (CurrentUser != null)
            {
                userName = CurrentUser.NickName;
                adminId = CurrentUser.UserId;
                if (!string.IsNullOrEmpty(userName))
                {
                    userName = userName.Replace("\n", "").Replace("\"", "").Replace("\\", "");
                }
            }
            string appFrom = "PreferentialShopH5";

            appFrom = appFrom.Replace("\n", "").Replace("\"", "").Replace("\\", "");
            string tempJson =
                string.Format("\"version\":\"{0}\",\"appKey\":\"{1}\",\"timeStamp\":\"{2}\",\"sign\":\"{3}\",\"currentUserName\":\"{4}\",\"{5}\":\"{6}\""
                 , "0.0.1", GlobalData.ApiKey, dateStamp, sign, userName, userIdName, userIdValue);
            if (json.Length > 2)
            {
                tempJson += ",";
            }
            json = json.Insert(1, tempJson);
            try
            {
                var result = WebRequestPost(Method.POST, GlobalData.ApiUrl + method, "application/json", json);
                if (actions.ContainsKey(method))
                {
                    JavaScriptSerializer jss = new JavaScriptSerializer();
                    var o = jss.Deserialize<dynamic>(json);
                    var p = jss.Deserialize<dynamic>(result);
                    if (p["isBizSuccess"])
                    {
                        actions[method](o, p);
                        //if (method == "User/Register3_1")
                        //{
                        //    HttpCookie IsHasCoupons = new HttpCookie("IsHasCoupons");
                        //    IsHasCoupons.Value = p["data"]["stdclass"]["list"]["isHasCoupons"];
                        //    IsHasCoupons.Expires = DateTime.Now.AddDays(30);
                        //    Response.Cookies.Add(IsHasCoupons);
                        //}
                    }
                }
                try
                {
                    if (result.Contains("\"errCode\":\"10006\""))
                    {
                        FormsAuthentication.SignOut();
                        for (int i = 0; i < Request.Cookies.Count; i++)
                        {
                            Response.Cookies[Request.Cookies[i].Name].Expires = DateTime.Now.AddDays(-1);
                        }
                    }
                }
                catch (Exception ex)
                {
                }
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {

                return Content(new { IsBizSuccess = false, BizErrorMsg = ex.Message }.ToJSON(), "application/json");
            }
        }

        [HttpPost]
        public ActionResult GetAccessToken(string wxappid, string wxsecre)
        {
            if (wxappid != wxService.wxappid || wxsecre != wxService.wxsecre)
            {
                throw new Exception("参数不正确");
            }
            return Content(wxService.getAccessToken());
        }
        public enum Method { GET, POST };

        /// <summary>
        /// 发起web请求
        /// </summary>
        /// <param name="method">请求方式：GET，POST</param>
        /// <param name="url">请求地址</param>
        /// <param name="contentType"></param>
        /// <param name="postData">请求方式为POST时，传入请求数据</param>
        /// <param name="cookie">如果需要cookie则传入，否则传入null即可</param>
        /// <returns></returns>
        public static string WebRequestPost(Method method, string url, string contentType = null, string postData = null, Cookie cookie = null)
        {
            HttpWebRequest webRequest = null;

            string responseData = "";

            webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            webRequest.Method = method.ToString();
            webRequest.ServicePoint.Expect100Continue = false;
            webRequest.KeepAlive = true;

            webRequest.Headers.Add("AppFrom", "PreferentialShopH5");
            webRequest.Headers.Add("ClientUserAgent", System.Web.HttpContext.Current.Request.UserAgent);
            webRequest.Headers.Add("ClientIP", System.Web.HttpContext.Current.Request.UserHostAddress);
            webRequest.Headers.Add("CurrentUserId", CurrentUser.Instance.UserId.ToString());
            var userSignCookie = System.Web.HttpContext.Current.Request.Cookies["UserSign"];
            if (userSignCookie != null)
            {
                webRequest.Headers.Add("UserSign", userSignCookie.Value);
            }
            if (cookie != null)
            {
                webRequest.CookieContainer = new CookieContainer();
                webRequest.CookieContainer.Add(cookie);
            }

            if (method == Method.POST)
            {
                if (string.IsNullOrEmpty(contentType))
                {
                    webRequest.ContentType = "application/x-www-form-urlencoded";
                }
                else
                {
                    webRequest.ContentType = contentType;
                }

                if (!string.IsNullOrEmpty(postData))
                {
                    StreamWriter requestWriter = null;
                    requestWriter = new StreamWriter(webRequest.GetRequestStream());
                    try
                    {
                        requestWriter.Write(postData);
                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
                    finally
                    {
                        requestWriter.Close();
                        requestWriter = null;
                    }
                }
            }

            responseData = WebResponseGet(webRequest);
            webRequest = null;

            return responseData;
        }

        private static string WebResponseGet(HttpWebRequest webRequest)
        {
            StreamReader responseReader = null;
            string responseData = "";

            try
            {
                responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
                responseData = responseReader.ReadToEnd();
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                if (responseReader != null)
                {
                    responseReader.Close();
                    responseReader = null;
                }
            }

            return responseData;
        }

    }
}
