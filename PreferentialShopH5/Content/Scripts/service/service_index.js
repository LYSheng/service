
$("body").on('touchstart', '.Personal', function () {
    $(".Mask").animate({ left: '0' });
});
$("body").on('touchstart', '.Mask_right', function () {
    $(".Mask").animate({ left: '-100%' });
});

$("body").on('touchstart', '.Mask_redact', function () {
    $(".bj_input").show();
    $(".Mask_name").hide();
    $(this).hide();
});
$("body").on('blur', '.bj_input', function () {
    $(this).hide()
    $(".Mask_name").show()
    $(".Mask_redact").show()
});