import path from 'node:path'
import parseLsirfl, { getInodes } from '../core/parseLsirfl.js'
import { cacheRecord, isCached } from '../utils/cacheHelp.js'
import compileFileFilter from '../utils/fileFilter.js'
import { makeOnly, asyncMap } from '../utils/index.js'
import supported from '../utils/supported.js'
import { IOptions as PruneOptions } from './index'

type TOptions = {
  sourceArr: string[]
  destArr: string[]
  include: string[]
  exclude: string[]
} & Pick<PruneOptions, 'deleteDir' | 'reverse' | 'fileFilter'>

const getRmFiles = async (options: TOptions) => {
  let { sourceArr, destArr, include, exclude, deleteDir, reverse, fileFilter } =
    options
  const matches = compileFileFilter(fileFilter)
  include = include.length ? include : ['**']
  if (reverse) {
    const tmp = sourceArr
    sourceArr = destArr
    destArr = tmp
  }
  const inodes = makeOnly(
    (await asyncMap(sourceArr, getInodes)).reduce<string[]>(
      (result, inodes) => result.concat(inodes),
      []
    )
  )
  const cached = (reverse && cacheRecord.read()) || []
  let filesNeedDelete = makeOnly(
    (await asyncMap(destArr, (d) => parseLsirfl(d, true))).reduce<string[]>(
      (result, parseItem, index) =>
        result.concat(
          parseItem
            .filter((item) => {
              return !inodes.includes(item.inode)
            })
            .filter((item) => {
              let isSupported =
                supported(item.fullPath, include, exclude) &&
                matches(item.fullPath, destArr[index])
              if (reverse && isSupported) {
                isSupported = !isCached(cached, item.fullPath)
              }
              return isSupported
            })
            .map((item) => {
              return deleteDir
                ? path.join(path.dirname(item.fullPath), '/')
                : item.fullPath
            })
        ),
      []
    )
  )
  if (deleteDir) {
    // 如果是删除目录，则直接过滤掉二级目录
    filesNeedDelete = filesNeedDelete.filter((p1) =>
      filesNeedDelete.every((p2) => !(p1.indexOf(p2) === 0 && p1 !== p2))
    )
  }
  return filesNeedDelete
}

export default getRmFiles
