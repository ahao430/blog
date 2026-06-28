# 1. 环境变量
vue-cli支持环境变量，vur-cli-service命令可以通过--mode读取不同的配置文件，从而读取不同的变量。

在项目根目录新建.env.开头的配置文件：

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1592064074336-63dbeba4-dafa-4785-a26f-c4427a670fa9.png)

.env.build-prod文件：

```plain
NODE_ENV=production
VUE_APP_ENV=prod
```

在package.json中通过--mode传入配置文件的名字：

```json
{
  "scripts": {
    "start": "vue-cli-service serve --mode dev-test",
    "serve": "vue-cli-service serve --mode dev-test",
    "dev": "vue-cli-service serve --mode dev-test",
    "dev:test": "vue-cli-service serve --mode dev-test",
    "dev:demo": "vue-cli-service serve --mode dev-demo",
    "dev:prod": "vue-cli-service serve --mode dev-prod",
    "build": "vue-cli-service build --mode build-prod",
    "build:test": "vue-cli-service build --mode build-test",
    "build:demo": "vue-cli-service build --mode build-demo",
    "build:prod": "vue-cli-service build --mode build-prod",
    "lint": "vue-cli-service lint"
  },
}

```

# 2. 分析代码体积
可以通过webpack-bundle-analyzer来实现。

```bash
npm i -D webpack-bundle-analyzer
```

然后可以在vue.config.js中执行：

```json
module.exports = {
  ...
  chainWebpack: config => {
     if (process.env.NODE_ENV === 'production') {
       config
         .plugin('webpack-bundle-analyzer')
         .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
     }
   },
};
```

执行build之后，会继续执行analyzer，弹出一个分析结果页面，可以看到各个资源文件的体积。

# 3. 优化方法一：使用cdn优化编译速度和代码体积
对引入的npm包，改为在public/index.html文件中cdn引入:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>E2AML Admin System</title>
    <!-- dns 预解析 -->
    <meta http-equiv='x-dns-prefetch-control' content='on'>
    <link rel='dns-prefetch' href='bootcdn.com'>
    <!-- cdn -->
    <script src="<%= NODE_ENV === 'production' ? '//bootcdn.com/vue/2.6.10/vue.min.js' : '//bootcdn.com/vue/2.6.10/vue.js' %>"></script>
    <script src="//bootcdn.com/vuex/3.1.1/vuex.min.js"></script>
    <script src="//bootcdn.com/vue-router/3.1.3/vue-router.min.js"></script>
    <script src="//bootcdn.com/vue-i18n/8.14.1/vue-i18n.min.js"></script>
    <script src="//bootcdn.com/element-ui/2.12.0/index.js"></script>
    <script src="//bootcdn.com/babel-polyfill/7.6.0/polyfill.min.js"></script>
    <script src="//bootcdn.com/axios/0.19.0-beta.1/axios.min.js"></script>
    <script src="//bootcdn.com/echarts/4.4.0-rc.1/echarts.min.js"></script>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but system-system-analysis doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>

```

在vue.config.js配置外部变量。

```json
module.exports = {
  ...
   configureWebpack: {
    externals: {
      'vue': 'Vue',
      'vuex': 'Vuex',
      'vue-router': 'VueRouter',
      'vue-i18n': 'VueI18n',
      'axios': 'axios',
      'element-ui': 'ELEMENT',
      'echarts': 'echarts',
    }
  },
};
```

这样优化的问题是，当cdn服务器和项目代码不在一起，dev运行时的sourcemap文件就找不到对应的文件了。并且cdn出现故障时会导致项目报错。版本维护起来也不是很方便。

# 4. 优化方法二：使用dll优化编译速度和代码体积
用webpack-dll-plugin对项目中引入的库编译为单独的文件，后续打包时跳过。这样既加快了编译速度，又能保证这些库文件的缓存。也能解决cdn方案的问题。



安装插件：

```bash
npm i -D webpack-cli@^3.2.3 add-asset-html-webpack-plugin@^3.1.3 clean-webpack-plugin@^1.0.1
```

<font style="color:#333333;">在项目根目录下新建 webpack.dll.conf.js，输入以下内容。</font>

```javascript
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// "clean-webpack-plugin": "^3.0.0"
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// dll文件存放的目录
const dllPath = 'public/vendor'

module.exports = {
  entry: {
    // 需要提取的库文件
    vendor: ['vue', 'vue-router', 'vuex', 'axios', 'element-ui']
  },
  output: {
    path: path.join(__dirname, dllPath),
    filename: '[name].dll.js',
    // vendor.dll.js中暴露出的全局变量名
    // 保持与 webpack.DllPlugin 中名称一致
    library: '[name]_[hash]'
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin(['*.*'], {
      root: path.join(__dirname, dllPath)
    }),
    // "clean-webpack-plugin": "^3.0.0"
    // new CleanWebpackPlugin(),
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'production'
      }
    }),
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与 output.library 中名称一致
      name: '[name]_[hash]',
      context: process.cwd()
    })
  ]
}
```

在package.json加入编译dll命令，并执行npm run dll。

```json
"scripts": {
    ...
    "dll": "webpack -p --progress --config ./webpack.dll.conf.js"
},
```

在vue.config.js配置：

```javascript
const path = require('path')
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const env = process.env.NODE_ENV;

module.exports = {
   ...
   configureWebpack: (config) => {
    if (env === 'production') {
      // dll优化
      config.plugins.push(new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require('./public/vendor/vendor-manifest.json')
      }));
      // 将打包出来文件动态引入index.html
      config.plugins.push(
        new AddAssetHtmlPlugin({
            // dll文件位置
            filepath: path.resolve(__dirname, './public/vendor/*.js'),
            // dll 引用路径
            publicPath: './vendor',
            // dll最终输出的目录
            outputPath: './vendor'
        })
      );
    }
  },
}
```

编译一次dll。后续编译执行build即可。依赖包有变化时重新执行dll命令。

