import adaptChalk, { ChalkInstance, Chalk } from 'chalk'
import { execa } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import dateformat from 'dateformat'

export const alwaysChalk = new Chalk({ level: 3 })

export const chalk =
  process.env.USED_BY_APP === 'browser' ? alwaysChalk : adaptChalk

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCEED'

const color = (_chalk: ChalkInstance) => ({
  INFO: _chalk.black.bgBlue,
  WARN: _chalk.black.bgYellow,
  ERROR: _chalk.black.bgRed,
  SUCCEED: _chalk.black.bgGreen,
})

const createGetTag = (_chalk: ChalkInstance) => (type: LogLevel) => {
  return `${_chalk.gray(
    `[${dateformat(new Date(), 'yy/mm/dd HH:MM:ss')}]`
  )} ${color(_chalk)[type](_chalk.white(` ${type} `))}`
}

export const getTag = createGetTag(chalk)

const createLogWrapper = (_getTag: typeof getTag) => ({
  info: function (...args: string[]) {
    return `${_getTag('INFO')} ${args.join(' ')}`
  },
  warn: function (...args: string[]) {
    return `${_getTag('WARN')} ${args.join(' ')}`
  },
  error: function (...args: string[]) {
    return `${_getTag('ERROR')} ${args.join(' ')}`
  },
  success: function (...args: string[]) {
    return `${_getTag('SUCCEED')} ${args.join(' ')}`
  },
})

export const alwaysLogWrapper = createLogWrapper(createGetTag(alwaysChalk))

export const logWrapper = createLogWrapper(getTag)

export const log = {
  info: function (...args: any[]) {
    console.log(logWrapper.info(...args))
  },
  warn: function (...args: any[]) {
    console.log(logWrapper.warn(...args))
  },
  error: function (...args: any[]) {
    console.log(logWrapper.error(...args))
  },
  success: function (...args: any[]) {
    console.log(logWrapper.success(...args))
  },
}

export function warning(warning: boolean, ...message: Array<string>) {
  if (warning) {
    throw new Error(message.join(' '))
  }
}

export function makeOnly<T = any>(arr: T[]) {
  return Array.from(new Set(arr))
}

export async function checkPathExist(path: string, ignore = true) {
  try {
    await fs.stat(path)
    return true
  } catch (e) {
    if (!ignore) {
      log.error('无法访问路径', chalk.cyan(path), '请检查是否存在')
      console.log()
      process.exit(0)
    } else {
      return false
    }
  }
}

/**
 * dir /a/b
 * filepath /a/b/c/d
 * output: b/c/d
 *
 */
export function getDirBasePath(baseDir: string, filepath: string) {
  return path.join(path.basename(baseDir), path.relative(baseDir, filepath))
}

type LogOptions = {
  extname: string
  saveMode: number
  source: string
  dest: string
  openCache: boolean
  isWhiteList: boolean
  configPath?: string | boolean
}

const saveModeMessage = ['保持原有目录结构', '只保存一级目录结构']

export const startLog = (options: LogOptions) => {
  const { isWhiteList } = options

  const messageMap: Record<keyof LogOptions, string> = {
    source: '源地址:',
    dest: '目标地址:',
    isWhiteList: '当前运行模式:',
    configPath: '使用的配置文件:',
    extname: isWhiteList ? '包含的后缀有:' : '排除的后缀有:',
    saveMode: '硬链保存模式:',
    openCache: '是否开启缓存:',
  }
  log.success('配置检查完毕!现有配置为')
  Object.keys(messageMap).forEach((k) => {
    const keyName = k as keyof LogOptions
    let message = options[keyName]
    if (keyName === 'saveMode') {
      message = saveModeMessage[message as number]
    }
    if (keyName === 'openCache') {
      message = message ? '是' : '否'
    }
    if (keyName === 'isWhiteList') {
      message = message ? '白名单' : '黑名单' + '模式'
    }
    if (message) {
      log.info(messageMap[keyName], chalk.magenta(message))
    }
  })
  console.log()
}

export const endLog = (
  successCount: number,
  failCount: number,
  failFiles: Record<string, string[]>
) => {
  const totalCount = successCount + failCount
  if (totalCount) {
    log.success('执行完毕!', '总计', chalk.magenta(totalCount), '条')
    log.info('  成功', chalk.green(successCount), '条')
    log.info('  失败', chalk.red(failCount), '条')
  }
  const failReasons = Object.keys(failFiles)
  if (failReasons.length) {
    console.log()
    failReasons.forEach((key) => {
      log.warn('', chalk.yellow(key))
      failFiles[key].forEach((v) => log.warn('', '', v))
    })
    log.warn('以上文件存在问题')
    console.log()
  }
}

/**
 *
 * @param sourceFile 源文件的完整地址
 * @param source 源文件夹绝对路径
 * @param dest 目标文件夹绝对路径
 * @param keepDirStruct 是否保持原有目录结构
 * @param mkdirIfSingle 是否为独立文件创建同名文件夹
 * @returns 处理后的真正保存硬链的目录地址
 */
export function getOriginalDestPath(
  sourceFile: string,
  source: string,
  dest: string,
  keepDirStruct: boolean,
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
      .slice(Number(keepDirStruct) - 1)
      .join(path.sep)
  )
}

export function createTimeLog() {
  let startTime = Date.now()
  return {
    start() {
      startTime = Date.now()
    },
    end() {
      const minus = chalk.cyan(Math.ceil((Date.now() - startTime) / 1000))
      log.info('共计耗时', minus, '秒')
    },
  }
}

export async function rmFiles(files: string[]) {
  return execa('rm', ['-r', ...makeOnly(files)])
}

/**
 *
 * @param _paths 路径集合
 * @returns 返回_paths的公共父目录
 *
 * _paths = ['/a/c/d/e', '/a/b/c/d/e']
 *  result = '/a/'
 *
 */
export function findParent(_paths: string[]) {
  let paths = [..._paths]
  if (!paths.length) return ''
  paths = paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(p)))
  /**
   * 排序，把最短的路径排到最前面
   */
  paths = paths.sort(
    (a, b) => a.split(path.sep).length - b.split(path.sep).length
  )
  const firstItem = paths.shift() as string // 这里必有
  let dirname = path.join(path.dirname(firstItem), '/')
  // 如果paths里面每个都包含了最短路径，说明最短路径就算所有路径的目录了
  while (!paths.every((p) => p.includes(dirname))) {
    dirname = path.join(path.dirname(dirname), '/')
  }
  return dirname
}

/**
 *
 * @param _paths 路径集合
 * @returns 返回_paths的相对于公共父目录的路径
 *
 * _paths = ['/a/c/d/e', '/a/b/c/d/e']
 * result = ['c/d/e','b/c/d/e']
 *
 */
export function findParentRelative(_paths: string[]) {
  const parent = findParent(_paths)
  return _paths.map((_path) => path.relative(parent, _path))
}

export async function asyncMap<N, T>(
  arr: T[],
  callback: (p: T) => Promise<N>
): Promise<N[]> {
  return Promise.all(arr.map(callback))
}
