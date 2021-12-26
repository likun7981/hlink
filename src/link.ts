import chalk from 'chalk'
import execa, { ExecaSyncError } from 'execa'
import path from 'path'
import saveCache, { checkCache } from './config/saveCache'
import { getDirBasePath, log } from './utils'
import fs from 'fs-extra'

/**
 *
 * @param originalDestPath 硬链文件实际存放的目录(绝对路径)
 * @param sourceFile 源文件的绝对路径
 * @param dest  目的地址的绝对路径
 * @param source 源地址的绝对路径
 * @param openCache 是否打开缓存
 * @returns 计数
 */
function link(
  sourceFile: string,
  originalDestPath: string,
  source: string,
  dest: string,
  openCache: boolean
) {
  let successCount = 0
  let jumpCountForCache = 0
  let failCount = 0
  const destFilePath = path.join(originalDestPath, path.basename(sourceFile))
  // 做硬链接
  const sourceNameForMessage = chalk.yellow(getDirBasePath(source, sourceFile))
  const destNameForMessage = chalk.cyan(getDirBasePath(dest, destFilePath))
  try {
    if (!checkCache(sourceFile, destFilePath) || !openCache) {
      fs.ensureDirSync(originalDestPath)
      execa.sync('ln', [sourceFile, originalDestPath])
      log.success(
        '源地址',
        sourceNameForMessage,
        '硬链成功, 硬链地址为',
        destNameForMessage
      )
      saveCache(sourceFile, destFilePath)
      successCount += 1
    } else {
      log.warn('当前文件', chalk.yellow(name), '之前已创建过, 跳过创建')
      jumpCountForCache += 1
    }
  } catch (e) {
    if (typeof e === 'object' && e instanceof Error) {
      const error = e as ExecaSyncError
      if (error.stderr && error.stderr.indexOf('Invalid cross-device link')) {
        log.error(e.message)
        log.error('跨设备硬链:')
        log.error(` 1. 请检查是否跨盘`)
        log.error(` 2. 请检查是否跨越共享文件夹! 目前只支持群晖ext4才能同盘跨共享文件夹硬链`)
        process.exit(0) // 提前中断
      } else {
        log.error('未知错误，请截图贴出命令及错误信息询问!')
        log.error(e)
        failCount += 1
      }
    }
  }
  return {
    successCount,
    jumpCountForCache,
    failCount
  }
}

export default link
