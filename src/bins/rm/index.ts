import helpText from './help.js'
import watchMode from './watch.js'
import rm from './rm.js'
import { log } from '../../utils.js'
import chalk from 'chalk'
import path from 'path'

type Inputs = string[]

type Flags = Pick<IHlink.Flags, 'watch' | 'help' | 'all'>

export default (inputs: Inputs, flags: Flags) => {
  const [_path] = inputs
  const { help, watch, all } = flags
  if (help) {
    console.log(helpText)
    return
  }
  const absolutePath = path.resolve(_path)
  if (watch) {
    log.info('开始监听移除', chalk.cyan(absolutePath))
    log.info('当前移除模式:', chalk.magenta(all ? '移除硬链及源文件' : '只移除硬链'))
    global.printOnExit = () => {
      log.warn('停止监听', chalk.gray(absolutePath))
    }
    watchMode(absolutePath, all)
  } else {
    rm(absolutePath, all)
  }
}
