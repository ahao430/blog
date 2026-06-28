# ahao430/blog — 部署与同步说明

> `README.md` 是**自动生成的博客目录**（每次语雀同步后由 `tools/build-readme.cjs` 刷新）。本文件记录部署 / 同步原理，供维护参考。

由 [Elog](https://github.com/Lete114/elog) 从 **语雀** 自动同步、再用 **Hexo** 构建发布到 GitHub Pages 的博客。

- **写作平台**：语雀 · 账号密码模式（`login = ahao430`，知识库 `repo = zsnfd6`）
- **同步**：`sync.yml`，GitHub Actions 定时（每 6 小时）+ 手动
- **发布**：`deploy.yml`，sync 完成后自动构建 Hexo → `gh-pages`
- **访问**：https://ahao430.github.io/blog

> 不需要语雀 Token / 超级会员 —— 用账号密码登录语雀后拉取文档。

## 目录结构

```
.
├── docs/                       # 语雀同步出来的 markdown（原始，无 frontmatter）
├── source/_posts/              # 构建期由 tools/prepare-posts.cjs 生成（gitignore，不入库）
├── scaffolds/                  # Hexo 文章 / 页面模板
├── tools/
│   ├── build-readme.cjs        # 生成 README 博客目录
│   └── prepare-posts.cjs       # docs/ → source/_posts/（注入 frontmatter + {% raw %}）
├── .github/workflows/
│   ├── sync.yml                # 定时同步语雀 + 刷新 README
│   └── deploy.yml              # 构建 Hexo → 发布 gh-pages（sync 后自动触发）
├── _config.yml                 # Hexo 站点配置（url / root=/blog/）
├── _config.landscape.yml       # 主题配置
├── package.json                # Hexo 依赖
├── elog.config.json            # Elog 配置
├── elog.cache.json             # Elog 缓存（文档元数据，用于生成目录 / frontmatter）
├── .elog.env.example           # 本地运行环境变量模板
├── README.md                   # 自动生成的博客目录（勿手改）
└── DEPLOY.md                   # 本文件
```

## 工作原理

**同步（sync.yml · 每 6 小时 / 手动）：**
1. 安装 Elog → 用 `YUQUE_USERNAME` / `YUQUE_PASSWORD` 登录语雀
2. 拉取知识库 `zsnfd6` → 写入 `docs/*.md`，更新 `elog.cache.json`
3. `tools/build-readme.cjs` 刷新 `README.md` 目录
4. commit & push 回 master

**发布（deploy.yml · sync 完成后自动触发 / 手动）：**
5. `tools/prepare-posts.cjs` 把 `docs/` 注入 frontmatter + `{% raw %}` 包裹 → `source/_posts/`
6. `hexo generate` 生成静态站到 `public/`
7. 推送 `public/` 到 `gh-pages` 分支 → GitHub Pages 更新

> master 上的 README + docs 保持原样，构建产物只进独立的 gh-pages 分支。

## GitHub Pages 设置

仓库 **Settings → Pages**：Source = **Deploy from a branch** → 分支 `gh-pages` / `/ (root)`。（旧 VuePress 时期多半已是此设置，确认即可；若 Pages 不显示，看本仓库 Actions 里 `deploy.yml` 是否跑过。）

## 所需 GitHub Secrets

在 **Settings → Secrets and variables → Actions → New repository secret**：

| Name | 值 |
|------|----|
| `YUQUE_USERNAME` | 语雀账号（手机号，11 位纯数字） |
| `YUQUE_PASSWORD` | 语雀登录密码（若从未设置，先在语雀「账户设置」里设一个） |

## 本地运行（可选）

```bash
cp .elog.env.example .elog.env   # 填入账号密码
npm install -g @elog/cli
elog sync                         # 同步语雀 → docs/，更新 elog.cache.json
node tools/build-readme.cjs       # 刷新 README.md 目录
npm ci                            # 装 Hexo 依赖
node tools/prepare-posts.cjs      # 生成 source/_posts/
npx hexo server                   # 本地预览 http://localhost:4000/blog/
```

## 路线图

- [x] **Phase 1**：Elog 定时同步语雀 → Markdown（`docs/`）+ 自动生成 README 目录
- [x] **Phase 2**：Hexo 构建发布到 GitHub Pages（`gh-pages` 分支）
