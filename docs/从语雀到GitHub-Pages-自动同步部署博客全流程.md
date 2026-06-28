## 项目背景

一直用语雀写笔记和技术文档，但语雀的公开分享体验一般，也没有独立域名。于是搭建了一套自动化流水线：语雀写作 → Elog 同步 → GitHub Actions → Hexo 构建 → GitHub Pages 发布，全程自动，零成本。

源码仓库：[github.com/ahao430/blog](https://github.com/ahao430/blog)

线上博客：[blog.ahao430.site](https://blog.ahao430.site)

语雀知识库：[yuque.com/ahao430/zsnfd6](https://www.yuque.com/ahao430/zsnfd6)

## 整体架构

[图：架构流程图 - 语雀 → Elog → GitHub Actions → Hexo → GitHub Pages]

```
语雀写作 ──(Elog 定时同步)──> GitHub 仓库 master 分支
                                     │
                              docs/*.md + README 目录
                                     │
                          (GitHub Actions 自动触发)
                                     │
                           Hexo + Butterfly 构建
                                     │
                           强制推送到 gh-pages 分支
                                     │
                          GitHub Pages + 自定义域名
```

两个 GitHub Actions 工作流各司其职：

| 工作流 | 触发方式 | 职责 |
|--------|---------|------|
| **Sync Yuque** | 定时（每 6 小时）/ 手动 | Elog 同步语雀 → `docs/`，刷新 README 目录 |
| **Deploy Hexo** | Sync 完成后自动 / git tag `deploy-*` / 手动 | 注入 frontmatter → Hexo 构建 → 推送 gh-pages |

## 第一步：Elog 同步语雀

### 为什么选 Elog

[Elog](https://github.com/Lete114/elog) 是一个开源的多平台写作同步工具，支持语雀、Notion、飞书等。选它的原因：

- **账号密码模式**：不需要语雀 Token（Token 需要超级会员），直接用账号密码登录
- **CLI 友好**：`elog sync` 一条命令搞定
- **缓存机制**：通过 `elog.cache.json` 记录文档元数据（标题、更新时间、分类），后续构建 frontmatter 全靠它

### 配置

`elog.config.json`：

```json
{
  "write": {
    "platform": "yuque-pwd",
    "yuque-pwd": {
      "host": "https://www.yuque.com",
      "login": "ahao430",
      "repo": "zsnfd6",
      "onlyPublic": false,
      "onlyPublished": true
    }
  },
  "deploy": {
    "platform": "local",
    "local": {
      "outputDir": "docs",
      "filename": "title"
    }
  }
}
```

关键配置说明：
- `onlyPublished: true`：只同步已发布的文档，草稿不同步
- `outputDir: "docs"`：同步到仓库的 `docs/` 目录
- `filename: "title"`：用文档标题作为文件名

### GitHub Actions 定时同步

`sync.yml` 每 6 小时运行一次：

```yaml
on:
  schedule:
    - cron: '17 */6 * * *'
  workflow_dispatch:
```

分钟选 `17` 而不是 `0`，是 GitHub Actions 的一个小技巧：避开整点高峰，减少排队等待时间。

语雀的账号密码通过 GitHub Secrets 传入：

```yaml
- name: Sync from Yuque
  env:
    YUQUE_USERNAME: ${{ secrets.YUQUE_USERNAME }}
    YUQUE_PASSWORD: ${{ secrets.YUQUE_PASSWORD }}
  run: elog sync
```

同步完成后，`tools/build-readme.cjs` 读取 `elog.cache.json` 中的元数据，自动生成包含 72 篇文章目录的 `README.md`。

> 参考：[Elog 文档](https://elog.1874.cool/)

## 第二步：Hexo 构建 + frontmatter 注入

### 为什么不在语雀文档里写 frontmatter

语雀的 Markdown 编辑器不支持 YAML frontmatter，而且手动维护 72 篇文章的 frontmatter 不现实。解决思路是：**构建期自动注入**。

### prepare-posts 脚本

`tools/prepare-posts.cjs` 在 Hexo 构建前运行，核心逻辑：

1. 读取 `elog.cache.json`，获取每篇文章的标题、日期、分类
2. 从 `docs/` 读取原始 Markdown
3. 自动拼接 frontmatter（title、date、updated、categories）
4. 输出到 `source/_posts/`

```javascript
fm = [
  '---',
  `title: ${q(title)}`,
  `date: ${q(date)}`,
  `updated: ${q(updated)}`,
  `categories: [${cats}]`,
  '---',
].filter(Boolean).join('\n');
```

### Nunjucks 模板冲突问题

> 这是整个项目踩过最深的坑。

Hexo 使用 [Nunjucks](https://mozilla.github.io/nunjucks/) 作为模板引擎，它会处理 `{{ }}` 和 `{% %}` 语法。而我的语雀文档中有大量小程序模板代码，恰好使用了相同的语法：

```html
<!-- 小程序 WXML 中的变量绑定，与 Nunjucks 冲突 -->
<view style="transform: scale({{scale}});">
<view a:if="{{action === 'a'}}">
```

**踩坑一：`{% raw %}` 导致 Markdown 完全不渲染**

最初的做法是用 `{% raw %}...{% endraw %}` 包裹整个正文，防止 Nunjucks 误解析。结果发现 Hexo 8.x 中，`{% raw %}` 会阻止内置 Markdown 渲染器的执行，导致：

- `![](image-url)` → 输出原始语法，不渲染为 `<img>` 标签
- `## 标题` → 输出原始语法，不渲染为 `<h2>` 标签
- 所有 Markdown 格式全部失效

**最终方案：占位符转义 + 后处理还原**

在 `prepare-posts.cjs` 中用不会与 Markdown 冲突的 Unicode 字符做占位符：

```javascript
body = body
  .replace(/{{/g, '‹‹')
  .replace(/}}/g, '››')
  .replace(/{%/g, '‹%')
  .replace(/%}/g, '%›');
```

Hexo 构建完成后，通过 `after_render:html` filter 还原：

```javascript
// scripts/escape-restore.js
hexo.extend.filter.register('after_render:html', function (str) {
  return str
    .replace(/‹‹/g, '{{')
    .replace(/››/g, '}}')
    .replace(/‹%/g, '{%')
    .replace(/%›/g, '%}');
});
```

选择 `‹›`（单引号角括号，U+2039/U+203A）的原因是它们不会被 Markdown 或 HTML 编码器转义，能原样保留到最终 HTML 中。

## 第三步：Butterfly 主题 + Utterances 评论

### 主题选择

最初用的是 Hexo 默认的 Landscape 主题，功能较基础。换到了 [Butterfly](https://butterfly.js.org/)，理由：

- 开箱即用的暗黑模式
- 丰富的侧边栏组件
- 内置多种评论系统支持
- 活跃的社区维护

配置了导航菜单连接 GitHub 和语雀：

```yaml
menu:
  Home: / || fas fa-home
  Archives: /archives || fas fa-archive
  GitHub: https://github.com/ahao430/blog || fab fa-github
  语雀: https://www.yuque.com/ahao430/zsnfd6 || fas fa-book
```

### Utterances 评论

[Utterances](https://utteranc.es/) 是一个基于 GitHub Issues 的轻量评论系统：

- 无需数据库、无需登录
- 评论数据存储在仓库的 Issues 中
- 支持暗黑模式切换

Butterfly 中只需一行配置：

```yaml
utterances:
  repo: ahao430/blog
  issue_term: pathname
  light_theme: github-light
  dark_theme: photon-dark
```

> 注意：需要在仓库 Settings → General → Features 中开启 Issues。

## 第四步：自定义域名

[图：GitHub Pages 自定义域名设置页面截图位置]

### DNS 配置

域名托管在 Cloudflare，添加一条 CNAME 记录：

| 类型 | 名称 | 目标 |
|------|------|------|
| CNAME | blog | ahao430.github.io |

**不要开启 Cloudflare 代理（橙色云朵）**，否则 GitHub 无法正确识别自定义域名，导致 HTTPS 证书签发失败。

### 域名验证

GitHub Pages 要求在账号级别验证域名所有权：

1. GitHub → Settings → Pages → Add a domain → 输入 `blog.ahao430.site`
2. 按提示添加 TXT 记录：`_github-pages-challenge-ahao430.blog.ahao430.site`
3. 等待 DNS 生效后完成验证
4. 回到仓库 Settings → Pages → Custom domain 填入域名

验证通过后，GitHub 会自动签发 Let's Encrypt 证书（约 5-10 分钟），然后勾选 Enforce HTTPS。

> 参考：[Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)

### CNAME 文件

Hexo 的 `source/CNAME` 文件会在每次构建时复制到 `public/CNAME`，随部署推到 gh-pages 分支，确保自定义域名配置不丢失。

## 第五步：语雀图片防盗链处理

[图：语雀 CDN Referer 防盗链导致的 403 截图位置]

语雀的图片托管在 `cdn.nlark.com`，这个 CDN 做了 **Referer 防盗链**：

| 请求来源 | HTTP 状态 |
|---------|----------|
| 无 Referer | 200 OK |
| Referer: `www.yuque.com` | 200 OK |
| Referer: `blog.ahao430.site` | **403 Forbidden** |

浏览器在加载图片时会自动带上当前页面的 Referer，导致从博客域名访问时图片全部 403。

解决方案：在 HTML `<head>` 中添加 `<meta name="referrer" content="no-referrer">`。

在 Butterfly 主题中通过 `inject.head` 实现：

```yaml
inject:
  head:
    - <meta name="referrer" content="no-referrer">
```

这样浏览器在加载图片时不发送 Referer，语雀 CDN 就不会拦截。

## 第六步：主题覆盖导致 0 字节页面

> 另一个让人排查了好一阵的问题。

为注入 referrer meta 标签，最初尝试了在 `themes/landscape/layout/_partial/head.ejs` 中创建局部覆盖文件。结果 Hexo 检测到本地 `themes/landscape/` 目录后，认为整个主题都在本地，不再去 `node_modules/` 中加载，而本地只放了一个 `head.ejs` 文件，缺少 `layout.ejs`、`index.ejs` 等主要模板。

后果：所有页面生成时报 "No layout" 警告，`index.html` 为 0 字节，网站白屏。

教训：覆盖主题文件要复制完整主题，或者用 Hexo 的 filter/injector API 注入内容。

## 工作流触发优化

为了方便调试，在 deploy 工作流中增加了 git tag 触发：

```yaml
on:
  workflow_run:
    workflows: ['Sync Yuque']
    types: [completed]
  workflow_dispatch:
  push:
    tags:
      - 'deploy-*'
```

推送 `deploy-v*` 标签即可触发部署，不需要在 GitHub 网页上手动点按钮：

```bash
git tag deploy-v4 && git push origin deploy-v4
```

> 注意：push tag 事件需要额外的 condition 判断，因为 `workflow_run.conclusion` 只在 `workflow_run` 事件中存在。

## 项目依赖一览

| 工具 | 用途 | 链接 |
|------|------|------|
| Elog | 语雀同步 | [github.com/Lete114/elog](https://github.com/Lete114/elog) |
| Hexo 8.x | 静态站点生成 | [hexo.io](https://hexo.io/) |
| hexo-theme-butterfly | 博客主题 | [butterfly.js.org](https://butterfly.js.org/) |
| hexo-renderer-marked | Markdown 渲染 | [github.com/hexojs/hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked) |
| Utterances | 评论系统 | [utteranc.es](https://utteranc.es/) |
| GitHub Actions | CI/CD | [docs.github.com/actions](https://docs.github.com/en/actions) |
| GitHub Pages | 静态托管 | [pages.github.com](https://pages.github.com/) |
| Cloudflare | DNS 托管 | [cloudflare.com](https://www.cloudflare.com/) |

## 总结

这套方案实现了「语雀写 → 自动同步 → 自动构建 → 自定义域名发布」的全自动化闭环，成本和维护负担都很低：

- **内容管理**：继续用语雀熟悉的编辑器
- **同步**：无需手动操作，每 6 小时自动同步
- **发布**：同步完成后自动部署
- **成本**：零（GitHub Pages 免费、Cloudflare DNS 免费、Elog 开源）
- **维护**：新增文章无需任何额外操作

后续计划：接入 Algolia 搜索、优化移动端阅读体验。
