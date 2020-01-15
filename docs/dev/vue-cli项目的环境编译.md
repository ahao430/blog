# vue-cli项目的环境编译

要将vue项目部署到两个不同的环境，其中域名等变量不一样。如果是自己配置的vue，当然可以通过cross-env来在命令中插入环境变量。但是vue-cli的编译命令并不是node命令，而是vue-cli-service命令，这时可以通过--mode参数来添加环境变量。

#### .env配置文件
在根目录中新建几个配置文件，用于设置环境变量。然后在命令中使用。
这里我新建了四个配置文件，分别是.env.dev-test, .env.dev-prod, .env.build-test, .env.build-prod。
````
# .env.dev-test
NODE_ENV=development
VUE_APP_ENV=test

# .env.dev-test
NODE_ENV=development
VUE_APP_ENV=prod

# .env.dev-test
NODE_ENV=production
VUE_APP_ENV=test

# .env.dev-test
NODE_ENV=production
VUE_APP_ENV=prod
````
虽然原先的serve和build命令会设置NODE_ENV，但是使用--mode后，这个参数会丢失，因此需要再写一次。

#### 配置命令--mode
配置package.json命令如下：
````json
{
  "scripts": {
    "start": "vue-cli-service serve --mode dev-test",
    "serve": "vue-cli-service serve --mode dev-test",
    "dev": "vue-cli-service serve --mode dev-test",
    "dev:test": "vue-cli-service serve --mode dev-test",
    "dev:prod": "vue-cli-service serve --mode dev-prod",
    "build": "vue-cli-service build --mode build-prod",
    "build:test": "vue-cli-service build --mode build-test",
    "build:prod": "vue-cli-service build --mode build-prod"
  }
}
````
这样不同的命令会携带不同的环境变量。
在项目配置文件中，通过process.env.VUE_APP_ENV命令，来判断环境是test还是prod。