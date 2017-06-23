using Common;
using Service.Account;
using System;
using System.IO;
using System.Web;
using Tonglu.Logging;

namespace H5
{
    public class MobileLoginModule : IHttpModule
    {
        /// <summary>
        /// You will need to configure this module in the Web.config file of your
        /// web and register it with IIS before being able to use it. For more information
        /// see the following link: http://go.microsoft.com/?linkid=8101007
        /// </summary>
        #region IHttpModule Members

        public void Dispose()
        {
            //clean-up code here.
        }

        public void Init(HttpApplication context)
        {
            // Below is an example of how you can handle LogRequest event and provide 
            // custom logging implementation for it
            context.BeginRequest += context_BeginRequest;
        }

        /// <summary>
        /// 此处给移动端登录H5时使用
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void context_BeginRequest(object sender, EventArgs e)
        {
            //var ctx = sender as HttpApplication;
            //var mobileKey = ctx.Request["key"];
            //if (mobileKey != null)
            //{
            //    LoggingFactory.GetLogger("MobileLoginModule").Info(DateTime.Now.ToString() + "手机测试:" + mobileKey);
            //    AccountService service = new AccountService();
            //    var currentUser = service.CacheLogin(mobileKey);
            //    if (currentUser.IsSuccess)
            //    {
            //        if (currentUser.Data.UserId != 0)
            //            WebHelper4H5.SetAuthCookie(currentUser.Data.NickName,
            //                DateTime.Now.AddDays(1),
            //                true,
            //                currentUser.Data.ToJSON());
            //        LoggingFactory.GetLogger("MobileLoginModule").Info(DateTime.Now.ToString() + "结果" + currentUser.ToRawJSON());
            //    }
            //}
        }

        #endregion
    }
}
