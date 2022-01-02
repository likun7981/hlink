import chalk, { Chalk } from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import singleLog from 'single-line-log'
import { configPath } from './paths';

const { stat }  = fs;

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'

const color: Record<LogLevel, Chalk> = {
  INFO: chalk.black.bgBlue,
  WARN: chalk.black.bgHex('#faad14'),
  ERROR: chalk.black.bgRedBright,
  SUCCESS: chalk.black.bgGreen
}

const getTag = (type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS') =>
  color[type](` ${type} `)

export const log = {
  info: function(...args: any[]) {
    console.log(getTag('INFO'), ...args)
  },
  warn: function(...args: any[]) {
    console.log(getTag('WARN'), ...args)
  },
  error: function(...args: any[]) {
    console.log(getTag('ERROR'), ...args)
  },
  success: function(...args: any[]) {
    console.log(getTag('SUCCESS'), ...args)
  },
  infoSingle: function(...args: any[]) {
    singleLog.stdout([getTag('INFO'), ...args, '\n'].join(' '))
  },
  successSingle: function(...args: any[]) {
    singleLog.stdout([getTag('SUCCESS'), ...args, '\n'].join(' '))
  }
}

export function warning(warning: boolean, ...message: Array<any>) {
  if (warning) {
    log.warn(...message)
    console.log()
    process.exit(0)
  }
}

export function makeOnly(arr: any[]) {
  return Array.from(new Set(arr))
}

export async function checkPathExist(path: string, ignore = false) {
  try {
    await stat(path)
    return true;
  } catch (e) {
    if(!ignore) {
      console.log(e)
      log.error('无法访问路径', chalk.cyan(path))
      process.exit(0)
    } else {
      return false
    }
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
  saveMode: number
  source: string
  dest: string
  openCache: boolean
  isWhiteList: boolean
  configPath?: string | boolean;
}

const saveModeMessage = ['保持原有目录结构', '只保存一级目录结构']

export const startLog = (options: LogOptions) => {
  const { isWhiteList } = options

  const messageMap: Record<keyof LogOptions, string> = {
    source: '源地址:',
    dest: '目标地址:',
    isWhiteList: '当前运行模式:',
    extname: isWhiteList ? '包含的后缀有:' : '排除的后缀有:',
    saveMode: '硬链保存模式:',
    openCache: '是否开启缓存:',
    configPath: '使用的配置文件:'
  }
  log.success('配置检查完毕!现有配置为')
  Object.keys(messageMap).forEach(k => {
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
  jumpCount: number,
  failFiles: Record<string, string[]>
) => {
  const totalCount = successCount + failCount + jumpCount
  if (totalCount) {
    log.success('执行完毕!', '总计', chalk.magenta(totalCount), '条')
    log.info('  成功', chalk.green(successCount), '条')
    log.info('  失败', chalk.red(failCount), '条')
    // jumpCount && log.info('  跳过', chalk.yellow(jumpCount), '条')
  }
  const failReasons = Object.keys(failFiles)
  if(failReasons.length) {
    console.log()
    log.warn('以下文件存在问题:')
    failReasons.forEach((key) => {
      log.warn('',chalk.yellow(key+':'))
      failFiles[key].forEach((v) => log.warn('','', v))
    })
    console.log()
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

export function createTimeLog() {
  let startTime = Date.now()
  return {
    start() {
      startTime = Date.now()
    },
    end() {
      const minus = chalk.cyan(Math.ceil((Date.now() - startTime) / 1000))
      log.info('共计耗时', minus, '秒')
    }
  }
}
