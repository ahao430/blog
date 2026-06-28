之前写了一篇关于SVGA和Lottie动画使用的，现在有一个新的需求，要实现一个效果比较炫的引导动画，想用SVGA实现，但是要求里面的一些数字是动态可配的。查了下SVGA支持替换图层，跟UI配合调研成功替换，用了两种SVGA库来实现。



UI准备：

UI在出图的时候，对图层做好命名，导出SVGA后，告诉开发可配置图层的名称。

PS: 在[这里](https://svga.io/svga-preview.html)预览SVGA文件，也可以查看所有图层的key。



联调过程：

引入svga，根据图层的key动态替换元素，再播放动画。

这里我先用的svgaplayer-web-lite去做，因为之前的svga动画也是用的这个库。但是当时跟UI还在调研，以为新建的图层要用文本框，出了一个有问题的svga文件，用这个库报错，换成svgaplayer-web就可以正常渲染。另外网上看的替换svga图层的教程都是用的svgaplayer-web，就先用这个实现了。

后来发现不用文本框，普通图层就行，又用lite实现了一下，相比较起来，lite更轻量，性能更好。



参考文章：[https://blog.csdn.net/weixin_44309374/article/details/106995401](https://blog.csdn.net/weixin_44309374/article/details/106995401)



## SVGAPlayer-web实现
文档：[链接](about:blank)

API：支持两个替换方法，可以替换为图片或文字。（开始也是被这个误导了，以为替换文字要插入文本框类型，后来发现就是普通图层，既可以替换文字也可以替换图片。）

```javascript
// 替换为图片
player.setImage('http://yourserver.com/xxx.png', 'ImageKey');
// 替换为文字
player.setText('Hello, World!', 'ImageKey');
// 替换为带样式的文字，传入详细对象
player.setText({ 
    text: 'Hello, World!, 
    family: 'Arial',
    size: "24px", 
    color: "#ffe0a4",
    offset: {x: 0.0, y: 0.0}
}, 'ImageKey'); // 可自定义文本样式
```

大概实现如下：

```javascript
import SVGA from 'svgaplayerweb';

// 初始化动画
this.canvas = document.getElementById('canvas')
this.player = new SVGA.Player(this.canvas);
this.parser = new SVGA.Parser(this.canvas); // 如果你需要支持 IE6+，那么必须把同样的选择器传给 Parser。
this.player.loops = 1
this.player.clearsAfterStop = false
this.player.setClipsToBounds(true)

// 加载动画
this.parser.load(svgaUrl, (videoItem) => {
  console.log(`svga${index}加载完成`)
  this.svga1 = videoItem
  this.startAnim1()
})

// 播放动画
async startAnim1 () {
  console.log(`播放svga1`)
  this.player.setVideoItem(this.svga1);
  this.player.setText({
    text: '150',
    family: 'Arial',
    size: "24px", 
    color: "#000",
    offset: {x: 0.0, y: 0.0}
  }, 'jineshuru');
  this.player.loops = 1
  this.player.onFrame(frame => {
    // console.log(frame)
  })
  // this.player.startAnimation();
  // total: 79
  this.player.startAnimationWithRange({location: 0, length: 30})
  this.player.loops = 0
  this.player.startAnimationWithRange({location: 30, length: 30})
  this.canvas.onclick = () => {
    console.log(`svga1点击`)
    this.canvas.onclick = void 0
    this.onAnim1Click()
  }
},
onAnim1Click () {
  this.player.loops = 1
  this.player.startAnimationWithRange({location: 60, length: 20})

  this.player.onFinished(() => {
    console.log(`svga1结束`)
    this.canSvg2Play = true
    this.player.onFrame(void 0)
    this.player.onFinished(void 0)
    this.startAnim2()
  })
},
```

通过player.setText替换图层为指定文案。

再通过修改player.loops，然后player.startAnimationWithRange控制播放动画区间。

动画1我们先播放入场部分，然后循环播放后面的部分，等待用户点击，再播放动画2。这里的几段动画公用的一个canvas和player，不停的调整属性和播放的帧数区间。

## SVGAPlayer-web-lite实现
文档：[链接](https://github.com/svga/SVGAPlayer-Web-Lite)

API:  支持两个替换方法，替换元素和替换动态元素。

```javascript
// 替换元素
const image = new Image()
image.src = 'https://xxx.com/xxx.png'
svga.replaceElements['key'] = image

// 动态元素
const text = 'hello gg'
const fontCanvas = document.getElementById('font')
const fontContext = fontCanvas.getContext('2d')
fontCanvas.height = 30
fontContext.font = '30px Arial'
fontContext.textAlign = 'center'
fontContext.textBaseline = 'middle'
fontContext.fillStyle = '#000'
fontContext.fillText(text, fontCanvas.clientWidth / 2, fontCanvas.clientHeight / 2)
svga.dynamicElements['key'] = fontCanvas

await player.mount(svga)

```

这里我们暂时用到的就是替换元素。可以看到不管是替代元素还是替换动态元素，都可以替换为图片或者canvas。这个canvas中我们可以自己写入text，相对于SVGAPlayer-web，插入文字要麻烦一些，但是自由度更高。

实现如下：

```javascript
export const createTextCanvas = ({
  text = 'text',
  size = 120,
  color = '#000',
  weight = 'bold',
  fontFamily = 'noto', // arial, serif
  x = 0,
  y = 0,
  maxWidth,
}) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${fontFamily}`
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth)
  } else {
    ctx.fillText(text, x, y)
  }
  return canvas
}
```

```javascript
import { Parser, Player, DB } from 'svga'
import { createTextCanvas } from './util'

// 初始化动画
this.canvas = document.getElementById('canvas')
this.player = new Player({
  container: this.canvas,
  loop: 1,
  playMode: 'forwards',
  fillMode: 'forwards',
})
this.db = new DB()

// 加载动画
let svga = await this.db.find(svgaUrl)
if (!svga) {
  // Parser 需要配置取消使用 ImageBitmap 特性，ImageBitmap 数据无法直接存储到 DB 内
  const parser = new Parser({ isDisableImageBitmapShim: true })
  svga = await parser.load(svgaUrl)
  await this.db.insert(svgaUrl, svga)
}
this.svga1 = svga
this.startAnim1()

// 播放动画
async startAnim1() {
  console.log(`播放svga1`)
  this.svga1.replaceElements['key1'] = createTextCanvas({
    text: this.num1 + '元',
    size: 100,
    color: '#FFFEC0',
    x: 150,
    y: 70,
  })

  await this.player.mount(this.svga1)

  // const total = this.player.totalFrames
  this.player.onProcess = () => {
    console.log(this.player.currentFrame)
    switch (this.player.currentFrame) {
      case this.anim1BtnFrame:
        this.canvas.onclick = () => {
          console.log(`svga1点击`)
          this.canvas.onclick = void 0
          this.$emit('step1Click')
          this.onAnim1Click()
        }
        break
    }
  }
  this.player.setConfig({
    startFrame: 0,
    loopStartFrame: this.anim1LoopFrame,
    // endFrame: 60,
    // loop: 0,
  })
  this.player.start()
},
onAnim1Click() {
  this.canSvg2Play = true
  this.player.onProcess = void 0
  this.player.onEnd = void 0
  this.player.pause()
  this.startAnim2()
  // }
},
```



