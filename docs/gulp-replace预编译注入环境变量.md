## 需求：
在小程序使用pagespy，不希望带入到生产环境。期望在编译时而非运行时，动态判断环境注入代码。

要动态注入的代码：

```javascript
import PageSpy from '@huolala-tech/page-spy-alipay';

(function () {
  const uid = my.getStorageSync({ key: 'uid' }).data;
  const map = {
    'xxxxxxxxxxxxxxxx': 'xx',
  }
  // eslint-disable-next-line
  new PageSpy({
    api: 'xxx',
    project: 'xxx小程序',
    title: map[uid] || uid || new Date().toLocaleTimeString(),
  });
})();
```



## 分析：
之前我们用gulp做了环境变量，编译时输出不同的json配置到dist/config.json文件。而运行时的代码都是import config from '/config.json'。这次我们在生产环境不能把pagespy的包打包进去，因此需要在编译时修改代码。需要在编译阶段动态控制代码的注入。

+ 之前有用过[gulp-file-include](https://www.npmjs.com/package/gulp-file-include)，需要注入时引入单独的一个文件，然后注入这个文件的路径。
+ [gulp-inject](https://www.npmjs.com/package/gulp-inject)也需要引入单的文件来注入，不过支持注入时从注入路径，转换为注入内容。

我们用过vite，可以直接将环境变量注入到代码，我们这里有专门的不同环境的配置文件，想实现类似的效果，直接注入变量。所以选择[gulp-replace](https://www.npmjs.com/package/gulp-replace)来自己实现。



## gulp-replace介绍
<font style="color:rgb(17, 17, 17);">gulp-replace可以将gulp.src读取的文件的某个字符串进行替换，类似字符串的replace方法，后面可以是字符串，也可以是个函数。</font>

<font style="color:rgb(17, 17, 17);">replace插件方法：replace(string, replacement[, options])</font>

<font style="color:rgb(17, 17, 17);">replacement参数： string / function</font>

```javascript
const replace = require('gulp-replace');
const { src, dest } = require('gulp');

function replaceTemplate() {
  return src(['file.txt'])
    .pipe(replace('bar', 'foo'))
    .pipe(dest('build/'));
};

// or replace multiple strings
function replaceTemplate() {
  return src(['file.txt'])
    .pipe(replace('bar', 'foo'))
    .pipe(replace('baz', 'fuz'))
    .pipe(dest('build/'));
};

exports.replaceTemplate = replaceTemplate;
```

<font style="color:rgb(17, 17, 17);">当replacement为function时：replace(regex, replacement[, options])</font>

<font style="color:rgb(17, 17, 17);">options: { skipBinary: Boolean }</font>

```javascript
const replace = require('gulp-replace');
const { src, dest } = require('gulp');

function replaceTemplate() {
  return src(['file.txt'])
    // See https://mdn.io/string.replace#Specifying_a_string_as_a_parameter
    .pipe(replace(/foo(.{3})/g, '$1foo'))
    .pipe(dest('build/'));
};

exports.replaceTemplate = replaceTemplate;
```



## 实现
1. 我们把要注入的代码放到环境配置中，prod为空字符串，其余如下：  


```json
{
  "pagespy": `
  import PageSpy from '@huolala-tech/page-spy-alipay';

  (function () {
    const uid = my.getStorageSync({ key: 'uid' }).data;
  const map = {
    'xxxxxxxxxxxxxxxx': 'xx',
  }
  // eslint-disable-next-line
  new PageSpy({
  api: 'xxx',
  project: 'xxx小程序',
  title: map[uid] || uid || new Date().toLocaleTimeString(),
});
})();
`,
}
```



2. 在app.js加入注释，用于注入代码，这里用注释包裹，不影响代码高亮和eslint，也不影响代码静态检查。内部格式自己约定。

```javascript
...
/** replace:pagespy */
...
```

3. 改造gulpfile.js，在js文件加入replace方法，正则方法解析之前约定的格式，从环境config读取对应变量字段写入。

```javascript
const replace = require('gulp-replace');
const config = require(`./config/config.${ENV}.json`);

gulp.task('js', (done) => {
    return gulp
        .src([
            SOURCE_CODE_PATH + '/**/*.js',
            '!' + SOURCE_CODE_PATH + '/node_modules/**/*',
        ])
        .pipe(replace(/\/\*+\s*replace\:([^\*\/\s]+)\s*\*+\//, (match, $1) => {
            return config[$1] || '';
        }))
        .pipe(gulp.dest(OUTPUT_PATH));
});
```



