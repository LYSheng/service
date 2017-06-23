using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TL.CacheHelper;
using Tonglu.Web.Utilities;

namespace H5.Site
{
    /// <summary>
    /// Cookie操作
    /// </summary>
    public class CookieOperate
    {
        /// <summary>
        /// 获取订单分享编码
        /// </summary>
        /// <returns></returns>
        public static string GetShareCodeCookie()
        {
           return  CookieHelper.GetCookieValue(CacheUserShare.ShareCode);
        }
    }
}