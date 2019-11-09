# nvm版本管理

最近为了看vue3源码更新了node到12版本，很多老项目的运行会报错，需要删掉node_modules再重新install才行，干脆就装了个nvm来切换node版本。

windows版本的下载地址如下：[https://github.com/coreybutler/nvm-windows/releases]()

我下的是setup的安装包，安装之后环境变量都配置好了。不然需要手动配置下NVM_HOME 和 NVM_SYMLINK两个环境变量，以及在path添加%NVM_HOME%和%NVM_SYMLINK%。

## node版本安装
因为我本地已经有node12，所以安装的时候就直接提示我导入了。
可以通过````nvm list````查看当前的node版本。
通过````nvm list available````来查看可下载的node版本，再通过````nvm install 版本号````来安装指定版本。
最后，通过````nvm use 版本号````来选择要使用的版本。
通过````node -v````发现，切换版本成功。