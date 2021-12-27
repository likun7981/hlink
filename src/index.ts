import {
  getOriginalDestPath,
  startLog,
  endLog,
  log,
  getDirBasePath
} from './utils'
import fs from 'fs-extra'
import saveRecord from './config/saveRecord'
import parse from './utils/parse'
import analyse from './utils/analyse'
import deleteLinks from './delete'
import link from './link'
import saveCache from './config/saveCache'
import chalk from 'chalk'

async function hardLink(input: string[], options: any): Promise<void> {
  const config = await parse(input, options)
  const {
    source,
    saveMode,
    dest,
    isDelete,
    // maxFindLevel,
    exts,
    excludeExts,
    sourceDir,
    openCache,
    mkdirIfSingle
  } = config
  if (!isDelete) {
    const isWhiteList = !!exts.length
    const startTime = startLog(
      {
        extname: (isWhiteList ? exts : excludeExts).join(','),
        // maxLevel: maxFindLevel,
        saveMode,
        source,
        dest,
        openCache
      },
      isWhiteList
    )
    const { waitLinkFiles } = analyse({
      source,
      dest,
      exts,
      excludeExts,
      isDelete,
      openCache
    })
    let successCount = 0
    let jumpCount = 0
    let failCount = 0
    if (waitLinkFiles.length) {
      const count = 21
      let c = 0
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
            const counts = await link(sourceFilePath, originalDestPath)
            failCount += counts.failCount
            successCount += counts.successCount
            log.infoSingle(
              `${successCount} / ${waitLinkFiles.length}`,
              '\n',
              chalk.gray(getDirBasePath(source, sourceFilePath))
            )
          })
        )
        c += 1
      }
      log.successSingle(
        `${successCount} / ${waitLinkFiles.length}`,
        chalk.green('执行完毕')
      )
      saveCache(waitLinkFiles)
    }
    endLog(successCount, failCount, jumpCount, startTime)
  } else {
    deleteLinks(source, dest)
  }
  saveRecord(sourceDir, dest, isDelete)
}

export default hardLink
