### 1. 安装
直接运行brew install mysql报错。去[mysql.com](https://link.zhihu.com/?target=http%3A//mysql.com)下载社区版安装



### 2. 环境变量
```bash
cd ~
vi ~/.bash_profile
```

添加两行path：

```plain
export PATH=$PATH:/usr/locol/mysql/bin 
export PATH=$PATH:/usr/local/mysql/support-files
```

保存。

再执行source ~/.bash_profile



### 3. 处理node报错
在node中登录mysql报错，网上查询是因为mysql 8.0以后的版本采用了新的加密方式，而node还没有跟进。

解决方式是在终端中登录mysql：

```bash
mysql -u root -p
```



再输入以下命令，其中密码改成自己的：

```bash
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '密码';
flush privileges;
```

执行exit。重新登陆，发现新的密码生效了。

再去node执行mysql登录可以了。

