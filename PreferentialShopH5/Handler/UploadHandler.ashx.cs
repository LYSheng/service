using System;
using System.Globalization;
using System.IO;
using System.Web;
using Common;
using FileCoreSDK.ApiRequest;
using FileCoreSDK.Client;
using FileCoreSDK.Utils;
using Model;

namespace H5.Handler
{
    /// <summary>
    /// UploadHandler 的摘要说明
    /// </summary>
    public class UploadHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
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
                var data = context.Request["data"];
                byte[] bytes = Convert.FromBase64String(context.Request["data"]);
                var memoryStream = new MemoryStream(bytes);               
                //var filApiClient = new FileCoreSDKClient("5000001", "39ea5cfd426946d7a1b4429d7b243a2c", GlobalData.ImgHost + "api/");
                //EnumImageSuffix enumImageSuffix;
                //var result = filApiClient.Request(new ImageUploadRequest
                //{
                //    Files = bytes,
                //    EnumImgSuffix = Enum.TryParse(suffix, true, out enumImageSuffix) ? enumImageSuffix : EnumImageSuffix.JPG,
                //    FilePath ="H5Pic"
                  
                //});
                fileName = Rename() + "." + suffix;
                MogileClient.UploadFile("Upload/" + fileName, memoryStream);
                context.Response.Write(new { IsSuccess = true, ErrMsg = "", Data = "Upload/" + fileName }.ToJSON());
            }
            catch (Exception ex)
            {
                context.Response.Write(new { IsSuccess = false, ErrMsg = ex.Message }.ToJSON());
            }

        }

        /// <summary>
        /// 重命名
        /// </summary>
        /// <returns></returns>
        public static string Rename()
        {
            var random = new Random();
            return DateTime.Now.Ticks + random.Next(100000, 999999).ToString(CultureInfo.InvariantCulture);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}