import chalk from 'chalk'
import fs from 'fs-extra'
import { deleteConfig } from './config/paths'
import { log } from './utils'
import createTimeLog from './utils/timeLog'
import getSourceList from './utils/getSourceList'
import execa from 'execa'
import path from 'path'
import deleteEmptyDir from './utils/deleteEmptyDir'
import saveRecord from './config/saveRecord'

const timeLog = createTimeLog()
async function rm(rmFileOrDir: string) {
  try {
    timeLog.start()
    const fileOrDir = path.resolve(rmFileOrDir);
    await fs.stat(fileOrDir)
    log.info('开始删除', chalk.cyan(fileOrDir))
    const linkedSources = deleteConfig.read()
    const dest = Object.keys(linkedSources).reduce((d, source) => {
      if (source.indexOf(fileOrDir) > -1 || fileOrDir.indexOf(source) > -1) {
        d = Array.from(new Set([...d, ...linkedSources[source]]))
      }
      return d
    }, [] as string[])
    const { numbers } = getSourceList(fileOrDir)
    const destKeys = dest.map(d => getSourceList(d).numbersKey)
    let rmFiles: string[] = []
    numbers.forEach(number => {
      destKeys.forEach(destKey => {
        if (destKey[number]) {
          rmFiles.push(destKey[number])
        }
      })
    })
    // const task = [execa('rm', ['-r', fileOrDir]]
    const task = []
    if (rmFiles.length) {
      task.push(execa('rm', ['-r'].concat(rmFiles)));
      task.push(...dest.map(deleteEmptyDir))
      task.push(...dest.map(async (d) => saveRecord(fileOrDir, d, true)))
    }
    await Promise.all([task])
    if (rmFiles.length) {
      log.info('找到相关硬链目录: ')
      dest.forEach(d => {
        log.info('', chalk.gray(d))
      })
      console.log()
      log.info('共计删除相关硬链', rmFiles.length, '个')
    } else {
      log.warn('没有找到相关的硬链目录')
    }
    timeLog.end()
  } catch (e) {
    console.log(e)
    log.error('无法访问路径', chalk.cyan(rmFileOrDir))
  }
}

export default rm
