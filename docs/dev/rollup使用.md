# rollup使用教程  
最近要开发一个sdk，用webpack感觉有点重了，而gulp对于模块无能为力，发现很多npm库都是用rollup开发的。rollup对于纯js的编译很不错，相对于webpack，速度更快，打包后的代码体积更小，会通过tree-shake去除未使用的import。 
详细文档见[rollup中文网](https://www.rollupjs.com/guide/zh)。

## 安装  

````bash
npm install rollup rollup-copy-plugin rollup-plugin-babel rollup-plugin-commonjs rollup-plugin-copy rollup-plugin-json rollup-plugin-node-resolve rollup-plugin-replace rollup-plugin-typescript2 rollup-plugin-uglify
````
后面的是相关插件  

## 使用  

有两种使用方法：  
1. 直接使用配置文件  
  新建一个rollup.config.js的文件  
  ````js
  // rollup.config.js
   export default {
     // 核心选项
     input,     // 必须
     external,
     plugins,

     // 额外选项
     onwarn,

     // danger zone
     acorn,
     context,
     moduleContext,
     legacy

     output: {  // 必须 (如果要输出多个，可以是一个数组)
       // 核心选项
       file,    // 必须
       format,  // 必须
       name,
       globals,

       // 额外选项
       paths,
       banner,
       footer,
       intro,
       outro,
       sourcemap,
       sourcemapFile,
       interop,

       // 高危选项
       exports,
       amd,
       indent
       strict
     },
   };
  ````  
  ````bash
  // 运行命令
  rollup -c
  ````
  命令行参数：
  ````
   -i, --input                 要打包的文件（必须）
   -o, --output.file           输出的文件 (如果没有这个参数，则直接输出到控制台)
   -f, --output.format [es]    输出的文件类型 (amd, cjs, es, iife, umd)
   -e, --external              将模块ID的逗号分隔列表排除
   -g, --globals               以`module ID:Global` 键值对的形式，用逗号分隔开 
                                 任何定义在这里模块ID定义添加到外部依赖
   -n, --name                  生成UMD模块的名字
   -m, --sourcemap             生成 sourcemap (`-m inline` for inline map)
   --amd.id                    AMD模块的ID，默认是个匿名函数
   --amd.define                使用Function来代替`define`
   --no-strict                 在生成的包中省略`"use strict";`
   --no-conflict               对于UMD模块来说，给全局变量生成一个无冲突的方法
   --intro                     在打包好的文件的块的内部(wrapper内部)的最顶部插入一段内容
   --outro                     在打包好的文件的块的内部(wrapper内部)的最底部插入一段内容
   --banner                    在打包好的文件的块的外部(wrapper外部)的最顶部插入一段内容
   --footer                    在打包好的文件的块的外部(wrapper外部)的最底部插入一段内容
   --interop                   包含公共的模块（这个选项是默认添加的）
  ````
2. 使用api调用  
  
有两个相关api：
1. rollup.rollup
   执行rollup编译
   ````js
   const rollup = require('rollup');

   // see below for details on the options
   const inputOptions = {...};
   const outputOptions = {...};

   async function build() {
     // create a bundle
     const bundle = await rollup.rollup(inputOptions);

     console.log(bundle.imports); // an array of external dependencies
     console.log(bundle.exports); // an array of names exported by the entry point
     console.log(bundle.modules); // an array of module objects

     // generate code and a sourcemap
     const { code, map } = await bundle.generate(outputOptions);

     // or write the bundle to disk
     await bundle.write(outputOptions);
   }

   build();
   ````
2. rollup.watch
   监听
  ````js
  const rollup = require('rollup');

   const watchOptions = {...};
   const watcher = rollup.watch(watchOptions);

   watcher.on('event', event => {
     // event.code 会是下面其中一个：
     //   START        — 监听器正在启动（重启）
     //   BUNDLE_START — 构建单个文件束
     //   BUNDLE_END   — 完成文件束构建
     //   END          — 完成所有文件束构建
     //   ERROR        — 构建时遇到错误
     //   FATAL        — 遇到无可修复的错误
   });

   // 停止监听
   watcher.close();
  ````

通过这两个api，就可以编写js文件，通过npm script运行，也可以与gulp等工具联合使用。

## 相关插件  

* rollup-plugin-node-resolve 
  告诉 Rollup 如何查找外部模块
* rollup-plugin-commonjs 
  将CommonJS模块转换为 ES2015 供 Rollup 处理。
* rollup-plugin-babel 
  babel编译
  ````js
  //配置项
  export default {
    input: 'src/main.js',
    output: {
      file: 'bundle.js',
      format: 'cjs'
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**' // 只编译我们的源代码
      })
    ]
  };
  ````
  ````js
  //.babelrc文件
  {
    "presets": [
      ["@babel/preset-env", {
        "modules": false,
      }]
    ]
  }
  ````
* rollup-plugin-copy 
  复制文件
* rollup-plugin-json 
  支持json文件
* rollup-plugin-replace 
  获取环境变量需要转换
  ````js
  export default {
    // ...
    plugins: [
      replace({
        ENVIRONMENT: JSON.stringify('production')
      })
    ]
  };
  ````
* rollup-plugin-typescript2 
  typescript支持
* rollup-plugin-uglify
  js代码uglify

## 我的配置
我的sdk中有一个入口文件编译为核心js，还有多个lib文件需要编译为独立文件。因此配置项的方式不太适用，使用js文件通过api编译。  

````js
// rollup.config.js
const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify').uglify;
const json = require('rollup-plugin-json');
// const copy = require('rollup-plugin-copy');
const chalk = require('chalk');
const typescript = require('rollup-plugin-typescript2');

const env = process.env.NODE_ENV;
const inputRoot = 'src/libs';
const outputRoot = 'dist/libs';

init();

function init () {
  // 检查目录是否存在，不存在则创建。
  checkDirSync(outputRoot);
  // 然后继续执行
  walk();
}

// 遍历目录
function walk () {
  console.log(chalk.blue('遍历libs目录进行编译'));
  fs.readdir(inputRoot, function (err, files) {
    if (err) throw (err);

    files.map(file => {
      const url = path.resolve(inputRoot, file);
      fs.stat(url, function (err2, stat) {
        if (err2) throw err2;
        // 对每个lib目录进行编译
        if (stat.isDirectory()) {
          compile(file, 'api', 'front');
          compile(file, 'api', 'back');
          compile(file, 'desc');
        }
      });
    });
  });
}

// 编译lib
function compile (file, type, end) {
  checkDirSync('dist');

  const inputOptions = {
    input: type === 'api' ? `${inputRoot}/${file}/${end}.ts` : `${inputRoot}/${file}/desc.ts`, // 必须
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json'
      }),
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      }),
      commonjs(),
      json()
    ],
  };
  const outputOptions = {
    file: type === 'api' ? `${outputRoot}/jl-lib-${file}-${end}.js` : `${outputRoot}/jl-lib-${file}.desc.js`,
    name: type === 'api' ? `jl-lib-${file}-${end}` : `jl-lib-${file}-desc`, // umd或iife模式下，若入口文件含 export，必须加上该属性
    format: 'umd',
    sourcemap: true,
  };
  const watchOptions = {
    ...inputOptions,
    output: [outputOptions],
    watch: {
      chokidar: true,
    }
  };

  if (env === 'production') {
    // 生产环境
    inputOptions.plugins.push(
      uglify({
        compress: {
          drop_console: true,
        }
      }),
    );
  }

  // 执行rollup
  rollup
    .rollup(inputOptions)
    .then(function (bundle) {
      bundle.write(outputOptions);
    });

  // 监听
  // event.code 会是下面其中一个：
  //   START        — 监听器正在启动（重启）
  //   BUNDLE_START — 构建单个文件束
  //   BUNDLE_END   — 完成文件束构建
  //   END          — 完成所有文件束构建
  //   ERROR        — 构建时遇到错误
  //   FATAL        — 遇到无可修复的错误
  const watcher = rollup.watch(watchOptions);
  if (env === 'production') {
    watcher.on('event', event => {
      if (event.code === 'END') {
        console.log(chalk.greenBright(type === 'api' ? `创建dist/libs/jl-lib-${file}-${end}.js成功` : `创建dist/libs/jl-lib-${file}.desc.js成功`));
        watcher.close();
      }
    });
  } else {
    console.log(chalk.yellow(type === 'api' ? `监听dist/libs/jl-lib-${file}-${end}.js` : `监听dist/libs/jl-lib-${file}.desc.js`));
    checkDirSync('minapp_demo/jl-sdk/libs');
    checkDirSync('admin_demo/jl-sdk/libs');
    watcher.on('event', event => {
      if (event.code === 'END') {
        console.log(chalk.greenBright(type === 'api' ? `创建dist/libs/jl-lib-${file}-${end}.js成功` : `创建dist/libs/jl-lib-${file}.desc.js成功`));
        // 复制
        console.log(chalk.gray(type === 'api' ? `复制dist/libs/jl-lib-${file}-${end}.js到demo` : `复制dist/libs/jl-lib-${file}.desc.js到demo`));
        copy(
          path.join('dist/libs', type === 'api' ? `jl-lib-${file}-${end}.js` : `jl-lib-${file}.desc.js`),
          [
            path.join('minapp_demo/jl-sdk/libs/', type === 'api' ? `jl-lib-${file}-${end}.js` : `jl-lib-${file}.desc.js`),
            path.join('admin_demo/jl-sdk/libs/', type === 'api' ? `jl-lib-${file}-${end}.js` : `jl-lib-${file}.desc.js`),
            path.join('../newFashion-sdk/libs/jl-sdk/', type === 'api' ? `jl-lib-${file}-${end}.js` : `jl-lib-${file}.desc.js`),
          ]
        );
      }
    });
  }
}

function checkDirSync (src) {
  try {
    fs.readdirSync(src);
  } catch (err) {
    if (err) {
      console.log(`${src}目录不存在，创建目录`);
      fs.mkdirSync(src);
    }
  }
}

function copy (src, dsts) {
  dsts.map(dst => {
    fs.writeFileSync(dst, fs.readFileSync(src));
  });
}
````
package.json中相关脚本如下：
````json
{
  "scripts": {
    "build:core": "cross-env NODE_ENV=production node rollup.config.core.js",
    "build:libs": "cross-env NODE_ENV=production node rollup.config.libs.js",
    "build": "npm run clean:dist && npm run build:core && npm run build:libs",
    "dev:core": "cross-env NODE_ENV=development node --inspect rollup.config.core.js",
    "dev:libs": "cross-env NODE_ENV=development node rollup.config.libs.js",
    "dev": "npm run clean:dist && concurrently 'npm:dev:core' 'npm:dev:libs'",
    "start": "npm run dev",
    "clean:dist": "rimraf dist/**/*",
  }
}
````