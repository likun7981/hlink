import chalk from 'chalk'

export default `
QQ反馈群号：${chalk.cyanBright('807101297')}

用法:
  hlink prune /path/to/source1,/path/to/source2 /path/to/dest1,/path/to/dest2

说明:
  详细说明见 https://github.com/likun7981/hlink/blob/master/docs/prune.md

注意:
  因为我们采用 ${chalk.cyan(',(英文逗号)')} 来进行多项输入。
  所以你的路径一定不要包含 ${chalk.cyan(',(英文逗号)')}。
  否则会导致未知错误，后果自负~

用法:
  ${chalk.gray('# 修剪多余硬链文件')}
  $ hlink prune sourceDir1,sourceDir2 destDir1,destDir2
  ${chalk.gray('# 修剪多余硬链并删除所在目录')}
  $ hlink prune -p sourceDir1,sourceDir2 destDir1,destDir2
  ${chalk.gray('# 修剪时无需确认，一般使用于计划任务')}
  $ hlink prune -w sourceDir1,sourceDir2 destDir1,destDir2

可配置选项:
  --pruneDir,-p        是否删除硬链文件及所在目录。
                       如果给了这个选项则会 否则只会删除 硬链文件

  --withoutConfirm,-w  删除前是否需确认? 默认需要确认。
                       如果你使用计划任务，建议设置为无需确认
  --includeExtname,i   检测包含的后缀名，同hlink --help中的includeExtname一样
  --excludeExtname,e   检测排除的后缀名，同hlink --help中的excludeExtname一样
`
