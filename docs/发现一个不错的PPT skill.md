让 AI 直接画一整套 PPT 的 skill。每一页都是一张 16:9 的图，由 `gpt-image-2` 生成，最后拼成 `.pptx`。

+ 仓库：[https://github.com/ningzimu/codex-ppt-skill](https://github.com/ningzimu/codex-ppt-skill)
+ 案例合集（Issue #34）：[https://github.com/ningzimu/codex-ppt-skill/issues/34](https://github.com/ningzimu/codex-ppt-skill/issues/34)
+ 在线图转可编辑 PPT（作者推荐）：[https://codia.ai/noteslide](https://codia.ai/noteslide)
+ WPS 在线图转可编辑（免费、PDF 中转）：[https://aippt.wps.cn/aippt/convert-ppt/home](https://aippt.wps.cn/aippt/convert-ppt/home)

## 安装
```bash
npx -y skills@latest add ningzimu/codex-ppt-skill \
  --skill codex-ppt --agent claude-code --global
```

需要在 `~/.codex-ppt-skill/.env` 配 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `CODEX_PPT_IMAGE_MODEL`。也可以直接用 Codex 内置出图。

## 用法
让模型读你的素材（论文、博客、笔记），它会先写 `outline.md` → 出一张样张确认风格 → 批量出图 → 拼装 `.pptx`。内置 10 种风格（极简、杂志、手绘、学术答辩、麦肯锡……）。

拿到的 `.pptx` 是**图片型**，能放不能改。要改字就走下面的图转可编辑工具。

## 图转可编辑：WPS 在线工具
地址：[https://aippt.wps.cn/aippt/convert-ppt/home](https://aippt.wps.cn/aippt/convert-ppt/home)

工作流：用 PowerPoint / Keynote / WPS 打开生成的 `.pptx` → 导出 PDF → 上传到这个工具 → 得到一份可编辑的 `.pptx`。

效果：**所有文字都变成了真实文本框**，可以直接改字、改字号、改颜色。版式还原也不错，国内访问稳定。

缺点：一刀切。模型画出来的某些艺术化文字（标题、装饰字）本来是好看的图片，转完之后也变成了普通可编辑文本，**审美会被拉平到模板水准**。所以如果原图本来就很满意，只是想改个别字，建议先用 codia（识别更克制），或者干脆本地 Pillow 贴字。

## 我做的改动：Cloudflare WAF 绕过
我自建的 `gpt-image-2` 反代前面挂了 Cloudflare。**网页版调没问题，从代码（OpenAI SDK）调必报 1010**。

根因：OpenAI SDK 会带一组 `X-Stainless-*` 指纹头和 `OpenAI/Python` 的 UA，正好命中 Cloudflare 的 bot 规则。

修法：在请求发出前剥掉这些头、改写 UA。我把这套封装成了独立的 `gpt-image` skill：

+ `~/.claude/skills/gpt-image/scripts/sitecustomize.py` 在 Python 启动时自动 monkey-patch `openai.OpenAI`。
+ shell wrapper 启动前 `export PYTHONPATH=scripts/`，用户无感。
+ 独立运行环境 `~/.gpt-image-skill/`，不依赖 codex-ppt 的配置。
+ 首次运行自动建 venv + 写/复制 `.env`。

codex-ppt 也可以直接复用这个 skill 当出图后端。

