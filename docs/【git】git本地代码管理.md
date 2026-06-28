之前使用git都是pull和push，对commit没有整理，合并提交到线上后，commit记录比较杂乱。对commit进行整理后再提交，可以更清晰的查看代码。



## 前期准备
+ 一个在线关卡式的学习网址：[链接](https://learngitbranching.js.org/?locale=zh_CN&from=timeline)，可以学习git的各项命令。
+ 一个git commit的包：[git cz](https://www.npmjs.com/package/git-cz)。使用它代替git commit命令，可以规范commit。
+ 使用vscode查看git分支历史

## 分支管理
+ 本地分支留一个个人的dev分支，其他的删掉
+ 每次新的需求创建临时的feature分支或fix分支
+ 开发完成后，将所有feature分支合并到个人dev分支，再合并项目dev分支去推送远程，管理员拉取后再合并到master分支更新。

## commit管理
+ 对当前未推送的commit记录，可以通过git rebase -i进行编辑（调整顺序，合并等）
+ 可以通过git cherry-pick挑选指定commit复制到当前分支
+ 可以通过git commit --amend来修改之前的提交
+ 对于同一个分支合作时别人提交了代码，可以通过git fetch先拉取，然后git rebase -i调整顺序，再通过git commit --amend来修改提交
+ 可以通过git checkout切换到某个位置，再在这里创建分支
+ 通过git rebase合并本地分支代码，可以合并commit记录，更加清晰。

## 常用git命令说明
+ git add .

添加全部当前修改

+ git commit -m [xxx]

提交commit

+ git merge

合并代码

+ git pull

拉取远程代码并合并

+ git fetch

拉取远程代码

+ git push

推送

+ git tag -a <tagname> -m <desc>

在当前位置或指定节点创建一个tag

+ git tag -d <tagname>

删除本地tag

+ git push origin --delete <tagname>
+ git checkout [branch/hash/HEAD^]

切换到需要的分支或commit节点

+ git branch

查看当前所有分支

+ git branch -f [branch]

修改分支当前指向位置到其他分支

+ git branch -D [branch]

删除本地分支

+ git branch -m [old branch] [new barnch]

修改分支名称

+ git cherry-pick [hash1 hash2 ...]

选择指定节点合并到当前分支

+ git rebase [branch]

将当前分支移动到指定分支之后。不要在公共分支使用。

+ git rebase -i [HEAD~number]

打开一个编辑器，展示当前节点向上指定次数的commit。可以调整顺序及合并，关闭编辑器保存修改。

+ git stash/git stash pop

通过git stash暂存本地修改，git stash pop还原

+ git reset [hash]

撤销提交

+ git revert [hash]

撤销提交，与reset不同的是创建了一个新的commit用于还原之前的commit。

