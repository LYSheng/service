using System;
using System.Web.Mvc;
using Tonglu.Logging;

//using log4net;
//using LogManager = log4net.LogManager;


namespace H5.Filters
{
    /// <summary>
    /// 错误异常过滤器
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ErrorAttribute : ActionFilterAttribute, IExceptionFilter
    {
        #region 日志

        /// <summary>
        /// 错误日志
        /// </summary>
        private ILog log = LoggingFactory.GetLogger(typeof(ErrorAttribute).FullName);

        #endregion

        /// <summary>
        /// 跳转的试图
        /// </summary>
        public string View { get; set; }

        public ErrorAttribute()
        {
            View = "Error";
        }

        /// <summary>
        /// 异常
        /// </summary>
        /// <param name="filterContext"></param>
        public void OnException(ExceptionContext filterContext)
        {
            //// 添加异常日志
            //var cname = filterContext.RouteData.Values["controller"].ToString();
            //var actionName = filterContext.RouteData.Values["action"].ToString();
            //if (error.InnerException != null)
            //    error = error.InnerException;
            //log.Error("ULR：/" + cname + "/" + actionName + "<br />Message：" + error.Message + "<br /><br />", error);

            var controllerName = (string)filterContext.RouteData.Values["controller"];
            var actionName = (string)filterContext.RouteData.Values["action"];
            var model = new HandleErrorInfo(filterContext.Exception, controllerName, actionName);
            var result = new ViewResult
            {
                ViewName = View,
                ViewData = new ViewDataDictionary<HandleErrorInfo>(model),
                TempData = filterContext.Controller.TempData
            };
            filterContext.Result = result;
         
            //filterContext.ExceptionHandled = true;
        }
    }
}