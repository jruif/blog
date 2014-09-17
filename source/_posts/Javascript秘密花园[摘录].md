title: "Javascript秘密花园[摘录]"
date: 2014-09-15 11:14:41
tags: [数组,length,typeof,instanceof,setTimeout,setInterval]
---
	本文来自网络，如有侵权请联系管理员
目录
===
<!-- MarkdownTOC -->

- [数组](#数组)
    - [遍历](#遍历)
    - [length属性](#length属性)
    - [Array 构造函数](#array-构造函数)
- [类型](#类型)
    - [typeof 操作符](#typeof-操作符)
    - [instanceof 操作符](#instanceof-操作符)
- [undefined 和 null](#undefined-和-null)
    - [ndefined 的值](#ndefined-的值)
    - [处理 undefined 值的改变](#处理-undefined-值的改变)
    - [null 的用处](#null-的用处)
- [其他](#其他)
    - [setTimeout 和 setInterval](#settimeout-和-setinterval)
    - [setInterval 的堆调用](#setinterval-的堆调用)

<!-- /MarkdownTOC -->

## 数组

### 遍历

为了达到遍历数组的最佳性能，推荐使用经典的 for 循环。
```javascript
var list = [1, 2, 3, 4, 5, ...... 100000000];
for(var i = 0, l = list.length; i < l; i++) {
    console.log(list[i]);
}
```
上面代码有一个处理，就是通过 l = list.length 来缓存数组的长度。
<!--more-->
虽然 length 是数组的一个属性，但是在每次循环中访问它还是有性能开销。 可能最新的 JavaScript 引擎在这点上做了优化，但是我们没法保证自己的代码是否运行在这些最近的引擎之上。

实际上，不使用缓存数组长度的方式比缓存版本要慢很多。

### length属性

length 属性的 getter 方式会简单的返回数组的长度，而 setter 方式会截断数组。

```javascript
var foo = [1, 2, 3, 4, 5, 6];
foo.length = 3;
foo; // [1, 2, 3]
foo.length = 6;
foo; // [1, 2, 3]
```
译者注： 在 Firebug 中查看此时 foo 的值是： [1, 2, 3, undefined, undefined, undefined] 但是这个结果并不准确，
如果你在 Chrome 的控制台查看 foo 的结果，你会发现是这样的： [1, 2, 3] 因为在 JavaScript 中 undefined 是一个变量，
注意是变量不是关键字，因此上面两个结果的意义是完全不相同的。
```javascript
// 译者注：为了验证，我们来执行下面代码，看序号 5 是否存在于 foo 中。
5 in foo; // 不管在 Firebug 或者 Chrome 都返回 false
foo[5] = undefined;
5 in foo; // 不管在 Firebug 或者 Chrome 都返回 true
```
为 length 设置一个更小的值会截断数组，但是增大 length 属性值不会对数组产生影响。

#### 结论

为了更好的性能，推荐使用普通的 for 循环并缓存数组的 length 属性。 
使用 for in 遍历数组被认为是不好的代码习惯并倾向于产生错误和导致性能问题。

### Array 构造函数

由于 Array 的构造函数在如何处理参数时有点模棱两可，因此总是推荐使用数组的字面语法 - [] - 来创建数组。
```javascript
[1, 2, 3]; // 结果: [1, 2, 3]
new Array(1, 2, 3); // 结果: [1, 2, 3]
[3]; // 结果: [3]
new Array(3); // 结果: [] 
new Array('3') // 结果: ['3']
// 译者注：因此下面的代码将会使人很迷惑
new Array(3, 4, 5); // 结果: [3, 4, 5] 
new Array(3) // 结果: []，此数组长度为 3
```
译者注：这里的模棱两可指的是数组的两种构造函数语法
由于只有一个参数传递到构造函数中（译者注：指的是 new Array(3); 这种调用方式），并且这个参数是数字，构造函数会返回一个 length 属性被设置为此参数的空数组。 需要特别注意的是，此时只有 length 属性被设置，真正的数组并没有生成。

译者注：在 Firebug 中，你会看到 [undefined, undefined, undefined]，这其实是不对的。在上一节有详细的分析。
```javascript
var arr = new Array(3);
arr[1]; // undefined
1 in arr; // false, 数组还没有生成
```
这种优先于设置数组长度属性的做法只在少数几种情况下有用，比如需要循环字符串，可以避免 for 循环的麻烦。
```javascript
new Array(count + 1).join(stringToRepeat);
```
译者注： new Array(3).join('#') 将会返回 ##

#### 结论

应该尽量避免使用数组构造函数创建新数组。推荐使用数组的字面语法。它们更加短小和简洁，因此增加了代码的可读性。

## 类型

### typeof 操作符

typeof 操作符（和 instanceof 一起）或许是 JavaScript 中最大的设计缺陷， 因为几乎不可能从它们那里得到想要的结果。

尽管 instanceof 还有一些极少数的应用场景，typeof 只有一个实际的应用（译者注：这个实际应用是用来检测一个对象是否已经定义或者是否已经赋值）， 而这个应用却不是用来检查对象的类型。

注意: 由于 typeof 也可以像函数的语法被调用，比如 typeof(obj)，但这并是一个函数调用。 那两个小括号只是用来计算一个表达式的值，这个返回值会作为 typeof 操作符的一个操作数。 实际上不存在名为 typeof 的函数。
JavaScript 类型表格

```javascript
Value               Class      Type
-------------------------------------
"foo"               String     String
new String("foo")   String     Object
1.2                 Number     Number
new Number(1.2)     Number     Object
true                Boolean    boolean
new Boolean(true)   Boolean    Object
new Date()          Date       Object
new Error()         Error      Object
[1,2,3]             Array      Object
new Array(1, 2, 3)  Array      Object
new Function("")    Function   function
/abc/g              RegExp     Object (function in Nitro/V8)
new RegExp("meow")  RegExp     Object (function in Nitro/V8)
{}                  Object     Object
new Object()        Object     Object
```
上面表格中，Type 一列表示 typeof 操作符的运算结果。可以看到，这个值在大多数情况下都返回 "object"。

Class 一列表示对象的内部属性 [[Class]] 的值。

JavaScript 标准文档中定义: [[Class]] 的值只可能是下面字符串中的一个： Arguments, Array, Boolean, Date, Error, Function, JSON, Math, Number, Object, RegExp, String.
为了获取对象的 [[Class]]，我们需要使用定义在 Object.prototype 上的方法 toString。

### instanceof 操作符

instanceof 操作符用来比较两个操作数的构造函数。只有在比较自定义的对象时才有意义。 如果用来比较内置类型，将会和 typeof 操作符 一样用处不大。

#### 比较自定义对象
```javascript
function Foo() {}
function Bar() {}
Bar.prototype = new Foo();
new Bar() instanceof Bar; // true
new Bar() instanceof Foo; // true
// 如果仅仅设置 Bar.prototype 为函数 Foo 本身，而不是 Foo 构造函数的一个实例
Bar.prototype = Foo;
new Bar() instanceof Foo; // false
```

#### instanceof 比较内置类型
```javascript
new String('foo') instanceof String; // true
new String('foo') instanceof Object; // true
'foo' instanceof String; // false
'foo' instanceof Object; // false
```

有一点需要注意，instanceof 用来比较属于不同 JavaScript 上下文的对象（比如，浏览器中不同的文档结构）时将会出错， 因为它们的构造函数不会是同一个对象。

#### 结论

instanceof 操作符应该仅仅用来比较来自同一个 JavaScript 上下文的自定义对象。 正如 typeof 操作符一样，任何其它的用法都应该是避免的

## undefined 和 null

###undefined 的值

undefined 是一个值为 undefined 的类型。

这个语言也定义了一个全局变量，它的值是 undefined，这个变量也被称为 undefined。 但是这个变量不是一个常量，也不是一个关键字。这意味着它的值可以轻易被覆盖。

ES5 提示: 在 ECMAScript 5 的严格模式下，undefined 不再是 可写的了。 但是它的名称仍然可以被隐藏，比如定义一个函数名为 undefined。

下面的情况会返回 undefined 值：

+ 访问未修改的全局变量 undefined。
+ 由于没有定义 return 表达式的函数隐式返回。
+ return 表达式没有显式的返回任何内容。
+ 访问不存在的属性。
+ 函数参数没有被显式的传递值。
+ 任何被设置为 undefined 值的变量。

### 处理 undefined 值的改变

由于全局变量 undefined 只是保存了 undefined 类型实际值的副本， 因此对它赋新值不会改变类型 undefined 的值。

然而，为了方便其它变量和 undefined 做比较，我们需要事先获取类型 undefined 的值。

为了避免可能对 undefined 值的改变，一个常用的技巧是使用一个传递到匿名包装器的额外参数。 在调用时，这个参数不会获取任何值。
```javascript
var undefined = 123;
(function(something, foo, undefined) {
    // 局部作用域里的 undefined 变量重新获得了 `undefined` 值
})('Hello World', 42);
```
另外一种达到相同目的方法是在函数内使用变量声明。
```javascript
var undefined = 123;
(function(something, foo) {
    var undefined;
    ...
})('Hello World', 42);
```
这里唯一的区别是，在压缩后并且函数内没有其它需要使用 var 声明变量的情况下，这个版本的代码会多出 4 个字节的代码。

译者注：这里有点绕口，其实很简单。如果此函数内没有其它需要声明的变量，那么 var 总共 4 个字符（包含一个空白字符） 就是专门为 undefined 变量准备的，相比上个例子多出了 4 个字节。

### null 的用处

JavaScript 中的 undefined 的使用场景类似于其它语言中的 null，实际上 JavaScript 中的 null 是另外一种数据类型。

它在 JavaScript 内部有一些使用场景（比如声明原型链的终结 Foo.prototype = null），但是大多数情况下都可以使用 undefined 来代替

## 其他

### setTimeout 和 setInterval

由于 JavaScript 是异步的，可以使用 setTimeout 和 setInterval 来计划执行函数。

注意: 定时处理不是 ECMAScript 的标准，它们在 DOM (文档对象模型) 被实现。
function foo() {}
var id = setTimeout(foo, 1000); // 返回一个大于零的数字
当 setTimeout 被调用时，它会返回一个 ID 标识并且计划在将来大约 1000 毫秒后调用 foo 函数。 foo 函数只会被执行一次。

基于 JavaScript 引擎的计时策略，以及本质上的单线程运行方式，所以其它代码的运行可能会阻塞此线程。 因此没法确保函数会在 setTimeout 指定的时刻被调用。

作为第一个参数的函数将会在全局作用域中执行，因此函数内的 this 将会指向这个全局对象。
```javascript
function Foo() {
    this.value = 42;
    this.method = function() {
        // this 指向全局对象
        console.log(this.value); // 输出：undefined
    };
    setTimeout(this.method, 500);
}
new Foo();
```

注意: setTimeout 的第一个参数是函数对象，一个常犯的错误是这样的 setTimeout(foo(), 1000)， 这里回调函数是 foo 的返回值，而不是foo本身。 大部分情况下，这是一个潜在的错误，因为如果函数返回 undefined，setTimeout 也不会报错。

### setInterval 的堆调用

setTimeout 只会执行回调函数一次，不过 setInterval - 正如名字建议的 - 会每隔 X 毫秒执行函数一次。 但是却不鼓励使用这个函数。

当回调函数的执行被阻塞时，setInterval 仍然会发布更多的回调指令。在很小的定时间隔情况下，这会导致回调函数被堆积起来。
```javascript
function foo(){
    // 阻塞执行 1 秒
}
setInterval(foo, 1000);
```
上面代码中，foo 会执行一次随后被阻塞了一分钟。

在 foo 被阻塞的时候，setInterval 仍然在组织将来对回调函数的调用。 因此，当第一次 foo 函数调用结束时，已经有 10 次函数调用在等待执行。

处理可能的阻塞调用

最简单也是最容易控制的方案，是在回调函数内部使用 setTimeout 函数。
```javascript
function foo(){
    // 阻塞执行 1 秒
    setTimeout(foo, 1000);
}
foo();
```
这样不仅封装了 setTimeout 回调函数，而且阻止了调用指令的堆积，可以有更多的控制。 foo 函数现在可以控制是否继续执行还是终止执行。

建议不要在调用定时器函数时，为了向回调函数传递参数而使用字符串的形式。
```javascript
function foo(a, b, c) {}
// 不要这样做
setTimeout('foo(1,2, 3)', 1000)
// 可以使用匿名函数完成相同功能
setTimeout(function() {
    foo(a, b, c);
}, 1000)
```

#### 结论

绝对不要使用字符串作为 setTimeout 或者 setInterval 的第一个参数， 这么写的代码明显质量很差。当需要向回调函数传递参数时，可以创建一个匿名函数，在函数内执行真实的回调函数。

另外，应该避免使用 setInterval，因为它的定时执行不会被 JavaScript 阻塞。

原文：[http://bonsaiden.github.io/JavaScript-Garden/](http://bonsaiden.github.io/JavaScript-Garden/)  翻译：[三生石上](http://sanshi.me/)