# 常见问题

## 1. 如何在Windows上使用hlink

请下载[gitforwindows](https://gitforwindows.org/) 安装时记得带上`git bash`，即可以正常使用`hlink`。Windows自带的powershell和cmd不支持

## 2. 可以跨盘和跨共享文件夹使用吗
> 报错关键字`Invalid cross-device link`

不行，这个是系统的限制，`hlink` 底层还是使用的系统 `ln` 命令来进行硬链接的创建。最简单就是自己使用 `ln 源文件 目标文件` 来尝试(ln注意必须是文件)，如果系统命令都出错了，那hlink也就不行了。

## 3. hlink 支持的nodejs版本？
> 报错关键字`supported by the default ESM loader`

`14.14` 或者 `>=16`，建议直接装最新的lts版本。[如何管理nodejs版本?](../install/nodejs.md)

## 4. 没有执行权限
> 报错关键字`Operation not permitted`

可以尝试使用`sudo hlink`来执行

## 5. 目标地址存在同名文件
> 报错关键字`File exists`

尝试删除目标地址同名文件，重试
