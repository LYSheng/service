using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Common;
using H5.Filters;

namespace H5.Controllers
{
    /// <summary>
    /// 基础控制器
    /// </summary>
    [Error]
    [Validate]
    public class BaseController : Controller
    {
        /// <summary>
        /// 返回 Camel 格式的 Json 数据
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public ActionResult JsonCamel(object data)
        {
            return new JsonCamelResult(data);
        }

        /// <summary>
        /// 返回 Camel 格式的 Json 数据，可以指定JsonRequestBehavior
        /// Added By Li Yongchun 2015/11/11
        /// </summary>
        /// <param name="data"></param>
        /// <param name="jsonRequestBehavior"></param>
        /// <returns></returns>
        public ActionResult JsonCamel(object data,JsonRequestBehavior jsonRequestBehavior)
        {
            return new JsonCamelResult(data, jsonRequestBehavior);
        }
        /// <summary>
        /// 当前登录的会员
        /// </summary>
        public Model.CurrentUser CurrentUser
        {
            get
            {

                var json = WebHelper4H5.GetAuthData();
                if (string.IsNullOrEmpty(json)) return null;
                return JsonHelper.ParseJSON<Model.CurrentUser>(json);
            }
        }
    }
}
