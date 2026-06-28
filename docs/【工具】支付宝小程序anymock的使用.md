在前后端分离开发的过程中，经常使用mock来进行开发，这方面的工具有在项目代码中开发环境下引入[mockjs](http://mockjs.com/)来做mock服务，或是使用线上mock服务平台如[rap](http://rap2.taobao.org/)、[apizza](https://apizza.net/pro/#/)等。这些服务最大的一个问题是，要么全部接口启用mock，要么全部接口不使用mock。如果是在新项目比较方便，但是对于半路接手的项目，显然全部设置一遍mock是不现实的。

在web项目中，可以在开发环境引入mockjs，对某些接口做拦截，而非单独起一个mock服务域名。在支付宝小程序中，可以使用anymock服务。

新版本的开发工具中，新增了一个anymock的按钮，点击可以看到一个配置界面。点击前往[anymock](https://anymock.alipay.com/)平台并登陆，可以配置项目mock代码。anymock不需要设置全部接口mock，而是对设置了mock的接口返回mock数据，对找不到mock数据的接口正常请求，这样，更方便我们在新迭代中开发。

## anymock
登录后，可以创建一个项目，复制token填入开发工具。

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1588043969339-d930b0b5-547a-4b60-b307-87da5f683e8e.png)

进入项目，可以创建接口，类型选择http，填入接口path，选择接口类型并保存。

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1588044814454-0084ef63-2b06-411f-a832-10f483944e94.png)



可以看到，一个接口可以创建多个mock数据来选择。

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1588044831569-aee84011-c970-4670-8247-87e061e2a456.png)

接口的数据可以写死，也可以用mockjs语法写成随机的。

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1588044200823-1a5d264e-ba38-44d3-8a6a-71e96282909f.png)

然后右侧可以看到生成的预览数据

![](https://cdn.nlark.com/yuque/0/2020/png/373268/1588044865581-fb4ede60-d509-435b-b28e-73b00c24d97c.png)

## mockjs语法介绍
可以查看mockjs官网的[示例](http://mockjs.com/examples.html)或是github仓库的[文档](https://github.com/nuysoft/Mock/wiki)。这里简要介绍一下。

以上面的mock数据图为例。可以看到，右边返回的obj是一个数组，对应左边的"obj|1-10": [{}]，这种写法表示返回一个数组，数组内容是右边的对象，数量是一个随机长度，在左边|分割开的1-10之间。而右侧的"@id"和"@string"生成了随机的id和字符串。



常用的随机值有这些：

+ 基础数据类型：@bool, @boolean, [@natural,]() [@integer,]() [@float,]() [@character,]() [@string]()
+ id: [@id](), [@uuid](), [@guid]()
+ 日期：@date, [@time,]() [@datetime,]() [@now]()
+ 文本：[@string]()[@word](), [@cword,]() [@title,]() [@ctitle,]() [@sentence]() , [@csentence,]() [@paragraph]() , [@cparagraph]()
+ 姓名：[@name](), [@cname](),  @first, [@cfirst,]() [@last](), [@clast]()
+ 图片：[@img]()
+ 颜色：[@color]()
+ 地址：@region, [@province](), [@city](), [@county](), [@zip]()
+ 网络：@url, [@domain,]() [@protocol,]() [@tld,]() [@email,]() [@ip]() 



特殊的写法：

+ 数组："obj|1-10": ["@id"]。可以生成随机的数量，左侧|分隔开，右边表示随机的数量。特别的，当左边写死为1时，表示从右边数组随机取一个值，此时返回的不是数组。
+ 数值："count|1-10.1-5": 0。右侧随便写一个数字，左侧|分割开，右边表示数值的范围。如果有小数点，小数点右边表示小数点的位数。

