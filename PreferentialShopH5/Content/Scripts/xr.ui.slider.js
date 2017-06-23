var interval;
var _intervalID = null;
(function ($) {
    /**
     * 插件用的css
     * @type {{}}
     */
    var css = {
        //      轮播图外层css
        llbSlider: "llbSlider",
        //      图片列表css
        sliderPics: "sliderPics",
        //      轮播控制列表css
        sliderLists: "sliderLists",
        //      轮播图轮播到当前位置的图片的css
        cur: "cur",
        //      轮播控制列表css
        sliderOps: "sliderOps"
    };
    
    /**
     * 打乱数组并随机排序形成新数组
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    function _randomsort(a, b) {
        return Math.random() > .5 ? -1 : 1;//用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
    }

    /**
     * 创建分页源码
     * @param $this
     * @returns {boolean}
     */
    function createHtml($this) {
        var objWidth = $this.width();
        //console.log($this);
        //是否要随机显示轮播图
        if (options.bRandom) {
            options.data = options.data.sort(_randomsort);
        }
        //创建图片列表
        var picLists = $("<ul class='clearfix posrelative'></ul>").addClass(css.sliderPics);
        //操作图片滚动列表
        var sliderLists = $("<ul></ul>").addClass(css.sliderLists + " " + css.sliderOps);
        $.each(options.data, function (i, val) {
            picLists.append($("<li style='width:" + objWidth + "px' classs='posrelative'></li>").append($("<a></a>").attr({ "href": val.link }).html("<img src='" + val.picUrl + "' class='full-width'/>")).append("<i class='posabsolute skilledStatue'></i>"));
            sliderLists.append($("<li></li>").append($("<a></a>").attr({ "href": "javascript:void(0)" })));
        });
        //console.log($(".sliderPics").height());
        picLists.css({ "width": objWidth });
        $this.addClass(css.llbSlider);//.css({ "height": "191px" });
        $this.append(picLists).append(sliderLists);
        $(picLists[0]).fadeTo(options.fadeOutTime, 1);
        _init($this);
    }

    /**
     * 初始化
     * @private
     */
    function _init($this) {
        var defaultOpts = { interval: options.interval, fadeInTime: options.fadeInTime, fadeOutTime: options.fadeOutTime, durationTime: options.durationTime,container:options.container };
        var picLists = $this.find("." + css.sliderPics).eq(0);
        var _sliderLists = $this.find("." + css.sliderLists).eq(0).find("li");
        var _sliderPics = $this.find("." + css.sliderPics).eq(0).find("li");
        var _count = options.data.length;
        var _current = 0;
        var _bSliderRun = true;
        var changeFlag = true;
        
        var objWidth = $this.width();
        var stop = function () {
            window.clearInterval(_intervalID);
        };
        var countTimeDown = function (options, callback) {
            var settings = $.extend({
                date: null,
                offset: null,
                container: null,
                startTime:null
            }, options);
            
            // Throw error if date is not set
            if (!settings.date) {
                $.error('Date is not defined.');
            }
            if (settings.date.indexOf("-") != -1) {
                settings.date = settings.date.replace(/\-/g, "/");
            }
            if (settings.startTime.indexOf("-") != -1) {
                settings.startTime = settings.startTime.replace(/\-/g, "/");
            }
            
            // Throw error if date is set incorectly
            if (!Date.parse(settings.date)) {
                $.error('Incorrect date format, it should look like this, 12/24/2012 12:00:00.');
            }

            // Save container
            var container = settings.container;

            /**
             * Change client's local date to match offset timezone
             * @return {Object} Fixed Date object.
             */
            var currentDate = function () {
                // get client's current date
                var date = new Date();

                // turn date to utc
                var utc = date.getTime() + (date.getTimezoneOffset() * 60000);

                // set new Date object
                var new_date = new Date(utc + (3600000 * settings.offset))

                return new_date;
            };

            /**
             * Main downCount function that calculates everything
             */
            function countdown() {
                var target_date = new Date(settings.date), // set target date
                    current_date = currentDate(),
                    startTime = new Date(settings.startTime); // get fixed current date

                // difference of dates
                //var difference = target_date - current_date;
                var promotionBeginTime = startTime - current_date;
                if (promotionBeginTime > 0) {
                    var difference = startTime - current_date;
                } else {
                    var difference = target_date - current_date;
                }
                // if difference is negative than it's pass the target date
                if (difference < 0) {
                    // stop timer
                    clearInterval(interval);
                    if (callback && typeof callback === 'function') callback();
                    return;
                }

                // basic math variables
                var _second = 1000,
                    _minute = _second * 60,
                    _hour = _minute * 60,
                    _day = _hour * 24;

                // calculate dates
                var days = Math.floor(difference / _day),
                    hours = Math.floor((difference % _day) / _hour),
                    minutes = Math.floor((difference % _hour) / _minute),
                    seconds = Math.floor((difference % _minute) / _second);

                // fix dates so that it will show two digets
                days = (String(days).length >= 2) ? days : '0' + days;
                hours = (String(hours).length >= 2) ? hours : '0' + hours;
                minutes = (String(minutes).length >= 2) ? minutes : '0' + minutes;
                seconds = (String(seconds).length >= 2) ? seconds : '0' + seconds;

                // based on the date change the refrence wording
                var ref_days = (days === 1) ? 'day' : 'days',
                    ref_hours = (hours === 1) ? 'hour' : 'hours',
                    ref_minutes = (minutes === 1) ? 'minute' : 'minutes',
                    ref_seconds = (seconds === 1) ? 'second' : 'seconds';
                if (changeFlag) {
                   // if ($(".leftTime").find(".skiIrfame").length <= 0) {
                       if (promotionBeginTime > 0) {
                            $(".skilledStatue").html("<img src='/content/images/skilledComming.jpg'/>");
                            $(".leftTime").addClass("colBlack").html('距离开抢还有<span class="skiIrfame">00</span>:<span class="skiIrfame">00</span>:<span class="skiIrfame">00</span>');
                        } else {
                            $(".leftTime").removeClass("colBlack").html('距离结束还有<span class="skiIrfame">00</span>:<span class="skiIrfame">00</span>:<span class="skiIrfame">00</span>');
                            $(".skilledStatue").html("<img src='/content/images/skilleding.jpg'/>");
                        }
                   // }
                    
                }
                // set to DOM
                
                //container.find('.days').text(days);
                container.find('.skiIrfame').eq(0).text(hours);
                container.find('.skiIrfame').eq(1).text(minutes);
                container.find('.skiIrfame').eq(2).text(seconds);
                changeFlag = false;
                //container.find('.days_ref').text(ref_days);
                //container.find('.hours_ref').text(ref_hours);
                //container.find('.minutes_ref').text(ref_minutes);
                //container.find('.seconds_ref').text(ref_seconds);
            };
            countdown();
            // start
            interval = setInterval(countdown, 1000);
        };
        // 执行图片滚动
        var play = function () {
            //console.log(interval);
            clearInterval(interval);
            //console.log(options.data[_current].endTime)
            changeFlag = true;
            if (options.data[_current].isOver == 0 && options.data[_current].status == 1) {
                countTimeDown({ date: options.data[_current].endTime, offset: +8, container: $(".leftTime"), startTime: options.data[_current].startTime }, function () {
                    //console.log('促销已经结束！');
                    $(".leftTime").eq(tabsIndex).html("该商品已售罄");
                    $(".skilledStatue").html("<img src='/content/images/skilledError.jpg'/>");
                });
            }else{
                $(".leftTime").addClass("colBlack").html('活动抢购已结束，敬请期待下次抢购！');
                $(".skilledStatue").html("<img src='/content/images/skilledError.jpg'/>");
            }
           
            //判断是否加载了图片，如果未加载图片，则加载
            if (!_sliderPics.eq(_current).find("a").length > 0) {
                _sliderPics.eq(_current).append($("<a></a>").attr({ "target": "_blank", "href": options.data[_current].link }).html("<img src='" + options.data[_current].picUrl + "' class='full-width'/>"));
            }
            var dist = _current * objWidth * (-1);
            //if (_bSliderRun) {
            //    _bSliderRun = false;
            //} else { }
            setTimeout(function () {
                picLists.css({ "transitionDuration": defaultOpts.durationTime, "-moz-transition-duration": defaultOpts.durationTime, "-webkit-transition-duration": defaultOpts.durationTime, "-o-transition-duration": defaultOpts.durationTime })
                picLists.css({ "transform": 'translate(' + dist + 'px,0)' + 'translateZ(0)', "-ms-transform": 'translateX(' + dist + 'px)', "-moz-transform": 'translateX(' + dist + 'px)', "-webkit-transform": 'translate(' + dist + 'px,0) translateZ(0)', "-o-transform": 'translateX(' + dist + 'px)' });
            }, 100)
        };
        //图片向后滚动
        var next = function () {
            _current = (_current >= (_count - 1)) ? 0 : (++_current);
            //console.log(_current)
            play();
        };
        //图片向前滚动
        var prev = function () {
            _current = (_current <= 0) ? _count - 1 : --_current;
            play();
        };              
        if (options.autoSwitch) {
            if (_bSliderRun) {
                //$this.append("<i class='posabsolute skilled'></i>")
                changeFlag = true;
                if (options.data[0].isOver==0 && options.data[0].status ==1) {
                    countTimeDown({ date: options.data[0].endTime, offset: +8, container: $(".leftTime"), startTime: options.data[0].startTime }, function () {
                        console.log('促销已经结束！');
                        $(".skilledStatue").html("<img src='/content/images/skilledError.jpg'/>");
                    });
                } else {
                    $(".leftTime").addClass("colBlack").html('活动抢购已结束，敬请期待下次抢购！');
                    $(".skilledStatue").html("<img src='/content/images/skilledError.jpg'/>");
                }
            }
        }
    }

    //public method
    var methods = {
        init: function (initOptions) {
            options = $.extend({}, $.fn.xrSlider.defaults, initOptions);
            var $this = $(this);
            return this.each(function () {
                createHtml($this);
            });
        },
        destroy: function () {
            return this.each(function () {
            });
        },
        option: function (key, value) {
            if (arguments.length == 2)
                return this.each(function () {
                    if (options[key]) {
                        options[key] = value;
                    }
                });
            else
                return options[key];
        }
    }

    var methodName = "xrSlider";

    var options = {};

    /**
     *  插件入口
     */
    $.fn.xrSlider = function () {
        var method = arguments[0];
        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof method === "object" || !method) {
            method = methods.init;
        } else {
            $.error("Method(" + method + ") does not exist on " + methodName);
            return this;
        }
        return method.apply(this, arguments);
    }
    $.fn.xrSlider.defaults = {
        interval: 3000,  //图片轮播一次的时间
        fadeInTime: 800, //图片淡入的时间
        fadeOutTime: 1000, //图片淡出的时间
        bRandom: false,   //图片是否随机显示
        autoSwitch: true,  //图片是否自动轮播
        durationTime: '300ms'
    };
})(jQuery);
