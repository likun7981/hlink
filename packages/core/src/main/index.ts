import chalk from 'chalk'
import { saveCache } from '../utils/cacheHelp.js'
import defaultInclude from '../utils/defaultInclude.js'
import formatConfig from '../utils/formatConfig.js'
import getGlobs from '../utils/getGlobs.js'
import { createTimeLog, endLog, log } from '../utils/index.js'
import createConfig from './createConfig.js'
import hlink from './hlink.js'

export interface IOptions extends IHlink.Options {
  /**
   * @description 是否打开缓存
   */
  openCache?: boolean
  /**
   * @description 是否为独立文件创建文件夹
   */
  mkdirIfSingle?: boolean
  /**
   * @description 是否保留原有目录结构
   */
  keepDirStruct?: boolean
}

const time = createTimeLog()
async function main(options: IOptions) {
  const config = await formatConfig(options)
  const {
    include,
    exclude,
    openCache,
    mkdirIfSingle,
    keepDirStruct,
    pathsMapping,
  } = config
  const sourcePaths = Object.keys(pathsMapping)
  let includeGlobs = getGlobs(include, defaultInclude)
  const excludeGlobs = getGlobs(exclude)
  includeGlobs = includeGlobs.length ? includeGlobs : ['**']
  log.info(
    `共计 ${chalk.magenta(Object.keys(config.pathsMapping).length)} 个任务`
  )
  time.start()
  console.log()
  let files: string[] = []
  let success = 0
  let fail = 0
  let reasons = {}
  for (let i = 0, len = sourcePaths.length; i < len; i++) {
    const source = sourcePaths[i]
    const { waitLinkFiles, successCount, failCount, failReasons } = await hlink(
      {
        openCache,
        mkdirIfSingle,
        keepDirStruct,
        source,
        dest: pathsMapping[source],
        include: includeGlobs,
        exclude: excludeGlobs,
      }
    )
    files = files.concat(waitLinkFiles)
    success += successCount
    fail += failCount
    reasons = {
      ...reasons,
      ...failReasons,
    }
  }
  saveCache(files)
  endLog(success, fail, reasons)
  time.end()
}

main.createConfig = createConfig

export default main
