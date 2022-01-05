import chalk from "chalk";

export default `
QQ反馈群号：${chalk.cyanBright('807101297')}

用法:
  $ hlink [--Options] [sourceDir] destPath

子命令:
  ${chalk.gray('备份hlink目录缓存等 备份路径')}
  $ hlink backup /path/to/back
  ${chalk.gray('还原hlink目录缓存等 还原路径')}
  $ hlink restore /path/to/restore
  ${chalk.gray('移除命令查看帮助')}
  $ hlink rm --help

可配置选项:
  --saveMode,-s         保存模式,默认为模式0
                        ${chalk.gray(`saveMode=1 保存一级目录
                        saveMode=0 保存原有的相对源地址的路径`)}

  --includeExtname,-i   包含的扩展名,多个用','隔开
                        ${chalk.gray(`如果不配置该项,会采用以下策略
                        1. 配置了excludeExtnam,则链接文件为排除后的其他文件
                        2. 未配置excludeExtname,则链接文件为目录下的所有文件`)}

  --excludeExtname,-e   排除的扩展名,多个用','隔开如果配置了${chalk.cyan(
    'includeExtname'
  )}则该配置无效

  --mkdirIfSingle,-m    是否为独立文件创建同名文件夹,默认为true,会创建

  --openCache,-o        是否打开缓存,默认为true, 会打开
                        ${chalk.gray('打开后,每次硬链后会把对应文件存入缓存,就算下次删除硬链，也不会进行硬链')}

  --configPath,-c       指定配置文件路径,请使用绝对路径
  --generateConfig,-g   生成config文件,可以使用 hlink -g 查看路径
  --removeConfig,-r     删除配置文件

例子:
  ${chalk.grey('# 创建 /share/download 下面文件到目标地址 /share/movie')}
  $ hlink /share/download /share/movie
  ${chalk.grey(
    '# 删除 /share/download 中文件在 /share/movie 下面的对应硬链的文件'
  )}
  $ hlink -d /share/download /share/movie
  ${chalk.grey('# 交互删除(推荐)')}
  $ hlink -d
  ${chalk.grey('# 生成配置文件')}
  $ hlink -g`
