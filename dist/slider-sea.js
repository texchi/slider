/**
 *
 * @authors     Damon (398846606@qq.com)
 * @date        14-1-13 下午5:20
 * @description
 */

define(function(require, exports, modules) {

    // 引入依赖包
    require('jquery');

    require('jquery-easing');

    /**
     * Slider 构造函数
     * @param options
     * @constructor
     */
    function Slider(options) {
        this.opts = $.extend({
            imgWrap     : null, // 包含图片的 wrapper
            arrowWrap   : null, // 包含左右箭头的 wrapper
            navWrap     : null, // 包含导航按钮的 wrapper
            descWrap    : null, // TODO: 包含文字描述的 wrapper，但文字内容和图片是分离的时候，可以使用
            autoPlay    : false, // 是否自动播放
            width       : 900, // TODO: 默认宽度
            height      : 600, // TODO: 默认高度
            speed       : 1000, // 播放速度
            delay       : 3000, // 切换速度
            currentCss  : 'current', // 当前图片的 css class 名
            imgEffect   : 'slide', // 默认的图片切换效果
            descEffect  : 'slide', // TODO: 默认的文字内容切换效果
            easing      : 'easeInOutQuad' // 默认的切换物理效果
        }, options);

        this.curIndex = 0;
        this.oldIndex = 0;
        this.animating = false;
        this.imgObj = this.opts.imgWrap.find('li');
        this.length = this.imgObj.length;
        this.count = 0;
        this.imgWidth = this.imgObj.find('img').width();
        this.win = $(window);
        this.winW = this.win.width();
        this.winH = this.win.height();
        this.zIndexMax = 100;

        this.initialize();

    }

    modules.exports = Slider;

    Slider.prototype = {

        /**
         * 初始化 slide 的方法
         */
        initialize: function() {
            this.initSlider();

            if (this.autoPlay) {
                this.autoPlay();
            }
        },

        /**
         * 初始化 sliders
         * 1. 设置 z-index 的值
         * 2. 第一张图片添加 current 类名
         * 3. 初始化 this.curIndex 和 this.oldIndex 的值
         */
        initSlider: function() {

            var me = this,
                zIndex = 99;

            // 初始化 z-index 的值
            for (var i = 0; i < this.length; i++) {
                this.imgObj.eq(i).css('z-index', zIndex);

                zIndex--;
            }

            // 第一张图片添加 current 类名
            this.imgObj.eq(0).addClass(this.opts.currentCss).css('z-index', me.zIndexMax);

        },

        /**
         * 改变 css 类名
         * @param o JQ 对象
         * @param i 上一张图片索引值
         * @param j 当前图片索引值
         * @param c 要切换的类名
         */
        changeCssClass: function(o, i, j, c) {
            var me = this;
            o.eq(i).addClass(c);
            o.eq(j).removeClass(c);
        },

        /**
         * 改变 this.curIndex 和 this.oldIndex 的值
         * @param i
         */
        changeIndex: function(i) {
            this.oldIndex = this.curIndex;
            this.curIndex = i;
        },

        /**
         * 改变图片的 z-index 属性
         */
        changeZIndex: function() {
            var me = this;
            me.imgObj.not(me.opts.currentCss).css('z-index', me.zIndexMax - 1);
            me.imgObj.eq(me.curIndex).css('z-index', me.zIndexMax);
        },

        /**
         * 改变图片的 z-index 属性和 css 类名
         */
        changeZIndexAndCss: function() {
            var me = this;
            me.changeZIndex();
            me.changeCssClass(me.imgObj, me.curIndex, me.oldIndex, me.opts.currentCss);
        },

        /**
         * 自动播放
         */
        autoPlay: function() {
            var me = this;

            me.count = setInterval(function() {

                me.changeIndex(me.curIndex + 1);

                if (me.curIndex >= me.length) {
                    me.curIndex = 0;
                }

                me.play();

            }, me.opts.delay);
        },

        /**
         * 播放
         * @returns {null}
         */
        play: function() {
            var me = this;

            // 动画正在播放时，不再执行
            if (me.animating) {
                return null;
            }

            me.animating = true;

            me.effect(me.opts.imgEffect, me.imgObj);
        },

        /**
         * 效果切换
         * @param e
         * @param o
         */
        effect: function(e, o) {
            var me = this;

            switch (e) {
                case 'slide':
                    me.slide(o, me.imgWidth);
                    break;
                default:
                    break
            }

        },

        // ============ 效果 Start ============
        /**
         *
         * @param o
         * @param p
         */
        slide: function(o, p) {

            var me = this;

            o.not('.current').css({left: -p});

            console.log(me.oldIndex);

            // 上一张图片的切换
            o.eq(me.oldIndex).animate({left: p}, me.opts.speed, me.opts.easing, function() {
                me.animating = false;
            });

            // 下一张图片的切换
            o.eq(me.curIndex).animate({left: 0}, me.opts.speed);

            me.changeZIndexAndCss();
        }

        // ============ 效果 End ============


    };


});

