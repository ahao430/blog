> ali-oss sdk(nodejs版)：[https://help.aliyun.com/zh/oss/developer-reference/getting-started-with-oss-sdk-for-node-js?spm=a2c4g.11186623.0.0.e1137efd32AoVH](https://help.aliyun.com/zh/oss/developer-reference/getting-started-with-oss-sdk-for-node-js?spm=a2c4g.11186623.0.0.e1137efd32AoVH)
>

#### 背景
之前在海星server基于ali-oss的nodejs sdk，做了oss上传下载文件的接口，并基于上传接口做了一款网页版的上传工具， 界面如下：

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1712643803843-9703f00a-bae9-4763-88f5-f4da03f0ceca.png)

平时上传一些图片等静态资源还是很方便的。但是有个问题是上传之后看不到当前的目录结构和历史上传的文件，替换文件的时候要记得文件路径去拼写。

为了解决上述问题，仔细查询文档后，发现有查询目录的api，实现了一个2.0版，界面如下：

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1712643657693-72933fba-53c0-4cd1-8d12-17bedf361e3f.png)

#### sdk相关方法
+ 查询目录: client.list方法，传入路径，列举制定前缀的文件，返回当前路径的文件列表和子目录列表。
+ 删除文件：client.delete方法删除单个文件。
+ 上传文件：client.put上传本地文件。oss中没有目录的概念，上传路径的/当做逻辑上的目录划分。
+ 下载文件：client.get方法下载单个文件，返回nodebuffer。

#### 能力和接口实现
前面上传、下载和删除都是针对单个文件的，针对目录，我们可以用递归来实现。

+ 删除目录：查询目录，然后递归删除文件，子目录继续递归
+ 上传本地文件夹：递归上传文件
+ 下载文件：这里就不用调用sdk方法了，直接前端拼接oss访问链接，用a标签下载
+ 下载目录：这里稍微复杂一些，服务端查询目录，递归查询文件，将buffer塞到jsZip对象中，最后整体生产一个buffer返回给前端。前端通过将buffer创建blob对象实现下载。

```javascript
// 列举文件夹内容
// oss默认100，最多只能1000，否则接口报错
let listDir = async function (dir, max=1000) {
  const result = await client.list({
    prefix: dir,
    'max-keys': max,
    // 设置正斜线（/）为文件夹的分隔符。
    delimiter: '/'
  });

  result.prefixes = result.prefixes || []
  result.objects = result.objects || []

  result.subDirs = result.prefixes.map(subDir => subDir.replace(dir, ''))
  result.files = result.objects.map(obj => obj.name.replace(dir, '')).filter(item => item !== '')
  return result
}
// 下载文件夹到本地（递归，给海星后台管理页用）
let getFolderBuffer = function (dir) {
  return new Promise((resolve, reject) => {
    const map = {}
    let zip = new JSZip()
    let count = 1
    const onFinish = async function () {
      const content = await zip.generateAsync({
        // 压缩类型选择nodebuffer，在回调函数中会返回zip压缩包的Buffer的值，再利用fs保存至本地
        type: "nodebuffer",
        // 压缩算法
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      })
      resolve(content)
    }
    const run = async function (_dir) {
      console.log(_dir)
      let list = await listDir(_dir)
      console.log(list)
      count--
      count += list.objects.length + list.prefixes.length
      if (count === 0) {
        onFinish()
      } else {
        // 下载文件
        list.objects.forEach(async obj => {
          const buffer = await getFileBuffer(obj.name)
          zip.file(obj.name, buffer)
          count--
          if (count === 0) {
            onFinish()
          }
        })
        // 递归下载文件夹
        list.prefixes.forEach(subDir => {
          run(subDir)
        })
      }
    }
    run(dir)
  })
}
```

```javascript
import FileSaver from 'file-saver';

export const nodeBuffer2Blob = (nodeBuffer) => {
  const arrayBuffer = new Int8Array(nodeBuffer);
  const blob = new Blob([arrayBuffer], {type: 'application/blob'});
  return blob;
};
export const downloadNodeBuffer = (nodeBuffer, name = Date.now()) => {
  const blob = nodeBuffer2Blob(nodeBuffer);
  return FileSaver.saveAs(blob, name + '.zip');
};

```

#### 页面设计
+ 核心是在上传的基础上，加上目录结构查询展示。在此基础上，做一些优化，按照我们的习惯，做一个类似文件浏览器的界面，支持双击目录进入下一层，支持双击..返回上一层，支持点击文件查看，支持文件和目录的下载、删除（这里考虑到安全性，删除目录隐藏了，只能删除单个文件）。上方再做一个面包屑，实时展示当前目录层级，并且可以点击返回任意一层。
+ 外层用上传容器包裹，整体部分支持拖拽文件上传。
+ 最后做一个浮标，点击查看当前上传文件列表。

#### 效果展示
![](https://cdn.nlark.com/yuque/0/2024/gif/373268/1712647238212-cdbd7168-fd49-40ef-9854-b591561544ee.gif)

有个小问题：当文件上传过后，再次上传相同文件不会触发onchange，需要先在上传列表点击删除或者清空。



