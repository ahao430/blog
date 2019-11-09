# vue刷新页面

之前在项目中遇到过刷新页面的问题。直接location.href的话，状态丢失可以通过插件解决，白屏体验就不太好了。this.$router.go(0)也会白屏。当时想了一个办法是跳转到一个指定页面，在那个页面再跳转回来。今天看到有人用provide和reject来解决，体验很好。

## 实现
在app.vue的<router-view></router-view>加上v-if属性
````js
<router-view v-if="isRouterAlive"></router-view>

data () {
    return {
      isRouterAlive: true
    }
}

methods: {
  reload () {
    this.isRouterAlive = false
    this.$nextTick(function() {
        this.isRouterAlive = true
    })
  }
}
````
把这个函数 provide 出去
````js
provide () {
  return {
    reload: this.reload
  }
}
````

当我们需要刷新的时候，在需要的页面上加上这个函数就可以了
````js
inject: ['reload'],
````
在需要用到这个函数的地方去引用就行了
````js
refresh () {
  this.reload()
}
````