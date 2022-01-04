import chalk from 'chalk'
import {
  log,
  checkPathExist,
  createTimeLog,
  rmFiles,
  makeOnly
} from '../../utils.js'
import path from 'path'
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
  log.info('开始删除', chalk.cyan(fileOrDir))
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
  const {
    files: needDeleteFiles,
    inodes: needDeleteRecord
  } = findFilesFromRecord(fileOrInode, deleteSource)
  const task: any[] = []
  if (needDeleteFiles.length) {
    task.push(rmFiles(needDeleteFiles))
    task.push(deleteRecord(needDeleteRecord))
  }
  // 删除文件和记录
  await Promise.all(task)
  // 移除空文件夹
  await Promise.all(
    makeOnly(
      needDeleteFiles
        .map(filename => {
          log.info('移除', chalk.gray(filename))
          return path.dirname(filename)
        })
        .sort((a, b) => {
          const s1 = a.split(path.sep)
          const s2 = b.split(path.sep)
          if (s1 === s2) return 0
          if (s1 > s2) return 1
          return -1
        })
    ).map(deleteEmptyDir)
  )
  return needDeleteFiles.length
}

export default rm
