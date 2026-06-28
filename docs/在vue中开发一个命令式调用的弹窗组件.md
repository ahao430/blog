活动需求要做一个顶部弹窗图片的toast效果，想起element中通过命令调用toast组件的方式，去调研一番，实现了一个类似效果。

# 相关api：
核心需要用到两个api：

+ Vue.extend方法，通过模板创建Vue构造器：[https://cn.vuejs.org/v2/api/?#Vue-extend](https://cn.vuejs.org/v2/api/?#Vue-extend)
+ vm.$mount方法，获取vm实例：[https://cn.vuejs.org/v2/api/?#vm-mount](https://cn.vuejs.org/v2/api/?#vm-mount)

# 第一步，创建模板
如下，写一个Vue组件，就像我们平常手动引入使用的组件那样。但是不用写props，所有的配置对象写到data里。关闭的时候，要销毁dom对象。我们知道vm.$el可以拿到组件的dom元素，因此可以通过this.$el.parentNode.removeChild(this.$el)来移除dom。在此之前，用vm.$destroy销毁vm实例。

```vue
<template>
<transition name="custom-toaster">
  <div v-if="visible" class="custom-toaster-wrapper">
    <img class="img" :src="img" alt="" v-if="img">
    <div :class="['text', {'only-text': !img}]" v-if="message" :style="messageStyle">
      <span>{{message}}</span>
  </div>
  </div>
  </transition>
</template>

<script>
  
  export default {
    name: "custom-toaster",
    data() {
      return {
        visible: false,
        message: '',
        messageStyle: {},
        img: '',
        duration: 1500,
      };
    },
    components: {
    },
    computed: {
    },
    methods: {
      setTimer() {
        setTimeout(() => {
          this.close(); // 3000ms以后调用关闭方法
        }, this.duration);
      },
      close() {
        this.visible = false;
        setTimeout(() => {
          this.$destroy(true);
          this.$el.parentNode.removeChild(this.$el); // 从DOM里将这个组件移除
        }, 500);
      }
    },
    mounted() {
      this.setTimer(); // 挂载的时候就开始计时，3000ms后消失
    }
  };
</script>

<style lang="less" scoped>
  .custom-toaster-enter-active,
  .custom-toaster-leave-active {
    transition: all 0.5s linear;
    transform: translate(0, 0);
  }
  .custom-toaster-enter,
  .custom-toaster-leave-to /* .custom-toaster-leave-active below version 2.1.8 */ {
    transform: translate(0, -100%);
    transition: all 0.5s linear;
  }
  
  .custom-toaster-wrapper{
    position: fixed;
    z-index: 99999;
    top: 20px;
    left: 0;
    right: 0;
    text-align: center;
    .img{
      width: 100%;
      height: auto;
    }
    .text{
      &.only-text{
        max-width: 600px;
        min-width: 100px;
        width: min-content;
        min-height: 40px;
        box-sizing: border-box;
        padding: 10px 30px;
        margin: 0 auto;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 40px;
        span{
          display: inline-block;
          color: #FFF;
          line-height: 40px;
        }
      }
    }
  }
</style>

```

# 第二步，创建构造器和vm实例，挂载
我们把前面的Vue组件当做模板，用Vue.extend方法得到一个构造器。

写一个Toastr方法用于调用，接收配置参数。new这个构造器拿到实例。当这个实例有el参数时，会挂载到对应元素上，或者可以通过$mount传入el来挂载。这里我们都不做。只是用参数作为data去new它。然后通过$mount拿到vn对象，赋给实例的vm属性。再手动挂载。

返回vm对象，方便手动调用方法。

```javascript
import Vue from "vue";
import ToasterTpl from "./Toaster.vue";

const ToasterConstructor = Vue.extend(ToasterTpl);
let tId = 1;
const Toaster = (options) => {
  if (JSON.stringify(options) == undefined) return false;
  let id = "toaster-" + tId++;
  options = options || {};
  if (typeof options === "string") {
    options = {
      message: options,
    };
  }
  
  const ToasterInstance = new ToasterConstructor({
    data: options,
  });
  ToasterInstance.id = id;
  ToasterInstance.vm = ToasterInstance.$mount();
  ToasterInstance.vm.visible = true; // 前面模板中data上的visible属性
  ToasterInstance.dom = ToasterInstance.vm.$el;
  document.body.appendChild(ToasterInstance.dom);
  return ToasterInstance.vm;
};

export default Toaster;

```

# 第三步，对外暴露这个方法，挂载到Vue原型上
这个函数已经可以直接使用了。然后可以在main.js通过挂到Vue.prototype上，在任意vue组件中调用。但是vue本身提供了一个install方法封装组件，这样跟我们平常用的组件注册方法就一模一样了。

```javascript
import toaster from './toaster'

export const Toaster from toaster
export default {
  install (Vue){
      Vue.prototype.$toaster = toaster
      Vue.toaster = toaster
  }
}

```

# 使用
```javascript
import Toaster from '@/components/Toaster/index'

Vue.use(Toaster)
```

```javascript
this.$toaster({
  message: this.firstAmount,
  duration: 1500,
})
```

因为是个方法，也可以在util.js中引入Toaster方法，直接调用。

