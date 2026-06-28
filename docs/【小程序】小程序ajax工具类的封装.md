之前在小程序中封装了ajax工具，并对消息队列做了处理。但是其中很多业务代码混杂再其中，故对其进一步抽象化，将业务代码分离出来。

业务代码主要存在于request的请求和响应阶段，仿照axios做一个拦截器，将其中的业务代码通过拦截器传递进来执行。

## 改写为类
首先对Alipay工具类进行改造，将公用方法放到原型上，使用时新建一个实例。类的create方法接收一些全局参数，返回一个实例。

```javascript
class Alipay {
  constructor (option = {}) {
    // 入参
    this.baseURL = option.baseURL || ''
    this.timeout = option.timeout || 30000
    this.concurrency = option.concurrency || 6 // 并发请求数
    this.useMock = option.useMock
    // 内部状态
    this.locking = false
    this.lockQueue = []
    this.queue = []
    this.subQueue = []
    this.count = 0
  }

  static create (option) {
    return new Alipay(option)
  }
}

// 遍历队列，依次发出请求
Alipay.prototype.walk = function () {
}

// 收到请求，放到队列
Alipay.prototype.http = function (options = {}) {
}

Alipay.prototype.lock = function () {
}

Alipay.prototype.unlock = function () {
}

// 封装请求
Alipay.prototype.request = function (options) {
}

Alipay.prototype.get = function (options) {
}

Alipay.prototype.post = function (options) {
}

module.exports = Alipay

```

## 拦截器
然后新建一个Interceptor类。

```javascript
class Interceptor {
  constructor (option) {
    this.use = (cb = null, errCb = null) => {
      option.cb = cb
      option.errCb = errCb
    }
    this.eject = null
  }
}
```

在Alipay上添加interceptors属性，并在request时执行拦截器。

```javascript
class Alipay {
  constructor (option = {}) {
    this.requestConfig = {}
    this.responseConfig = {}
    this.interceptors = {
      request: new Interceptor(this.requestConfig),
      response: new Interceptor(this.responseConfig),
    }
  }
}

// 封装请求
Alipay.prototype.request = function (options) {
  const self = this
  
  options = {
    method: 'GET',
    data: {},
    headers: {},
    baseURL: self.baseURL,
    timeout: self.timeout,
    ...options,
  }

  return new Promise((resolve, reject) => {
    if (self.requestConfig.cb) {
      resolve(self.requestConfig.cb(options))
    } else {
      resolve(options)
    }
  })
    .then((options) => {
      const {
        route,
        url,
        baseURL,
        loading,
        subQueue,
        ...params
      } = options
      my.request({
        url: baseURL + url,
        ...params,
        success: (res) => {
          return new Promise((resolve2, reject2) => {
            if (self.responseConfig.cb) {
              resolve2(self.responseConfig.cb(res.data, options))
            } else {
              resolve2(res.data)
            }
          })
            .then(data => {
              resolve(data)
              self.count--
              self.walk()
            })
            .catch(err => {
              return new Promise((resolve3, reject3) => {
                if (self.responseConfig.errCb) {
                  resolve3(self.responseConfig.errCb(err, options))
                } else {
                  resolve3(err)
                }
              })
                .then(err => {
                  reject(err)
                  self.count--
                  self.walk()
                })
            })
        },
        fail: (err, options) => {
          return new Promise((resolve4, reject4) => {
            if (self.responseConfig.errCb) {
              resolve4(self.responseConfig.errCb(err, options))
            } else {
              resolve4(err)
            }
          })
            .then(err => {
              reject(err)
              self.count--
              self.walk()
            })
        }
      })
    })
    .catch(err => {
      return new Promise((resolve5, reject5) => {
        if (self.requestConfig.errCb) {
          resolve5(self.requestConfig.errCb(err, options))
        } else {
          resolve5(err)
        }
      })
        .then(err => {
          reject(err)
          self.count--
          self.walk()
        })
    })
}

```

这里其实axios存放的回调函数是一个数组，可以多次使用use方法，并能够用eject方法来取消。这里先偷个懒，暂时只接收一个。在业务代码中传入拦截器函数，然后Alipay中执行request时，如果有拦截器函数，会先执行，再去request；响应时也是先判断拦截器，再去执行后续操作。这样，就可以把业务代码分离到api文件中。

## 拦截器使用
将业务代码分离出来，写到这里。

```javascript
import { md5 } from '../libs/md5'
const Alipay = require('./Alipay')
const config = require('../config.js')

const instance = Alipay.create({
  useMock: false,
  baseURL: config.url,
  timeout: 30000,
  concurrency: 6,
})

instance.interceptors.request.use(
  config => {
    // 业务
    return config
  }
)

instance.interceptors.response.use(
  (response, config) => {
    // 业务
    return response
  },
  (err, config) => {
    console.log(err)
    // 业务
    return Promise.reject(err)
  }
)

module.exports = {
  lock () {
    return instance.lock()
  },
  unlock () {
    return instance.unlock()
  },

  /** ******首页接口start********/
  // 通过authCode获取uid
  getUid (options) {
    return instance.http({
      url: '/user/queryUid',
      method: 'GET',
      ...options
    })
  },
  // 埋点
  burydata (options) {
    return instance.http({
      url: '/hcz/burydata',
      baseURL: config.maidianUrl,
      method: 'POST',
      subQueue: true,
      ...options
    })
  },
	...
}

```

## 对原先阻塞队列的修改
有了类，我们可以生成多个alipay实例，这样原先的blockQueue就可以去掉了，lock时正常push，但是锁定当前实例所有请求。可以用另一个实例去发送需要的请求，返回时解锁原先实例。

这样就可以在中途锁定队列，修改token、uid之类的数据，而不用担心原先队列的请求发出。

```javascript
// api.js
const Alipay = require('./Alipay')
const config = require('../config.js')

const instance = Alipay.create({
  useMock: false,
  baseURL: config.url,
  timeout: 30000,
  concurrency: 6,
})

// 实例2用于lock时发送请求
const instance2 = Alipay.create({
  useMock: false,
  baseURL: config.url,
  timeout: 30000,
  concurrency: 6,
})

const requestInterceptorFunc = config => {
  // do sth
  return config
}
instance.interceptors.request.use(
  config => {
    // 预留，先判断token
    // 再走通用判断
    return requestInterceptorFunc(config)
  }
)
instance2.interceptors.request.use(
  requestInterceptorFunc
)

const responseInterceptorFunc = (response, config) => {
  // do sth
  return response
}
const responseInterceptorErrFunc = (err, config) => {
  // do sth
  return Promise.reject(err)
}
instance.interceptors.response.use(
  responseInterceptorFunc,
  responseInterceptorErrFunc,
)
instance2.interceptors.response.use(
  responseInterceptorFunc,
  responseInterceptorErrFunc,
)

const getInstance = {
  get (options) {
    options.method = 'GET'
    return getInstance.http(options)
  },
  post (options) {
    options.method = 'POST'
    return getInstance.http(options)
  },
  http (options) {
    const { useInstance2, ...others } = options
    if (options.useInstance2) {
      return instance2.http(others)
    } else {
      return instance.http(others)
    }
  },
}

module.exports = {
  lock () {
    return instance.lock()
  },
  unlock () {
    return instance.unlock()
  },

  /** ******首页接口start********/
  // 通过authCode获取uid
  getUid (options) {
    return getInstance.http({
      url: '/user/queryUid',
      method: 'GET',
      ...options
    })
  },
	...
}

```

```javascript
// app.js
const Api = require('./apis/Api')

App({
	onLaunch () {
    Api.lock()
    Promise.all([
      Api.getUid({ useInstance2: true }),
      Api.getMaiDian({ useInstance2: true }),
    ])
      .then((reses) => {
      	// do sth
        Api.unlock()
      })
      .catch(() => {
        // do sth
      })
  },
})

```



