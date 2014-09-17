title: 你或许想要用到的三个新的Javascript API
date: 2014-08-05 11:19:48
tags: [Web Alarms,Presentation,Standby,新API]
---
	本文由 伯乐在线 - 刘忻沂 翻译自 Aurelio De Rosa。

　　如果你是一个SitePoint的老读者并且是我的粉丝的话，那么你已经知道我写了很多关于HTML5以及JS API的文章。到目前为止，我已经发布了一些介绍你现在就可以马上使用的API，尽管可能会用到polyfill的方式。（译注：不知道什么是polyfill请[点击这里](http://www.kankanews.com/ICkengine/archives/70998.shtml)。）

但是今天我可能要打破这个常规来给大家介绍一些仍然还处在初期阶段的API。大家必须知道这些API是非常新的，在这三个里面有两个都是在几天之前刚刚发布的。正因如此，这些API现目前都还无法使用。但是如果你有兴趣了解它们具体是用来做什么的，你可以继续阅读下面关于它们的详细介绍，同时也欢迎留下你的看法和回应。

废话不多说，现在开始！
<!-- more -->

<!-- MarkdownTOC -->

- [Web Alarms API](#web-alarms-api)
- [Presentation API](#presentation-api)
- [Standby API](#standby-api)
- [总结](#总结)

<!-- /MarkdownTOC -->


### Web Alarms API

　　Web Alarms API让你可以配置设备的闹铃设置，从而能够安排通知消息或让某个特定的应用在指定的时间点启动。这个API最典型的用法会涉及到像闹钟，日历，或其他任何需要在特定时间进行特定操作的程序。

自从去年开始，这个API刚刚成为了一个W3C的设计草案。因此所有有待成为W3C官方推荐的相关细节都还在初期阶段。这个API需要通过window.navigator对象下的alarms属性来使用。alarms属性会提供三个函数：

* getAll(): 从设备获取全部已有的闹铃并以包含Alarm对象的数组形式返回。
* add(): 注册一个基于Date对象的闹铃并返回一个AlarmRequest对象。
* remove(): 通过唯一ID移除一个之前注册的闹铃（唯一性仅针对应用本身）

　　为了向大家演示理想情况下这些函数应当如何使用，这里有一个添加闹铃的例子（请记住现目前任何浏览器都不支持这段代码）

```javascript
var alarmId;
var request = navigator.alarms.add(
    new Date("June 29, 2012 07:30:00"),
    "respectTimezone",
);
 
request.onsuccess = function (e) {
    alarmId = e.target.result;
};
 
request.onerror = function (e) {
    alert(e.target.error.name);
};
```
　　如果你想要了解更多关于Web Alarms API，请参阅[相关细节文档。](http://www.w3.org/TR/web-alarms/)

### Presentation API
　　Presentation API的目标就是让投影仪或TV这样的第二显示设备能够被Web使用，包括所有通过有线（HDMI，DVI等）连接以及通过无线（MiraCast, Chromecast, DLNA, AirPlay等）的设备。这个API所做的就是在请求页面与第二显示设备上的演示页面之间实现消息互通。

　　请注意该API细节并不属于W3C标准，也不在W3C标准计划当中。这个API需要通过window.navigator对象下的presentation属性来使用。该属性提供了一个叫requestSession()函数，以及present和availablechange两个事件。requestSession()函数可以用来启动或恢复第二显示设备上的演示。它会返回一个session对象指代当前的演示。当通过requestSession()传入的url里面的演示内容被加载完成后，演示屏幕的页面会收到present事件。最后，在第一张演示出现后或者最后一张演示完成后会发出availablechange事件。

　　举个例子，来自细节文档，该API的用法如下所示：
```html
<button disabled>Show</button>
 
<script>
var presentation = navigator.presentation,
    showButton = document.querySelector('button');
 
presentation.onavailablechange = function(e) {
  showButton.disabled = !e.available;
  showButton.onclick = show;
};
 
function show() {
  var session = presentation.requestSession('http://example.org/');
 
  session.onstatechange = function() {
    switch (session.state) {
      case 'connected':
        session.postMessage(/*...*/);
        session.onmessage = function() { /*...*/ };
        break;
      case 'disconnected':
        console.log('Disconnected.');
        break;
    }
  };
}
</script>
```
　　如果你想要了解更多关于Presentation API的消息，[可以看看最终报告。](http://webscreens.github.io/presentation-api)

### Standby API
　　Standby API让你可以在顶层浏览器页面中请求屏幕持续显示锁。这可以防止设备进入省电状态（例如屏幕自动关闭）。这个功能对有些web应用来说至关重要。例如，想像一下你正在驾车并在手机上使用基于web的导航软件（非本地应用）。如果你不去触碰屏幕的话，你的手机的屏幕会自动关闭，除非你事前在手机上进行过相关的设置。在这样的情况下，通常你是想要让屏幕保持显示状态的。这恰恰是这个API适用的地方。

这个API需要通过window.navigator对象下的wakeLock属性来使用。它会提供两个函数：

* request(): 使当前应用能让屏幕保持显示状态。
* release(): 释放持续显示锁，这样屏幕就不会再被强制要求显示。
　　这两个函数都只接受一个参数，其只能是“screen”或“system”。前者表示操作针对的是设备屏幕，而后者针对的是除屏幕之外如CPU或广播之类的其他设备资源。

　　以下例子会演示如何适用该API让设备屏幕保持显示状态：
```javascript
navigator.wakeLock.request("display").then(
    function successFunction() {
        // do something
    },
    function errorFunction() {
        // do something else
    }
);
```
　　要让设备允许屏幕关闭，我们可以用以下方法：
```javascript
navigator.wakeLock.release("display");
```
　　如果你想要了解关于Standby API的更多信息，可以参考这个[非官方草案。](http://boiler23.github.io/screen-wake/)

### 总结

　　在这篇文章里我给大家介绍了一些崭新的JS API。我要再次强调因为它们都还处在非常早期的阶段，所以目前没有浏览器支持。因此我们也没法实际地操作它们。然而正因为它们如此之新大家现在都有机会跟进它们接下来的发展甚至参与帮助它们的细节设计的完善。

　　Web开发的未来一片光明，加入进来吧！

By:[Aurelio De Rosa](http://www.sitepoint.com/3-new-javascript-apis-may-want-follow/)