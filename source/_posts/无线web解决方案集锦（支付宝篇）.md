title: 无线web解决方案集锦（支付宝篇）
date: 2016-03-23 18:06:03
tags: [无线web开发,click延迟,touch事件,旋转判断,Media Query,居中]
---------------------------------------------------

>本文摘录自[支付宝无线开发团队](http://am-team.github.io/amg/dev-exp-doc.html)

## DOM选择器
html5为了我们提供了一个非常好的DOM选择器，就是document.querySelector和document.querySelectorAll这两个方法，这两个方法在android2.1+以及ios3+以后，都可以使用，其接受的参数为css选择器。在实际web开发中，有一部大部分工作会用到DOM的操作，通过这个神器，可以解决大多数的DOM的操作。建议大家使用的时候，可以多多使用这两个方法。
<!-- more -->
其他的DOM的选择器的兼容性并不是太好，建议不要使用。

## 事件

### 手势事件
touchstart //当手指接触屏幕时触发
touchmove //当已经接触屏幕的手指开始移动后触发
touchend //当手指离开屏幕时触发
touchcancel

### 触摸事件
gesturestart //当两个手指接触屏幕时触发
gesturechange //当两个手指接触屏幕后开始移动时触发
gestureend

### 屏幕旋转事件
onorientationchange  

### 检测触摸屏幕的手指何时改变方向
orientationchange

### touch事件支持的相关属性
touches
targetTouches
changedTouches
clientX　　　　// X coordinate of touch relative to the viewport (excludes scroll offset)
clientY　　　　// Y coordinate of touch relative to the viewport (excludes scroll offset)
screenX　　　 // Relative to the screen
screenY 　　 // Relative to the screen
pageX　　 　　// Relative to the full page (includes scrolling)
pageY　　　　 // Relative to the full page (includes scrolling)
target　　　　 // Node the touch event originated from
identifier　　 // An identifying number, unique to each touch event
屏幕旋转事件：onorientationchange

### 判断屏幕是否旋转
```js
function orientationChange() {
    switch(window.orientation) {
    　　case 0:
            alert("肖像模式 0,screen-width: " + screen.width + "; screen-height:" + screen.height);
            break;
    　　case -90:
            alert("左旋 -90,screen-width: " + screen.width + "; screen-height:" + screen.height);
            break;
    　　case 90:
            alert("右旋 90,screen-width: " + screen.width + "; screen-height:" + screen.height);
            break;
    　　case 180:
        　　alert("风景模式 180,screen-width: " + screen.width + "; screen-height:" + screen.height);
        　　break;
    };};
```

### 添加事件监听
```js
addEventListener('load', function(){
    orientationChange();
    window.onorientationchange = orientationChange;
});
```

### 双手指滑动事件：
```js
// 双手指滑动事件
addEventListener('load',function(){ 
        window.onmousewheel = twoFingerScroll;
    },
    false              // 兼容各浏览器，表示在冒泡阶段调用事件处理程序 (true 捕获阶段)
);
function twoFingerScroll(ev) {
    var delta =ev.wheelDelta/120; //对 delta 值进行判断(比如正负) ，而后执行相应操作
    return true;
};
```

### JS 单击延迟
click 事件因为要等待单击确认，会有 300ms 的延迟，体验并不是很好。
开发者大多数会使用封装的 tap 事件来代替click 事件，所谓的 tap 事件由 touchstart 事件 + touchmove 判断 + touchend 事件封装组成。
在移动浏览器中对触摸事件的响应顺序应当是：`ontouchstart -> ontouchmove -> ontouchend -> onclick`。
使用click会出现绑定点击区域闪一下的情况，解决：给该元素一个样式如下：
```css
-webkit-tap-highlight-color: rgba(0,0,0,0);
```
如果不使用click，也不能简单的用touchstart或touchend替代，需要用touchstart的模拟一个click事件，并且不能发生touchmove事件，或者用zepto中的tap（轻击）事件。
```css
body{
    -webkit-overflow-scrolling: touch;
}
```
用iphone或ipad浏览很长的网页滚动时的滑动效果很不错吧？不过如果是一个div，然后设置 `height:200px;overflow:auto;`的话，可以滚动但是完全没有那滑动效果，很郁闷吧？

我看到很多网站为了实现这一效果，用了第三方类库，最常用的是iscroll（包括新浪手机页，百度等） 我一开始也使用，不过自从用了`-webkit-overflow-scrolling: touch;`样式后，就完全可以抛弃第三方类库了，把它加在body{}区域，所有的overflow需要滚动的都可以生效了。

## 利用 Media Query监听
Media Query 相信大部分人已经使用过了。其实 JavaScript可以配合 Media Query这么用：
```js
var mql = window.matchMedia("(orientation: portrait)");
mql.addListener(handleOrientationChange);
handleOrientationChange(mql);
function handleOrientationChange(mql) {
  if (mql.matches) {
    alert('The device is currently in portrait orientation ')
  } else {
    alert('The device is currently in landscape orientation')
  }
}
```
借助了 Media Query 接口做的事件监听，所以很强大！也可以通过获取 CSS 值来使用 Media Query 判断设备情况，详情请看：[JavaScript 依据 CSS Media Queries 判断设备的方法](http://yujiangshui.com/use-javascript-css-media-queries-detect-device-state/)

## 页面描述
```html
<link rel="apple-touch-icon-precomposed" href="http://www.xxx.com/App_icon_114.png" />
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="http://www.xxx.com/App_icon_72.png" />
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="http://www.xxx.com/App_icon_114.png" />
```
这个属性是当用户把连接保存到手机桌面时使用的图标，如果不设置，则会用网页的截图。有了这，就可以让你的网页像APP一样存在手机里了

```html
<link rel="apple-touch-startup-image" href="/img/startup.png" />
```
这个是APP启动画面图片，用途和上面的类似，如果不设置，启动画面就是白屏，图片像素就是手机全屏的像素

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```
这个描述是表示打开的web app的最上面的时间、信号栏是黑色的，当然也可以设置其它参数，详细参数说明请参照[Safari HTML Reference - Supported Meta Tags](https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)

## 阻止屏幕旋转时字体自动调整
```css
html, body, form, fieldset, p, div, h1, h2, h3, h4, h5, h6 {
    -webkit-text-size-adjust:none;
}
```

## 模拟:hover伪类
因为iPhone并没有鼠标指针，所以没有hover事件。那么CSS :hover伪类就没用了。但是iPhone有Touch事件，onTouchStart 类似 onMouseOver，onTouchEnd 类似 onMouseOut。所以我们可以用它来模拟hover。使用Javascript：
```js
var myLinks = document.getElementsByTagName('a');
for(var i = 0; i < myLinks.length; i++){
　　 myLinks[i].addEventListener(’touchstart’, function(){
        this.className = “hover”;
    }, false);
　　 myLinks[i].addEventListener(’touchend’, function(){
        this.className = “”;
    }, false);
}
```
然后用CSS增加hover效果：
```css
a:hover, a.hover { /* 你的hover效果 */ }
```

## 居中问题
居中是移动端跟pc端共同的噩梦。这里有两种兼容性比较好的新方案。
* table布局法
```css
.box{ 
    text-align:center; 
    display:table-cell; 
    vertical-align:middle; 
}
```
* 老版本flex布局法
```css
.box{ 
    display:-webkit-box; 
    -webkit-box-pack: center; 
    -webkit-box-align: center; 
    text-align:center; 
}
```

以上两种其实分别是retchat跟ionic的布局基石。

## 处理 Retina 双倍屏幕
[使用CSS3的background-size优化苹果的Retina屏幕的图像显示](http://www.w3cplus.com/css/css-background-size-graphics.html)
[（经典）Using CSS Sprites to optimize your website for Retina Displays](http://miekd.com/articles/using-css-sprites-to-optimize-your-website-for-retina-displays/)
[使用css sprites来优化你的网站在Retina屏幕下显示](http://www.w3cplus.com/css/using-css-sprites-to-optimize-your-website-for-retina-displays.html)

## input类型为date情况下不支持placeholder
这其实是浏览器自己的处理。因为浏览器会针对此类型 input 增加 datepicker 模块。

对 input type date 使用 placeholder 的目的是为了让用户更准确的输入日期格式，iOS 上会有 datepicker 不会显示 placeholder 文字，但是为了统一表单外观，往往需要显示。Android 部分机型没有 datepicker 也不会显示 placeholder 文字。

桌面端（Mac）
+ Safari 不支持 datepicker，placeholder 正常显示。
+ Firefox 不支持 datepicker，placeholder 正常显示。
+ Chrome 支持 datepicker，显示 年、月、日 格式，忽略 placeholder。
移动端
+ iPhone5 iOS7 有 datepicker 功能，但是不显示 placeholder。
+ Andorid 4.0.4 无 datepicker 功能，不显示 placeholder

解决方法：
```html
<input placeholder="Date" class="textbox-n" type="text" onfocus="(this.type='date')"  id="date">
```
因为text是支持placeholder的。因此当用户focus的时候自动把type类型改变为date，这样既有placeholder也有datepicker了。

## 引导用户安装并打开app
通过iframe src发送请求打开app自定义url scheme，如taobao://home（淘宝首页） 、etao://scan（一淘扫描）); 如果安装了客户端则会直接唤起，直接唤起后，之前浏览器窗口（或者扫码工具的webview）推入后台； 如果在指定的时间内客户端没有被唤起，则js重定向到app下载地址。 大概实现代码如下:
```js
goToNative:function(){

    if(!body) {
        setTimeout(function(){
            doc.body.appendChild(iframe);
        }, 0);
    } else {
        body.appendChild(iframe);
    }

    setTimeout(function() {
        doc.body.removeChild(iframe);
        //去下载，下载链接一般是itunes app store或者apk文件链接
        gotoDownload(startTime);
        /**
         + 测试时间设置小于800ms时，在android下的UC浏览器会打开native app时并下载apk，
         + 测试android+UC下打开native的时间最好大于800ms;
         */
    }, 800);
}
```

## 消除transition闪屏
两个方法：使用css3动画的时尽量利用3D加速，从而使得动画变得流畅。动画过程中的动画闪白可以通过 backface-visibility 隐藏。
```css
-webkit-transform-style: preserve-3d;
/*设置内嵌的元素在 3D 空间如何呈现：保留 3D*/
-webkit-backface-visibility: hidden;
/*（设置进行转换的元素的背面在面对用户时是否可见：隐藏）*/
```

## iOS 6 跟 iPhone 5

### IP5 的媒体查询:
```css
@media (device-height: 568px) and (-webkit-min-device-pixel-ratio: 2) {

/* iPhone 5 or iPod Touch 5th generation */

}
```

### 媒体查询，响应不同启动图片
```css
<link href="startup-568h.png" rel="apple-touch-startup-image" media="(device-height: 568px)">
<link href="startup.png" rel="apple-touch-startup-image" sizes="640x920" media="(device-height: 480px)">
```

### 拍照上传:
```html
<input type=file accept="video/*">
<input type=file accept="image/*">
```
不支持其他类型的文件 ，如音频，Pages文档或PDF文件。 也没有getUserMedia摄像头的实时流媒体支持。

### 智能应用程序横幅
有了智能应用程序横幅，当网站上有一个相关联的本机应用程序时，Safari浏览器可以显示一个横幅。 如果用户没有安装这个应用程序将显示“安装”按钮，或已经安装的显示“查看”按钮可打开它。
在 iTunes Link Maker 搜索我们的应用程序和应用程序ID。
```html
<meta name="apple-itunes-app" content="app-id=9999999">
```
可以使用 app-argument 提供字符串值，如果参加iTunes联盟计划，可以添加元标记数据
```html
<meta name="apple-itunes-app" content="app-id=9999999, app-argument=xxxxxx">
<meta name="apple-itunes-app" content="app-id=9999999, app-argument=xxxxxx, affiliate-data=partnerId=99&siteID=XXXX">
```
横幅需要156像素（设备是312 hi-dpi）在顶部，直到用户在下方点击内容或关闭按钮，你的网站才会展现全部的高度。 它就像HTML的DOM对象，但它不是一个真正的DOM。

## iOS safari BUG 总结

safari对DOM中元素的冒泡机制有个奇葩的BUG，仅限iOS版才会触发

BUG重现用例请见线上DEMO: [地址](http://jsfiddle.net/e75od2bb/34/)

### bug表现与规避
在进行事件委托时，如果将未存在于DOM的元素事件直接委托到body上的话,会导致事件委托失效，调试结果为事件响应到body子元素为止，既没有冒泡到body上，也没有被body所捕获。但如果事件是DOM元素本身具有的，则不会触发bug。换而言之，只有元素的非标准事件（比如click事件之于div）才会触发此bug。
因为bug是由safari的事件解析机制导致，无法修复，但是有多种手段可以规避
如何避免bug触发：不要委托到body结点上，委托到任意指定父元素都可以，或者使用原生具有该事件的元素，如使用click事件触发就用a标签包一层。
已触发如何修补：safari对事件的解析非常特殊，如果一个事件曾经被响应过，则会一直冒泡（捕获）到根结点，所以对于已大规模触发的情况，只需要在body元素的所有子元素绑定一个空事件就好了，如：
```js
("body > *").on("click", function(){};);
```
可能会对性能有一定影响，但是使用方便，大家权衡考虑吧~~~




> 欢迎加入[Javascript前端技术][jsqun]共同讨论，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4