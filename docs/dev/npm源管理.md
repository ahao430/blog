# npm源管理
因为中国大陆下载npm包会经常失败，并且下载速度很慢，所以之前一直都用淘宝的镜像。虽然cnpm也不错，但更多时候还是直接把npm的源设置为淘宝的源更方便一些。

## cnpm
````shell
npm install -g cnpm
````

## 淘宝npm镜像
````shell
npm config set registry https://registry.npm.taobao.org
````

## nrm
刚刚发现有一个新的包叫做nrm，可以方便的管理npm源。
````shell
npm install -g nrm
nrm ls
nrm use cnpm
````
