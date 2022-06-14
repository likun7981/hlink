import chalk from 'chalk'
import { saveCache } from '../utils/cacheHelp.js'
import { getDirBasePath, getOriginalDestPath } from '../utils/index.js'
import getProgressBar from '../utils/progress.js'
import analyse from './analyse.js'
import { IOptions as IHlinkOptions } from './index.js'
import link from './link.js'

export interface IOptions
  extends Omit<IHlinkOptions, 'pathsMapping' | 'include' | 'exclude'> {
  source: string
  dest: string
  include: string[]
  exclude: string[]
}

async function hlink(options: IOptions) {
  const {
    source,
    dest,
    openCache = false,
    mkdirIfSingle = true,
    keepDirStruct = true,
    include,
    exclude,
  } = options
  const { waitLinkFiles } = analyse({
    source,
    dest,
    include,
    exclude,
    openCache,
  })
  let successCount = 0
  let failCount = 0
  const failReasons: Record<string, string[]> = {}
  if (waitLinkFiles.length) {
    const count = 21
    let c = 0
    const bar = getProgressBar(waitLinkFiles.length)

    for (let i = 0, len = waitLinkFiles.length / count; i < len; i++) {
      const start = c * count
      const end = (c + 1) * count
      await Promise.all(
        waitLinkFiles.slice(start, end).map(async (sourceFilePath) => {
          const originalDestPath = getOriginalDestPath(
            sourceFilePath,
            source,
            dest,
            keepDirStruct,
            mkdirIfSingle
          )
          const failure = await link(
            sourceFilePath,
            originalDestPath,
            source,
            dest
          )
          if (failure) {
            failCount += 1
            if (typeof failure === 'object') {
              const { reason, filepath } = failure
              if (failReasons[reason]) {
                failReasons[reason].push(filepath)
              } else {
                failReasons[reason] = [filepath]
              }
            }
          } else {
            successCount += 1
          }
          bar.tick(1, {
            file: chalk.gray(getDirBasePath(source, sourceFilePath)),
          })
        })
      )
      c += 1
    }
    return {
      waitLinkFiles,
      failCount,
      successCount,
      failReasons,
    }
  }
}

export default hlink
