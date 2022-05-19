import chalk from 'chalk'
import chokidar from 'chokidar'
import { checkPathExist, log } from '../../utils.js'
import { rmAll } from './rm.js'

async function watch(dir: string, delAll: boolean) {
  if (!dir) {
    log.error('必须指定监听文件或者目录')
    console.log()
    process.exit(0)
  }
  log.warn(`监听模式为 ${chalk.cyan('测试功能')}，请慎重使用，如果造成误删，无法恢复!!`)
  log.info('开始监听删除', chalk.cyan(dir))
  global.printOnExit = () => {
    log.warn('停止监听', chalk.gray(dir))
  }
  checkPathExist(dir)
  let paths: string[] = []
  let timeoutHandle: NodeJS.Timeout
  log.info(
    `开始监听文件删除动作，你可以使用 ${chalk.cyan('Ctrl + C')} 退出监听`
  )
  chokidar.watch(dir).on('unlink', p => {
    paths.push(p)
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
    timeoutHandle = setTimeout(async () => {
      try {
        await rmAll(paths, delAll)
        paths = []
      } catch (e) {
        console.log(e)
      }
    }, 10)
  })
}

export default watch
