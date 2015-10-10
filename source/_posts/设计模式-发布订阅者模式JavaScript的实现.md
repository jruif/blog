title: '【设计模式】观察者模式JavaScript的实现'
date: 2015-10-10 13:32:57
tags: [设计模式,观察者模式,JavaScript Patterns]
---
> 写在开始的话：没有最好的设计模式，只有最合适的设计模式，学会它，并忘记它的存在。


###观测者模式的定义
观察者模式是软甲工程中一种设计模式，也叫订阅发布者模式。在此模式中，一个目标对象管理所有相依于它的观察者对象，并且在它本身的状态改变时主动发出通知。这通常透过呼叫各观察者所提供的方法来实现。

是不是很咬文嚼字，其实可以用生活中很多示例来说明这种模式，例如订阅报纸，报社需要做的是`收集（subscribe）`需要订阅`某种杂志（topic）`的用户，并保留他们的`通信地址（callback）`，每当这种杂志`发布（publish）`的时候，报社需要做的是给他的用户`送去杂志（调用callback）`。而作为用户不需要去知道这个杂志什么时候发布。
<!-- more -->
其实JavaScript中的事件系统也是这种模式，我们并不知道这个事件什么时候会发生，我们只需要做的是监听（subscribe）事件（topic）绑定回调函数（callback）。

由此可见观察者模式应该包含一下行为：
+ 订阅（添附） subscribe
+ 取消订阅（解附） unsubscribe
+ 发布（通知） publish


###观察者模式的用途
在维基百科上对于观察者模式的用途有以下描述：
+ 当抽象个体有两个互相依赖的层面时。封装这些层面在单独的对象内将可允许程序员单独地去变更与重复使用这些对象，而不会产生两者之间交互的问题。
+ 当其中一个对象的变更会影响其他对象，却又不知道多少对象必须被同时变更时。
+ 当对象应该有能力通知其他对象，又不应该知道其他对象的实做细节时。

可以总结为：
* 一对多的关系
* 一个改变其他也会变更
* 帮助解耦，便于对象间通信


###观察者模式的实现
```javascript
function subPub(){
    this.cache = {};
}
subPub.prototype = {
    subscribe: function(topic, callback) {
        var cache = this.cache;
        if (!cache[topic]) {
            cache[topic] = [];
        }  
        cache[topic].push(callback);
        return [topic, cache[topic]];
    },
    publish: function(topic, args) {
        var cache = this.cache;
        if (toString.call(args) !== '[object Array]') {
            args = [].slice.call(arguments, 1);
        }
        cache[topic] && cache[topic].forEach(function(elm, i, arr) {
            elm.apply(null, args || []);
        });
    },
    unsubscribe: function(topic, handle) {
        var cache = this.cache;
        if (toString.call(handle) !== '[object Array]') {
            handle = [].slice.call(arguments,1);
        }
        cache[topic] = cache[topic] && cache[topic].filter(function(elm, index, arr) {
            for (var i = 0; i < handle.length; i++) {
                if(elm == handle[i]){
                    return 0;
                }
            };
            return 1;
        });
    }
}
```

###测试用例

```javascript
var sp = new subPub;
var h1 = function(){
    console.log('start')
}
var h2 = function(){
    console.log(arguments)
}
var h3 = function(){
    console.log('end')
}
sp.subscribe('/test/1',h1)
sp.subscribe('/test/1',h2)
sp.publish('/test/1',8,9,6,5)
//==>
//start 
//[8, 9, 6, 5]
sp.subscribe('/test/1',h3)
sp.publish('/test/1',8,9,6,5)
//start
//[8, 9, 6, 5]
//end
sp.unsubscribe('/test/1',h1)
sp.publish('/test/1',8,9,6,5)
//[8, 9, 6, 5]
//end
sp.unsubscribe('/test/1',h2,h3)
sp.publish('/test/1',8,9,6,5)
//
```

本文为作者Jruif原创，如有错误请指正，如转载请注明出处，谢谢。

相关链接：
[维基百科：观察者模式](https://zh.wikipedia.org/wiki/%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F)
[JavaScript Patterns Collection](http://shichuan.github.io/javascript-patterns/)

> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4