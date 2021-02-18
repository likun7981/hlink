import chalk from 'chalk'
import execa from 'execa'
import path from 'path'
import { SaveMode } from '../types'

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

export const warning = (warning: boolean, message: string) => {
  if (warning) {
    log.warn(message)
    console.log()
    process.exit(0)
  }
}

export const getExts = (extraExts: Array<string>) =>
  [
    'mp4',
    'flv',
    'f4v',
    'webm',
    'm4v',
    'mov',
    'cpk',
    'dirac',
    '3gp',
    '3g2',
    'rm',
    'rmvb',
    'wmv',
    'avi',
    'asf',
    'mpg',
    'mpeg',
    'mpe',
    'vob',
    'mkv',
    'ram',
    'qt',
    'fli',
    'flc',
    'mod',
    'iso'
  ].concat(extraExts)

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
  findOut = execa.sync('find', [destPath, '-inum', fileNumber]).stdout
  return findOut
    ? findOut.split('\n').map(p => (deleteDir ? path.dirname(p) : p))
    : []
}

export function checkLinkExist(file: string, destPath: string) {
  const paths = getLinkPath(file, destPath)
  return paths.length >= 1
}

export const startLog = (
  options: Record<string, string>,
  isDelete: boolean
) => {
  const messageMap: Record<string, string> = {
    e: '  包含的额外后缀有：',
    m: '  源地址最大查找层级为：',
    s: '  硬链保存模式：'
  }
  if (!isDelete) {
    log.info('开始创建硬链...')
    log.info('当前配置为:')
    Object.keys(messageMap).forEach(k => {
      if (options[k]) {
        log.info(`${messageMap[k]}${chalk.cyanBright(options[k])}`)
      }
    })
  } else {
    log.info('开始删除硬链...')
  }
}

export function getRealDestPath(
  fileFullPath: string,
  source: string,
  dest: string,
  saveMode: SaveMode
) {
  const currentDir = path.dirname(fileFullPath)
  const currentName = path.basename(fileFullPath)
  const relativePath =
    path.relative(source, path.resolve(currentDir)) ||
    currentName.replace(path.extname(currentName), '')
  return path.resolve(
    dest,
    relativePath
      .split(path.sep)
      .slice(-saveMode)
      .join(path.sep)
  )
}
