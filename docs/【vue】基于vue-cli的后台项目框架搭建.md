最近搭建了一套基于vue-cli的后台项目。

+ vue-cli3，安装vue全家桶
+ UI采用的是ant-design-vue
+ 考虑到主题切换需求，css采用了vue-styled-components
+ npm scripts配置多环境
+ 引入immer.js操作对象
+ 安装mockjs方便开发
+ 引入了storybook管理组件
+ 使用webpack-dll-plugin优化打包

## 1. 目录结构
```plain
.
├── .ci
├── .git
├── .storybook ........................................storybook配置文件
│   ├── main.js
│   ├── manager.js
│   └── preview.js
├── dist
├── node_modules
├── public
│   ├── vendor ..........................................打包生成的dll文件
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── apis ..................................................api接口
│   │   └── index.js
│   ├── assets .................................................资源文件
│   │   └── images ................................................图片
│   ├── common
│   │   ├── styles
│   │   │   ├── color.js ........................................颜色
│   │   │   ├── common.js .......................................全局js文件
│   │   │   ├── commonStyle.js ....................公用styled-components文件
│   │   │   └── common.scss ......................................全局样式
│   │   └── themes ..............................................主题
│   │       ├── dark.js
│   │       └── light.js
│   ├── components ...............................................全局组件
│   ├── config ..................................................配置文件
│   ├── filters .................................................全局filter
│   ├── layout .................................................布局
│   ├── mock .....................................................mock接口
│   ├── router ....................................................路由
│   ├── store .....................................................状态管理
│   │   ├── modules
│   │   └── index.js
│   ├── utils .....................................................工具方法
│   ├── views ............................................页面文件及页面组件
│   ├── App.vue .................................................根组件
│   └── main.js ................................................入口文件
├── .browserslistrc
├── .editorconfig
├── .eslintignore
├── .eslintrc.js ............................................eslint配置文件
├── .gitattributes
├── .gitignore
├── .gitlab-ci.yml  # CI配置文件
├── .postcss.config.js
├── babel.config.js
├── package-lock.json
├── package.json
├── README.md
├── vue.config.js ..........................................vue-cli配置文件
├── webpack.dll.conf.js .............................webpack-dll插件配置文件
└── yarn.lock
```



## 2. 项目搭建
#### 
#### 初始化
使用vue-cli初始化项目，选择手动配置，选中vue-router，vuex，eslint。

```bash
vue create xxx
cd xxx
```

安装antd-vue，安装vue-styled-components，安装babel-polyfill，安装axios，安装immer。

```bash
yarn add vue-styled-components babel-polyfill axios ant-design-vue immer
```

新建api目录管理ajax；

新建assets目录存放静态资源；

新建common文件夹存放公用文件，样式和主题等；

新建config目录存放配置文件；

新建filters目录存放公用filter函数；

新建layout目录存放主页面布局组件

新建mock目录存放mock文件；

新建router目录存放路由；

新建store目录存放vuex；

新建util目录存放工具函数；

#### 
#### 配置main.js
在main.js引入所需文件，配置vue。

这里antd可配置全局或按需引入。

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'babel-polyfill'

// 过滤器
import * as filters from './filters/index'

import Antd from 'ant-design-vue/lib'
import 'ant-design-vue/dist/antd.css'

// 引入公共样式
import './common/styles/common.scss'

// 是否使用mock数据
// import '@/mock/index'

Vue.use(Antd)

// 注册filter
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

```

#### 
#### 配置api
在api/index.js中引入axios，配置拦截器和所有ajax请求。

在请求拦截器中设置token，在响应拦截器中设置不同code处理。当code表示token失效时，执行store的logout，或是跳转router的/login。

```javascript
import axios from 'axios'
import store from '../store'
import { message } from 'ant-design-vue/lib'
import { commonApiHost, apiHost } from '@/config/index'
// import router from '../router'

const isProd = process.env.NODE_ENV === 'production'

// 引入环境host
axios.defaults.baseURL = isProd ? apiHost : '/api'

// request拦截器
axios.interceptors.request.use(config => {
  if (store.state.token) {
    config.headers.Authorization = `Bearer ${store.state.token}`
  }
  return config
})

// response拦截器
axios.interceptors.response.use(response => {
  return response.data
}, err => {
  message.error({
    content: '服务器错误'
  })
  return Promise.reject(err)
})

/** ********************** apis *************************/
// 上传图片
export const uploadImg = (data) => axios.post('/common/uploadImg', data)

```

在开发阶段，使用代理开发可以更方便的处理跨域，判断当前NODE_ENV是development时，即执行的serve命令，将baseURL设置为/api，在vue.config.js中设置proxy，并重写路由去掉/api：

```javascript
  // 开发服务器
  devServer: {
    compress: true,
    disableHostCheck: true,
    port: 8081,
    proxy: {
      '/api': {
        target: config.apiHost,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  }
```

#### 
#### 配置vuex
采用模块化配置。在index.js设置rootStore，在modules目录按功能模块划分store。

安装vuex-persistedstate，刷新页面时，store的状态不丢失。开发时有时会导致修改了state无变化，可以在修改state时先注释掉。

```bash
yarn add vuex-persistedstate
```

store/index.js:

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import demoStore from './modules/demo'
import * as api from '@/apis/index.js'
import { loginHost } from '@/config/index'

Vue.use(Vuex)

const state = {}
const getters = {}
const mutations = {}
const actions = {}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    demo: demoStore,
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })],
})
```

store/modules/demo.js:

```javascript
import * as api from '@/apis/index.js'
const state = {}
const getters = {}
const mutations = {}
const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
```

将全局状态存和接口到rootStore中，各模块的接口存放到对应store的action中。不要在页面中直接引入api，通过store便于统一管理和调试。

将ajax请求值，以及一些查询条件如分页等放到store中，确保跳转页面回退是页码等参数不变。

相比起keep-alive，store可以避免一些诡异的bug。

#### 
#### 配置环境命令
环境主要涉及到两个变量，一是当前命令是开发还是构建，二是代码部署的环境。

vue-cli的serve命令会传入NODE_ENV=development， build命令会传入NODE_ENV=production。但是当我们手动配置process.env时，这个变量会丢失，需要重新配置。

vue-cli本身支持[创建.env文件来配置不同的环境](https://cli.vuejs.org/zh/guide/mode-and-env.html)，但是考虑到命令环境，实际上要新建环境数量两倍的配置文件。因此，直接通过npm scripts来传入。

一般安装[cross-env](https://github.com/kentcdodds/cross-env#readme)来实现兼容windows和linux设置环境变量。为了更直观的查看和编写风格，这里安装了[better-npm-run](https://github.com/benoror/better-npm-run#readme)来实现。

package.json:

```json
  "scripts": {
    "serve": "better-npm-run serve:dev",
    "serve:dev": "better-npm-run serve:dev",
    "serve:prod": "better-npm-run serve:prod",
    "build": "better-npm-run build:prod",
    "build:dev": "better-npm-run build:dev",
    "build:prod": "better-npm-run build:prod"
  },
  "betterScripts": {
    "serve:dev": {
      "command": "vue-cli-service serve",
      "env": {
        "NODE_ENV": "development",
        "VUE_APP_ENV": "dev"
      }
    },
    "serve:prod": {
      "command": "vue-cli-service serve",
      "env": {
        "NODE_ENV": "development",
        "VUE_APP_ENV": "prod"
      }
    },
    "build:dev": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "dev"
      }
    },
    "build:prod": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "prod"
      }
    }
  }
```

可以看到，对serve和build命令，传入了原先的NODE_ENV。此外，不同的环境配置了一个不同的VUE_APP_ENV变量。在代码中，我们可以通过process.env拿到环境变量。

config/index.js:

```json
const env = process.env

const apiHosts = {
  dev: 'http://dev.xxx.com',
  test: 'http://test.xxx.com',
  prod: 'http://prod.xxx.com',
}

module.exports = {
  apiHost: apiHosts[env.VUE_APP_ENV] || '/',
}
```



#### 配置eslint
在.eslintrc.js中，初始化时已经选择了安装standard规范。

手动添加规则到rules中，覆盖预设的规则。

判断当前NODE_ENV，可以配置在开发和打包时不同的规则，使得开发时忽略某些规则，方便开发。

.eslintrc.js:

```javascript
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  plugins: [
    'babel'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': isProd ? 1 : 0,
    'no-debugger': isProd ? 1 : 0,
    'no-unused-vars': isProd ? 2 : 1,
    'semi': [2, 'never'],
    'comma-dangle': [2, 'only-multiline'],
    'camelcase': 0,
    'babel/camelcase': 1,
    'babel/camelcase': 0,
  }
}

```

此外，vue-cli初始化的.eslintignore文件设置的时src，相当于没有校验。我们需要改成别的目录。

.eslintignore:

```plain
node_modules/
dist/
public/
```

最后，为了团队代码的规范，安装pre-commit，配置git必须通过eslint校验才能commit，防止不符合团队规范的代码提交到仓库。

```bash
yarn add -D pre-commit
```

package.json:

```json
{
  "scripts": {
    "lint": "vue-cli-service lint",
  },
  "pre-commit": [
    "lint"
  ]
}
```

## 3. 页面及路由配置
后台主页面通常是一个顶部导航一个侧边，然后剩余区间是页面渲染区域。但是个别页面如登录页不同。

这里我们将登录页Login和主界面Home作为一级页面，其他页面写到Home的children中。

Home页面的组件放到layout文件夹，包括全局的Header，Sidebar，Nav，Footer，SettingDrawer，Breadcrumb等。

在Home配置顶部和侧边导航。

views/Home/Index.vue:

```vue
<template>
  <div>
    <HomeHeader></HomeHeader>
    <div>
      <HomeSidebar></HomeSidebar>
      <div>
        <router-view/>
      </div>
    </div>
  </div>
</template>
```

router/index.js：

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

// 解决导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace (location) {
  return originalReplace.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/Index.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home/Index.vue'),
    children: [
      {
        path: 'demo',
        name: 'demo',
        component: () => import('../views/Demo/Index.vue'),
      },
      // 404
      {
        path: '*',
        name: 'home-404',
        component: () => import('../views/NotFound/Index.vue'),
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import('../views/NotFound/Index.vue'),
  }
]

const router = new VueRouter({
  routes
})

// 到登录页执行logout方法，清除状态
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    store.dispatch('logout')
  }
  next()
})

export default router
```

在router.beforeEach中，设置跳转login时执行logout方法。

对外export整个router，方便在store和api等js文件中，直接使用router跳转。



## 4. 主题及布局设置
模仿antd-pro的设置弹窗，实现了一系列主题设置。

### vuex配置
在config新建一个默认配置文件。

```javascript
export const defaultUI = {
  layout: 'sidemenu',
  contentWidth: 'fluid',
  theme: 'light',
  primaryColor: LightTheme['primary-color'],
  headerUsePrimary: true,
  fixedHeader: false, // 顶部固定
  fixSiderbar: true, // 侧边固定
  autoHideHeader: true, // 顶部固定时，下滑隐藏顶部
  hideHintAlert: false, // 隐藏警告
  weakMode: false, // 色弱模式（全局加滤镜 filter: invert(80%);）
  multiTab: false, // 多标签页模式
}

```

在store中引入配置。同时判断缓存，如果有本地配置缓存，优先使用缓存。

commit接收修改配置。

在页面的顶部、侧边等布局接收配置切换显示等布局变化。

### styled-components注入变量到css
我们使用styled-components的themeProvider向根组件注入配置。这样，不仅模板和js可以获取配置，样式文件中同样可以获取主题色等。

```javascript
<!-- 注入theme -->
<ThemeProvider :theme="theme.data" style="width: 100%; height: 100%;">
  <AppWrapper>
    <router-view v-if="isRouterAlive" ></router-view>
    <SettingDrawer></SettingDrawer>
  </AppWrapper>
</ThemeProvider>

import { ThemeProvider } from 'vue-styled-components'
```

### antd主题管理
主题切换的难点在于antd组件的切换。

antd可以通过less变量修改主题色，但是less编译成css后无法修改。这时可以通过webpack-theme-color-replacer注入新的less变量，重新编译antd主题样式，将新的css文件插入页面来覆盖。

在vue.config.js中插入插件：

```javascript
const ThemeColorReplacer = require('webpack-theme-color-replacer')
module.exports = {
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'border-radius-base': '2px'
          },
          // DO NOT REMOVE THIS LINE
          javascriptEnabled: true
        }
      }
    }
  },
  configureWebpack: (config) => {
    config.plugins.push(new ThemeColorReplacer(themePluginOption))
  },

```

在主题设置面板中，切换颜色时，执行插件的方法修改配置：

```javascript
import client from 'webpack-theme-color-replacer/client'
import generate from '@ant-design/colors/lib/generate'

export default {
  getAntdSerials (color) {
    // 淡化（即less的tint）
    const lightens = new Array(9).fill().map((t, i) => {
      return client.varyColor.lighten(color, i / 10)
    })
    // colorPalette变换得到颜色值
    const colorPalettes = generate(color)
    const rgb = client.varyColor.toNum3(color.replace('#', '')).join(',')
    return lightens.concat(colorPalettes).concat(rgb)
  },
  changeColor (newColor) {
    var options = {
      newColors: this.getAntdSerials(newColor), // new colors array, one-to-one corresponde with `matchColors`
      changeUrl (cssUrl) {
        return `/${cssUrl}` // while router is not `hash` mode, it needs absolute path
      }
    }
    return client.changer.changeColor(options, Promise)
  }
}
```

### 跨iframe配置传递
我们的个人中心，在各个平台中使用iframe去嵌套登录中心的个人页面。这就涉及到跨iframe的配置传递，需要将外层的主题色传递到内层iframe中。选择postmessage来实现。

在项目页面，在iframe元素onload和修改主题设置时，向iframe发送message：

```javascript
<UserPage>
  <iframe ref="iframe" class="iframe" :src="src" frameborder="0" @load="onIframeLoad"></iframe>
</UserPage>

export default {
  watch: {
    config (val) {
      this.sendIframeMessage({
        primaryColor: val.primaryColor,
      })
    },
  },
  mounted () {
    this.$store.dispatch('getUserInfo')
  },
  methods: {
    onIframeLoad () {
      this.sendIframeMessage({
        primaryColor: this.config.primaryColor,
      })
    },
    sendIframeMessage (data) {
      const iframe = this.$refs.iframe.contentWindow
      // const origin = 'http://localhost:8000'
      const origin = loginHost
      console.log('sendMessage')
      iframe.postMessage({
        type: 'config',
        data,
      }, origin)
    },
  },
}

```

在iframe页面，监听message事件：

```javascript
window.addEventListener('message', function(e){
	// change color
})
```



## 5. 第三方库使用
### 
### antd-vue
可参考[antd-vue](https://www.antdv.com/docs/vue/introduce-cn/)官网。

可以全局引入，也可以按需引入。

```javascript
// 全局引入
import Vue from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Antd);

// 按需引入
import Vue from 'vue';
import { Button, message } from 'ant-design-vue';
Vue.component(Button.name, Button)
Vue.prototype.$message = message;
```

按需引入时，配置babel可以实现css也按需引入。但是全局引入的话要去掉这个配置，不然会引起问题。

```javascript
 module.exports = {
  presets: ["@vue/app"],
  plugins: [
    [
      "import",
      { libraryName: "ant-design-vue", libraryDirectory: "es", style: true }
    ]
  ]
};
```

### 
### vue-styled-components
[vue-styled-components](https://github.com/styled-components/vue-styled-components)仓库。

使用时，新建一个style.js文件，引入styled方法，编写样式。可以传入参数，在styled函数中传入第二个参数，声明prop类型，如果不声明，则props接收不到，作为attrs传入。

styled-components内部可以类似scss的写法。

Demo/style.js: 

```javascript
import styled from 'vue-styled-components';

export const TitleWrapper = styled('div', {
	size: String,
})`
  font-size: ${props => props.size};
  text-align: center;
  color: ${props => props.theme['font-color']};
	p{
		margin: 0;
	}
`;

```

然后在vue文件中引入样式组件，在页面中使用。

Demo/Index.vue:

```vue
<template>
  <TitleWrapper size="16px">
    <p>My Title</p>	
  </TitleWrapper>
</template>
<script>
import {TitleWrapper} from './style
export default {
	components: {
  	TitleWrapper,
  },
}
</script>
```

其中的props.theme我们并没有在组件传入，而是<font style="color:#000000;">通过</font><font style="color:#000000;">ThemeProvider全局注入的。在store中获取对应theme配置文件，注入theme到根组件。下面所有的styled组件都可以通过props接收到。这样，我们就可以通过js修改theme变量，来实现全局样式的切换刷新。</font>

```vue
<template>
  <div id="app">
    <!-- 注入theme -->
    <ThemeProvider :theme="theme.data" style="width: 100%; height: 100%;">
      <router-view></router-view>
    </ThemeProvider>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ThemeProvider } from 'vue-styled-components'
export default {
  name: 'app',
  components: {
    ThemeProvider,
  },
  computed: {
    ...mapGetters(['theme']),
  },
}
</script>
```

### 
### immer
[immer.js](https://github.com/immerjs/immer)是mobx作者基于proxy实现的一个immutable库。相比immutableJS，其体积更小，语法更简洁，性能更优异。

使用方法如下：

```javascript
import product from 'immer'
let obj = {
  a: 1,
  b: {
    c: 2,
  }
}
obj = produce(obj, draft => {
  draft.b.c = 3
})
```



### <font style="color:#000000;">vue-smooth-dnd</font>
[vue-smooth-dnd](https://github.com/kutlugsahin/vue-smooth-dnd)是一个拖拽库。有需要时可以使用。

Demo: [https://kutlugsahin.github.io/vue-smooth-dnd](https://kutlugsahin.github.io/vue-smooth-dnd)。



### <font style="color:#000000;">optional-chaining</font>
```bash
yarn add -D @babel/plugin-proposal-optional-chaining
```

通过babel实现在项目中使用optional-chaining。

在取对象的属性时，不用一层一层判断了，可以直接用?.向下查找。

```javascript
// 以前 const d = a && a.b && a.b.c
// 现在
const d = a?.b?.c
```



### rem布局
如果项目需要使用rem布局，可以引入<font style="color:#000000;">amfe-flexible.js，并在vue.config.js配置postcss-px2rem。</font>

```bash
yarn add amfe-flexible
yarn add -D postcss-px2rem
```

```javascript
  css: {
    // 启用 CSS modules
    modules: false,
    // 是否使用css分离插件
    extract: true,
    // 开启 CSS source maps?
    sourceMap: env !== 'production',
    // css预设器配置项
    loaderOptions: {
      css: {},
      postcss: {
        plugins: [
          // 设计图宽度除以10
          require('postcss-px2rem')({
            remUnit: 192,
            baseDpr: 1,
          })
        ]
      }
    },
  }

```



## 6. storybook管理组件
[storybook](https://storybook.js.org/)是一个UI组件开发工具。可以查看和管理组件。习惯以后也可以改变组件的开发流程，先开发组件，再开发页面。

插件配置文档：[https://github.com/storybookjs/storybook/tree/master/addons](https://github.com/storybookjs/storybook/tree/master/addons)



### 安装
```bash
yarn add -D @storybook/vue @storybook/addons @storybook/addon-a11y @storybook/addon-actions @storybook/addon-controls @storybook/addon-docs @storybook/addon-knobs @storybook/addon-notes @storybook/addon-storysource storybook-vue-router
    
```

package.josn:

```json
  "scripts": {
    "storybook": "start-storybook"
  },
```

### 配置
新建.storybook目录，创建配置文件。

.storybook/main.js:

```javascript
const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.[tj]s'], // 配置入口文件
  addons: [
    '@storybook/addon-a11y/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-notes/register-panel',
    // '@storybook/addon-docs/register',
    // '@storybook/addon-storysource/register',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          // test: [/\.stories\.jsx?$/], This is default
          include: [path.resolve(__dirname, '../src')], // You can specify directories
        },
        loaderOptions: {
          prettierConfig: { printWidth: 80, singleQuote: false },
        },
      },
    },
  ],
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    },
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    // Return the altered config
    return config;
  },
};

```

.storybook/manager.js

```javascript
// manager.js
import { themes } from '@storybook/theming/create';
import { addons } from '@storybook/addons';

addons.setConfig({
  // theme: themes.dark,
  panelPosition: 'right',
});

```

.storybook/preview.js:

```javascript
import { configure, addDecorator } from '@storybook/vue';
// Import Vue plugins
import Vue from 'vue';
import Vuex from 'vuex';
import Antd from 'ant-design-vue/dist/antd.js';
import 'ant-design-vue/dist/antd.css';

// 配置vue
Vue.use(Vuex);
// 注册全局组件
Vue.use(Antd);

// configure(require.context('../src', true, /\.stories\.js$/), module);
```



### 使用
在组件文件夹新建xx.stories.js。

```javascript
// import { storiesOf } from '@storybook/vue'
import {
  withKnobs,
  text,
} from '@storybook/addon-knobs'
import { withActions } from '@storybook/addon-actions'
import { withA11y } from '@storybook/addon-a11y'
import StoryRouter from 'storybook-vue-router'
// 这里导入你自己的组件，
import Demo from './Index.vue'

export default {
  title: 'demo',
  decorators: [withA11y, withKnobs, withActions(), StoryRouter()],
  parameters: {
    notes: `说明`,
  },
}

export const asAComponent = () => ({
  components: { UploadImg },
  props: {
    title: {
      default: text('按钮')
    }
  },
  template: `
    <Demo :title="title"></Demo>	
  `
})

```

运行命令：

```bash
yarn storybook
```

可以看到启动的storybook项目，在弹出的页面可以看到所有配置了stories的组件。组件的prop值可以在右侧面板修改。

## 7. 项目打包优化
### 代码分析
安装[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)插件分析代码打包体积。

```bash
yarn add -D webpack-bundle-analyzer
```

在package.json配置analyze命令：

```json
  "scripts": {
    "analyze": "better-npm-run analyze",
  },
  "betterScripts": {
    "analyze": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "prod",
        "ANALYZE": true
      }
    }
  },
```

在vue.config.js配置使用插件：

```javascript
chainWebpack: config => {
  if (env.ANALYZE) {
    config
      .plugin('webpack-bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
  }
}
```

执行命令，打包并弹出分析结果页面。

```bash
yarn analyze
```

可以看到可视化的各个模块大小，左边抽屉显示代码体积。可以看到，项目打包文件的体积主要来自第三方库。

### 方案选择
优化第三方库，一般有两种方案。

+ 配置externals



+ 使用dll

前者是在vue.config.js中，将第三方库配置到externals。这里要注意配置的变量名不能随意命名，必须是这些js库对外暴露的。然后在public/index.html中，插入对应的js文件。可以选择使用cdn，优化速度。

后者通过webpack-plugin-dll插件，将第三库打包到vendors目录。然后在html引入。这些打包出的js文件依然在项目内部，但是打包一次即可，后续执行打包时可跳过这些文件，从而优化打包速度。

两者相比较，前者可以通过外部cdn加速，速度上更有优势，但是一旦这个cdn服务出现问题，会导致页面无法显示。而后者更易维护，只需将所有第三方库配置出来，打包一次即可。

这里我们选择后者，因为一方面更易维护，一方面我们的项目使用gitlab-ci自动部署，优化打包速度效果更显著。所有js文件都在自己项目内也更加安全。

### DLL配置
安装webpack-dll-plugin，并再安装一个webpack用于执行dll打包命令。安装插入代码到html的插件。

```javascript
yarn add -D webpack webpack-build-dll-plugin add-asset-html-webpack-plugin
```

新建webpack.dll.config.js文件，配置要打包的js库，以及打包目录：

```javascript
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// "clean-webpack-plugin": "^3.0.0"
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// dll文件存放的目录
const dllPath = 'public/vendor'

module.exports = {
  entry: {
    // 需要提取的库文件
    vendor: [
      'vue',
      'vue-router',
      'vuex',
      'axios',
      'core-js',
      'immer',
      'vue-styled-components',
      'babel-polyfill',
      'ant-design-vue/lib',
    ]
  },
  output: {
    path: path.join(__dirname, dllPath),
    filename: '[name].dll.js',
    // vendor.dll.js中暴露出的全局变量名
    // 保持与 webpack.DllPlugin 中名称一致
    library: '[name]_[hash]'
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin({
      root: path.join(__dirname, dllPath)
    }),
    // "clean-webpack-plugin": "^3.0.0"
    // new CleanWebpackPlugin(),
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与 output.library 中名称一致
      name: '[name]_[hash]',
      context: process.cwd()
    })
  ]
}
```

在vue.config.js中配置打包时dll优化，及自动插入vendors到html中：

```javascript
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

configureWebpack: (config) => {
  if (env.NODE_ENV === 'production') {
    // dll优化
    config.plugins.push(new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require('./public/vendor/vendor-manifest.json')
    }))
    // 将打包出来文件动态引入index.html
    config.plugins.push(
      new AddAssetHtmlPlugin({
        // dll文件位置
        filepath: path.resolve(__dirname, './public/vendor/*.js'),
        // dll 引用路径
        publicPath: './vendor',
        // dll最终输出的目录
        outputPath: './vendor'
      })
    )
  }
}
```

最后，在package.json加入dll命令：

```json
  "scripts": {
    "dll": "webpack -p --progress --config ./webpack.dll.conf.js",
  },
```

项目运行一次dll命令即可。如果dll配置没有发生变化，每次编译只需执行build。

优化后，再次执行analyze命令进行分析，可以看到build代码只有几百k了，主要都是vue文件。



### Antd配置
Antd是可以按需引入的。但是这里我们将antd整个用dll打包，后面就没有必要按需了，直接整个引入即可。如果要按需引入，最好不要在dll配置antd，否则改动频繁没有意义。



## 8. 配置文件
#### package.json
```json
{
  "name": "galaxy-develop-ui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "better-npm-run serve:dev",
    "serve:dev": "better-npm-run serve:dev",
    "serve:test": "better-npm-run serve:test",
    "serve:prod": "better-npm-run serve:prod",
    "build": "better-npm-run build:prod",
    "build:dev": "better-npm-run build:dev",
    "build:test": "better-npm-run build:test",
    "build:prod": "better-npm-run build:prod",
    "analyze": "better-npm-run analyze",
    "dll": "webpack -p --progress --config ./webpack.dll.conf.js",
    "lint": "vue-cli-service lint",
    "storybook": "start-storybook"
  },
  "betterScripts": {
    "serve:dev": {
      "command": "vue-cli-service serve",
      "env": {
        "NODE_ENV": "development",
        "VUE_APP_ENV": "dev"
      }
    },
    "serve:test": {
      "command": "vue-cli-service serve",
      "env": {
        "NODE_ENV": "development",
        "VUE_APP_ENV": "test"
      }
    },
    "serve:prod": {
      "command": "vue-cli-service serve",
      "env": {
        "NODE_ENV": "development",
        "VUE_APP_ENV": "prod"
      }
    },
    "build:dev": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "dev"
      }
    },
    "build:test": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "test"
      }
    },
    "build:prod": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "prod"
      }
    },
    "analyze": {
      "command": "vue-cli-service build",
      "env": {
        "NODE_ENV": "production",
        "VUE_APP_ENV": "prod",
        "ANALYZE": true
      }
    }
  },
  "pre-commit": [
    "lint"
  ],
  "dependencies": {
    "ant-design-vue": "^1.6.3",
    "axios": "^0.19.2",
    "babel-polyfill": "^6.26.0",
    "core-js": "^3.6.5",
    "dll": "^0.2.0",
    "echarts": "^4.8.0",
    "immer": "^7.0.5",
    "vue": "^2.6.11",
    "vue-router": "^3.2.0",
    "vuex": "^3.4.0",
    "vuex-persistedstate": "^3.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.10.4",
    "@babel/plugin-proposal-optional-chaining": "^7.10.4",
    "@storybook/addon-a11y": "^5.3.19",
    "@storybook/addon-actions": "^5.3.19",
    "@storybook/addon-controls": "^6.0.0-beta.15",
    "@storybook/addon-docs": "^5.3.19",
    "@storybook/addon-knobs": "^5.3.19",
    "@storybook/addon-notes": "^5.3.19",
    "@storybook/addon-storysource": "^5.3.19",
    "@storybook/addons": "^5.3.19",
    "@storybook/vue": "^5.3.19",
    "@vue/cli-plugin-babel": "^4.4.0",
    "@vue/cli-plugin-eslint": "^4.4.0",
    "@vue/cli-plugin-router": "^4.4.0",
    "@vue/cli-plugin-vuex": "^4.4.0",
    "@vue/cli-service": "^4.4.0",
    "@vue/eslint-config-standard": "^5.1.2",
    "add-asset-html-webpack-plugin": "^3.1.3",
    "babel-eslint": "^10.1.0",
    "babel-loader": "^8.1.0",
    "babel-plugin-import": "^1.13.0",
    "babel-plugin-styled-components": "^1.10.7",
    "babel-preset-vue": "^2.0.2",
    "better-npm-run": "^0.1.1",
    "clean-webpack-plugin": "^3.0.0",
    "eslint": "^6.7.2",
    "eslint-plugin-babel": "^5.3.1",
    "eslint-plugin-import": "^2.20.2",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^4.2.1",
    "eslint-plugin-standard": "^4.0.0",
    "eslint-plugin-vue": "^6.2.2",
    "http-server": "^0.12.3",
    "mockjs": "^1.1.0",
    "node-sass": "^4.12.0",
    "pre-commit": "^1.2.2",
    "sass-loader": "^8.0.2",
    "storybook-addon-jsx": "^7.3.1",
    "storybook-vue-router": "^1.0.7",
    "vue-loader": "^15.9.3",
    "vue-styled-components": "^1.5.1",
    "vue-template-compiler": "^2.6.11",
    "webpack": "^4.43.0",
    "webpack-build-dll-plugin": "^1.3.3",
    "webpack-bundle-analyzer": "^3.8.0",
    "webpack-cli": "^3.3.12"
  }
}

```

#### vue.config.js
```javascript

const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const path = require('path')
const env = process.env
const config = require('./src/config/index')

module.exports = {
  // 项目根路径
  publicPath: '/',
  productionSourceMap: env.NODE_ENV !== 'production',
  // 开发服务器
  devServer: {
    compress: true,
    disableHostCheck: true,
    port: 8081,
    proxy: {
      '/commonApi': {
        target: config.commonApiHost,
        // target: 'http://172.31.2.66:9000',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/commonApi': '/'
        }
      },
      '/api': {
        target: config.apiHost,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  },
  css: {
    sourceMap: env.NODE_ENV !== 'production',
  },
  configureWebpack: (config) => {
    if (env.NODE_ENV === 'production') {
      // dll优化
      config.plugins.push(new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require('./public/vendor/vendor-manifest.json')
      }))
      // 将打包出来文件动态引入index.html
      config.plugins.push(
        new AddAssetHtmlPlugin({
          // dll文件位置
          filepath: path.resolve(__dirname, './public/vendor/*.js'),
          // dll 引用路径
          publicPath: './vendor',
          // dll最终输出的目录
          outputPath: './vendor'
        })
      )
    }
  },

  chainWebpack: config => {
    if (env.ANALYZE) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  },
}

```

#### webpack.dll.config.js
```javascript
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// "clean-webpack-plugin": "^3.0.0"
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// dll文件存放的目录
const dllPath = 'public/vendor'

module.exports = {
  entry: {
    // 需要提取的库文件
    vendor: [
      'vue',
      'vue-router',
      'vuex',
      'axios',
      'core-js',
      'immer',
      'vue-styled-components',
      'babel-polyfill',
      'ant-design-vue/lib',
    ]
  },
  output: {
    path: path.join(__dirname, dllPath),
    filename: '[name].dll.js',
    // vendor.dll.js中暴露出的全局变量名
    // 保持与 webpack.DllPlugin 中名称一致
    library: '[name]_[hash]'
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin({
      root: path.join(__dirname, dllPath)
    }),
    // "clean-webpack-plugin": "^3.0.0"
    // new CleanWebpackPlugin(),
    // 设置环境变量
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与 output.library 中名称一致
      name: '[name]_[hash]',
      context: process.cwd()
    })
  ]
}

```

#### .eslintrc.js
```javascript
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  plugins: [
    'babel'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': isProd ? 1 : 0,
    'no-debugger': isProd ? 1 : 0,
    'no-unused-vars': isProd ? 2 : 1,
    'semi': [2, 'never'],
    'comma-dangle': [2, 'only-multiline'],
    'camelcase': 0,
    'babel/camelcase': 1,
    'babel/camelcase': 0,
  }
}

```

