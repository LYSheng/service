using System;
using System.ComponentModel.Composition.Hosting;
using System.Web.Mvc;

namespace H5.Core
{
    /// <summary>
    /// MEF配置
    /// </summary>
    public static class MefConfig
    {
        /// <summary>
        /// 注册MEF
        /// </summary>
        public static void RegisterMef()
        {
            var catalog = new DirectoryCatalog(AppDomain.CurrentDomain.SetupInformation.PrivateBinPath);
            var resolver = new MefDependencySolver(catalog);
            // Install MEF dependency resolver for MVC
            DependencyResolver.SetResolver(resolver);
            // Install MEF dependency resolver for Web API
            System.Web.Http.GlobalConfiguration.Configuration.DependencyResolver = resolver;
        }
    }
}
