# ahao430/blog

由 [Elog](https://github.com/Lete114/elog) 从 **语雀** 自动同步的博客内容仓库。

- **写作平台**：语雀 · 账号密码模式（`login = ahao430`，知识库 `repo = zsnfd6`）
- **同步方式**：GitHub Actions 定时（每 6 小时）+ 支持手动触发
- **文档目录**：`docs/`（每次同步由 Elog 重新生成）

> 不需要语雀 Token / 超级会员 —— 用账号密码登录语雀后拉取文档。

## 目录结构

```
.
├── docs/                  # Elog 同步出来的 markdown 文档
├── .github/workflows/
│   └── sync.yml           # 定时同步工作流
├── elog.config.json       # Elog 配置
├── .elog.env.example      # 本地运行用的环境变量模板
└── README.md
```

## 工作原理

1. 定时（或手动）触发 `sync.yml`
2. 安装 Elog → 用 `YUQUE_USERNAME` / `YUQUE_PASSWORD` 登录语雀
3. 拉取知识库 `zsnfd6` 的文档 → 写入 `docs/*.md`
4. 自动 commit & push 回本仓库

## 所需 GitHub Secrets

在仓库 **Settings → Secrets and variables → Actions → New repository secret** 添加：

| Name | 值 |
|------|----|
| `YUQUE_USERNAME` | 语雀账号（手机号） |
| `YUQUE_PASSWORD` | 语雀登录密码（若从未设置，先在语雀「账户设置」里设一个） |

## 本地运行（可选）

```bash
cp .elog.env.example .elog.env   # 填入账号密码
npm install -g @elog/cli
elog sync
```

## 路线图

- [x] **Phase 1**：Elog 定时同步语雀 → Markdown（`docs/`）
- [ ] **Phase 2**：接入 Hexo，构建并发布到 GitHub Pages
