## mixin
有时候我们需要在页面注入一些公用的数据和方法，这就需要mixin的实现。在小程序中，组件支持mixins；对页面的mixin注入，可以通过重写Page方法来实现。

如果需要按需引入mixins，我们可以在页面增加mixins属性，再在mixin中按需引入，这里我就简单的对所有页面统一引入一个公用的pageMixin了。

新建一个mixins目录用于存放mixin代码，里面新建一个page.js写要注入的代码。

在util目录实现一个pageMixin.js：

```javascript
import pageMixin from '../mixins/page'

// 合并mixins属性到Page的options中
function merge (mixin, options, properties = []) {
  if (Object.prototype.toString.call(mixin).slice(8, -1) === 'Object') {
    for (const [key, value] of Object.entries(mixin)) {
      if (key === 'data') {
        options.data = { ...value, ...options.data }
      } else if (key === 'methods') {
        options.methods = { ...value, ...options.methods }
      } else if (properties.includes(key)) {
        const native = options[key]
        options[key] = function (...args) {
          value.call(this, ...args)
          return native && native.call(this, ...args)
        }
      } else {
        if (options[key] == null) {
          options[key] = value
        }
      }
    }
  }
}

// 原生Page属性
const pageProperties = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

const initPage = (nativePage) => {
  return (option) => {
    merge(pageMixin, option, pageProperties)
    return nativePage(option)
  }
}

/* eslint-disable no-global-assign */
export const init = () => {
  Page = initPage(Page)
}

```

在app.js，在初始化App对象之前，引入pageMxin：

```javascript
require('./utils/pageMixin').init()
```

mixins/page.js示例:

```javascript
export default {
  data: {
    // ipx: ipx,  ipx在pageMixin设置
    // ipxBottom: ipx ? 68 : 0,
    imageUrl: 'https://xiaojinhe-cdn.iyoudui.com/hcz',
    // 弹窗
    showPopup: false,
    popupData: {},
  },
  onLoad (query) {
    this.setData({
      query,
    })
  },
  onShow () {
    setTimeout(() => {
      my.hideLoading()
    }, 0)
  },

  saveRef (ref) {
    this._common = ref
  },
}

```

## 全局组件
在微信小程序中，可以通过wx.selectComponent(#id)来获取指定组件，并且可以在app.json引入公共组件，这样，我们在所有页面引入一个公共组件，可以在任意位置调它的方法。

但是在支付宝小程序中，是不支持这种方式的，根据支付宝小程序文档，支付宝小程序中可以通过在页面设置saveRef方法来注入组件，见上面的mixin代码。这样，我们可以用mixin来实现在每个页面注入一个公共组件，再来全局调用。但是在页面代码和页面json中，还是要分别引入组件。另外，这个属性需要在开发工具中找到详情设置，勾选启用component2编译，勾选后会在项目根目录插入一个配置文件。

1. 编写全局组件
2. 在每个需要引用的页面，axml代码手动引入组件，json中引入组件

```html
<common ref="saveRef"></common>
```

3. 在mixin中注入saveRef方法

```javascript
saveRef (ref) {
  this._common = ref
},
```



4. 在需要使用的地方通过获取页面属性拿到组件，执行组件的方法

```javascript
// 某个页面中
this._common && this._common.xxx()
// 某个组件中
// const curPage = getCurrentPages().pop()
// curPage._common && curPage._common.xxx()
if (this.$page && this.$page._common) {
  this.$page._common.xxx()
}
```



