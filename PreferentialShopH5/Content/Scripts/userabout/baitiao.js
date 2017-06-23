
ajaxGet();
function ajaxGet() {
    apiRequest({
        method: "UserIou/Get",
        async: true,
        beforeSend: function () {
            if ($(".loadingFixed").length <= 0) {
                smGlobal.loadingFixed();
                $(".loadingFixed").show();
            }
        },
        success: function (obj) {
            smGlobal.removeHomeGif();

            if (obj.isBizSuccess) {
                console.log(obj)
                $("#other").html(obj.data.balance.toFixed(2));
                $("#total").html((obj.data.balance + obj.data.used).toFixed(2));
                precent(obj.data.balance , obj.data.used);
            }
        },
        error: function (obj) {
            smGlobal.removeHomeGif();
            smGlobal.error(obj);
        }
    });
}

function precent(total,use){
    var percent = ((total-use)/total)*100;
    $('.left').addClass('wth');
   if (percent > 100) {
       $('.circle').removeClass('clip-auto');
       $('.right').addClass('wth0');
       return;
   } else if (percent > 50) {
       $('.circle').addClass('clip-auto');
       $('.right').removeClass('wth0');
       $('.left').removeClass('wth');
   }
   $('.left').css("-webkit-transform", "rotate(" + (18 / 5) * percent + "deg)");
   $('.num>span').text(percent);
}

