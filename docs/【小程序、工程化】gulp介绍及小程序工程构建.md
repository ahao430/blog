从零开始介绍下gulp的使用，及小程序的工程化搭建。

## [gulp](https://gulpjs.com/)介绍


gulp是一款基于流的思想，执行一系列预设任务的工具。将工作拆解为一个个的任务，并通过流的传递来链式调用执行。



### gulp vs webpack
我们现在常用的webpack是一款打包工具，二者在思想上不同，但是又能实现很多相同的功能。webpack更适合SPA那种单一入口的项目，而gulp更适合多页面的处理。

### 
### 安装及使用
gulp一般全局安装即可。当然具体项目还需要安装对应的gulp插件。

```javascript
npm install -g gulp
```

在项目根目录新建一个gulpfile.js文件，进行相关任务的编写。其中gulp.task('default')是默认任务，可以直接用

"_gulp_"命令执行，其他任务需要用"_gulp 任务名_"来执行。

```javascript
// gulpfile.js
const gulp = require('gulp')

// 默认任务
gulp.task('default', done => {
  console.log('gulp执行了')
    done()
})
```

### 
### 常用api（gulp4）
#### gulp.task(taskName, taskFunction)
创建一个任务，第一个参数是任务名，后面是执行函数，可以是

```javascript
done => {
	// do sth
  done()
}
```

或者

```javascript
() => {
	return asyncFunc() 
}
```

也可以是gulp.series或gulp.parrlel组织多个任务。

#### gulp.series(task1, task2, ...)
顺序执行多个任务，参数可以是任务名，也可以是任务函数

#### gulp.parallel(task1, task2, ...)
同时执行多个任务

#### gulp.src(path)
读取文件路径。可以接收一个相对路径字符串，也可以接收一个路径数组。路径中可以用*代表任务值，也可以用**/*代表任意层，在数组中用!可以排除某个路径。最后文件后缀可以用{ext1, ext2, ...}指定多个。返回工作流。

如：

```javascript
gulp.src([
    './src/**/*.{less,css,acss}',
    '!./src/node_modules/**/*',
])
```

#### gulp.dest(path)
输出文件路径。格式同上。注意src使用数组传递时，dest执行一个路径可能跟我们想要的结果不一样。返回工作流。

#### gulp.watch(path, taskFunction)
执行监听任务，第一个参数是路径，第二个参数是任务函数。这样我们就能监听代码的变化，去重新执行任务，实现代码的热编译。



### 常用插件
gulp有很多插件，能帮助我们对代码进行编译，如less/scss编译，js压缩混淆等等，从而将源代码转换为输出代码。实际开发的时候可以按需要去搜索。需要安装插件：

```javascript
npm install --save-dev gulp-xxx
```

#### [gulp-less](https://www.npmjs.com/package/gulp-less)
将读取的less文件代码编译为css。

```javascript
var less = require('gulp-less');
var path = require('path');
 
gulp.task('less', function () {
  return gulp.src('./less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});
```

#### [gulp-babel](https://www.npmjs.com/package/gulp-babel)
将读取的js文件进行babel编译为es5。

```javascript
const gulp = require('gulp');
const babel = require('gulp-babel');
 
gulp.task('default', () =>
    gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist'))
);
```

#### [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)
对js文件进行压缩混淆。

```javascript
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
 
gulp.task('compress', function () {
  return pipeline(
        gulp.src('lib/*.js'),
        uglify(),
        gulp.dest('dist')
  );
});
```

#### [gulp-plumber](https://www.npmjs.com/package/gulp-plumber)
这是一个很重要的插件，当我们在进行less或者js代码编写时，如果设置了less或者babel编译，并且设置了监听，那么遇到代码写错了或者写了一半点击保存时，gulp会报错并停止。但是我们可以用gulp-plumber来防止gulp停止运行，这样只需修改错误代码再次保存即可。

```javascript
var plumber = require('gulp-plumber');
var less = require('gulp-less');
 
gulp.src('./src/**/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest('./dist'));
```

#### [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)
对css做auto-prefixer转换。

```javascript
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
 
exports.default = () => (
    gulp.src('src/app.css')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dist'))
);
```

#### [gulp-clean](https://www.npmjs.com/package/gulp-clean)
删除目录和文件。可以用src数组来忽略删除特定文件。

```javascript
var gulp = require('gulp');
var clean = require('gulp-clean');
 
gulp.task('default', function () {
    return gulp.src('app/tmp', {read: false})
        .pipe(clean());
});
```

#### [gulp-base64](https://www.npmjs.com/package/gulp-base64)
将css中的url链接转base64，可以设置转换文件的大小不能超过某个最大值，这样可以对css引用图片中的小图转换base64，减少请求数量，而大图片不转换，以免代码体积暴增。

```javascript
gulp.task('build', function () {
    return gulp.src('./css/*.css')
        .pipe(base64({
            baseDir: 'public',
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
            maxImageSize: 8*1024, // bytes
            debug: true
        }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./public/css'));
});
```

#### [gulp-file-include](https://www.npmjs.com/package/gulp-file-include)
相当于一个预编译模板，编写一些公用的html模板，然后在html中通过指定变量引入，在gulp编译时会自动将这里替换为对应的html模板。由于是在gulp编译阶段执行，所以这里所有的内容都只是字符串，因此可以将一些公用的import等命令也写在这里，也不受到位置限制。

支持传入变量给模板，模板支持简单的if，for，loop等语句。

```javascript
const fileinclude = require('gulp-file-include');
const gulp = require('gulp');

gulp.task('fileinclude', function() {
  gulp.src(['index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./'));
});
```

index.html:

```html
<!DOCTYPE html>
<html>
  <body>
  @@include('./view.html')
  </body>
</html>
```

view.html:

```html
<h1>view</h1>
```

#### [gulp-rename](https://www.npmjs.com/package/gulp-rename)
在输出时修改文件的名称或后缀

```javascript
var rename = require("gulp-rename");
 
// rename to a fixed value
gulp.src("./src/main/text/hello.txt")
  .pipe(rename("main/text/ciao/goodbye.md"))
  .pipe(gulp.dest("./dist"));

gulp.src("./src/**/hello.txt")
  .pipe(rename(function (path) {
    // Returns a completely new object, make sure you return all keys needed!
    return {
      dirname: path.dirname + "/ciao",
      basename: path.basename + "-goodbye",
      extname: ".md"
    };
  }))
  .pipe(gulp.dest("./dist"));
```

---

## 小程序gulp工程化构建
下面，我们来构建一个小程序的工程化，由于小程序是多页面，因此很适合用gulp来处理。

### 目录划分
在项目根目录创建src目录和dist目录，分别存放源代码和打包文件。在根路径创建gulpfile.js。注意根路径node_modules安装的是gulp相关编译的包。而小程序的代码依赖包要安装到src目录，在编译时同步到dist目录。

```plain
.
├── dist // 打包路径
├── node_modules
├── src // 源代码
│   ├── node_modules
│   ├── pages // 小程序页面
│   ├── app.js
│   ├── app.json
│   ├── app.less
│   ├── mini.project.json // 小程序配置文件
│   └── package.json // 小程序依赖包
├── .gitignore
├── gulpfile.js
├── package.json // gulp等依赖包
└── README.md
```

这样，我们在src目录写代码，实时编译到dist目录，然后在小程序开发工具创建时直接选择dist目录。

但是有一个问题，就是我们在开发工具中点击详情进行项目配置，这个配置是保存在dist目录而非src目录的，需要我们手动同步，现在的解决方案是直接把dist目录的mini.project.json添加到git提交了，而在编译时，忽略src目录这个文件的同步。



### 拆解任务
在小程序开发工具中，页面或者组件文件包括axml，css，js和json文件，也可以再加一个sjs文件。其中js文件是部分支持es6的，并且上传代码时会自动压缩。因此对于es6开发的js文件就没有编译的必要了，只需要确保是用的方法都是小程序支持的，或者对于不支持的部分可以在app.js全局引入一个pofyfill文件。



#### gulpfile.js  0.1 编译less
开发时我们采用less来编写样式，对于less文件我们需要编译为css，而其他文件基本直接复制到dist目录就可以了。此时的gulpfile就很简单了，一个less任务，剩下都是复制。另外less文件编译时加入plumb防止报错停止。

最后对编译和复制任务加上监听。我们建立一个dev任务执行编译并监听，建立一个build任务只编译。

```javascript
const gulp = require('gulp')
const less = require('gulp-less')
const plumber = require('gulp-plumber')

const SOURCE_CODE_PATH = './src'
const OUTPUT_PATH = './dist'

// 复制文件
gulp.task('copy', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*',
        '!' + SOURCE_CODE_PATH + '/**/*.less',
      	'!' + SOURCE_CODE_PATH + '/mini.project.json',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('style', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.less',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(plumber())
        .pipe(less({
            outputStyle: 'compressed'
        }))
        .pipe(rename(function (path) {
            path.extname = '.acss'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

// 监听
gulp.task('watch', done => {
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{js,json,axml,png,jpg,jpeg,gif,ico,svg,webp}', 'copy')
    gulp.watch(SOURCE_CODE_PATH + '/**/*.less', gulp.series('less'))
    done()
})

// 开发编译
gulp.task('dev', gulp.series('copy', 'less', 'watch', done => {
    done()
}))

// 生产编译
gulp.task('build', gulp.series('copy', 'less', done => {
    done()
}))

// 默认任务
gulp.task('default', 'dev')

```

#### 
#### gulpfile.js 0.2 环境变量
我们在实际开发中，经常要切换多个环境，因此在项目根目录添加一个环境配置文件，并希望不同的命令使用不同的环境变量进行编译。

我们不直接使用gulp命令编译，而是通过npm scripts进行编译，通过环境变量传入。在package.json加入如下命令（需安装cross-env包）：

```javascript
  "scripts": {
    "dev:dev": "cross-env NODE_ENV=dev gulp dev",
    "dev:test": "cross-env NODE_ENV=test gulp dev",
    "dev:prod": "cross-env NODE_ENV=prod gulp dev",
    "build:dev": "cross-env NODE_ENV=dev gulp build",
    "build:test": "cross-env NODE_ENV=test gulp build",
    "build:prod": "cross-env NODE_ENV=prod gulp build"
  },
```

这样，我们运行不同的dev或者build命令，可以传入不同的环境变量。在gulpfile中，通过node环境的process获取环境参数。

我们在项目代码中读取src/config.js文件中的环境配置。在根目录对每一个环境创建一个对应的配置文件，在gulpfile中根据当前环境变量读取对应的配置文件，输出为config.js。

test.config.js:

```javascript
export default {
    url: 'https://xxx-test.com'
}
```

在gulpfile.js添加以下代码：

```javascript
const rename = require('gulp-rename')
const ENV = process.env.NODE_ENV || 'prod'

// 环境配置。先编译到src目录，稍后一同copy到dist目录
gulp.task('env', done => {
    return gulp.src(ENV + '.config.js')
        .pipe(rename(function (path) {
            path.basename = 'config'
        }))
        .pipe(gulp.dest(SOURCE_CODE_PATH))
})

// 开发编译
gulp.task('dev', gulp.series('env', 'copy', 'less', 'watch', done => {
    done()
}))

// 生产编译
gulp.task('build', gulp.series('env', 'copy', 'less', done => {
    done()
}))
```



#### gulpfile.js 0.3 clean及其他包引入
我们在开发时，在src目录创建了很多文件，当我们移除这些文件或者重命名时，对应的dist目录文件还在，因此我们最好能在执行dev或者build命令时先清空dist目录。

```javascript
const clean = require('gulp-clean')

// 清空dist
gulp.task('clean', done => {
    return gulp.src([
        OUTPUT_PATH + '**/*',
        '!' + OUTPUT_PATH + '/mini.project.json',
    ])
        .pipe(plumber())
        .pipe(clean())
})

// 开发编译
gulp.task('dev', gulp.series('clean', 'env', 'copy', 'less', 'watch', done => {
    done()
}))

// 生产编译
gulp.task('build', gulp.series('clean', 'env', 'copy', 'less', done => {
    done()
}))
```

我们继续优化，对less文件编译为css后，加入auto-prefixer，再加入base64。但是如果有人在src目录没有使用less，直接创建了css，我们也希望能够进行这两个编译。那么在src中可以用.{css, less}来支持两种格式，最后再在dest之前，rename为acss后缀。

```javascript
gulp.task('style', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{less,css,acss}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(plumber())
        .pipe(less({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(base64({
            extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp'],
            exclude: [/https?/],
            maxImageSize: 8 * 1024, // bytes
            debug: false
        }))
        .pipe(rename(function (path) {
            path.extname = '.acss'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
```

同样的，有人喜欢在src用html后缀，我们可以将html单独提出来，rename为axml。干脆将copy任务拆解，方便后续对不同类型文件编译过程加入改造。最后，dev和build任务中都要执行一系列相同的并行编译操作，我们将它们提出来。

最后，我们可以在控制台打印一些注释，方便我们查看当前编译的环境和状况。安装chalk，可以设置console的颜色。

```javascript
const gulp = require('gulp')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const less = require('gulp-less')
const base64 = require('gulp-base64')
const autoprefixer = require('gulp-autoprefixer')
const plumber = require('gulp-plumber')
const json5 = require('gulp-json5-to-json')
const chalk = require('chalk')

const SOURCE_CODE_PATH = './src'
const OUTPUT_PATH = './dist'
const ENV = process.env.NODE_ENV || 'prod'

const startTime = Date.now()

// 清空dist
gulp.task('clean', done => {
    return gulp.src([
        OUTPUT_PATH + '**/*',
        '!' + OUTPUT_PATH + '/.tea',
        '!' + OUTPUT_PATH + '/mini.project.json',
    ])
        .pipe(plumber())
        .pipe(clean())
})

// 环境配置。先编译到src目录，稍后一同copy到dist目录
gulp.task('env', done => {
    return gulp.src(ENV + '.config.js')
        .pipe(rename(function (path) {
            path.basename = 'config'
        }))
        .pipe(gulp.dest(SOURCE_CODE_PATH))
})

// 复制node_modules
gulp.task('npm', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH + '/node_modules'))
})


// 处理文件
gulp.task('html', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{axml,html}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(rename(function (path) {
            path.extname = '.axml'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('style', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{less,css,acss}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(plumber())
        .pipe(less({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(base64({
            extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp'],
            exclude: [/https?/],
            maxImageSize: 8 * 1024, // bytes
            debug: false
        }))
        .pipe(rename(function (path) {
            path.extname = '.acss'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('js', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.js',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('sjs', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.sjs',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('json', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('image', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{png,jpg,jpeg,gif,ico,svg,webp}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
    // done()
})

// 主任务
gulp.task('main', gulp.parallel('html', 'style', 'js', 'sjs', 'json', 'image'), done => done())

// 监听
gulp.task('watch', done => {
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{html,axml}', gulp.series('html'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{less, acss, css}', gulp.series('style'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.js', gulp.series('js'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.sjs', gulp.series('sjs'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.json', gulp.series('json'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{png,jpg,jpeg,gif,ico,svg,webp}', gulp.series('image'))
    done()
})

// 开发编译
gulp.task('dev', gulp.series('clean', 'env', 'npm', 'main', 'watch', done => {
    done()
    const endTime = Date.now()
    console.log(chalk.blue('当前环境是：' + ENV))
    console.log(chalk.green('编译用时' + ((endTime - startTime) / 1000) + 's'))
    console.log(chalk.yellow('监听中'))
}))

// 生产编译
gulp.task('build', gulp.series('clean', 'env', 'npm', 'main', done => {
    done()
    const endTime = Date.now()
    console.log(chalk.blue('当前环境是：' + ENV))
    console.log(chalk.green('编译完成，用时' + ((endTime - startTime) / 1000) + 's'))
}))

// 默认任务
gulp.task('default', gulp.series('main', 'watch', done => {
    done()
    console.log(chalk.blue('不修改当前环境，启动监听'))
    console.log(chalk.yellow('监听中'))
}))

```

#### gulpfile.js 0.4 针对小程序优化 
在小程序中，我们有时会写一些公用的js常量文件，但是这些文件在sjs中是无法使用的，但是我们可以讲一个公用的文件同时编译为js和sjs两个文件输出到dist。注意在这个代码块中不要写sjs不支持的函数。

```javascript
// 读取common/constance，生成一个同名sjs文件
gulp.task('constance2sjs', done => {
    return gulp.src(SOURCE_CODE_PATH + '/common/constance.js')
        .pipe(rename(function (path) {
            path.extname = '.sjs'
        }))
        .pipe(gulp.dest(OUTPUT_PATH + '/common'))
})
```

在开发过程中，我们尽量在axml, js，acss中使用绝对路径（小程序开发是在src，开发工具读取dist，因此，开发时代码中以src做为根路径，这跟gulpfile这个node环境是不同的），方便迁移目录。但是less文件中如果是用@import导入其他less，这是在编译阶段而非运行阶段执行的，此时的根据了是项目根路径。我们如果不想在每个@import写入一长串./src/common/等路径，可以用gulp-aliases来设置编译时的路径别名，有点类似webpack的alias。

```javascript
const aliases = require('gulp-style-aliases')

gulp.task('style', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{less,css,acss}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(plumber())
        .pipe(aliases({
            '@common': './src/common',
        })) // less会把@import打包进来，使用真实项目路径；js和axml不用，模拟器读取dist目录根路径即为dist
        .pipe(less({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(base64({
            extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp'],
            exclude: [/https?/],
            maxImageSize: 8 * 1024, // bytes
            debug: false
        }))
        .pipe(rename(function (path) {
            path.extname = '.acss'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
```

在html中使用gulp-file-include插入公用模板。

```javascript
const fileInclude = require('gulp-file-include')

// 处理文件
gulp.task('html', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{axml,html}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename(function (path) {
            path.extname = '.axml'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
```

微信小程序中支持在app.json设置公用的usingComponents，但是支付宝小程序不支持。假设我们在html中用模板插入了一个公用组件，却必须在每个页面的json手动引入，就不太好了。这时可以用gulp来插入，找到一款gulp-json-editor插件。由于只想对页面插入，不想插入组件，也不想插入到app.json等其他json文件，因此将json分了几类。

```javascript
const jeditor = require('gulp-json-editor')

gulp.task('json1', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/pages/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/**/*/pages/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('json2', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/pages/**/*.{json,json5}',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(jeditor(require('./src/common/common-page-json'), {
            beautify: true,
        }))
        .pipe(gulp.dest(OUTPUT_PATH + '/pages'))
})
gulp.task('json3', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*/pages/**/*.{json,json5}',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(jeditor(require('./src/common/common-page-json'), {
            beautify: true,
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('json', gulp.parallel('json1', 'json2', 'json3'), done => done())
```



### 最终版
```javascript
const gulp = require('gulp')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const fileInclude = require('gulp-file-include')
const less = require('gulp-less')
const base64 = require('gulp-base64')
const autoprefixer = require('gulp-autoprefixer')
const plumber = require('gulp-plumber')
const json5 = require('gulp-json5-to-json')
const chalk = require('chalk')
// const fs = require('fs')
const aliases = require('gulp-style-aliases')
const jeditor = require('gulp-json-editor')

const SOURCE_CODE_PATH = './src'
const OUTPUT_PATH = './dist'
const ENV = process.env.NODE_ENV || 'prod'

const startTime = Date.now()

// 清空dist
gulp.task('clean', done => {
    return gulp.src([
        OUTPUT_PATH + '**/*',
        '!' + OUTPUT_PATH + '/.tea',
        '!' + OUTPUT_PATH + '/mini.project.json',
        // '!' + OUTPUT_PATH + '/node_modules',
    ])
        .pipe(plumber())
        .pipe(clean())
})

// 环境配置。先编译到src目录，稍后一同copy到dist目录
gulp.task('env', done => {
    return gulp.src(ENV + '.config.js')
        .pipe(rename(function (path) {
            path.basename = 'config'
        }))
        .pipe(gulp.dest(SOURCE_CODE_PATH))
})

// 复制node_modules
gulp.task('npm', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH + '/node_modules'))
})

// 读取common/constance，生成一个同名sjs文件
gulp.task('constance2sjs', done => {
    return gulp.src(SOURCE_CODE_PATH + '/common/constance.js')
        .pipe(rename(function (path) {
            path.extname = '.sjs'
        }))
        .pipe(gulp.dest(OUTPUT_PATH + '/common'))
})

// 处理文件
gulp.task('html', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{axml,html}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename(function (path) {
            path.extname = '.axml'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('style', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{less,css,acss}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(plumber())
        .pipe(aliases({
            '@common': './src/common',
        })) // less会把@import打包进来，使用真实项目路径；js和axml不用，模拟器读取dist目录根路径即为dist
        .pipe(less({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(base64({
            extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp'],
            exclude: [/https?/],
            maxImageSize: 8 * 1024, // bytes
            debug: false
        }))
        .pipe(rename(function (path) {
            path.extname = '.acss'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('js', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.js',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('sjs', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.sjs',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
})

gulp.task('json1', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/pages/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/**/*/pages/**/*.{json,json5}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('json2', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/pages/**/*.{json,json5}',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(jeditor(require('./src/common/common-page-json'), {
            beautify: true,
        }))
        .pipe(gulp.dest(OUTPUT_PATH + '/pages'))
})
gulp.task('json3', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*/pages/**/*.{json,json5}',
    ])
        .pipe(json5({
            beautify: true // default
        }))
        .pipe(jeditor(require('./src/common/common-page-json'), {
            beautify: true,
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
gulp.task('json', gulp.parallel('json1', 'json2', 'json3'), done => done())

gulp.task('image', done => {
    return gulp.src([
        SOURCE_CODE_PATH + '/**/*.{png,jpg,jpeg,gif,ico,svg,webp}',
        '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
    ])
        .pipe(gulp.dest(OUTPUT_PATH))
    // done()
})

// 主任务
gulp.task('main', gulp.parallel('html', 'style', 'js', 'sjs', 'json', 'image'), done => done())

// 监听
gulp.task('watch', done => {
    gulp.watch(SOURCE_CODE_PATH + '/**/*.tmpl', gulp.series('html'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{html,axml}', gulp.series('html'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{less, acss, css}', gulp.series('style'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.js', gulp.series('js'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.sjs', gulp.series('sjs'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{json,json5}', gulp.series('json'))
    gulp.watch(SOURCE_CODE_PATH + '/**/*.{png,jpg,jpeg,gif,ico,svg,webp}', gulp.series('image'))
    done()
})

// 开发编译
gulp.task('dev', gulp.series('clean', 'env', 'npm', 'constance2sjs', 'main', 'watch', done => {
    done()
    const endTime = Date.now()
    console.log(chalk.blue('当前环境是：' + ENV))
    console.log(chalk.green('编译用时' + ((endTime - startTime) / 1000) + 's'))
    console.log(chalk.yellow('监听中'))
}))

// 生产编译
gulp.task('build', gulp.series('clean', 'env', 'npm', 'constance2sjs', 'main', done => {
    done()
    const endTime = Date.now()
    console.log(chalk.blue('当前环境是：' + ENV))
    console.log(chalk.green('编译完成，用时' + ((endTime - startTime) / 1000) + 's'))
}))

// 默认任务
gulp.task('default', gulp.series('constance2sjs', 'main', 'watch', done => {
    done()
    console.log(chalk.blue('不修改当前环境，启动监听'))
    console.log(chalk.yellow('监听中'))
}))

```

