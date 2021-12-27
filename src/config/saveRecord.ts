import { deleteConfig } from './paths'

function saveRecord(source: string, dest: string, isDelete: boolean) {
  const savedPath: Record<string, any> = deleteConfig.read()
  const savedDestPath: Array<string> = savedPath[source]
  if (savedDestPath) {
    if (savedDestPath.indexOf(dest) !== -1) {
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
  deleteConfig.write(savedPath)
}

export default saveRecord
