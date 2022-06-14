import defaultInclude from '../utils/defaultInclude.js'
import getGlobs from '../utils/getGlobs.js'
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

function main(options: IOptions) {
  const {
    include,
    exclude,
    openCache,
    mkdirIfSingle,
    keepDirStruct,
    pathsMapping,
  } = options
  const sourcePaths = Object.keys(pathsMapping)
  const includeGlobs = getGlobs(include, defaultInclude)
  const excludeGlobs = getGlobs(exclude)
  sourcePaths.forEach(async (source) => {
    return await hlink({
      openCache,
      mkdirIfSingle,
      keepDirStruct,
      source,
      dest: pathsMapping[source],
      include: includeGlobs,
      exclude: excludeGlobs,
    })
  })
}

main.createConfig = createConfig
