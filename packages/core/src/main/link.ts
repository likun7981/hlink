import { ExecaSyncError, execa } from 'execa'
import path from 'path'
import { getDirBasePath, log } from '../../utils.js'
import fs from 'fs-extra'
import chalk from 'chalk'

const errorSuggestion: Record<string, () => boolean | string> = {
  'Invalid cross-device link': () => {
    console.log()
    log.warn('跨设备硬链,以下两种情况属于跨设备硬链:')
    log.warn(` 1. 请检查是否跨盘！`)
    log.warn(
      ` 2. 请检查是否跨越共享文件夹! 目前只支持群晖ext4才能同盘跨共享文件夹硬链`
    )
    return false
  },
  'Operation not permitted': () => {
    console.log()
    log.warn('hlink没有权限')
    log.warn(` 试试使用sudo执行: ${chalk.cyan('sudo hlink xxxx')}`)
    return false
  },
  'File exists': () => {
    return '目标地址文件已经存在'
  },
}
const knownError = Object.keys(errorSuggestion) as Array<
  keyof typeof errorSuggestion
>

/**
 *
 * @param sourceFile 源文件的绝对路径
 * @param originalDestPath 硬链文件实际存放的目录(绝对路径)
 * @returns 计数
 */

export type FailType = {
  reason: string
  filepath: string
}

async function link(
  sourceFile: string,
  originalDestPath: string,
  source: string,
  dest: string
) {
  let failure: FailType | undefined | true
  // 做硬链接
  try {
    await fs.ensureDir(originalDestPath)
    await execa('ln', [sourceFile, originalDestPath])
  } catch (e) {
    if (typeof e === 'object' && e instanceof Error) {
      const error = e as ExecaSyncError
      if (error.signal === 'SIGINT') {
        global.printOnExit()
        process.exit(0) // 提前中断
      }
      const findError = knownError.find(
        (err: string) => (error.stderr || error.message).indexOf(err) > -1
      )
      let ignore: boolean | string = false
      failure = true
      if (findError) {
        ignore = errorSuggestion[findError]()
        if (typeof ignore === 'string') {
          failure = {
            reason: ignore,
            filepath: `${chalk.gray(
              getDirBasePath(source, sourceFile)
            )} ${chalk.cyan('>')} ${getDirBasePath(
              dest,
              path.join(originalDestPath, path.basename(sourceFile))
            )}`,
          }
        }
      } else {
        log.error('未知错误，请截图贴出命令及错误信息询问!')
        log.error(error)
      }
      if (!ignore) {
        process.exit(0) // 提前中断
      }
    }
  }
  return failure
}

export default link
