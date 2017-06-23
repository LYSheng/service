using Common;
using Model;
using Model.Account;
using Service;
using Service.Account;
using Service.Site;
using Service.User;
using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Security;


namespace H5.Controllers.Site
{

    public partial class AccountController : BaseController
    {
        //ILog Log = LoggingFactory.GetLogger(typeof(AccountController));

        public AccountService Service = new AccountService();


        public OpenUserService Contract = new OpenUserService();

        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            if (CurrentUser != null)
                if (CurrentUser.UserId != 0)
                {
                    WebHelper4H5.SetAuthCookie(CurrentUser.UserId.ToString(), DateTime.Now.AddDays(30), false, CurrentUser.ToJSON());
                    if (string.IsNullOrEmpty(returnUrl))
                    {
                        return Redirect("/Home/Index");
                    }
                    else
                    {
                        return Redirect(returnUrl);
                    }
                }

            return View();
        }
        [AllowAnonymous]
        public ActionResult AppDownload()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult forgetPwd()
        {
            return View();
        }
        [AllowAnonymous]
        public ActionResult member()
        {
            return View();
        }
        /// <summary>
        /// 流转化为数组
        /// </summary>
        /// <param name="stream"></param>
        /// <returns></returns>
        private byte[] StreamToBytes(Stream stream)
        {
            byte[] bytes = new byte[stream.Length];
            stream.Read(bytes, 0, bytes.Length);
            // 设置当前流的位置为流的开始 
            stream.Seek(0, SeekOrigin.Begin);
            return bytes;
        }
        public ActionResult UploadImage()
        {
            //string ss = Request.Form["uploadFile"]; 
            //return ss; 
            var context = this.HttpContext;
            HttpPostedFileBase uploadFile = Request.Files[0];
            string fileName = uploadFile.FileName;
            int fileSize = uploadFile.ContentLength;
            string fileExt = Path.GetExtension(fileName).ToLower();
            string message = "";
            HttpPostedFileBase postedFile = context.Request.Files[0];
            if (!(fileExt == ".png" || fileExt == ".gif" || fileExt == ".jpg" || fileExt == ".jpeg"))
            {
                message = "图片类型只能为gif,png,jpg,jpeg";
                return Content(new { IsSuccess = false, ErrMsg = message }.ToJSON(), "application/Json");
            }
            else
            {
                if (fileSize > (int)(5000 * 1024))
                {
                    message = "图片大小不能超过5000KB";
                    return Content(new { IsSuccess = false, ErrMsg = message }.ToJSON(), "application/Json");
                }
                else
                {
                    byte[] bytes = null;
                    bytes = StreamToBytes(postedFile.InputStream);
                    var suffix = fileName.Substring(fileName.LastIndexOf(".", StringComparison.Ordinal) + 1);
                    var memoryStream = new MemoryStream(bytes);
                    fileName = Rename() + "." + suffix;
                    MogileClient.UploadFile("Upload/" + fileName, memoryStream);
                    return Content(new { IsSuccess = true, ErrMsg = "", Data = "Upload/" + fileName }.ToJSON());
                }
            }
        }

        [AllowAnonymous]
        public ActionResult imgUpload()
        {
            var context = this.HttpContext;
            context.Response.ContentType = "text/json";
            var fileName = context.Request["name"];
            var folder = context.Server.MapPath("~/Upload/");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            try
            {
                var suffix = fileName.Substring(fileName.LastIndexOf(".", StringComparison.Ordinal) + 1);

                ////保存到本网站
                //using (var fs = File.Create(folder + "/" + file))
                //{
                //    file = Rename() + "." + suffix;
                //    byte[] bytes = Convert.FromBase64String(context.Request["data"]);
                //    fs.Write(bytes, 0, bytes.Length);
                //    context.Response.Write(new { IsSuccess = true, Data = "/Upload/" + file }.ToJSON());
                //}

                //上传到图片服务器
                byte[] bytes = Convert.FromBase64String(context.Request["data"]);
                var fileApiAppKey = System.Configuration.ConfigurationSettings.AppSettings["FileApiAppKey"];
                var fileApiAppSecret = System.Configuration.ConfigurationSettings.AppSettings["FileApiAppSecret"];
                var filApiClient = new FileCoreSDK.Client.FileCoreSDKClient(fileApiAppKey, fileApiAppSecret, GlobalData.ImgHost + "api/");
                FileCoreSDK.Utils.EnumImageSuffix enumImageSuffix;
                var imgPath = System.Configuration.ConfigurationManager.AppSettings["IMGHOST"];
                var result = filApiClient.Request(new FileCoreSDK.ApiRequest.ImageUploadRequest
                {
                    Files = bytes,
                    EnumImgSuffix = Enum.TryParse(suffix, true, out enumImageSuffix) ? enumImageSuffix : FileCoreSDK.Utils.EnumImageSuffix.JPG,
                    FilePath = "H5Pic"

                });           
                return Content(new { IsSuccess = result.IsBizSuccess, ErrMsg = result.BizErrorMsg, Data = imgPath + result.FileName }.ToJSON(), "application/Json");
            }
            catch (Exception ex)
            {
                return Content(new { IsSuccess = false, ErrMsg = ex.Message }.ToJSON(), "application/Json");
            }
        }
        public static string Rename()
        {
            var random = new Random();
            return DateTime.Now.Ticks + random.Next(100000, 999999).ToString(CultureInfo.InvariantCulture);
        }
        [AllowAnonymous]
        public ActionResult QqLogin()
        {
            return View();
        }
        [AllowAnonymous]
        public ActionResult WbLogin(string code)
        {
            ViewBag.code = code;
            return View();
        }

        [AllowAnonymous]
        public ActionResult WxLogin(string code)
        {
            ViewBag.code = code;
            return View();
        }
        [AllowAnonymous]
        [HttpPost]
        public ActionResult SuccessLogin()
        {
            //var openidCookie = Request.Cookies.Get("OpenId");
            //string openid = "";
            //if (openidCookie != null)
            //{
            //    openid = openidCookie.Value;
            //}
            //WebHelper4H5.SetAuthCookie(userId.ToString(), DateTime.Now.AddDays(1), true, new CurrentUser
            //{
            //    UserId = long.Parse(userId),
            //    NickName = nickName,
            //    Phone = phone
            //}.ToJSON());
            string returnUrl = FormsAuthentication.DefaultUrl;
            if (Request.UrlReferrer != null && !string.IsNullOrEmpty(Request.UrlReferrer.Query))
            {
                string query = Request.UrlReferrer.Query;
                if (query.IndexOf("ReturnUrl=") != -1)
                {
                    returnUrl = query.Substring(query.IndexOf("ReturnUrl=") + "ReturnUrl=".Length);
                }
            }

            #region 判段是否从中秋节活动页面跳转过来
            if (Session["MidAutumnFestivalActivityUrl"] != null)
            {
                returnUrl = Session["MidAutumnFestivalActivityUrl"].ToString();
                Session.Remove("MidAutumnFestivalActivityUrl");
            }
            #endregion

            #region 判段是否从摇一摇页面跳转过来
            if (Session["ActSharkItOffUrl"] != null)
            {
                returnUrl = Session["ActSharkItOffUrl"].ToString();
                Session.Remove("ActSharkItOffUrl");
            }
            #endregion

            var result = new { state = 1, url = returnUrl }.ToJSON();
            return Content(result, "application/Json");
        }
        [AllowAnonymous]
        [HttpPost]
        public ActionResult GetUserId()
        {
            string userId = "0";
            if (User.Identity.IsAuthenticated)
                userId = User.Identity.Name;
            var result = new { state = 1, userId = userId }.ToJSON();
            return Content(result, "application/Json");
        }
        public ActionResult WXqqLogin(string code)
        {
            var getAccessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxaf493e63a1ab4188&secret=007b35b876c4b1c842dfa1c6a3b1b203&code=" + code + "&grant_type=authorization_code";
            var request = WebRequest.Create(getAccessTokenUrl);
            request.Method = "POST";
            var response = request.GetResponse();
            var httprespons = (HttpWebResponse)response;
            if (httprespons.StatusCode != HttpStatusCode.OK)
            {
                //LoggingFactory.GetLogger("Trackering").Info(DateTime.Now + "物流跟踪测试StatusCode:" + httprespons.StatusCode);
                //return new RedirectResult("/Trackering/TrackError");
            }
            using (Stream stream = response.GetResponseStream())
            {
                var encode = Encoding.UTF8;
                var reader = new StreamReader(stream, encode);
                var detail = reader.ReadToEnd();
                //ViewBag.flowTrack = detail.ToRawJSON();
                var sina = JsonHelper.ParseJSON<wxOAuth>(detail);
                return JsonCamel(sina);
            }
        }

        public ActionResult WbSinaLogin(string code)
        {


            var getAccessTokenUrl = "https://api.weibo.com/oauth2/access_token?client_id=3208952127&client_secret=ca55941181c794a947429f9bd0f3349b&grant_type=authorization_code&redirect_uri=http://h5.hn3001.com/Account/WbLogin&code=" + code;
            var request = WebRequest.Create(getAccessTokenUrl);
            request.Method = "POST";
            var response = request.GetResponse();
            var httprespons = (HttpWebResponse)response;
            if (httprespons.StatusCode != HttpStatusCode.OK)
            {
                //LoggingFactory.GetLogger("Trackering").Info(DateTime.Now + "物流跟踪测试StatusCode:" + httprespons.StatusCode);
                //return new RedirectResult("/Trackering/TrackError");
            }
            using (Stream stream = response.GetResponseStream())
            {
                var encode = Encoding.UTF8;
                var reader = new StreamReader(stream, encode);
                var detail = reader.ReadToEnd();
                //ViewBag.flowTrack = detail.ToRawJSON();
                var sina = JsonHelper.ParseJSON<SinaOAuth>(detail);
                return JsonCamel(sina);
            }

        }

        public ActionResult OpenIDOAuthLogin(string openId, int platform, string returnUrl)
        {
            //登录
            var result = Service.OpenIDOAuthLogin(openId, platform);
            if (result.IsSuccess)
            {
                //保存用户到cookie
                WebHelper4H5.SetAuthCookie(result.Data.UserId.ToString(), DateTime.Now.AddDays(30), true, result.Data.ToJSON());
                //绑定微信
                // BindWeChat(result.Data.UserId);
            }
            returnUrl = Session["returnUrl"] == null ? (Request.UrlReferrer != null ? Request.UrlReferrer.OriginalString : FormsAuthentication.DefaultUrl) : Session["returnUrl"].ToString();
            return JsonCamel(new { result.IsSuccess, result.ErrMsg, Data = returnUrl });
        }

        [AllowAnonymous]
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public ActionResult Login(LoginModel model, string returnUrl)
        {

            //登录
            var result = Service.Login(model);
            if (result.IsSuccess)
            {
                //保存用户到cookie
                WebHelper4H5.SetAuthCookie(result.Data.UserId.ToString(), DateTime.Now.AddDays(30), model.RememberMe, result.Data.ToJSON());
                //绑定微信
                // BindWeChat(result.Data.UserId);
            }
            returnUrl = Session["returnUrl"] == null ? (Request.UrlReferrer != null ? Request.UrlReferrer.OriginalString : FormsAuthentication.DefaultUrl) : Session["returnUrl"].ToString();
            return JsonCamel(new { result.IsSuccess, result.ErrMsg, Data = returnUrl });
        }

        public ActionResult LogOff(bool? islogoff)
        {
            bool isLoginOut = islogoff == null ? false : true;
            var openidCookie = Request.Cookies.Get("OpenId");
            string openid = null;
            long userId = 0;
            if (openidCookie != null)
            {
                openid = openidCookie.Value;
            }
            //var useridCookie = Request.Cookies.Get("UserId");
            if (User.Identity.IsAuthenticated)
            {
                userId = long.Parse(User.Identity.Name);
            }
            var info = ApiHelper.Request("User/Logoff", new
            {
                OpenId = openid,
                UserId = userId,
                LoginSystem = 3,
                IsDirectLoff = isLoginOut
            });
            if (info["isBizSuccess"] == true)
            {
                FormsAuthentication.SignOut();      
                for (int i = 0; i < this.Request.Cookies.Count; i++)
                {
                    this.Response.Cookies[this.Request.Cookies[i].Name].Expires = DateTime.Now.AddDays(-1);
                }
                if (Request["ReturnUrl"] != null){
                    return Redirect(Request["ReturnUrl"]);

                }
                else
                {
                    return RedirectToAction("Index", "Home");
                    //StringBuilder sb = new StringBuilder();
                    //sb.AppendLine("<script>");
                    //sb.AppendLine("setTimeout(function(){window.open('/');},0);");
                    //sb.AppendLine("</script>");
                    //return Content(sb.ToString());
                }
            }
            else
            {
                if (string.Compare(info["bizErrorMsg"], "没有该手机号") == 0)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("<script>");
                    sb.AppendLine("window.location.href=\"/userAbout?isAlert=true\";");
                    sb.AppendLine("</script>");
                    return Content(sb.ToString());
                }
                FormsAuthentication.SignOut();
                return Content("<script>alert('注销发生错误，错误内容为：" + info["bizErrorMsg"] + "');</script>");
            }


        }

        [AllowAnonymous]
        public ActionResult Register()
        {
            //绑定
            return View();
        }
        [AllowAnonymous]
        public ActionResult NewRegister()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult QCback()
        {
            return View();
        }
        [AllowAnonymous]
        public ActionResult QBback()
        {
            return View();
        }

        /// <summary>
        /// 发送短信验证码
        /// </summary>
        /// <param name="phone"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpPost]
        public ActionResult SendMessage(string phone)
        {
            var result = Service.SendMessage(phone);
            return JsonCamel(result);
        }

        [AllowAnonymous]
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public ActionResult Register(string nickName, string phone, string captcha, string password)
        {
            long storeId = 0;
            var key = Session["WeChatKey"];
            if (key != null)
            {
                var str = SecurityHelper.Decrypt(key.ToString());
                var dict = Utils.DecodeParams(str);
                storeId = dict["storeId"].TryLong(0);
            }
            var model = new RegisterModel
            {
                NickName = nickName,
                Phone = phone,
                Captcha = captcha,
                Password = password,
                StoreId = storeId
            };
            var result = Service.Register(model);
            if (result.IsSuccess)
            {
                //保存用户到cookie
                WebHelper4H5.SetAuthCookie(result.Data.UserId.ToString(), DateTime.Now.AddDays(30), true, result.Data.ToJSON());
                //绑定微信

                BindWeChat(result.Data.UserId);

            }


            return JsonCamel(result);
        }

        /// <summary>
        /// 绑定微信
        /// </summary>
        /// <param name="userId">用户编号</param>
        private void BindWeChat(long userId)
        {
            var key = Session["WeChatKey"];
            if (key != null)
            {
                var str = SecurityHelper.Decrypt(key.ToString());
                var dict = Utils.DecodeParams(str);
                var openId = dict["openId"];
                var storeId = dict["storeId"].TryLong(0);
                var openName = dict.ContainsKey("openName") ? dict["openName"] ?? "OpenName" : "OpenName";
                Contract.BindUserByWeChat(userId, storeId, openId, openName);
            }
        }

        public ActionResult GetWeChatNickName(string openid)
        {


            JavaScriptSerializer js = new JavaScriptSerializer();
            var userInfo = ApiHelper.Request("User/Login3_1", new
            {
                OpenId = openid,
                LoginSystem = 3
            });
            return Content(js.Serialize(userInfo));

        }

        #region 设置密码
        /// <summary>
        /// 设置密码
        /// </summary>
        /// <returns></returns>
        public ActionResult SetPsd()
        {
            return View();
        }
        #endregion

        #region 校验密码
        /// <summary>
        /// 校验密码
        /// </summary>
        /// <returns></returns>
        public ActionResult ValidatePsd()
        {
            return View();
        }
        #endregion

        #region 更新绑定手机号
        /// <summary>
        /// 更新绑定手机号
        /// </summary>
        /// <returns></returns>
        public ActionResult UpdateMobilePhone()
        {
            return View();
        }
        #endregion
    }

    public class SinaOAuth
    {
        public string uid { get; set; }
    }

    public class wxOAuth
    {
        public string openid { get; set; }
    }

}
