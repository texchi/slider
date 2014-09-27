/**
 *
 * @authors     Damon (damon.chen@yeshm.com)
 * @date        14-1-13 下午5:20
 * @description 1. 支持同时切换多个slideshow;
 *              2. 支持canvas毛玻璃效果
 *              3. 支持图片responsive
 */

define(function(require, exports, modules) {

    // 引入依赖包
    require('jquery');

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
            descWrap    : null, // 包含文字描述的 wrapper，但文字内容和图片是分离的时候，可以使用
            autoPlay    : false, // 是否自动播放
            width       : 900, // 默认宽度
            height      : 600, // 默认高度
            speed       : 500, // 播放速度
            delay       : 2000, // 切换速度
            currentCss  : 'current', // 当前图片的 css class 名
            imgEffect   : 'slide', // 默认的图片切换效果
            descEffect  : 'slide', // 默认的文字内容切换效果
            easing      : 'easeOutQuad' // 默认的切换物理效果
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

            // 初始化 this.curIndex 和 this.oldIndex 的值
            this.curIndex = 0;
            this.oldIndex = this.length - 1;
        },

        /**
         * 改变 css 类名
         */
        changeCssClass: function() {
            var me = this;
            this.imgObj.eq(me.curIndex).addClass(this.opts.currentCss).css('z-index', me.zIndexMax);
            this.imgObj.eq(me.oldIndex).removeClass(me.opts.currentCss).css('z-index', me.zIndexMax - 1);
        },

        /**
         * 改变 this.curIndex 和 this.oldIndex 的值
         */
        changeIndex: function() {

            var curIndex = this.curIndex;

            // 改变 this.curIndex 和 this.oldIndex 的值
            if (curIndex == 0) {
                this.curIndex = curIndex + 1;
                this.oldIndex = curIndex;
            } else if (curIndex == this.length - 1) {
                this.curIndex = 0;
                this.oldIndex = curIndex;
            } else {
                this.curIndex++;
                this.oldIndex++;
            }
        },

        switchSlider: function() {
            this.changeIndex();
            this.changeCssClass();
        },

        autoPlay: function() {
            var me = this;

            me.count = setInterval(function() {

                me.switchSlider();

            }, me.opts.delay);
        }

    };


});

