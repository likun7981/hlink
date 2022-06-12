import path from 'path'
import fs from 'fs-extra'

const endsWithes = ['*', '@']
/**
 * @description 解析出inode及绝对路径
 * @param file inode+filepath
 * @param dir file的父级目录，必须是绝对路径
 * @returns [inode, absolutePath]
 */
function parseFilePath(file: string, dir = '') {
  file = file.trim() // 清除收尾空格
  const index = file.indexOf(' ')
  const inode = file.slice(0, index)
  let filepath = file.slice(index + 1)
  if (dir) {
    filepath = path.join(dir, filepath)
    endsWithes.forEach((endWith) => {
      if (filepath.endsWith(endWith) && !fs.existsSync(filepath)) {
        filepath = filepath.slice(0, filepath.lastIndexOf(endWith))
      }
    })
  }
  return [inode, filepath]
}

export default parseFilePath
