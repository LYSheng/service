using FrontSDK.Utils;
using Model;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace H5.Controllers
{
    public class VerificationCodeController : Controller
    {
        //
        // GET: /VerificationCode/
        public ActionResult Index(string type)
        {
            if (!new[] { "ShoppingCardRecharge" }.Contains(type))
            {
                return Content("不支持的类型");
            }
            string chkCode = string.Empty;
            //颜色列表，用于验证码、噪线、噪点 
            Color[] color = { Color.Black, Color.Red, Color.Blue, Color.Green, Color.Orange, Color.Brown, Color.Brown, Color.DarkBlue };
            //字体列表，用于验证码 
            string[] font = { "Times New Roman", "MS Mincho", "Book Antiqua", "Gungsuh", "PMingLiU", "Impact" };
            //验证码的字符集，去掉了一些容易混淆的字符 
            char[] character = { '2', '3', '4', '5', '6', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W', 'X', 'Y' };
            Random rnd = new Random();
            //生成验证码字符串 
            for (int i = 0; i < 4; i++)
            {
                chkCode += character[rnd.Next(character.Length)];
            }
            using (Bitmap bmp = new Bitmap(100, 40))
            {
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.Clear(Color.White);
                    //画噪线 
                    for (int i = 0; i < 10; i++)
                    {
                        int x1 = rnd.Next(100);
                        int y1 = rnd.Next(40);
                        int x2 = rnd.Next(100);
                        int y2 = rnd.Next(40);
                        Color clr = color[rnd.Next(color.Length)];
                        g.DrawLine(new Pen(clr), x1, y1, x2, y2);
                    }
                    //画验证码字符串 
                    for (int i = 0; i < chkCode.Length; i++)
                    {
                        string fnt = font[rnd.Next(font.Length)];
                        Font ft = new Font(fnt, 18);
                        Color clr = color[rnd.Next(color.Length)];
                        g.DrawString(chkCode[i].ToString(), ft, new SolidBrush(clr), (float)i * 20 + 8, (float)8);
                    }
                    //画噪点 
                    for (int i = 0; i < 100; i++)
                    {
                        int x = rnd.Next(bmp.Width);
                        int y = rnd.Next(bmp.Height);
                        Color clr = color[rnd.Next(color.Length)];
                        bmp.SetPixel(x, y, clr);
                    }
                    //清除该页输出缓存，设置该页无缓存 
                    Response.Buffer = true;
                    Response.ExpiresAbsolute = System.DateTime.Now.AddMilliseconds(0);
                    Response.Expires = 0;
                    Response.CacheControl = "no-cache";
                    Response.AppendHeader("Pragma", "No-Cache");
                    //将验证码图片写入内存流，并将其以 "image/Png" 格式输出 
                    MemoryStream ms = new MemoryStream();

                    bmp.Save(ms, ImageFormat.Png);
                    Response.ClearContent();
                    Response.ContentType = "image/Png";
                    Response.BinaryWrite(ms.ToArray());
                    ServerCacheTool.Set(type + "VerificationCode" + CurrentUser.Instance.UserId, chkCode, DateTime.Now.AddMinutes(5), false);
                    Response.End();
                    return null;
                }
            }
        }
    }
}