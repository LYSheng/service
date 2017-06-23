using FrontSDK.ApiRequest;
using Service.Site;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Model;
using FrontSDK.Domain;
using Common;
using Service;
using FrontSDK.Base;
using H5.Filters;
using Tonglu.Web.Utilities;
using WebHelper = Common.WebHelper;

namespace H5.Controllers.Site
{
    [H5.Filters.LoginAuthorize]
    public class HomeController : BaseController
    {
        private HomeService service = new HomeService();
        /// <summary>
        /// 服务号首页
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View();
        }
        
    }
}