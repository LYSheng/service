using System;
using System.Globalization;
using System.IO;
using System.Web;
using Common;
using FileCoreSDK.ApiRequest;
using FileCoreSDK.Client;
using FileCoreSDK.Utils;
using Model;
using Tonglu.Common;
using System.Drawing;
using System.Configuration;

namespace H5.Handler
{
    /// <summary>
    /// NewUploadhandler 的摘要说明
    /// </summary>
    public class NewUploadhandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            if (context.Request.Files.Count == 0)
            {
                context.Response.Write(new { IsSuccess = false, ErrMsg = "没有要上传的文件！" }.ToJSON());
            }
            else
            {
                //存储路径
                string path = "5000010";
                HttpPostedFile postedFile = context.Request.Files[0];
                string fileExt = GetFileExt(postedFile.FileName);
                if (fileExt.ToLower().EndsWith("apk"))
                {
                    postedFile.SaveAs(context.Server.MapPath(context.Request.ApplicationPath + "App/" + postedFile.FileName));
                    context.Response.Write(new { IsSuccess = true, Data = context.Request.Url.Scheme + "://" + context.Request.Url.Authority + "/App/" + postedFile.FileName }.ToJSON());

                }
                else
                {
                    MemoryStream memoryStream = null;



                    string originalFileName = postedFile.FileName.Substring(postedFile.FileName.LastIndexOf(@"\") + 1);
                    string fileName = GetRamCode() + "." + fileExt;

                    try
                    {

                        byte[] bytes = null;
                        if (memoryStream == null)
                        {
                            bytes = StreamToBytes(postedFile.InputStream);
                        }
                        else
                        {
                            bytes = StreamToBytes(memoryStream);
                        }

                        try
                        {
                            MogileClient.UploadFile("Upload/" + fileName, memoryStream);

                            //var result = FileService.Instance.ImageUpload((int)(FileCoreSDK.Utils.EnumImageSuffix)Enum.Parse(typeof(FileCoreSDK.Utils.EnumImageSuffix), fileExt.ToUpper()), path, bytes);
                            context.Response.Write(new { isSuccess = true, Data = "Upload/" + fileName, errMsg = "" }.ToJSON());
                        }
                        catch (Exception ex)
                        {
                            context.Response.Write(new { isSuccess = false, errMsg = ex.Message }.ToJSON());
                        }
                    }
                    catch (Exception ex)
                    {
                        context.Response.Write(new { IsBizSuccess = false, ErrorMsg = ex.Message }.ToJSON());
                    }
                }
            }
        }

        private string GetFileExt(string _filepath)
        {
            if (string.IsNullOrEmpty(_filepath))
            {
                return "";
            }
            if (_filepath.LastIndexOf(".") > 0)
            {
                return _filepath.Substring(_filepath.LastIndexOf(".") + 1); //文件扩展名，不含“.”
            }
            return "";
        }
        private string GetRamCode()
        {
            return DateTime.Now.ToString("yyyyMMddHHmmssffff");
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
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }

    public class FileService : Singleton<FileService>
    {
        private readonly FileCoreSDKClient fileSdkClient = ApiProxy.CreateFileClient();

        /// <summary>
        /// 上传图片
        /// </summary>
        /// <param name="imageSuffix">图片后缀</param>
        /// <param name="filePath">路径</param>
        /// <param name="files">二进制流</param>
        /// <returns></returns>
        public Tuple<bool, string, string> ImageUpload(int imageSuffix, string filePath, byte[] files)
        {
            var response = fileSdkClient.Request(new ImageUploadRequest
            {
                EnumImgSuffix = (EnumImageSuffix)imageSuffix,
                FilePath = filePath,
                Files = files
            });
            return new Tuple<bool, string, string>(response.IsBizSuccess, response.BizErrorMsg, response.FileName);
        }

        /// <summary>
        /// 上传图片
        /// </summary>
        /// <param name="fileSuffix">后缀</param>
        /// <param name="filePath">路径</param>
        /// <param name="files">二进制流</param>
        /// <returns></returns>
        public Tuple<bool, string, string> FileUpload(int fileSuffix, string filePath, byte[] files)
        {

            var response = fileSdkClient.Request(new FileUploadRequest
            {
                EnumFileSuffix = (EnumFileSuffix)fileSuffix,
                FilePath = filePath,
                Files = files
            });
            return new Tuple<bool, string, string>(response.IsBizSuccess, response.BizErrorMsg, response.FileName);
        }

        /// <summary>
        /// 图片转为image对象
        /// </summary>
        /// <param name="imagePath">相对路径</param>
        /// <returns></returns>
        public Image GetImage(string imagePath)
        {
            var imageByte = ImageHelper.ConvertByte(imagePath);
            return ImageHelper.ConvertImage(imageByte);
        }

    }

    public sealed class ApiProxy
    {
        /// <summary>
        /// 获取文件API
        /// </summary>
        public static FileCoreSDKClient CreateFileClient()
        {
            var fileKey = ConfigurationManager.AppSettings["FileApiAppKey"];
            var fileSecret = ConfigurationManager.AppSettings["FileApiAppSecret"];
            var fileUrl = ConfigurationManager.AppSettings["FileApiUrl"];
            return new FileCoreSDKClient(fileKey, fileSecret, fileUrl);
        }
    }
}