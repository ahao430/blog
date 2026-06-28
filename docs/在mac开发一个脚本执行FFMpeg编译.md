项目中采用JSMpeg方案播放视频，需要用到FFMpeg转码。调研了市面上FFMpeg封装的应用，要么收费，要么配置不够，为了方便产品运营（避免以后转换视频的工作都落到自己头上），研究了下用bash写了个脚本，又用mac的command双击执行。

![](https://cdn.nlark.com/yuque/0/2023/gif/373268/1679027748629-88177202-02be-4251-9f90-ee95fa9b757d.gif)

## 1. FFMpeg命令
安装FFMpeg，配置环境变量。打开终端，执行FFMpeg命令编译视频。（这里我配置的环境变量可能有点问题，又在视频目录放了一份ffmpeg文件。）

JSMpeg所需要的命令如下：

```vue
ffmpeg -y -i in.mp4 -f mpegts -codec:v mpeg1video -codec:a mp2 out.ts
```

其中-i是指定输入文件，最后面是输出文件。-f mpegts -codec:v mpeg1video -codec:a mp2这个是JSMpeg指定的编码、视频、音频格式。-y是当输出文件已存在同名文件时，不要询问直接覆盖。此外，可以加参数指定分辨率，截取时长等。

如下面的b:v指定了码率，scale指定了分辨率。

```vue
ffmpeg -i in.mp4 -f mpegts -codec:v mpeg1video -b:v 3500k -vf scale=750:-1 -codec:a mp2 out.ts
```

下面的-ss指定了开始时间，-to指定了结束时间，还可以用-t指定时长，有-t时忽略-to。

```vue
ffmpeg -ss 00:00:00 -to 00:00:05 -i in.mp4 -f mpegts -codec:v mpeg1video -codec:a mp2 out1.ts
```

## 2. bash脚本编写
在当前目录新建一个compile.sh文件，编写如下，在当前目录终端执行bash compile.sh成功编译。

```bash
#!/bin/bash
cd "$(dirname "$0")"
ffmpeg -y -i in.mp4 -f mpegts -codec:v mpeg1video -codec:a mp2 out.ts
```

这里我想要批量编辑，把一个in目录的所有视频，编译到out目录。ffmpeg没有批量处理的命令，查了下bash遍历文件夹的命令，改成下面的样子。

```bash
#!/bin/bash

cd "$(dirname "$0")"

# 遍历in目录，执行FFMpeg命令编译文件，输出到out目录
function read_dir(){
for file in `ls $1` #注意此处这是两个反引号，表示运行系统命令
do
if [ -d $1"/"$file ] #注意此处之间一定要加上空格，否则会报错
then
read_dir $1"/"$file
else
ffmpeg -y -i $1"/"$file -f mpegts -codec:v mpeg1video -codec:a mp2 -b 0 "./out/"$file".ts"
fi
done
}
read_dir "./in"
```

每次执行完，都会自动关闭窗口，不方便看编译的信息。加一行交互命令，要求用户输入回车。

```bash
... 上面的内容

# 等待用户输入回车，再关闭窗口
read -s -n1 -p "Press any key to continue ... "
```

## 3. yaml配置
产品每段视频要裁剪的时长都不一样，想到做一个yaml配置文件，可以方便修改参数。

查询bash中读取yaml的方法，可以用grep命令来截取。bash的函数不能返回字符串，只能用一个公共变量去存值了。

```yaml
# 视频分辨率(scale 不置顶按照原文件宽高比缩放)
# width: 1920
# height: -1

# 视频码率（b:v）
# bv: 2500k

# 时间
# 开始时间，HH:MM:SS 或者秒数
from: 00:00:06
# 结束时间，HH:MM:SS 或者秒数
to: 00:00:08
# 持续时间，秒, 结束时间和持续时间同时设置，以持续时间为准
time: 0
```

```bash
#!/bin/bash

cd "$(dirname "$0")"

# 读取配置文件
function get_key(){
  # echo $1
  result=$(grep $1":" config.yaml | tail -n1);
  result=${result//*$1: /};
  echo $1": "$result
}

get_key "from"
from=$result

get_key "to"
to=$result

get_key "time"
time=$result

get_key "fps"
fps=$result

# 遍历in目录，执行FFMpeg命令编译文件，输出到out目录
function read_dir(){
for file in `ls $1` #注意此处这是两个反引号，表示运行系统命令
do
 if [ -d $1"/"$file ] #注意此处之间一定要加上空格，否则会报错
 then
   read_dir $1"/"$file
 else
   ffmpeg -y -ss $from -to $to -t $time -i $1"/"$file -f mpegts -codec:v mpeg1video -codec:a mp2 -b 0 "./out/"$file".ts"
 fi
 done
}
read_dir "./in"

# 等待用户输入回车，再关闭窗口
read -s -n1 -p "Press any key to continue ... "
```

## 4. command文件
最后将bash文件复制一下，重命名成.command文件，就可以双击运行了。

