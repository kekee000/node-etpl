node-etpl
----
etpl Node.js渲染模块。支持Node.js端渲染，基于模板文件进行渲染，支持按需加载和缓存模板文件。

Node.js version >= 8.0.0

## 安装和初始化

安装

```javascript
npm install node-etpl
```

初始化和使用

```javascript
const nodeEtpl = require('node-etpl');

// 初始化配置
nodeEtpl.configure({
    baseDir: './views' // 模板根目录
});

// 渲染
nodeEtpl.render('page/index', {name: 'etpl'});
nodeEtpl.renderString('#{name}', {name: 'etpl'});
```

## API

**configure**

```javascript
// 初始化配置（默认）
nodeEtpl.configure({
    baseDir: './views', // 模板根目录
    cacheable: true, // 是否缓存模板编译结果
    ext: '.tpl', // 模板扩展名
    // filters，过滤器
    filters: {
        jsonEncode
    },
    // etplOptions, 详见 etpl
    options: {
        commandOpen: '{%',
        commandClose: '%}',
        variableOpen: '#{',
        variableClose: '}',
        strip: true
    }
});
```

**render**

```javascript
let str = nodeEtpl.render('page/index', {
    // data object
});
```


**renderString**

```javascript
let str = nodeEtpl.renderString('#{name}', {
    // data object
    name: 'etpl'
});
// etpl
```
**precompile**

```javascript
nodeEtpl.precompile().then(loader => {
    loader.render('page/index', {
        // data object
    });
});
```
注意：precompile为异步方法

## 扩展指令
支持2个扩展指令，`@extend` 和 `@import`，在预编译时翻译为etpl支持的模板指令。

*注意:* 若使用`@extend` 和 `@import`，则不需要在文件头声明`target`名称，会自动添加target，并且自动加载依赖。

在模板中声明的etpl`target`不会被`node-etpl`解析和加载，若要完成etpl`target`自动加载工作，
需使用etpl原生的`load`和`loadFromFile`方法。

### 继承模板：@extend
当前模板路径为：`page/index.tpl`

```
{%@extend: base/base%}

// or
{%@extend: base/base.tpl%}

// or `:`可省略
{%@extend ../base%}
```

将会翻译为：
```
{%target:page/index.tpl(master=base/base.tpl)%}
```


### 引入模板：@import
当前模板路径为：`page/index.tpl`

```
{%@import: base/base.tpl%}

or
{%@import: base/base%}

// or `:`可省略
{%@import ../base%}
```
将会翻译为：

```
{%import:base/base.tpl%}
```
