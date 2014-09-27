Slider
======

### Version
0.0.1

---

### In the wild
- [y-in](http://www.y-in.com)

---

### Denpendence
- [Seajs](seajs.org/) - The project is managed by Seajs, so I still use it here.
- [jQuery](jquery.com/) - This Slider plugin is mainly dependent on jquery.
- [jQuery-easing](https://github.com/gdsmith/jquery.easing)

---

### API
```Javascript
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
```

---

### How to use
HTML:

```HTML
<ul class="slideshow">
    <li><img src="..." />
    <li><img src="..." />
    <li><img src="..." />
</ul>
```

CSS:
```CSS
.slideshow {
    position: relative;
}

.slideshow li {
    position: absolute;
}
```

JavaScript:
```Javascript
var optSlider1 = {
	imgWrap: $('ul.slideshow'),
	autoPlay: true
};

new Slider(optSlider1);
```

---

### Custom Effect
Everyone can easily add your own effect to slider.js, only three step:

##### Step 1
Find the `effect()` method. Suppose you will add an effect "fade"
```Jacascript
effect: function(e, o) {
    var me = this;

    switch (e) {
        case 'slide':
            me.slide(o, me.imgWidth);
            break;
        case 'fade': // Custom effect
            me.fade(o);
            break;
        default:
            break
    }
},
```

##### Step 2
Program your `fade()` method
```Javascript
fade: function(o) {
    // Some codes here...
}
```

##### Step 3
When you invoke the method, specify the `imgEffect` API
```Javascript
var optSlider1 = {
	imgWrap: $('ul.slideshow'),
	autoPlay: true,
	imgEffect: 'fade' // Specify it
};

new Slider(optSlider1);
```

Now your slideshow is fade in and fade out.

---

### License
slider.js is available under the terms of the [MIT License](https://github.com/fengzifz/slider/blob/master/LICENSE).