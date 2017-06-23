using Common;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace H5.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class LoginAuthorize : FilterAttribute, IAuthorizationFilter
    {
        public CurrentUser CurrentUser
        {
            get
            {
                var json = WebHelper4H5.GetAuthData();
                if (string.IsNullOrEmpty(json)) return null;
                return JsonHelper.ParseJSON<CurrentUser>(json);
            }
        }
        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.User.Identity.IsAuthenticated == false)
            {
                var skipAuthorize = filterContext.ActionDescriptor.IsDefined(typeof(AllowAnonymousAttribute), true) ||
    filterContext.ActionDescriptor.ControllerDescriptor.IsDefined(typeof(AllowAnonymousAttribute), true);
                if (skipAuthorize)
                {
                    return;
                }
                string url = string.Format("/{0}/{1}?isLogin=1&ReturnUrl={2}", "Account", "login", filterContext.RequestContext.HttpContext.Request.RawUrl);

                filterContext.Result = new RedirectResult("/Share/AutoLogin?ReturnUrl=" + filterContext.HttpContext.Server.UrlEncode(url));

            }
            else
            {
                var user = CurrentUser;
                if (user != null) filterContext.Controller.ViewBag.CurrentUser = user;
            }
        }
    }
}