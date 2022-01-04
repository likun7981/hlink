import chokidar from 'chokidar'
import { checkPathExist, log } from '../../utils.js'
import { rmAll } from './rm.js'

async function watch(dir: string, deleteSource: boolean = false) {
  if (!dir) {
    log.error('必须指定监听文件或者目录')
    console.log()
    process.exit(0)
  }
  checkPathExist(dir)
  let paths: string[] = []
  let timeoutHandle: NodeJS.Timeout
  chokidar.watch(dir).on('unlink', p => {
    paths.push(p)
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
    timeoutHandle = setTimeout(async () => {
      try {
        await rmAll(paths, deleteSource)
        paths = []
      } catch (e) {
        console.log(e)
      }
    }, 10)
  })
}

export default watch
