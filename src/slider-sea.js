/**
 *
 * @authors     Damon (damon.chen@yeshm.com)
 * @date        14-1-13 下午5:20
 * @description 1. 支持同时切换多个slideshow;
 *              2. 支持canvas毛玻璃效果
 *              3. 支持图片responsive
 */

define(function(require, exports, modules){

    // 引入效果库
    require('jquery-easing');

    // 引入工具
    var tools = require('../modules/tools.js');


    function Slider(options){

        // 默认设置
        this.opts = $.extend({
            container   : $(this),
            imgWrap     : null, // 图片层
            arrowWrap   : null, // 箭嘴层
            navWrap     : null, // 导航按钮层
            descWrap    : null, // 描述层，当文字描述跟图片需要分离时才使用
            speed       : 500, // 播放速度
            delay       : 3000, // 自动播放时间间隔
            paralDelay  : 300, // 视觉差延迟时间，用来制作视觉差效果的
            navigation  : true, // 是否开启导航
            arrowButton : false, // 左右箭头按钮
            description : false, // 是否开启额外的文字描述层
            imgEffect   : 'slide', // 图片切换效果
            descEffect  : 'slide', // 额外的文字描述切换效果
            autoPlay    : false, // 是否自动播放
            currentCss  : 'current', // 当前CSS类名
            descWidth   : 550, // 描述层宽度，用于计算描述层slide效果滑动距离
            canvasBlur  : false, // 是否使用canvas blur效果，由于IE进行模糊取值时运行过慢，故IE使用fade效果
            ieTime      : 1000, // 使用canvas blur效果时，IE的fade时间
            easing      : 'easeOutQuad', // 默认物理效果
            resizeImage : false
        }, options);


        this.curIndex        = 0; // 当前索引值
        this.oldIndex        = 0; // 上一个索引值
        this.animating       = false; // 是否正在播放
        this.imgObj          = this.opts.imgWrap.find('li');
        this.length          = this.imgObj.length; // 图片数量
        this.count           = 0; // 计时器，用于清除setInterval
        this.isIE            = window.navigator.appVersion.indexOf('MSIE'); // 用于判断是否IE浏览器
        this.ie678           = !-[1,];
        this.ie9             = window.navigator.appVersion.indexOf('MSIE 9.0');
        this.isCanvas        = $('html').hasClass('canvas'); // 用于判断是否支持canvas
        this.imgWidth        = this.imgObj.find('img').width(); // 图片层宽度，用于计算slide效果滑动距离
        this.win             = $(window);
        this.winW            = this.win.width();
        this.winH            = this.win.height();
        this.direction       = 'next';
        this.timeout         = 0;


        this.initialize();

    }

    Slider.prototype = {

        initialize: function(){

            // 设置slideshow高度
            if(this.opts.resizeImg){
                this.resizeImage();
            }

            // 是否开启按钮点击
            if(this.opts.navigation){
                this.clickTo();
            }

            // 是否开启箭头按钮
            if(this.opts.arrowButton){
                this.initArrowBtn();
            }

            // 是否自动播放
            if(this.opts.autoPlay){
                this.autoPlay();
                // this.isAuto = true;
            }

            // 图片container必须指定
            if(!this.opts.imgWrap){
                return null;
            }

            // 是否支持自适应
            if(this.opts.isResponsive){
                // this.setImgSize();
                this.setImgPosition();
            }

            // 开启canvas blur、非IE、支持canvas才使用毛玻璃效果
            if(this.opts.canvasBlur && this.isIE == -1 && this.isCanvas){

                // 引入毛玻璃效果库
                require.async('stackblur')
                this.setCanvasAttr();

                // 创建deferred对象
                this.dtd = $.Deferred();

                // Canvas的jQuery对象
                this.canvas1 = $('#canvas1');
                this.canvas2 = $('#canvas2');

                // Canvas的DOM对象
                this.canvas = document.getElementById('canvas2');

                this.animationEndEvent();
            }

            // 开启navigation时，才查找按钮对象
            if(this.opts.navigation){
                this.navObj = this.opts.navWrap.find('li');
            }

            // 开启description时，才查找desc对象
            if(this.opts.description){
                this.descObj = this.opts.descWrap.find('.desc');
            }

            // 使用手风琴效果时，允许点击图片切换效果
            if(this.opts.imgEffect == 'accordion'){
                this.imgClickTo(this.oldIndex);
            }

        },


        /**
         * Resize图片大小
         */
        resizeImage: function(){
            var me = this,
                imgObj = me.imgObj.find('img'),
                imgPor = Math.ceil(1920 / 980),// 图片比例 宽 : 高


            // 按高度计算
                imgNewH = me.winH,
                imgNewW = imgNewH * imgPor,

                deltaW;


            // 按照浏览器高度适配，在高度合适的情况下，
            // 如果图片宽度小于浏览器高度，则优先适配宽度
            if(imgNewW < me.winW){
                imgNewW = me.winW;
                imgNewH = me.winW / imgPor;

            }

            // Resize图片大小后，对图片进行居中处理
            if(imgNewW > me.winW){
                deltaW = (imgNewW - me.winW) / 2;
                imgObj.css({left: -deltaW});
            }

            imgObj.attr({width: imgNewW, height: imgNewH});

        },


        /**
         * 设置slideshow高度
         */
        resizeHeight: function(){
            var me = this,
            // h = Math.ceil(me.winH * me.opts.heightPer),
                h = me.winH - $('#header').height(),
                per = 1600 / 770;

            w = h * per;

            me.imgObj.find('img').attr({height: h});
            // me.imgObj.css({height: h});

        },


        /**
         * 初始化箭头按钮
         */
        initArrowBtn: function(){
            this.createArrowBtn();
            this.clickArrowBtn();
        },


        /**
         * 创建箭头按钮
         */
        createArrowBtn: function(){
            var me = this;

            // 创建arrow html并添加到document中
            me.opts.arrowWrap.append(
                $('<ul class="arrow_buttons" />').append(
                    $('<li class="arrow_button arrow_prev" data-direction="prev" />'),
                    $('<li class="arrow_button arrow_next" data-direction="next" />')
                )
            );
        },


        /**
         * 给按钮绑定点击功能
         */
        clickArrowBtn: function(){

            // this.animating = true;

            var arrowButton = $('.arrow_button'),
                me = this;

            arrowButton.on('tap', function(){

                // Slideshow正在播放时，点击无效
                if(me.animating || me.timeout != 0){
                    return;
                }

                // 判断点击的是哪个按钮
                var direction = $(this).data('direction');

                // 记录旧index值
                me.oldIndex = me.curIndex;

                // 计算新的index值
                if(direction == 'prev'){

                    me.curIndex--;

                    me.direction = 'prev';

                    if(me.curIndex < 0){
                        me.curIndex = me.length - 1;
                    }

                } else if(direction == 'next'){

                    me.curIndex++;

                    me.direction = 'next';

                    if(me.curIndex > me.length - 1){
                        me.curIndex = 0;
                    }

                }

                me.play();

                // 重设定时器
                if(me.opts.autoPlay){
                    me.resetTimer();
                }

            });

        },


        /**
         * 检测CSS3 animation end event
         */
        animationEndEvent: function(){
            var browser = window.navigator.appVersion;

            if(browser.indexOf('Chrome') !== -1 || browser.indexOf('Safari') !== -1){
                this.endEvent = 'webkitAnimationEnd';
            } else if(browser.indexOf('Gecko')){
                this.endEvent = 'animationend';
            }
        },


        /**
         * 设置图片位置，以适应多分辨率
         */
        setImgPosition: function(){
            this.deltaX = (this.imgObj.width() - this.winW) / 2;
            this.deltaY = (this.imgObj.height() - this.winH) / 2;
            this.imgObj.css({left: -this.deltaX});

            this.imgWidth = this.imgObj.width();
            this.imgHeight = this.imgObj.height();
        },


        /**
         * 设置图片大小，以适应多分辨率
         */
        setImgSize: function(){
            this.imgObj.find('img').attr('width', this.winW + 'px');
        },


        /**
         * 创建canvas
         * @returns {Object}
         */
        createCanvas: function(){
            var canvas = {};
            canvas.c1 = $('<canvas id="canvas1" />');
            canvas.c2 = $('<canvas id="canvas2" />');

            return canvas;
        },


        /**
         * 添加到DOM Tree
         */
        addCanvas: function(){
            var canvas = this.createCanvas();
            this.opts.imgWrap.append(canvas.c1, canvas.c2);

            return canvas;
        },


        /**
         * 设置画布属性
         */
        setCanvasAttr: function(){
            var canvas = this.addCanvas(),
                me = this;

            setAttr(canvas.c1);
            setAttr(canvas.c2);

            function setAttr(o){

                // 设置样式
                o.css({
                    position    : 'absolute',
                    left        : -me.deltaX
                });

                // 设置属性
                o.attr({width: me.imgWidth, height: me.imgHeight});
            }

            return canvas;
        },


        /**
         * 播放
         */
        play: function(){
            var me = this;

            // 播放时禁止操作
            if(me.animating){
                return null;
            }

            // 正在播放
            me.animating = true;


            // 图片播放
            me.effect(me.imgObj, me.opts.imgEffect);

            // 额外的内容播放
            if(me.opts.description){
                me.effect(me.descObj, me.opts.descEffect, me.opts.descWidth);
            }

            me.changeCssClass();

        },


        /**
         * 改变CSS类名
         */
        changeCssClass: function(){
            var me = this;

            // Image CSS 类名
            me.addAndRemoveClass(me.imgObj, me.curIndex, me.oldIndex, me.opts.currentCss);

            // Navigation CSS 类名
            if(me.opts.navigation){
                me.addAndRemoveClass(me.navObj, me.curIndex, me.oldIndex, me.opts.currentCss);
            }

            // Description CSS 类名
            if(me.opts.description){
                me.addAndRemoveClass(me.descObj, me.curIndex, me.oldIndex, me.opts.currentCss);
            }
        },


        /**
         * 效果
         * @param o {jQuery Object}
         * @param e {String}
         * @param p {Number} 滑动效果时，可以指定距离
         */
        effect: function(o, e, p){
            var me = this;

            switch(e){

                // 滑动效果
                case 'slide':

                    var pos = p || me.imgWidth;

                    // 判断位置
                    if(me.curIndex > me.oldIndex){
                        pos = -pos;
                    }

                    me.slide(o, pos);

                    break;

                // 淡出、淡入效果
                case 'fade':
                    me.fade(o);
                    break;

                // Fade & Slide 效果
                case 'fadeAndSlide':

                    var pos = p || me.opts.descWidth;

                    // 判断位置
                    if(me.curIndex > me.oldIndex){
                        pos = -pos;
                    }

                    me.fadeAndSlide(o, pos);

                    break;

                // 毛玻璃效果
                case 'canvasBlur':
                    me.canvasBlur(o, me.curIndex, me.oldIndex);
                    break;

                // 手风琴效果
                case 'accordion':
                    me.accordion(o, me.curIndex, me.oldIndex);
                    break;

                // 压缩效果
                case 'compression':
                    me.compression(o, me.curIndex, me.oldIndex);
                    break;

                case 'sameSlide':
                    me.sameSlide(o);
                    break;

                default:
                    break;
            }

        },


        /**
         * 自动播放
         */
        autoPlay: function(){
            var me = this;
            me.count = setInterval(function(){

                me.turnIndex(me.curIndex + 1);

                if(me.curIndex >= me.length){
                    me.curIndex = 0;
                }

                me.play();

            },me.opts.delay);
        },


        /**
         * 重新设定定时器
         * @param o {jQuery Object}
         * @param bool {Bool}
         */
        resetTimer: function(){
            var me = this;

            clearInterval(me.count);

            me.timeout = 1;

            setTimeout(function(){
                me.autoPlay();
                me.timeout = 0;
            }, me.opts.speed + me.opts.paralDelay);
        },


        /**
         * 暂停自动播放
         */
        stopTimer: function(){
            clearInterval(this.count);
        },


        /**
         * 继续自动播放
         */
        continueTimer: function(){
            this.autoPlay();
        },


        /**
         * 转换current index值，作用于小圆点导航切换
         * @param i {Number} - 当前index值
         */
        turnIndex: function(i){
            this.oldIndex = this.curIndex;
            this.curIndex = i;
        },


        /**
         * 处理CSS类名
         * @param o {jQuery Object} JQ对象
         * @param i {Number} 当前索引值
         * @param j {Number} 上一个索引值
         * @param c {String} CSS类名
         */
        addAndRemoveClass: function(o, i, j, c){

            o.eq(i).addClass(c);
            o.eq(j).removeClass(c);

        },


        /**
         * 点击图片直接切换，适用于手风琴效果
         * @param i {Number}
         */
        imgClickTo: function(j){
            var me = this,
                currentCss = me.opts.currentCss;

            me.imgObj.each(function(i){
                $(this).on('tap', function(){

                    // 点击当前图片或动画正在执行时，直接返回
                    if($(this).hasClass(currentCss) || me.animating){
                        return null;
                    }

                    me.resetTimer();

                    me.turnIndex(i);

                    me.play();

                });
            });
        },


        /**
         * 点击navigation效果
         */
        clickTo: function(){
            var me = this;

            me.opts.navWrap.find('li').each(function(i){

                $(this).on('tap', function(){

                    // 点击当前按钮，不播放
                    if($(this).hasClass(me.opts.currentCss)){
                        return null;
                    }

                    // 正在播放时，直接返回
                    if(me.animating || me.timeout != 0){
                        return null;
                    }

                    /*if(me.count == 0){
                     clearTimeout(me.timeout);
                     }*/

                    // 点击按钮时，让定时器重新计时
                    me.resetTimer();

                    // 转换index
                    me.turnIndex(i);

                    // 播放
                    me.play();

                });
            });
        },


        /**
         * 滑动效果
         * @param o {jQuery Object}
         * @param pos {Number}
         */
        slide: function(o, pos){

            var me = this,
                easing = me.opts.easing;

            // 设置非current图片位置
            o.not('.' + me.opts.currentCss).css({left: -pos});

            // 上一张图片动画
            o.eq(me.oldIndex).animate({left: pos}, me.opts.speed, easing, function(){

                // 标志播放结束
                me.animating = false;

            });

            // 下一张图片动画
            o.eq(me.curIndex).animate({left: 0}, me.opts.speed, easing);
        },


        /**
         * 淡入淡出化以及滑动效果
         * @param o {jQuery Object}
         * @param pos {Number}
         */
        fadeAndSlide: function(o, pos){

            var me = this;

            o.not('.' + me.opts.currentCss).css({left: -pos});

            o.eq(me.oldIndex).animate({opacity: 0, left: pos}, me.opts.speed + me.opts.paralDelay, 'easeOutQuad');

            o.eq(me.curIndex).animate({opacity: 1, left: 0}, me.opts.speed + me.opts.paralDelay, 'easeOutQuad',function(){
                me.animating = false;
            });

        },


        /**
         * 淡入淡出
         * @param o  {jQuery Object}
         */
        fade: function(o){
            var me = this;

            o.eq(me.oldIndex).animate({opacity: 0}, me.opts.speed, function(){
                me.animating = false;
            });
            o.eq(me.curIndex).animate({opacity: 1}, me.opts.speed);
        },


        /**
         * Canvas 毛玻璃效果
         * @param o {jQuery Object}
         * @param i {Number} 当前索引值
         * @param j {Number} 上一个索引值
         */
        canvasBlur: function(o, i, j){

            var me = this;

            // 非IE、非360、支持canvas的浏览器才使用canvas blur
            if(me.isIE == -1 && me.isCanvas && tools.getBrowser() !== '360'){

                var cW = me.imgWidth,
                    cH = me.imgHeight,


                // 获取canvas的2d上下文
                    context1 = document.getElementById('canvas1').getContext('2d'),
                    context2 = document.getElementById('canvas2').getContext('2d'),


                // 获取图片DOM Object
                    img1 = document.getElementById(o.eq(j).find('img').attr('id')),
                    img2 = document.getElementById(o.eq(i).find('img').attr('id'));


                // 将两张图片分别画到两个画布上
                context1.drawImage(img1, 0, 0, cW, cH);
                context2.drawImage(img2, 0, 0, cW, cH);


                // 毛玻璃效果
                stackBlurCanvasRGB('canvas1', 0, 0, cW, cH, 35);
                stackBlurCanvasRGB('canvas2', 0, 0, cW, cH, 35);


                // 更新到chrome32后，用jQuery animate使画布淡出淡入时运行速度很慢，故改成使用CSS3动画
                // 第一张画布淡入
                /*$('#canvas1').addClass('fade_in_out').animate({zIndex:100}, me.opts.speed - 100, function(){

                 // 第一张画布淡出
                 $(this).addClass('fade_out');

                 me.imgObj.eq(me.oldIndex).css({opacity:0});
                 me.imgObj.eq(me.curIndex).css({opacity:1});

                 // 第二张画布淡出
                 $('#canvas2').css({opacity:1}).addClass('canvas2_fade_out').animate({zIndex:99}, me.opts.speed + 500, function(){

                 // 删除CSS3动画
                 $(this).removeClass('canvas2_fade_out').css({opacity:0});
                 $('#canvas1').removeClass('fade_in_out');

                 // 标志动画结束
                 me.animating = false;

                 });

                 });*/

                // 第一张画布淡入
                me.canvas1.addClass('fade_in');

                var animation = function(dtd){

                    var wait = function(){

                        // 图片切换
                        me.imgObj.eq(me.oldIndex).css({opacity:0});
                        me.imgObj.eq(me.curIndex).css({opacity:1});

                        // 第二张画布淡出
                        me.canvas2.css({opacity:1}).addClass('canvas2_fade_out');

                        // 第一张画布淡出
                        me.canvas1.addClass('fade_out')

                        // 监听第二张画布的动画效果是否结束
                        me.canvas.addEventListener(me.endEvent, function(){

                            // 标志deferred对象执行完毕
                            dtd.resolve();

                        });

                    }

                    setTimeout(wait, me.opts.speed - 100);

                    return dtd;
                }


                // 当deferred对象标志结束时才执行
                $.when(animation(me.dtd))
                    .done(function(){

                        var animationEnd = function(){

                            // 删除CSS3动画
                            me.canvas2.removeClass('canvas2_fade_out').css({opacity:0});
                            me.canvas1.removeClass('fade_in fade_out');

                            // 标志动画结束
                            me.animating = false;
                        }

                        setTimeout(animationEnd, 1300);
                    });

            } else { // 否则使用淡入淡出
                me.opts.speed = me.opts.ieTime;
                me.fade(o);
            }
        },


        /**
         * 手风琴效果，动画效果用CSS3
         * @param o {jQuery Object}
         * @param i {Number}
         * @param j {Number}
         */
        accordion: function(o, i, j){
            var me = this;

            // 非ie6789、360浏览器才使用CSS3
            if(!me.ie678 && me.ie9 == -1 && tools.getBrowser() !== '360'){

                o.eq(i).css({width: '70%'});
                o.eq(j).css({width: '15%'});

                setTimeout(function(){
                    me.animating = false;
                }, me.opts.speed + 100);

            } else { // 否则使用jQuery

                o.eq(j).animate({width: '15%'}, me.opts.speed, function(){
                    me.animating = false;
                });

                o.eq(i).animate({width: '70%'}, me.opts.speed);

            }

        },


        /**
         * 压缩效果（改变宽度）
         * @param o {jQuery Object}
         */
        compression: function(o){

            var me = this;

            o.eq(me.curIndex).css({left: 0, zIndex: 2});

            o.eq(me.oldIndex).css({left: 0, zIndex: 3}).animate({
                width   : 0
            }, me.opts.speed, 'easeInOutExpo', function(){

                me.animating = false;

                $(this).css({
                    zIndex  : 0,
                    width   : me.opts.imgWidth
                });

                o.eq(me.curIndex).css({zIndex: 1});
            });

        },


        /**
         * 同一方向滑动效果
         */
        sameSlide: function(o){

            var me = this,
                w = me.winW;

            // 判断方向
            if(me.direction == 'prev'){
                w = -w;
            }

            // 预设下一张图片的位置
            o.eq(me.curIndex).css({left: w});

            // 上一张图片消失
            o.eq(me.oldIndex).animate({left: -w}, me.opts.speed, 'easeInOutExpo');

            // 下一张图片出现
            o.eq(me.curIndex).animate({left: 0}, me.opts.speed, 'easeInOutExpo', function(){
                me.animating = false;
                me.direction = 'next';
            });

        }
    }

    // API
    exports.Slider = Slider;

});