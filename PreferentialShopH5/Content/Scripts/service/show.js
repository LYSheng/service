
//$('table').tablesort().data('tablesort');
var Month = $(".Month");
var MonthBox = $(".Month_Box");
Month.click(function () {
    Month.eq($(this).index()).addClass("nav_active").siblings().removeClass('nav_active');
    MonthBox.hide().eq($(this).index()).show();
});

var flag = true;
$("body").on('touchstart', '.sort_click', function () {
    var shang = $(".shang");
    var xia = $(".xia");
    if (flag) {
        $(this).find(shang).addClass("active");
        $(this).find(xia).removeClass("active");
        flag = !flag;
    } else {
        $(this).find(xia).addClass("active");
        $(this).find(shang).removeClass("active");
        flag = !flag;
    }
    console.log(flag)

    
});
