![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699349698379-5671ba9a-c9f8-434c-8a82-1e0eef70bcf5.png)

[Automa](https://www.automa.site/)是一个chrome扩展，通过拖拽0代码实现工作流，模拟网页的各种点击、表单填写等操作，使用时点击插件脚本一键执行，或者设置定时执行，从而简化我们的工作。



## 功能介绍
官方文档地址：[https://docs.automa.site/](https://docs.automa.site/)。

### 界面
新建一个插件，界面如上图。

+ 左侧面版有一些列组件可供选择
+ 右侧画布区域可以放置组件，再把组件用线连起来。
+ 点击组件，组件上方出现编辑、删除等按钮，点击编辑，左侧弹出组件配置区域。
+ 右上方工具栏，其中table可以创建数据表，globalData可以编辑全局数据
+ 设置里可以选择中文

### 常用组件
插件提供了非常多的组件。有界面相关的，如点击元素、获取元素属性、获取元素文本、悬停元素、按键等等；有逻辑相关的，如条件、判断元素存在、循环等；有浏览器相关的，如激活当前活动标签页、新建标签页、前进、返回、刷新、截屏；等等。

这里介绍几个主要的组件：

#### 触发器
一个脚本以触发器开始，新建脚本默认会有一个触发器。编辑触发器，有编辑触发器和参数两个配置。其中编辑触发器，默认手动，可以换成下图的多种触发方式，可以按时间定时执行，也可以设置快捷键等。

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699350498711-6e8b831f-e2c0-4d0e-bd5b-a84d6fe395a0.png)

可以添加若干参数，当配置了参数时，点击脚本不会立刻执行，而是弹窗填写参数，再点击运行。参数类型主要是input和checkbox，很遗憾没有radio。

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699350608727-b93d1360-a903-425b-a5d2-5b562577f5e9.png)

#### 活动标签页
激活当前活动标签页。我们执行脚本需要有一个承接页面。

#### 新建标签页
新打开一个标签页，可以编辑URL地址。

#### <font style="color:#DF2A3F;">点击元素</font>
用的最多的组件，点击页面某个元素。在编辑界面可以选择元素。

#### <font style="color:#DF2A3F;">表单</font>
用的第二多的组件，选中某个表单元素，输入指定的值。

> 表单和点击元素配合，就是我们绝大部分用到的操作了。
>

#### 延迟
这个组件也经常用到，比如我打开一个页面，要延迟一会再执行操作，否则可能会报错元素不存在，脚本就中断了。再比如我提交了一个表单，要等一会页面刷新再执行后续操作。

#### 悬停元素
有的地方操作是hover触发的，就需要模拟鼠标悬停。

#### 截屏
执行完某一步后，截屏保存下状态，后续可以在电脑的截图文件夹找到。

#### JavaScript代码
可以直接在页面写一段JS代码来执行，可以定制实现一些复杂的步骤。

### 选择器
几个UI组件都有选择器按钮，点击可以在页面看到选择器遮罩，鼠标放到元素上会显示跟控制台一样的元素高亮效果以及元素属性提示。点击会出现在选择器配置中。

选择器包括class和XPath两种模式，一般class就行。

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699351708840-6a1253ea-969f-4331-a3d8-cbea1834bb08.png)

> 有时候组件点了没反应，可以直接点击插件按钮，同样有一个选择器按钮，可以选中元素获取样式，然后复制粘贴到组件配置。如果还是没反应，看看上面的小眼睛是否打开了。
>

### 变量
这里要重点说一下。配置项里除了写死的值，也可以使用变量。Automa有几种变量类型，globalData、variables、table、loopData。

+ loopData后面循环再说；
+ table，类似一个本地的临时数据库，可以在代码中存入数据，最后用导出组件导出数据。暂时没怎么研究。
+ globalData，全局预设一些值，右上角工具栏也有按钮方便修改。我是把脚本的配置项都写到这里，方便调整参数运行。部分配置可以读取globalData，比如打开标签页，url配置可以通过{{globalData.xxx}}拼入变量。但是我在表单输入框这样写不行，variables可以。
+ variables，内存中的变量，可以通过设置变量，后面组件读取变量配置。比如表单文本域输入{{variables.xxx}}。还不行的话，前面加上!!，变成!!{{variables.xxx}}
+ 触发器的参数也是写到variables里。

### 方法
Javascript代码模块中，除了常规的js代码，还支持了几个特定的方法：

#### automaNextBlock(data, insert)
结束当前js代码，继续执行下一个模块。

#### automaRefData(keyword, path?)
可以获取当前的table、variables、globalData、loopData。

```javascript
console.log(automaRefData('globalData'))
console.log(automaRefData('variables'))
console.log(automaRefData('variables', 'xxx'))
console.log(automaRefData('table', '0'))
console.log(automaRefData('loopData', 'loopId'))
```

#### automaSetVariable(name, value)
写入值到variables。

> 前面globalData的数据无法放到表单，我就在最前面放了个Javascript代码模块，读取globalData数据，再写到variables，方便统一在全局写配置。
>
> 还有前面说到触发器的参数没有radio，我想做单选就用checkbox代替了，但是variable得到的是一系列key，我就在前面放了个Javascript代码模块，处理了一下。
>

#### automaFetch(type, resource)
```javascript
automaFetch('json', { url: 'https://api.example.com'}).then((result) => {
	console.log(result);
})

automaFetch('json', {
	url: 'https://api.example.com',
	method: 'POST',
	body: JSON.stringify({
		title: 'Hello world',
	}),
})
```

#### autoResetTimeout()
没用过，重置执行超时时间。



### 循环
循环有循环数据和循环元素两个方式。在表单配置项，还有代码中，可以通过loopData拿到当前循环数据或元素。loopId是循环组件配置的loopId，循环结束也要放一个循环结束组件，也要填相同的loopId。

> 有时候是{{loopData.loopId.data}}，有时候是{{loopData@loopId}}，要注意。
>

#### 循环数据
![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699353398792-c246f036-1e14-4813-9a62-2b859cdcdbc2.png)

循环数据组件可以循环table、variables等，不支持globalData。还可以自定义数据，会弹出一个json输入框，不过还是放在globalData方便管理一些，再通过js写到variables。

#### 循环元素
有时候我们要在页面上动态从一个表格或者列表读取元素，再获取对应数据执行后续操作。此时，可以用循环元素组件，然后选择css，会得到具有相同css的元素列表。后面再选择元素进行操作，就可以在css中用loopData做前缀, 如{{loopData@versions}} .ant-radio-input

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699355561856-83b3e96b-ef3b-43d3-aa5f-db060fb5b16e.png)



---

## Demo实现
下面我们实现一个小程序后台批量加白名单功能。



之前给互动系统的几个小程序批量加域名白名单，每个小程序要加几十个。这里用脚本就可以很轻松实现。![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699356138279-c7388853-3646-442b-a4c1-38a56dc5f291.png)

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699356214676-2bcac3df-75f6-44a0-8922-a76cbe853ca9.png)

如上图，登录后，在开发设置找到服务器域名白名单。添加一次的操作是，点击添加 -> 输入域名 -> 点击确定。然后几十个域名需要重复上述操作。



我们新建一个工作流脚本来实现上述操作。登录并进入配置页面，点击脚本即可。

首先点击全局数据，在json里配一个domain_list, 维护一个域名列表。

然后触发器 -> 活动标签页 -> Javascript代码。这里代码中将globalData.domain_list写入到variables。

```javascript
const domain_list = automaRefData('globalData').domain_list

automaSetVariable('domain_list', domain_list)

console.log(domain_list)
console.log(automaRefData('variables'))

automaNextBlock()
```

刚刚打开标签页，接下来稍作延迟，等待添加域名白名单区域渲染。

接下来是重点，放入循环数据组件，配置选择变量，变量名称domain_list。循环id随便定一个，这里就叫domain吧。再在最后放一个循环断点组件，填入domain。

每次循环我们要执行的操作放在中间。依次是点击元素(添加按钮)、表单(输入域名!!{{loopData.domain.data}})、延迟、点击元素(确定按钮)、延迟。



这样，当我们在当前页面点击执行脚本，脚本就会按照我们在全局变量写的域名列表，依次添加。如果有的域名已经在域名列表，或者配置错误，导致添加失败，界面上没有其他元素展示，上述操作不会影响。

![](https://cdn.nlark.com/yuque/0/2023/png/373268/1699356843630-4b24709d-e2c5-4720-b334-0feae86a8c0b.png)

