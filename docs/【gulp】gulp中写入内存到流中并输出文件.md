当前的小程序脚手架中，写了不同环境的配置文件，再通过环境变量读取指定的配置文件输出到dist。

```javascript
// gulpfile.js
const ENV = process.env.NODE_ENV

gulp.task('env', done => {
    return gulp.src(`./config/config.${[ENV]}.js`)
        .pipe(rename(function (path) {
            path.extname = '.json'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
```

这样，创建多个不同环境的配置文件，就可以在编译时实现不同环境配置的注入了。



但是，这样用起来比较麻烦，实际上我们不同环境的配置文件，可能大部分是相同的，只有小部分不同。我们希望可以有一个公用的配置文件，再合并不同环境的配置。

```javascript
// config/index.js
const merge = require('deepmerge')
const ENV = process.env.NODE_ENV || 'prod'
const config = require('./config.js')
const envConfig = require(`./config.${ENV}.js`)

module.exports = merge(config, envConfig)

```

我们写一个入口文件，如果是webpack编译，自然可以直接import这个文件，但是如果用gulp编译，src读取这个文件的话，dest的时候会原封不动的输出，然后就会报错找不到process。我们需要的是在gulp编译时先读取config到内存，再输出文件。

这个时候用node的fs模块直接输出是可以的。但是我们的gulp是基于流运行的，目前的脚手架代码是先运行环境任务，完成后再继续运行其他任务。我们需要把这个文件加入到流中。查阅gulp的文档，可以发现gulp是自己实现了一套虚拟文件vinyl，然后结合fs封装了一个vinyl-fs，gulp的src和dest都是继承的vfs的方法。这里我们就需要用vinyl实现一个虚拟文件，写入内容。

实现如下：

```javascript
const Vinyl = require('vinyl')
const config = require('./config/index')

function string_src (filename, string) {
    var src = require('stream').Readable({ objectMode: true })
    src._read = function () {
        this.push(new Vinyl({
            cwd: './',
            base: './',
            path: filename,
            contents: Buffer.from(string, 'utf-8')
        }))
        this.push(null)
    }
    return src
}

gulp.task('env', done => {
    return string_src('config.json', JSON.stringify(config, null, 2))
        .pipe(rename(function (path) {
            path.extname = '.json'
        }))
        .pipe(gulp.dest(OUTPUT_PATH))
})
```

将config转化为JSON字符串，用Buffer写入，赋值给虚拟文件的内容。用node的stream模块创建流，来替代gulp.src。然后正常输出这个配置文件就可以了。

可以看到运行后，在dist目录出现了config.json文件，内容是这个JSON字符串，不过是单行的没有格式化。在JSON.stringify加上参数，输出带格式的文件。

