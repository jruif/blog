title: 教你学编程：如何编写Node.js插件
date: 2014-08-13 14:41:26
tags: [nodejs,nodejs插件,链接c++,详细教程]
---
	本文来自网络，如有侵权请联系管理员
Node.js在利用JavaScript编写后端方面效果拔群，值得我们多加尝试。不过如果大家需要一些无法直接使用的功能甚至是根本无从实现的模块使用，那么能否从C/C++库当中引入此类成果呢？答案是肯定的，大家要做的就是编写一款插件，并借此在自己的JavaScript代码中使用其它代码库的资源。下面我们就一同开始今天的探询之旅。

##介绍

正如Node.js在官方说明文档中所言，插件是以动态方式进行链接的共享式对象，能够将JavaScript代码与C/C++库链接起来。这意味着我们可以引用任何来自C/C++库中的内容，并通过创建插件的方式将其纳入到Node.js当中。

作为实例，我们将为标准std::string对象创建一套封装。

<!--more-->
##准备工作

在我们开始编写工作之前，大家首先需要确保自己已经准备好所有后续模块编译所需要的素材。大家需要node-gyp及其全部依赖关系。大家可以利用以下命令安装node-gyp：
```bash
npm install -g node-gyp 
```
在依赖性方面，我们需要为Unix系统准备以下项目：

* Python (要求2.7版本, 3.x无法正常起效)

* make

* 一款C++编译器工具链（例如gpp或者g++）

举例来说，在Ubuntu上大家可以利用以下命令安装所有上述项目（其中Python 2.7应该已经预先安装完毕了）：
```bash
sudo apt-get install build-essentials 
```
在Windows系统环境下，大家需要的是：

* Python (2.7.3版本, 3.x无法正常起效)

* 微软Visual Studio C++ 2010 (适用于Windows XP/Vista)

* 微软Visual Studio C++ 2012 for Windows Desktop (适用于Windows 7/8)

强调一点，Visual Studio的Express版本也能正常起效。


###binding.gyp文件

该文件由node-gyp使用，旨在为我们的插件生成适当的build文件。大家可以点击此处查看维基百科提供的.gyp文件说明文档，但今天我们要使用的实例非常简单、因此只需使用以下代码即可：

```
{  
    "targets": [  
        {  
            "target_name": "stdstring",  
            "sources": [ "addon.cc", "stdstring.cc" ]  
        }  
    ]  
}  
```
其中target_name可以设置为大家喜欢的任何内容。而sources数组当中包含该插件需要用到的所有源文件。在我们的实例中还包括addon.cc，它的作用在于容纳编译插件及stdstring.cc所必需的代码，外加我们的封装类。

###STDStringWrapper类

第一步，我们要做的是在stdstring.h文件当中定义自己的类。如果大家对于C++编程比较熟悉，那么也一定不会对以下两行代码感到陌生。
```c++
#ifndef STDSTRING_H  
#define STDSTRING_H 
```
这属于标准的include guard。接下来，我们需要将以下两个header纳入include范畴：
```c++
#include  STDSTRING_H
```
第一个面向的是std::string类，而第二个include则作用于全部与Node以及V8相关的内容。

这一步完成之后，我们可以对自己的类进行声明：
```c++
class STDStringWrapper : public node::ObjectWrap { 
```
对于所有我们打算包含在插件当中的类来说，我们必须扩展node::ObjectWrap类。

现在我们可以开始定义该类的private属性了：
```c++
private:  
    std::string* s_;  
   
    explicit STDStringWrapper(std::string s = "");  
    ~STDStringWrapper();  
```
除了构造函数与解析函数，我们还需要为std::string定义一个指针。这是该技术的核心所在，能够被用于将C/C++代码库与Node相对接——我们为该C/C++类定义一个私有指针，并将在随后的所有方法中利用该指针实现操作。

现在我们声明的constructor静态属性，它将为我们在V8中创建的类提供函数：
```c++
static v8::Persistent constructor;
``` 
感兴趣的朋友可以点击此处参阅模板说明方案以获取更多细节信息。

现在我们还需要一个New方法，它将被分配给前面提到的constructor，同时V8会对我们的类进行初始化：
```c++
static v8::Handle New(const v8::Arguments& args); 
```
作用于V8的每一个函数都应该遵循以下要求：它将接受指向v8::Arguments对象的引用，并返回一个v8::Handle>v8::Value>——这正是我们在使用强类型C++编码时，V8处理弱类型JavaScript的一贯方式。

在此之后，我们还需要将另外两个方法插入到对象的原型当中：
```c++
static v8::Handle add(const v8::Arguments& args);  
static v8::Handle toString(const v8::Arguments& args);
```  
其中toString()方法允许我们在将其与普通JavaScript字符串共同使用时获得s_的值而非[Object object]的值。

最后，我们将引入初始化方法（此方法将由V8调用并指派给constructor函数）并关闭include guard：
```c++
    public:  
        static void Init(v8::Handle exports);  
};  
   
#endif  
```
其中exports对象在JavaScript模块中的作用等同于module.exports。

###stdstring.cc文件、构造函数与解析函数

现在来创建stdstring.cc文件。我们首先需要include我们的header：
```c++
#include "stdstring.h" 
```
下面为constructor定义属性（因为它属于静态函数）：
```c++
v8::Persistent STDStringWrapper::constructor; 
```
这个为类服务的构造函数将分配s_属性：
```c++
STDStringWrapper::STDStringWrapper(std::string s) {  
    s_ = new std::string(s);  
}  
```
而解析函数将对其进行delete，从而避免内存溢出：
```c++
STDStringWrapper::~STDStringWrapper() {  
    delete s_;  
}  
```
再有，大家必须delete掉所有与new一同分配的内容，因为每一次此类情况都有可能造成异常，因此请牢牢记住上述操作或者使用[共享指针](http://en.cppreference.com/w/cpp/memory/shared_ptr)。

###Init方法

该方法将由V8加以调用，旨在对我们的类进行初始化（分配constructor，将我们所有打算在JavaScript当中使用的内容安置在exports对象当中）：
```c++
void STDStringWrapper::Init(v8::Handle exports) { 
```
首先，我们需要为自己的New方法创建一个函数模板：
```c++
v8::Local tpl = v8::FunctionTemplate::New(New); 
```
这有点类似于JavaScipt当中的new Function——它允许我们准备好自己的JavaScript类。

现在我们可以根据实际需要为该函数设定名称了（如果大家漏掉了这一步，那么构造函数将处于匿名状态，即名称为function someName() {}或者function () {}）：
```c++
tpl->SetClassName(v8::String::NewSymbol("STDString")); 
```
我们利用v8::String::NewSymbol()来创建一个用于属性名称的特殊类型字符串——这能为引擎的运作节约一点点时间。

在此之后，我们需要设定我们的类实例当中包含多少个字段：
```c++
tpl->InstanceTemplate()->SetInternalFieldCount(2); 
```
我们拥有两个方法——add()与toString()，因此我们将数量设置为2。现在我们可以将自己的方法添加到函数原型当中了：
```c++
tpl->PrototypeTemplate()->Set(v8::String::NewSymbol("add"), v8::FunctionTemplate::New(add)->GetFunction());  
tpl->PrototypeTemplate()->Set(v8::String::NewSymbol("toString"), v8::FunctionTemplate::New(toString)->GetFunction()); 
``` 
这部分代码量看起来比较大，但只要认真观察大家就会发现其中的规律：我们利用tpl->PrototypeTemplate()->Set()来添加每一个方法。我们还利用v8::String::NewSymbol()为它们提供名称与FunctionTemplate。

最后，我们可以将该构造函数安置于我们的constructor类属性内的exports对象中：
```c++
    constructor = v8::Persistent::New(tpl->GetFunction());  
    exports->Set(v8::String::NewSymbol("STDString"), constructor);  
}  
```

###New方法

现在我们要做的是定义一个与JavaScript Object.prototype.constructor运作效果相同的方法：
```c++
v8::Handle STDStringWrapper::New(const v8::Arguments& args) { 
```
我们首先需要为其创建一个范围：
```c++
v8::HandleScope scope; 
```
在此之后，我们可以利用args对象的.IsConstructCall()方法来检查该构造函数是否能够利用new关键词加以调用：
```c++
if (args.IsConstructCall()) { 
```
如果可以，我们首先如下所示将参数传递至std::string处：
```c++
v8::String::Utf8Value str(args[0]->ToString());  
std::string s(*str);  
```
……这样我们就能将它传递到我们封装类的构造函数当中了：
```c++
STDStringWrapper* obj = new STDStringWrapper(s);  
```
在此之后，我们可以利用之前创建的该对象的.Wrap()方法（继承自node::ObjectWrap）来将它分配给this变量：
```c++
obj->Wrap(args.This()); 
```
最后，我们可以返回这个新创建的对象：
```c++
return args.This(); 
```
如果该函数无法利用new进行调用，我们也可以直接调用构造函数。接下来，我们要做的是为参数计数设置一个常数：
```c++
} else {  
    const int argc = 1;  
```
现在我们需要利用自己的参数创建一个数组：
```c++
v8::Local argv[argc] = { args[0] }; 
然后将constructor->NewInstance方法的结果传递至scope.Close，这样该对象就能在随后发挥作用（scope.Close基本上允许大家通过将对象处理句柄移动至更高范围的方式对其加以维持——这也是函数的起效方式）：

        return scope.Close(constructor->NewInstance(argc, argv));  
    }  
} 
``` 
###add方法

现在让我们创建add方法，它的作用是允许大家向对象的内部std::string添加内容：
```c++
v8::Handle STDStringWrapper::add(const v8::Arguments& args) { 
```
首先，我们需要为我们的函数创建一个范围，并像之前那样把该参数转换到std::string当中：
```c++
v8::HandleScope scope;  
   
v8::String::Utf8Value str(args[0]->ToString());  
std::string s(*str);  
```
现在我们需要对该对象进行拆包。我们之前也进行过这种反向封装操作——这一次我们是要从this变量当中获取指向对象的指针。
```c++
STDStringWrapper* obj = ObjectWrap::Unwrap(args.This());
``` 
接着我们可以访问s_属性并使用其.append()方法：
```c++
obj->s_->append(s); 
```
最后，我们返回s_属性的当前值（需要再次使用scope.Close）：
```c++
return scope.Close(v8::String::New(obj->s_->c_str()));  
```
由于v8::String::New()方法只能将char pointer作为值来接受，因此我们需要使用obj->s_->c_str()来加以获取。

###toString方法

最后用到的方法允许我们将该对象转化为JavaScript的String：
```c++
v8::Handle STDStringWrapper::toString(const v8::Arguments& args) { 
```
它与我们之前提到的方法类似，大家也需要为其创建范围：
```c++
v8::HandleScope scope; 
```
对该对象进行拆包：
```c++
STDStringWrapper* obj = ObjectWrap::Unwrap(args.This()); 
```
接下来将s_属性返回为一条v8::String：
```c++
return scope.Close(v8::String::New(obj->s_->c_str()));  
```

##编译测试
###Building
在真正开始使用插件之前，我们最后需要注意的自然是编辑与链接了。这部分工作只需要两行命令。首先：
```bash
node-gyp configure 
```
这将根据大家的操作系统与处理器类型创建出适合的build配置方案（UNIX上为Makefile，Windows上则为vcxproj）。要对该库进行编译与链接，只需调用：
```bash
node-gyp build 
```
如果一切进展顺利，那么大家应该在自己的控制台上看到以下内容：
![控制台输出](/img/081301.jpg )
这时大家的插件文件夹中还应该创建出一个build目录。

###测试

现在我们可以对自己的插件进行测试了。在我们的插件目录中创建一个test.js文件以及必要的编译库（大家可以直接略过.node扩展）：
```javascript
var addon = require('./build/Release/addon'); 
```
下一步，为我们的对象创建一个新实例：
```javascript
var test = new addon.STDString('test'); 
```
下面再对其进行操作，例如添加或者将其转化为字符串：
```javascript
test.add('!');  
console.log('test\'s contents: %s', test); 
``` 
在运行之后，大家应该在控制台中看到以下执行结果：
![执行结果](/img/081302.jpg )
##结论

我希望大家能在阅读了本教程之后打消顾虑，将创建与测试以C/C++库为基础的定制化Node.js插件视为一项无甚难度的任务。大家可以利用这种技术轻松将几乎任何C/C++库引入Node.js当中。如果大家愿意，还可以根据实际需求为插件添加更多功能。std::string当中提供大量方法，我们可以将它们作为练习素材。

##实用链接

感兴趣的朋友可以查看以下链接以获取更多与Node.js插件开发、V8以及C事件循环库相关的资源与详细信息。

* [Node.js插件说明文档](http://nodejs.org/api/addons.html)

* [V8说明文档](http://izs.me/v8-docs/main.html)

* [libuv (C事件循环库)，来自GitHub](https://github.com/joyent/libuv)

英文：[http://code.tutsplus.com/tutorials/writing-nodejs-addons--cms-21771](http://code.tutsplus.com/tutorials/writing-nodejs-addons--cms-21771)