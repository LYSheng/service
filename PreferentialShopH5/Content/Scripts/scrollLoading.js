$.fn.scrollLoading = function (a) {
    var b = {
        attr: "data-url",
        container: $(window),
        callback: $.noop
    };
    var c = $.extend({}, b, a || {});
    c.cache = [];
    $(this).each(function () {
        var g = this.nodeName.toLowerCase(),
        f = $(this).attr(c.attr);
        var h = {
            obj: $(this),
            tag: g,
            url: f
        };
        c.cache.push(h);
    });
    var e = function (f) {
        if ($.isFunction(c.callback)) {
            c.callback.call(f.get(0));
        }
    };
    var d = function () {
        var f = c.container.height();
        if ($(window).get(0) === window) {
            contop = $(window).scrollTop();
        } else {
            contop = c.container.offset().top;
        }
        $.each(c.cache,
        function (l, m) {
            var n = m.obj,
            h = m.tag,
            j = m.url,
            k, g;
            if (n) {
                k = n.offset().top - contop,
                g = k + n.height();
                if ((k >= 0 && k < f) || (g > 0 && g <= f)) {
                    if (j) {
                        if (h === "img") {
                            e(n.attr("src", j));
                        } else {
                            n.load(j, {},
                            function () {
                                e(n);
                            });
                        }
                    } else {
                        e(n);
                    }
                    m.obj = null;
                }
            }
        });
    };
    d();
    c.container.bind("scroll", d);
};