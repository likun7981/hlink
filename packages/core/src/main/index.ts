import defaultInclude from '../utils/defaultInclude.js'
import formatConfig from '../config/format.js'
import getGlobs from '../utils/getGlobs.js'
import createConfig from '../config/create.js'
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
  let includeGlobs = getGlobs(include, defaultInclude)
  const excludeGlobs = getGlobs(exclude)
  includeGlobs = includeGlobs.length ? includeGlobs : ['**']
  await hlink({
    openCache,
    mkdirIfSingle,
    keepDirStruct,
    include: includeGlobs,
    exclude: excludeGlobs,
    pathsMapping,
  })
}

main.createConfig = createConfig

export default main
