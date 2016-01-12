title: Redux on React 使用总结
date: 2016-01-12 11:22:50
tags: [react,redux,异步,]
---
>本文原创，欢迎转载，但请注明出处。文中如有不当之处，请不吝指出，谢谢！

在使用状态管理的单页面应用中，我们要处理各种各样的state，这些state包括：

+ 服务器响应
+ 缓存数据
+ 本地生成尚未持久化到服务器的数据
+ UI状态，如激活的路由，被选中的标签，是否显示加载动效或者分页器等等

当应用变得越来越庞大的时候，管理不断变化的state非常困难，model和view之间的关联变化，会引起各种各样的副作用，state 在什么时候，由于什么原因，如何变化已然不受控制。为了解决这类问题，Redux在Flux的基础上，通过`三大原则`构建了一套新的解决方案。

<!-- more -->

## 三大原则

1. 单一数据源

    整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。
2. State 是只读的
    
    改变 store 内 state 的唯一方法就是对它 dispatch 一个 action。
3. 使用纯函数来修改
    
    为了描述 action 如何改变 state tree ，你需要编写 reducer。

## 关键术语 & 详细解读

### Action 和 Action creator
Actions 是用来描述在 app 中发生了什么的普通对象，是描述对象变动意图的唯一途径。
```javascript
{ type: 'ADD_COUNTER', id: 13 }
{ type: 'DECREMENT_COUNTER', id: 42 }
```
一个约定的做法是，actions 拥有一个定值 `type` 帮助 `reducer` 识别它们。

Action Creator 是用来生成`action` 对象的函数，这是Redux推荐的做法，不赞成在分发的时候内联生成它们，这样不方便管理。
例如，比起直接使用对象调用 dispatch ：
```javascript
// somewhere in an event handler
dispatch({
  type: 'ADD_COUNTER',
  id : 13
});
```
而使用 action creator 可以让职责更加清晰：

**actionCreators.js**
```js
export const ADD_COUNTER = 'ADD_COUNTER'
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER'

export function add(id) {
  return {
    type: ADD_COUNTER,
    id
  }
}

export function decrement(id) {
  return {
    type: DECREMENT_COUNTER,
    id
  }
}
```
**AddTodo.js**
```js
import { add } from './actionCreators';

// event handler 里的某处
dispatch(add(13));
```


### Reducer
Reducer 是用来指明应用如何更新 state 的纯函数，它接收旧的 state 和 action，返回一个新的 state `(state, action) => state` 。
使用Reducer需要注意：

1. 不要修改 state！
    可以使用类似 jQuery/lodash 中的`extend`函数来合并一个新的state，也就是ES6中的Object.assign,例如：`_.extend({},state,{...})` 或者 `Object.assign({},state,{...})` (注：示例中的...代表的是其他属性，不是ES6中的解构)。
2. 遇到未知的 action 时，一定要返回旧的 state。

原因主要是，在Reducer中修改state的时候，react.render函数就会不断更新views，当遇到非常大的数据的时候，会怎么样，大家都懂的；还有一点就是reducer返回的state是直接替换了 store 中的 state 的，在未知情况下返回了莫名其名的东西，APP 可能就直接奔溃了。


```js
import { ADD_COUNTER, DECREMENT_COUNTER } from '../action/counter'

let initSate = [];
export default function counter(state = initSate, action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
        return [
            ...state.slice(0, action.id),
            state[action.id] + 1,
            ...state.slice(action.id + 1)
        ];
    case DECREMENT_COUNTER:
        return [
            ...state.slice(0, action.id),
            state[action.id] - 1,
            ...state.slice(action.id + 1)
        ];
    default:
        return state
  }
}
```

### Store
Store 就是用来维持应用所有的 `state` 树 的一个对象，并在当发起 action 的时候调用 reducer。具体来讲就是：

+ 维持应用的 state；
+ 提供 getState() 方法获取 state；
+ 提供 dispatch(action) 方法更新 state；
+ 通过 subscribe(listener) 注册监听器。

根据已有的 reducer 来创建 store 
```js
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
export default function configureStore(initialState) {
    const store = createStore(rootReducer，initialState);
    return store;
}
```

上面代码中的rootReducer是由多个reducer合成的，如下所示
```js
import { combineReducers } from 'redux'
import counter from './counter'
const rootReducer = combineReducers({
    counter
});
export default rootReducer;
```
在传给`combineReducers`中的对象可以有多个reducer，这样我们就可以对reducer进行拆分，拆分后的每一块独立负责管理 state 的一部分。合并后的 reducer 可以调用各个子 reducer，并把它们的结果合并成一个 state 对象。state 对象的结构由传入的多个 reducer 的 key 决定。

### 数据在Redux中
严格的单向数据流是 Redux 架构的设计核心。

例子：
![数据在Redux中](/img/redux-share.png)

Redux应用中数据的生命周期：

1. 调用 store.dispatch(action)。
2. Redux store 调用传入的 reducer 函数。
3. 根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。
4. Redux store 保存了根 reducer 返回的完整 state 树。

### 异步交互
由于Redux 的 store 只支持 同步数据流，所以为了支持异步交互，我们需要像`redux-thunk`或`redux-promise`这样支持异步的 middleware ，他们都包装了 store 的 dispatch() 方法，以此来让你 dispatch 一些除了 action 以外的其他内容，例如：函数或者 Promise。
如下所示，只需在action/counter.js中添加：
```js
export function addAsync(id,delay = 1000) {
  return function(dispatch,getState){
    return setTimeout(() => {
      dispatch(add(id));
    }, delay);
  }
}
```
在创建store的时候，使用applyMiddleware 增强 createStore
```js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './reducers';

// 调用 applyMiddleware，使用 middleware 增强 createStore：
let createStoreWithMiddleware = applyMiddleware(
        thunk
    )(createStore);
export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState)
  return store
}
```
其他组件都不需要变动，在components中直接调用即可。

##  总结
1. 分层设计，职责清晰。
2. 要求store reducer都是页面单例，易于管理。
3. action为设计模式中的请求dto(Data Transfer Object)对象(数据传输对象)，仅仅只是请求类型、请求数据的载体,没有行为。
4. reducer是处理请求的方法。不允许有状态，必须是纯方法。必须严格遵守输入输出，中间不允许有异步调用。不允许对state直接进行修改，要想修改必须返回新对象。
5. store
  + 维持应用的state；
  + 提供 getState() 方法获取 state；
  + 提供 dispatch(action) 方法分发请求来更新 state；门面模式，要求所有的请求满足统一的格式【可以进行路由、监控、日志等】，统一的调用方式。
  + 通过 subscribe(listener) 注册监听器监听state的变化。
6. 官方文档写的非常详细。



> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4