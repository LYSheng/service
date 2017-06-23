using System;
using System.Linq;
using System.Web.Mvc;
using WebGrease.Css.Extensions;

namespace H5.Filters
{
    /// <summary>
    /// 验证特性
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ValidateAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var modelState = filterContext.Controller.ViewData.ModelState;
            if (!modelState.IsValid)
            {
                modelState.Values.ForEach(x =>
                {
                    if (x.Errors.Count <= 0) return;
                    var first = x.Errors.FirstOrDefault();
                    if (first == null) return;
                    if (first.Exception != null)
                    {
                        throw first.Exception.InnerException ?? first.Exception;
                    }
                    throw new Exception(first.ErrorMessage);
                });
            }
            base.OnActionExecuting(filterContext);
        }
    }
}