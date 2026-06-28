## 创建仓库
1. 创建仓库

创建了四个仓库，分别命名活动总仓库，vue分仓库，react分仓库，gulp分仓库。

2. 执行git submodule进行组织

拉取总仓库代码，在终端中执行git submodule命令，添加分仓库git submodule add xxx 。

这样就将分仓库关联进来了。主仓库提交代码不会影响分仓库。



第一次拉取总仓库时，带上递归参数可以同步拉取分仓库。

```bash
git clone xxx --recurse-submodules
```

也可以先拉取总仓库，然后执行命令获取分仓库：

```bash
git submodule init 
git submodule update
```

## 使用monorepo+yarn组织子项目，共享依赖
monorepo的理念是将多个项目放在一个git仓库中进行管理。

这样复制代码，共享组件等操作都更加方便；并且代码都在一起更易维护。进一步地，通过共享node_modules，可以做到安装一次依赖，后续再创建子项目可以立刻使用，节约时间和磁盘空间。

我们通过lerna + yarn来管理。

lerna是一个Lerna 是一个管理工具，用于管理包含多个软件包（package）的 JavaScript 项目。这里我们暂时不管理npm仓库，只用lerna初始化一下项目。

可以看到生成了一个lerna.json配置文件，以及一个packages目录。

yarn支持workspace，可以管理monorepo。我们在package.json中开启private: true，就能开启workspace特性。配置workspaces: ['packages/*]，将packages下面的所有目录当做子项目workspace。

在packages目录用create react app创建一个项目，删除node_modules，将package.json中的依赖提到根目录的package.json，执行yarn install。在根路径执行yarn install会进行两件事，一是安装依赖包，二是重新构建workspace关系。当子路径被构建为workspace时，就会生成一个软链接，在子项目中import包时，实际上是指向根目录，这样我们就实现了共享依赖包。

![](https://cdn.nlark.com/yuque/0/2021/png/373268/1630318684241-7df23fac-c6ef-4cce-83e9-ae877f34ef48.png)  
当我们创建多个类似的项目时，只需要复制一个子项目，稍加改造，再yarn install一下即可。yarn install的时候，还会在node_modules中生成当前项目的链接，这样，我们就可以用一个子项目作为公用组件库。引用的时候按照npm包引入即可。

![](https://cdn.nlark.com/yuque/0/2021/png/373268/1630318913142-59049c56-8a3e-4a1b-8b4d-c392777baa38.png)

这个目录是按照子项目package.json中的名字生成的。按照约定，用“@仓库名/子项目名”来命名。

![](https://cdn.nlark.com/yuque/0/2021/png/373268/1630319000626-9716ada0-4986-4e08-8374-0d29d233e207.png)

要执行子项目脚本时，直接在根路径用yarn workspace命令执行即可。

yarn workspace @mono/class_router_demo run start

这条命令就会执行class_router_demo子项目的start命令。

