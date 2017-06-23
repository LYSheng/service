using System.Configuration;
using System.Web;
using System.Web.Optimization;

namespace H5.App_Start
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            string cdnDomain = ConfigurationManager.AppSettings["CDNDomain"];
            cdnDomain = cdnDomain ?? "";
            bundles.UseCdn = true;
#if DEBUG
            bundles.UseCdn = false;
#endif

            var theme = ConfigurationManager.AppSettings["Theme"];
            var skin = ConfigurationManager.AppSettings["Skin"];
            var h5Url = ConfigurationManager.AppSettings["H5Url"];

            bundles.Add(new ScriptBundle("~/bundles/scripts/core", h5Url).Include(
                        "~/Scripts/jquery-2.*",
                         "~/Scripts/jquery.validate.min.js",
                //"~/Scripts/jquery.mobile*",
                      "~/Scripts/jquery.cookie.js",
                         "~/Scripts/knockout*",
                         "~/Scripts/modernizr-*"));

            //bundles.Add(new ScriptBundle("~/bundles/scripts/plugin").Include(
            //            "~/Scripts/Plugin/iScroll/iscroll.js"
            //            ));

            bundles.Add(new ScriptBundle("~/bundles/scripts/biz", h5Url).Include(
                        "~/Content/Scripts/global.js"));

            //bundles.Add(new StyleBundle("~/Content/css")
            //        .Include(
            //            "~/Content/Themes/" + theme + "/Skin/" + skin + "/Styles/reset.css",
            //            "~/Content/Themes/" + theme + "/Skin/" + skin + "/Styles/common.css",
            //            "~/Content/Themes/" + theme + "/Skin/" + skin + "/Styles/error.css"
            //    //"~/Content/jquery.mobile.theme-1.2.0.min.css"
            //        ));
        }
    }
}