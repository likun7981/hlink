import chalk from 'chalk'
import confirm from '@inquirer/confirm'
import { log, checkPathExist, createTimeLog, rmFiles } from '../../utils.js'
import deleteEmptyDir from './deleteEmptyDir.js'
import { deleteRecord, findFilesFromRecord } from '../../config/recordHelp.js'
import { getList } from '../../core/get.js'

const timeLog = createTimeLog()
async function rm(fileOrDir: string, delAll: boolean) {
  if (delAll) {
    const answer = await confirm({
      message: '该命令会删除源文件，删除后无法恢复，确认是否继续',
      default: false
    })
    if (!answer) {
      log.info('已取消删除!')
      process.exit(0)
    }
  }
  if (!fileOrDir) {
    log.error('必须指定删除的目录或者文件')
    console.log()
    process.exit(0)
  }
  checkPathExist(fileOrDir)
  timeLog.start()
  log.info('开始删除任务', chalk.cyan(fileOrDir))
  const { inodes } = getList(fileOrDir)

  const deleteLen = await rmAll(inodes, delAll)

  if (!!deleteLen) {
    log.info('共计删除相关文件', deleteLen, '个')
  } else {
    log.warn('没有找到相关的硬链')
  }
  timeLog.end()
  if (!delAll) {
    log.info(`如果你需要同时删除源文件和硬链，你可以使用 ${chalk.cyan('hlink rm -a /path/to/delete')}`)
  }
}

export const rmAll = async (fileOrInode: string[], delAll: boolean) => {
  log.info('开始查找需要删除的文件...')
  const {
    files: needDeleteFiles,
    inodes: needDeleteRecord
  } = findFilesFromRecord(fileOrInode, delAll)
  const task: any[] = []
  log.info('共计', chalk.cyan(needDeleteFiles.length), '个文件需要删除')
  if (needDeleteFiles.length) {
    task.push(rmFiles(needDeleteFiles))
    task.push(deleteRecord(needDeleteRecord))
  }
  // 删除文件和记录
  await Promise.all(task)

  // 删除空文件夹
  await deleteEmptyDir(needDeleteFiles)
  needDeleteFiles.forEach(file => {
    log.info('删除', chalk.gray(file))
  })
  return needDeleteFiles.length
}

export default rm
