在团队开发中，需要对代码风格进行统一；同时，好的代码风格也有利于阅读和维护。下面从ide和eslint的配置，以及git-commit预检测来介绍。



## VSCODE配置
现在vscode使用最多，其他编辑器也可类似配置。

### [editorconfig](https://editorconfig.org/)
vscode本身可以设置tab转换为空格。使用editorconfig可以更方便的对项目和文件做不同的配置。VSCODE可以安装editorconfig插件，然后在项目根目录新建一个.editorconfig文件。

```plain
root = true

[*]
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = false
insert_final_newline = true

```

这里可以在下面最近文件类型，比如设置java和python的tab为4个空格，而js的tab为2个空格。

### [eslint](https://eslint.bootcss.com/)
eslint是一个代码的强约束，通过一系列规则来严格控制团队代码风格。在官网可以看到详细的规则列表。

在项目中安装eslint，可以通过命令行进行校验。同时，需要安装一系列的包。

```plain
npm i -D eslint babel-eslint eslint-plugin-import eslint-plugin-node eslint-plugin-promise
```

eslint的规则需要在.eslintrc(.eslintrc.js、.eslintrc.json)文件中设置。一个eslintrc.js文件如下：

```javascript
module.exports = {
  root: true,
  extends: [
    'eslint-config-standard'
  ],
  globals: {
    my: false, // false只读
    getApp: false,
    App: false,
    getCurrentPages: false,
    Component: false,
    Page: false,
    getRegExp: false,
    getDate: false,
  },
  env: {
    "browser": true,
    "es6": true,
    "node": true,
    "jquery": true,
    "amd": true,
    "commonjs": true
  },
  plugins: [
  ],
  parser: "babel-eslint",
  rules: {
    "no-fallthrough": 0,
    "prefer-promise-reject-errors": 0,
    "comma-dangle": [2, "only-multiline"],
    "indent": [2, 2, {"SwitchCase": 1}],
    "no-useless-computed-key": 0,
    "semi": [2, "never"],
    "space-before-function-paren": [2, "always"],
    "no-console": 0,
    "no-alert": 2,
    "new-cap": 0,
    "no-eq-null": 0,
    "eqeqeq": [2, "always", {"null": "ignore"}],
    "no-param-reassign": 0,
    "no-invalid-this": 0,
    "quote-props": 0,
    "no-misleading-character-class": 0,
    "no-useless-escape": 0,
    "import/no-absolute-path": 0,
    "no-case-declarations": 0,
  }
}

```

其中，extends里的eslint-config-standard是一个eslint config，常用的还有eslint-config-airbnb。使用规则时需要npm安装。下面的rules就是需要设置的eslint规则，这两个config中包含了大量预设的规则，下面的rules可以自定义补充和覆盖。前面的key是规则名，后面的value可以是一个数字或数组。0表示忽略，不校验；1表示警告；2表示报错。具体的规则可以在官网查询。

另外可以通过注释忽略某一行或某个文件的eslint校验。

```javascript
// 某一段落忽略
/* eslint-disable */
alert('foo');
/* eslint-enable */

// 某一段路忽略指定规则
/* eslint-disable no-alert, no-console */
alert('foo');
console.log('bar');
/* eslint-enable no-alert, no-console */

// 整个文件下面开始忽略
/* eslint-disable */
```

也可以通过.eslintignore文件，设置忽略校验的文件夹，比如node_modules, dist, 第三方库。

```plain
.tea/
.idea
dist/
libs/
node_modules/
**/*.sjs

```

最后，再在package.json的script中设置eslint命令，通过npm run eslint来检验。

```json
{
  "name": "miniapp",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "eslint": "eslint miniapp/**/*.js",
  },
  "dependencies": {
    "babel-eslint": "^10.0.3",
    "eslint": "^6.7.2",
    "eslint-config-standard": "^14.1.0",
    "eslint-plugin-import": "^2.18.2",
    "eslint-plugin-node": "^10.0.0",
    "eslint-plugin-promise": "^4.2.1",
    "eslint-plugin-standard": "^4.0.1"
  }
}

```

在vscode中，我们有更方便的使用方式。首先安装eslint和prettier插件。然后vscode会在打开项目时自动eslint检测，在左侧目录对错误文件标红，在代码中也会自动标记警告和错误的位置，提示规则。

### prettier插件
我们知道，vscode快捷键Alt+Shift+F可以格式化代码。在vscode继续安装prettier插件，可以设置对齐方式使用eslint对齐。这样，对一些单双引号，空格等问题，可以一键格式化。更进一步，在vscode设置中选择保存自动fix代码，只要每次Ctrl+S保存代码，就会自动eslint对齐。

一些规则不能自动处理，比如我们推荐除了==null，其余地方都严格使用===，这个就无法自动转换，因为涉及到类型判断。



## PRE-COMMIT配置
npm安装pre-commit包。

```plain
npm i -D pre-commit
```

在package.json配置pre-commit。

```json
{
  "name": "xjh",
  "version": "1.0.0",
  "description": "",
  "main": "./miniapp/app.js",
  "scripts": {
    "eslint": "eslint miniapp/**/*.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "pre-commit": [
    "eslint"
  ],
  "devDependencies": {
    "babel-eslint": "^10.0.3",
    "eslint": "^6.7.2",
    "eslint-config-standard": "^14.1.0",
    "eslint-plugin-import": "^2.18.2",
    "eslint-plugin-node": "^10.0.0",
    "eslint-plugin-promise": "^4.2.1",
    "eslint-plugin-standard": "^4.0.1",
    "pre-commit": "^1.2.2"
  }
}

```

这样，在每次执行git commit时，就会先进行预设的eslint命令，如果eslint检查未通过，则不能commit代码，从而强制要求每个成员在提交代码时，必须符合项目eslint规范。



## Eslint Rules
三个级别：

+ `"off"` 或 `0` - 关闭规则
+ `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出)
+ `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出)

部分常用规则：

+ "no-fallthrough":  <font style="color:#333333;background-color:#F9F9F9;">禁止 </font>`case`<font style="color:#333333;background-color:#F9F9F9;"> 语句落空</font>
+ "prefer-promise-reject-errors": 要求使用 Error 对象作为 Promise 拒绝的原因
+ "comma-dangle":  <font style="color:#333333;background-color:#F9F9F9;">要求或禁止末尾逗号</font>
+ <font style="color:#333333;background-color:#F9F9F9;">"comma-spacing":  </font>强制在逗号前后使用一致的空格
+ "indent":  强制使用一致的缩进
+ "no-useless-computed-key": 禁止在对象中使用不必要的计算属性
+ "semi": 要求或禁止使用分号代替 ASI
+ "space-before-function-paren":  强制在 function的左括号之前使用一致的空格
+ "no-console": 0,
+ "no-alert": 禁用 alert、confirm 和 prompt
+ "new-cap": 要求构造函数首字母大写
+ "no-eq-null": 禁止在没有类型检查操作符的情况下与 null 进行比较
+ "eqeqeq": 要求使用 === 和 !==
+ "no-param-reassign": 禁止对 function 的参数进行重新赋值
+ "no-invalid-this": 禁止 this 关键字出现在类和类对象之外
+ "quote-props": 要求对象字面量属性名称用引号括起来
+ "no-misleading-character-class": 不允许在字符类语法中出现由多个代码点组成的字符
+ "no-useless-escape": 禁用不必要的转义字符
+ "no-case-declarations": 不允许在 case 子句中使用词法声明



