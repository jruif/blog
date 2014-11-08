title: jquery中ready和和DOM的load事件
date: 2014-11-08 15:50:04
tags: [jquery,源码解读,ready,load]
---

jquery中ready和和DOM的load事件

常用的文档加载方法有以下三种（两种jquery的方法）：

```javascript
$(document).ready(function(){
		//todo
});
$(function(){
	//todo
});
window.load=function(){
	//todo
};
```
<!--more-->
这三种方式中，第二种是第一种的简写，可以看作一种方式，那么ready和load有何区别？

那我们看下DOM的文档加载的步骤：

+ 解析HTML结构；
+ 加载外部脚本和样式表文件；
+ 解析并执行脚本代码；
+ 构造HTML DOM模型；
+ 加载图片等外部文件；
+ 页面加载完毕。

在举个测试用例吧

```javascript
	$(document).ready(function(){
		console.log("jQuery的ready方法");
	});
	window.load=function(){
		console.log("DOM的load方法");
	};
	console.log("立即执行函数");
```

从以上步骤中，第三步执行的是立即执行函数，jquery的ready在第四步也就是构造HTML DOM模型的时候执行，而load在页面完全加载完之后执行。

所以可以看的出这两个方法的区别是外部资源的文件的加载上。在现在，如果为了加载几个图片，甚至用户根本没有兴趣看的图片，而让用户无限制的等待是一个非常低级的用户体验问题，所以执行在资源加载之前的代码是完全有益无害的。

我们看下jquery对ready 的实现

```javascript
// 用于DOM ready的延期
var readyList;
//用于外部调用的ready函数
jquery.fn.ready=function (fn) {
    // 添加异步回调
    jQuery.ready.promise().done(fn);
    return this;
}

jQuery.extend({
	// 当DOM可用的时候设置为true
	isReady: false,
	// 用来统计有多少个元素在等待的计数器
	readyWait: 1,
	// 挂起（或释放）ready事件
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// 当DOM ready的时候进行处理
	ready: function( wait ) {
		// 如果DOM还没有准备好，则readyWait计数器自减，否则使用isReady标记的状态
		// 其实就是判断wait的状态有没有改变为false
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}
		// 用于标记DOM已经准备好
		jQuery.isReady = true;
		// 如果正常的DOM ready事件已经发生
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}
		// 执行被绑定在延迟对象上的函数（jquery的deferred.resolveWith() API）
		readyList.resolveWith( document, [ jQuery ] );
		// 触发绑定的ready事件，并解绑
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

```
上面是jQuery对ready事件的包装过程，虽然简短的几局代码，还是可以看的出来惊心动魄的过程啊。

而下面这段代码是jQuery对文档加载时机应用的处理过程

```javascript
/**
 * ready事件的处理函数，并解除事件监听
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}
jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {
		// readyList的初始化为延迟对象
		readyList = jQuery.Deferred();
		// 浏览器事件发生之后获取$(document).ready()被调用的情况
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			// 用异步方式处理jQuery.ready，使脚本延时准备
			setTimeout( jQuery.ready );
		} else {
			// 监听"DOMContentLoaded"事件
			document.addEventListener( "DOMContentLoaded", completed, false );
			// 备胎
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};
// 不论终端有没有准备好都启动DOM ready检查
jQuery.ready.promise();
});
```
DOMContentLoaded只在IE9+和现代浏览器上有，但是IE8-怎么办？jQuery作者使用document.readyState检测是否为完成状态，然后利用setTimeout触发ready函数，收益一定会在DOM ready完成之后执行，
还有一种[方法](http://javascript.nwbox.com/IEContentLoaded/)，是通过不断使用doScoll()方法，由于DOM没有准备完成的时候运行doScoll()会报错，所以必须把doScoll放在try/catch结构中,例如：

```javascript
	try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        document.documentElement.doScroll("left");
    } catch( error ) {
        setTimeout( arguments.callee, 0 );
    }
```

> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4