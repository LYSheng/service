using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Common;
using H5.Filters;
using Model;
using Newtonsoft.Json;

namespace H5.Controllers
{
    [Authorization]
    public class AuthorizeController : BaseController
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
    }
    /// <summary>
    /// 首页可以登录 但是其他操作需要验证 并且需要获得UID的Controller wj 2014-11-8 12:43:07
    /// </summary>
    public class NeedUIDNoAuthController : BaseController
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
    }

}
