import chalk from 'chalk'
import { cacheRecord } from '../utils/cacheHelp.js'
import { cachePath } from '../utils/paths.js'
import parseLsirfl, { getInodes } from '../core/parseLsirfl.js'
import { log } from '../utils/index.js'
import { IOptions } from './hlink.js'
import supported from '../utils/supported.js'

function analyse(config: Omit<IOptions, 'keepDirStruct'>) {
  log.info('开始分析源目录..')
  const { include, exclude, openCache, source, dest } = config
  const parseResults = parseLsirfl(source)
  const dstInodes = getInodes(dest)
  const existFiles: string[] = []
  const waitLinkFiles: string[] = []
  const excludeFiles: string[] = []
  const cacheFiles: string[] = []
  const cached = cacheRecord.read()
  parseResults.forEach((parseResult) => {
    const { fullPath } = parseResult
    if (!supported(fullPath, include, exclude)) {
      excludeFiles.push(fullPath)
    } else if (dstInodes.indexOf(parseResult.inode) > -1) {
      existFiles.push(fullPath)
    } else if (openCache && cached.includes(fullPath)) {
      cacheFiles.push(fullPath)
    } else {
      waitLinkFiles.push(fullPath)
    }
  })
  log.success('分析完毕!')
  log.info('共计', chalk.magenta(parseResults.length), '个文件')
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
  }
}

export default analyse
