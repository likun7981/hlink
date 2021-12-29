import { fileRecordConfig } from './config/paths'
import chokidar from 'chokidar'
import { log } from './utils'
import checkPathExist from './utils/checkPathExist'
import path from 'path'
import { deleteRecord, findFiles } from './config/fileRecord'
import execa from 'execa'
import deleteEmptyDir from './utils/deleteEmptyDir'

async function watch(dir: string) {
  const allRecord = fileRecordConfig.read()
  // const status = await fs.stat(dir)
  // if (!status.isDirectory()) {
  //   log.error(chalk.cyan(dir), '必须是一个目录')
  //   process.exit(0)
  // }
  if (dir) {
    dir = path.resolve(dir)
    checkPathExist(dir)
  }
  const allFiles = allRecord.reduce(
    (result, record) => result.concat(record.files),
    [] as string[]
  )
  if (!allFiles.length && !dir) {
    log.error('没有创建记录, 无法监听')
    process.exit(0)
  }
  let paths: string[] = []
  let timeoutHandle: NodeJS.Timeout
  chokidar.watch(dir || allFiles).on('unlink', p => {
    paths.push(p)
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
    timeoutHandle = setTimeout(async () => {
      try {
        const needDelete = findFiles(paths).filter(f => paths.indexOf(f) === -1)
        await execa('rm', ['-r', ...needDelete])
        await Promise.all(
          needDelete.concat(paths).map(async f => {
            await deleteEmptyDir(path.dirname(f))
          })
        )
        deleteRecord(paths)
        paths = []
      } catch (e) {
        console.log(e)
      }
    }, 10)
  })
}

export default watch
