npm包：[https://www.npmjs.com/package/miniapp-svg2iconfont](https://www.npmjs.com/package/miniapp-svg2iconfont)

github: [https://github.com/ahao430/miniapp-svg2iconfont#readme](https://github.com/ahao430/miniapp-svg2iconfont#readme)

基于[svgtofont](https://www.npmjs.com/package/svgtofont)开发。

![](https://cdn.nlark.com/yuque/0/2023/gif/373268/1694074125468-188fb792-e49e-449e-a7ff-f906669c1ceb.gif)

背景：

平时小程序开发过程中，UI给的是一个个的svg，没有系统的iconfont维护。小程序端使用iconfont的话，首先要上传维护iconfont仓库，然后每次要转base63再下载，在项目中更新，比较麻烦。

在web端直接使用svg更加方便，如svg-sprite-loader，项目本地维护svg即可；但是小程序端svg只能作为图片使用。



思路：

svgtofont可以将本地的svg转成iconfont，但是看了文档，没有转成base64格式的选项，转base64的话，还是需要去iconmoon等网站工具。想到基于svgtofont生成的文件，继续转base64，再替换到css中，试验可行。



实现：

1. svg转font

从[https://www.iconfont.cn/](https://www.iconfont.cn/)下载了几个svg图片，引入svgtofont，传入src和dist路径，运行报错，发现下下来的svg代码中包含xml的头部，删掉就成功运行。

安装svgo，先遍历svg目录，优化后svg头部去掉了。

再次运行，成果在dist目录生成iconfont的html，css，字体文件。

2. font转base64

用fs.readFileSync读取ttf字体文件，再用Buffer.from(file).toString('base64‘)转成base64字符串。

查看网上手动转的base64格式iconfont的css，发现@font-face中，src的url换成了src: url("data:font/ttf;charset=utf-8;base64,xxxx")。读取css文件，用刚刚生成的base64字符串替换src中的部分，写到本地文件。

引入这个base64格式的iconfont.css文件，发现在小程序中可以正常使用class展示图片。也可以通过fontSize和color修改大小和颜色，说明转的base64格式可以正常使用。

3. 导出base64的css

将刚刚写到本地的base64格式的字体css文件，复制到指定目录和文件名。



详细代码见github仓库。





