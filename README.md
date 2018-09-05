# node-etpl
etpl node 扩展

支持Node.js端渲染，基于模板文件进行渲染，支持按需加载和缓存模板文件。

支持扩展语法：

继承模板：
```
<!-- @extend: base/base -->
// or
<!-- @extend: base/base.tpl -->
```

将会翻译为：
```
<!-- target: @xxx(master=@base/base) -->
```


引入模板：
```
<!-- @import: base/base.tpl -->
```
将会翻译为：

```
<!-- import: @base/base -->
```
