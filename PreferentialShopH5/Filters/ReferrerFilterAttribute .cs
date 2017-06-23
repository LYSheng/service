using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace H5.Filters
{
    public class ReferrerFilterAttribute : ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            if (filterContext.RequestContext.HttpContext.Request.HttpMethod == "GET")
            {
                long currentUserId = CurrentUser.Instance.UserId;
                var requestModel = Common.RequestModel.GetRequestModel();
                requestModel.ClientIP = System.Web.HttpContext.Current.Request.UserHostAddress;
                requestModel.RequestKey = Guid.NewGuid().ToString();
                requestModel.RequestUrl = filterContext.RequestContext.HttpContext.Request.Url.AbsoluteUri;
                requestModel.BeginRequestTime = DateTime.Now;
                requestModel.CurrentUserId = currentUserId;

                var Request = filterContext.RequestContext.HttpContext.Request;
                var absoluteUri = Request.Url.AbsoluteUri;
                var upUrl = absoluteUri.ToUpper();
                if (!upUrl.Contains("/SHARE/") && !upUrl.Contains("RETURNURL"))
                {
                    if (string.IsNullOrEmpty(filterContext.RequestContext.HttpContext.Request["NowTempReferrerUserId"]))
                    {
                        if (absoluteUri.Contains("?"))
                        {
                            absoluteUri = absoluteUri + "&NowTempReferrerUserId=" + currentUserId;
                        }
                        else
                        {
                            absoluteUri = absoluteUri + "?NowTempReferrerUserId=" + currentUserId;
                        }
                        filterContext.Result = new RedirectResult(absoluteUri);
                        return;

                    }
                    else
                    {
                        int referrerUserId = 0;
                        int.TryParse(Request["ReferrerUserId"], out referrerUserId);
                        if (referrerUserId > 0 && referrerUserId != currentUserId)
                        {
                            var cookieReferrerUserId = Request.Cookies.Get("referrerUserId");
                            if (cookieReferrerUserId == null)
                            {
                                cookieReferrerUserId = new HttpCookie("referrerUserId", Request["ReferrerUserId"]);
                            }
                            cookieReferrerUserId.Value = Request["ReferrerUserId"];
                            cookieReferrerUserId.Expires = DateTime.Now.AddDays(30);
                            filterContext.RequestContext.HttpContext.Response.Cookies.Add(cookieReferrerUserId);
                        }
                    }
                }
            }
        }


    }
}