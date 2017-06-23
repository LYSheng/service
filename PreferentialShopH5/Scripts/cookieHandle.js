//写cookies,name是cookie的名字，value是cookie的值，domain是cookie可以访问的域名，path是cookie可以访问的路径，exprites是cookie的时长，以天为单位
function setCookie(name, value, domain, path, expries) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expries * 24 * 60 * 60 * 1000);
    //var str = name + "="+ escape (value) + ";expires=" + exp.toGMTString();  //escape处理的值会加密
    var str = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    if (domain != "") {
        str += ";domain=" + domain;
    }
    if (path != "") {
        str += ";path=" + path;
    }

    document.cookie = str;
}

//读取cookies 
//function getCookie(name) { 
//    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

//    if(arr=document.cookie.match(reg))

//        return unescape(arr[2]); 
//    else 
//        return null; 
//}
function getCookie(c_name, getEmpty) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");//这里因为传进来的的参数就是带引号的字符串，所以c_name可以不用加引号
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);//当indexOf()带2个参数时，第二个代表其实位置，参数是数字，这个数字可以加引号也可以不加（最好还是别加吧）
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    if (getEmpty) {
        return "";
    }
    return null;
}