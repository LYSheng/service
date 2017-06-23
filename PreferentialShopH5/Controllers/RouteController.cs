using System;
using System.ComponentModel.Composition;
using System.Web.Mvc;
using System.Web.Security;
using Common;

using Model;
using Service.User;

namespace H5.Controllers
{

    public class RouteController : BaseController
    {
        private const string SECRET = "TLOTO";

        OpenUserService contract = new OpenUserService();

        /// <summary>
        /// IOS 路由处理
        /// </summary>
        /// <param name="userId">用户编号</param>
        /// <param name="dataTime">时间</param>
        /// <param name="sign">校验码</param>
        /// <param name="userName">手机号码</param>
        /// <param name="nickName">昵称</param>
        /// <param name="type">操作类型：topic-互动</param>
        /// <returns></returns>
        public ActionResult IOS(long userId, string dataTime, string sign, string userName, string nickName, string type = "topic")
        {
            var url = FormsAuthentication.DefaultUrl;
            var md5 = SecurityHelper.Md5(userId + dataTime + SECRET);
            if (md5 == sign.ToUpper())
            {
                var user = new CurrentUser
                {
                    UserId = userId,
                    NickName = nickName,
                    Phone = userName
                };
                WebHelper4H5.SetAuthCookie(userId.ToString(), DateTime.Now.AddDays(30), true, user.ToJSON());
                switch (type.ToLower())
                {
                    case "topic":
                        url = "/Topic/Index?include=1";
                        break;
                    case "tinyactivity":
                        url = "/Activity/SpinWin";
                        break;
                }
            }
            return Redirect(url);
        }

        /// <summary>
        /// 微信路由处理
        /// </summary>
        /// <param name="key">关键数据加密</param>
        /// <param name="returnUrl">跳转的页面</param>
        /// <returns></returns>
        public ActionResult WeChat(string key, string returnUrl)
        {
            var url = string.IsNullOrEmpty(returnUrl) ? FormsAuthentication.DefaultUrl : returnUrl;
            //解密参数
            var str = SecurityHelper.Decrypt(key);
            var dict = Utils.DecodeParams(str);
            var openId = dict["openId"];
            //判断是否绑定
            var result = contract.GetUserByWeChat(openId);
            if (result.IsSuccess)
            {
                WebHelper4H5.SetAuthCookie(result.Data.UserId.ToString(), DateTime.Now.AddDays(1), true, result.Data.ToJSON());
            }
            else
            {
                Session["WeChatKey"] = key;
            }

            return Redirect(url);
        }
    }
}
