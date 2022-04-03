import chalk from 'chalk'
import path from 'path'
import { log } from '../../utils.js'
import { cacheRecord, cachePath } from '../../paths.js'
import { getInodes, getList } from '../../core/get.js'

type ConfigType = {
  exts: string[]
  excludeExts: string[]
  openCache: boolean
  source: string
  dest: string
}

function judge(config: ConfigType) {
  log.info('开始分析源目录..')
  const { exts, excludeExts, openCache, source, dest } = config
  const { fileAndInodeMap: sourceMap, files: sourceFiles, inodeAndFileMap } = getList(source)
  const dstInodes = getInodes(dest)
  const fullPaths = Object.keys(sourceMap)
  const existFiles: string[] = []
  const waitLinkFiles: string[] = []
  const excludeFiles: string[] = []
  const cacheFiles: string[] = []
  const cached = cacheRecord.read()
  const isWhiteList = !!exts.length
  fullPaths.forEach(fullPath => {
    const inode = sourceMap[fullPath]
    const extname = path
      .extname(fullPath)
      .replace('.', '')
      .toLowerCase()
    const isSupported = isWhiteList
      ? exts.indexOf(extname) > -1
      : excludeExts.indexOf(extname) === -1
    if (!isSupported) {
      delete inodeAndFileMap[sourceMap[fullPath]]
      excludeFiles.push(fullPath)
    } else if (openCache && cached.indexOf(fullPath) > -1) {
      delete inodeAndFileMap[sourceMap[fullPath]]
      cacheFiles.push(fullPath)
    } else if (dstInodes.indexOf(inode) > -1) {
      delete inodeAndFileMap[sourceMap[fullPath]]
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
  if (waitLinkFiles.length) {
    log.info('需要硬链的文件', chalk.cyan(waitLinkFiles.length), '个')
  } else {
    log.info('没有需要硬链的文件')
  }
  return {
    existFiles,
    waitLinkFiles,
    excludeFiles,
    cacheFiles,
    sourceMap,
    inodes: Object.keys(inodeAndFileMap)
  }
}

export default judge
