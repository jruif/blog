title: "HTML 5 History API的'前生今世'"
date: 2014-10-27 22:16:39
tags: [HTML5,history,pushState,replaceState]
---
<!-- MarkdownTOC -->

- [为什么介绍History API ？](#为什么介绍history-api-？)
- [浏览器支持](#浏览器支持)
- [使用History](#使用history)
- [Demo示例](#demo示例)
	- [Demo 1：HTML 5 History API – pushState](#demo-1：html-5-history-api-–-pushstate)
	- [Demo 2：HTML 5 History API – replaceState](#demo-2：html-5-history-api-–-replacestate)
- [总结](#总结)

<!-- /MarkdownTOC -->


History是有趣的，不是吗？在之前的HTML版本中，我们对浏览历史记录的操作非常有限。我们可以来回使用可以使用的方法，但这就是一切我们能做的了。

但是，利用HTML 5的History API，我们可以更好的控制浏览器的历史记录了。例如：我们可以添加一条记录到历史记录的列表中，或者在没有刷新时，可以更新地址栏的URL。
<!--more-->
## 为什么介绍History API ？

在这篇文章中，我们将了解HTML 5中History API的来源。在此之前，我们经常使用散列值来改变页面内容，特别是那些对页面特别重要的内容。因为没有刷新，所以对于单页面应用，改变其URL是不可能的。此外，当你改变URL的散列值值，它对浏览器的历史记录没有任何影响。

然后，现在对于HTML 5的History API来说，这些都是可以轻易实现的，但是由于单页面应用没必要使用散列值，它可能需要额外的开发脚本。它也允许我们用一种对SEO友好的方式建立新应用。此外，它能减少带宽，但是该怎么证明呢？

在文章中，我将用History API开发一个单页应用来证明上述的问题。

这也意味着我必须先在首页加载必要的资源。现在开始，页面仅仅加载需要的内容。换句话说，应用并不是一开始就加载了全部的内容，在请求第二个应用内容时，才会被加载。

注意,您需要执行一些服务器端编码只提供部分资源,而不是完整的页面内容。

## 浏览器支持

在写这篇文章的时候，各主流浏览器对History API的支持是非常不错的，可以[点击此处](http://caniuse.com/#search=history)查看其支持情况，这个链接会告诉你支持的浏览器，并使用之前，总有良好的实践来检测支持的特定功能。

为了用变成方式确定浏览器是否支持这个API，可以用下面的一行代码检验：
```javascript
return !!(window.history && history.pushState);
```
此外,我建议参考一下这篇文章:[Detect Support for Various HTML5 Features](http://www.xpertdeveloper.com/2014/08/detect-html5-features/).
如果你是用的现代浏览器，可以用下面的代码：
```javascript
if (Modernizr.history) {
    // History API Supported
}
```
如果你的浏览器不支持History API，可以使用[history.js](https://github.com/browserstate/history.js)代替。


## 使用History

HTML 5提供了两个新方法：
1、history.pushState();                
2、history.replaceState();

两种方法都允许我们添加和更新历史记录，它们的工作原理相同并且可以添加数量相同的参数。除了方法之外，还有popstate事件。在后文中将介绍怎么使用和什么时候使用popstate事件。

pushState()和replaceState()参数一样，参数说明如下：

1、state：存储JSON字符串，可以用在popstate事件中。

2、title：现在大多数浏览器不支持或者忽略这个参数，最好用null代替

3、url：任意有效的URL，用于更新浏览器的地址栏，并不在乎URL是否已经存在地址列表中。更重要的是，它不会重新加载页面。

两个方法的主要区别就是：pushState()是在history栈中添加一个新的条目，replaceState()是替换当前的记录值。如果你还对这个有迷惑，就用一些示例来证明这个区别。

假设我们有两个栈块，一个标记为1,另一个标记为2，你有第三个栈块，标记为3。当执行pushState()时，栈块3将被添加到已经存在的栈中，因此，栈就有3个块栈了。

同样的假设情景下，当执行replaceState()时，将在块2的堆栈和放置块3。所以history的记录条数不变，也就是说，pushState()会让history的数量加1.

比较结果如下图：
![](/img/20141027.jpg)

到此，为了控制浏览器的历史记录，我们忽略了pushState()和replaceState()的事件。但是假设浏览器统计了许多的不良记录，用户可能会被重定向到这些页面，或许也不会。在这种情况下，当用户使用浏览器的前进和后退导航按钮时就会产生意外的问题。

尽管当我们使用pushState()和replaceState()进行处理时，期待popstate事件被触发。但实际上，情况并不是这样。相反，当你浏览会话历史记录时，不管你是点击前进或者后退按钮，还是使用history.go和history.back方法，popstate都会被触发。

>In WebKit browsers, a popstate event would be triggered after document’s onload event, but Firefox and IE do not have this behavior.（在WebKit浏览器中，popstate事件在document的onload事件后触发，Firefox和IE没有这种行为）。

## Demo示例

HTML：
```html
<div class="container">
    <div class="row">
        <ul class="nav navbar-nav">
            <li><a href="home.html" class="historyAPI">Home</a></li>
            <li><a href="about.html" class="historyAPI">About</a></li>
            <li><a href="contact.html" class="historyAPI">Contact</a></li>
        </ul>
    </div>
    <div class="row">
        <div class="col-md-6">
            <div class="well">
                Click on Links above to see history API usage using <code>pushState</code> method.
            </div>
        </div>
        <div class="row">   
            <div class="jumbotron" id="contentHolder">
                <h1>Home!</h1>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </div>
        </div>
    </div>
</div>
```
JavaScript：
```javascript
<script type="text/javascript">
    jQuery('document').ready(function(){
 
        jQuery('.historyAPI').on('click', function(e){
            e.preventDefault();
            var href = $(this).attr('href');
 
            // Getting Content
            getContent(href, true);
 
            jQuery('.historyAPI').removeClass('active');
            $(this).addClass('active');
        });
 
    });
 
    // Adding popstate event listener to handle browser back button 
    window.addEventListener("popstate", function(e) {
 
        // Get State value using e.state
        getContent(location.pathname, false);
    });
 
    function getContent(url, addEntry) {
        $.get(url)
        .done(function( data ) {
 
            // Updating Content on Page
            $('#contentHolder').html(data);
 
            if(addEntry == true) {
                // Add History Entry using pushState
                history.pushState(null, null, url);
            }
 
        });
    }
</script>
```
### Demo 1：HTML 5 History API – pushState

历史条目在浏览器中被计算，并且可以很容易的使用浏览器的前进和后退按钮。[View Demo](http://demo.xpertdeveloper.com/history-api/demo1.html)  （ps:你在点击demo1的选项卡时，其记录会被添加到浏览器的历史记录，当点击后退/前进按钮时，可以回到/跳到你之前点击的选项卡对应的页面）

### Demo 2：HTML 5 History API – replaceState

历史条目在浏览器中被更新，并且不能使用浏览器的前进和后退按钮进行浏览。[View Demo](http://demo.xpertdeveloper.com/history-api/demo2.html)  （ps:你在点击demo1的选项卡时，其记录会被替换当前浏览器的历史记录，当点击后退/前进按钮时，不可以回到/跳到你之前点击的选项卡对应的页面，而是返回/跳到你进入demo2的上一个页面）

## 总结

HTML 5中的History API 对Web应用有着很大的影响。为了更容易的创建有效率的、对SEO友好的单页面应用，它移除了对散列值的依赖


> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4