import chalk from 'chalk'
import {
  log,
  checkPathExist,
  createTimeLog,
  rmFiles,
} from '../../utils.js'
import deleteEmptyDir from './deleteEmptyDir.js'
import { deleteRecord, findFilesFromRecord } from '../../config/recordHelp.js'
import { getList } from '../../core/get.js'

const timeLog = createTimeLog()
async function rm(fileOrDir: string, deleteSource: boolean = true) {
  if (!fileOrDir) {
    log.error('必须指定移除的目录或者文件')
    console.log()
    process.exit(0)
  }
  checkPathExist(fileOrDir)
  timeLog.start()
  log.info('开始删除任务', chalk.cyan(fileOrDir))
  const { inodes } = getList(fileOrDir)

  const deleteLen = await rmAll(inodes, deleteSource)

  if (!!deleteLen) {
    log.info('共计删除相关文件', deleteLen, '个')
  } else {
    log.warn('没有找到相关的硬链')
  }
  timeLog.end()
}

export const rmAll = async (fileOrInode: string[], deleteSource?: boolean) => {
  log.info('开始查找需要删除的文件...')
  const {
    files: needDeleteFiles,
    inodes: needDeleteRecord
  } = findFilesFromRecord(fileOrInode, deleteSource)
  const task: any[] = []
  log.info('共计', chalk.cyan(needDeleteFiles.length), '个文件需要删除')
  if (needDeleteFiles.length) {
    task.push(rmFiles(needDeleteFiles))
    task.push(deleteRecord(needDeleteRecord))
  }
  // 删除文件和记录
  await Promise.all(task)

  // 移除空文件夹
  await deleteEmptyDir(needDeleteFiles)
  needDeleteFiles.forEach((file) => {
    log.info('移除', chalk.gray(file))
  })
  return needDeleteFiles.length
}

export default rm
