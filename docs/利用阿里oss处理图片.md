## oss图片处理能力
我们平时存储图片一般都是用的阿里oss服务，阿里oss除了存储文件外，还有很多其他功能。比如可以通过拼接url后缀，来对图片进行处理。

官方文档在这里：[https://help.aliyun.com/document_detail/144582.html](https://help.aliyun.com/document_detail/144582.html)。

可以看到，支持很多处理方式，如修改图片的分辨率，给图片添加水印，转换图片格式，压缩图片等等。



下面简单介绍下拼接的规则：

1. 必须是上传到oss的图片链接
2. 后面拼接参数<font style="color:#DF2A3F;">?x-oss-process=image</font><font style="color:rgb(0, 0, 0);">，再继续按照不同的功能拼接</font>
3. <font style="color:rgb(0, 0, 0);">类似旋转、亮度这种，参数说明只有一个[value]的，直接/[key],[val]。如</font>[https://oss-console-img-demo-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image<font style="color:#DF2A3F;">/rotate,90</font>](https://oss-console-img-demo-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/rotate,90)
4. 如果参数说明是一个对象，对象又有很多子key，拼接方式是/[key],[subKey1]_[subVal1],[subKey2]_[subVal2],...。子key之间用','分割，最后一个不用加','。如[https://oss-console-img-demo-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image<font style="color:#DF2A3F;">/resize,h_100,m_lfit</font>](https://oss-console-img-demo-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/resize,h_100,m_lfit)
5. 同时进行多项处理，直接拼接即可，'/'分割。如[https://image-demo.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image<font style="color:#DF2A3F;">/resize,w_300/quality,q_90</font>](https://image-demo.oss-cn-hangzhou.aliyuncs.com/example.jpg?x-oss-process=image/resize,w_300/quality,q_90)



## 费用
> <font style="color:rgb(24, 24, 24);">使用图片处理服务时，会产生如下费用：</font>
>

+ <font style="color:rgb(24, 24, 24);">图片处理费用</font><font style="color:rgb(24, 24, 24);">未超出免费额度时，不产生费用；超出免费额度后，按处理的原图实际大小计费。计费详情，请参见</font>[数据处理费用](https://help.aliyun.com/document_detail/173537.htm#concept-2558464)<font style="color:rgb(24, 24, 24);">。</font>
+ <font style="color:rgb(24, 24, 24);">请求费用</font><font style="color:rgb(24, 24, 24);">处理图片时会产生一次</font><font style="color:rgb(24, 24, 24);">GetObject</font><font style="color:rgb(24, 24, 24);">请求，按请求次数收费。计费详情，请参见</font>[请求费用](https://help.aliyun.com/document_detail/173536.htm#concept-2558398)<font style="color:rgb(24, 24, 24);">。</font>
+ <font style="color:rgb(24, 24, 24);">流量费用根据处理后的图片大小收取外网流出流量费用。计费详情，请参见</font>[流量费用](https://help.aliyun.com/document_detail/173535.htm#concept-2558367)<font style="color:rgb(24, 24, 24);">。</font>

可以看到，<font style="color:#DF2A3F;">在额度内是免费的。超过额度后按次收费</font>。所以我们拼接生成的url不要直接来用，否则每个用户访问都算一次。要把它保存为新的图片，上传到oss来使用。

## 写一个web工具来处理
利用oss的功能，写了一个小的工具网页来处理图片。

1. 上传图片到oss
2. 进行参数配置
3. 预览和保存图片



![](https://cdn.nlark.com/yuque/0/2023/png/373268/1673851144719-e68a808c-d4a8-4aa3-8723-eb43eea852a3.png)

