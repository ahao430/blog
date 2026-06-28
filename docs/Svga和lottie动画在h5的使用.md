![](https://cdn.nlark.com/yuque/0/2022/gif/373268/1671185609352-c292c19a-69a8-48cf-bfcb-149c1635d832.gif)



需求需要在h5页面中做复杂动效，调研了几种常用的方案，跟UI一起尝试。

## 调研
#### 占用内存对比：
从大到小： 视频＞序列帧＞GIF＞APNG/WEBP＞LOTTIE/SVGA

#### 质量稳定对比：
从差到好： 视频＜GIF＜序列帧＜APNG/WEBP＜LOTTIE/SVGA

#### 支持AE动效对比：
从多到少：视频＞GIF＞序列帧＞APNG/WEBP＞LOTTIE/SVGA

#### 业务方案：
- gif虽然体积小、兼容性好、但效果差、不推荐使用、除非非常在意多端兼容性与性能！

- 简单的动图采用webp、比如简单的聊天表情动图（骰子、石头剪刀布等）

- lottie适合一些复杂的动画、比如复杂的加载动画、引导动画等、不适合做直播间大礼物特效

- 直播间复杂的大礼物动可以用效用svga,webp还有apng

- MP4不建议做直播间礼物动画防范



这里我们的需求是需要较复杂的动效，并且希望可配置，一键替换动效文件，svga和lottie比较符合我们的需求。gif图文件太大，并且不好精细操作；而序列帧也是一样的问题，并且不适合做配置替换。

另外调研阶段发现腾讯出了一款PAG，号称全面支持AE动效，UI也一并做了动效导出。

  
下面是UI做的三种动效文件的效果demo: 

+ SVGA: [https://xiaojinhe-cdn.iyoudui.cn/upload/common/svga/svga.html](https://xiaojinhe-cdn.iyoudui.cn/upload/common/svga/svga.html)
+ PAG: [https://xiaojinhe-cdn.iyoudui.cn/upload/common/2022129/pag.html](https://xiaojinhe-cdn.iyoudui.cn/upload/common/2022129/pag.html)
+ Lottie: [https://xiaojinhe-cdn.iyoudui.cn/upload/common/lottie/lottie.html](https://xiaojinhe-cdn.iyoudui.cn/upload/common/lottie/lottie.html)

发现PAG在h5端加载慢，原因是它除了js包和动画文件以外，还要额外引入一个几M的web assembly的包。感觉PAG更适合app这种本地文件实现。

json原先导出后有一个json文件和一个图片文件夹，部署相较Svga单个文件麻烦些。但是现在lottie支持把图片转成base64，导出成单个json文件了。二者在使用上便捷性差不多。导出的文件lottie会大一些。

对这两种类型都做了配置支持。二者的api均支持精细控制。

## SVGA实现
设计用AE做出效果，通过SVGAConverter插件导出。

引入SVGAPlayer-Web-Lite（[https://github.com/svga/SVGAPlayer-Web-Lite](https://github.com/svga/SVGAPlayer-Web-Lite)）。

然后在页面创建一个canvas对象，设置id。

基本使用如下：

```javascript
import { Parser, Player } from 'svga'

const parser = new Parser()
const svga = await parser.load('xx.svga')

const player = new Player(document.getElementById('canvas'))
await player.mount(svga)

player.onStart = () => console.log('onStart')
player.onResume = () => console.log('onResume')
player.onPause = () => console.log('onPause')
player.onStop = () => console.log('onStop')
player.onProcess = () => console.log('onProcess', player.progress)
player.onEnd = () => console.log('onEnd')

// 开始播放动画
player.start()

// 暂停播放动画
// player.pause()

// 继续播放动画
// player.resume()

// 停止播放动画
// player.stop()

// 清空动画
// player.clear()

// 销毁
// parser.destroy()
// player.destroy()
```

通过配置拿到svga文件的url。先用parser.load载入url，获取文件对象。再用canvas对象初始化player。最后用player挂载svga。

在挂载后打印player对象，可以看到totalFrames可以拿到全部帧数。而在onProcess可以监听到每一帧。这样我们就可以在指定帧操作player。

通过上面demo可以看到，这个娃娃机的动画先是左右晃了几下，然后开始向下抓，然后播放成功动画展示奖品，后面静止不动了，控制台可以看到帧数还在跑，直到最后结束。所以这个动画可以分为几部分：

起始帧（0） ->    抽奖帧   ->    展示帧   ->   结束（totalFrames）

如果我们想要延迟抽奖前的动画，就可以每次执行到抽奖帧再回到起始，把前面的部分循环播放。反过来，如果我们需要点击立即抽奖，可以在点击时跳到抽奖帧。我这里通过三步来实现：

```javascript
            player.pause()
            player.setConfig({
              startFrame: drawFrame,
            })
            player.resume()
```

通过pause方法暂停，通过setConfig方法设置起始帧，最后resume。

初始化的参数可以设置循环次数，但是这个动画本身就设置了循环，导致播放结束又继续播放了，所以我在播放到快结束时，再次执行了pause，并设置起始帧为结束帧，就当做已经播放完了。

## Lottie实现
设计用AE做出效果，通过bodymovin插件导出。

引入lottie-web（[https://github.com/airbnb/lottie-web](https://github.com/airbnb/lottie-web)）。

这里跟svga有区别的是，创建一个指定id的div元素，而不是canvas。

类似的初始化：

```javascript
const player = lottie.loadAnimation({
  container: element, // the dom element
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: animationData, // the animation data
  // ...or if your animation contains repeaters:
  // animationData: cloneDeep(animationData), // e.g. lodash.clonedeep
  rendererSettings: {
    context: canvasContext, // the canvas context, only support "2d" context
    preserveAspectRatio: 'xMinYMin slice', // Supports the same options as the svg element's preserveAspectRatio property
    clearCanvas: false,
    progressiveLoad: false, // Boolean, only svg renderer, loads dom elements when needed. Might speed up initialization for large number of elements.
    hideOnTransparent: true, //Boolean, only svg renderer, hides elements when opacity reaches 0 (defaults to true)
    className: 'some-css-class-name',
    id: 'some-id',
  }
});

player.addEventListener('DOMLoaded', () => {
	console.log('DOMLoaded: ')
	// 挂载成功，可以开始获取帧数和渲染
});
player.addEventListener('complete', () => {
  console.log('complete')
}）
player.addEventListener('enterFrame', () => {
  console.log('enterFrame')
}）
```

这里可以像svga一样，先通过url请求对象，再初始化，通过animationData传入。也可以直接用path参数传入url。

对player监听事件，类似svga的on方法。

要实现同样的效果，首先监听enterFrame打印帧数，发现打印的不是整数，类似浏览器监听滚动，不太好跟设定的帧数进行比对。

发现除了play方法，还有playSegments方法，可以播放指定帧数区间，并且播放完成后监听到了complete。故而用这个方法来实现逻辑。一段一段的去播放，每一段结束去播放下一段。点击事件时也去执行第二段。

```javascript
      this.player.playSegments(
        [this.startFrame, this.drawFrame]
      , true)
      // baseFn.loadingHide()
      this.step = 1
      this.container.addEventListener('click', this.onLottieClick)

      // 动画播放完成触发
      this.player.addEventListener('complete', () => {
        console.log('complete: ', this.step)
        if (this.step === 1) {
          this.player.playSegments(
            [this.drawFrame, this.formFrame]
          , true)
          this.step = 2
        } else if (this.step === 2) {
          this.$emit('end')
          this.player.playSegments(
            [this.formFrame, this.endFrame]
          , true)
          this.step = 3
        }
      });
```

感觉lottie的api更好用一些。

## 注意事项
#### 挂载
在挂载完成前获取相关属性值或执行相关api会报错。

#### 跨域
可以看到通过url获取了svga文件或lottie的json文件，这里实际上是发起了一个get请求。所以当我们在后台上传配置文件时要注意跨域问题。

尝试用jsonp来规避这个问题，发现现在chrome浏览器已经默认禁止jsonp。

#### 加载体验
从获取配置，到发起get请求文件下载，到完成渲染，这个时间动画是不可见的，屏幕会展示背景色如白屏等。为了解决这个用户体验，可以先放一个跟动画起始一模一样的图片，这样从图片过渡到动画，用户体验会好很多。

