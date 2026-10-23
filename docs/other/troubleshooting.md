# 常见问题

## 1. 如何在 Windows 上使用 hlink

请下载[gitforwindows](https://gitforwindows.org/) 安装时记得带上`git bash`，即可以正常使用`hlink`。Windows 自带的 powershell 和 cmd 不支持

## 2. 可以跨盘和跨共享文件夹使用吗

> 报错关键字`Invalid cross-device link`

不行，这个是系统的限制，`hlink` 底层还是使用的系统 `ln` 命令来进行硬链接的创建。最简单就是自己使用 `ln 源文件 目标文件` 来尝试(ln 注意必须是文件)，如果系统命令都出错了，那 hlink 也就不行了。

## 3. hlink 支持的 nodejs 版本？

> 报错关键字`supported by the default ESM loader`

当前分支使用 Node.js 24 LTS，最低版本为 `24.22.1`，建议使用最新的 24.x 补丁版。[如何管理 nodejs 版本?](../install/nodejs.md)

## 4. 没有执行权限

> 报错关键字`Operation not permitted`

可以尝试使用`sudo hlink`来执行

## 5. 目标地址存在同名文件

> 报错关键字`File exists`

尝试删除目标地址同名文件，重试
