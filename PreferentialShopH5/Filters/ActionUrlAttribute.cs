using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Mvc;


using Service.User;
using TL.CacheHelper;
using Common;


namespace H5.Filters
{
    /// <summary>
    /// 分销商分成
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ActionUrlAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {

            //var queryItem = filterContext.HttpContext.Request.QueryString;

            //foreach (var key in queryItem.AllKeys)
            //{
            //    if (key.Contains(CacheUserShare.ShareCode))
            //    {
            //        //ThreadPool.QueueUserWorkItem(new WaitCallback(TreadShareDeal), queryItem[key]);
            //        var shareCode = queryItem[key];
            //        switch (CacheUserShare.IsDisor(shareCode.ToString()))
            //        {
            //            case true:
            //                //放入cookie
            //                //WebHelper4H5.SetCookie("shareCode", shareCode.ToString(), DateTime.Now.Date.AddDays(1));
            //                Tonglu.Web.Utilities.CookieHelper.CreateCookie("shareCode", shareCode.ToString(), DateTime.Now.Date.AddDays(1));
            //                break;
            //            case false:
            //                contract.UserShareScoreSet(shareCode.ToString());
            //                break;
            //            default:
            //                break;
            //        }
            //    }
            //}

            base.OnActionExecuting(filterContext);
        }


    }


}