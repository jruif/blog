title: 【Angular系列】ui-router 多层state与多层view的解构
date: 2015-05-21 22:13:06
tags: [angular,ui-router,states,views,嵌套状态,嵌套视图]
---



> 本文为博主Jruif翻译作品，如有不当之处请悉心指正，如转载请注明译品以及英语原文出处，[英语原文地址](https://github.com/angular-ui/ui-router/wiki/Nested-States-and-Nested-Views)

## 嵌套状态的方法

状态能被其他状态嵌套。有以下几种嵌套情况：

1. 使用点‘.’符号，例如：`.state('contacts.list', {})`。
2. 使用[ui-router.stateHelper](https://github.com/marklagendijk/ui-router.stateHelper)建立一个嵌套状态树。
3. 使用以 **string** 类型的父级名的 `parent` 属性，例如：`parent: 'contacts'`
4. 使用以 **object** 类型的父级状态的 `parent`属性，例如：`parent: contacts`（这里的'contacts'是一个状态对象）

<!-- more -->

### 点符号

你可以使用点来构建应用的层级关系，如下所示， `contacts.list`就变成了`contacts`的子状态。
```javascript
$stateProvider
  .state('contacts', {})
  .state('contacts.list', {});
```

### stateHelper 模块

有一个由 @marklagendijk 创建的第三方组件可以帮你构建嵌套状态。所以你可以通过引用来使用[点击这里了解更多有关 stateHelper 的信息](https://github.com/marklagendijk/ui-router.stateHelper)

```javascript
angular.module('myApp', ['ui.router', 'ui.router.stateHelper'])
  .config(function(stateHelperProvider){
    stateHelperProvider.setNestedState({
      name: 'root',
      templateUrl: 'root.html',
      children: [
        {
          name: 'contacts',
          templateUrl: 'contacts.html',
          children: [
            {
              name: 'list',
              templateUrl: 'contacts.list.html'
            }
          ]
        },
        {
          name: 'products',
          templateUrl: 'products.html',
          children: [
            {
              name: 'list',
              templateUrl: 'products.list.html'
            }
          ]
        }
      ]
    });
  });
```

### 使用parent属性构建嵌套

parent属性的赋值有两种类型，一种是String，一种是Object。
这两种类型的值都是父级的名字或者状态对象，可以参考以下示例了解。

基于字符串的：
```javascript
$stateProvider
  .state('contacts', {})
  .state('list', {
    parent: 'contacts'
  });
```

基于对象的：
```javascript
var contacts = {
    name: 'contacts',  //必须
    templateUrl: 'contacts.html'
}
var contactsList = {
    name: 'contacts.list', //必须
    parent: contacts,  //必须
    templateUrl: 'contacts.list.html'
}
$stateProvider
  .state(contacts)
  .state(contactsList)
```

当你使用其他方法或属性做比较的时候可以直接引用对象。
```javascript
$state.transitionTo(states.contacts);
$state.current === states.contacts;
$state.includes(states.contacts)
```

## 关于状态的顺序

你可以定义任意顺序的状态或在不同的模块中定义状态。也可以在定义父状态前先定义了子状态。在程序执行的时候，ui-route会在父状态定义了之后定义子状态。
所以说你定义嵌套状态的时候，不用计较状态的先后循序，甚至可以在不同的模块中。


## 父级必须存在

如果你只定义了一个单一的状态，就像 `contacts.list`，那么你必须定义一个叫做`contacts`的状态，否则你定义的 `contacts.list`
就不会执行。你也不能查出任何错误，所以你要谨记这一点。

## 给你的状态命名

不能有两个相同名字的状态。当你使用`parent`属性来构建嵌套状态的时候，也不能定义相同的名字，即使有不同的父级，也并没有
改变这个状态的名字，例如，你不能定义两个叫“edit”的状态，即使他们的父级不一样。当然，使用点符号的方式除外，例如`one.edit`
和`two.edit`是可以使用的。

## 嵌套状态和视图

当应用处于一种特殊的状态——“active”的时候，他的父级以上的状态也会隐含的变为`active`，如下所示，当状态 `contacts.list`变为active的时候，`contacts`也隐含的变为active，因为他是"contacts.list"的父级状态。
子状态将会导入自己的模板到他父级的 `ui-view`中。

完整示例: http://plnkr.co/edit/7FD5Wf?p=preview
```javascript
$stateProvider
  .state('contacts', {
    templateUrl: 'contacts.html',
    controller: function($scope){
      $scope.contacts = [{ name: 'Alice' }, { name: 'Bob' }];
    }
  })
  .state('contacts.list', {
    templateUrl: 'contacts.list.html'
  });

function MainCtrl($state){
  $state.transitionTo('contacts.list');
}
```
```html
<!-- index.html -->
<body ng-controller="MainCtrl">
  <div ui-view></div>
</body>
```
```html
<!-- contacts.html -->
<h1>My Contacts</h1>
<div ui-view></div>
```
```html
<!-- contacts.list.html -->
<ul>
  <li ng-repeat="contact in contacts">
    <a>{{contact.name}}</a>
  </li>
</ul>
```

### 子状态是如何从父状态继承的？

子状态是怎样从父状态继承的：
* [通过`resolve`解决依赖关系](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#wiki-inherited-resolved-dependencies)
* [使用自定义 `data`属性](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#wiki-inherited-custom-data)

除此之外，并没有其他方式（没有controllers, templates, url等）

### 继承的解决依赖关系

在版本0.2.0中，子状态将继承解决依赖关系，他们能够被重载。我们能够继承解决依赖关系在子状态的controllers和resolve函数中。

```javascript
$stateProvider.state('parent', {
      resolve:{
         resA:  function(){
            return {'value': 'A'};
         }
      },
      controller: function($scope, resA){
          $scope.resA = resA.value;
      }
   })
   .state('parent.child', {
      resolve:{
         resB: function(resA){
            return {'value': resA.value + 'B'};
         }
      },
      controller: function($scope, resA, resB){
          $scope.resA2 = resA.value;
          $scope.resB = resB.value;
      }
```

**注**:

　- 关键字`resolve`只能用于没有`views`的`state`（防止使用多个视图）。
　- 如果你想等待promises将被resolved之前实例化子状态，关键字`resolve`必须被子状态注入。

### 继承自定义数据

子状态将继承父状态的data属性，并能够重载。

```javascript
$stateProvider.state('parent', {
      data:{
         customData1:  "Hello",
         customData2:  "World!"
      }
   })
   .state('parent.child', {
      data:{
         // customData1 inherited from 'parent'
         // but we'll overwrite customData2
         customData2:  "UI-Router!"
      }
   });

$rootScope.$on('$stateChangeStart', function(event, toState){
    var greeting = toState.data.customData1 + " " + toState.data.customData2;
    console.log(greeting);

    // Would print "Hello World!" when 'parent' is activated
    // Would print "Hello UI-Router!" when 'parent.child' is activated
})
```

### Scope只通过View层级继承

如果你的多个状态视图是嵌套的，只要记住scope只继承它状态链下的属性。嵌套的scope属性与你嵌套的状态和嵌套的视图（templates）
毫无关系。

完全有[可能](https://github.com/angular-ui/ui-router/wiki/Multiple-Named-Views#view-names---relative-vs-absolute-names)在你的页面中，嵌套的视图的模板填入了没有嵌套的地方的ui-views。在这一假设存在的情况下，你不能确保在子状态视图中使用
了父状态视图中的scope变量。

##　纯形式上的（抽象）状态

一个纯形式上的状态也可以拥有子状态，当时它不能激活他自己。'abstract'状态只是一个不能被转换的简单状态。只有它的后代被激活的
时候他会被隐含的激活。

一些使用纯形式上的状态的示例：
* 过渡到其他子url的[`url`](https://github.com/angular-ui/ui-router/wiki/URL-Routing#url-routing-for-nested-states)
* To insert a [`template`](https://github.com/angular-ui/ui-router/wiki#templates) with its own `ui-view(s)` that its child states will populate.

    * Optionally assign a `controller` to the template. The controller **must** pair to a template.
    * Additionally, inherit $scope objects down to children, just understand that this happens via the [view hierarchy](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#scope-inheritance-by-view-hierarchy-only), not the state hierarchy.
* To [provide resolved dependencies](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#inherited-resolved-dependencies) via `resolve` for use by child states.
* To [provide inherited custom data](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#inherited-custom-data) via `data` for use by child states or an event listener.
* To run an `onEnter` or `onExit` function that may modify the application in someway.
* Any combination of the above.

**记住：** 形式上的状态也需要他自己的`<ui-view/>`，用来让它的子状态视图嵌入。所以你要如果使用一个抽象状态只是做一个预备的url
，你需要设置resolves/data，或者添加一个onEnter/Exit函数，然后你还要设置`template: "<ui-view/>"`。

###　抽象状态使用示例

**To prepend url to child state urls**
```javascript
$stateProvider
    .state('contacts', {
        abstract: true,
        url: '/contacts',

        // Note: abstract still needs a ui-view for its children to populate.
        // You can simply add it inline here.
        template: '<ui-view/>'
    })
    .state('contacts.list', {
        // url will become '/contacts/list'
        url: '/list'
        //...more
    })
    .state('contacts.detail', {
        // url will become '/contacts/detail'
        url: '/detail',
        //...more
    })
```

**To insert a template with its own `ui-view` for child states to populate**
```javascript
$stateProvider
    .state('contacts', {
        abstract: true,
        templateUrl: 'contacts.html'
    })
    .state('contacts.list', {
        // loaded into ui-view of parent's template
        templateUrl: 'contacts.list.html'
    })
    .state('contacts.detail', {
        // loaded into ui-view of parent's template
        templateUrl: 'contacts.detail.html'
    })
```
```html
<!-- contacts.html -->
<h1>Contacts Page</h1>
<div ui-view></div>
```

**Combination**

Shows prepended url, inserted template, paired controller, and inherited $scope object.

Full Plunkr Here: http://plnkr.co/edit/gmtcE2?p=preview
```javascript
$stateProvider
    .state('contacts', {
        abstract: true,
        url: '/contacts',
        templateUrl: 'contacts.html',
        controller: function($scope){
            $scope.contacts = [{ id:0, name: "Alice" }, { id:1, name: "Bob" }];
        }
    })
    .state('contacts.list', {
        url: '/list',
        templateUrl: 'contacts.list.html'
    })
    .state('contacts.detail', {
        url: '/:id',
        templateUrl: 'contacts.detail.html',
        controller: function($scope, $stateParams){
          $scope.person = $scope.contacts[$stateParams.id];
        }
    })
```

```html
<!-- contacts.html -->
<h1>Contacts Page</h1>
<div ui-view></div>
```

```html
<!-- contacts.list.html -->
<ul>
    <li ng-repeat="person in contacts">
        <a ng-href="#/contacts/{{person.id}}">{{person.name}}</a>
    </li>
</ul>
```

```html
<!-- contacts.detail.html -->
<h2>{{ person.name }}</h2>
```

> 再次声明：欢迎转载，无偿奉献，但请注明出处，谢谢


> 欢迎加入[Javascript前端技术][jsqun]，共同探讨Angular的神奇之处，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4
