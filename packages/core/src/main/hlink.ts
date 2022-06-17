import chalk from 'chalk'
import HLinkError from '../core/HlinkError.js'
import execAsyncByGroup from '../utils/execAsyncByGroup.js'
import {
  findParentRelative,
  getDirBasePath,
  getOriginalDestPath,
  log,
} from '../utils/index.js'
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
  const [relativeSource, relativeDest] = findParentRelative([source, dest])
  const taskName = chalk.gray(
    [relativeSource, chalk.cyan('>'), relativeDest].join(' ')
  )
  log.info('开始执行任务:', taskName)
  log.info('开始分析目录')
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
    const bar = getProgressBar(waitLinkFiles.length)
    await execAsyncByGroup({
      groupSize: Math.min(66, Math.ceil(waitLinkFiles.length / 10)),
      waitExecArray: waitLinkFiles,
      callback: async (sourceFilePath) => {
        const originalDestPath = getOriginalDestPath(
          sourceFilePath,
          source,
          dest,
          keepDirStruct,
          mkdirIfSingle
        )
        try {
          await link(sourceFilePath, originalDestPath, source, dest)
          successCount += 1
        } catch (e) {
          failCount += 1
          const error = e as HLinkError
          if (error.isHlinkError) {
            if (error.reason && error.ignore) {
              if (failReasons[error.reason]) {
                failReasons[error.reason].push(error.filepath)
              } else {
                failReasons[error.reason] = [error.filepath]
              }
            } else {
              throw error
            }
          } else {
            log.error('未知错误, 请完整截图咨询!')
            log.error(error)
            throw error
          }
        }
        bar.tick(1, {
          file: chalk.gray(getDirBasePath(source, sourceFilePath)),
        })
      },
    })
  }
  log.info(taskName, '任务执行完毕!')
  console.log()
  return {
    waitLinkFiles,
    failCount,
    successCount,
    failReasons,
  }
}

export default hlink
