::: tip 提醒
因为该命令会造成文件的删除，所以执行前，要检查清楚各项配置是否正确
:::
# hlink prune

协助你同步管理硬链接和源文件。如果你还不清楚这个命令的作用，可以见[为什么会有prune命令?](../other/prune.md)

## 基础用法

无任何配置项的情况 **hlink** 默认会检测常用的视频格式`mp4,flv,f4v,webm,m4v,mov,cpk,dirac,3gp,3g2,rm,rmvb,wmv,avi,asf,mpg,mpeg,mpe,vob,mkv,ram,qt,fli,flc,mod,iso`

多项路径，请使用`,`隔开。

::: warning 重要提醒
因为路径多项使用了`,`隔开，所以你的源路径和目标路径，一定不要包含`,`。否则会出错
:::

```bash
hlink prune 源路径1,源路径2 目标路径1,目标路径2
```

## 配置选项
::: tip 提醒
注意目前 **prune** 不会读取配置文件，只能通过命令行指定配置项
:::

### reverse
是否使用反向检测，默认不使用反向检测，则为正向检测。该选项的使用场景是：

- 正向检测：**删除的是硬链目录的文件**，修剪硬链目录比源目录多的文件
- 反向检测：**删除的是源目录的文件**，修剪源目录比硬链目录多的文件。

::: warning 重要提醒
1. 正向检测：一定要列全所有的源目录
2. 反向检测：一定要列全所有的硬链目录
:::

### includeExtname(即将废弃)
> 多项使用`,`隔开

白名单模式，需要包含的文件后缀，如果你需要使用黑名单模式，则不要指定该选项，同时需要删除配置文件中的`includeExtname`。
```bash
hlink prune -i=mkv /path/to/source /path/to/dest
```

### include(即将上线)
> 替换includeExtname，使用场景更多，详情见[#issue12](https://github.com/likun7981/hlink/issues/12)

### excludeExtname(即将废弃)
> 多项使用`,`隔开


黑名单模式，需要排除的文件后缀，如果指定了`includeExtname`，则该配置无效。
```bash
hlink prune -e=txt,info /path/to/source /path/to/dest
```

### exclude(即将上线)
> 替换excludeExtname，使用场景更多，详情见[#issue12](https://github.com/likun7981/hlink/issues/12)

