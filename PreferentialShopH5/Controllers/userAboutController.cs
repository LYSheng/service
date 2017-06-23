using FrontSDK.ApiRequest;
using FrontSDK.Base;
using FrontSDK.Domain;
using FrontSDK.Domain.User;
using Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Common;
using System.Web.Script.Serialization;
using FrontSDK.Enum;
using Service.Site;
using FrontSDK.Utils;
namespace H5.Controllers
{
    [H5.Filters.LoginAuthorize]
    public class UserAboutController : BaseController
    {
        //
        // GET: /userAbout/

        public ActionResult Index()
        {
            BaseService service = new BaseService();
            GetUserPackageCountRequest req = new GetUserPackageCountRequest();
            UserGetRequest ureq = new UserGetRequest();
            MyMallsWalletRequest mreq = new MyMallsWalletRequest();

            if (User.Identity.IsAuthenticated)
            {
                long userId = long.Parse(User.Identity.Name);
                ureq.UserId = userId;
                req.UserId = userId;
                mreq.UserId = userId;

                var mresponse = service.GetRawResult<FBaseApiResponse, MyMallsWalletResult>(mreq);
                if (mresponse.IsSuccess)
                {
                    ViewBag.MyMallsWalletResult = mresponse.Data;
                }
                else
                {
                    return Content(mresponse.ErrMsg);
                }

                var uresponse = service.GetRawResult<FBaseApiResponse, UserResult>(ureq);
                if (uresponse.IsSuccess)
                {
                    ViewBag.UserResult = uresponse.Data;
                }
                else
                {
                    return Content(uresponse.ErrMsg);
                }

                string logo = "";
                if (!string.IsNullOrEmpty(CurrentUser.UserPic))
                    logo = "&logo=" + HttpUtility.UrlEncode(CurrentUser.UserPic);
                string url = System.Configuration.ConfigurationManager.AppSettings["QrCodeAPIUrl"] + "?text="
                    + HttpUtility.UrlEncode("type=user&userName=" + HttpUtility.UrlEncode(uresponse.Data.NickName) + "&userId=" + uresponse.Data.UserId + "&mobilePhone=" + HttpUtility.UrlEncode(uresponse.Data.Phone)) + logo;
                ViewBag.InvitUrl = url;

                var response = service.GetRawResult<FBaseApiResponse, DxlqOrderPackageCount>(req);
                if (response.IsSuccess)
                {
                    return View(response.Data);
                }
                else
                {
                    return Content(response.ErrMsg);
                }
            }

            return View();
        }

        public ActionResult myInfo()
        {
            return View();
        }
        public ActionResult changeNickName()
        {
            return View();
        }
        public ActionResult addressList(string actionType)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAddress/gets", new
            {
                UserId = userId
            });
            ViewBag.adrLists = temp["data"];
            ViewBag.actionType = actionType;
            return View();
        }

        public ActionResult addressEdit(string addressId, string actionType)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAddress/get", new
            {
                UserId = userId,
                UserAddressId = addressId
            });
            try
            {
                ViewBag.curAddress = temp["data"];
            }
            catch
            {
                ViewBag.curAddress = new Dictionary<string, object>() { { "name", "" }, { "phone", "" }, { "provinceName", "" }, { "province", "" }, 
                { "city", "" }, { "area", "" }, { "cityName", "" }, { "areaName", "" }, { "address", "" }, { "isDefault", false }, { "userAddressId", "" } };
            }
            ViewBag.actionType = actionType;
            return View();
        }
        public ActionResult myAllies()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("User/GetMyAllies", new
            {
                UserId = userId
            });
            ViewBag.myAllies = temp["data"];
            return View();
        }
        public ActionResult alliesList(int level)
        {
            int levelid = level;
            var levelName = "";
            switch (levelid)
            {
                case 1:
                    levelName = "钻石会员";
                    break;
                case 2:
                    levelName = "金牌会员";
                    break;
                case 3:
                    levelName = "银牌会员";
                    break;
                case 4:
                    levelName = "其他会员";
                    break;
                default:
                    levelName = "钻石会员";
                    break;
            }
            if (levelid > 4 || levelid <= 0) levelid = 1;
            long userId = long.Parse(User.Identity.Name);
            //var temp = ApiHelper.Request("User/GetMyAlliesFromLevel", new
            //{
            //    UserId = userId,
            //    Level = levelid
            //});
            //ViewBag.alliesList = temp["data"];

            BaseService service = new BaseService();
            AllyGetFromLevelRequest req = new AllyGetFromLevelRequest();
            req.UserId = userId;
            req.Level = levelid;
            var response = service.GetRawResult<FListApiResponse, List<AllyDto>>(req);
            ViewBag.alliesList = response.Data;
            ViewBag.alliesListStr = response.Data.ToJSON();
            ViewBag.levelid = levelid;
            ViewBag.levelName = levelName;
            return View();
        }
        public ActionResult myBrokerage()
        {
            BaseService service = new BaseService();
            UserGetRequest ureq = new UserGetRequest();
            long userId = long.Parse(User.Identity.Name);
            ureq.UserId = userId;
            var uresponse = service.GetRawResult<FBaseApiResponse, UserResult>(ureq);
            if (uresponse.IsSuccess)
            {
                ViewBag.UserResult = uresponse.Data;
            }
            else
            {
                return Content(uresponse.ErrMsg);
            }

            var temp = ApiHelper.Request("UserAccount/GetCommissionAccount", new
            {
                UserId = userId,
            });
            var temp1 = ApiHelper.Request("UserAccount/GetWithdrawalsCommissionList", new
            {
                UserId = userId,
                Status = 20,
                PageSize = 1,
                PageNo = 1
            });

            ViewBag.comsionAccount = temp["data"];
            ViewBag.comsionList = temp1["data"];
            return View();
        }
        public ActionResult withDrawalsList()
        {
            return View();
        }
        public ActionResult myCoupon()
        {
            return View();
        }
        public ActionResult couponSelected()
        {
            return View();
        }

        public ActionResult myVipAccount()
        {
            //ErPao/ErPaolianHeList
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("ErPao/ErPaolianHeList", new
            {
                UserId = userId,
                AccountType = 2
            });
            if (temp["totalCount"] > 0)
            {
                ViewBag.myAccount = temp["data"];
                ViewBag.WarningMsg = temp["data"]["projectNames"];
            }
            else
            {
                ViewBag.WarningMsg = temp["data"] == null ? "" : temp["data"];
            }
            ViewBag.lianheCardCount = temp["totalCount"];
            ViewBag.userid = userId;
            return View();
        }

        public ActionResult chargeMyMoney()
        {
            BaseService service = new BaseService();
            GetUserPackageCountRequest req = new GetUserPackageCountRequest();
            UserGetRequest ureq = new UserGetRequest();

            if (User.Identity.IsAuthenticated)
            {
                long userId = long.Parse(User.Identity.Name);
                ureq.UserId = userId;
                req.UserId = userId;
                var uresponse = service.GetRawResult<FBaseApiResponse, UserResult>(ureq);
                if (uresponse.IsSuccess)
                {
                    ViewBag.UserResult = uresponse.Data;
                }

                var response = service.GetRawResult<FBaseApiResponse, DxlqOrderPackageCount>(req);
                if (response.IsSuccess)
                    return View(response.Data);
            }
            ViewBag.uid = long.Parse(User.Identity.Name);
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");
            return View();
        }
        public ActionResult orderList()
        {
            long userId = long.Parse(User.Identity.Name);
            ViewBag.uid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");
            return View();
        }
        public ActionResult showOrderDetail(long orderId)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("Order/DxlqOrderGet", new
            {
                OrderId = orderId
            });
            ViewBag.OrderShow = temp["data"];
            ViewBag.uid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");

            var store = ApiHelper.Request("User/GetStoreDetail", new
            {
                OrderId = orderId
            });
            ViewBag.StoreShow = store["data"];

            return View();
        }
        [AllowAnonymous]
        [ActionName("showOrderDetailByCustomerSign")]
        public ActionResult showOrderDetailByCustomerSign(long orderId, string customerSign)
        {

            var temp = ApiHelper.Request("Order/DxlqOrderGet", new
            {
                OrderId = orderId
            });
            ViewBag.OrderShow = temp["data"];
            ViewBag.uid = temp["data"]["userId"];
            if (Md5Util.GetMd5(orderId + "_" + ViewBag.uid + "_" + temp["data"]["serviceStoreUserId"]) != customerSign)
            {
                return Content("订单签名不正确");
            }
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");

            var store = ApiHelper.Request("User/GetStoreDetail", new
            {
                OrderId = orderId
            });
            ViewBag.StoreShow = store["data"];

            return View("showOrderDetail");
        }
        public ActionResult showPackageDetail(long orderPackageId)
        {
            var temp = ApiHelper.Request("OrderPackage/DxlqGetOrderPackage", new
            {
                OrderPackageId = orderPackageId,
                FromWhere = "R"
            });
            ViewBag.OrderPackageShow = temp["data"];

            var orderId = temp["data"]["orderId"];
            var store = ApiHelper.Request("User/GetStoreDetail", new
            {
                OrderId = orderId
            });
            ViewBag.StoreShow = store["data"];

            return View();
        }
        public ActionResult orderConfirm()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAddress/GetOfDefault", new
            {
                UserId = userId
            });
            ViewBag.GetDefaultAddress = Tonglu.Json.JsonHelper.ToJSON(temp["data"]);
            ViewBag.uid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");

            return View();
        }
        public ActionResult orderConfirmImmediate()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAddress/GetOfDefault", new
            {
                UserId = userId
            });
            ViewBag.GetDefaultAddress = Tonglu.Json.JsonHelper.ToJSON(temp["data"]);
            ViewBag.uid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");
            return View();
        }
        public ActionResult bargainOrderImmediate()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAddress/GetOfDefault", new
            {
                UserId = userId
            });
            ViewBag.GetDefaultAddress = Tonglu.Json.JsonHelper.ToJSON(temp["data"]);
            ViewBag.uid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");
            return View();
        }

        public ActionResult logisticsDetail(long orderPackageId)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("OrderPackage/DxlqGetOrderPackage", new
            {
                OrderPackageId = orderPackageId
            });
            temp["data"]["toCheckUrl"] = "http://m.kuaidi100.com/index_all.html?type=" + temp["data"]["expressRemark"] + "&postid=" + temp["data"]["expressNo"] + "&callbackurl=" +
                System.Configuration.ConfigurationManager.AppSettings["H5Url"] + "userAbout/logisticsDetail?orderPackageId=" + temp["data"]["orderPackageId"];
            ViewBag.OrderPackageShow = temp["data"];
            return View();
        }
        public ActionResult promotionAddEva(long orderId, long orderPackageId)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("OrderPackage/DxlqGetOrderPackage", new
            {
                OrderPackageId = orderPackageId
            });
            ViewBag.OrderPackageShow = temp["data"];
            return View();
        }
        public ActionResult GetShouZhiDetail()
        {
            return View();
        }

        public ActionResult GetPayType()
        {
            long userId = long.Parse(User.Identity.Name);
            ViewBag.userid = userId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.userid + ViewBag.DateTime + "oto_pay", "utf-8");
            return View();
        }

        public ActionResult myShare()
        {
            string logo = "";
            if (!string.IsNullOrEmpty(CurrentUser.UserPic))
                logo = "&logo=" + HttpUtility.UrlEncode(CurrentUser.UserPic);
            string url = System.Configuration.ConfigurationManager.AppSettings["QrCodeAPIUrl"] + "?text=" + HttpUtility.UrlEncode(string.Format(WebConfig.WXMVCUrl + "/Share/Arrive?ReferrerUserId={0}", ViewBag.CurrentUser.UserId)) + logo;
            ViewBag.InvitUrl = url;
            string accessToken = wxService.getAccessToken();
            string ticket = wxService.getTicket(accessToken);
            string timestamp = wxService.GetTimeStamp();
            string noncestr = wxService.NetxtString(new Random(), 16, false);
            string _sinature = "jsapi_ticket=" + ticket + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + Request.Url.ToString();
            string signature = wxService.SHA1Sign(_sinature);
            ViewData["noncestr"] = noncestr;
            ViewData["timestamp"] = timestamp;
            ViewData["signature"] = signature;
            return View();
        }
        /// <summary>
        /// 待计算金额
        /// </summary>
        /// <returns></returns>
        public ActionResult GetWillSetMoney()
        {
            return View();
        }
        public ActionResult historyOrder()
        {
            return View();
        }
        public ActionResult historyOrderDetail(string orderId)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("Order/GetHistoryDetail", new
            {
                UserId = userId,
                OrderId = orderId
            });
            ViewBag.HistoryDetail = temp["data"];
            return View();
        }
        public ActionResult pwdUpdate()
        {
            return View();
        }
        public ActionResult preLottery()
        {
            return View();
        }
        public ActionResult ClipImg()
        {
            return View();
        }

        public ActionResult UploadLisenceImg()
        {
            return PartialView();
        }

        #region 证照提交成功页面
        /// <summary>
        /// 证照提交成功页面
        /// </summary>
        /// <returns></returns>
        public ActionResult LisenceAuthSucess()
        {
            return View();
        }
        #endregion

        /// <summary>
        /// 申请提现
        /// </summary>
        /// <returns></returns>
        public ActionResult applyTakeOutMoney()
        {
            return View();
        }
        public ActionResult withDrawals()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserAccount/GetCommissionAccount", new
            {
                UserId = userId,
            });
            ViewBag.comsionAccount = temp["data"];
            return View();
        }
        public ActionResult withDrawalsSuccess()
        {
            return View();
        }
        public ActionResult withCardList()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserBankCard/GetMyBankCard", new
            {
                currentUserId = userId,
            });
            if (temp["isBizSuccess"])
            {
                ViewBag.withCardList = temp["data"];
            }
            else
            {
                return Content(temp["bizErrorMsg"]);
            }
            return View();
        }
        public ActionResult withCardDetail(string bankCardId)
        {
            var temp = ApiHelper.Request("Basic/GetBankList", new
            {
            });
            ViewBag.bankList = temp["data"];
            return View();
        }
        public ActionResult withBankAction(string bankCardId)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("UserBankCard/GetMyBankCard", new
            {
                currentUserId = userId,
                BankCardId = bankCardId
            });
            ViewBag.withCardList = temp["data"];
            return View();
        }

        #region 身份认证
        /// <summary>
        /// 身份认证
        /// </summary>
        /// <returns></returns>
        public ActionResult IdAuthentication()
        {
            return View();
        }
        #endregion

        #region 众筹管理
        /// <summary>
        /// 众筹管理
        /// </summary>
        /// <returns></returns>
        public ActionResult CrowdFunding()
        {
            return View();
        }
        #endregion
        #region 客服电话
        /// <summary>
        /// 客服电话
        /// </summary>
        /// <returns></returns>
        public ActionResult serviceCall()
        {
            return View();
        }
        #endregion
        #region 关注猫市公众号
        /// <summary>
        /// 关注猫市公众号
        /// </summary>
        /// <returns></returns>
        [AllowAnonymous]
        public ActionResult attentMalls()
        {
            return View();
        }
        #endregion
        #region 0元体验详情
        /// <summary>
        /// 关注猫市公众号
        /// </summary>
        /// <returns></returns>
        public ActionResult zeroConfirm(string promotionId, string skuId)
        {
            var temp = ApiHelper.Request("Activity/GetActivityProductDetails", new
            {
                ActivityId = promotionId
            });
            ViewBag.promotionId = promotionId;
            ViewBag.skuId = skuId;
            ViewBag.productList = temp["data"];
            return View();
        }
        #endregion
        #region 0元体验列表
        /// <summary>
        /// 关注猫市公众号
        /// </summary>
        /// <returns></returns>
        public ActionResult zeroList()
        {

            return View();
        }
        #endregion

        public ActionResult withDrawalsDividends()
        {

            var temp = ApiHelper.Request("MyWallet/GetMyWallet", new
            {
            });
            ViewBag.Account = temp["data"];
            var data = ApiHelper.Request("MyWallet/GetUserWithDrawCondition", new
            {
                UserId = CurrentUser.UserId
            });
            if (!data["isBizSuccess"])
            {
                ViewBag.IsCanWithDraw = false;
                ViewBag.ErrorMsg = data["bizErrorMsg"];
            }
            else
            {
                ViewBag.IsCanWithDraw = true;
                ViewBag.Condition = data["data"];
            }
            return View();
        }

        #region 我的钱包
        /// <summary>
        /// 我的钱包
        /// </summary>
        /// <returns></returns>
        public ActionResult MyBank()
        {
            var temp = ApiHelper.Request("MyWallet/GetMyWallet", new
            {
            });

            if (temp["isBizSuccess"])
            {
                ViewBag.Info = temp["data"];
            }
            else
            {
                return Content(temp["errMsg"]);
            }
            return View();
        }
        #endregion

        #region 获取猫市币明细
        /// <summary>
        /// 获取猫市币明细
        /// </summary>
        /// <returns></returns>
        public ActionResult MoneyDetails()
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("MyWallet/FUserAccountForPreferentialShopGetList", new
            {
                UserId = userId
            });

            if (temp["isBizSuccess"])
            {
                ViewBag.TotalCount = temp["totalCount"];
                ViewBag.InfoList = temp["data"];
            }
            else
            {
                return Content(temp["errMsg"]);
            }
            return View();
        }
        #endregion

        #region 获取会员分红记录
        /// <summary>
        /// 获取会员分红记录
        /// </summary>
        /// <returns></returns>
        public ActionResult DividendRecords()
        {
            return View();
        }
        #endregion

        /* #region 选择提现方式
        /// <summary>
        /// 选择提现方式
        /// </summary>
        /// <returns></returns>
        public ActionResult WithdrawalStype()
        {
            return View();
        }
        #endregion*/

        #region 劳务工资明细
        /// <summary>
        /// 劳务工资明细
        /// </summary>
        /// <param name="actionType"></param>
        /// <returns></returns>
        public ActionResult LabourServiceWage(int actionType)
        {
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("MyWallet/FGetLabourServiceWageGetList", new
            {
                UserId = userId,
                IsYetDividends = (actionType == 1)
            });

            if (temp["isBizSuccess"])
            {
                ViewBag.TotalCount = temp["totalCount"];
                ViewBag.InfoList = temp["data"];
            }
            else
            {
                return Content(temp["errMsg"]);
            }

            if (actionType == 0)
            {
                ViewBag.Title = "待结算记录";
            }
            else
            {
                ViewBag.Title = "已结算记录";
            }
            ViewBag.ActionType = actionType;
            return View();

        }
        #endregion

        #region 收益详情
        /// <summary>
        /// 收益详情
        /// </summary>
        /// <param name="actionType"></param>
        /// <returns></returns>
        public ActionResult EarningsDetails(long investmentInfoId, bool isYetDividends)
        {
            //var temp = ApiHelper.Request("MyWallet/FGetEarningsDetailsGetList", new
            //{
            //    InvestmentInfoId = investmentInfoId,
            //    IsYetDividends = isYetDividends
            //});

            //if (temp["isBizSuccess"])
            //{
            //    ViewBag.TotalCount = temp["totalCount"];
            //    ViewBag.InfoList = temp["data"];
            //}
            //else
            //{
            //    return Content(temp["errMsg"]);
            //}

            return View();

        }
        #endregion

        #region 充值会员卡
        public ActionResult PayCardGetMySelServiceStore()
        {
            var temp = ApiHelper.Request("MyWallet/GetMySelServiceStore", new
            {
                IsInvestment = true
            });
            if (temp["isBizSuccess"])
            {
                if (temp["data"]["serviceStoreUserId"] > 0)
                {
                    return Redirect("/userAbout/payCard?storeUserId=" + temp["data"]["serviceStoreUserId"]);
                }
                return Redirect("/userAbout/chooseShop");
            }
            else
            {
                return Content(temp["errMsg"]);
            }
        }
        /// <summary>
        /// 充值会员卡
        /// </summary>
        public ActionResult PayCard()
        {
            long userId = long.Parse(User.Identity.Name);
            long storeUserId = long.Parse(Request.Params["storeUserId"]);

            //获取用户是否有未支付的充值
            var temp = ApiHelper.Request("Investment/WaitPayInvestmentGet", new
            {
                UserId = userId
            });
            if (temp["isBizSuccess"])
            {
                if (temp["data"] != null && temp["data"]["investmentInfoId"] > 0)  //包含未支付充值
                {
                    ViewBag.HasWaitPayInvestment = true;
                    ViewBag.InvestmentAmountSetId = temp["data"]["investmentAmountSetId"];
                    ViewBag.ProviderID = temp["data"]["providerId"];
                    ViewBag.InvestMentInfoId = temp["data"]["investmentInfoId"];
                }
                else
                {  //没有未支付充值
                    temp = ApiHelper.Request("Investment/InvestmentAmountSetListGet", new
                    {
                        StoreUserId = storeUserId
                    });

                    if (temp["isBizSuccess"])
                    {
                        ViewBag.HasWaitPayInvestment = false;
                        ViewBag.InfoList = temp["data"];
                    }
                    else
                    {
                        return Content(temp["errMsg"]);
                    }
                }
            }
            else
            {
                return Content(temp["errMsg"]);
            }

            return View();

        }
        #endregion

        #region 选择加盟店
        /// <summary>
        /// 选择加盟店
        /// </summary>
        public ActionResult ChooseShop(long? cardId)
        {
            return View();
        }
        #endregion

        #region 获取加盟店数据

        /// <summary>
        /// 获取加盟店数据
        /// </summary>
        /// <param name="cityId"></param>
        /// <param name="areaId"></param>
        /// <returns></returns>
        public ActionResult GetActCouponList(long? cityId, long? areaId)
        {
            var temp = ApiHelper.Request("Investment/PreferentialShopStatisticListGet", new
            {
                CityId = cityId,
                AreaId = areaId,
            });

            return Json(new
            {
                data = temp
            });
        }
        #endregion

        #region 收银台
        /// <summary>
        /// 收银台
        /// </summary>
        public ActionResult Checkstand(long? cardId, long? shopId, long? investmentid)
        {
            //获得劳务工资余额
            long userId = long.Parse(User.Identity.Name);
            var temp = ApiHelper.Request("Investment/LaborWagesGet", new
             {

             });
            if (temp["isBizSuccess"])
            {
                ViewBag.Balance = temp["balance"];
            }
            else
            {
                return Content(temp["bizErrorMsg"]);
            }

            //获取猫白条的状态
            temp = ApiHelper.Request("UserIou/Get", new
            {

            });
            if (temp["isBizSuccess"])
            {
                ViewBag.iouStatus = temp["data"]["iouStatus"];
                if (ViewBag.iouStatus == 50)
                {
                    ViewBag.canUsed = temp["data"]["balance"];
                }
            }
            else
            {
                return Content(temp["bizErrorMsg"]);
            }

            //生成充值订单
            temp = ApiHelper.Request("Investment/BeginInvestment", new
            {
                InvestmentAmountSetId = cardId,
                StoreUserId = shopId,
                InvestMentInfoId = investmentid > 0 ? investmentid : null
                //AllPayments = "100"
            });

            if (temp["isBizSuccess"])
            {
                ViewBag.InvestmentId = temp["investmentId"];
                ViewBag.InvestmentAmount = temp["investmentAmount"];
                ViewBag.PayLaborWages = temp["payLaborWages"];
                ViewBag.NeedPayPrice = temp["needPayPrice"];
                ViewBag.PayIou = temp["payIou"];
                ViewBag.InvestmentCode = temp["investmentCode"];
            }
            else
            {
                return Content(temp["bizErrorMsg"]);
            }

            ViewBag.uid = Model.CurrentUser.Instance.UserId;
            ViewBag.DateTime = DateTime.Now.ToString();
            ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");

            return View();

        }
        //[AllowAnonymous]
        //[ActionName("CheckstandByCustomerSign")]
        //public ActionResult CheckstandByCustomerSign(long investmentid, string customerSign)
        //{
        //    var temp = ApiHelper.Request("Investment/BeginInvestment", new
        //    {
        //        InvestMentInfoId = investmentid,
        //        IsByCustomerSign = true
        //        //AllPayments = "100"
        //    });
        //    if (temp["isBizSuccess"])
        //    {
        //        ViewBag.InvestmentId = temp["investmentId"];
        //        ViewBag.InvestmentAmount = temp["investmentAmount"];
        //        ViewBag.PayLaborWages = temp["payLaborWages"];
        //        ViewBag.NeedPayPrice = temp["needPayPrice"];
        //        ViewBag.PayIou = temp["payIou"];
        //        ViewBag.InvestmentCode = temp["investmentCode"];
        //    }
        //    else
        //    {
        //        return Content(temp["bizErrorMsg"]);
        //    }
        //    ViewBag.uid = Model.CurrentUser.Instance.UserId;
        //    ViewBag.DateTime = DateTime.Now.ToString();
        //    ViewBag.PayToSign = Md5Util.GetMd5(ViewBag.uid + ViewBag.DateTime + "oto_pay", "utf-8");
        //    if (Md5Util.GetMd5(ViewBag.InvestmentId + "_" + temp["userId"] + "_" + temp["storeUserId"]) != customerSign)
        //    {
        //        return Content("订单签名不正确");
        //    }

        //    ViewBag.IsByCustomerSign = 1;
        //    return View("Checkstand");
        //}
        #endregion

        #region 取消充值
        /// <summary>
        /// 取消充值
        /// </summary>
        /// <param name="cityId"></param>
        /// <param name="areaId"></param>
        /// <returns></returns>
        public ActionResult EndInvestment(long? investmentId)
        {
            var temp = ApiHelper.Request("Investment/CancelInvestmentInfo", new
            {
                InvestMentId = investmentId
            });

            return Json(new
            {
                IsBizSuccess = temp["isBizSuccess"]
            });
        }
        #endregion

        #region 支付前验证
        public ActionResult InvestmentPayBeforeValidate(long? investmentId, bool? isUseLaborWages)
        {
            var temp = ApiHelper.Request("Investment/InvestmentPayBeforeValidate", new
            {
                InvestmentId = investmentId,
                IsUseLaborWages = isUseLaborWages
            });

            return Json(new
            {
                IsBizSuccess = temp["isBizSuccess"],
                BizErrorMsg = temp["bizErrorMsg"],
                IsEnough = temp["isEnough"],
                InvestmentAmount = temp["investmentAmount"],
                NeedPayPrice = temp["needPayPrice"]
            });
        }
        #endregion

        /// <summary>
        /// 绑定会员 页面
        /// </summary>
        /// <returns></returns>
        public ActionResult BindMember(long? ReferrerUserId)
        {
            ViewBag.ReferrerUserId = ReferrerUserId;

            return View();
        }


        #region 绑定会员接口
        public ActionResult SubmitBindMember(long? phone, string captchaCode, long? referrerUserId)
        {
            /*var temp = ApiHelper.Request("Investment/InvestmentPayBeforeValidate", new
            {
                InvestmentId = investmentId,
                IsUseLaborWages = isUseLaborWages
            });

            return Json(new
            {
                IsBizSuccess = temp["isBizSuccess"],
            });*/

            return Json(new
            {
                IsBizSuccess = true
            });
        }
        #endregion


        /// <summary>
        /// 申请加盟店
        /// </summary>
        /// <returns></returns>
        public ActionResult ApplyJoin()
        {
            return View();
        }

        /// <summary>
        /// 我的二维码
        /// </summary>
        /// <returns></returns>
        public ActionResult myqrCode()
        {
            BaseService service = new BaseService();
            GetUserPackageCountRequest req = new GetUserPackageCountRequest();
            UserGetRequest ureq = new UserGetRequest();

            if (User.Identity.IsAuthenticated)
            {
                long userId = long.Parse(User.Identity.Name);
                ureq.UserId = userId;
                req.UserId = userId;
                var uresponse = service.GetRawResult<FBaseApiResponse, UserResult>(ureq);
                if (!uresponse.IsSuccess)
                {
                    return Content(uresponse.ErrMsg);
                }
                ViewBag.UserResult = uresponse.Data;
                string logo = "";
                if (!string.IsNullOrEmpty(CurrentUser.UserPic))
                    logo = "&logo=" + HttpUtility.UrlEncode(CurrentUser.UserPic);
                string url = System.Configuration.ConfigurationManager.AppSettings["QrCodeAPIUrl"] + "?text="
                    + HttpUtility.UrlEncode("type=user&userName=" + HttpUtility.UrlEncode(uresponse.Data.NickName) + "&userId=" + uresponse.Data.UserId + "&mobilePhone=" + HttpUtility.UrlEncode(uresponse.Data.Phone)) + logo;
                ViewBag.InvitUrl = url;
            }
            return View();
        }
        /// <summary>
        /// 我的白条
        /// </summary>
        /// <returns></returns>
        public ActionResult baitiao()
        {

            return View();
        }
        /// <summary>
        /// 申请白条
        /// </summary>
        /// <returns></returns>
        public ActionResult nobaitiao()
        {

            return View();
        }
        /// <summary>
        /// 待审核状态查看白条
        /// </summary>
        /// <returns></returns>
        public ActionResult baitiaoinfo()
        {

            return View();
        }
        /// <summary>
        /// 我的会员卡
        /// </summary>
        /// <returns></returns>
        public ActionResult myMemCard()
        {
            return View();
        }
        /// <summary>
        /// 我的会员卡消费详情
        /// </summary>
        /// <returns></returns>
        public ActionResult myMemCardDetail()
        {
            return View();
        }
        /// <summary>
        /// 当月预计会员收益
        /// </summary>
        /// <returns></returns>
        public ActionResult memberInvestment()
        {
            return View();
        }

        /// <summary>
        /// 修改支付密码
        /// </summary>
        /// <returns></returns>
        public ActionResult payPwd()
        {
            return View();
        }
        /// <summary>
        /// 修改支付密码
        /// </summary>
        /// <returns></returns>
        public ActionResult forgetPayPwd()
        {
            return View();
        }
        /// <summary>
        /// 退款/售后列表
        /// </summary>
        /// <returns></returns>
        public ActionResult orderRefunds()
        {
            return View();
        }

        /// <summary>
        /// 经营回馈
        /// </summary>
        /// <returns></returns>
        public ActionResult businessFeedBack()
        {
            return View();
        }
        /// <summary>
        /// 门店新增会员详情
        /// </summary>
        /// <returns></returns>
        public ActionResult storeMembers()
        {
            return View();
        }
        /// <summary>
        /// 门店销售详情
        /// </summary>
        /// <returns></returns>
        public ActionResult storeSales()
        {
            return View();
        }
        /// <summary>
        /// 门店充值详情
        /// </summary>
        /// <returns></returns>
        public ActionResult storeRecharge()
        {
            return View();
        }
        /// <summary>
        /// 门店已结算详情
        /// </summary>
        /// <returns></returns>
        public ActionResult storeBack()
        {
            return View();
        }
    }
}