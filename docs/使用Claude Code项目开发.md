## AI IDE vs AI CLI
从Cursor开始，各种AI IDE层出不穷，且已经达到了生产力级别。各家的AI IDE都是基于VSCode改造，接入claude等大模型编程。

然后Anthropic公司推出了claude code，开启了AI IDE。后面open ai和谷歌也跟上，分别开发了codex和gemini cli。

既然有了AI IDE，为何又要推出Cli形式的工具呢？尤其是cursor和claude code都是基于claude大模型。

| | 优势 | 劣势 |
| --- | --- | --- |
| IDE | 符合操作习惯，上手快；<br/>代码补全； | 强绑定IDE |
| CLI | 终端运行，可以搭配任意IDE使用；<br/>CLI 形态天然适合自动化、脚本化、CI 集成、远程/无 GUI 环境；<br/>企业侧在安全、合规、权限管理上更容易集成； | 需要学习上手；<br/>不支持代码补全； |


claude是目前最好的编程大模型，而claude code是Anthropic官方出品，对于claude的能力调教的更好。claude code新推出的子agents、skills等能力就很强。



目前还有一个问题，就是cursor、trae等一些列AI IDE都是基于claude优化，而Anthropic反华的态度，目前国产IDE已经全部禁止使用claude，Trae目前改用GPT5.1，还在优化中。而在国内使用Cursor等很麻烦，且很容易封号。

## Claude Code + 国产大模型配置
现在Claude Code + 国产大模型是一个比较好的选择。目前国产编程模型的能力已经赶上，GLM4.6, Minmax M2, qwen3 coder，deepseek V3.2等编程能力都开始追上，GLM4.6大家普遍感受在实际项目中达到了claude3.7水平。另外国产大模型性价比很高。

### 智谱GLM4.6购买
在智谱官网可以购买GLM，现在有限时特惠套餐很划算。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1765632876962-4c3b6135-d499-4efc-ac97-4962b6823396.png)

可以使用下面我的邀请链接购买：[https://www.bigmodel.cn/claude-code?ic=RMI7WCFXQE](https://www.bigmodel.cn/claude-code?ic=RMI7WCFXQE)。选择lite套餐，连续包季或者包年，购买后取消自动续费。到期之后换个账号再购买。从邀请链接进入还可以减10%，包年173。

购买后在个人中心创建令牌，然后就可以在claude code配置使用了，智谱的教程链接：[https://docs.bigmodel.cn/cn/coding-plan/tool/claude](https://docs.bigmodel.cn/cn/coding-plan/tool/claude)。智谱适配了claude code、codex、gemini cli三种调用。

在claude code要配置apikey是[https://open.bigmodel.cn/api/anthropic](https://open.bigmodel.cn/api/anthropic)，配置api key是刚刚创建的令牌。不过这里先不急，我们用cc switch一键配置。

### CC Switch安装配置
cc switch是一个开源的图像化工具，支持了claude code、codex、gemini cli三种工具的配置切换，可以为每一个工具添加多个账号配置，然后一键切换配置。

介绍：[https://github.com/farion1231/cc-switch/blob/main/README_ZH.md](https://github.com/farion1231/cc-switch/blob/main/README_ZH.md)

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1765633414432-29982007-e580-4b8c-bce2-3d4aae575b52.png)

下载地址：[https://github.com/farion1231/cc-switch/releases](https://github.com/farion1231/cc-switch/releases)

这里在claude code添加配置时，预设供应商包含智谱，我们直接选择Zhipu GLM, 发现除了api key都填好了，填入api key保存即可。

此时，我们就可以在终端中输入claude打开claude code界面。如果询问claude code，可以得到回答当前的大模型是GLM。



这里我们还可以添加更多配置，切换使用。比如有一些公益站提供免费的模型（不稳定），还有一些中转站可以买到claude、gpt等等。



另外cc switch右上方几个按钮，还支持全局给三个工具设置claude skills（这个只有claude code有）、提示词、mcp服务器。我们点击mcp服务器，添加，有自定义，同样还有几个预设的mcp，我们可以一键添加context7和sequential-thinking。

### VSCode安装Claude Code插件
我们此时已经可以在任意终端使用claude code了，但是如果想要在IDE中便捷实用，官方也提供了VSCode和Jetbrains的插件。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1765634108180-bf6bf010-561e-4a39-9d4d-de9eecc3fd72.png)

当然这个插件仅仅是以聊天窗口的形式帮助我们启动终端对话，本质上还是调用终端。因此跟IDE的交互能力有限，不支持代码补全。

在终端中可以用命令关联到IDE，插件可以省略这一步。可以感知到当前聚焦的文件，以及光标选中的代码，对话的时候还是可以方便一些。

当我们在cc switch中切换配置，需要关闭插件窗口，重新打开。

cc switch可以设置同步配置到claude code插件。

![](https://cdn.nlark.com/yuque/0/2025/png/373268/1765763315107-a84d23d0-916f-486a-92d7-cf5498cf88e4.png)

## Claude Code使用
官方介绍文档：[https://code.claude.com/docs/zh-CN/quickstart](https://code.claude.com/docs/zh-CN/quickstart)

B站的一套视频教程：[https://www.bilibili.com/video/BV19p26BQEhV/?spm_id_from=333.337.search-card.all.click](https://www.bilibili.com/video/BV19p26BQEhV/?spm_id_from=333.337.search-card.all.click)

这里我简单的介绍一下claude code的使用。

### 启动claude code
在终端中，需要在项目根路径，执行claude命令。在IDE中，可以直接在项目中点击插件图标打开对话窗口。

### 计划模式
可以在会话期间使用 Shift+Tab 循环切换权限模式来切换到计划模式。

计划模式指示 Claude 通过使用只读操作分析代码库来创建计划，非常适合探索代码库、规划复杂更改或安全地审查代码。



### CLAUDE.md
在您的仓库根目录创建一个 `CLAUDE.md` 文件来定义代码风格指南、审查标准、项目特定规则和首选模式。此文件指导 Claude 对您的项目标准的理解。

可以通过/init命令创建CLAUDE.md。

### 对话管理
claude code通过对话开始工作。

当会话上下文太长，响应慢。可以通过/compact压缩对话。

打开claude窗口，可以通过/resume， 选择恢复之前的对话，继续。

### 其他/命令
+ /mcp 管理mcp
+ /memory 编辑CLAUDE.md内存文件
+ /model 切换模型
+ /agents 管理子agent
+ /clear 清除对话历史
+ /add-dir 添加额外的工作目录
+ /hooks 钩子

### SKILLs
Agent Skills 将专业知识打包成可发现的功能。每个 Skill 包含一个 `SKILL.md` 文件，其中包含 Claude 在相关时读取的说明，以及可选的支持文件，如脚本和模板。

```markdown
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

Skills 如何被调用：Skills 是模型调用的——Claude 根据您的请求和 Skill 的描述自主决定何时使用它们。这与斜杠命令不同，斜杠命令是用户调用的（您显式输入 `/command` 来触发它们）。

这有点类似mcp，都是模型自己调用。区别是，MCP是外部能力，类似一个接口。而skills是内部封装的任务级能力， 写法是一个markdown文件， 包含提示词及逻辑代码。  


