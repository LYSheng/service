using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Dispatcher;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Common;
using H5.App_Start;
using H5.Core;
using H5.Filters;

using Model;
using Service.Site;
using Tonglu.Cache;
using Tonglu.CommonService.PlatService;
using Tonglu.ServiceLocator;
using Microsoft.Practices.Unity;

namespace H5
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            var unityContainer = MyServiceLocator.Instance.GetContainer();
            unityContainer.RegisterType<Common.RequestModel, Common.RequestModel>(new PerThreadLifetimeManager());
            GlobalConfiguration.Configuration.Services.Replace(typeof(IHttpControllerActivator), new UnityHttpControllerActivator(unityContainer));
            Tonglu.Logging.LoggingFactory.Initialize();

            InitiCache();

            //注册模板引擎
            //ViewEngines.Engines.Clear();
            //ViewEngines.Engines.Insert(0, new ThemeEngine());

            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            GlobalFilters.Filters.Add(new ReferrerFilterAttribute());
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);

            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //初始化数据
            InitData();
            Common.DBLog.Handle("Application_Start", "", "");

        }
        protected void Application_End(object sender, EventArgs e)
        {
            Common.DBLog.Handle("Application_End", "", "");
            Common.DBLog.Flush();
        }
        /// <summary>
        /// 初始化数据
        /// </summary>
        public static void InitData()
        {
            //ConfigService contract = new ConfigService();
            //var result = contract.Get();
            //if (result.IsSuccess)
            //{
            //    GlobalData.ImgHost = result.Data.FileHost;
            //    GlobalData.ScoreRate = result.Data.ScoreRmbRate;
            //    GlobalData.BizNoPayCancelHour = result.Data.BizNoPayCancelHour;
            //    GlobalData.BizNoPayCancelHourForTimeLimit = result.Data.BizNoPayCancelHourForTimeLimit;

            //}
            //else
            {
                GlobalData.ImgHost = ConfigurationManager.AppSettings["ImgHost"];
                GlobalData.ScoreRate = 0.01m;
            }
            GlobalData.OrderNoFormat = ConfigurationManager.AppSettings["OrderNoFormat"];

            DebugInit();
            ReleaseInit();
        }

        /// <summary>
        /// 初始化缓存配置
        /// </summary>
        static void InitiCache()
        {
            var socket = PlatBiz.GetSockets().FirstOrDefault(x => x.SocketKey == "Memcached");
            if (socket == null) return;
            CacheProvider.Initialize();

            var config = new SocketPoolConfiguration
            {
                MinPoolSize = socket.MinPoolSize.TryInt(),
                MaxPoolSize = socket.MaxPoolSize.TryInt(),
                ConnectionTimeout = TimeSpan.Parse(socket.ConnectionTimeout.TryString("00:00:10")),
                ReceiveTimeout = TimeSpan.Parse(socket.ReceiveTimeout.TryString("00:00:10")),
                DeadTimeout = TimeSpan.Parse(socket.DeadTimeout.TryString("00:00:10")),
                QueueTimeout = TimeSpan.Parse(socket.QueueTimeout.TryString("00:00:00.100")),
                FailurePolicyFactoryString = socket.PolicyFactory.TryString()
            };
            var servers = socket.Servers.TryString();
            var list = servers.Split(';');
            foreach (var server in list)
            {
                var arr = server.Split(':');
                config.ServerList = new List<CachedServer>
                    {
                        new CachedServer
                            {
                                Host = arr[0], Port = arr[1].TryInt()
                            }
                    };
            }
            CacheProvider.ConfigureServerCache(config);
        }


        /// <summary>
        /// Release版本初始化
        /// </summary>
        [Conditional("TRACE")]
        public static void ReleaseInit()
        {

        }

        /// <summary>
        /// Debug版本初始化
        /// </summary>
        [Conditional("DEBUG")]
        public static void DebugInit()
        {

        }
    }
}