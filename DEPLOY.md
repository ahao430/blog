# ahao430/blog — 部署与同步说明

> 仓库的 `README.md` 是**自动生成的博客目录**（每次语雀同步后由 `scripts/build-readme.cjs` 刷新）。本文件记录部署 / 同步原理，供维护参考。

由 [Elog](https://github.com/Lete114/elog) 从 **语雀** 自动同步的博客内容仓库。

- **写作平台**：语雀 · 账号密码模式（`login = ahao430`，知识库 `repo = zsnfd6`）
- **同步方式**：GitHub Actions 定时（每 6 小时）+ 支持手动触发
- **文档目录**：`docs/`（每次同步由 Elog 重新生成）
- **README 目录**：同步后由 `scripts/build-readme.cjs` 自动生成

> 不需要语雀 Token / 超级会员 —— 用账号密码登录语雀后拉取文档。

## 目录结构

```
.
├── docs/                       # Elog 同步出来的 markdown 文档
├── scripts/
│   └── build-readme.cjs        # 根据 elog.cache.json 生成 README 目录
├── .github/workflows/
│   └── sync.yml                # 定时「同步 + 生成目录」工作流
├── elog.config.json            # Elog 配置
├── elog.cache.json             # Elog 增量同步缓存（含文档元数据，用于生成目录）
├── .elog.env.example           # 本地运行用的环境变量模板
├── README.md                   # 自动生成的博客目录（勿手改）
└── DEPLOY.md                   # 本文件
```

## 工作原理

1. 定时（或手动）触发 `sync.yml`
2. 安装 Elog → 用 `YUQUE_USERNAME` / `YUQUE_PASSWORD` 登录语雀
3. 拉取知识库 `zsnfd6` 的文档 → 写入 `docs/*.md`，并更新 `elog.cache.json`
4. 运行 `scripts/build-readme.cjs` → 刷新 `README.md` 目录
5. 自动 commit & push 回本仓库

## 所需 GitHub Secrets

在仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加：

| Name | 值 |
|------|----|
| `YUQUE_USERNAME` | 语雀账号（手机号，11 位纯数字） |
| `YUQUE_PASSWORD` | 语雀登录密码（若从未设置，先在语雀「账户设置」里设一个） |

## 本地运行（可选）

```bash
cp .elog.env.example .elog.env   # 填入账号密码
npm install -g @elog/cli
elog sync                         # 同步语雀 → docs/，更新 elog.cache.json
node scripts/build-readme.cjs     # 刷新 README.md 目录
```

## 路线图

- [x] **Phase 1**：Elog 定时同步语雀 → Markdown（`docs/`）+ 自动生成 README 目录
- [ ] **Phase 2**：接入 Hexo，构建并发布到 GitHub Pages
