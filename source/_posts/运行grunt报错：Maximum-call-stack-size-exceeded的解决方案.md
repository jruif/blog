title: 运行grunt报错：Maximum call stack size exceeded的解决方案
date: 2014-10-31 00:48:34
tags: [grunt,exceeded]
---
这是我前两天晚上遇到的一个问题，之前没有碰见过，突然碰到了，让我很迷惑怎么调用的堆栈超过了限制，怎么都找不到问题的所在，只好一行一行的删除代码使用排除法，最后定位到是处理less文件的任务出了问题，最后终于在一个文档中找到了问题的所在：

You probably created an alias task with the same name as one of your regular tasks. 
Example: 
```javascript
  grunt.registerTask('less', ['less:build']); 
```
should be 
```javascript
  grunt.registerTask('myless', ['less:build']);
```
  
//中文：为什么我运行grunt得到一个 "Maximum call stack size exceeded"错误？
 
你可能创建了一个和常规任务相同名字的别名任务。例如：
```javascript
  grunt.registerTask('less', ['less:build']); 
```
应该是
```javascript
  grunt.registerTask('myless', ['less:build']);
```
都是没仔细看文档的后果啊。

> 欢迎加入[Javascript前端技术][jsqun]，群号为:[85088298][jsqun]
[jsqun]:http://shang.qq.com/wpa/qunwpa?idkey=a61d2af0241e8eb322e98f4a162e124606acf0b96ec06683fb67ddeb538ce0a4