//by chengxiao,2016

(function(doc, win) {
    //平台、设备和操作系统 
  var system = { 
      win: false, 
      mac: false, 
      xll: false, 
      ipad:false 
  }; 
  //检测平台 
  var p = navigator.platform; 
  system.win = p.indexOf("Win") == 0; 
  system.mac = p.indexOf("Mac") == 0; 
  system.x11 = (p == "X11") || (p.indexOf("Linux") == 0); 
  system.ipad = (navigator.userAgent.match(/iPad/i) != null)?true:false; 
  //if the platform is not mobile device, it'll redirect to NOT FOUND page.
  if (system.win || system.mac || system.xll) {   
  } else { 
  }
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function() {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
        docEl.style.fontSize =  '100px';
        if (50 * (clientWidth / 640) <= 100) {
        docEl.style.fontSize = 50 * (clientWidth / 640) + 'px';
      }
    };
    recalc();
  if (!doc.addEventListener) return;

  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);


