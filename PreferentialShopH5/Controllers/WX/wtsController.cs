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
    public class wtsController : Controller
    {
        /// <summary>
        /// 授权返回页面
        /// </summary>
        /// <param name="code"></param>
        /// <param name="userId"></param>
        /// <param name="orderId"></param>
        /// <returns></returns>
        [ValidateInput(false)]
        public void WeChatAuthorize(string code,string rtnurl)
        {
            var backUrl = "http://wts.liningit.com/fui/Share/Arrive";
            if(!string.IsNullOrEmpty(rtnurl))
            {
                backUrl=rtnurl;
            }
            Tonglu.Logging.LoggingFactory.GetLogger("WtsUrl").Error(backUrl);
            backUrl = backUrl + (backUrl.IndexOf("?") > -1 ? "&" : "?") + "code=" + code;
            Response.Redirect(backUrl);
        }
	}
}