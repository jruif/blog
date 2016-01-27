title: 同构Javascript应用实践
date: 2016-01-27 11:32:22
tags: [react,redux,express,promise]
---

在上个项目中使用了垂涎已久的redux ＋ react，说实在话，现在还陶醉在这种开发模式中，严格的单向数据流，近乎强制的分层方式，让我在前期废了好多脑细胞，不过，当他的好处凸显的时候完全是指数级的上升，而且这种方式特别适合多人合作，后期维护的难度也是很低，这也是我做前端项目以来感受最深的地方，不过作为SPA，它也存在一个巨大的缺陷：必须客户端渲染。这就导致客户在第一次进入页面的时候变的非常慢，为了合理有效的解决这个问题，我也尝试了一把服务器使用相同的代码来渲染页面。

其实服务器渲染页面是一件很简单的事，但是为了提高代码的重用，我决定使用同构的方式来实现，何为同构？就是一套相同的代码既能在客户端使用，也能在服务器端使用，这在以前是一件很蛋疼的事，应为我们既然做了前后端分离，现在又要做服务器端渲染，这不是在坑后端吗。。。不过同构就不同了，我们把我们的前端渲染代码也放在服务器端使用，这样既完成了前后端分离，也解决了制约SPA的两大痛点：SEO的困难以及首次进入的缓慢。
<!-- more -->

>注：本文是建立在上一篇博客的基础上的，还没有用过或没有了解过Redux on React的同学，可以先看我上一篇博客。

既然我们要在服务器使用客户端的代码渲染页面，那我们应该先考虑如何提供与客户端一致的基础环境（这里使用的是express搭建的服务器），所以我们需要引入react／redux等包，如下所示：
```js
// ./server.js
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
```

既然是要在服务器端解析react，那我们还需要引入下面这个包：
```js
// ./server.js
import ReactDOMServer from 'react-dom/server';
```

在此，我们的基础环境就有了，现在我们需要引入我们的业务代码了,但是我们到底需要引入那些必要的包呢，在上一篇文章中我介绍了redux是如何用在react中的，在`./index.js`中，我们使用下面的代码来初始化应用，如下所示：
```js
// ./index.js
const store = configureStore(initialState);
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
```

而且我们也知道，在redux on react应用中，store是一个关键的枢纽，可以完全比喻为中央控制系统，应用的state也是存储在store中，在redux on react应用中，state是渲染页面的基础，所以我们现在要做的第一步就是创建state，以及把Provide填充进`./index.html`的`root`元素中。创建代码如下所示：

```js
// ./server.js
// 创建redux实例
const store = createStore(counterApp, {counter: 10});
// 使用react渲染组件
const html = ReactDOMServer.renderToString(<Provider store={store}><App /></Provider>);
```
在上例子中，我们给state一个初始值`counter: 10`，并使用了renderToString来进行解析jsx模版，现在我们要考虑的是什么时候使用使用，我们都知道在express中，客户端请求服务器的时候，我们通过下面的例子来处理请求：
```js
// ./server.js
 app.get("/", function(req, res) {
   res.sendFile(__dirname + '/index.html')
 })
```
那么同样的我们可以改造下返回的函数就能完成我们渲染成的字符串：
```js
// ./server.js
function handleRender(req, res) {
    // 创建redux实例
    const store = createStore(counterApp, {counter: 10});
    // 使用react渲染组件
    const html = ReactDOMServer.renderToString(<Provider store={store}><App /></Provider>);
    rs.send(renderFullPage(html));
}
function renderFullPage(html) {
    return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redux counter example－1-1-2</title>
          </head>
          <body>
            <div id="root">
                ${html}
            </div>
            <script src="/static/bundle.js"></script>
          </body>
        </html>
    `;
}
app.get("/", handleRender);
```
那么现在，当用户再去请求根节点的时候我们就返回的是我们渲染好的页面，但是现在还有个问题，当页面在客户端初始化的时候，客户端的js也会根据初始状态来更新页面，而我们上面设置的初始值就完全没有什么作用了，所以我们应该吧初始值也传给客户端，不仅仅渲染进页面中。
```js
// ./server.js
function handleRender(req, res) {
    // 创建redux实例
    const store = createStore(counterApp, {counter: 10});
    // 使用react渲染组件
    const html = ReactDOMServer.renderToString(<Provider store={store}><App /></Provider>);
    // 从 store 中获得初始 state
    const initialState = store.getState();
    rs.send(renderFullPage(html,initialState));
}
function renderFullPage(html) {
    return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redux counter example－1-1-2</title>
          </head>
          <body>
            <div id="root">
                ${html}
            </div>
            <script type="text/javascript">
                window._initialState_ = ${JSON.stringify(initialState)};
            </script>
            <script src="/static/bundle.js"></script>
          </body>
        </html>
    `;
}
```
在`./index.js`我们也要做相应的处理
```js
// ./index.js
const initialState = window._initialState_;
const store = configureStore(initialState);
```
至此，我们基本完成了SPA页面在服务器端端端渲染，但是我不喜欢把模版直接写在代码中，由于fs.readFile是异步的，而且也不推荐使用同步读文件，所以我使用了promise对上面的`renderFullPage`做了处理。
```js
// ./server.js
import Promise from 'promise'
var read = Promise.denodeify(fs.readFile);
function handleRender(req, res) {
    // 创建redux实例
    const store = createStore(counterApp, {counter: 10});
    // 使用react渲染组件
    const html = ReactDOMServer.renderToString(<Provider store={store}><App /></Provider>);
    // 从 store 中获得初始 state
    const initialState = store.getState();
    renderFullPage(html, initialState).then( html =>{
        res.send(html);
    });
}
function renderFullPage(html, initialState) {
    return read(__dirname + '/index.html', 'utf8').then(data => {
        // 模版解析
        return data.replace(/(\$\{.+\})/g, function (a, b) {
            return eval(b.replace(/[${}]/g, ''));
        });
    }).catch(err => {
        console.log('error:',err);
    });
}
```

由于nodejs的5.0版本不支持ES6的`import`，所以我们还需要babel的一个组件来处理
```js
// ./star.js
require('babel/register');
require('./server');
```




> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4