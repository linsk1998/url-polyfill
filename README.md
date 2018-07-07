# URL-polyfill

我这里有两个版本

## url-read.js
这个polyfill只能解析URL，解析完了URL的属性是不可改的

## URL.js
这个polyfill的URL对象注册了setter getter，属性可以修改，

例如修改了pathname属性，href属性也会跟着改变

但是依赖sky-class.js中的类工厂
