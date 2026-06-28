## 实现原理
### 雪碧图（sprite）
<font style="color:rgb(77, 77, 77);">雪碧图也</font>叫精灵图， 是一种CSS<font style="color:rgb(77, 77, 77);">图像合成技术。通俗来说：将小图标合并在一起之后的图片称作雪碧图，每个小图标的使用配合background-position来获取。</font>

<font style="color:rgb(77, 77, 77);">雪碧图的作用有两个：</font>

1. 减少图片资源的请求数，提升页面加载速度
2. 制作序列帧动画

这里我们要用第二种方式。假如我们有如下的一系列图片：

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1732535719730-b51d246d-ec40-44f4-95fd-49e848829bea.png)

现在我们将它合到一张图片中。这时我们可以用ps一张一张拼，也可以用工具直接生成，如textpacker。

> [https://www.codeandweb.com/texturepacker](https://www.codeandweb.com/texturepacker)
>

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1732535822796-f9aff2c8-5206-4393-84b6-a6f819759067.png)

如下，我们可以拼成一个几行几列的图，或者都放在一行。

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1732536162285-70941664-cb69-4e2b-b03e-8967fc533f36.png)

### ![](https://cdn.nlark.com/yuque/0/2024/png/373268/1732536263783-9ce52e6c-a655-443d-b96e-e41d3c05eece.png)
### css实现序列帧动画
我们都用过css的transition和animation实现动画。这里我们要像幻灯片一样，在每一帧停顿一下，再切换到下一帧。

这里要用到animation的一个属性steps。

<font style="color:rgb(221, 17, 68);background-color:rgb(248, 248, 248);">animation</font>的工作原理是通过将元素的CSS样式从一个状态改变为另一个状态（我们称为线性变化）。默认情况下，它以`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">ease</font>`方式（速度逐渐放慢）过渡，它会在每个关键帧之间插入补间动画，所以动画效果是连贯性的，但有些时候，我们不需要这种过渡效果，而是想实现跳跃式的效果，这时，`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">steps()</font>`函数就出现了。

<font style="color:rgb(221, 17, 68);background-color:rgb(248, 248, 248);">steps()</font>是一个阶跃函数，用于把整个操作领域切分为相同大小的间隔，每个间隔都是相等的。

语法：

```plain
steps(number[, end | start])
```

参数说明：

+ `<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">number</font>`参数指定了时间函数中的间隔数量（必须是正整数）
+ 第二个参数是可选的，可设值：`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">start</font>`和`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">end</font>`，表示在每个间隔的起点或是终点发生阶跃变化，如果忽略，默认是end。

注意：第二个参数还有两个内置值，`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">step-start</font>`等同于`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">steps(1,start)</font>`，动画分成1步，动画执行时以左侧端点为开始；`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">step-end</font>`等同于`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">steps(1,end)</font>`：动画分成1步，动画执行时以结尾端点为开始。

![](https://cdn.nlark.com/yuque/0/2024/png/373268/1732777399278-8cf84501-2d20-475d-8ca0-3b2fbd3d015f.png)

对于单行拼接的雪碧图（假设有n张图拼接，即帧数为n），我们将起始的x设为0，结束的x设为100%，中间经过的间隔应该是n-1，即steps(n-1, start)。

## css单行实现
单张图片600px * 647px，共21张，拼在一起12600px * 647px。注意这里background-size要写完整大小。

此时动画就一个区间，然后steps分成20步。

```less
.duck{
  width: 600px;
  height: 647px;
  background: url('https://xiaojinhe-cdn.iyoudui.cn/assets/run-duck/duck-1-row.png') no-repeat left center / 12600px 647px;
  background-position: 0 0;
  animation: duck-1-row infinite 1s steps(20,start);
}
@keyframes duck-1-row{
  0%{background-position: 0 0;}
  100%{background-position: 100% 0;}
}

```

codepen预览: [https://codepen.io/ahao430/pen/xbKwEdv](https://codepen.io/ahao430/pen/xbKwEdv)

## css多行实现
此时动画要分为N个区间，每个区间一步。

### less
less不支持for循环，但是可以通过while循环来模拟。

```less

@duck_width: 600px;
@duck_height: 647px;

// 多行的
.duck-rows{
  width: @duck_width;
  height: @duck_height;
  background: url('https://xiaojinhe-cdn.iyoudui.cn/assets/run-duck/duck-rows.png') no-repeat left top / @duck_width * 3 @duck_width * 7;
  background-position: 0 0;
  animation: duck-rows infinite 1s steps(1, start);
}

// @row_count每行几个，@count第几个，@total总共几个
.duck_rows_step(@row_count, @count, @total) when (@count <= @total) {
  @percent: (@count - 1) / (@total - 1) * 100%;
  @cur_row: ceil(@count / @row_count) - 1;
  @cur_col: mod(@count - 1, @row_count);
  @row: ceil(@total / @row_count);
  @col: @row_count;
  @x: (@cur_col ) / (@col - 1)  * 100%;
  @y: (@cur_row ) / (@row - 1)  * 100%;
  @{percent} {
    background-position: @x @y;
    // count: @count;
    // positon: @cur_row+1 @cur_col+1;
  }
  .duck_rows_step(@row_count, @count + 1, @total);
}
@keyframes duck-rows{
  .duck_rows_step(3, 1, 21);
}
```

codepen预览： [https://codepen.io/ahao430/pen/zxOvKdQ](https://codepen.io/ahao430/pen/zxOvKdQ)

> 在线less转css工具：[https://www.lesstester.com/](https://www.lesstester.com/)
>

转换出来的css如下：

```less
.duck-rows {
  width: 600px;
  height: 647px;
  background: url('https://xiaojinhe-cdn.iyoudui.cn/assets/run-duck/duck-rows.png') no-repeat left top / 1800px 4200px;
  background-position: 0 0;
  animation: duck-rows infinite 1s steps(1, start);
}
@keyframes duck-rows {
  0% {
    background-position: 0% 0%;
  }
  5% {
    background-position: 50% 0%;
  }
  10% {
    background-position: 100% 0%;
  }
  15% {
    background-position: 0% 16.66666667%;
  }
  20% {
    background-position: 50% 16.66666667%;
  }
  25% {
    background-position: 100% 16.66666667%;
  }
  30% {
    background-position: 0% 33.33333333%;
  }
  35% {
    background-position: 50% 33.33333333%;
  }
  40% {
    background-position: 100% 33.33333333%;
  }
  45% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 50% 50%;
  }
  55% {
    background-position: 100% 50%;
  }
  60% {
    background-position: 0% 66.66666667%;
  }
  65% {
    background-position: 50% 66.66666667%;
  }
  70% {
    background-position: 100% 66.66666667%;
  }
  75% {
    background-position: 0% 83.33333333%;
  }
  80% {
    background-position: 50% 83.33333333%;
  }
  85% {
    background-position: 100% 83.33333333%;
  }
  90% {
    background-position: 0% 100%;
  }
  95% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 100% 100%;
  }
}

```

### scss
scss支持for循环，实现起来更简单

```less
@use "sass:math";
$duck_width: 600px;
$duck_height: 647px;

// 多行的
.duck-rows{
  width: $duck_width;
  height: $duck_height;
  background: url('https://xiaojinhe-cdn.iyoudui.cn/assets/run-duck/duck-rows.png') no-repeat left top #{'/'} $duck_width * 3 $duck_width * 7;
  background-position: 0 0;
  animation: duck-rows infinite 1s steps(1, start);
}

@function generate-step($i, $total, $row_count) {
     $percent: ($i - 1) / ($total - 1) * 100%;
    $cur_row: math.ceil($i / $row_count) - 1;
    $cur_col: ($i - 1) % $row_count;
    $row: math.ceil($total / $row_count);
    $col: $row_count;
    $x: ($cur_col) / ($col - 1) * 100%;
    $y: ($cur_row) / ($row - 1) * 100%;
  @return ($percent,$x,$y);
}

@keyframes duck-rows{
  $row_count: 3;
  $total: 21;
  @for $i from 1 through 21 {
    $result: generate-step($i, $total, $row_count);
    #{nth($result, 1)} {
      background-position: nth($result, 2) nth($result, 3);
    }
  }
}
```

codepen预览： [https://codepen.io/ahao430/pen/XJrmjaQ](https://codepen.io/ahao430/pen/XJrmjaQ)

转换出来的css同上。

## gif vs 序列帧
我们知道，当我们有一系列图片，直接生成一个gif做动图更简单。那么为什么要用序列帧呢？

| | 优点 | 缺点 |
| --- | --- | --- |
| gif | 兼容性好，播放简单，可以多平台支持。 | 1. GIF格式仅支持 8 位，也就是256种不同的颜色会有色彩失真，所以效果差<br/>2. 动画文件大，播放资源内存、CPU占用高。 |
| 序列帧 | 1. 制作方便简单，还原度高，颜色偏差损失基本没有(PNG图片压缩可能会有颜色偏差)。<br/>2. 可以通过代码控制动画的播放、停止、循环、播放速度等。 | 需要加载全部图片，文件占用内存大，内存一大就容易造成打开页面的时候卡顿，大的文件用户体验感很差 |


跟GIF相比，序列帧不会产生边缘锯齿的效果，也比GIF支持的色彩范围大。当对效果要求高时，序列帧比gif更加合适。

## 问题处理
### 兼容性（白屏）
当拼接成一行时，texturepacker会提示这个警告。上网查了一些帖子提到一些设备对超过4k的图片展示空白，但是帖子的时间比较早，暂时未测试到这个问题。

### 兼容性（抖动）
![](https://cdn.nlark.com/yuque/0/2024/png/373268/1733280026843-0f15bf15-2667-48da-b1fa-51c1475bce11.png)

在小程序中发生了抖动，因为小程序的单位是rpx，换算成px会有小数，雪碧图移动背景图位置的时候，就可能向左或向右取整。这里的解决办法是使用真实的px，再根据设备宽度进行缩放。

兼容代码如下：

```html
<view class="duck-scale-container">
  <view class="duck-scale-container-inner" style="transform: translate(-50%, -50%) scale({{scale}});">
    <view class="duck"></view>	
  </view>
</view>
```

```javascript
const scale = app.globalData.systemInfo.windowWidth / 750
```

```less
@duck_width: 457px;
@duck_height: 457px;

.duck-scale-container{
  width: 457rpx;
  height: 457rpx;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}
.duck-scale-container-inner{
  position: absolute;
  left: 50%;
  top: 50%;
}
```

注意，原先鸭子及雪碧图动画background-position等，单位都换成px。外层加容器，单位rpx。然后内层容器定位，通过scale缩放。

### 切换空白问题
需求中一个小鸭子的形象。有几套雪碧图进行切换。雪碧图比较大，切换过程中第一次加载图片等待会造成白屏。

处理办法是提前加载图片，并准备一张静态背景图。

```html
<view class="duck duck-1-row duck-a" onTap="handleClickDuck" a:if="{{action === 'a'}}"></view>
<view class="duck duck-1-row duck-b" onTap="handleClickDuck" a:elif="{{action === 'b'}}"></view>
<view class="duck duck-1-row duck-c" onTap="handleClickDuck" a:elif="{{action === 'c'}}"></view>
<view class="duck duck-1-row duck-d" onTap="handleClickDuck" a:elif="{{action === 'd'}}"></view>
<view class="duck duck-1-row" onTap="handleClickDuck" a:else></view>

<!-- 图片预加载 -->
<view style="visibility: hidden; width: 0; height: 0; overflow: hidden;">
  <view class="duck duck-1-row duck-a"></view>
  <view class="duck duck-1-row duck-b"></view>
  <view class="duck duck-1-row duck-c"></view>
  <view class="duck duck-1-row duck-d"></view>
</view>
<!-- 图片预加载 end -->
```



