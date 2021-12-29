import chalk from 'chalk'
import path from 'path'
import { log } from '.'
import { cacheConfig, cachePath } from '../config/paths'
import getDestNumbers from './getDestNumbers'
import getSourceList from './getSourceList'

type ConfigType = {
  exts: string[]
  excludeExts: string[]
  isDelete: boolean
  openCache: boolean
  source: string
  dest: string
}

function judge(config: ConfigType) {
  log.info('开始分析源目录..')
  const { exts, excludeExts, isDelete, openCache, source, dest } = config
  const { numbersKey: sourceListUseNumberKey, sourceFiles } = getSourceList(
    source
  )
  const { result: destNumbers } = getDestNumbers(dest)
  const keysOfSourceNumbers = Object.keys(sourceListUseNumberKey)
  const existFiles: string[] = []
  const waitLinkFiles: string[] = []
  const excludeFiles: string[] = []
  const cacheFiles: string[] = []
  const cached = cacheConfig.read()
  const isWhiteList = !!exts.length
  keysOfSourceNumbers.forEach(num => {
    const fullPath = sourceListUseNumberKey[num]
    const extname = path
      .extname(fullPath)
      .replace('.', '')
      .toLowerCase()
    const isSupported = isWhiteList
      ? exts.indexOf(extname) > -1
      : excludeExts.indexOf(extname) === -1
    if (!isSupported) {
      excludeFiles.push(fullPath)
    } else if (openCache && cached.indexOf(fullPath) > -1) {
      cacheFiles.push(fullPath)
    } else if (destNumbers.indexOf(num) > -1) {
      existFiles.push(fullPath)
    } else {
      waitLinkFiles.push(fullPath)
    }
  })
  log.success('分析完毕!')
  log.info('共计', chalk.magenta(sourceFiles.length), '个文件')
  log.info('不满足配置的文件', chalk.yellow(excludeFiles.length), '个')
  log.info('已存在硬链的文件', chalk.yellow(existFiles.length), '个')
  openCache &&
    log.info(
      '缓存的创建记录',
      chalk.yellow(cacheFiles.length),
      `条${
        cacheFiles.length > 0
          ? ', 如果需要重新创建，请在删除或编辑文件 ' + chalk.cyan(cachePath)
          : ''
      }`
    )
  log.info('需要硬链的文件', chalk.cyan(waitLinkFiles.length), '个')
  return {
    existFiles,
    waitLinkFiles,
    excludeFiles,
    cacheFiles,
    sourceListUseNumberKey
  }
}

export default judge
