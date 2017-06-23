using System;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Common;
using H5.Controllers;
using Model;
using System.Collections;
using System.Collections.Generic;

namespace H5.Filters
{
    /// <summary>
    /// 验证身份过滤器
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class AuthorizationAttribute : AuthorizeAttribute
    {
        /// <summary>
        /// 当前登录的会员
        /// </summary>
        public CurrentUser CurrentUser
        {
            get
            {
                var json = WebHelper4H5.GetAuthData();
                if (string.IsNullOrEmpty(json)) return null;
                return JsonHelper.ParseJSON<CurrentUser>(json);
            }
        }

        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var routeData = filterContext.RouteData;
            var cname = routeData.Values["controller"].ToString();
            var aname = routeData.Values["action"].ToString();
            if (Pass(cname, aname)) return;
            HttpContext.Current.Session["returnUrl"] = filterContext.RequestContext.HttpContext.Request.UrlReferrer;
            if (CurrentUser == null)
            {
                //是否是ajax提交
                if (filterContext.HttpContext.Request["_ajax"] == "true")
                {
                    var contentResult = new ContentResult();
                    var result = new Result {ErrMsg = "MustLogin"};
                    var json = result.ToJSON();
                    contentResult.Content = json;
                    contentResult.ContentType = "application/Json";
                    filterContext.Result = contentResult;
                }
                else
                {
                    var content = new ContentResult
                    {
                        Content = string.Format(
                            "<script type='text/javascript'>window.top.location.href='{0}';</script>",
                            FormsAuthentication.LoginUrl)
                    };
                    filterContext.Result = content;
                }
            }
        }

        /// <summary>
        /// 通过认证
        /// </summary>
        /// <param name="cname">control名</param>
        /// <param name="aname">action名</param>
        /// <returns>true：需要认证；false 不需要认证</returns>
        private static bool Pass(string cname, string aname)
        {
            var listCname = new List<string> { "user" };
            var listAname = new List<string> { "index", "getuserinfo" };
            return listCname.Contains(cname.ToLower()) && listAname.Contains(aname.ToLower());
        }
    }
}
