using System;
using System.IO;
using System.Text;
using System.Web.Mvc;
using H5.Controllers;

namespace H5.Areas.Log.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            var folder = Server.MapPath("~/Log/");
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }
            var content = string.Empty;
            var path = folder + DateTime.Today.ToString("yyyy-MM-dd") + ".txt";
            if (System.IO.File.Exists(path))
                content = System.IO.File.ReadAllText(path, Encoding.Default);
            ViewBag.Content = content;
            return View();
        }

    }
}
