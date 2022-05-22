import {
  getOriginalDestPath,
  startLog,
  endLog,
  log,
  getDirBasePath,
  createTimeLog
} from '../../utils.js'
import parse from './parse.js'
import analyse from './analyse.js'
import link from './link.js'
import chalk from 'chalk'
import { saveCache } from '../../config/cacheHelp.js'
import { Flags } from './index.js'
import ProgressBar from '../../progress.js'

const green = '\u001b[42m \u001b[0m'
const red = '\u001b[47m \u001b[0m'

const timeLog = createTimeLog()
async function hardLink(input: string[], options: Flags): Promise<void> {
  log.info('开始检查配置...')
  const config = await parse(input, options)
  const {
    source,
    saveMode,
    dest,
    exts,
    excludeExts,
    openCache,
    mkdirIfSingle,
    configPath
  } = config
  const isWhiteList = !!exts.length
  startLog({
    extname: (isWhiteList ? exts : excludeExts).join(','),
    saveMode,
    source,
    dest,
    openCache,
    isWhiteList,
    configPath
  })
  timeLog.start()
  const { waitLinkFiles } = analyse({
    source,
    dest,
    exts,
    excludeExts,
    openCache
  })
  let successCount = 0
  let jumpCount = 0
  let failCount = 0
  let failReasons: Record<string, string[]> = {}
  let failFiles: string[] = []
  if (waitLinkFiles.length) {
    log.info('开始执行...')
    const count = 21
    let c = 0
    const bar = new ProgressBar(
      `\n ${chalk.green('● hlink')} :bar :percent :etas ${chalk.gray(
        ':current/:total'
      )} \n :file \n \n`,
      {
        complete: green,
        incomplete: red,
        total: waitLinkFiles.length,
        clear: true
      }
    )
    for (let i = 0, len = waitLinkFiles.length / count; i < len; i++) {
      const start = c * count
      const end = (c + 1) * count
      await Promise.all(
        waitLinkFiles.slice(start, end).map(async sourceFilePath => {
          const originalDestPath = getOriginalDestPath(
            sourceFilePath,
            source,
            dest,
            saveMode,
            mkdirIfSingle
          )
          const counts = await link(
            sourceFilePath,
            originalDestPath,
            source,
            dest
          )
          failCount += counts.failCount
          successCount += counts.successCount
          if (counts.failFiles) {
            const [reason, detailed] = counts.failFiles.reason
            if (failReasons[reason]) {
              failReasons[reason].push(detailed)
            } else {
              failReasons[reason] = [detailed]
            }
            failFiles.push(counts.failFiles.path)
          }
          bar.tick(counts.successCount + counts.failCount, {
            file: chalk.gray(getDirBasePath(source, sourceFilePath))
          })
        })
      )
      c += 1
    }
    saveCache(waitLinkFiles)
    endLog(successCount, failCount, jumpCount, failReasons)
  }
  timeLog.end()
}

export default hardLink
