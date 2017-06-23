using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;
using Microsoft.Practices.Unity;

namespace H5.Filters
{
    /// <summary>
    /// 
    /// </summary>
    public class UnityHttpControllerActivator : IHttpControllerActivator
    {
        /// <summary>
        /// 
        /// </summary>
        public IUnityContainer UnityContainer { get; private set; }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="unityContainer"></param>
        public UnityHttpControllerActivator(IUnityContainer unityContainer)
        {
            this.UnityContainer = unityContainer;
        }

        public IHttpController Create(HttpRequestMessage request, HttpControllerDescriptor controllerDescriptor, Type controllerType)
        {
            return (IHttpController)this.UnityContainer.Resolve(controllerType);
        }
    }
}