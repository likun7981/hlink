import { getOriginalDestPath, startLog, endLog } from './utils'
import saveRecord from './config/saveRecord'
import parse from './utils/parse'
import getSourceList from './utils/getSourceList'
import getDestNumbers from './utils/getDestNumbers'
import judge from './utils/judge'
import deleteLinks from './delete'
import link from './link'

async function hardLink(input: string[], options: any): Promise<void> {
  let isSecondDir = false
  const config = await parse(input, options)
  const {
    source,
    saveMode,
    dest,
    isDelete,
    maxFindLevel,
    exts,
    excludeExts,
    sourceDir,
    isDeleteDir,
    openCache,
    mkdirIfSingle
  } = config
  const isWhiteList = !!exts.length
  startLog(
    {
      extname: (isWhiteList ? exts : excludeExts).join(','),
      maxLevel: maxFindLevel,
      saveMode,
      source,
      dest
    },
    isWhiteList,
    isDelete
  )
  const {
    numbersKey: sourceListUseNumberKey,
    sourceFiles: allSourceFiles
  } = getSourceList(source)
  const { result: destNumbers } = getDestNumbers(dest)
  const { existFiles, waitLinkFiles, excludeFiles } = judge(
    destNumbers,
    sourceListUseNumberKey,
    {
      exts,
      excludeExts,
      isDelete
    }
  )
  let successCount = 0
  let jumpCount = existFiles.length
  let excludeCount = excludeFiles.length
  let cacheCount = 0
  let failCount = 0

  const files = isDelete ? allSourceFiles : waitLinkFiles
  files.forEach(async sourceFilePath => {
    const originalDestPath = getOriginalDestPath(
      sourceFilePath,
      source,
      dest,
      saveMode,
      mkdirIfSingle
    )
    if (isDelete) {
      // 删除硬链接
      const counts = deleteLinks(
        sourceFilePath,
        originalDestPath,
        dest,
        isDeleteDir
      )
      jumpCount += counts.jumpCount
      failCount += counts.failCount
      successCount += counts.successCount
    } else {
      excludeCount = excludeFiles.length
      const counts = link(
        sourceFilePath,
        originalDestPath,
        source,
        dest,
        openCache
      )
      cacheCount += counts.jumpCountForCache
      failCount += counts.failCount
      successCount += counts.successCount
    }
  })
  saveRecord(sourceDir, dest, isDelete && !isSecondDir)
  endLog(successCount, failCount, jumpCount, cacheCount, excludeCount, isDelete)
}

export default hardLink
