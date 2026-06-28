## lit-html介绍
### 什么是lit-html
lit-html是一个轻量的模板引擎，是lit框架的一部分。lit-html是基于原生es6模板字符串，可以单独在原生js中使用，是一个轻量高效的模板引擎。

### lit-html的特性
lit-html的核心特性：

1. <font style="color:rgb(25, 27, 31);">高效的更新：lit-html 只更新变化的部分，而不是整个模板。</font>
2. <font style="color:rgb(25, 27, 31);">声明式渲染：使用普通的 JavaScript 表达式来声明 UI。</font>
3. <font style="color:rgb(25, 27, 31);">轻量级：只包含必要的功能，没有额外的抽象层。</font>

可以看到，lit-html既轻量、不依赖框架，又能做到针对性只渲染更新的部分。我们在开发一些轻量的h5时，想要提升性能，不想引入过重的框架，就可以用lit-html来开发。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1762427173735-6d1e6366-7fd0-479b-8f43-d06d957ef1a7.png)

在项目中引入lit-html的两个核心方法，可以看到，只有8.1k，gzip压缩后只有3.4k。

### lit-html用法
#### api
主要用到两个方法，html和render。

其中html是模板字符串函数，用于构造模板。html``.

render是将模板渲染到指定的dom节点上。render(template, el).

#### 事件绑定：
lit-html的事件绑定跟vue很像，用@xxx在模板上绑定事件。

#### demo：
下面是一个简单的demo。可以看到html上写一个<div id="app"></div>。

然后js中用html编写模板，再用render挂到app上。又写了一个update方法，把render放在里面，每当有数据变化时，就调用一次update方法。

```html
<!doctype html>
<html lang="zh">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title></title>
</head>

<body>
  <div id="app"></div>

  <script type="module" src="./src/main.js"></script>
</body>

</html>
```

```javascript
import { html, render } from 'lit-html';

// 待办事项
let todos = [
  { text: 'Learn lit-html', completed: true },
  { text: 'Write an article', completed: false }
];

// 点击事件
const onClick = () => {
  todos = []
  update()
}

// 模板
const template = () => html`
  <div>	
    <ul>
      ${todos.map(todo => html`
        <li class=${todo.completed ? 'completed' : ''}>${todo.text}</li>
      `)}
    </ul>
    <button @click=${onClick}>清空列表</button>
  </div>
`;

// 渲染
const update = () => {
  const app = document.getElementById('app');
  render(template(), app);
}

update()
```



### lit-html渲染原理
没有虚拟dom，lit-html是怎么做到精确更新变化的数据所在dom，而不是全部更新呢。

#### 准备阶段
针对模板中每个变量的位置，生成一个id的注释插入。生成带标记的html。记录标记数组和变量数组。

#### 创建阶段
<font style="color:rgb(77, 77, 77);">lit-html定义了多种</font>`<font style="color:rgb(77, 77, 77);">Part</font>`<font style="color:rgb(77, 77, 77);">类型，每种类型负责不同场景下的动态值管理。准备阶段完成后，lit-html会克隆模板内容到文档片段，并根据</font>`<font style="color:rgb(77, 77, 77);">TemplatePart</font>`<font style="color:rgb(77, 77, 77);">实例化对应的</font>`<font style="color:rgb(77, 77, 77);">Part</font>`<font style="color:rgb(77, 77, 77);">对象。</font>

#### 更新阶段
<font style="color:rgb(77, 77, 77);">更新阶段是lit-html性能优势的核心所在。每次状态变化时，lit-html只需遍历</font>`<font style="color:rgb(77, 77, 77);">Part</font>`<font style="color:rgb(77, 77, 77);">对象，对比新旧值，只更新发生变化的部分。</font>

### 相关文章：
> lit-html仓库：[https://github.com/lit/lit/tree/main/packages/lit-html](https://github.com/lit/lit/tree/main/packages/lit-html)
>

> [下一代的模板引擎：lit-html](https://segmentfault.com/a/1190000039754597)
>

> vue-lit仓库: [https://github.com/yyx990803/vue-lit](https://github.com/yyx990803/vue-lit)
>

> [揭秘Lit性能密码：lit-html模板引擎核心原理](https://blog.csdn.net/gitblog_00843/article/details/150642503)
>



## 基于vite + lit-html开发项目
我们的目标是利用lit-html+原生js轻量化开发项目，但是不用完全手写，可以用vite创建原生js项目，利用vite编译less和babel，并配置环境变量等。

### 初始化项目
让ai用vite初始化一个原生js项目，并安装lit-html。安装less编译、babel编译。再配置px2vw。

此时目录结构如下：

```plain
├── .babelrc
├── .env
├── index.html
├── package.json
├── postcss.config.cjs
├── src/
│   ├── main.js
│   ├── api.js
│   ├── util.js
│   └── styles.less
└── vite.config.js
```

如果页面足够简单，这样已经够用了。模板，还有所有的变量和方法都在main.js中。所有的样式都在styles.less中。

再安装一个axios，新建一个api.js。再新建一个util.js存放工具方法。

项目搭建完成。

### 组件划分
#### 组件模板
全部的代码都放到main.js，当页面稍微元素一多，维护起来还是不太方便。我们可以拆分组件。

组件的写法还是一样，引入html。然后组件对外暴露一个template方法，接收一些参数，类似props，包括组件要执行的事件，也可以从参数接收。

在main.js的模板中，执行组件的模板方法，并传入参数即可。

#### 组件样式
进一步的，我们可以把组件的样式和js放在一起。然后再组件的js中引入样式文件即可。

#### 工具组件
这里提一下toast组件。本来是写了一个toast组件，在main.js挂载。后来考虑到，toast样式比较单一，并且如果有弹多个toast的情况处理，还是给他抽成一个js方法了。直接创建div，写入内容和样式，插入到body上。设置2s自动移除。

### 状态管理
新建一个store.js，其实就是一个JSON对象。将状态都放到里面。方便在main.js和不同组件之间使用数据。

这里不需要像vue和react一样响应，只要lit-html的数据变化时，我们手动调用一下update方法，有点类似react的渲染逻辑了。

由于lit-html本身对渲染做了优化，只会渲染数据变化的元素，不需要我们再额外处理了。

### 打包配置优化
平时我们用的框架模板，一些配置优化项已经帮我们预设好了。这里我们自己简单处理下。

主要是处理构建时的文件分块。现在打包一下，所有的css是一个文件，所有的js是一个文件。我们开发过程中，一般依赖包会比较大，而且不会变动。这里我们配置下，将所有的node_modules打包为一个vendor.js，将其他的js打包为一个文件。

```javascript
{  
  ...
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的依赖统一拆分到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
  
    },
  },
}
```

还做了一些其他配置，如gzip压缩、关闭sourcemap、安装bundle-analyzer。



### 项目代码
#### 依赖分析
开发环境引入了pagespy和vconsole。生产环境没有引入。

生产环境打包如下，其中vendor包含lit-html和业务sdk。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1762432044454-f629d3ec-8d34-4303-9a37-88230c72d920.png)

用bundle-analyzer分析，发现大部分是axios，然后是业务sdk。剩下是业务代码和lit-html。可以考虑移除axios，手写一个简易版的ajax。

axios: 95.48k, gzip后38.54k, 占比58.73%，超过一半了。

业务sdk:36.19k, gzip后13.11k，占比22.26%。

lit-html: 8.16k, gzip后3.35k，占比5、02%。



![](https://cdn.nlark.com/yuque/0/2025/png/373268/1762432571865-9e9eeaf1-1e30-4a32-a501-e4a7de90bbab.png)

问了下轻量版的ajax库，ai推荐用redaxios代替axios，写法基本兼容，gzip后只有0.8kb。

或者用原生的fetch，0依赖，但是较老的浏览器<font style="color:rgb(55, 65, 81);">（如 IE11 或 Android 4.x WebView）</font>存在兼容问题，需要引入polyfill，如<font style="color:rgb(55, 65, 81);">whatwg-fetch 或 cross-fetch 。若目标是“现代 H5 + lit-html”，通常可直接使用原生 fetch，不再考虑 IE。whatwg-fetch约8-10k，gzip后3-4k。</font>

<font style="color:rgb(55, 65, 81);">踩坑：redaxios不支持axios的拦截器，报错。且redaxios使用的是fetch，不支持xhr，考虑兼容的话依然要引入whatwg-fetch。引入whatwg-fetch，直接用原生fetch。</font>

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1762483569520-17a11c41-5601-4cd2-b4b8-1ed662b89f00.png)

#### 性能分析
在lighthouse分析页面，用无痕模式，避免浏览器插件影响。发现分数还是很不错的，扣分项主要是LCP，因为大图比较多。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1762483116366-096d9ec8-03c8-4b8c-8a55-2fc60c6a6505.png)



