
$(function () {
    checkHasLianheCard();
})

function checkHasLianheCard() {
    var cardNum = $(".cradNum strong").text();
    if($.trim(cardNum).length<=0){
        $(".mainContent").html(GetNoCarHtml());
    }
}

function GetNoCarHtml() {
    var html = "<div style='text-align:center;font-size:0.6rem;padding-top:100px'>";
    html += "您还没有开通猫市联合卡";
    html += "</div>"
    return html;
}

var isLodingOver = true;

function turnOnCombineCard() {
    if(!isLodingOver){
        return;
    }
    isLodingOver = false;
    apiRequest({
        method: 'UserAccount/TurnOnCombineCard',
        async: true,
        type: "POST",
        success: function (data) {
            isLodingOver = true;
            smGlobal.complete(".loading1");
            if (data.isBizSuccess) {
                smGlobal.error("开通成功！");
                window.location.reload(true);
            } else {
                smGlobal.error("开通失败！");
            }
        },
        error: function (data) {
            isLodingOver = true;
            smGlobal.error(data);
        }
    });
}


