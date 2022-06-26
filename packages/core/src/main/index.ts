import { IHlink } from '../IHlink.js'
import formatConfig from '../config/format.js'
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
  await hlink(await formatConfig(options))
}

export default main
