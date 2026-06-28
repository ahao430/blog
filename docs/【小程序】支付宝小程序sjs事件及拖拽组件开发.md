**背景：**之前做小程序浮标时尝试做过拖拽效果，但是跟自带原生客服、调试等组件的体验相差甚远。发现sjs文档中有事件响应，尝试用sjs事件开发拖拽组件，真机效果完美（模拟器还是有穿透效果）。



# js开发拖拽组件
      之前用js开发拖拽组件，实际上是在组件的data中设置位置数据，监听onTouchStart、onTouchMove、onTouchEnd事件，实时修改data中的数据，触发axml中的相关渲染。

      在js的touch事件中，我们可以获得事件对应的touches坐标，以及元素本身。在touchstart获得初始touch点坐标并记录，在touchmove中获得当前touch点的坐标，计算与初始位置的偏差，就得到了移动的距离。通过这个距离，我们可以更新组件的定位信息，或者给组件设置transform。

       但是要注意，下一次拖拽的时候，组件的初始定位或者transform已经发生了变化。因此，需要记录上一次的改动，或者初始时重新获取。

      js实现拖拽主要存在几个问题：

    - 滑动会穿透到页面，拖拽浮标的时候，页面也会跟着动。给容器加catchtoumove还是不行。
    - 计算问题，data绑定位置信息，因为滚动穿透，页面跟着一起动，导致计算值有偏差
    - 性能问题，频繁改动data

# sjs事件文档
官方文档：[https://opendocs.alipay.com/mini/01og7z](https://opendocs.alipay.com/mini/01og7z)

可以看到这两点优势：

1. 跳过data，直接操作样式，解决性能问题
2. touch事件可以阻止默认行为和向上冒泡，这同时解决了性能和计算偏差问题

示例代码如下：

```html
<import-sjs from="./index.sjs" name="sjs"></import-sjs>
<view
  data-foo="{{foo}}"
  change:data-foo="{{sjs.handlePropChange}}"
  onTouchStart="{{sjs.handleEvent}}"
></view>
```

```javascript
// index.sjs

function handleEvent(event, ownerComponent) {
  // currentTarget 的 Descriptor 描述对象
  event.instance.setStyle({
    'font-size': '28rpx'
  });
  // 不往上冒泡，相当于调用了同时调用了
  // event.stopPropagation() 和
  // event.preventDefault()
  return false;
}

function handlePropChange(newValue, oldValue, ownerComponent, instance) {
  // ...
}

export default {
  handleEvent,
  handlePropChange
};
```

      可以看到，既可以监听touch事件，也可以监听绑定的值变化事件。这里我们用到touch，接收两个参数event和ownerComponent。前者跟js中的event差不多，额外提供了几个属性，其中event.instance属性我们会用到，等同于event.creeantTarget, instance提供了很多方法，我们可以修改当前的样式，可以获取当前的计算样式，获取dataset；后者是当前代码所在的组件或页面，ownerComponent.callMethod可以执行所在组件或页面的方法。

      还有很重要的一点，event.instance执行setStyle时，直接修改渲染层，是优先于css或行内样式的。我们原先定位用的是left还是right，top还是bottom都不影响。



# 用sjs开发拖拽组件
      开发过程中，遇到两个重要的问题：

      1. 怎么console.log

      sjs文档说是支持console.log，一般的方法里打印好像可以，但是在sjs事件中打印没有输出，至少是在模拟器没有输出。但是通过ownerComponent.callMethod，我们可以间接在组件或者页面打印，写一个log方法即可。

      2. 怎么获取上一次的样式并用到下一次计算

      event中可以获取dataset，开始打算在touchend的时候记录到dataset，发现不支持。

      尝试通过callMethod在组件data记录和读取，但是发现读取不了，不返回，而且事件是异步。  
      考虑在touchstart的时候用getComputedStyle获取样式。这个方法接收多个key数组，返回一个map对象。这里用transform移动和直接修改定位都可以。但是transform获取到的是个matrix字符串，sjs解析麻烦一点，并且跟初始的定位合起来计算就更麻烦。直接采取定位的left和top，这里由于computedStyle获取到的是计算以后的，初始用的是left还是right都没关系，单位也没关系，获取到的都是px。

      最终代码如下：

      draggable.axml:

```html
<import-sjs from="./draggable.sjs" name="{onDragStart,onDragMove,onDragEnd}"></import-sjs>

<view class="draggable-wrapper {{className}}" data-id="{{id}}" style="{{style}}" onTouchStart="{{onDragStart}}" onTouchMove="{{onDragMove}}" onTouchEnd="{{onDragEnd}}" onTap="onTap">
    <slot></slot>
</view>

```

      draggable.js:

```javascript
const app = getApp()

Component({
    props: {
        className: '',
        style: '',
        onTap: () => {},
    },
    data: {
        id: '',
    },
    didMount () {
        console.log(this.$id)
        this.setData({
            id: this.$id,
        })
    },
    methods: {
        onTap () {
            this.props.onTap && this.props.onTap()
        },
        log (obj) {
            console.log(obj)
        },
    },
})
```

      draggable.sjs:

```javascript
const drapMap = {}

export const onDragStart = (event, ownerComponent) => {
    const instance = event.instance
    const id = event.currentTarget.dataset.id
    const last = instance.getComputedStyle(['left', 'top'])
    if (drapMap[id] == null) {
        drapMap[id] = {}
    }
    const state = drapMap[id]
    state.start = event.touches[0]
    state.last = {
        left: Number.parseInt(last.left),
        top: Number.parseInt(last.top),
    }
    // ownerComponent.callMethod('log', id)
    // ownerComponent.callMethod('log', last)
    // ownerComponent.callMethod('log', state.last)
    return false;
}
export const onDragMove = (event, ownerComponent) => {
    const instance = event.instance
    const id = event.currentTarget.dataset.id
    const state = drapMap[id]
    state.current = event.touches[0]
    const {
        pageX: x2,
        pageY: y2,
    } = state.current
    const {
        pageX: x1,
        pageY: y1,
    } = state.start

    const deltaX = x2 - x1
    const deltaY = y2 - y1

    // currentTarget 的 Descriptor 描述对象
    instance.setStyle({
        'left': state.last.left + deltaX,
        'top': state.last.top + deltaY,
    });
    // 不往上冒泡，相当于调用了同时调用了
    // event.stopPropagation() 和
    // event.preventDefault()
    return false;
}
export const onDragEnd = (event, ownerComponent) => {
    const id = event.currentTarget.dataset.id
    // currentTarget 的 Descriptor 描述对象
    delete drapMap[id]
    // 不往上冒泡，相当于调用了同时调用了
    // event.stopPropagation() 和
    // event.preventDefault()
    return false;
}

```

      draggable.less:

```javascript
.draggable-wrapper{
    position: fixed;
    bottom: 250rpx;
    right: 20rpx;
    z-index: 100;
}

```

