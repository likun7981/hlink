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
  hlink prune sourceDir1,sourceDir2 destDir1,destDir2
  ${chalk.gray('# 修剪多余硬链并删除所在目录')}
  hlink prune -p sourceDir1,sourceDir2 destDir1,destDir2
  ${chalk.gray('# 修剪时无需确认，一般使用于计划任务')}
  hlink prune -w sourceDir1,sourceDir2 destDir1,destDir2

可配置选项:
  --pruneDir,-p        是否删除文件及所在目录，默认只会删除文件
                       ${chalk.gray('如果你指定了该选项则会删除文件及所在目录')}

  --withoutConfirm,-w  删除前是否需确认? 默认需要确认。
                       ${chalk.gray('如果你使用计划任务，建议设置为无需确认')}
                       ${chalk.gray(
                         'Windows Git Bash不支持提示，所以会直接删除，执行前确认好'
                       )}

  --includeExtname,-i  检测包含的后缀名，同hlink --help中的includeExtname一样
  --excludeExtname,-e  检测排除的后缀名，同hlink --help中的excludeExtname一样

  --reverse,-r         检测方向，默认是正向检测，如果你指定了该选项则会是反向检测
                       ${chalk.gray(`1. 正向检测：删除的是硬链目录的文件，修剪硬链目录比源目录多的文件。
                       ${chalk.cyan('注意：正向检测一定要列全所有的源目录')}
                       2. 反向检测：删除的是源目录的文件，修剪源目录比硬链目录多的文件。
                       ${chalk.cyan(
                         '注意：反向检测一定要列全所有的硬链目录，hlink会帮你排除缓存的文件'
                       )}`)}
`
