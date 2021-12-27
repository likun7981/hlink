import execa, { ExecaSyncError } from 'execa'
import { log } from './utils'
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
async function link(sourceFile: string, originalDestPath: string) {
  let successCount = 0
  let failCount = 0
  // 做硬链接
  try {
    await fs.ensureDir(originalDestPath)
    await execa('ln', [sourceFile, originalDestPath])
    successCount += 1
  } catch (e) {
    if (typeof e === 'object' && e instanceof Error) {
      const error = e as ExecaSyncError
      if (
        error.stderr &&
        error.stderr.indexOf('Invalid cross-device link') > -1
      ) {
        log.error(e.message)
        log.error('跨设备硬链:')
        log.error(` 1. 请检查是否跨盘`)
        log.error(
          ` 2. 请检查是否跨越共享文件夹! 目前只支持群晖ext4才能同盘跨共享文件夹硬链`
        )
      } else {
        log.error('未知错误，请截图贴出命令及错误信息询问!')
        log.error(e)
        failCount += 1
      }
      process.exit(0) // 提前中断
    }
  }
  return {
    successCount,
    failCount
  }
}

export default link
