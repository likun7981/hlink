import chalk from 'chalk'
import { main, IOptions as IMainOptions } from '@hlink/core'
import { ICliOptions } from '../types'
import getConfig from '../getConfig.js'

const helpTxt = `
QQ反馈群号：${chalk.cyanBright('807101297')}

用法:
  hlink [--options] [/path/to/config]

子命令:
  ${chalk.gray('备份hlink目录缓存等 备份路径')}
  hlink backup /path/to/back
  ${chalk.gray('还原hlink目录缓存等 还原路径')}
  hlink restore /path/to/restore
  ${chalk.gray('生成配置文件')}
  hlink gen /path/to/gen
  ${chalk.gray('prune命令查看帮助')}
  hlink prune --help

可配置选项:
  --keepDirStruct,-k    是否保持原有目录结构，默认保持

  --openCache,-o        是否打开缓存，默认为不打开
                        ${chalk.gray(
                          '打开后,每次硬链后会把对应文件存入缓存,就算下次删除硬链，也不会进行硬链'
                        )}
例子:
  ${chalk.grey('# 不给配置文件路劲，则默认会读取~/hlink.config.mjs')}
  hlink
`

interface IOptions extends ICliOptions, Pick<IMainOptions, 'openCache'> {}

async function hlink(options: IOptions) {
  const { configPath, help, ...other } = options
  if (help) {
    console.log(helpTxt)
    return
  }
  const config = await getConfig<IMainOptions>(configPath)
  main({
    ...config,
    ...other,
  })
}

export default hlink
