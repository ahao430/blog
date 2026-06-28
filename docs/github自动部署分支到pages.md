在代码根目录新建.github/workflows/目录，新建一个任意名称后缀yml的文件。

内容如下：

```yaml
name: CI
on:
  push:
    branches:
    - main  # 这里是要自动部署的分支名，有提交的时候就会触发action
jobs:
  job:
    name: Deployment
    runs-on: macos-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      # setup node
      - name: Setup Node.js
        uses: actions/setup-node@v3 
        with:
          node-version: 16.16.0

      # setup pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        id: pnpm-install
        with:
          version: 7
          run_install: false

      # cache
      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      # cache fail and install dependencies
      - name: Install dependencies
        if: steps.pnpm-cache.outputs.cache-hit != 'true'
        run: |
          pnpm install

      - name: Build
        run: pnpm run build  # build命令

      - name: upload production artifacts
        uses: actions/upload-pages-artifact@v1
        with:
          path: dist  # build之后要部署的打包目录

      # deploy
      - name: Deploy Page To Release
        id: deployment
        uses: actions/deploy-pages@v1
```

基本注意下分支名就行。把这个代码提交到main分支，github检测到这个目录就会自动执行yml文件了。这里会自动部署到gh-pages分支，也会开启pages，什么都不用做。

稍等片刻，直接去 ${用户名}.github.io/${项目名}/查看就行了。也可以在github项目的setting->pages找到路径。

