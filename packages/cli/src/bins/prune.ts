import { IPruneOptions, prune as hlinkPrune } from '@hlink/core'
import chalk from 'chalk'
import { config } from '@hlink/core'
import { ICliOptions } from '../types'

const helpTxt = `
QQ反馈群号：${chalk.cyanBright('807101297')}

用法:
  hlink prune [--option] [/path/to/config]

说明:
  详细说明见 https://hlink.likun.me/command/prune.html

用法:
  ${chalk.gray('# 修剪多余硬链文件')}
  hlink prune ~/hlink.config.mjs
  ${chalk.gray('# 修剪多余硬链并删除所在目录')}
  hlink prune -d ~/hlink.config.mjs
  ${chalk.gray('# 修剪时无需确认，一般使用于计划任务')}
  hlink prune -w ~/hlink.config.mjs
  ${chalk.gray('# 你也可以组合选项')}
  hlink prune -wdr ~/hlink.config.mjs

可配置选项:
  --deleteDir,-d       是否删除文件及所在目录，默认只会删除文件
                       ${chalk.gray('如果你指定了该选项则会删除文件及所在目录')}

  --withoutConfirm,-w  删除前是否需确认? 默认需要确认。
                       ${chalk.gray('如果你使用计划任务，建议设置为无需确认')}
                       ${chalk.gray(
                         'Windows Git Bash不支持提示，所以会直接删除，执行前确认好'
                       )}

  --reverse,-r         检测方向，默认是正向检测，如果你指定了该选项则会是反向检测
`

interface IOptions
  extends ICliOptions,
    Pick<IPruneOptions, 'deleteDir' | 'withoutConfirm' | 'reverse'> {}

async function prune(options: IOptions) {
  const { configPath, help, ...other } = options
  if (help) {
    console.log(helpTxt)
    return
  }
  const configResult = await config.get(configPath)
  hlinkPrune({
    ...configResult,
    ...other,
  })
}

export default prune
