title: 阅读underscore源码笔记
date: 2014-09-22 18:29:08
tags: [underscorejs,bind,伪协议]
---
	本文为原创作品，可以转载，但请添加本文连接，谢谢传阅

underscorejs，一个实用的的Javascript函数库，值得推荐，[官网地址](http://underscorejs.org)，[Github仓库](https://github.com/jashkenas/underscore)，[有注释的源码](http://underscorejs.org/docs/underscore.html)
<!--more-->
+ `obj.length === +obj.length` 判断obj.length是不是一个数字，“+”会吧非number类型的值尝试转换为number类型，如果失败返回NAN。
+ `void 0` 这个相信大家经常见，但是你明白它是做什么的吗？而且我们遇到的情况大多都是在超链接里写着`Javascript:(void 0)`，现在我又遇到了`a === void 0`,好吧，不买官子了，其实这个是用来防止`undefined`被重置（关于这一点可以点击[这里](http://jruif.github.io/2014-09/Javascript%E7%A7%98%E5%AF%86%E8%8A%B1%E5%9B%AD[%E6%91%98%E5%BD%95]/#undefined的值)查看），而[void](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void)是一个修饰参数的前缀关键字，并且永远返回`undefined`，因此在超链接里使用void 0就清晰了，返回`undefined`就阻止了`a`标签的默认事件。例如：
  ```javascript
  void 0
  void (0)
  void "hello"
  void (new Date())
  //都将返回undefined
  ```
  为什么使用0，我只想说呵呵，谁让`0`最短小可爱呢。
+ ECMAScript5中的bind，underscore的实现方法
  ```Javascript
  var nativeBind = FuncProto.bind;
  var Ctor = function(){};
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, Array.prototype.slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = Array.prototype.slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(Array.prototype.slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };
  ```
  bind很多人不明白为什么在有了call和apply还是要出个bind，看完这段代码大家应该明白了吧，其实就是内存驻留版的apply(更多详情前点击[这里](http://jruif.github.io/gh-pages/#324))。

好了今天就看到这儿了，其实这个库结构很简单，但是却实现了很多使用的功能函数，下面在copy一段比较实用函数。

```javascript
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };
```

> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4