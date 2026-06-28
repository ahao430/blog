## 主题切换
平时我们开发时，颜色一般写在css里，用less或者sass预处理器的话，还有变量和函数功能，可以设置一个主题色，再利用lighten函数和darken函数得到一系列设置，非常方便不同的主题处理。

### SCSS切换主题
预处理器是在编译阶段执行，我们如果想要动态切换主题的话，需要编译生成多套主题css文件，然后动态加载覆盖，实现起来比较麻烦。之前我们一般用[webpack-theme-color-replacer](about:blank)这个包来做。

但是这样只能实现预设编译好的主题直接互相切换，如果要添加新的颜色，就要先重新编译一套主题css文件。

### CSS变量切换主题
后来css有了原生的变量，我们也可以通过js去修改css变量来实现这一功能。

> [element-plus主题设置，scss变量方式和css变量方式](https://element-plus.org/zh-CN/guide/theming.html#%E9%80%9A%E8%BF%87-scss-%E5%8F%98%E9%87%8F)
>

element-plus因为用css变量实现了主题设置，切换主题只需要动态设置css变量即可。

```javascript
document.documentElement.style.setProperty('--primary-color', 'red');
document.documentElement.style.setProperty('--text-color', '#000000');
...
```



## css变量介绍
> [https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
>

可以在根元素或者制定元素定义css变量。也可以在dom中通过style绑定。

```javascript
:root {
  --main-bg-color: brown;
}
element {
  --main-bg-color: brown;
}
```

也可以通过js设置

```javascript
// 获取一个 Dom 节点上的 CSS 变量
element.style.getPropertyValue("--my-var");

// 获取任意 Dom 节点上的 CSS 变量
getComputedStyle(element).getPropertyValue("--my-var");

// 修改一个 Dom 节点上的 CSS 变量
element.style.setProperty("--my-var", jsVar + 4);

// 根元素设置
document.documentElement.style.setProperty("--my-var", jsVar + 4);
```



然后通过var使用。var可以接收第二个参数作为默认值。

```javascript
element {
  background-color: var(--main-bg-color);
}
```



## js实现颜色计算
### rgb，rgba, hex, hexa介绍
我们知道红绿蓝是光学三原色，所有颜色可以用这三种颜色混合得到。

+ rgb: rgb(r,g,b)  rgb是分别用0-255数字表示这三种颜色的值，如rgb(0,0,0)是黑色，rgba(255,255,255)是白色。
+ hex: #RRGGBB  hex是同样的，只是把数字变成了16进制，#000000是黑色，#FFFFFF是白色。可简写。
+ rgba: rgba(r,g,b,a)  a是alpha，表示不透明度。rgba中这个值是0-1，0表示完全透明，1表示完全不透明。
+ hexa: #RRGGBBAA  a是alpha，表示不透明度。hexa中a的取值范围还是00到FF，00表示完全透明，1表示完全不透明。可简写。IE浏览器不支持HEXA。

### rgb和hex、rgba和hexa转换计算
#### rgb转hex
10进制转16进制

```javascript

function rgbToHex(rgb) {
  const hex = rgb.split('(')[1].split(')')[0].split(', ') // 将RGB字符串切割成数组
    .map(value => Number(value).toString(16).padStart(2, '0')) // 将每个RGB值转换成16进制字符串，并在不满两位的字符串前补0
    .join(''); // 拼接每个RGB值对应的16进制字符串
  return `#${hex.toUpperCase()}`; // 返回完整的HEX颜色代码（需将字母转换为大写）
}
```

#### hex转rgb
16进制转10进制

```javascript

function hexToRgb(hex) {
    // 移除十六进制颜色代码中的'#'
    let sanitizedHex = hex.replace("#", "");
 
    // 解析红、绿、蓝值
    let r = parseInt(sanitizedHex.substring(0, 2), 16);
    let g = parseInt(sanitizedHex.substring(2, 4), 16);
    let b = parseInt(sanitizedHex.substring(4, 6), 16);
 
    return `rgb(${r}, ${g}, ${b})`;
}
```

#### rgba转hexa
多一个alpha，这里rgba是0~1，要乘以255，再转16进制

```javascript

function rgbaToHexa(rgba) {
  // 将RGBA字符串转换为数组
  let arr = rgba.split("(")[1].split(")")[0].split(",");
  // 提取RGBA值
  let r = parseInt(arr[0]).toString(16);
  let g = parseInt(arr[1]).toString(16);
  let b = parseInt(arr[2]).toString(16);
  let a = Math.round(parseFloat(arr[3]) * 255).toString(16);
  // 如果alpha值为一位数，前面补0
  r = r.length === 2 ? r : "0" + r;
  g = g.length === 2 ? g : "0" + g;
  b = b.length === 2 ? b : "0" + b;
  a = a.length === 2 ? a : "0" + a;
  // 合并为HEXA颜色
  return "#" + r + g + b + a;
}
```

#### hexa转rgba
```javascript
function hexToRgb(hex) {
    // 移除十六进制颜色代码中的'#'
    let sanitizedHex = hex.replace("#", "");
 
    // 解析红、绿、蓝值
    let r = parseInt(sanitizedHex.substring(0, 2), 16);
    let g = parseInt(sanitizedHex.substring(2, 4), 16);
    let b = parseInt(sanitizedHex.substring(4, 6), 16);
    let a = parseInt(sanitizedHex.substring(6, 8), 16) / 255;
 
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
```



### lighten和darken实现
#### 网上的实现，有问题
网上搜了一段代码实现如下：

```javascript
function LightenDarkenColor(col, amt) {
  var usePound = false;

  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }

  var num = parseInt(col,16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}
```

可以看到，前面用位运算快速把HEX解析成0~255的r、g、b的值，然后加减数值来实现lighten或者darken，当超过0或255时写死。这跟我们期望的按照百分比来实现lighten或者darken有些偏差。并且测试这个代码当amt传入-255时，返回了#0，数字位数也不对。



考虑自己用百分比实现一下，看了下color.js的代码，有这样一行注释

```plain
color.lighten(0.5);					// hsl(100, 50%, 50%) → hsl(100, 50%, 75%)
color.darken(0.5);					// hsl(100, 50%, 50%) → hsl(100, 50%, 25%)
```

可以看到用hsl来计算就很直观了。



#### HSL介绍
<font style="color:rgb(51, 51, 51);">HSL即色相、饱和度、亮度（英语：Hue, Saturation, Lightness）。色相（H）是色彩的基本属性，就是平常所说的颜色名称，如红色、黄色等。饱和度（S）是指色彩的纯度，越高色彩越纯，低则逐渐变灰，取0-100%的数值。明度（V），亮度（L），取0-100%。</font>

转换公式：

_<font style="color:rgb(34, 34, 34);">将 R</font>_<font style="color:rgb(34, 34, 34);">，</font>_<font style="color:rgb(34, 34, 34);">G</font>_<font style="color:rgb(34, 34, 34);">，</font>_<font style="color:rgb(34, 34, 34);">B</font>_<font style="color:rgb(34, 34, 34);"> 值除以 255 以将范围从 0..255 更改为 0..1：</font>

_<font style="color:rgb(33, 37, 41);">R</font>_<font style="color:rgb(33, 37, 41);">' = </font>_<font style="color:rgb(33, 37, 41);">R</font>_<font style="color:rgb(33, 37, 41);">/255</font>

_<font style="color:rgb(33, 37, 41);">G</font>_<font style="color:rgb(33, 37, 41);">' = </font>_<font style="color:rgb(33, 37, 41);">G</font>_<font style="color:rgb(33, 37, 41);">/255</font>

_<font style="color:rgb(33, 37, 41);">B</font>_<font style="color:rgb(33, 37, 41);">' = </font>_<font style="color:rgb(33, 37, 41);">B</font>_<font style="color:rgb(33, 37, 41);">/255</font>

<font style="color:rgb(33, 37, 41);">Cmax = max（</font><font style="color:rgb(33, 37, 41);">R'， </font><font style="color:rgb(33, 37, 41);">G'， </font><font style="color:rgb(33, 37, 41);">B</font><font style="color:rgb(33, 37, 41);">')</font>

<font style="color:rgb(33, 37, 41);">Cmin = min（</font><font style="color:rgb(33, 37, 41);">R'， </font><font style="color:rgb(33, 37, 41);">G'， </font><font style="color:rgb(33, 37, 41);">B</font><font style="color:rgb(33, 37, 41);">')</font>

<font style="color:rgb(33, 37, 41);">Δ = </font>_<font style="color:rgb(33, 37, 41);">Cmax</font>_<font style="color:rgb(33, 37, 41);"> - </font>_<font style="color:rgb(33, 37, 41);">CMIN</font>_

<font style="color:rgb(34, 34, 34);"></font>

<font style="color:rgb(34, 34, 34);">色相计算：</font>

![](https://cdn.nlark.com/yuque/0/2024/gif/373268/1715242231779-325fd6c9-62ce-4df1-8e1f-0393ee33519b.gif)

<font style="color:rgb(34, 34, 34);"></font>

<font style="color:rgb(34, 34, 34);">饱和度计算：</font>

![](https://cdn.nlark.com/yuque/0/2024/gif/373268/1715242231766-a70e86c6-cec8-42ee-97b9-160a5f52fc47.gif)

<font style="color:rgb(34, 34, 34);"></font>

<font style="color:rgb(34, 34, 34);">亮度计算：</font>

_<font style="color:rgb(33, 37, 41);">L</font>_<font style="color:rgb(33, 37, 41);"> = （</font>_<font style="color:rgb(33, 37, 41);">Cmax + Cmin</font>_<font style="color:rgb(33, 37, 41);">） / 2</font>



#### HSL和RGB转换
查询互转代码

```javascript
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
 
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
 
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  let r, g, b;
 
  function hue2Rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
 
  let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  let p = 2 * l - q;
  r = hue2Rgb(p, q, h + 1/3);
  g = hue2Rgb(p, q, h);
  b = hue2Rgb(p, q, h - 1/3);
 
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
```

#### <font style="color:rgb(33, 37, 41);">用HSL实现</font>
那么我们可以考虑将rgb或者hex转化为HSL，然后计算lighten或者darken后的值，再转换为rgb或者hex。

```javascript
function parseRGB(color) {
  return color.split('(')[1].split(')')[0].split(', ') // 将RGB字符串切割成数组
    .map(value => Number(value))
}
function lighten(color, ratio) {
  const [r,g,b] = parseRGB(color)
  let [h,s,l] = rgbToHsl(r,g,b)
  l += l * ratio // 亮度增加
  if (l > 1) l = 1
  const [newR, newG, newB] = hslToRgb(h,s,l)
  return `rgb(${newR},${newG},${newB})`
}
function darken(color, ratio) {
  const [r,g,b] = parseRGB(color)
  let [h,s,l] = rgbToHsl(r,g,b)
  l -= l * ratio // 亮度减少
  if (l < 0) l = 0
  const [newR, newG, newB] = hslToRgb(h,s,l)
  return `rgb(${newR},${newG},${newB})`
}
```



### 第三方库color.js
color.js的库，实现了各种颜色的转换和计算，可以直接使用。

> [https://github.com/color-js/color.js](https://github.com/color-js/color.js)
>



## 小程序中使用
活动需求，希望一些颜色可配置，在小程序中读取配置后动态设置颜色。

#### 标题栏背景色转换
小程序的标题栏背景色可以设置HEX颜色，但是不支持HEXA。我们活动配置页面取色器保存的rgba格式，如果忽略a，可以把前面转成HEX。但是如果要模拟一个接近rgba的颜色呢？考虑这里用lighten函数来模拟。

```javascript
function rgba2Hex(rgba) {
  // 解析r,g,b,a的值
  // 用lighten模拟alpha效果
  const newColor = lighten(`rgb(${r},${g},${b})`, 1 - a)
  const hex = rgbToHex(newColor)
  return hex
}
```



#### 动态使用css变量
抽奖活动的转圈动效，是用伪元素的遮罩颜色实现的。小程序的axml模板中，可以直接用style标签动态绑定color和background-color。但是伪元素要怎么实现动态绑定颜色呢？

小程序中没有window和document对象，所以不能用js设置:root的css变量。

尝试在小程序的页面最外层元素的style标签直接写css变量，再在组件的css中使用，发现可行。

```javascript
<view class="page" style="--draw-cell-mask: {{hxConfig.drawCellMask}};">
  ...
```

```javascript
.cell{
    &::after{
      background-color: var(--draw-cell-mask, rgba(0,0,0,0.3));
    }
}
```

