import chalk from 'chalk'
import execa from 'execa'
import path from 'path'
import { cachePath } from '../config/paths'

const logHead = 'HLINK'
export const log = {
  info: function(...args: any[]) {
    console.log(chalk.cyan(`[${logHead} INFO]:`), ...args)
  },
  warn: function(...args: any[]) {
    console.log(chalk.yellow(`[${logHead} WARN]:`), ...args)
  },
  error: function(...args: any[]) {
    console.log(chalk.red(`[${logHead} ERROR]:`), ...args)
  },
  success: function(...args: any[]) {
    console.log(chalk.green(`[${logHead} SUCCESS]:`), ...args)
  }
}

export const warning = (warning: boolean, ...message: Array<any>) => {
  if (warning) {
    log.warn(...message)
    console.log()
    process.exit(0)
  }
}

/**
 * dir /a/b
 * filepath /a/b/c/d
 * output: /b/c/d
 *
 */
export function getDirBasePath(baseDir: string, filepath: string) {
  return path.join(path.basename(baseDir), path.relative(baseDir, filepath))
}

export function getLinkPath(
  file: string,
  destPath: string,
  deleteDir?: boolean
) {
  const out = execa.sync('ls', ['-i', file]).stdout
  const fileNumber = out.split(' ')[0]
  let findOut: boolean | string = false
  destPath = path.join(destPath, '/')
  findOut = execa.sync('find', [destPath, '-inum', fileNumber]).stdout
  return findOut
    ? findOut.split('\n').map(p => (deleteDir ? path.dirname(p) : p))
    : []
}

type LogOptions = {
  extname: string
  maxLevel: number
  saveMode: number
  source: string
  dest: string
}

const saveModeMessage = ['保持原有目录结构', '只保存一级目录结构']

export const startLog = (
  options: LogOptions,
  isWhiteList: boolean,
  isDelete: boolean
) => {
  if (!isDelete) {
    const messageMap: Record<keyof LogOptions, string> = {
      source: '  源地址:',
      dest: '  目标地址:',
      extname: isWhiteList ? '  包含的后缀有:' : '  排除的后缀有:',
      maxLevel: '  最大查找层级为:',
      saveMode: '  硬链保存模式:'
    }
    log.info('配置检查完毕...')
    log.info(
      '当前为',
      chalk.magenta(`${isWhiteList ? '白' : '黑'}名单`),
      '模式'
    )
    log.info('当前配置为:')
    Object.keys(messageMap).forEach(k => {
      const keyName = k as keyof LogOptions
      let message = options[keyName] || '无'
      if (keyName === 'saveMode') {
        message = saveModeMessage[message as number]
      }
      if (message) {
        log.info(messageMap[keyName], chalk.magenta(message))
      }
    })
    console.log()
    log.info('开始创建硬链...')
  } else {
    log.info('开始删除硬链...')
  }
}

export const endLog = (
  successCount: number,
  failCount: number,
  jumpCount: number,
  cacheCount: number,
  excludeCount: number,
  isDelete: boolean
) => {
  const totalCount =
    successCount + failCount + jumpCount + cacheCount + excludeCount
  log.info(
    isDelete ? '硬链删除完毕' : '硬链创建完毕...',
    '总数',
    chalk.magenta(totalCount),
    '条'
  )
  if (!totalCount) {
    log.warn('当前目录没有满足配置条件的文件')
  } else {
    log.info('  成功', chalk.green(successCount), '条')
    log.info('  失败', chalk.red(failCount), '条')
    log.info('  跳过', chalk.yellow(jumpCount), '条')
    log.info('  跳过不满足配置的文件', chalk.yellow(excludeCount), '条')
    log.info(
      '  跳过之前的创建记录',
      chalk.yellow(cacheCount),
      '条, 如果需要重新创建，请在删除或编辑文件',
      chalk.cyan(cachePath)
    )
  }
}

/**
 *
 * @param sourceFile 源文件的完整地址
 * @param source 源文件夹绝对路径
 * @param dest 目标文件夹绝对路径
 * @param saveMode 保存模式0  为保存源目录结构，1保存一级目录结构
 * @param mkdirIfSingle 是否为独立文件创建同名文件夹
 * @returns 处理后的真正保存硬链的目录地址
 */
export function getOriginalDestPath(
  sourceFile: string,
  source: string,
  dest: string,
  saveMode: number,
  mkdirIfSingle: boolean
) {
  const currentDir = path.dirname(sourceFile)
  const currentName = path.basename(sourceFile)
  let relativePath = path.relative(source, path.resolve(currentDir))
  if (mkdirIfSingle && !relativePath) {
    relativePath = currentName.replace(path.extname(currentName), '')
  }
  return path.resolve(
    dest,
    relativePath
      .split(path.sep)
      .slice(-saveMode)
      .join(path.sep)
  )
}
