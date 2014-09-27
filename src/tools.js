/**
 *
 * @authors     Damon
 * @date        2014-01-03 09:00:55
 * @description 一些通用函数
 */

define(function(require, exports, module){

    /**
     * 设置元素上下居中
     * @param o - jQuery对象
     */
    function setVerCenter(o){
        var objHeight = o.height(),
            winHeight = $(window).height();

        //针对IE8 获取对象高度兼容性问题
        if(winHeight < 768 && objHeight == 451){
            o.css('marginTop','8%');
        }
        o.css('top', (winHeight - objHeight) / 2);
    }

    /**
     * 设置元素左右居中
     * @param o - jQuery对象
     */
    function setHorCenter(o){
        var objWidth = o.width(),
            winWidth = $(window).width();

        o.css('left', (winWidth - objWidth) / 2);
    }

    /**
     * 给对象o添加类名并去掉其兄弟元素的相同类名
     * @param o - jQuery对象
     * @param c - CSS类名
     */
    function addAndRemoveClass(o, c){
        o.addClass(c).siblings().removeClass(c);
    }

    /**
     * 定时器
     * @param fn { function }
     * @param param { Array }
     * @param time { Number }
     */
    function timer(fn, param, time){
        var t = setTimeout(function(){
            fn.apply(null, param);
            clearTimeout(t);
        }, time);

        return t;
    }


    /**
     * 判断浏览器
     * @returns {string}
     */
    function getBrowser(){
        var b = window.navigator.userAgent,
            n = '';

        switch (true){
            case b.indexOf('Chrome') !== -1:
                n = 'chrome';
                break;
            case b.indexOf('Safari') !== -1:
                n = 'safari';
                break;
            case b.indexOf('Chrome/21.0') !== -1 :
                n = '360';
                break;
            case b.indexOf('Webkit') !== -1:
                n = 'webkit';
                break;
            case b.indexOf('Gecko') !== -1:
                n = 'firefox';
                break;
            case b.indexOf('MSIE 6') !== -1:
                n = 'ie6';
                break;
            case b.indexOf('MSIE 7') !== -1:
                n = 'ie7';
                break;
            case b.indexOf('MSIE 8') !== -1:
                n = 'ie8';
                break;
            case b.indexOf('MSIE 9') !== -1:
                n = 'ie8';
                break;
            default:
                break;
        }

        return n;
    }

    /**
     * Detect the system.
     * @returns {string}
     */
    function getSystem(){
        var b = window.navigator.userAgent,
            n = '',
            mobileUa = /(nokia|sony|ericsson|mot|samsung|sgh|lg|philips|panasonic|alcatel|lenovo|cldc|midp|iPhone|iPad|Android|webOS|BlackBerry)/i;

        switch (true){
            case b.indexOf('Windows NT 6') !== -1 :
                n = 'win7';
                break;
            case b.indexOf('Windows NT 5') !== -1:
                n = 'winXp';
                break;
            case b.indexOf('Macintosh') !== -1:
                n = 'mac';
                break;
            case b.match(mobileUa) !== null:
                n = 'mobile';
                break;
            default:
                break;
        }
        return n;
    }


    /**
     * 使对象进行简单的跳动
     * @param o {jQuery Object}
     * @param t {Number} 跳动时间间隔
     * @param h {Number} 跳动高度
     */
    function jump(o, t, h){
        var originPos = Number(o.css('bottom').match(/\d+/));

        setInterval(function(){
            o.animate({
                bottom: originPos + h
            }, t, function(){
                $(this).animate({bottom: originPos}, t + 100);
            });
        }, t * 5);
    }


    /**
     *
     * @param o {jQuery Object}
     * @param w {Number} 宽度
     * @param h {Number} 高度
     * @param l {Number}
     * @param r {Number}
     */
    function alertWin(o, w, h, l, t, id){
        o.css({
            width   : w,
            height  : h,
            left    : l,
            top     : t,
            display : 'block'
        });
        document.getElementById(id).play();
    }


    /**
     * @param o {jQuery Object}
     * @param id {String} Video ID
     */
    function close(o, id){
        o.css({display: 'none'});
        document.getElementById(id).pause();
    }

    /**
     * 设置透明度
     * @param o {jQuery Object}
     * @param alpha {Number} 透明度
     * @param isAnimate {Bool} 是否使用动画显示透明度
     * @param time {Number} 动画时长
     */
    function setAlpha(o, alpha, isAnimate, time){
        if(isAnimate){

            // Default time
            if(!time){
                time = 1000;
            }

            o.animate({opacity: alpha}, time);
        } else {
            o.css({opacity: alpha});
        }
    }

    /**
     * 用margin值来执行动画
     * @param o {jQuery Object}
     * @param dir {String} 方向
     * @param dis {Number} 距离
     * @param time {Number} 时间
     */
    function setPosition(o, dir, dis, time){
        if(dir == 'left'){
            o.css({marginLeft: -dis}).animate({marginLeft: 0, opacity: 1}, time);
        } else if(dir == 'right'){
            o.css({marginRight: -dis}).animate({marginRight: 0, opacity: 1}, time);
        }
    }

    // API
    exports.setVerCenter        = setVerCenter;
    exports.setHorCenter        = setHorCenter;
    exports.addAndRemoveClass   = addAndRemoveClass;
    exports.timer               = timer;
    exports.getBrowser          = getBrowser;
    exports.getSystem           = getSystem;
    exports.jump                = jump;
    exports.alertWin            = alertWin;
    exports.close               = close;
    exports.setAlpha            = setAlpha;
    exports.setPosition         = setPosition;

});