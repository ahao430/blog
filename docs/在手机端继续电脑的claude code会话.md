平时在电脑上用 Claude Code 做开发时，一个很自然的需求是：人不在电脑前时，能不能在手机上继续和它交互，让任务不中断。

实际做下来会发现，这件事本身有两个前提问题：

+ Claude Code 的会话不能跨设备直接迁移
+ 手机和电脑之间缺少稳定的连接方式

---

# 一些尝试过但不太理想的方案
## 远程控制电脑
最直接的想法是用远程桌面。

实际体验下来问题很明显：

+ 手机屏幕太小，终端操作效率很低
+ 输入依赖强键盘场景，移动端很别扭
+ 本质还是在“远程操作一台桌面电脑”，而不是移动办公

这个方案更适合临时救急，不适合日常使用。

---

## 自己做一套会话同步系统
另一个方向是把 Claude Code 的会话做成可同步的服务：

+ 后端保存会话状态
+ 手机端做一个 UI
+ 双端实时同步

但很快会发现问题变复杂了：

+ 需要处理终端流式输出
+ 需要处理交互状态同步
+ 需要重新做一套移动端交互
+ 维护成本非常高

本质上是在重新造一个终端 + IDE。

---

# 更现实的方案：tmux + Tailscale
后来看到社区里一个更轻量的组合方式：

+ tmux 解决会话不断开的问题
+ Tailscale 解决设备之间的连接问题

没有改造 Claude Code，也没有引入新的系统，只是在基础设施层做了拼接。

---

# tmux：让会话不依赖当前连接
tmux 是一个终端复用工具，本质是把终端会话从 SSH 连接中剥离出来。

它解决的问题很直接：

SSH 断开后，进程和终端状态仍然保留。

也就是说，Claude Code 不再依赖“你是否在线”。

常用操作：

```bash
tmux new -s claude
```

创建一个会话。

---

```bash
Ctrl + B，然后按 D
```

将当前会话挂到后台。

---

```bash
tmux a -t claude
```

重新进入会话。

---

如果你想更系统地了解 tmux 的使用方式和配置，可以参考这篇整理：

[https://www.yuque.com/ahao430/zsnfd6/vx1u80byk06elvb9/edit](https://www.yuque.com/ahao430/zsnfd6/vx1u80byk06elvb9/edit)

里面对 session 管理、detach/attach 的说明比较完整，这里不重复展开。

---

# Tailscale：把设备变成一个局域网
Tailscale 解决的是另一个问题：设备之间怎么连。

它的方式是把所有设备拉进一个虚拟局域网。

官网：

[https://tailscale.com/](https://tailscale.com/)

下载客户端，配置完成后，每台设备都会有一个类似这样的 IP：

```plain
100.x.x.x
```

手机可以直接通过这个地址访问电脑，不需要公网 IP，也不需要端口转发。

![](https://cdn.nlark.com/yuque/0/2026/png/373268/1782618431509-42b768c1-e56e-4b9c-a8b4-f6f1ea2a9dd9.png)

---

# Termius：手机端 SSH 工具
手机上用的是 Termius 作为 SSH 客户端。

官网：

[https://termius.com/](https://termius.com/)

主要用来：

+ 管理 SSH 主机
+ 连接 Tailscale 内网 IP
+ 进入 tmux 会话

---

# 实际工作流
整体流程比较固定：

## 1. 在电脑上启动 tmux + Claude Code
```bash
# 创建一个新的tmux会话
tmux new -s claude # 这里的会话名称可以自己定义
# 在tmux会话中启动claude code
claude 
```

然后进行一些会话。

---

## 2. 将会话挂起
当我们准备在手机端继续，先隐藏会话。

```bash
Ctrl + B → D
```

此时 Claude Code 仍然在后台运行。

---

## 3. 手机通过 Tailscale 连接电脑
```bash
ssh user@100.x.x.x
```

这里是电脑的开机登录用户名。不记得的话，可以用<font style="color:rgba(0, 0, 0, 0.88);background-color:rgb(246, 247, 251);">whoami</font>命令查询。

---

## 4. 恢复会话
```bash
tmux a -t claude
```

会直接回到之前的 Claude Code 现场，包括上下文和运行状态。

---

# 实践中遇到的几个问题
## 无法连接机器
即使 Tailscale 正常，有时仍然 SSH 不通。

原因是 macOS 默认没有开启 SSH 服务。

在系统设置中打开：

通用 → 共享 → Remote Login

---

## Android Termius 中文输入问题
在 Android 上使用 Termius 时，曾遇到中文无法正常输入的问题，拉起的是自带的安全键盘，无法切换。

原因是 Termius 的安全输入模式限制了系统输入法行为。

解决方式是关闭系统安全键盘，找到手机系统设置-输入法设置-安全，关闭。

---

# 最终效果
![](https://cdn.nlark.com/yuque/0/2026/jpeg/373268/1782579133751-c8f3578d-9d94-4a97-ba9e-bc59a9eb89d3.jpeg)

整个链路跑通之后，实际体验变成：

+ 在电脑上启动 Claude Code
+ 手机随时 SSH 进入
+ tmux 保持会话不断
+ 可以随时继续同一个工作状态

---

# 总结
这套方案本身没有任何复杂设计，本质是三个工具的组合：

+ tmux 解决“会话不丢”
+ Tailscale 解决“设备互通”
+ SSH 提供入口

思路很简单：

不去改造 Claude Code，而是让它运行在一个可以随时接入的终端环境里。codex等其他终端也是一样的。

:::color4
唯一不习惯的就是，启动claude前要先启动tmux会话。但是习惯了之后，所有的会话都在一个tmux窗口管理会更加方便，可以熟悉下tmux的pane管理。

:::



