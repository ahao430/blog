# 在小程序中使用async/await
在小程序中直接使用async/await报错，看了下微信开发工具，只默认转换es6。上网搜索相关文章，发现可通过facebook的一个库实现：[regenerator](https://github.com/facebook/regenerator)。
### 使用方法：
1. 下载文件，将packages/regenerator-runtime目录复制到小程序项目。
2. 在要使用async/await的页面引入runtime文件。这里我是在app.js引入挂在到gloabalData，在每个页面引入。页面作用域必须存在regeneratorRuntime变量，否则会报错。
````js
import regeneratorRuntime from './libs/regenerator-runtime/runtime'
````
3. 在页面js中使用async/await代替promise。如果在回调中使用，需要在回调前面再次加上async。
````js
async fn () {
  try {
    const res = await ajax()
    console.log(res)
    //
  } catch (err) {
    //
  }
}
````