import { cacheConfig } from './paths'

function saveCache(source: string, dest: string, isDelete: boolean = false) {
  const savedPath: Record<string, any> = cacheConfig.read()
  const savedDestPath: Array<string> = savedPath[source]
  if (savedDestPath) {
    if (savedDestPath.indexOf(dest) !== -1) {
      // 删除
      if (isDelete) {
        savedPath[source] = savedDestPath.filter(s => s !== dest)
      }
      // 如果没有了就删除这条记录
      if (!savedPath[source].length) {
        delete savedPath[source]
      }
    } else {
      // 增加
      savedPath[source] = savedDestPath.concat(dest)
    }
  } else {
    // 新创建
    savedPath[source] = [dest]
  }
  cacheConfig.write(savedPath)
}

export const checkCache = (source: string, dest: string): boolean => {
  const savedPath: Record<string, any> = cacheConfig.read()
  const savedDestPath: Array<string> = savedPath[source]
  return !!(savedDestPath?.indexOf(dest) > -1)
}

export default saveCache
