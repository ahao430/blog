# vue的provide和inject方法
在是用element-ui时遇到一个问题，在fixed定位的菜单上，el-select弹窗看不到，发现也是fixed定位，层级较低。并且el-select的option可以自定义，但是select的内容不支持自定义。于是考虑自己实现一个select组件。
实际遇到一个问题，就是想要向el-option那样通过slot的方式传入select的选项，以便于自定义样式。但是el-option的数量不固定，el-select怎么拿到el-option中的选项。查看el-select代码，发现主要是用到了[provide和inject](https://cn.vuejs.org/v2/api/#provide-inject)。

## 原理
在el-select中，添加provicde配置：
````js
export default {
  ...
  provide () {
    return {
      'select': this
    }
  }
}
````
在el-option中，配置inject将provide注入，即可通过this.select拿到select组件对象：
````js
export default {
  ...
  inject: ['select'],
}
````
感觉有点像react的context，配置之后，后代都可以拿到，但是context是单向获取内容，而provide传递的对象显然可以直接操作。  
这样，就可以在el-option的created阶段，向el-select的data中注入配置。从而可以在select中读取选项。同样的，在el-option的事件也可以直接调用el-select的事件。  
另外，在el-option的beforeDestroy阶段，从el-select的选项列表中删除了这个选项，应该是用于动态选项的情况。  
还有一个问题，就是当点击页面其他区域的时候，select应该是关闭下拉选项的，但是在select组件上直接添加onblur事件无效，查了一下，给div元素绑定一个tabIndex属性，再focus一下，就可以blur了。  

## 代码实现
````js
<template>
  <div class="my-select" @blur="onBlur" tabIndex="1">
    <div class="selected option" @click="handleToggleSelect">
      <slot name="select">
        <my-option :label="label" :value="value" :placeholder="placeholder" type="selected"></my-option>
      </slot>
      <i
        :class="[
          'el-icon-arrow-down',
          {
            open: isOptionsShow
          }
        ]"
      ></i>
    </div>
    <div class="options" v-show="isOptionsShow">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import MyOption from './MyOption';

export default {
  name: 'my-select',
  props: {
    value: {
      required: true,
    },
    placeholder: String,
  },
  data () {
    return {
      isOptionsShow: false,
      options: [],
    };
  },
  computed: {
    label () {
      return this.options.find(item => item.value === this.value)?.label;
    },
  },
  provide () {
    return {
      'select': this
    };
  },
  created () {
  },
  methods: {
    handleToggleSelect (e) {
      this.isOptionsShow = !this.isOptionsShow;
      this.$emit('click');
    },
    onOptionSelect (val) {
      this.$emit('change', val.value);
      this.isOptionsShow = false;
    },
    onOptionDestroy (index) {
      if (index > -1) {
        this.options.splice(index, 1);
      }
    },
    onBlur () {
      this.isOptionsShow = false;
    },
  },
  components: {
    'my-option': MyOption,
  },
};
</script>

<style lang="scss" scoped>
.my-select{
  position: relative;
  .selected {
    border: 1px solid #761eea;
    border-radius: 4px;
    cursor: pointer;
    color: #ae76f8;
    position: relative;
    i {
      position: absolute;
      right: 10px;
      top: 50%;
      font-size: 20px;
      transform: translateY(-50%) rotate(0);
      &.open {
        transform: translateY(-50%) rotate(180deg);
      }
    }
  }
  .options {
    position: absolute;
    left: 0;
    top: 100%;
    transform: translateY(20px);
    border: 1px solid #761eea;
    border-radius: 4px;
    background: #2d2e43;
    z-index: 100;
    cursor: pointer;
    max-height: 300px;
    overflow: auto;
  }
}
</style>

````
````js
<template>
  <div :class="['my-option', {
    placeholder: type === 'selected' && !value,
  }]" @click="handleSelectOption">
    <slot>{{value ? label : placeholder}}</slot>
  </div>
</template>

<script>
export default {
  name: 'my-option',
  props: {
    label: [String, Number],
    value: {
      required: true,
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: '',
    },
  },
  data () {
    return {};
  },
  inject: ['select'],
  created () {
    if (this.type !== 'selected') {
      this.select.options.push(this);
    }
  },
  beforeDestroy () {
    if (this.type !== 'selected') {
      this.select.onOptionDestroy(this.select.options.indexOf(this));
    }
  },
  methods: {
    handleSelectOption (e) {
      if (this.type !== 'selected') {
        // debugger;
        this.select.onOptionSelect(this);
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.my-option {
  box-sizing: border-box;
  width: 210px;
  font-size: 12px;
  padding: 5px 20px;
  min-height: 22px;
  &:hover{
    color: #ae76f8;
  }
  &.placeholder{
    color: #999;
  }
}
</style>

````