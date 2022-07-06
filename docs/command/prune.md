::: tip 提醒
因为该命令会造成文件的删除，所以执行前，要检查清楚各项配置是否正确
:::

# hlink prune

协助你同步管理硬链接和源文件。如果你还不清楚这个命令的作用，可以见[为什么会有 prune 命令?](../other/prune.md)

## 基础用法

```bash
hlink prune /path/to/config.mjs
```
配置详见：[配置文件说明](https://hlink.likun.me/command/#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E8%AF%B4%E6%98%8E)

## 命令行可选配置选项


### -r
> hlink prune -r /path/to/config.mjs

是否使用反向检测，默认不使用反向检测，则为正向检测。该选项的使用场景是：

- 正向检测：**删除的是硬链目录的文件**，修剪硬链目录比源目录多的文件
- 反向检测：**删除的是源目录的文件**，修剪源目录比硬链目录多的文件。

::: warning 重要提醒

1. 正向检测：一定要列全所有的源目录
2. 反向检测：一定要列全所有的硬链目录
:::

### -d
> hlink prune -d /path/to/config.mjs

是否删除文件及所在目录，默认只会删除文件

### -w
> hlink prune -w /path/to/config.mjs

删除前是否需确认? 默认需要确认。在GUI计划任务是无需确认的，所以开启计划任务前确认好

当然你也可以组合配置选项 `hlink -rdw /path/to/config.mjs`
