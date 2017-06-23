using Common;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace H5.Controllers.WX
{
    public class WXPayInitController : Controller
    {
        //
        // GET: /WXPayInit/
        private static string H5Url = System.Configuration.ConfigurationManager.AppSettings["H5Url"];
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult PayComplete(string orderId, string orderCode, bool isSuccess = false)
        {
            ViewData["IsSuccess"] = isSuccess;
            ViewData["OrderCode"] = orderCode;
            ViewData["OrderId"] = orderId;
            ViewBag.H5Url = H5Url;
            return View();
        }
        /// <summary>
        /// 授权返回页面
        /// </summary>
        /// <param name="code"></param>
        /// <param name="userId"></param>
        /// <param name="orderId"></param>
        /// <returns></returns>
        [ValidateInput(false)]
        public void WeChatAuthorize(string code, long? userId, string orderId)
        {
            var weChatPayDomain = System.Configuration.ConfigurationManager.AppSettings["WeChatPayDomain"];
            var backUrl = weChatPayDomain + "WXPayInit/WeChatAuthorize";

            backUrl = backUrl + "?" + Request.QueryString;
            Response.Redirect(backUrl);
        }
    }
    public class WxOAuth
    {
        public string openid { get; set; }
    }

}