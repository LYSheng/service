using Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Service.Site;

namespace H5.Controllers
{
    public class ArbitraryGrabController : BaseController
    {
        // GET: ArbitraryGrab
        public ActionResult Index()
        {
            if (CurrentUser == null)
            {
                //活动参与人打开路径
                Session["MidAutumnFestivalActivityUrl"] = Request.Url.ToString();
                return Redirect("Account/Login");
            }
            if (!string.IsNullOrEmpty(Request.QueryString["FromUserId"]))
            {
                ViewBag.FromUserId = Request.QueryString["FromUserId"];
            }

            string accessToken = wxService.getAccessToken();
            string ticket = wxService.getTicket(accessToken);
            string timestamp = wxService.GetTimeStamp();
            string noncestr = wxService.NetxtString(new Random(), 16, false);
            string _sinature = "jsapi_ticket=" + ticket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + Request.Url.ToString();
            string signature = wxService.SHA1Sign(_sinature);
            ViewData["noncestr"] = noncestr;
            ViewData["timestamp"] = timestamp;
            ViewData["signature"] = signature;

            ViewBag.UserId = CurrentUser.UserId;
            return View();
        }
    }
}