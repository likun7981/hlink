import path from 'node:path'
import fs from 'fs-extra'
import { cacheRecord, isCached } from '../utils/cacheHelp.js'
import compileFileFilter from '../utils/fileFilter.js'
import parseLsirfl, { getInodes } from '../core/parseLsirfl.js'
import {
  chalk,
  findParentRelative,
  getOriginalDestPath,
  log,
} from '../utils/index.js'
import { IOptions as IHlinkOptions } from './hlink.js'
import supported from '../utils/supported.js'

interface IOptions extends Omit<IHlinkOptions, 'pathsMapping'> {
  source: string
  dest: string
  readOnly?: boolean
}

export type WaitLinks = {
  destDir: string
  sourcePath: string
  originalDest: string
  originalSource: string
}

async function analyse(config: IOptions) {
  const {
    include,
    exclude,
    fileFilter,
    openCache,
    source,
    dest,
    readOnly = false,
    keepDirStruct = true,
    mkdirIfSingle = true,
  } = config
  const [relativeSource, relativeDest] = findParentRelative([source, dest])
  const taskName = [
    chalk.gray(relativeSource),
    chalk.cyan('>'),
    chalk.gray(relativeDest),
  ].join(' ')
  log.info('执行分析任务:', taskName)
  const matches = compileFileFilter(fileFilter)
  const parseResults = await parseLsirfl(source, false, !readOnly)
  const dstInodes =
    readOnly && !(await fs.pathExists(dest))
      ? []
      : await getInodes(dest, false, !readOnly)
  const existFiles: string[] = []
  const waitLinkFiles: WaitLinks[] = []
  const excludeFiles: string[] = []
  const cacheFiles: string[] = []
  const cached = openCache ? cacheRecord.read() : []

  parseResults.forEach((parseResult) => {
    const { fullPath } = parseResult
    const destDir = getOriginalDestPath(
      fullPath,
      source,
      dest,
      keepDirStruct,
      mkdirIfSingle
    )
    if (!supported(fullPath, include, exclude) || !matches(fullPath, source)) {
      excludeFiles.push(fullPath)
    } else if (dstInodes.indexOf(parseResult.inode) > -1) {
      existFiles.push(fullPath)
    } else if (
      openCache &&
      isCached(cached, fullPath, path.join(destDir, path.basename(fullPath)))
    ) {
      cacheFiles.push(fullPath)
    } else {
      waitLinkFiles.push({
        destDir,
        sourcePath: fullPath,
        originalDest: dest,
        originalSource: source,
      })
    }
  })
  log.success('分析任务执行完毕:', taskName)
  return {
    existFiles,
    waitLinkFiles,
    excludeFiles,
    cacheFiles,
    parseResults,
  }
}

export default analyse
