using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Mvc;
using System.Configuration;

namespace H5.Core
{
    public class ThemeEngine : RazorViewEngine
    {
        static readonly string Theme = ConfigurationManager.AppSettings["Theme"];

        public override ViewEngineResult FindView(ControllerContext controllerContext, string viewName, string masterName, bool useCache)
        {
            ViewLocationFormats = new[] { "~/Themes/" + Theme + "/{1}/{0}.cshtml", "~/Themes/" + Theme + "/Shared/{0}.cshtml", "~/Areas/{2}/Views/{1}/{0}.cshtml" };
            return base.FindView(controllerContext, viewName, masterName, useCache);
        }

        public override ViewEngineResult FindPartialView(ControllerContext controllerContext, string partialViewName, bool useCache)
        {
            return FindView(controllerContext, partialViewName, null, useCache);
        }
    }
}