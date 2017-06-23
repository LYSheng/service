using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Primitives;
using System.Web;
using System.Web.Http.Dependencies;

namespace H5.Core
{
    /// <summary>
    /// MEF依赖注入
    /// </summary>
    public class MefDependencySolver : IDependencyResolver, System.Web.Mvc.IDependencyResolver
    {
        private readonly ComposablePartCatalog _catalog;
        private const string HttpContextKey = "MEFContainerKey";

        /// <summary>
        /// 构造方法
        /// </summary>
        /// <param name="catalog"></param>
        public MefDependencySolver(ComposablePartCatalog catalog)
        {
            _catalog = catalog;
        }

        /// <summary>
        /// 容器
        /// </summary>
        public CompositionContainer Container
        {
            get
            {
                if (!HttpContext.Current.Items.Contains(HttpContextKey))
                {
                    HttpContext.Current.Items.Add(HttpContextKey, new CompositionContainer(_catalog));
                }
                CompositionContainer container = (CompositionContainer)HttpContext.Current.Items[HttpContextKey];
                HttpContext.Current.Application["MEFContainer"] = container;
                return container;
            }
        }

        #region IDependencyResolver Members

        /// <summary>
        /// 获得服务对象
        /// </summary>
        /// <param name="serviceType">服务类型</param>
        /// <returns>服务对象</returns>
        public object GetService(Type serviceType)
        {
            string contractName = AttributedModelServices.GetContractName(serviceType);
            return Container.GetExportedValueOrDefault<object>(contractName);
        }

        /// <summary>
        /// 获得服务对象集合
        /// </summary>
        /// <param name="serviceType">服务类型</param>
        /// <returns>服务对象集合</returns>
        public IEnumerable<object> GetServices(Type serviceType)
        {
            return Container.GetExportedValues<object>(serviceType.FullName);
        }

        /// <summary>
        /// 开始解析范围
        /// </summary>
        /// <returns>依赖范围</returns>
        public IDependencyScope BeginScope()
        {
            return this;
        }

        /// <summary>
        /// 释放资源
        /// </summary>
        public void Dispose()
        {

        }

        #endregion


    }
}
