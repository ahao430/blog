近期做了一个h5页面拼装demo项目，里面包含了前台、后台、简易服务端三个子项目。其中后台用iframe嵌套了前台h5页面做预览用，前后台又依赖服务端，每次启动都要依次运行三个服务。那么能否一次开启这三个服务呢？

## 需求分析
+ 需要在根目录中执行子目录的npm命令开启服务
+ 我们希望开启三个cmd窗口来监听，而非在一个窗口内，不然开发时调试信息就无法查看。
+ npm脚本是支持使用&&串联多个命令的。但是我们的目的是并行，而非依次执行。
+ 开发时启动监听服务，服务不会结束，不会走到下一个服务。

前两点可以通过使用shell脚本来解决。

## shell脚本
npm脚本中可以直接运行shell脚本。在项目根目录新建三个shell脚本，分别对应三个子项目。内容如下：

```shell
# startPC.sh
cd ./pc
npm run serve
```

```shell
# startH5.sh
cd ./h5
npm run serve
```

```shell
# startServer.sh
cd ./server
npm run start
wait
# 这里加个wait，防止窗口一闪就关闭了
```

再在package.json编辑命令如下：

```json
{
  "scripts": {
    "start": "startPC && startH5 && startServer",
    "startPC": "startPC.sh",
    "startH5": "startH5.sh",
    "startServer": "startServer.sh"
  }
}

```

实际运行发现，可以依次启动窗口，但是由于上一个窗口在监听，要手动结束服务，下一个窗口才会启动。

## 并行
通过安装concurrently包，可以实现并行效果。将package.json改为如下：

```json
{
  "scripts": {
    "start": "concurrently \"npm run startPC\" \"npm run startH5\" \"npm run startServer\"",
    "startPC": "startPC.sh",
    "startH5": "startH5.sh",
    "startServer": "startServer.sh"
  }
}

```

成功同时打开三个窗口执行。

## 
