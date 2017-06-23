

var upinput = $(".up_input");
var inputBox = $(".input_box");


    upinput.on("focus", function () {
    $(this).closest(".input_box").addClass("border")
   })
    upinput.on("blur", function () {
        $(this).closest(".input_box").removeClass("border")
    })
    $("#Mobile").on("blur", function () {
        var pattern = /^1[34578]\d{9}$/;
        var value= pattern.test($("#Mobile").val());
        if (value) {
            console.log(1)
        } else {
           alert("请查看手机格式是否有误")
        }
    })
    $("body").on('touchstart', '.list', function () {
        $(".list_name").removeClass("name_active");
        $(".list_bian").removeClass("yuan_active");
        $(this).children(".list_name").addClass("name_active");
        $(this).children(".list_bian").addClass("yuan_active");
        $(this).addClass("Unique").siblings().removeClass("Unique");
        console.log($(".Unique").children(".list_name").text())
    });
    $(".list_out").on("click", function () {
        $(".pop-up").animate({ left: '-100%' });
    });
    $(".up_img").on("click", function () {
        $(".pop-up").animate({ left: '0' });
    });
    if ($("#nickname").val() == "") {
        $("#nickname").css()
    }
