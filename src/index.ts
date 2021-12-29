import {
  getOriginalDestPath,
  startLog,
  endLog,
  log,
  getDirBasePath
} from './utils'
import parse from './utils/parse'
import analyse from './utils/analyse'
import createTimeLog from './utils/timeLog'
import deleteLinks from './delete'
import link from './link'
import saveCache from './config/saveCache'
import chalk from 'chalk'
import path from 'path'
import { saveFileRecord } from './config/fileRecord'
import saveRecord from './config/saveRecord'

const timeLog = createTimeLog()
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
    startLog(
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
    timeLog.start()
    const { waitLinkFiles, sourceListUseNumberKey } = analyse({
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
    endLog(successCount, failCount, jumpCount)
    Object.keys(sourceListUseNumberKey).map(inode => {
      const sourceFile = sourceListUseNumberKey[inode]
      const destFile = path.join(
        getOriginalDestPath(sourceFile, source, dest, saveMode, mkdirIfSingle),
        path.basename(sourceFile)
      )
      saveFileRecord([sourceFile, destFile], inode)
    })
    timeLog.end()
  } else {
    deleteLinks(source, dest)
  }
  saveRecord(sourceDir, dest, isDelete)
}

export default hardLink
