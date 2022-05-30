# hlink

## 基础用法

为`/path/to/source`目录下的所有满足要求的文件，创建硬链接输出到`/path/to/dest`

无任何配置项的情况 **hlink** 默认会硬链常用的视频格式`mp4,flv,f4v,webm,m4v,mov,cpk,dirac,3gp,3g2,rm,rmvb,wmv,avi,asf,mpg,mpeg,mpe,vob,mkv,ram,qt,fli,flc,mod,iso`

```zsh
hlink /path/to/source /path/to/dest
```

## 配置文件(推荐)

作者推荐，使用配置文件来进行配置各个选项，这样配置可以持久化。命令使用也更简单，只需要`hlink -c /path/to/hlink.config.mjs`就可以完成硬链接生成
### 生成配置文件

使用以下命令
```bash
hlink -g /path/to/outputDir
```
如果没有指定`outputDir`，则默认**用户目录**生成。可以通过 `echo ~` 查看用户目录的具体路径
```
echo ~
/User/root
```

### 使用配置文件

使用以下命令读取配置文件
```bash
hlink -c /path/to/hlink.config.mjs
```
如果没有指定`hlink.config.mjs`的路径，则默认会读取**用户目录**下面的`hlink.config.mjs`

### 配置文件说明

通过 `vim ~/hlink.config.mjs`可以进行编辑，默认内容如下
```js
// 重要说明路径地址都请填写 绝对路径！！！！
export default {
  /**
   * 源地址
   */
  source: '',
  /**
   * 目标地址
   */
  dest: '',
  /**
   * 指定了该选项则是 白名单模式
   * 该配置项优先级大于excludeExtname
   * 如果你需要使用excludeExtname请删除该配置项
   */
  includeExtname: ['mp4', 'flv', 'f4v', 'webm',
    'm4v', 'mov', 'cpk', 'dirac',
    '3gp', '3g2', 'rm', 'rmvb',
    'wmv', 'avi', 'asf', 'mpg',
    'mpeg', 'mpe', 'vob', 'mkv',
    'ram', 'qt', 'fli', 'flc', 'mod', 'iso'],
  /**
   * 指定了该选项则是 黑名单模式
   * 需要排除的后缀名, 如果配置了includeExtname则该配置无效
   */
  excludeExtname: [],
  /**
   * 0：保持原有的目录结构
   * 1：只保存一级目录结构
   * 默认为 0
   * 例子：
   *  - 源地址目录为：/a
   *  - 目标地址目录为: /d
   *  - 链接的文件地址为 /a/b/c/z/y/mv.mkv；
   *  如果保存模式为0 生成的硬链地址为: /d/b/c/z/y/mv.mkv
   *  如果保存模式为1 生成的硬链地址为：/d/y/mv.mkv
   */
  saveMode: 0,
  /**
   * 是否打开缓存，默认关闭
   *
   * 打开后，每次硬链后会把对应文件存入缓存，就算下次删除硬链，也不会进行硬链
   */
  openCache: false,
  /**
   * 是否为独立文件创建同名文件夹，默认创建
   */
  mkdirIfSingle: true,
}
```

::: warning 重要提醒
对于**威联通** root用户在生成机器重启后，用户目录会被还原，生成的配置文件会被清除。建议威联通用户不要用root用户，自建一个用户来使用
:::




## 命令行指定配置

作者不推荐使用命令行直接指定选项，使用起来太麻烦，后续计划丢弃命令行直接指定配置选项。如果你有多个不一样的配置，可以使用`hlink -c /path/to/hlink.config.mjs`，来使用指定的配置文件

::: info 说明
命令行配置选项和配置文件配置选项里面同样的效果，如果在命令里面指定了配置选项，则**优先会读取配置选项的**
:::


### saveMode
> 硬链的保存模式

可选值
* 0：保持原有的目录结构(这个是默认值)
* 1：只保存一级目录结构


举例说明：
* 源地址目录为 `/a`
* 目标地址目录为 `/d`
* 链接的文件地址为 `/a/b/c/z/y/mv.mkv`
  * 如果保存模式为0 生成的硬链地址为: `/d/b/c/z/y/mv.mkv`
  *  如果保存模式为1 生成的硬链地址为：`/d/y/mv.mkv`
```bash
hlink -s=1 /path/to/source /path/to/dest
```

### includeExtname(即将废弃)
> 同配置文件效果一样，唯一的区别是这里多项使用`,`隔开，配置文件为数组

白名单模式，需要包含的文件后缀，如果你需要使用黑名单模式，则不要指定该选项，同时需要删除配置文件中的`includeExtname`。
```bash
hlink -i=mkv /path/to/source /path/to/dest
```

### include(即将上线)
> 替换includeExtname，使用场景更多，详情见[#issue12](https://github.com/likun7981/hlink/issues/12)

### excludeExtname(即将废弃)
> 与配置文件唯一的区别是这里多项使用`,`隔开，配置文件为数组

黑名单模式，需要排除的文件后缀，如果指定了`includeExtname`，则该配置无效。
```bash
hlink -e=txt,info /path/to/source /path/to/dest
```
### exclude(即将上线)
> 替换excludeExtname，使用场景更多，详情见[#issue12](https://github.com/likun7981/hlink/issues/12)



### openCache
> 是否开启硬链缓存，默认不会开启

详细说下这个配置，这个配置与`hlink`的重复检测不是一个东西，希望大家不要误解。该配置的作用只有下面这样一个：

比如某些保种的文件硬链到电影目录，但是你主动删除了电影目录硬链接，并且你下次不希望它再次被硬链过去，那么你就可以开启该配置项

```bash
hlink -o /path/to/source /path/to/dest
```

### mkdirIfSingle
> 是否为独立文件创建同名文件夹，默认 会创建

```bash
hlink -m=false /path/to/source /path/to/dest
```
