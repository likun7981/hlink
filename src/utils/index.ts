import chalk from 'chalk'
import path from 'path'
import singleLog from 'single-line-log'

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
  },
  infoSingle: function(...args: any[]) {
    singleLog.stdout(
      [chalk.cyan(`[${logHead} INFO]:`), ...args, '\n'].join(' ')
    )
  },
  successSingle: function(...args: any[]) {
    singleLog.stdout(
      [chalk.green(`[${logHead} SUCCESS]:`), ...args, '\n'].join(' ')
    )
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

type LogOptions = {
  extname: string
  // maxLevel: number
  saveMode: number
  source: string
  dest: string
  openCache: boolean
}

const saveModeMessage = ['保持原有目录结构', '只保存一级目录结构']

export const startLog = (options: LogOptions, isWhiteList: boolean) => {
  const messageMap: Record<keyof LogOptions, string> = {
    source: '  源地址:',
    dest: '  目标地址:',
    extname: isWhiteList ? '  包含的后缀有:' : '  排除的后缀有:',
    // maxLevel: '  最大查找层级为:',
    saveMode: '  硬链保存模式:',
    openCache: '  是否开启缓存:'
  }
  log.info('配置检查完毕...')
  log.info('当前为', chalk.magenta(`${isWhiteList ? '白' : '黑'}名单`), '模式')
  log.info('当前配置为:')
  Object.keys(messageMap).forEach(k => {
    const keyName = k as keyof LogOptions
    let message = options[keyName] || '无'
    if (keyName === 'saveMode') {
      message = saveModeMessage[message as number]
    }
    if (keyName === 'openCache') {
      message = message ? '是' : '否'
    }
    if (message) {
      log.info(messageMap[keyName], chalk.magenta(message))
    }
  })
  console.log()
  log.info('开始执行创建任务...')
}

export const endLog = (
  successCount: number,
  failCount: number,
  jumpCount: number
) => {
  const totalCount = successCount + failCount + jumpCount
  if (totalCount) {
    log.info('硬链创建完毕...', '执行总数', chalk.magenta(totalCount), '条')
    log.info('  成功', chalk.green(successCount), '条')
    log.info('  失败', chalk.red(failCount), '条')
    log.info('  跳过', chalk.yellow(jumpCount), '条')
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
