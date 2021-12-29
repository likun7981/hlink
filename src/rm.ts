import chalk from 'chalk'
import fs from 'fs-extra'
import { fileRecordConfig } from './config/paths'
import { log } from './utils'
import createTimeLog from './utils/timeLog'
import getSourceList from './utils/getSourceList'
import execa from 'execa'
import path from 'path'
import deleteEmptyDir from './utils/deleteEmptyDir'
import saveRecord from './config/saveRecord'
import checkPathExist from './utils/checkPathExist'
import { deleteRecord } from './config/fileRecord'

const timeLog = createTimeLog()
async function rm(rmFileOrDir: string) {
  checkPathExist(rmFileOrDir)
  timeLog.start()
  const fileOrDir = path.resolve(rmFileOrDir)
  await fs.stat(fileOrDir)
  log.info('开始删除', chalk.cyan(fileOrDir))
  const fileRecords = fileRecordConfig.read()
  const needDeleteRecord: string[] = []
  const { numbers } = getSourceList(fileOrDir)
  const needDeleteFiles = fileRecords.reduce((result, { files, inode }, i) => {
    if (numbers.indexOf(inode) > -1) {
      result = result.concat(files)
      needDeleteRecord.push(inode)
    }
    return result
  }, [] as string[])
  const task: any[] = [execa('rm', ['-r', fileOrDir])]
  if (needDeleteFiles.length) {
    task.push(execa('rm', ['-r'].concat(needDeleteFiles)))
    task.push(...needDeleteFiles.map((filename) => {
      deleteEmptyDir(path.dirname(filename))
    }))
    task.push(deleteRecord(needDeleteRecord))
  }
  await Promise.all(task)
  if (needDeleteFiles.length) {
    log.info('共计删除相关硬链', needDeleteFiles.length, '个')
    needDeleteFiles.forEach((file) => {
      log.info('', file)
    })
  } else {
    log.warn('没有找到相关的硬链目录')
  }
  timeLog.end()
}

export default rm
